const NotificationService = require("../services/notification.service");
const ApiResponse = require("../utils/ApiResponse");

/**
 * Get unread notifications for the logged-in admin
 */
const getUnreadNotifications = async (req, res) => {
    try {
        const adminId = req.admin.id;
        const { limit = 20 } = req.query;

        const result = await NotificationService.getUnreadNotifications(
            adminId,
            parseInt(limit)
        );

        return res.status(200).json({
            success: true,
            data: result.notifications,
            unreadCount: result.unreadCount
        });

    } catch (error) {
        console.error('Get Unread Notifications Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Get all notifications for the logged-in admin (paginated)
 */
const getNotifications = async (req, res) => {
    try {
        const adminId = req.admin.id;
        const { limit = 50, offset = 0 } = req.query;

        const result = await NotificationService.getAdminNotifications(
            adminId,
            parseInt(limit),
            parseInt(offset)
        );

        return res.status(200).json({
            success: true,
            data: result.notifications,
            unreadCount: result.unreadCount,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                total: result.total
            }
        });

    } catch (error) {
        console.error('Get Notifications Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Get unread count for the logged-in admin
 */
const getUnreadCount = async (req, res) => {
    try {
        const adminId = req.admin.id;
        const count = await NotificationService.getUnreadCount(adminId);

        return res.status(200).json({
            success: true,
            unreadCount: count
        });

    } catch (error) {
        console.error('Get Unread Count Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Mark a notification as read
 */
const markAsRead = async (req, res) => {
    try {
        const adminId = req.admin.id;
        const { id } = req.params;

        const updated = await NotificationService.markAsRead(id, adminId);

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        // Get updated unread count
        const unreadCount = await NotificationService.getUnreadCount(adminId);

        return res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            unreadCount
        });

    } catch (error) {
        console.error('Mark As Read Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (req, res) => {
    try {
        const adminId = req.admin.id;
        const count = await NotificationService.markAllAsRead(adminId);

        return res.status(200).json({
            success: true,
            message: `Marked ${count} notifications as read`,
            unreadCount: 0
        });

    } catch (error) {
        console.error('Mark All As Read Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Delete a notification
 */
const deleteNotification = async (req, res) => {
    try {
        const adminId = req.admin.id;
        const { id } = req.params;

        const deleted = await NotificationService.deleteNotification(id, adminId);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        // Get updated unread count
        const unreadCount = await NotificationService.getUnreadCount(adminId);

        return res.status(200).json({
            success: true,
            message: 'Notification deleted',
            unreadCount
        });

    } catch (error) {
        console.error('Delete Notification Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    getUnreadNotifications,
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
};