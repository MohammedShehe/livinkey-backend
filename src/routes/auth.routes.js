const express = require("express");

const router = express.Router();

const authController = require("../controllers/auth.controller");

router.post("/login", authController.login);

router.post("/verify-otp", authController.verifyOTP);

router.post("/resend-otp", authController.resendOTP);

module.exports = router;