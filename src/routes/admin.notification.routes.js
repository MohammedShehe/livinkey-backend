const express = require("express");
const router = express.Router();

const adminNotificationController = require("../controllers/admin.notification.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const permissionMiddleware = require("../middleware/permission.middleware");

// All routes require admin authentication
router.use(authMiddleware);
router.use(roleMiddleware("super_admin", "admin"));

// Send notification to tenants
router.post(
    "/send",
    permissionMiddleware("tenants", "view"),
    adminNotificationController.sendTenantNotification
);

// Get notification history
router.get(
    "/history",
    permissionMiddleware("tenants", "view"),
    adminNotificationController.getNotificationHistory
);

// ============================================================
// NEW: Delete a notification log by ID
// ============================================================
router.delete(
    "/:id",
    permissionMiddleware("tenants", "view"),
    adminNotificationController.deleteNotificationLog
);

// ============================================================
// NEW: Delete multiple notification logs
// ============================================================
router.delete(
    "/",
    permissionMiddleware("tenants", "view"),
    adminNotificationController.deleteMultipleNotificationLogs
);

// Get PG list with tenant counts
router.get(
    "/pg-list",
    permissionMiddleware("tenants", "view"),
    adminNotificationController.getPGList
);

// Get tenants by PG
router.get(
    "/tenants-by-pg/:pgId",
    permissionMiddleware("tenants", "view"),
    adminNotificationController.getTenantsByPG
);

// Get all active tenants
router.get(
    "/all-tenants",
    permissionMiddleware("tenants", "view"),
    adminNotificationController.getAllTenants
);

module.exports = router;