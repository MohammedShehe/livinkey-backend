const AdminNotificationLog = require('../models/admin.notification.log.model');
const db = require("../config/db");

class AdminNotificationService {
    /**
     * Get notification statistics
     */
    async getStats() {
        try {
            const totalSent = await AdminNotificationLog.countDocuments();
            
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const recentSent = await AdminNotificationLog.countDocuments({
                createdAt: { $gte: thirtyDaysAgo }
            });

            // These would come from your tenant/PG models
            // For now, we'll return placeholder values
            // You should replace these with actual database queries
            const totalTenants = await this.getTotalTenants();
            const totalPGs = await this.getTotalPGs();

            return {
                totalSent,
                recentSent,
                totalTenants,
                totalPGs
            };
        } catch (error) {
            throw new Error(`Failed to get stats: ${error.message}`);
        }
    }

    /**
     * Get total tenants (implement based on your tenant model)
     */
    async getTotalTenants() {
        try {
            const connection = await db.getConnection();
            const [result] = await connection.execute(
                `SELECT COUNT(*) as count FROM tenants WHERE role = 'tenant' AND is_active = 1`
            );
            connection.release();
            return result[0]?.count || 0;
        } catch (error) {
            console.error('Error getting total tenants:', error);
            return 0;
        }
    }

    /**
     * Get total PGs (implement based on your PG model)
     */
    async getTotalPGs() {
        try {
            const connection = await db.getConnection();
            const [result] = await connection.execute(
                `SELECT COUNT(*) as count FROM pgs WHERE is_active = 1`
            );
            connection.release();
            return result[0]?.count || 0;
        } catch (error) {
            console.error('Error getting total PGs:', error);
            return 0;
        }
    }

    /**
     * Get all tenants with their PG info
     */
    async getAllTenants() {
        try {
            const connection = await db.getConnection();
            const [tenants] = await connection.execute(
                `
                SELECT 
                    t.id,
                    t.full_name,
                    t.email,
                    t.phone,
                    t.is_active,
                    p.id as pg_id,
                    p.name as pg_name,
                    r.room_number
                FROM tenants t
                LEFT JOIN tenant_details td ON t.id = td.tenant_id
                LEFT JOIN pgs p ON td.pg_id = p.id
                LEFT JOIN rooms r ON td.room_id = r.id
                WHERE t.role = 'tenant' AND t.is_active = 1
                `
            );
            connection.release();
            return tenants;
        } catch (error) {
            console.error('Error getting all tenants:', error);
            return [];
        }
    }

    /**
     * Get tenants by PG ID
     */
    async getTenantsByPG(pgId) {
        try {
            const connection = await db.getConnection();
            const [tenants] = await connection.execute(
                `
                SELECT 
                    t.id,
                    t.full_name,
                    t.email,
                    t.phone,
                    r.room_number
                FROM tenants t
                INNER JOIN tenant_details td ON t.id = td.tenant_id
                INNER JOIN rooms r ON td.room_id = r.id
                WHERE t.role = 'tenant' 
                AND t.is_active = 1
                AND td.pg_id = ?
                `,
                [pgId]
            );
            connection.release();
            return tenants;
        } catch (error) {
            console.error('Error getting tenants by PG:', error);
            return [];
        }
    }

    /**
     * Get tenant by ID
     */
    async getTenantById(tenantId) {
        try {
            const connection = await db.getConnection();
            const [tenants] = await connection.execute(
                `
                SELECT 
                    t.id,
                    t.full_name,
                    t.email,
                    t.phone,
                    t.is_active,
                    p.id as pg_id,
                    p.name as pg_name,
                    r.room_number
                FROM tenants t
                LEFT JOIN tenant_details td ON t.id = td.tenant_id
                LEFT JOIN pgs p ON td.pg_id = p.id
                LEFT JOIN rooms r ON td.room_id = r.id
                WHERE t.id = ? AND t.role = 'tenant'
                `,
                [tenantId]
            );
            connection.release();
            return tenants[0] || null;
        } catch (error) {
            console.error('Error getting tenant by ID:', error);
            return null;
        }
    }

    /**
     * Get all PGs for dropdown
     */
    async getAllPGs() {
        try {
            const connection = await db.getConnection();
            const [pgs] = await connection.execute(
                `
                SELECT 
                    id,
                    name,
                    address,
                    is_active
                FROM pgs
                WHERE is_active = 1
                ORDER BY name ASC
                `
            );
            connection.release();
            return pgs;
        } catch (error) {
            console.error('Error getting all PGs:', error);
            return [];
        }
    }

    /**
     * Send notification to recipients
     */
    async sendNotification(notificationData) {
        const {
            title,
            message,
            recipientType, // 'all', 'pg', 'individual'
            recipientIds, // Array of tenant IDs or PG IDs
            sendPush,
            sendEmail,
            adminId
        } = notificationData;

        try {
            let recipients = [];
            
            // Get recipients based on type
            switch (recipientType) {
                case 'all':
                    recipients = await this.getAllTenants();
                    break;
                case 'pg':
                    // Get all tenants in selected PGs
                    for (const pgId of recipientIds) {
                        const pgTenants = await this.getTenantsByPG(pgId);
                        recipients = [...recipients, ...pgTenants];
                    }
                    break;
                case 'individual':
                    // Get specific tenants
                    for (const tenantId of recipientIds) {
                        const tenant = await this.getTenantById(tenantId);
                        if (tenant) recipients.push(tenant);
                    }
                    break;
                default:
                    throw new Error('Invalid recipient type');
            }

            // Remove duplicates (if any)
            const uniqueRecipients = [...new Map(recipients.map(r => [r.id.toString(), r])).values()];

            // Here you would integrate with your push notification service
            // Example: sendPushNotifications(uniqueRecipients, title, message)
            // Example: sendEmails(uniqueRecipients, title, message)

            // Log the notification
            const notificationLog = new AdminNotificationLog({
                title,
                message,
                recipientType,
                recipientCount: uniqueRecipients.length,
                recipientIds: uniqueRecipients.map(r => r.id),
                sentBy: adminId,
                channels: {
                    push: sendPush || false,
                    email: sendEmail || false
                },
                status: 'sent',
                sentAt: new Date()
            });

            await notificationLog.save();

            return {
                success: true,
                notificationId: notificationLog._id,
                recipientCount: uniqueRecipients.length
            };
        } catch (error) {
            throw new Error(`Failed to send notification: ${error.message}`);
        }
    }

    /**
     * Send notifications to multiple tenants (for backward compatibility with controller)
     * This method is used by admin.notification.controller.js
     */
    async sendNotificationsToTenants(tenantIds, type, notificationData, pushData = null) {
        try {
            if (!tenantIds || !Array.isArray(tenantIds) || tenantIds.length === 0) {
                throw new Error('Tenant IDs array is required');
            }

            console.log(`Sending ${type} notifications to ${tenantIds.length} tenants`);
            
            const connection = await db.getConnection();
            let insertedCount = 0;

            // Insert notifications for each tenant
            for (const tenantId of tenantIds) {
                try {
                    const [result] = await connection.execute(
                        `INSERT INTO notifications (
                            tenant_id, 
                            type, 
                            title, 
                            message, 
                            entity_id, 
                            entity_type, 
                            link, 
                            icon, 
                            color, 
                            is_read, 
                            created_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                        [
                            tenantId,
                            type || 'ADMIN_MESSAGE',
                            notificationData.title || 'Notification',
                            notificationData.message || '',
                            notificationData.entity_id || null,
                            notificationData.entity_type || 'admin_message',
                            notificationData.link || '/tenant-notifications',
                            notificationData.icon || '📢',
                            notificationData.color || '#3498db',
                            0 // is_read
                        ]
                    );
                    if (result.affectedRows > 0) {
                        insertedCount++;
                    }
                } catch (insertError) {
                    console.error(`Failed to insert notification for tenant ${tenantId}:`, insertError);
                    // Continue with next tenant even if one fails
                }
            }
            connection.release();

            // If push data is provided, send push notifications
            if (pushData && pushData.title && pushData.body) {
                try {
                    await this.sendPushNotifications(tenantIds, pushData.title, pushData.body);
                } catch (pushError) {
                    console.error('Failed to send push notifications:', pushError);
                    // Don't throw - we still want to return success for in-app notifications
                }
            }

            return insertedCount; // Return count of notifications successfully inserted
        } catch (error) {
            console.error('Error sending notifications to tenants:', error);
            throw new Error(`Failed to send notifications: ${error.message}`);
        }
    }

    /**
     * Send push notifications to tenants
     * @param {Array} tenantIds - Array of tenant IDs
     * @param {String} title - Push notification title
     * @param {String} body - Push notification body
     */
    async sendPushNotifications(tenantIds, title, body) {
        try {
            // Get FCM tokens for these tenants
            const connection = await db.getConnection();
            const placeholders = tenantIds.map(() => '?').join(',');
            const [tokens] = await connection.execute(
                `
                SELECT fcm_token 
                FROM tenant_devices 
                WHERE tenant_id IN (${placeholders}) 
                AND fcm_token IS NOT NULL
                `,
                tenantIds
            );
            connection.release();

            if (tokens.length === 0) {
                console.log('No FCM tokens found for these tenants');
                return;
            }

            // Implement your push notification logic here
            // Example: Send via FCM
            // const fcm = require('firebase-admin').messaging();
            // const messages = tokens.map(token => ({
            //     token: token.fcm_token,
            //     notification: {
            //         title: title,
            //         body: body
            //     }
            // }));
            // await fcm.sendAll(messages);

            console.log(`Push notifications would be sent to ${tokens.length} devices`);
            return tokens.length;
        } catch (error) {
            console.error('Error sending push notifications:', error);
            throw error;
        }
    }

    /**
     * Get notification history with pagination
     */
    async getHistory(limit = 20, skip = 0) {
        try {
            const notifications = await AdminNotificationLog
                .find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('sentBy', 'name email');

            const total = await AdminNotificationLog.countDocuments();

            return {
                notifications,
                total,
                limit,
                skip
            };
        } catch (error) {
            throw new Error(`Failed to get history: ${error.message}`);
        }
    }

    /**
     * Clear all notification history (Super Admin only)
     */
    async clearAllHistory() {
        try {
            const result = await AdminNotificationLog.deleteMany({});
            return {
                success: true,
                deletedCount: result.deletedCount
            };
        } catch (error) {
            throw new Error(`Failed to clear history: ${error.message}`);
        }
    }

    /**
     * Delete a specific notification log
     */
    async deleteNotificationLog(logId) {
        try {
            const result = await AdminNotificationLog.findByIdAndDelete(logId);
            if (!result) {
                throw new Error('Notification log not found');
            }
            return {
                success: true,
                deleted: result
            };
        } catch (error) {
            throw new Error(`Failed to delete notification log: ${error.message}`);
        }
    }
}

module.exports = new AdminNotificationService();