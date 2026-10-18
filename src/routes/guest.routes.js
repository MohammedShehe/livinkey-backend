const express = require("express");
const userActivity = require("../middleware/user.activity.middleware");
const activityAudit = require("../middleware/activity.audit.middleware");
const router = express.Router();

const guestAuthController = require("../controllers/guest.auth.controller");
const guestProfileController = require("../controllers/guest.profile.controller");
const guestNotificationController = require("../controllers/guest.notification.controller");
const guestAuthMiddleware = require("../middleware/guest.auth.middleware");
const guestOrTenantAuthMiddleware = require("../middleware/guest.or.tenant.auth.middleware");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const permissionMiddleware = require("../middleware/permission.middleware");


// Guest device registration uses the shared tenant_devices table because guests
// are represented in the tenants table with role='guest'.
const firebase = require("../config/firebase");
router.post("/device/fcm-token", guestAuthMiddleware, userActivity, async (req,res) => {
    try {
        const { fcm_token, device_type } = req.body;
        if (!fcm_token) return res.status(400).json({success:false,message:"FCM token is required"});
        await firebase.saveFCMToken(req.guest.id, fcm_token, device_type || "android");
        res.json({success:true,message:"FCM token saved successfully"});
    } catch(e) { console.error("Guest FCM save error:",e); res.status(500).json({success:false,message:"Internal server error"}); }
});
router.delete("/device/fcm-token", guestAuthMiddleware, userActivity, async (req,res) => {
    try {
        if (req.body?.fcm_token) await firebase.removeFCMToken(req.guest.id, req.body.fcm_token);
        else await firebase.removeAllFCMTokens(req.guest.id);
        res.json({success:true,message:"FCM token removed successfully"});
    } catch(e) { console.error("Guest FCM remove error:",e); res.status(500).json({success:false,message:"Internal server error"}); }
});

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

// BROADCAST MESSAGE TO ALL GUESTS (in-app notification, optional link)
adminRouter.post(
    "/broadcast-message",
    permissionMiddleware("guests", "edit"),
    async (req, res) => {
        const db = require("../config/db");
        try {
            const title = String(req.body.title || "Message from Livinkey Admin").trim();
            const message = String(req.body.message || "").trim();
            const link = String(req.body.link || "").trim();
            if (!title || !message) {
                return res.status(400).json({ success: false, message: "Title and message are required" });
            }
            if (link && !(String(link).startsWith("https://") || String(link).startsWith("http://"))) {
                return res.status(400).json({ success: false, message: "Link must start with http:// or https://" });
            }
            const [result] = await db.execute(
                `INSERT INTO guest_notifications (guest_id, type, title, message, entity_id, entity_type, link, icon, color, is_read)
                 SELECT id, 'admin_message', ?, ?, NULL, 'admin_message', ?, '📢', '#3498db', 0
                 FROM tenants WHERE role = 'guest' AND is_active = 1`,
                [title, message, link || null]
            );
            return res.status(200).json({ success: true, message: "Message sent to all guests", data: { sent_count: result.affectedRows } });
        } catch (error) {
            console.error("Guest broadcast message error:", error);
            return res.status(500).json({ success: false, message: "Failed to send message to guests" });
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
