const express = require("express");
const router = express.Router();

const notificationController = require("../controllers/notification.controller");
const authMiddleware = require("../middleware/auth.middleware");

// All routes require authentication
router.use(authMiddleware);

// Get unread count (for bell icon)
router.get("/unread/count", notificationController.getUnreadCount);

// Get unread notifications (for dropdown list)
router.get("/unread", notificationController.getUnreadNotifications);

// Get all notifications (paginated)
router.get("/", notificationController.getNotifications);

// Mark a notification as read
router.put("/:id/read", notificationController.markAsRead);

// Mark all notifications as read
router.put("/read-all", notificationController.markAllAsRead);

// Delete a notification
router.delete("/:id", notificationController.deleteNotification);

module.exports = router;