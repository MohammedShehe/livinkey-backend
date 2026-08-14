const express = require("express");
const router = express.Router();

const guestAuthController = require("../controllers/guest.auth.controller");
const guestProfileController = require("../controllers/guest.profile.controller");
const guestAuthMiddleware = require("../middleware/guest.auth.middleware");

// ============ PUBLIC GUEST ROUTES ============
router.post("/register", guestAuthController.register);
router.post("/login", guestAuthController.login);
router.post("/forgot-password", guestAuthController.forgotPassword);
router.post("/verify-otp", guestAuthController.verifyOTP);
router.post("/reset-password", guestAuthController.resetPassword);

// ============ PROTECTED GUEST ROUTES ============
router.use(guestAuthMiddleware);

// Dashboard with greeting
router.get("/dashboard", guestProfileController.getGuestDashboard);

// Profile routes
router.get("/profile", guestProfileController.getProfile);
router.put("/profile", guestProfileController.updateProfile);
router.put("/change-password", guestProfileController.changePassword);

module.exports = router;