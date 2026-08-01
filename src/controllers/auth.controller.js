const bcrypt = require("bcrypt");

const Admin = require("../models/admin.model");

const ApiResponse = require("../utils/ApiResponse");

const {
    generateOTP,
    hashOTP,
    compareOTP,
    sendOTPEmail
} = require("../services/otp.service");

const {
    generateToken
} = require("../services/token.service");

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

        const otp = generateOTP();

        const hashedOTP = await hashOTP(otp);

        const expiry = new Date(Date.now() + 5 * 60 * 1000);

        await Admin.updateOTP(
            admin.id,
            hashedOTP,
            expiry
        );

        await sendOTPEmail(
            admin.email,
            otp
        );

        return res.json(
            new ApiResponse(
                true,
                "OTP sent successfully."
            )
        );

    } catch (error) {

        console.log(error);

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

        const valid = await compareOTP(
            otp,
            admin.otp
        );

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