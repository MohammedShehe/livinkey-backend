const NotificationService = require("../services/notification.service");
const guestNotificationService = require("../services/guest.notification.service");
const tenantNotificationService = require("../services/tenant.notification.service");

/**
 * Unified /api/notifications/* controller.
 *
 * Mobile/web clients often call the same path for all roles. The JWT role
 * decides which notification store to use:
 *   - admin / super_admin → admin_notifications
 *   - guest               → guest_notifications
 *   - tenant              → tenant_notifications
 *
 * Previously guest tokens hitting /api/notifications/unread queried the
 * admin table by guest id and always returned empty (often as HTTP 304).
 */

const getUser = (req) => {
    // authMiddleware attaches decoded JWT as req.admin for this router
    const u = req.admin || req.guest || req.tenant || {};
    const id = parseInt(u.id, 10);
    return {
        id: Number.isFinite(id) ? id : u.id,
        role: String(u.role || '').toLowerCase().trim()
    };
};

const isGuest = (role) => role === 'guest';
const isTenant = (role) => role === 'tenant';
const isAdmin = (role) => role === 'admin' || role === 'super_admin' || (!isGuest(role) && !isTenant(role));

/**
 * Get unread notifications
 */
const getUnreadNotifications = async (req, res) => {
    try {
        const { id, role } = getUser(req);
        const limit = parseInt(req.query.limit) || 20;

        if (isGuest(role)) {
            const result = await guestNotificationService.getUnreadGuestNotifications(id, limit);
            // Always 200 with explicit arrays so clients never treat an empty
            // cached 304 as a hard failure.
            return res.status(200).json({
                success: true,
                data: Array.isArray(result.notifications) ? result.notifications : [],
                unreadCount: Number(result.unreadCount) || 0,
                role: 'guest'
            });
        }

        if (isTenant(role)) {
            const result = await tenantNotificationService.getUnreadTenantNotifications
                ? await tenantNotificationService.getUnreadTenantNotifications(id, limit)
                : await tenantNotificationService.getTenantNotifications(id, limit, 0);
            // Normalize shape
            const notifications = result.notifications || result || [];
            const unreadCount = result.unreadCount != null
                ? result.unreadCount
                : notifications.filter(n => !n.is_read).length;
            return res.status(200).json({
                success: true,
                data: notifications.filter ? notifications.filter(n => !n.is_read) : notifications,
                unreadCount
            });
        }

        const result = await NotificationService.getUnreadNotifications(id, limit);
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
 * Get all notifications (paginated)
 */
const getNotifications = async (req, res) => {
    try {
        const { id, role } = getUser(req);
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;

        if (isGuest(role)) {
            const result = await guestNotificationService.getGuestNotifications(id, limit, offset);
            return res.status(200).json({
                success: true,
                data: Array.isArray(result.notifications) ? result.notifications : [],
                unreadCount: Number(result.unreadCount) || 0,
                role: 'guest',
                pagination: {
                    limit,
                    offset,
                    total: result.total
                }
            });
        }

        if (isTenant(role)) {
            const result = await tenantNotificationService.getTenantNotifications(id, limit, offset);
            return res.status(200).json({
                success: true,
                data: result.notifications || result,
                unreadCount: result.unreadCount,
                pagination: {
                    limit,
                    offset,
                    total: result.total
                }
            });
        }

        const result = await NotificationService.getAdminNotifications(id, limit, offset);
        return res.status(200).json({
            success: true,
            data: result.notifications,
            unreadCount: result.unreadCount,
            pagination: {
                limit,
                offset,
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
 * Get unread count
 */
const getUnreadCount = async (req, res) => {
    try {
        const { id, role } = getUser(req);

        if (isGuest(role)) {
            const count = await guestNotificationService.getUnreadGuestCount(id);
            return res.status(200).json({ success: true, unreadCount: Number(count) || 0, role: 'guest' });
        }

        if (isTenant(role)) {
            const count = tenantNotificationService.getUnreadTenantCount
                ? await tenantNotificationService.getUnreadTenantCount(id)
                : (await tenantNotificationService.getTenantNotifications(id, 100, 0)).unreadCount || 0;
            return res.status(200).json({ success: true, unreadCount: count });
        }

        const count = await NotificationService.getUnreadCount(id);
        return res.status(200).json({ success: true, unreadCount: count });
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
        const { id: userId, role } = getUser(req);
        const { id } = req.params;

        if (isGuest(role)) {
            const updated = await guestNotificationService.markGuestNotificationAsRead(id, userId);
            if (!updated) {
                return res.status(404).json({ success: false, message: 'Notification not found' });
            }
            const unreadCount = await guestNotificationService.getUnreadGuestCount(userId);
            return res.status(200).json({
                success: true,
                message: 'Notification marked as read',
                unreadCount
            });
        }

        if (isTenant(role)) {
            const updated = await tenantNotificationService.markTenantNotificationAsRead
                ? await tenantNotificationService.markTenantNotificationAsRead(id, userId)
                : await tenantNotificationService.markAsRead?.(id, userId);
            if (!updated) {
                return res.status(404).json({ success: false, message: 'Notification not found' });
            }
            const unreadCount = tenantNotificationService.getUnreadTenantCount
                ? await tenantNotificationService.getUnreadTenantCount(userId)
                : 0;
            return res.status(200).json({
                success: true,
                message: 'Notification marked as read',
                unreadCount
            });
        }

        const updated = await NotificationService.markAsRead(id, userId);
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        const unreadCount = await NotificationService.getUnreadCount(userId);
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
        const { id: userId, role } = getUser(req);

        if (isGuest(role)) {
            const count = await guestNotificationService.markAllGuestNotificationsAsRead(userId);
            return res.status(200).json({
                success: true,
                message: `Marked ${count} notifications as read`,
                unreadCount: 0
            });
        }

        if (isTenant(role)) {
            const count = tenantNotificationService.markAllTenantNotificationsAsRead
                ? await tenantNotificationService.markAllTenantNotificationsAsRead(userId)
                : await tenantNotificationService.markAllAsRead?.(userId) || 0;
            return res.status(200).json({
                success: true,
                message: `Marked ${count} notifications as read`,
                unreadCount: 0
            });
        }

        const count = await NotificationService.markAllAsRead(userId);
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
        const { id: userId, role } = getUser(req);
        const { id } = req.params;

        if (isGuest(role)) {
            const deleted = await guestNotificationService.deleteGuestNotification(id, userId);
            if (!deleted) {
                return res.status(404).json({ success: false, message: 'Notification not found' });
            }
            const unreadCount = await guestNotificationService.getUnreadGuestCount(userId);
            return res.status(200).json({
                success: true,
                message: 'Notification deleted',
                unreadCount
            });
        }

        if (isTenant(role)) {
            const deleted = tenantNotificationService.deleteTenantNotification
                ? await tenantNotificationService.deleteTenantNotification(id, userId)
                : await tenantNotificationService.deleteNotification?.(id, userId);
            if (!deleted) {
                return res.status(404).json({ success: false, message: 'Notification not found' });
            }
            const unreadCount = tenantNotificationService.getUnreadTenantCount
                ? await tenantNotificationService.getUnreadTenantCount(userId)
                : 0;
            return res.status(200).json({
                success: true,
                message: 'Notification deleted',
                unreadCount
            });
        }

        const deleted = await NotificationService.deleteNotification(id, userId);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        const unreadCount = await NotificationService.getUnreadCount(userId);
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
