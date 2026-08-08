const db = require("../config/db");
const NotificationModel = require("../models/notification.model");
const AdminModel = require("../models/admin.model");

/**
 * Notification Types and their configurations
 */
const NOTIFICATION_TYPES = {
    // Tenant related
    TENANT_EXPIRY: {
        type: 'tenant_expiry',
        icon: '⚠️',
        color: '#e74c3c',
        linkPrefix: '/tenants/'
    },
    TENANT_EFRRO_EXPIRY: {
        type: 'tenant_efrro_expiry',
        icon: '🛂',
        color: '#e67e22',
        linkPrefix: '/tenants/'
    },
    TENANT_REGISTERED: {
        type: 'tenant_registered',
        icon: '👤',
        color: '#2ecc71',
        linkPrefix: '/tenants/'
    },
    TENANT_UPDATED: {
        type: 'tenant_updated',
        icon: '✏️',
        color: '#3498db',
        linkPrefix: '/tenants/'
    },
    
    // Guest related
    GUEST_REGISTERED: {
        type: 'guest_registered',
        icon: '🚪',
        color: '#1abc9c',
        linkPrefix: '/tenants/'
    },
    GUEST_MESSAGE_SENT: {
        type: 'guest_message_sent',
        icon: '📨',
        color: '#9b59b6',
        linkPrefix: '/tenants/'
    },
    
    // Bill related
    BILL_CREATED: {
        type: 'bill_created',
        icon: '📄',
        color: '#3498db',
        linkPrefix: '/bills/'
    },
    BILL_PAID: {
        type: 'bill_paid',
        icon: '✅',
        color: '#2ecc71',
        linkPrefix: '/bills/'
    },
    BILL_PARTIALLY_PAID: {
        type: 'bill_partially_paid',
        icon: '💳',
        color: '#f39c12',
        linkPrefix: '/bills/'
    },
    BILL_OVERDUE: {
        type: 'bill_overdue',
        icon: '🔴',
        color: '#e74c3c',
        linkPrefix: '/bills/'
    },
    BILL_FINE_APPLIED: {
        type: 'bill_fine_applied',
        icon: '💰',
        color: '#e74c3c',
        linkPrefix: '/bills/'
    },
    CASH_PAYMENT_VERIFIED: {
        type: 'cash_payment_verified',
        icon: '💵',
        color: '#2ecc71',
        linkPrefix: '/bills/'
    },
    
    // PG related
    PG_CREATED: {
        type: 'pg_created',
        icon: '🏠',
        color: '#2ecc71',
        linkPrefix: '/pgs/'
    },
    PG_UPDATED: {
        type: 'pg_updated',
        icon: '🏗️',
        color: '#3498db',
        linkPrefix: '/pgs/'
    },
    PG_ACTIVATED: {
        type: 'pg_activated',
        icon: '✅',
        color: '#2ecc71',
        linkPrefix: '/pgs/'
    },
    PG_DEACTIVATED: {
        type: 'pg_deactivated',
        icon: '⛔',
        color: '#e74c3c',
        linkPrefix: '/pgs/'
    },
    
    // Admin related
    ADMIN_CREATED: {
        type: 'admin_created',
        icon: '👨‍💼',
        color: '#3498db',
        linkPrefix: '/admins/'
    },
    ADMIN_UPDATED: {
        type: 'admin_updated',
        icon: '🔄',
        color: '#3498db',
        linkPrefix: '/admins/'
    },
    
    // System
    SYSTEM_ALERT: {
        type: 'system_alert',
        icon: '🔔',
        color: '#e74c3c',
        linkPrefix: '/dashboard'
    }
};

/**
 * Send notification to a single admin
 */
const sendNotification = async (adminId, type, data) => {
    try {
        const config = NOTIFICATION_TYPES[type];
        if (!config) {
            throw new Error(`Invalid notification type: ${type}`);
        }

        const notificationId = await NotificationModel.createNotification(adminId, {
            type: config.type,
            title: data.title,
            message: data.message,
            entity_id: data.entity_id || null,
            entity_type: data.entity_type || null,
            link: data.link || (config.linkPrefix + (data.entity_id || '')),
            icon: data.icon || config.icon,
            color: data.color || config.color
        });

        return notificationId;
    } catch (error) {
        console.error('Error sending notification:', error);
        return null;
    }
};

/**
 * Send notification to all admins (super_admin and admin)
 */
const sendNotificationToAllAdmins = async (type, data) => {
    try {
        // Get all active admins
        const connection = await db.getConnection();
        const [admins] = await connection.execute(
            `
            SELECT id FROM admins 
            WHERE is_active = 1 AND role IN ('super_admin', 'admin')
            `
        );
        connection.release();

        if (admins.length === 0) return;

        const adminIds = admins.map(admin => admin.id);
        const config = NOTIFICATION_TYPES[type];

        if (!config) {
            throw new Error(`Invalid notification type: ${type}`);
        }

        const notificationData = {
            type: config.type,
            title: data.title,
            message: data.message,
            entity_id: data.entity_id || null,
            entity_type: data.entity_type || null,
            link: data.link || (config.linkPrefix + (data.entity_id || '')),
            icon: data.icon || config.icon,
            color: data.color || config.color
        };

        await NotificationModel.createNotificationsForAdmins(adminIds, notificationData);
        return adminIds.length;
    } catch (error) {
        console.error('Error sending notification to all admins:', error);
        return 0;
    }
};

/**
 * Send notification to super admins only
 */
const sendNotificationToSuperAdmins = async (type, data) => {
    try {
        const connection = await db.getConnection();
        const [admins] = await connection.execute(
            `
            SELECT id FROM admins 
            WHERE is_active = 1 AND role = 'super_admin'
            `
        );
        connection.release();

        if (admins.length === 0) return;

        const adminIds = admins.map(admin => admin.id);
        const config = NOTIFICATION_TYPES[type];

        if (!config) {
            throw new Error(`Invalid notification type: ${type}`);
        }

        const notificationData = {
            type: config.type,
            title: data.title,
            message: data.message,
            entity_id: data.entity_id || null,
            entity_type: data.entity_type || null,
            link: data.link || (config.linkPrefix + (data.entity_id || '')),
            icon: data.icon || config.icon,
            color: data.color || config.color
        };

        await NotificationModel.createNotificationsForAdmins(adminIds, notificationData);
        return adminIds.length;
    } catch (error) {
        console.error('Error sending notification to super admins:', error);
        return 0;
    }
};

/**
 * Get all notifications for an admin with pagination
 */
const getAdminNotifications = async (adminId, limit = 50, offset = 0) => {
    const notifications = await NotificationModel.getNotifications(adminId, limit, offset);
    const unreadCount = await NotificationModel.getUnreadCount(adminId);
    
    return {
        notifications,
        unreadCount,
        total: notifications.length
    };
};

/**
 * Get unread notifications for an admin
 */
const getUnreadNotifications = async (adminId, limit = 20) => {
    const notifications = await NotificationModel.getUnreadNotifications(adminId, limit);
    const unreadCount = await NotificationModel.getUnreadCount(adminId);
    
    return {
        notifications,
        unreadCount
    };
};

/**
 * Get unread count for an admin
 */
const getUnreadCount = async (adminId) => {
    return await NotificationModel.getUnreadCount(adminId);
};

/**
 * Mark a notification as read
 */
const markAsRead = async (notificationId, adminId) => {
    return await NotificationModel.markAsRead(notificationId, adminId);
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (adminId) => {
    return await NotificationModel.markAllAsRead(adminId);
};

/**
 * Delete a notification
 */
const deleteNotification = async (notificationId, adminId) => {
    return await NotificationModel.deleteNotification(notificationId, adminId);
};

/**
 * Generate notification messages for various events
 */
const generateNotificationMessages = {
    // Tenant events
    tenantEFRROExpiry: (tenant, days) => ({
        title: 'e-FRRO Expiring Soon',
        message: `${tenant.full_name}'s e-FRRO is expiring in ${days} day${days > 1 ? 's' : ''}`,
        entity_id: tenant.id,
        entity_type: 'tenant'
    }),
    
    tenantPaymentDue: (tenant, days) => ({
        title: 'Payment Overdue',
        message: `${tenant.full_name}'s rent is ${days} day${days > 1 ? 's' : ''} overdue`,
        entity_id: tenant.id,
        entity_type: 'tenant'
    }),
    
    tenantRegistered: (tenant) => ({
        title: 'New Tenant Registered',
        message: `${tenant.full_name} has been registered as a tenant`,
        entity_id: tenant.id,
        entity_type: 'tenant'
    }),
    
    // Guest events
    guestRegistered: (guest) => ({
        title: 'New Guest Registered',
        message: `${guest.full_name} has been registered as a guest`,
        entity_id: guest.id,
        entity_type: 'guest'
    }),
    
    guestMessageSent: (guest) => ({
        title: 'Guest Message Sent',
        message: `Message sent to guest ${guest.full_name}`,
        entity_id: guest.id,
        entity_type: 'guest'
    }),
    
    // Bill events
    billCreated: (bill, tenant) => ({
        title: 'New Bill Generated',
        message: `Bill of ₹${bill.total_amount} created for ${tenant.full_name}`,
        entity_id: bill.id,
        entity_type: 'bill'
    }),
    
    billPaid: (bill, tenant) => ({
        title: 'Bill Paid',
        message: `${tenant.full_name} has paid the bill of ₹${bill.total_amount}`,
        entity_id: bill.id,
        entity_type: 'bill'
    }),
    
    billPartiallyPaid: (bill, tenant) => ({
        title: 'Partial Payment Made',
        message: `${tenant.full_name} made a partial payment of ₹${bill.paid_amount}`,
        entity_id: bill.id,
        entity_type: 'bill'
    }),
    
    billOverdue: (bill, tenant, days) => ({
        title: 'Bill Overdue',
        message: `${tenant.full_name}'s bill is ${days} day${days > 1 ? 's' : ''} overdue`,
        entity_id: bill.id,
        entity_type: 'bill'
    }),
    
    fineApplied: (bill, tenant, fineAmount) => ({
        title: 'Late Fee Applied',
        message: `Late fee of ₹${fineAmount} applied to ${tenant.full_name}'s bill`,
        entity_id: bill.id,
        entity_type: 'bill'
    }),
    
    cashPaymentVerified: (bill, tenant) => ({
        title: 'Cash Payment Verified',
        message: `Cash payment of ₹${bill.total_amount} verified for ${tenant.full_name}`,
        entity_id: bill.id,
        entity_type: 'bill'
    }),
    
    // PG events
    pgCreated: (pg) => ({
        title: 'New PG Created',
        message: `PG "${pg.name}" has been created`,
        entity_id: pg.id,
        entity_type: 'pg'
    }),
    
    pgUpdated: (pg) => ({
        title: 'PG Updated',
        message: `PG "${pg.name}" has been updated`,
        entity_id: pg.id,
        entity_type: 'pg'
    }),
    
    pgActivated: (pg) => ({
        title: 'PG Activated',
        message: `PG "${pg.name}" has been activated`,
        entity_id: pg.id,
        entity_type: 'pg'
    }),
    
    pgDeactivated: (pg) => ({
        title: 'PG Deactivated',
        message: `PG "${pg.name}" has been deactivated`,
        entity_id: pg.id,
        entity_type: 'pg'
    }),
    
    // Admin events
    adminCreated: (admin) => ({
        title: 'New Admin Created',
        message: `Admin "${admin.name}" has been created`,
        entity_id: admin.id,
        entity_type: 'admin'
    }),
    
    adminUpdated: (admin) => ({
        title: 'Admin Updated',
        message: `Admin "${admin.name}" has been updated`,
        entity_id: admin.id,
        entity_type: 'admin'
    })
};

module.exports = {
    NOTIFICATION_TYPES,
    sendNotification,
    sendNotificationToAllAdmins,
    sendNotificationToSuperAdmins,
    getAdminNotifications,
    getUnreadNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    generateNotificationMessages
};