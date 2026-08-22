const bcrypt = require("bcrypt");
const crypto = require("crypto");
const db = require("../config/db");
const Admin = require("../models/admin.model");
const ApiResponse = require("../utils/ApiResponse");
const { generateAndSendOTP, compareOTP } = require("../services/otp.service");
const { generateToken } = require("../services/token.service");

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json(
                new ApiResponse(false, "Email and password are required.")
            );
        }

        const admin = await Admin.findByEmail(email);

        if (!admin) {
            return res.status(401).json(
                new ApiResponse(false, "Invalid email or password.")
            );
        }

        if (!admin.is_active) {
            return res.status(403).json(
                new ApiResponse(false, "Account is disabled.")
            );
        }

        const matched = await bcrypt.compare(password, admin.password);

        if (!matched) {
            return res.status(401).json(
                new ApiResponse(false, "Invalid email or password.")
            );
        }

        // Check if admin must change password
        if (admin.must_change_password === 1) {
            // Generate token with must_change_password flag
            const token = generateToken({
                id: admin.id,
                role: admin.role,
                email: admin.email,
                must_change_password: true
            });

            // FIX: Fetch full admin record (with permissions) instead of
            // returning the raw row from findByEmail, which has no
            // permissions attached at all.
            const fullAdmin = await Admin.getAdminById(admin.id);

            return res.json({
                success: true,
                message: "Please change your password before continuing.",
                must_change_password: true,
                token,
                user: fullAdmin
            });
        }

        const { otp, hashedOTP, expiry } = await generateAndSendOTP(admin, "Login");

        await Admin.updateOTP(admin.id, hashedOTP, expiry);

        return res.json(
            new ApiResponse(true, "OTP sent successfully.")
        );

    } catch (error) {
        if (error.status === 429) {
            return res.status(429).json(
                new ApiResponse(false, error.message)
            );
        }
        return res.status(500).json(
            new ApiResponse(false, "Internal server error.")
        );
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const admin = await Admin.findByEmail(email);

        if (!admin) {
            return res.status(404).json(
                new ApiResponse(false, "Admin not found.")
            );
        }

        if (!admin.otp) {
            return res.status(400).json(
                new ApiResponse(false, "OTP not found.")
            );
        }

        if (new Date() > new Date(admin.otp_expiry)) {
            return res.status(400).json(
                new ApiResponse(false, "OTP expired.")
            );
        }

        const valid = await compareOTP(otp, admin.otp);

        if (!valid) {
            return res.status(400).json(
                new ApiResponse(false, "Invalid OTP.")
            );
        }

        await Admin.clearOTP(admin.id);

        const token = generateToken(admin);

        // FIX: The `admin` object here comes from Admin.findByEmail(), a
        // plain `SELECT * FROM admins` with no join to admin_permissions.
        // That means every login was handing the frontend an empty
        // permissions object, regardless of what the super admin had
        // actually configured on the Admins Management page. Fetch the
        // full record (name/email/phone/permissions) the same way the
        // Admins page does, via getAdminById, so the session the client
        // stores actually reflects granted view/add/edit/delete access.
        const fullAdmin = await Admin.getAdminById(admin.id);

        return res.json({
            success: true,
            message: "Login successful.",
            token,
            user: fullAdmin
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required."
            });
        }

        const admin = await Admin.findByEmail(email);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found."
            });
        }

        const { otp, hashedOTP, expiry } = await generateAndSendOTP(admin, "Resend");

        await Admin.updateOTP(admin.id, hashedOTP, expiry);

        return res.json({
            success: true,
            message: "New OTP sent successfully."
        });

    } catch (error) {
        if (error.status === 429) {
            return res.status(429).json({
                success: false,
                message: error.message
            });
        }
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const admin = await Admin.findByEmail(email);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Email not found."
            });
        }

        const { otp, hashedOTP, expiry } = await generateAndSendOTP(admin, "Forgot Password");

        await Admin.updateOTP(admin.id, hashedOTP, expiry);

        return res.json({
            success: true,
            message: "OTP sent successfully."
        });

    } catch (error) {
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

exports.resendForgotPasswordOTP = exports.forgotPassword;

exports.verifyForgotPasswordOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const admin = await Admin.findByEmail(email);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found."
            });
        }

        if (!admin.otp) {
            return res.status(400).json({
                success: false,
                message: "OTP not found."
            });
        }

        if (new Date() > new Date(admin.otp_expiry)) {
            return res.status(400).json({
                success: false,
                message: "OTP expired."
            });
        }

        const valid = await compareOTP(otp.toString(), admin.otp);

        if (!valid) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP."
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const expiry = new Date(Date.now() + 10 * 60 * 1000);

        await Admin.saveResetToken(admin.id, resetToken, expiry);
        await Admin.clearOTP(admin.id);

        return res.json({
            success: true,
            message: "OTP verified.",
            resetToken
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { resetToken, password, confirmPassword } = req.body;

        if (!resetToken) {
            return res.status(400).json({
                success: false,
                message: "Reset token is required."
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long."
            });
        }

        const admin = await Admin.findByResetToken(resetToken);

        if (!admin) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token."
            });
        }

        if (new Date() > new Date(admin.reset_token_expiry)) {
            return res.status(400).json({
                success: false,
                message: "Reset token expired."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await Admin.updatePassword(admin.id, hashedPassword);

        return res.json({
            success: true,
            message: "Password changed successfully."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

// NEW: Change password for admin (when must_change_password is true)
exports.changePassword = async (req, res) => {
    try {
        const adminId = req.admin.id;
        const { current_password, new_password, confirm_password } = req.body;

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

        if (new_password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long."
            });
        }

        const admin = await Admin.findById(adminId);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found."
            });
        }

        // Get full admin with password
        const fullAdmin = await Admin.findByEmail(admin.email);

        const matched = await bcrypt.compare(current_password, fullAdmin.password);

        if (!matched) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect."
            });
        }

        const hashedPassword = await bcrypt.hash(new_password, 12);

        // Update password and clear must_change_password flag
        await Admin.updatePasswordAndClearFlag(adminId, hashedPassword);

        return res.json({
            success: true,
            message: "Password changed successfully. Please login again."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};