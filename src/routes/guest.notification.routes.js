const express = require("express");
const router = express.Router();

const guestNotificationController = require("../controllers/guest.notification.controller");
const guestAuthMiddleware = require("../middleware/guest.auth.middleware");

// All routes require guest authentication
router.use(guestAuthMiddleware);

// Get unread count (for bell icon)
router.get("/unread/count", guestNotificationController.getUnreadCount);

// Get unread notifications (for dropdown list)
router.get("/unread", guestNotificationController.getUnreadNotifications);

// Get all notifications (paginated)
router.get("/", guestNotificationController.getNotifications);

// Mark a notification as read
router.put("/:id/read", guestNotificationController.markAsRead);

// Mark all notifications as read
router.put("/read-all", guestNotificationController.markAllAsRead);

// Delete a notification
router.delete("/:id", guestNotificationController.deleteNotification);

module.exports = router;