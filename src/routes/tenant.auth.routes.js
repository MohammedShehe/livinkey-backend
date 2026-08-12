const express = require("express");
const router = express.Router();
const tenantAuthController = require("../controllers/tenant.auth.controller");

router.post("/login", tenantAuthController.login);
router.post("/change-password", tenantAuthController.changePassword);
router.post("/forgot-password", tenantAuthController.forgotPassword);
router.post("/verify-otp", tenantAuthController.verifyOTP);
router.post("/reset-password", tenantAuthController.resetPassword);

module.exports = router;