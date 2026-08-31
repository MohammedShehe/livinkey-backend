const AdminNotificationLog = require('../models/admin.notification.log.model');
const db = require("../config/db");
const firebaseService = require("./firebase.service");

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
     * Get total tenants
     */
    async getTotalTenants() {
        return 0;
    }

    /**
     * Get total PGs
     */
    async getTotalPGs() {
        return 0;
    }

    /**
     * Get all tenants with their PG info
     */
    async getAllTenants() {
        return [];
    }

    /**
     * Get tenants by PG ID
     */
    async getTenantsByPG(pgId) {
        return [];
    }

    /**
     * Get tenant by ID
     */
    async getTenantById(tenantId) {
        return null;
    }

    /**
     * Get all PGs for dropdown
     */
    async getAllPGs() {
        return [];
    }

    /**
     * Send notification to recipients
     */
    async sendNotification(notificationData) {
        const {
            title,
            message,
            recipientType,
            recipientIds,
            sendPush,
            sendEmail,
            adminId
        } = notificationData;

        try {
            let recipients = [];
            
            switch (recipientType) {
                case 'all':
                    recipients = await this.getAllTenants();
                    break;
                case 'pg':
                    for (const pgId of recipientIds) {
                        const pgTenants = await this.getTenantsByPG(pgId);
                        recipients = [...recipients, ...pgTenants];
                    }
                    break;
                case 'individual':
                    for (const tenantId of recipientIds) {
                        const tenant = await this.getTenantById(tenantId);
                        if (tenant) recipients.push(tenant);
                    }
                    break;
                default:
                    throw new Error('Invalid recipient type');
            }

            const uniqueRecipients = [...new Map(recipients.map(r => [r._id.toString(), r])).values()];

            const notificationLog = new AdminNotificationLog({
                title,
                message,
                recipientType,
                recipientCount: uniqueRecipients.length,
                recipientIds: uniqueRecipients.map(r => r._id),
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
     * Send notifications to multiple tenants with push notification support
     */
    async sendNotificationsToTenants(tenantIds, type, notificationData, pushData = null) {
        if (!tenantIds || !Array.isArray(tenantIds) || tenantIds.length === 0) {
            throw new Error('Tenant IDs array is required');
        }

        const connection = await db.getConnection();
        let insertedCount = 0;
        let pushResult = null;

        try {
            // Insert notifications into database
            for (const tenantId of tenantIds) {
                const [result] = await connection.execute(
                    `INSERT INTO tenant_notifications (
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
                        type || 'admin_message',
                        notificationData.title || 'Notification',
                        notificationData.message || '',
                        notificationData.entity_id || null,
                        notificationData.entity_type || 'admin_message',
                        notificationData.link || '/tenant-notifications',
                        notificationData.icon || '📢',
                        notificationData.color || '#3498db',
                        0
                    ]
                );
                
                if (result.affectedRows > 0) {
                    insertedCount++;
                }
            }

            connection.release();

            // Send push notifications if push data is provided
            if (pushData && pushData.title && pushData.body) {
                try {
                    // Get FCM tokens for these tenants
                    const tokenConn = await db.getConnection();
                    const placeholders = tenantIds.map(() => '?').join(',');
                    const [tokens] = await tokenConn.execute(
                        `SELECT DISTINCT fcm_token 
                         FROM tenant_devices 
                         WHERE tenant_id IN (${placeholders}) 
                         AND fcm_token IS NOT NULL 
                         AND is_active = 1`,
                        tenantIds
                    );
                    tokenConn.release();

                    if (tokens.length > 0) {
                        const fcmTokens = tokens.map(t => t.fcm_token);
                        
                        // Send push notifications using firebase service
                        pushResult = await firebaseService.sendPushNotificationToMultiple(
                            fcmTokens,
                            {
                                title: pushData.title,
                                body: pushData.body
                            },
                            {
                                type: type || 'admin_message',
                                entity_id: notificationData.entity_id || '',
                                action: 'open',
                                screen: 'notifications'
                            }
                        );
                        
                        console.log('Push notification sent:', {
                            totalTokens: fcmTokens.length,
                            successCount: pushResult ? pushResult.successCount : 0,
                            failureCount: pushResult ? pushResult.failureCount : 0
                        });
                    } else {
                        console.log('No active FCM tokens found for tenants:', tenantIds);
                    }
                } catch (pushError) {
                    console.error('Failed to send push notifications:', pushError);
                    // Don't throw - we still want to return success for in-app notifications
                }
            }

            return {
                insertedCount,
                pushResult
            };
        } catch (error) {
            connection.release();
            throw new Error(`Failed to send notifications: ${error.message}`);
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