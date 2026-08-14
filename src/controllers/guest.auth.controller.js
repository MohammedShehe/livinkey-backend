const bcrypt = require("bcrypt");
const crypto = require("crypto");
const db = require("../config/db");
const { generateToken } = require("../services/token.service");
const { generateAndSendGuestOTP, compareOTP } = require("../services/otp.service");
const { sendWelcomeGuestEmail } = require("../services/mail.service");

// Guest Registration
exports.register = async (req, res) => {
    try {
        const {
            full_name,
            email,
            nationality,
            country_code,
            phone,
            password,
            confirm_password
        } = req.body;

        // Validate required fields
        if (!full_name || !email || !nationality || !country_code || !phone || !password || !confirm_password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required: full_name, email, nationality, country_code, phone, password, confirm_password"
            });
        }

        // Check if passwords match
        if (password !== confirm_password) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }

        // Validate password length
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long"
            });
        }

        const connection = await db.getConnection();

        // Check if email already exists
        const [existingEmail] = await connection.execute(
            `SELECT id FROM tenants WHERE email = ?`,
            [email]
        );

        if (existingEmail.length > 0) {
            connection.release();
            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });
        }

        // Check if phone already exists
        const [existingPhone] = await connection.execute(
            `SELECT id FROM tenants WHERE country_code = ? AND phone = ?`,
            [country_code, phone]
        );

        if (existingPhone.length > 0) {
            connection.release();
            return res.status(400).json({
                success: false,
                message: "Phone number already registered"
            });
        }

        // Determine residency based on nationality
        const residency = nationality.toLowerCase() === 'indian' ? 'national' : 'international';

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Insert guest
        const [result] = await connection.execute(
            `
            INSERT INTO tenants (
                role,
                full_name,
                email,
                nationality,
                country_code,
                phone,
                gender,
                password,
                residency,
                created_by,
                is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                'guest',
                full_name,
                email,
                nationality,
                country_code,
                phone,
                'other', // Default gender for guests
                hashedPassword,
                residency,
                1, // created_by as system (admin id 1)
                1 // is_active
            ]
        );

        connection.release();

        // Send welcome email to guest
        try {
            await sendWelcomeGuestEmail(
                email,
                full_name,
                nationality,
                country_code,
                phone
            );
        } catch (emailError) {
            console.error("Failed to send welcome email to guest:", emailError);
            // Don't fail registration if email fails
        }

        return res.status(201).json({
            success: true,
            message: "Guest registered successfully. Please login to continue."
        });

    } catch (error) {
        console.error("Guest Registration Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Guest Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const connection = await db.getConnection();
        const [guests] = await connection.execute(
            `
            SELECT 
                id,
                full_name,
                email,
                password,
                is_active,
                role
            FROM tenants 
            WHERE email = ? AND role = 'guest'
            `,
            [email]
        );
        connection.release();

        if (guests.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const guest = guests[0];

        if (!guest.is_active) {
            return res.status(403).json({
                success: false,
                message: "Account is disabled."
            });
        }

        const matched = await bcrypt.compare(password, guest.password);

        if (!matched) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Generate token
        const token = generateToken({
            id: guest.id,
            email: guest.email,
            role: 'guest'
        });

        // Remove sensitive data
        delete guest.password;

        return res.json({
            success: true,
            message: "Login successful.",
            token,
            user: guest
        });

    } catch (error) {
        console.error("Guest Login Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

// Forgot Password - Request OTP
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required."
            });
        }

        const connection = await db.getConnection();
        const [guests] = await connection.execute(
            `SELECT id, full_name, email FROM tenants WHERE email = ? AND role = 'guest' AND is_active = 1`,
            [email]
        );
        connection.release();

        if (guests.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Email not found."
            });
        }

        const guest = guests[0];

        // Generate and send OTP
        const { otp, hashedOTP, expiry } = await generateAndSendGuestOTP(guest, "Forgot Password");

        const conn = await db.getConnection();
        await conn.execute(
            `UPDATE tenants SET otp = ?, otp_expiry = ?, otp_sent_at = NOW() WHERE id = ?`,
            [hashedOTP, expiry, guest.id]
        );
        conn.release();

        return res.json({
            success: true,
            message: "OTP sent successfully to your registered email."
        });

    } catch (error) {
        console.error("Forgot Password Error:", error);

        if (error.status === 429) {
            return res.status(429).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required."
            });
        }

        const connection = await db.getConnection();
        const [guests] = await connection.execute(
            `SELECT id, otp, otp_expiry FROM tenants WHERE email = ? AND role = 'guest' AND is_active = 1`,
            [email]
        );
        connection.release();

        if (guests.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Guest not found."
            });
        }

        const guest = guests[0];

        if (!guest.otp) {
            return res.status(400).json({
                success: false,
                message: "OTP not found. Please request a new one."
            });
        }

        if (new Date() > new Date(guest.otp_expiry)) {
            return res.status(400).json({
                success: false,
                message: "OTP expired. Please request a new one."
            });
        }

        const valid = await compareOTP(otp.toString(), guest.otp);

        if (!valid) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP."
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const conn = await db.getConnection();
        await conn.execute(
            `UPDATE tenants SET reset_token = ?, reset_token_expiry = ?, otp = NULL, otp_expiry = NULL WHERE id = ?`,
            [resetToken, expiry, guest.id]
        );
        conn.release();

        return res.json({
            success: true,
            message: "OTP verified successfully.",
            resetToken
        });

    } catch (error) {
        console.error("Verify OTP Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    try {
        const { resetToken, new_password, confirm_password } = req.body;

        if (!resetToken || !new_password || !confirm_password) {
            return res.status(400).json({
                success: false,
                message: "Reset token, new password, and confirm password are required."
            });
        }

        if (new_password !== confirm_password) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match."
            });
        }

        if (new_password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long."
            });
        }

        const connection = await db.getConnection();
        const [guests] = await connection.execute(
            `SELECT id FROM tenants WHERE reset_token = ? AND reset_token_expiry > NOW() AND role = 'guest' AND is_active = 1`,
            [resetToken]
        );

        if (guests.length === 0) {
            connection.release();
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token."
            });
        }

        const guest = guests[0];

        const hashedPassword = await bcrypt.hash(new_password, 12);

        await connection.execute(
            `UPDATE tenants SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?`,
            [hashedPassword, guest.id]
        );

        connection.release();

        return res.json({
            success: true,
            message: "Password reset successfully."
        });

    } catch (error) {
        console.error("Reset Password Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};