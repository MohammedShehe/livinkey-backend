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

// BROADCAST MESSAGE TO ALL GUESTS (in-app notification, optional link + history log)
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

            const [guests] = await db.execute(
                `SELECT id FROM tenants WHERE role = 'guest' AND is_active = 1`
            );
            const guestIds = guests.map(g => g.id);

            if (guestIds.length === 0) {
                return res.status(404).json({ success: false, message: "No active guests found" });
            }

            const [result] = await db.execute(
                `INSERT INTO guest_notifications (guest_id, type, title, message, entity_id, entity_type, link, icon, color, is_read)
                 SELECT id, 'admin_message', ?, ?, NULL, 'admin_message', ?, '📢', '#3498db', 0
                 FROM tenants WHERE role = 'guest' AND is_active = 1`,
                [title, message, link || null]
            );

            // Best-effort push to each guest
            try {
                const firebase = require("../config/firebase");
                if (firebase && typeof firebase.sendToUser === 'function') {
                    for (const gid of guestIds) {
                        try { await firebase.sendToUser(gid, { title, body: message }); } catch (_) {}
                    }
                }
            } catch (pushErr) {
                console.error("Guest broadcast push error:", pushErr.message);
            }

            // History log (recipient_type = guest)
            try {
                await db.execute(
                    `INSERT INTO admin_notification_logs
                     (admin_id, recipient_type, recipient_count, recipient_ids, title, message, send_push, send_email, sent_at)
                     VALUES (?, 'guest', ?, ?, ?, ?, 1, 0, NOW())`,
                    [req.admin.id, guestIds.length, JSON.stringify(guestIds), title, message]
                );
            } catch (logErr) {
                if (logErr && (logErr.code === 'ER_BAD_FIELD_ERROR' || String(logErr.message || '').includes('recipient_ids'))) {
                    await db.execute(
                        `INSERT INTO admin_notification_logs
                         (admin_id, recipient_type, recipient_count, title, message, send_push, send_email, sent_at)
                         VALUES (?, 'guest', ?, ?, ?, 1, 0, NOW())`,
                        [req.admin.id, guestIds.length, title, message]
                    );
                } else {
                    console.error("Guest broadcast log error:", logErr.message);
                }
            }

            return res.status(200).json({
                success: true,
                message: "Message sent to all guests",
                data: { sent_count: result.affectedRows || guestIds.length }
            });
        } catch (error) {
            console.error("Guest broadcast message error:", error);
            return res.status(500).json({ success: false, message: "Failed to send message to guests" });
        }
    }
);

// Guest notification history for admins (broadcast + individual).
// DB enum was ('individual','pg','all') — 'guest' must be added. Until migrated,
// we still return synthetic history from guest_notifications so the admin UI works.
adminRouter.get(
    "/notification-history",
    permissionMiddleware("guests", "view"),
    async (req, res) => {
        const db = require("../config/db");
        try {
            let limit = parseInt(req.query.limit) || 50;
            let offset = parseInt(req.query.offset) || 0;
            if (limit < 1) limit = 1;
            if (limit > 500) limit = 500;
            if (offset < 0) offset = 0;

            const [adminRows] = await db.execute(`SELECT id, name FROM admins ORDER BY id ASC LIMIT 1`);
            const fallbackAdminId = (req.admin && req.admin.id) || (adminRows[0] && adminRows[0].id) || 1;
            const fallbackAdminName = (req.admin && (req.admin.name || req.admin.email)) || (adminRows[0] && adminRows[0].name) || 'Admin';

            // Best-effort: extend enum so future inserts with recipient_type='guest' work
            try {
                await db.execute(
                    `ALTER TABLE admin_notification_logs
                     MODIFY COLUMN recipient_type ENUM('individual','pg','all','guest') NOT NULL`
                );
            } catch (_) { /* already migrated or no privilege */ }

            // Backfill real logs when enum allows 'guest'
            try {
                const [groups] = await db.execute(
                    `
                    SELECT
                        gn.title,
                        gn.message,
                        COUNT(*) AS recipient_count,
                        MIN(gn.created_at) AS sent_at,
                        GROUP_CONCAT(DISTINCT gn.guest_id ORDER BY gn.guest_id) AS guest_ids
                    FROM guest_notifications gn
                    WHERE gn.type = 'admin_message'
                       OR gn.entity_type = 'admin_message'
                       OR gn.title LIKE 'Message from%'
                    GROUP BY gn.title, gn.message, DATE_FORMAT(gn.created_at, '%Y-%m-%d %H:%i')
                    ORDER BY sent_at DESC
                    LIMIT 200
                    `
                );

                for (const g of groups) {
                    const title = g.title || '';
                    const message = g.message || '';
                    const sentAt = g.sent_at;
                    const ids = String(g.guest_ids || '')
                        .split(',')
                        .map(s => parseInt(s, 10))
                        .filter(n => Number.isFinite(n) && n > 0);

                    let existing = [];
                    try {
                        const [ex] = await db.execute(
                            `
                            SELECT id FROM admin_notification_logs
                            WHERE recipient_type = 'guest'
                              AND title = ? AND message = ?
                              AND sent_at BETWEEN DATE_SUB(?, INTERVAL 2 MINUTE) AND DATE_ADD(?, INTERVAL 2 MINUTE)
                            LIMIT 1
                            `,
                            [title, message, sentAt, sentAt]
                        );
                        existing = ex;
                    } catch (_) { existing = []; }
                    if (existing.length) continue;

                    try {
                        await db.execute(
                            `
                            INSERT INTO admin_notification_logs
                              (admin_id, recipient_type, recipient_count, recipient_ids, title, message, send_push, send_email, sent_at)
                            VALUES (?, 'guest', ?, ?, ?, ?, 1, 0, ?)
                            `,
                            [fallbackAdminId, Number(g.recipient_count) || ids.length, JSON.stringify(ids), title, message, sentAt]
                        );
                    } catch (insErr) {
                        const msg = String(insErr && insErr.message || '');
                        if (msg.includes('recipient_ids') || (insErr && insErr.code === 'ER_BAD_FIELD_ERROR')) {
                            try {
                                await db.execute(
                                    `
                                    INSERT INTO admin_notification_logs
                                      (admin_id, recipient_type, recipient_count, title, message, send_push, send_email, sent_at)
                                    VALUES (?, 'guest', ?, ?, ?, 1, 0, ?)
                                    `,
                                    [fallbackAdminId, Number(g.recipient_count) || ids.length, title, message, sentAt]
                                );
                            } catch (e2) {
                                if (!String(e2.message || '').includes('Data truncated')) {
                                    console.error('Guest history backfill insert failed:', e2.message);
                                }
                            }
                        } else if (!msg.includes('Data truncated')) {
                            console.error('Guest history backfill insert failed:', msg);
                        }
                    }
                }
            } catch (backfillErr) {
                console.error('Guest history backfill failed:', backfillErr.message);
            }

            let logs = [];
            try {
                const [rows] = await db.execute(
                    `SELECT nl.*, a.name as admin_name
                     FROM admin_notification_logs nl
                     LEFT JOIN admins a ON nl.admin_id = a.id
                     WHERE nl.recipient_type = 'guest'
                     ORDER BY nl.sent_at DESC
                     LIMIT ${limit} OFFSET ${offset}`
                );
                logs = rows;
            } catch (qErr) {
                console.error('Guest history log query failed:', qErr.message);
            }

            // Synthetic history if logs still empty (enum not migrated yet)
            if (!logs.length) {
                const [groups] = await db.execute(
                    `
                    SELECT
                        MIN(gn.id) AS id,
                        gn.title,
                        gn.message,
                        COUNT(*) AS recipient_count,
                        MIN(gn.created_at) AS sent_at,
                        GROUP_CONCAT(DISTINCT gn.guest_id ORDER BY gn.guest_id) AS guest_ids
                    FROM guest_notifications gn
                    WHERE gn.type = 'admin_message'
                       OR gn.entity_type = 'admin_message'
                       OR gn.title LIKE 'Message from%'
                    GROUP BY gn.title, gn.message, DATE_FORMAT(gn.created_at, '%Y-%m-%d %H:%i')
                    ORDER BY sent_at DESC
                    LIMIT ${limit} OFFSET ${offset}
                    `
                );
                logs = groups.map(g => {
                    const ids = String(g.guest_ids || '')
                        .split(',')
                        .map(s => parseInt(s, 10))
                        .filter(n => Number.isFinite(n) && n > 0);
                    return {
                        id: g.id,
                        admin_id: fallbackAdminId,
                        admin_name: fallbackAdminName,
                        recipient_type: 'guest',
                        recipient_count: Number(g.recipient_count) || ids.length,
                        recipient_ids: JSON.stringify(ids),
                        title: g.title,
                        message: g.message,
                        send_push: 1,
                        send_email: 0,
                        sent_at: g.sent_at,
                        _synthetic: true
                    };
                });
            }

            return res.status(200).json({ success: true, count: logs.length, data: logs });
        } catch (error) {
            console.error("Guest notification history error:", error);
            return res.status(500).json({ success: false, message: "Failed to load guest notification history" });
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
