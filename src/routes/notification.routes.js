const express = require("express");
const activityAudit = require("../middleware/activity.audit.middleware");
const router = express.Router();

const notificationController = require("../controllers/notification.controller");
const authMiddleware = require("../middleware/auth.middleware");

// All routes require authentication
router.use(authMiddleware);
router.use(activityAudit);

// Mobile clients poll this often. Disable ETag/304 so they always receive a body
// (304 with empty body was causing "no notifications" after the first empty response).
router.use((req, res, next) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    // Prevent Express from generating an ETag for these responses
    const originalJson = res.json.bind(res);
    res.json = (body) => {
        res.removeHeader("ETag");
        return originalJson(body);
    };
    next();
});

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
