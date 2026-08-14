const tenantNotificationService = require("../services/tenant.notification.service");

/**
 * Get unread notifications for the logged-in tenant
 */
const getUnreadNotifications = async (req, res) => {
    try {
        const tenantId = req.tenant.id;
        const { limit = 20 } = req.query;

        const result = await tenantNotificationService.getUnreadTenantNotifications(
            tenantId,
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
 * Get all notifications for the logged-in tenant (paginated)
 */
const getNotifications = async (req, res) => {
    try {
        const tenantId = req.tenant.id;
        const { limit = 50, offset = 0 } = req.query;

        const result = await tenantNotificationService.getTenantNotifications(
            tenantId,
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
 * Get unread count for the logged-in tenant
 */
const getUnreadCount = async (req, res) => {
    try {
        const tenantId = req.tenant.id;
        const count = await tenantNotificationService.getUnreadTenantCount(tenantId);

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
        const tenantId = req.tenant.id;
        const { id } = req.params;

        const updated = await tenantNotificationService.markTenantNotificationAsRead(id, tenantId);

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        // Get updated unread count
        const unreadCount = await tenantNotificationService.getUnreadTenantCount(tenantId);

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
        const tenantId = req.tenant.id;
        const count = await tenantNotificationService.markAllTenantNotificationsAsRead(tenantId);

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
        const tenantId = req.tenant.id;
        const { id } = req.params;

        const deleted = await tenantNotificationService.deleteTenantNotification(id, tenantId);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        // Get updated unread count
        const unreadCount = await tenantNotificationService.getUnreadTenantCount(tenantId);

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