const db = require("../config/db");

/**
 * Create a notification for a tenant
 */
const createTenantNotification = async (tenantId, notificationData) => {
    const [result] = await db.execute(
        `
        INSERT INTO tenant_notifications (
            tenant_id,
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
            tenantId,
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
 * Create notifications for multiple tenants
 */
const createNotificationsForTenants = async (tenantIds, notificationData) => {
    if (!tenantIds || tenantIds.length === 0) return [];
    
    const values = tenantIds.map(tenantId => [
        tenantId,
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
        INSERT INTO tenant_notifications (
            tenant_id,
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
 * Get notifications for a tenant
 */
const getTenantNotifications = async (tenantId, limit = 50, offset = 0) => {
    // Ensure limit and offset are valid integers
    const parsedLimit = parseInt(limit, 10);
    const parsedOffset = parseInt(offset, 10);
    
    if (isNaN(parsedLimit) || parsedLimit < 1) {
        throw new Error('Invalid limit parameter');
    }
    if (isNaN(parsedOffset) || parsedOffset < 0) {
        throw new Error('Invalid offset parameter');
    }
    
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
        FROM tenant_notifications
        WHERE tenant_id = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
        `,
        [tenantId, parsedLimit, parsedOffset]
    );
    return rows;
};

/**
 * Get unread notifications for a tenant
 */
const getUnreadTenantNotifications = async (tenantId, limit = 20) => {
    // Ensure limit is a valid integer
    const parsedLimit = parseInt(limit, 10);
    if (isNaN(parsedLimit) || parsedLimit < 1) {
        throw new Error('Invalid limit parameter');
    }
    
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
        FROM tenant_notifications
        WHERE tenant_id = ? AND is_read = 0
        ORDER BY created_at DESC
        LIMIT ?
        `,
        [tenantId, parsedLimit]
    );
    return rows;
};

/**
 * Get unread count for a tenant
 */
const getUnreadTenantCount = async (tenantId) => {
    const [rows] = await db.execute(
        `
        SELECT COUNT(*) as count
        FROM tenant_notifications
        WHERE tenant_id = ? AND is_read = 0
        `,
        [tenantId]
    );
    return rows[0].count;
};

/**
 * Mark a notification as read for tenant
 */
const markTenantNotificationAsRead = async (notificationId, tenantId) => {
    const [result] = await db.execute(
        `
        UPDATE tenant_notifications
        SET is_read = 1, read_at = NOW()
        WHERE id = ? AND tenant_id = ?
        `,
        [notificationId, tenantId]
    );
    return result.affectedRows > 0;
};

/**
 * Mark all notifications as read for a tenant
 */
const markAllTenantNotificationsAsRead = async (tenantId) => {
    const [result] = await db.execute(
        `
        UPDATE tenant_notifications
        SET is_read = 1, read_at = NOW()
        WHERE tenant_id = ? AND is_read = 0
        `,
        [tenantId]
    );
    return result.affectedRows;
};

/**
 * Delete a notification for tenant
 */
const deleteTenantNotification = async (notificationId, tenantId) => {
    const [result] = await db.execute(
        `
        DELETE FROM tenant_notifications
        WHERE id = ? AND tenant_id = ?
        `,
        [notificationId, tenantId]
    );
    return result.affectedRows > 0;
};

/**
 * Get notification by ID for tenant
 */
const getTenantNotificationById = async (notificationId, tenantId) => {
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
        FROM tenant_notifications
        WHERE id = ? AND tenant_id = ?
        `,
        [notificationId, tenantId]
    );
    return rows[0] || null;
};

module.exports = {
    createTenantNotification,
    createNotificationsForTenants,
    getTenantNotifications,
    getUnreadTenantNotifications,
    getUnreadTenantCount,
    markTenantNotificationAsRead,
    markAllTenantNotificationsAsRead,
    deleteTenantNotification,
    getTenantNotificationById
};