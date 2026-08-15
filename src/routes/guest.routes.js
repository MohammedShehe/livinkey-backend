const express = require("express");
const router = express.Router();

const guestAuthController = require("../controllers/guest.auth.controller");
const guestProfileController = require("../controllers/guest.profile.controller");
const guestNotificationController = require("../controllers/guest.notification.controller");
const guestAuthMiddleware = require("../middleware/guest.auth.middleware");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const permissionMiddleware = require("../middleware/permission.middleware");

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

// Guest notifications
router.get("/notifications/unread/count", guestNotificationController.getUnreadCount);
router.get("/notifications/unread", guestNotificationController.getUnreadNotifications);
router.get("/notifications", guestNotificationController.getNotifications);
router.put("/notifications/:id/read", guestNotificationController.markAsRead);
router.put("/notifications/read-all", guestNotificationController.markAllAsRead);
router.delete("/notifications/:id", guestNotificationController.deleteNotification);

// ============ ADMIN ROUTES FOR GUESTS ============
// Admin routes for guest management - Requires guests module permissions
const adminRouter = express.Router();
adminRouter.use(authMiddleware);
adminRouter.use(roleMiddleware("super_admin", "admin"));

// GET ALL GUESTS - Requires guests.view permission
adminRouter.get(
    "/admin/all",
    permissionMiddleware("guests", "view"),
    async (req, res) => {
        try {
            const tenantController = require("../controllers/tenant.controller");
            // Reuse the tenant controller's getAllTenants with role filter
            req.query.role = 'guest';
            await tenantController.getAllTenants(req, res);
        } catch (error) {
            console.error("Get all guests admin error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
);

// GET GUEST STATS - Requires guests.view permission
adminRouter.get(
    "/admin/stats",
    permissionMiddleware("guests", "view"),
    async (req, res) => {
        try {
            const tenantController = require("../controllers/tenant.controller");
            await tenantController.getGuestStats(req, res);
        } catch (error) {
            console.error("Get guest stats admin error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
);

// UPDATE GUEST - Requires guests.edit permission
adminRouter.put(
    "/admin/:id",
    permissionMiddleware("guests", "edit"),
    async (req, res) => {
        try {
            const tenantController = require("../controllers/tenant.controller");
            // Ensure role is set to guest
            req.body.role = 'guest';
            await tenantController.updateTenant(req, res);
        } catch (error) {
            console.error("Update guest admin error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
);

// DELETE GUEST - Requires guests.delete permission
adminRouter.delete(
    "/admin/:id",
    permissionMiddleware("guests", "delete"),
    async (req, res) => {
        try {
            const tenantController = require("../controllers/tenant.controller");
            await tenantController.deleteTenant(req, res);
        } catch (error) {
            console.error("Delete guest admin error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
);

// SEND MESSAGE TO GUEST - Requires guests.edit permission
adminRouter.post(
    "/admin/:id/send-message",
    permissionMiddleware("guests", "edit"),
    async (req, res) => {
        try {
            const tenantController = require("../controllers/tenant.controller");
            await tenantController.sendMessage(req, res);
        } catch (error) {
            console.error("Send message admin error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
);

// Mount admin routes under /admin
router.use("/admin", adminRouter);

module.exports = router;