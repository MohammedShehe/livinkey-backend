const express = require("express");

const router = express.Router();

const authController = require("../controllers/auth.controller");

router.post("/login", authController.login);

router.post("/verify-otp", authController.verifyOTP);

router.post("/resend-otp", authController.resendOTP);

router.post("/forgot-password", authController.forgotPassword);

router.post("/resend-forgot-password-otp", authController.resendForgotPasswordOTP);

router.post("/verify-forgot-password-otp", authController.verifyForgotPasswordOTP);

router.post("/reset-password", authController.resetPassword);

module.exports = router;