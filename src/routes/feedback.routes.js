const express = require("express");
const router = express.Router();

const feedbackController = require("../controllers/feedback.controller");
const tenantAuthMiddleware = require("../middleware/tenant.auth.middleware");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

// ============ PUBLIC ROUTES (No Auth) ============
// Everyone can see PG reviews
router.get("/public/pg-reviews", feedbackController.getPublicPGReviews);

// ============ TENANT ROUTES (Protected) ============
router.use(tenantAuthMiddleware);

// Submit feedback (one-time per tenant)
router.post("/submit", feedbackController.submitFeedback);

// Get tenant's own feedback
router.get("/my-feedback", feedbackController.getMyFeedback);

// Check if tenant has submitted feedback
router.get("/status", feedbackController.checkFeedbackStatus);

// ============ ADMIN ROUTES (Protected) ============
router.use(authMiddleware);
router.use(roleMiddleware("super_admin", "admin"));

// Admin stats
router.get("/admin/stats", feedbackController.getAdminFeedbackStats);

// Admin get all feedbacks with filters
router.get("/admin/all", feedbackController.getAllFeedbacksAdmin);

module.exports = router;