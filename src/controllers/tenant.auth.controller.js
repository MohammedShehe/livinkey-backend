const bcrypt = require("bcrypt");
const crypto = require("crypto");
const db = require("../config/db");
const { generateToken } = require("../services/token.service");
const { generateAndSendTenantOTP, compareOTP } = require("../services/otp.service");
const { sendPasswordResetEmail } = require("../services/mail.service");

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
        const [tenants] = await connection.execute(
            `SELECT 
                t.id, 
                t.full_name, 
                t.email, 
                t.password, 
                t.is_active,
                t.must_change_password,
                td.pg_id,
                td.room_id,
                td.rent,
                td.payment_date,
                td.arrival_date,
                td.residency,
                td.aadhaar_id,
                td.c_form_number,
                td.efrro_from,
                td.efrro_till,
                td.security_fee,
                p.name as pg_name,
                r.room_number,
                t.nationality,
                t.country_code,
                t.phone,
                t.gender,
                t.created_at
            FROM tenants t
            LEFT JOIN tenant_details td ON t.id = td.tenant_id
            LEFT JOIN pgs p ON td.pg_id = p.id
            LEFT JOIN rooms r ON td.room_id = r.id
            WHERE t.email = ? AND t.role = 'tenant'`,
            [email]
        );
        connection.release();

        if (tenants.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const tenant = tenants[0];

        if (!tenant.is_active) {
            return res.status(403).json({
                success: false,
                message: "Account is disabled."
            });
        }

        const matched = await bcrypt.compare(password, tenant.password);

        if (!matched) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Check if tenant must change password
        if (tenant.must_change_password === 1) {
            const token = generateToken({
                id: tenant.id,
                email: tenant.email,
                role: 'tenant'
            });

            return res.json({
                success: true,
                message: "Please change your password.",
                must_change_password: true,
                token,
                user: {
                    id: tenant.id,
                    full_name: tenant.full_name,
                    email: tenant.email
                }
            });
        }

        // Generate token
        const token = generateToken({
            id: tenant.id,
            email: tenant.email,
            role: 'tenant'
        });

        // Remove sensitive data
        delete tenant.password;
        delete tenant.must_change_password;

        return res.json({
            success: true,
            message: "Login successful.",
            token,
            user: tenant,
            must_change_password: false
        });

    } catch (error) {
        console.error("Tenant Login Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const tenantId = req.tenant?.id || req.body.tenant_id;
        const { current_password, new_password, confirm_password } = req.body;

        if (!tenantId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. Tenant ID required."
            });
        }

        if (!current_password || !new_password || !confirm_password) {
            return res.status(400).json({
                success: false,
                message: "Current password, new password, and confirm password are required."
            });
        }

        if (new_password !== confirm_password) {
            return res.status(400).json({
                success: false,
                message: "New password and confirm password do not match."
            });
        }

        if (new_password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long."
            });
        }

        const connection = await db.getConnection();

        // Get tenant with password
        const [tenants] = await connection.execute(
            `SELECT id, password FROM tenants WHERE id = ? AND role = 'tenant'`,
            [tenantId]
        );

        if (tenants.length === 0) {
            connection.release();
            return res.status(404).json({
                success: false,
                message: "Tenant not found."
            });
        }

        const tenant = tenants[0];

        // Verify current password
        const matched = await bcrypt.compare(current_password, tenant.password);

        if (!matched) {
            connection.release();
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect."
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(new_password, 12);

        // Update password and clear must_change_password flag
        await connection.execute(
            `UPDATE tenants SET password = ?, must_change_password = 0 WHERE id = ?`,
            [hashedPassword, tenantId]
        );

        connection.release();

        return res.json({
            success: true,
            message: "Password changed successfully."
        });

    } catch (error) {
        console.error("Change Password Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

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
        const [tenants] = await connection.execute(
            `SELECT id, full_name, email FROM tenants WHERE email = ? AND role = 'tenant' AND is_active = 1`,
            [email]
        );
        connection.release();

        if (tenants.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Email not found."
            });
        }

        const tenant = tenants[0];

        // Generate and send OTP
        const { otp, hashedOTP, expiry } = await generateAndSendTenantOTP(tenant, "Forgot Password");

        const conn = await db.getConnection();
        await conn.execute(
            `UPDATE tenants SET otp = ?, otp_expiry = ?, otp_sent_at = NOW() WHERE id = ?`,
            [hashedOTP, expiry, tenant.id]
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
        const [tenants] = await connection.execute(
            `SELECT id, otp, otp_expiry FROM tenants WHERE email = ? AND role = 'tenant' AND is_active = 1`,
            [email]
        );
        connection.release();

        if (tenants.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Tenant not found."
            });
        }

        const tenant = tenants[0];

        if (!tenant.otp) {
            return res.status(400).json({
                success: false,
                message: "OTP not found. Please request a new one."
            });
        }

        if (new Date() > new Date(tenant.otp_expiry)) {
            return res.status(400).json({
                success: false,
                message: "OTP expired. Please request a new one."
            });
        }

        const valid = await compareOTP(otp.toString(), tenant.otp);

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
            [resetToken, expiry, tenant.id]
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
        const [tenants] = await connection.execute(
            `SELECT id FROM tenants WHERE reset_token = ? AND reset_token_expiry > NOW() AND role = 'tenant' AND is_active = 1`,
            [resetToken]
        );

        if (tenants.length === 0) {
            connection.release();
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token."
            });
        }

        const tenant = tenants[0];

        const hashedPassword = await bcrypt.hash(new_password, 12);

        await connection.execute(
            `UPDATE tenants SET password = ?, reset_token = NULL, reset_token_expiry = NULL, must_change_password = 0 WHERE id = ?`,
            [hashedPassword, tenant.id]
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