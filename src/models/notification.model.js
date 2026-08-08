const db = require("../config/db");

/**
 * Create a notification for an admin
 */
const createNotification = async (adminId, notificationData) => {
    const [result] = await db.execute(
        `
        INSERT INTO admin_notifications (
            admin_id,
            type,
            title,
            message,
            entity_id,
            entity_type,
            link,
            icon,
            color
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            adminId,
            notificationData.type,
            notificationData.title,
            notificationData.message,
            notificationData.entity_id || null,
            notificationData.entity_type || null,
            notificationData.link || null,
            notificationData.icon || null,
            notificationData.color || null
        ]
    );
    return result.insertId;
};

/**
 * Create notifications for multiple admins
 */
const createNotificationsForAdmins = async (adminIds, notificationData) => {
    if (!adminIds || adminIds.length === 0) return [];
    
    const values = adminIds.map(adminId => [
        adminId,
        notificationData.type,
        notificationData.title,
        notificationData.message,
        notificationData.entity_id || null,
        notificationData.entity_type || null,
        notificationData.link || null,
        notificationData.icon || null,
        notificationData.color || null
    ]);

    const [result] = await db.query(
        `
        INSERT INTO admin_notifications (
            admin_id,
            type,
            title,
            message,
            entity_id,
            entity_type,
            link,
            icon,
            color
        ) VALUES ?
        `,
        [values]
    );
    
    return result;
};

/**
 * Get notifications for an admin
 */
const getNotifications = async (adminId, limit = 50, offset = 0) => {
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
        FROM admin_notifications
        WHERE admin_id = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
        `,
        [adminId, parseInt(limit), parseInt(offset)]
    );
    return rows;
};

/**
 * Get unread notifications for an admin
 */
const getUnreadNotifications = async (adminId, limit = 20) => {
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
        FROM admin_notifications
        WHERE admin_id = ? AND is_read = 0
        ORDER BY created_at DESC
        LIMIT ?
        `,
        [adminId, parseInt(limit)]
    );
    return rows;
};

/**
 * Get unread count for an admin
 */
const getUnreadCount = async (adminId) => {
    const [rows] = await db.execute(
        `
        SELECT COUNT(*) as count
        FROM admin_notifications
        WHERE admin_id = ? AND is_read = 0
        `,
        [adminId]
    );
    return rows[0].count;
};

/**
 * Mark a notification as read
 */
const markAsRead = async (notificationId, adminId) => {
    const [result] = await db.execute(
        `
        UPDATE admin_notifications
        SET is_read = 1, read_at = NOW()
        WHERE id = ? AND admin_id = ?
        `,
        [notificationId, adminId]
    );
    return result.affectedRows > 0;
};

/**
 * Mark all notifications as read for an admin
 */
const markAllAsRead = async (adminId) => {
    const [result] = await db.execute(
        `
        UPDATE admin_notifications
        SET is_read = 1, read_at = NOW()
        WHERE admin_id = ? AND is_read = 0
        `,
        [adminId]
    );
    return result.affectedRows;
};

/**
 * Delete a notification
 */
const deleteNotification = async (notificationId, adminId) => {
    const [result] = await db.execute(
        `
        DELETE FROM admin_notifications
        WHERE id = ? AND admin_id = ?
        `,
        [notificationId, adminId]
    );
    return result.affectedRows > 0;
};

/**
 * Get notification by ID
 */
const getNotificationById = async (notificationId, adminId) => {
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
        FROM admin_notifications
        WHERE id = ? AND admin_id = ?
        `,
        [notificationId, adminId]
    );
    return rows[0] || null;
};

/**
 * Clean old notifications (older than X days)
 */
const cleanOldNotifications = async (days = 30) => {
    const [result] = await db.execute(
        `
        DELETE FROM admin_notifications
        WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
        AND is_read = 1
        `,
        [days]
    );
    return result.affectedRows;
};

module.exports = {
    createNotification,
    createNotificationsForAdmins,
    getNotifications,
    getUnreadNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationById,
    cleanOldNotifications
};