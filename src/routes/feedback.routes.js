const express = require("express");
const router = express.Router();

const feedbackController = require("../controllers/feedback.controller");
const tenantAuthMiddleware = require("../middleware/tenant.auth.middleware");
const guestAuthMiddleware = require("../middleware/guest.auth.middleware");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const permissionMiddleware = require("../middleware/permission.middleware");

// ============ TENANT FEEDBACK ROUTES (Protected) ============
router.post("/submit", tenantAuthMiddleware, feedbackController.submitFeedback);
router.get("/my-feedback", tenantAuthMiddleware, feedbackController.getMyFeedback);
router.get("/status", tenantAuthMiddleware, feedbackController.checkFeedbackStatus);

// ============ GUEST FEEDBACK ROUTES (NEW - Mobile App) ============
router.post("/guest/submit", guestAuthMiddleware, feedbackController.submitGuestFeedback);
router.get("/guest/my-feedback", guestAuthMiddleware, feedbackController.getMyGuestFeedback);
router.get("/guest/status", guestAuthMiddleware, feedbackController.checkGuestFeedbackStatus);

// ============ PUBLIC FEEDBACK ROUTES (NEW - Website No Auth) ============
router.post("/public/submit", feedbackController.submitPublicFeedback);
router.get("/public/status", feedbackController.checkPublicFeedbackStatus);

// ============ ADMIN FEEDBACK ROUTES (Protected) ============
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

// ============================================================
// NEW: DELETE FEEDBACK - Requires feedbacks.delete permission
// ============================================================
adminRouter.delete(
    "/:id",
    permissionMiddleware("feedbacks", "delete"),
    feedbackController.deleteFeedbackAdmin
);

// Mount admin routes under /admin
router.use("/admin", adminRouter);

// ============ PUBLIC FEEDBACK ROUTES (No Auth) ============
router.get("/public/pg-reviews", feedbackController.getPublicPGReviews);

module.exports = router;