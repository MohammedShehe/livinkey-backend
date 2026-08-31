const AdminNotificationLog = require('../models/admin.notification.log.model');

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
        // Replace with actual Tenant model query
        // Example: return await Tenant.countDocuments({ status: 'active' });
        return 0; // Placeholder
    }

    /**
     * Get total PGs (implement based on your PG model)
     */
    async getTotalPGs() {
        // Replace with actual PG model query
        // Example: return await PG.countDocuments({ status: 'active' });
        return 0; // Placeholder
    }

    /**
     * Get all tenants with their PG info
     */
    async getAllTenants() {
        // Replace with actual Tenant model query with population
        // Example: return await Tenant.find().populate('pgId');
        return []; // Placeholder
    }

    /**
     * Get tenants by PG ID
     */
    async getTenantsByPG(pgId) {
        // Replace with actual query
        // Example: return await Tenant.find({ pgId, status: 'active' });
        return []; // Placeholder
    }

    /**
     * Get tenant by ID
     */
    async getTenantById(tenantId) {
        // Replace with actual query
        // Example: return await Tenant.findById(tenantId);
        return null; // Placeholder
    }

    /**
     * Get all PGs for dropdown
     */
    async getAllPGs() {
        // Replace with actual PG model query
        // Example: return await PG.find({ status: 'active' }, 'name _id');
        return []; // Placeholder
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
            const uniqueRecipients = [...new Map(recipients.map(r => [r._id.toString(), r])).values()];

            // Here you would integrate with your push notification service
            // Example: sendPushNotifications(uniqueRecipients, title, message)
            // Example: sendEmails(uniqueRecipients, title, message)

            // Log the notification
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
     * ============================================================
     * FIX: Added this method to handle controller requests
     * This is called by admin.notification.controller.js
     * ============================================================
     */
    async sendNotificationsToTenants(tenantIds, type, notificationData, pushData = null) {
        try {
            if (!tenantIds || !Array.isArray(tenantIds) || tenantIds.length === 0) {
                throw new Error('Tenant IDs array is required');
            }

            console.log(`Sending ${type} notifications to ${tenantIds.length} tenants`);

            // Create notification log entries for each tenant
            const notifications = tenantIds.map(tenantId => ({
                tenantId: tenantId,
                type: type,
                title: notificationData.title,
                message: notificationData.message,
                entity_id: notificationData.entity_id || null,
                entity_type: notificationData.entity_type || 'admin_message',
                link: notificationData.link || '/tenant-notifications',
                icon: notificationData.icon || '📢',
                color: notificationData.color || '#3498db',
                isRead: false,
                createdAt: new Date()
            }));

            // Here you would insert these into your notifications table
            // For now, we'll just log and return the count
            console.log(`Would create ${notifications.length} notification records`);

            // If push data is provided, handle push notifications
            if (pushData && pushData.title && pushData.body) {
                console.log(`Would send push notifications to ${tenantIds.length} tenants`);
                // Your push notification logic here
            }

            // Return the count of tenants
            return tenantIds.length;
        } catch (error) {
            console.error('Error in sendNotificationsToTenants:', error);
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