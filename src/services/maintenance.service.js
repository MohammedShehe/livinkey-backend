const db = require("../config/db");
const MaintenanceModel = require("../models/maintenance.model");
const TenantModel = require("../models/tenant.model");
const { uploadFile, deleteFile } = require("./upload.service");
const NotificationEventManager = require("../utils/notification.events");
const { sendMaintenanceCompletionReminder } = require("./mail.service");
const firebase = require("../config/firebase");

const createMaintenanceRequest = async (tenantId, requestData, file = null) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Check if tenant exists
        const tenant = await TenantModel.findById(tenantId);
        if (!tenant) {
            throw new Error("Tenant not found");
        }

        if (!tenant.room_id) {
            throw new Error("No room assigned to this tenant");
        }

        let imageUrl = null;
        let imagePublicId = null;
        let imageResourceType = null;

        // Upload image if provided
        if (file) {
            const uploadResult = await uploadFile(
                file,
                `livinkey/maintenance/${tenantId}`
            );
            if (uploadResult) {
                imageUrl = uploadResult.secure_url;
                imagePublicId = uploadResult.public_id;
                imageResourceType = uploadResult.resource_type || 'image';
            }
        }

        // Create maintenance request
        const requestId = await MaintenanceModel.createMaintenanceRequest(connection, {
            tenant_id: tenantId,
            room_id: tenant.room_id,
            issue_type: requestData.issue_type,
            description: requestData.description || null,
            service_date: requestData.service_date,
            free_time: requestData.free_time || null,
            image_url: imageUrl,
            image_public_id: imagePublicId,
            image_resource_type: imageResourceType,
            created_by: tenantId
        });

        await connection.commit();

        const request = await MaintenanceModel.getRequestById(requestId);

        // Send notification to admins
        try {
            await NotificationEventManager.onMaintenanceCreated(request);
        } catch (notifError) {
            console.error("Failed to send maintenance notification:", notifError);
        }

        // Send notification to tenant (NEW)
        try {
            await NotificationEventManager.onTenantMaintenanceCreated(request);
        } catch (notifError) {
            console.error("Failed to send tenant maintenance notification:", notifError);
        }

        return request;

    } catch (error) {
        await connection.rollback();
        console.error("Create Maintenance Request Error:", error);
        throw error;

    } finally {
        connection.release();
    }
};

const getTenantRequests = async (tenantId, status = null) => {
    return await MaintenanceModel.getRequestsByTenant(tenantId, status);
};

const getTenantStats = async (tenantId) => {
    return await MaintenanceModel.getTenantStats(tenantId);
};

const getRequestById = async (requestId) => {
    return await MaintenanceModel.getRequestById(requestId);
};

const getAllRequests = async (filters = {}) => {
    return await MaintenanceModel.getAllRequests(filters);
};

const getAdminStats = async (filters = {}) => {
    return await MaintenanceModel.getAdminStats(filters);
};

const updateRequestStatus = async (requestId, status, completedBy = null) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const request = await MaintenanceModel.getRequestById(requestId);
        if (!request) {
            throw new Error("Maintenance request not found");
        }

        // Validate status transition
        if (status === 'in_progress' && request.status !== 'pending') {
            throw new Error("Only pending requests can be started");
        }

        if (status === 'completed' && request.status !== 'in_progress') {
            throw new Error("Only in-progress requests can be completed");
        }

        // Track who completed it (for logging)
        let completedByValue = null;
        if (status === 'completed' && completedBy) {
            completedByValue = completedBy;
        }

        const updated = await MaintenanceModel.updateRequestStatus(
            connection, 
            requestId, 
            status,
            completedByValue
        );

        await connection.commit();

        if (updated > 0) {
            const updatedRequest = await MaintenanceModel.getRequestById(requestId);
            
            // Send notification to admins
            try {
                await NotificationEventManager.onMaintenanceStatusUpdated(updatedRequest);
            } catch (notifError) {
                console.error("Failed to send maintenance status notification:", notifError);
            }

            // Send notification to tenant based on status (NEW)
            try {
                if (status === 'in_progress') {
                    await NotificationEventManager.onTenantMaintenanceStarted(updatedRequest);
                } else if (status === 'completed') {
                    await NotificationEventManager.onTenantMaintenanceCompleted(updatedRequest);
                }
            } catch (notifError) {
                console.error("Failed to send tenant maintenance status notification:", notifError);
            }
            
            return updatedRequest;
        }

        return null;

    } catch (error) {
        await connection.rollback();
        console.error("Update Request Status Error:", error);
        throw error;

    } finally {
        connection.release();
    }
};

// ============================================================
// NEW: Tenant completes a request (with validation)
// ============================================================
const completeRequestByTenant = async (requestId, tenantId) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const request = await MaintenanceModel.getRequestById(requestId);
        if (!request) {
            throw new Error("Maintenance request not found");
        }

        // Verify this tenant owns the request
        if (request.tenant_id !== tenantId) {
            throw new Error("Unauthorized: This request does not belong to you");
        }

        // Only in_progress requests can be completed
        if (request.status !== 'in_progress') {
            throw new Error(`Cannot complete a request with status "${request.status}". Only in-progress requests can be completed.`);
        }

        // Track who completed it
        const completedBy = `tenant_${tenantId}`;

        const updated = await MaintenanceModel.updateRequestStatus(
            connection, 
            requestId, 
            'completed',
            completedBy
        );

        await connection.commit();

        if (updated > 0) {
            const updatedRequest = await MaintenanceModel.getRequestById(requestId);
            
            // Send notification to admins
            try {
                await NotificationEventManager.onMaintenanceStatusUpdated(updatedRequest);
            } catch (notifError) {
                console.error("Failed to send maintenance status notification:", notifError);
            }

            // Send notification to tenant
            try {
                await NotificationEventManager.onTenantMaintenanceCompleted(updatedRequest);
            } catch (notifError) {
                console.error("Failed to send tenant maintenance completion notification:", notifError);
            }
            
            return updatedRequest;
        }

        return null;

    } catch (error) {
        await connection.rollback();
        console.error("Complete Request By Tenant Error:", error);
        throw error;

    } finally {
        connection.release();
    }
};

// ============================================================
// NEW: Check for in_progress requests older than 20 minutes
// and send push notifications to tenants
// ============================================================
const checkAndSendCompletionReminders = async () => {
    const connection = await db.getConnection();
    let sentCount = 0;
    const details = [];

    try {
        // Get all in_progress requests older than 20 minutes
        const [requests] = await connection.execute(
            `
            SELECT 
                mr.*,
                t.full_name as tenant_name,
                t.email as tenant_email,
                r.room_number,
                p.name as pg_name
            FROM maintenance_requests mr
            INNER JOIN tenants t ON mr.tenant_id = t.id
            INNER JOIN rooms r ON mr.room_id = r.id
            LEFT JOIN tenant_details td ON t.id = td.tenant_id
            LEFT JOIN pgs p ON td.pg_id = p.id
            WHERE mr.status = 'in_progress'
            AND mr.updated_at <= DATE_SUB(NOW(), INTERVAL 20 MINUTE)
            AND mr.completion_reminder_sent = 0
            `
        );

        for (const request of requests) {
            try {
                // Send push notification via Firebase FCM
                const fcmTokens = await firebase.getTenantFCMTokens(request.tenant_id);
                
                if (fcmTokens.length > 0) {
                    const notificationTitle = "🔧 Is your maintenance completed?";
                    const notificationBody = "Don't forget to mark your maintenance request as done!";
                    
                    await firebase.sendPushNotificationToMultiple(
                        fcmTokens,
                        {
                            title: notificationTitle,
                            body: notificationBody,
                        },
                        {
                            type: 'maintenance_reminder',
                            entity_id: request.id,
                            action: 'open_maintenance',
                        }
                    );
                }

                // Also send email reminder as fallback
                try {
                    const { sendMaintenanceCompletionReminder: sendReminderEmail } = require("./mail.service");
                    await sendReminderEmail(
                        request.tenant_email,
                        request.tenant_name,
                        {
                            id: request.id,
                            issue_type: request.issue_type,
                            room_number: request.room_number,
                            pg_name: request.pg_name
                        }
                    );
                } catch (emailError) {
                    console.error("Failed to send reminder email:", emailError);
                }

                // Mark reminder as sent
                await connection.execute(
                    `UPDATE maintenance_requests SET completion_reminder_sent = 1 WHERE id = ?`,
                    [request.id]
                );

                sentCount++;
                details.push({
                    request_id: request.id,
                    tenant_id: request.tenant_id,
                    tenant_name: request.tenant_name,
                    issue_type: request.issue_type
                });

            } catch (error) {
                console.error(`Failed to send completion reminder for request ${request.id}:`, error);
            }
        }

        return { sent: sentCount, details };

    } catch (error) {
        console.error("Check And Send Completion Reminders Error:", error);
        throw error;
    } finally {
        connection.release();
    }
};

const deleteRequest = async (requestId) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const request = await MaintenanceModel.getRequestById(requestId);
        if (!request) {
            throw new Error("Maintenance request not found");
        }

        // Delete image from Cloudinary if exists
        if (request.image_public_id) {
            try {
                await deleteFile(request.image_public_id, request.image_resource_type);
            } catch (error) {
                console.error("Failed to delete image from Cloudinary:", error);
            }
        }

        const deleted = await MaintenanceModel.deleteRequest(connection, requestId);

        await connection.commit();
        return deleted > 0;

    } catch (error) {
        await connection.rollback();
        console.error("Delete Request Error:", error);
        throw error;

    } finally {
        connection.release();
    }
};

module.exports = {
    createMaintenanceRequest,
    getTenantRequests,
    getTenantStats,
    getRequestById,
    getAllRequests,
    getAdminStats,
    updateRequestStatus,
    completeRequestByTenant,        // NEW
    checkAndSendCompletionReminders, // NEW
    deleteRequest
};