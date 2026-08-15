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

        const { otp, hashedOTP, expiry } = await generateAndSendOTP(admin, "Login");

        await Admin.updateOTP(admin.id, hashedOTP, expiry);

        return res.json(
            new ApiResponse(true, "OTP sent successfully.")
        );

    } catch (error) {
        console.log(error);
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

        delete admin.password;
        delete admin.otp;
        delete admin.otp_expiry;

        return res.json({
            success: true,
            message: "Login successful.",
            token,
            user: admin
        });

    } catch (error) {
        console.log(error);
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
        console.log(error);
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
        console.log(error);
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
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { resetToken, password, confirmPassword } = req.body;

        // Fix: Validate resetToken exists
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
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};