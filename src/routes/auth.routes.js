const express = require("express");

const router = express.Router();

const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/login", authController.login);

router.post("/verify-otp", authController.verifyOTP);

router.post("/resend-otp", authController.resendOTP);

router.post("/forgot-password", authController.forgotPassword);

router.post("/resend-forgot-password-otp", authController.resendForgotPasswordOTP);

router.post("/verify-forgot-password-otp", authController.verifyForgotPasswordOTP);

router.post("/reset-password", authController.resetPassword);

// NEW: Change password route (for must_change_password flow)
router.post("/change-password", authMiddleware, authController.changePassword);

module.exports = router;