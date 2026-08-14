const db = require("../config/db");

/**
 * Create a notification for a guest
 */
const createGuestNotification = async (guestId, notificationData) => {
    const [result] = await db.execute(
        `
        INSERT INTO guest_notifications (
            guest_id,
            type,
            title,
            message,
            entity_id,
            entity_type,
            link,
            icon,
            color,
            is_read
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            guestId,
            notificationData.type,
            notificationData.title,
            notificationData.message,
            notificationData.entity_id || null,
            notificationData.entity_type || null,
            notificationData.link || null,
            notificationData.icon || null,
            notificationData.color || null,
            0
        ]
    );
    return result.insertId;
};

/**
 * Create notifications for multiple guests
 */
const createNotificationsForGuests = async (guestIds, notificationData) => {
    if (!guestIds || guestIds.length === 0) return [];
    
    const values = guestIds.map(guestId => [
        guestId,
        notificationData.type,
        notificationData.title,
        notificationData.message,
        notificationData.entity_id || null,
        notificationData.entity_type || null,
        notificationData.link || null,
        notificationData.icon || null,
        notificationData.color || null,
        0
    ]);

    const [result] = await db.query(
        `
        INSERT INTO guest_notifications (
            guest_id,
            type,
            title,
            message,
            entity_id,
            entity_type,
            link,
            icon,
            color,
            is_read
        ) VALUES ?
        `,
        [values]
    );
    
    return result;
};

/**
 * Get notifications for a guest
 */
const getGuestNotifications = async (guestId, limit = 50, offset = 0) => {
    const [rows] = await db.execute(
        `
        SELECT 
            id,
            type,
            title,
            message,
            entity_id,
            entity_type,
            link,
            icon,
            color,
            is_read,
            read_at,
            created_at
        FROM guest_notifications
        WHERE guest_id = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
        `,
        [guestId, parseInt(limit), parseInt(offset)]
    );
    return rows;
};

/**
 * Get unread notifications for a guest
 */
const getUnreadGuestNotifications = async (guestId, limit = 20) => {
    const [rows] = await db.execute(
        `
        SELECT 
            id,
            type,
            title,
            message,
            entity_id,
            entity_type,
            link,
            icon,
            color,
            created_at
        FROM guest_notifications
        WHERE guest_id = ? AND is_read = 0
        ORDER BY created_at DESC
        LIMIT ?
        `,
        [guestId, parseInt(limit)]
    );
    return rows;
};

/**
 * Get unread count for a guest
 */
const getUnreadGuestCount = async (guestId) => {
    const [rows] = await db.execute(
        `
        SELECT COUNT(*) as count
        FROM guest_notifications
        WHERE guest_id = ? AND is_read = 0
        `,
        [guestId]
    );
    return rows[0].count;
};

/**
 * Mark a notification as read for guest
 */
const markGuestNotificationAsRead = async (notificationId, guestId) => {
    const [result] = await db.execute(
        `
        UPDATE guest_notifications
        SET is_read = 1, read_at = NOW()
        WHERE id = ? AND guest_id = ?
        `,
        [notificationId, guestId]
    );
    return result.affectedRows > 0;
};

/**
 * Mark all notifications as read for a guest
 */
const markAllGuestNotificationsAsRead = async (guestId) => {
    const [result] = await db.execute(
        `
        UPDATE guest_notifications
        SET is_read = 1, read_at = NOW()
        WHERE guest_id = ? AND is_read = 0
        `,
        [guestId]
    );
    return result.affectedRows;
};

/**
 * Delete a notification for guest
 */
const deleteGuestNotification = async (notificationId, guestId) => {
    const [result] = await db.execute(
        `
        DELETE FROM guest_notifications
        WHERE id = ? AND guest_id = ?
        `,
        [notificationId, guestId]
    );
    return result.affectedRows > 0;
};

/**
 * Get notification by ID for guest
 */
const getGuestNotificationById = async (notificationId, guestId) => {
    const [rows] = await db.execute(
        `
        SELECT 
            id,
            type,
            title,
            message,
            entity_id,
            entity_type,
            link,
            icon,
            color,
            is_read,
            read_at,
            created_at
        FROM guest_notifications
        WHERE id = ? AND guest_id = ?
        `,
        [notificationId, guestId]
    );
    return rows[0] || null;
};

module.exports = {
    createGuestNotification,
    createNotificationsForGuests,
    getGuestNotifications,
    getUnreadGuestNotifications,
    getUnreadGuestCount,
    markGuestNotificationAsRead,
    markAllGuestNotificationsAsRead,
    deleteGuestNotification,
    getGuestNotificationById
};