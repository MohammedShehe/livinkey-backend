const express = require("express");
const router = express.Router();

const guestAuthController = require("../controllers/guest.auth.controller");
const guestProfileController = require("../controllers/guest.profile.controller");
const guestNotificationController = require("../controllers/guest.notification.controller");
const guestAuthMiddleware = require("../middleware/guest.auth.middleware");
const guestOrTenantAuthMiddleware = require("../middleware/guest.or.tenant.auth.middleware");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const permissionMiddleware = require("../middleware/permission.middleware");

// ============ PUBLIC GUEST ROUTES ============
router.post("/register", guestAuthController.register);
router.post("/login", guestAuthController.login);
router.post("/forgot-password", guestAuthController.forgotPassword);
router.post("/verify-otp", guestAuthController.verifyOTP);
router.post("/reset-password", guestAuthController.resetPassword);

// ============================================================
// FIXED: Use guestOrTenantAuthMiddleware for routes that accept BOTH
// guest AND tenant tokens (for the "Enter as Guest" feature)
// ============================================================
router.get("/dashboard", guestOrTenantAuthMiddleware, guestProfileController.getGuestDashboard);
router.get("/profile", guestOrTenantAuthMiddleware, guestProfileController.getProfile);
router.put("/profile", guestOrTenantAuthMiddleware, guestProfileController.updateProfile);
router.post("/change-password", guestOrTenantAuthMiddleware, guestProfileController.changePassword);

// ============================================================
// ADMIN ROUTES - Mounted BEFORE guestAuthMiddleware
// ============================================================
const adminRouter = express.Router();
adminRouter.use(authMiddleware);
adminRouter.use(roleMiddleware("super_admin", "admin"));

// GET ALL GUESTS - ONLY guests (role='guest')
adminRouter.get(
    "/all",
    permissionMiddleware("guests", "view"),
    async (req, res) => {
        try {
            const tenantService = require("../services/tenant.service");
            const { search, gender, bill_status, pg_id } = req.query;

            const guests = await tenantService.getAllTenants(
                search,
                'guest',
                gender,
                bill_status,
                pg_id
            );

            return res.status(200).json({
                success: true,
                count: guests.length,
                data: guests
            });
        } catch (error) {
            console.error("Get all guests admin error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
);

// GET GUEST STATS
adminRouter.get(
    "/stats",
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

// UPDATE GUEST
adminRouter.put(
    "/:id",
    permissionMiddleware("guests", "edit"),
    async (req, res) => {
        try {
            const tenantController = require("../controllers/tenant.controller");
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

// DELETE GUEST
adminRouter.delete(
    "/:id",
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

// SEND MESSAGE TO GUEST
adminRouter.post(
    "/:id/send-message",
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

// ============================================================
// PROTECTED GUEST ROUTES - ONLY for real guests
// These routes require guestAuthMiddleware (rejects tenant tokens)
// ============================================================

// Guest notifications - only real guests can access these
router.use(guestAuthMiddleware);

router.get("/notifications/unread/count", guestNotificationController.getUnreadCount);
router.get("/notifications/unread", guestNotificationController.getUnreadNotifications);
router.get("/notifications", guestNotificationController.getNotifications);
router.put("/notifications/:id/read", guestNotificationController.markAsRead);
router.put("/notifications/read-all", guestNotificationController.markAllAsRead);
router.delete("/notifications/:id", guestNotificationController.deleteNotification);

module.exports = router;