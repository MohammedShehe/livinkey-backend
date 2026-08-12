const express = require("express");
const router = express.Router();

const feedbackController = require("../controllers/feedback.controller");
const tenantAuthMiddleware = require("../middleware/tenant.auth.middleware");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

// ============ TENANT ROUTES (Protected) ============
router.use(tenantAuthMiddleware);

// Submit feedback (one-time per tenant)
router.post("/submit", feedbackController.submitFeedback);

// Get tenant's own feedback
router.get("/my-feedback", feedbackController.getMyFeedback);

// Check if tenant has submitted feedback
router.get("/status", feedbackController.checkFeedbackStatus);

// ============ ADMIN ROUTES (Protected) ============
// These routes require admin authentication
const adminRouter = express.Router();
adminRouter.use(authMiddleware);
adminRouter.use(roleMiddleware("super_admin", "admin"));

// Get all feedbacks (with filters)
adminRouter.get("/admin/all", feedbackController.getAllFeedbacksAdmin);

// Get feedback statistics
adminRouter.get("/admin/stats", feedbackController.getFeedbackStatsAdmin);

// Get feedbacks for a specific PG
adminRouter.get("/admin/pg/:pgId", feedbackController.getPGFeedbacks);

// Mount admin routes
router.use(adminRouter);

module.exports = router;