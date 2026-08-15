const express = require("express");
const router = express.Router();

const feedbackController = require("../controllers/feedback.controller");
const tenantAuthMiddleware = require("../middleware/tenant.auth.middleware");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const permissionMiddleware = require("../middleware/permission.middleware");

// ============ TENANT FEEDBACK ROUTES (Protected) ============
router.post("/submit", tenantAuthMiddleware, feedbackController.submitFeedback);
router.get("/my-feedback", tenantAuthMiddleware, feedbackController.getMyFeedback);
router.get("/status", tenantAuthMiddleware, feedbackController.checkFeedbackStatus);

// ============ ADMIN FEEDBACK ROUTES (Protected) ============
// Feedback admin routes are READ-ONLY per your permission model
// Only "view" permission is needed for feedbacks
const adminRouter = express.Router();
adminRouter.use(authMiddleware);
adminRouter.use(roleMiddleware("super_admin", "admin"));

// GET FEEDBACK STATS - Requires feedbacks.view permission
adminRouter.get(
    "/stats",
    permissionMiddleware("feedbacks", "view"),
    feedbackController.getAdminFeedbackStats
);

// GET ALL FEEDBACKS - Requires feedbacks.view permission
adminRouter.get(
    "/all",
    permissionMiddleware("feedbacks", "view"),
    feedbackController.getAllFeedbacksAdmin
);

// Mount admin routes under /admin
router.use("/admin", adminRouter);

// ============ PUBLIC FEEDBACK ROUTES (No Auth) ============
router.get("/public/pg-reviews", feedbackController.getPublicPGReviews);

module.exports = router;