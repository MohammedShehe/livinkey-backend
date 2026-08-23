const db = require("../config/db");
const TenantNotificationModel = require("../models/tenant.notification.model");
const TenantModel = require("../models/tenant.model");
const firebase = require("../config/firebase");

/**
 * Notification Types for Tenants
 */
const TENANT_NOTIFICATION_TYPES = {
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
    // ============================================================
    // FIXED: Added PAYMENT_PROOF_VERIFIED and PAYMENT_PROOF_REJECTED
    // ============================================================
    PAYMENT_PROOF_VERIFIED: {
        type: 'payment_proof_verified',
        icon: '✅',
        color: '#2ecc71',
        linkPrefix: '/tenant-payments/history'
    },
    PAYMENT_PROOF_REJECTED: {
        type: 'payment_proof_rejected',
        icon: '❌',
        color: '#e74c3c',
        linkPrefix: '/tenant-payments/history'
    },
    MAINTENANCE_CREATED: {
        type: 'maintenance_created',
        icon: '🔧',
        color: '#f39c12',
        linkPrefix: '/maintenance/'
    },
    MAINTENANCE_STARTED: {
        type: 'maintenance_started',
        icon: '🔄',
        color: '#3498db',
        linkPrefix: '/maintenance/'
    },
    MAINTENANCE_COMPLETED: {
        type: 'maintenance_completed',
        icon: '✅',
        color: '#2ecc71',
        linkPrefix: '/maintenance/'
    },
    DOCUMENT_REMINDER: {
        type: 'document_reminder',
        icon: '📋',
        color: '#e67e22',
        linkPrefix: '/documents/'
    },
    EFRRO_EXPIRY: {
        type: 'efrro_expiry',
        icon: '🛂',
        color: '#e74c3c',
        linkPrefix: '/documents/'
    },
    PAYMENT_REMINDER: {
        type: 'payment_reminder',
        icon: '💸',
        color: '#e74c3c',
        linkPrefix: '/payments/'
    },
    FEEDBACK_SUBMITTED: {
        type: 'feedback_submitted',
        icon: '⭐',
        color: '#f39c12',
        linkPrefix: '/profile'
    }
};

/**
 * Send notification to a single tenant (with push notification support)
 * @param {number} tenantId - Tenant ID
 * @param {string} type - Notification type key
 * @param {Object} data - Notification data
 * @param {Object} pushData - Optional push notification data (title, body)
 * @returns {Promise<number|null>} Notification ID or null
 */
const sendTenantNotification = async (tenantId, type, data, pushData = null) => {
    try {
        const config = TENANT_NOTIFICATION_TYPES[type];
        if (!config) {
            throw new Error(`Invalid notification type: ${type}`);
        }

        // Create notification in database
        const notificationId = await TenantNotificationModel.createTenantNotification(tenantId, {
            type: config.type,
            title: data.title,
            message: data.message,
            entity_id: data.entity_id || null,
            entity_type: data.entity_type || null,
            link: data.link || (config.linkPrefix + (data.entity_id || '')),
            icon: data.icon || config.icon,
            color: data.color || config.color
        });

        // ============================================================
        // NEW: Send push notification if enabled
        // ============================================================
        if (process.env.ENABLE_PUSH_NOTIFICATIONS === 'true') {
            try {
                const fcmTokens = await firebase.getTenantFCMTokens(tenantId);
                
                if (fcmTokens.length > 0) {
                    const pushTitle = pushData?.title || data.title;
                    const pushBody = pushData?.body || data.message;
                    
                    await firebase.sendPushNotificationToMultiple(
                        fcmTokens,
                        {
                            title: pushTitle,
                            body: pushBody,
                        },
                        {
                            type: type.toLowerCase(),
                            entity_id: data.entity_id || '',
                            action: 'open',
                        }
                    );
                }
            } catch (pushError) {
                console.error('Failed to send push notification:', pushError);
            }
        }

        return notificationId;
    } catch (error) {
        console.error('Error sending tenant notification:', error);
        return null;
    }
};

/**
 * Send notification to multiple tenants (with push notification support)
 * @param {Array<number>} tenantIds - Array of tenant IDs
 * @param {string} type - Notification type key
 * @param {Object} data - Notification data
 * @param {Object} pushData - Optional push notification data
 * @returns {Promise<number>} Number of tenants notified
 */
const sendNotificationsToTenants = async (tenantIds, type, data, pushData = null) => {
    try {
        if (!tenantIds || tenantIds.length === 0) return 0;

        const config = TENANT_NOTIFICATION_TYPES[type];
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

        // Create notifications in database
        await TenantNotificationModel.createNotificationsForTenants(tenantIds, notificationData);

        // ============================================================
        // NEW: Send push notifications if enabled
        // ============================================================
        if (process.env.ENABLE_PUSH_NOTIFICATIONS === 'true') {
            try {
                // Get all FCM tokens for all tenants
                for (const tenantId of tenantIds) {
                    const fcmTokens = await firebase.getTenantFCMTokens(tenantId);
                    
                    if (fcmTokens.length > 0) {
                        const pushTitle = pushData?.title || data.title;
                        const pushBody = pushData?.body || data.message;
                        
                        await firebase.sendPushNotificationToMultiple(
                            fcmTokens,
                            {
                                title: pushTitle,
                                body: pushBody,
                            },
                            {
                                type: type.toLowerCase(),
                                entity_id: data.entity_id || '',
                                action: 'open',
                            }
                        );
                    }
                }
            } catch (pushError) {
                console.error('Failed to send push notifications:', pushError);
            }
        }

        return tenantIds.length;
    } catch (error) {
        console.error('Error sending notifications to tenants:', error);
        return 0;
    }
};

/**
 * Get all notifications for a tenant
 */
const getTenantNotifications = async (tenantId, limit = 50, offset = 0) => {
    const notifications = await TenantNotificationModel.getTenantNotifications(tenantId, limit, offset);
    const unreadCount = await TenantNotificationModel.getUnreadTenantCount(tenantId);
    
    return {
        notifications,
        unreadCount,
        total: notifications.length
    };
};

/**
 * Get unread notifications for a tenant
 */
const getUnreadTenantNotifications = async (tenantId, limit = 20) => {
    const notifications = await TenantNotificationModel.getUnreadTenantNotifications(tenantId, limit);
    const unreadCount = await TenantNotificationModel.getUnreadTenantCount(tenantId);
    
    return {
        notifications,
        unreadCount
    };
};

/**
 * Get unread count for a tenant
 */
const getUnreadTenantCount = async (tenantId) => {
    return await TenantNotificationModel.getUnreadTenantCount(tenantId);
};

/**
 * Mark notification as read
 */
const markTenantNotificationAsRead = async (notificationId, tenantId) => {
    return await TenantNotificationModel.markTenantNotificationAsRead(notificationId, tenantId);
};

/**
 * Mark all notifications as read
 */
const markAllTenantNotificationsAsRead = async (tenantId) => {
    return await TenantNotificationModel.markAllTenantNotificationsAsRead(tenantId);
};

/**
 * Delete a notification
 */
const deleteTenantNotification = async (notificationId, tenantId) => {
    return await TenantNotificationModel.deleteTenantNotification(notificationId, tenantId);
};

/**
 * Generate notification messages for tenant events
 */
const generateTenantNotificationMessages = {
    billCreated: (bill) => ({
        title: 'New Bill Generated',
        message: `A new bill of ₹${bill.total_amount} has been generated for you.`,
        entity_id: bill.id,
        entity_type: 'bill'
    }),
    
    billPaid: (bill) => ({
        title: 'Payment Confirmed',
        message: `Your payment of ₹${bill.paid_amount} has been confirmed.`,
        entity_id: bill.id,
        entity_type: 'bill'
    }),
    
    billPartiallyPaid: (bill) => ({
        title: 'Partial Payment Received',
        message: `Your partial payment of ₹${bill.paid_amount} has been received.`,
        entity_id: bill.id,
        entity_type: 'bill'
    }),
    
    billOverdue: (bill, days) => ({
        title: 'Bill Overdue',
        message: `Your bill is ${days} days overdue. Please pay immediately.`,
        entity_id: bill.id,
        entity_type: 'bill'
    }),
    
    billFineApplied: (bill, fineAmount) => ({
        title: 'Late Fee Applied',
        message: `A late fee of ₹${fineAmount} has been applied to your bill.`,
        entity_id: bill.id,
        entity_type: 'bill'
    }),
    
    // ============================================================
    // FIXED: Added paymentProofVerified and paymentProofRejected
    // ============================================================
    paymentProofVerified: (bill) => ({
        title: 'Payment Proof Verified',
        message: `Your payment proof of ₹${bill.paid_amount} has been verified.`,
        entity_id: bill.id,
        entity_type: 'bill'
    }),

    paymentProofRejected: (reason) => ({
        title: 'Payment Proof Rejected',
        message: reason
            ? `Your payment proof was rejected. Reason: ${reason}`
            : 'Your payment proof was rejected.',
        entity_type: 'bill'
    }),
    
    maintenanceCreated: (request) => ({
        title: 'Maintenance Request Submitted',
        message: `Your ${request.issue_type} request has been submitted.`,
        entity_id: request.id,
        entity_type: 'maintenance'
    }),
    
    maintenanceStarted: (request) => ({
        title: 'Maintenance Started',
        message: `Your ${request.issue_type} request is now in progress.`,
        entity_id: request.id,
        entity_type: 'maintenance'
    }),
    
    maintenanceCompleted: (request) => ({
        title: 'Maintenance Completed',
        message: `Your ${request.issue_type} request has been completed.`,
        entity_id: request.id,
        entity_type: 'maintenance'
    }),
    
    documentReminder: (documentType) => ({
        title: 'Document Required',
        message: `Please upload your ${documentType}.`,
        entity_type: 'document'
    }),
    
    efrroExpiry: (days) => ({
        title: 'e-FRRO Expiry Alert',
        message: `Your e-FRRO expires in ${days} days. Please renew immediately.`,
        entity_type: 'document'
    }),
    
    paymentReminder: (days) => ({
        title: 'Payment Reminder',
        message: `Your rent payment is due in ${days} days.`,
        entity_type: 'payment'
    }),

    feedbackSubmitted: () => ({
        title: 'Thank You for Your Feedback!',
        message: 'We appreciate you taking the time to share your experience with us.',
        entity_type: 'feedback'
    }),
};

module.exports = {
    TENANT_NOTIFICATION_TYPES,
    sendTenantNotification,
    sendNotificationsToTenants,
    getTenantNotifications,
    getUnreadTenantNotifications,
    getUnreadTenantCount,
    markTenantNotificationAsRead,
    markAllTenantNotificationsAsRead,
    deleteTenantNotification,
    generateTenantNotificationMessages
};