const db = require("../config/db");
const MaintenanceModel = require("../models/maintenance.model");
const TenantModel = require("../models/tenant.model");
const { uploadFile, deleteFile } = require("./upload.service");
const NotificationEventManager = require("../utils/notification.events");

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

const updateRequestStatus = async (requestId, status) => {
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

        const updated = await MaintenanceModel.updateRequestStatus(connection, requestId, status);

        await connection.commit();

        if (updated > 0) {
            const updatedRequest = await MaintenanceModel.getRequestById(requestId);
            
            // Send notification to tenant
            try {
                await NotificationEventManager.onMaintenanceStatusUpdated(updatedRequest);
            } catch (notifError) {
                console.error("Failed to send maintenance status notification:", notifError);
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
    deleteRequest
};