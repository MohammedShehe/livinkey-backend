const db = require("../config/db");
const adminNotificationService = require("../services/admin.notification.service");
const mailService = require("../services/mail.service");
const NotificationEventManager = require("../utils/notification.events");

/**
 * Send notification to tenants (individual, by PG, or all)
 * POST /api/admin-notifications/send
 */
exports.sendTenantNotification = async (req, res) => {
    try {
        const adminId = req.admin.id;
        const {
            recipient_type, // 'individual', 'pg', 'all'
            tenant_ids, // array of tenant IDs (for individual)
            pg_ids, // array of PG IDs (for pg)
            title,
            message,
            send_push = true,
            send_email = false
        } = req.body;

        // Validate required fields
        if (!recipient_type || !['individual', 'pg', 'all'].includes(recipient_type)) {
            return res.status(400).json({
                success: false,
                message: "Valid recipient_type is required: 'individual', 'pg', or 'all'"
            });
        }

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Title is required"
            });
        }

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message is required"
            });
        }

        let tenantIds = [];

        // Get tenant IDs based on recipient type
        if (recipient_type === 'individual') {
            if (!tenant_ids || !Array.isArray(tenant_ids) || tenant_ids.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "tenant_ids array is required for individual notifications"
                });
            }
            tenantIds = tenant_ids.map(id => parseInt(id));
        } else if (recipient_type === 'pg') {
            if (!pg_ids || !Array.isArray(pg_ids) || pg_ids.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "pg_ids array is required for PG-based notifications"
                });
            }

            const connection = await db.getConnection();
            const placeholders = pg_ids.map(() => '?').join(',');
            const [tenants] = await connection.execute(
                `
                SELECT DISTINCT t.id 
                FROM tenants t
                INNER JOIN tenant_details td ON t.id = td.tenant_id
                WHERE t.role = 'tenant' 
                AND t.is_active = 1 
                AND td.pg_id IN (${placeholders})
                `,
                pg_ids
            );
            connection.release();

            tenantIds = tenants.map(t => t.id);
        } else if (recipient_type === 'all') {
            const connection = await db.getConnection();
            const [tenants] = await connection.execute(
                `
                SELECT id FROM tenants 
                WHERE role = 'tenant' AND is_active = 1
                `
            );
            connection.release();
            tenantIds = tenants.map(t => t.id);
        }

        if (tenantIds.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No active tenants found for the selected recipients"
            });
        }

        // Create notification data
        const notificationData = {
            title: title.trim(),
            message: message.trim(),
            entity_id: null,
            entity_type: 'admin_message',
            link: '/tenant-notifications',
            icon: '📢',
            color: '#3498db'
        };

        // Send in-app notifications to all selected tenants
        const sentCount = await adminNotificationService.sendNotificationsToTenants(
            tenantIds,
            'ADMIN_MESSAGE',
            notificationData,
            send_push ? { title: title.trim(), body: message.trim() } : null
        );

        // Also send emails if requested
        let emailSentCount = 0;
        if (send_email) {
            const connection = await db.getConnection();
            const [tenants] = await connection.execute(
                `
                SELECT id, full_name, email 
                FROM tenants 
                WHERE id IN (${tenantIds.map(() => '?').join(',')})
                `,
                tenantIds
            );
            connection.release();

            for (const tenant of tenants) {
                try {
                    await mailService.sendCustomAdminNotificationEmail(
                        tenant.email,
                        tenant.full_name,
                        title.trim(),
                        message.trim(),
                        req.admin.name || 'Livinkey Admin'
                    );
                    emailSentCount++;
                } catch (emailError) {
                    console.error(`Failed to send email to ${tenant.email}:`, emailError);
                }
            }
        }

        // Log the notification
        const connection = await db.getConnection();
        await connection.execute(
            `
            INSERT INTO admin_notification_logs (
                admin_id,
                recipient_type,
                recipient_count,
                title,
                message,
                send_push,
                send_email,
                sent_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            `,
            [
                adminId,
                recipient_type,
                tenantIds.length,
                title.trim(),
                message.trim(),
                send_push ? 1 : 0,
                send_email ? 1 : 0
            ]
        );
        connection.release();

        return res.status(200).json({
            success: true,
            message: `Notification sent successfully`,
            data: {
                total_tenants: tenantIds.length,
                in_app_sent: sentCount,
                email_sent: emailSentCount,
                recipient_type: recipient_type
            }
        });

    } catch (error) {
        console.error("Send Tenant Notification Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * Get notification history (admin logs)
 * GET /api/admin-notifications/history
 * 
 * FIXED: Properly parse limit and offset as integers before using in query
 * MySQL's prepared statement protocol doesn't accept bound parameters for LIMIT/OFFSET
 * when using execute() with placeholders. We need to inline them after validation.
 */
exports.getNotificationHistory = async (req, res) => {
    try {
        // Parse and validate limit and offset as integers
        let limit = parseInt(req.query.limit) || 50;
        let offset = parseInt(req.query.offset) || 0;
        
        // Ensure valid ranges
        if (limit < 1) limit = 1;
        if (limit > 500) limit = 500; // Max 500 records per request
        if (offset < 0) offset = 0;
        
        const adminId = req.admin.id;

        const connection = await db.getConnection();
        
        // NOTE: LIMIT and OFFSET are inlined (not bound as ?) because mysql2's
        // prepared-statement protocol (execute) can throw ER_WRONG_ARGUMENTS
        // when binding LIMIT/OFFSET. Safe here since both values are validated
        // integers above and never derived from raw user input.
        const [logs] = await connection.execute(
            `
            SELECT 
                nl.*,
                a.name as admin_name
            FROM admin_notification_logs nl
            LEFT JOIN admins a ON nl.admin_id = a.id
            ORDER BY nl.sent_at DESC
            LIMIT ${limit} OFFSET ${offset}
            `
        );
        connection.release();

        return res.status(200).json({
            success: true,
            count: logs.length,
            data: logs
        });

    } catch (error) {
        console.error("Get Notification History Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * ============================================================
 * NEW: Delete a notification log by ID
 * DELETE /api/admin-notifications/:id
 * ============================================================
 */
exports.deleteNotificationLog = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.admin.id;
        
        // Validate ID
        const logId = parseInt(id);
        if (isNaN(logId) || logId < 1) {
            return res.status(400).json({
                success: false,
                message: "Invalid notification ID"
            });
        }

        const connection = await db.getConnection();
        
        // Check if the log exists and get its admin_id for permission check
        const [existing] = await connection.execute(
            `SELECT id, admin_id FROM admin_notification_logs WHERE id = ?`,
            [logId]
        );
        
        if (existing.length === 0) {
            connection.release();
            return res.status(404).json({
                success: false,
                message: "Notification log not found"
            });
        }
        
        // Super admins can delete any log, regular admins can only delete their own
        const isSuperAdmin = req.admin.role === 'super_admin';
        if (!isSuperAdmin && existing[0].admin_id !== adminId) {
            connection.release();
            return res.status(403).json({
                success: false,
                message: "You can only delete notifications that you sent"
            });
        }
        
        // Delete the log
        await connection.execute(
            `DELETE FROM admin_notification_logs WHERE id = ?`,
            [logId]
        );
        connection.release();

        return res.status(200).json({
            success: true,
            message: "Notification log deleted successfully"
        });

    } catch (error) {
        console.error("Delete Notification Log Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * ============================================================
 * NEW: Delete multiple notification logs
 * DELETE /api/admin-notifications
 * Body: { ids: [1, 2, 3] }
 * ============================================================
 */
exports.deleteMultipleNotificationLogs = async (req, res) => {
    try {
        const { ids } = req.body;
        const adminId = req.admin.id;
        const isSuperAdmin = req.admin.role === 'super_admin';

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide an array of notification IDs to delete"
            });
        }

        // Validate all IDs are numbers
        const logIds = ids.map(id => parseInt(id)).filter(id => !isNaN(id) && id > 0);
        if (logIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid notification IDs provided"
            });
        }

        const connection = await db.getConnection();
        
        // For regular admins, check ownership
        if (!isSuperAdmin) {
            const placeholders = logIds.map(() => '?').join(',');
            const [logs] = await connection.execute(
                `
                SELECT id FROM admin_notification_logs 
                WHERE id IN (${placeholders}) AND admin_id = ?
                `,
                [...logIds, adminId]
            );
            
            if (logs.length !== logIds.length) {
                connection.release();
                return res.status(403).json({
                    success: false,
                    message: "You can only delete notifications that you sent"
                });
            }
        }

        // Delete the logs
        const placeholders = logIds.map(() => '?').join(',');
        const [result] = await connection.execute(
            `DELETE FROM admin_notification_logs WHERE id IN (${placeholders})`,
            logIds
        );
        connection.release();

        return res.status(200).json({
            success: true,
            message: `${result.affectedRows} notification log(s) deleted successfully`,
            deleted_count: result.affectedRows
        });

    } catch (error) {
        console.error("Delete Multiple Notification Logs Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * Get PGs with tenant counts (for filter dropdown)
 * GET /api/admin-notifications/pg-list
 */
exports.getPGList = async (req, res) => {
    try {
        const connection = await db.getConnection();
        const [pgs] = await connection.execute(
            `
            SELECT 
                p.id,
                p.name,
                COUNT(DISTINCT t.id) as tenant_count
            FROM pgs p
            LEFT JOIN tenant_details td ON p.id = td.pg_id
            LEFT JOIN tenants t ON td.tenant_id = t.id AND t.role = 'tenant' AND t.is_active = 1
            WHERE p.is_active = 1
            GROUP BY p.id, p.name
            ORDER BY p.name ASC
            `
        );
        connection.release();

        return res.status(200).json({
            success: true,
            data: pgs.map(pg => ({
                ...pg,
                tenant_count: parseInt(pg.tenant_count) || 0
            }))
        });

    } catch (error) {
        console.error("Get PG List Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * Get tenants by PG (for individual selection)
 * GET /api/admin-notifications/tenants-by-pg/:pgId
 */
exports.getTenantsByPG = async (req, res) => {
    try {
        const { pgId } = req.params;
        const { search } = req.query;

        let query = `
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
        `;
        const params = [pgId];

        if (search) {
            query += ` AND (t.full_name LIKE ? OR t.email LIKE ?)`;
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern);
        }

        query += ` ORDER BY t.full_name ASC`;

        const connection = await db.getConnection();
        const [tenants] = await connection.execute(query, params);
        connection.release();

        return res.status(200).json({
            success: true,
            data: tenants
        });

    } catch (error) {
        console.error("Get Tenants By PG Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * Get all active tenants (for individual selection)
 * GET /api/admin-notifications/all-tenants
 */
exports.getAllTenants = async (req, res) => {
    try {
        const { search } = req.query;

        let query = `
            SELECT 
                t.id,
                t.full_name,
                t.email,
                t.phone,
                p.name as pg_name,
                r.room_number
            FROM tenants t
            LEFT JOIN tenant_details td ON t.id = td.tenant_id
            LEFT JOIN pgs p ON td.pg_id = p.id
            LEFT JOIN rooms r ON td.room_id = r.id
            WHERE t.role = 'tenant' 
            AND t.is_active = 1
        `;
        const params = [];

        if (search) {
            query += ` AND (t.full_name LIKE ? OR t.email LIKE ? OR p.name LIKE ?)`;
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        query += ` ORDER BY t.full_name ASC`;

        const connection = await db.getConnection();
        const [tenants] = await connection.execute(query, params);
        connection.release();

        return res.status(200).json({
            success: true,
            data: tenants
        });

    } catch (error) {
        console.error("Get All Tenants Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};