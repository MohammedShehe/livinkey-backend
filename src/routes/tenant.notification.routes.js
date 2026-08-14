const express = require("express");
const router = express.Router();

const tenantNotificationController = require("../controllers/tenant.notification.controller");
const tenantAuthMiddleware = require("../middleware/tenant.auth.middleware");

// All routes require tenant authentication
router.use(tenantAuthMiddleware);

// Get unread count (for bell icon)
router.get("/unread/count", tenantNotificationController.getUnreadCount);

// Get unread notifications (for dropdown list)
router.get("/unread", tenantNotificationController.getUnreadNotifications);

// Get all notifications (paginated)
router.get("/", tenantNotificationController.getNotifications);

// Mark a notification as read
router.put("/:id/read", tenantNotificationController.markAsRead);

// Mark all notifications as read
router.put("/read-all", tenantNotificationController.markAllAsRead);

// Delete a notification
router.delete("/:id", tenantNotificationController.deleteNotification);

module.exports = router;