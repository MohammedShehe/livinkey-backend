const db = require("../config/db");
const Admin = require("../models/admin.model");
const NotificationEventManager = require("../utils/notification.events");

const createAdmin = async (adminData) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const adminId = await Admin.createAdmin(
            connection,
            adminData
        );

        await Admin.createDefaultPermissions(
            connection,
            adminId
        );

        await connection.commit();

        // Get the created admin details for notification
        const admin = await Admin.getAdminById(adminId);
        
        // Send admin creation notification
        try {
            await NotificationEventManager.onAdminCreated(admin, adminData.created_by);
        } catch (notifError) {
            console.error("Failed to send admin creation notification:", notifError);
        }

        return adminId;

    } catch (error) {
        await connection.rollback();
        throw error;

    } finally {
        connection.release();
    }
};

const updatePermissions = async (adminId, permissions) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const validModules = [
            "tenants",
            "guests",
            "bills",
            "pgs",
            "maintenance",
            "documents",
            "feedbacks"
        ];

        for (const moduleName of Object.keys(permissions)) {
            if (!validModules.includes(moduleName)) {
                throw new Error(
                    `Invalid module: ${moduleName}`
                );
            }

            const permission = permissions[moduleName];
            const result = await Admin.updatePermission(
                connection,
                adminId,
                moduleName,
                permission
            );

            if (result.affectedRows === 0) {
                throw new Error(
                    `Permission row not found for ${moduleName}`
                );
            }
        }

        await connection.commit();

    } catch (error) {
        await connection.rollback();
        throw error;

    } finally {
        connection.release();
    }
};

module.exports = {
    createAdmin,
    updatePermissions
};