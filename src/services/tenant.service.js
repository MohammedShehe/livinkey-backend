const db = require("../config/db");
const bcrypt = require("bcrypt");
const TenantModel = require("../models/tenant.model");
const { uploadFile, deleteFile } = require("./upload.service");
const { sendWelcomeTenantEmail, sendEFRROExpiryTenantEmail, sendEFRROExpiryAdminEmail } = require("./mail.service");
const NotificationEventManager = require("../utils/notification.events");
const {
    generatePassword,
    normalizeNumberOfTenants,
    getTimeBasedGreeting
} = require("../utils/helpers");

// ============ INCREMENT ROOM OCCUPANCY ============
const incrementRoomOccupancy = async (connection, roomId, amount) => {
    await connection.execute(
        `
        INSERT INTO room_occupancy (room_id, occupied_count)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE occupied_count = occupied_count + ?
        `,
        [roomId, amount, amount]
    );
};

// ============ DECREMENT ROOM OCCUPANCY ============
const decrementRoomOccupancy = async (connection, roomId, amount) => {
    await connection.execute(
        `
        UPDATE room_occupancy
        SET occupied_count = GREATEST(0, occupied_count - ?)
        WHERE room_id = ?
        `,
        [amount, roomId]
    );
};

// ============ CREATE TENANT ============
const createTenant = async (tenantData, files = {}) => {
    const connection = await db.getConnection();
    let createdTenant = null;

    try {
        await connection.beginTransaction();

        // Lock room for occupancy update
        if (tenantData.role === 'tenant') {
            await connection.execute(
                `SELECT id FROM rooms WHERE id = ? FOR UPDATE`,
                [tenantData.room_id]
            );
        }

        // Check existing email
        const existingEmail = await TenantModel.findByEmail(tenantData.email);
        if (existingEmail) {
            throw new Error(`Email "${tenantData.email}" is already registered`);
        }

        // Check existing phone
        const existingPhone = await TenantModel.findByPhone(
            tenantData.country_code, 
            tenantData.phone
        );
        if (existingPhone) {
            throw new Error(`Phone number "${tenantData.country_code}${tenantData.phone}" is already registered`);
        }

        const numberOfTenants = normalizeNumberOfTenants(tenantData.number_of_tenants);

        // Check room availability
        if (tenantData.role === 'tenant') {
            const availability = await TenantModel.checkRoomAvailability(
                tenantData.room_id,
                numberOfTenants
            );
            if (!availability.available) {
                throw new Error(availability.message);
            }
        }

        // Generate password
        const plainPassword = generatePassword();
        const hashedPassword = await bcrypt.hash(plainPassword, 12);

        // Create tenant
        const tenantId = await TenantModel.createTenant(connection, {
            role: tenantData.role,
            full_name: tenantData.full_name,
            email: tenantData.email,
            nationality: tenantData.nationality,
            country_code: tenantData.country_code,
            phone: tenantData.phone,
            gender: tenantData.gender,
            password: hashedPassword,
            created_by: tenantData.created_by
        });

        // Create tenant details if tenant
        if (tenantData.role === 'tenant') {
            let documentUrl = null;
            let documentPublicId = null;
            let documentResourceType = null;

            if (files.document && files.document.length > 0) {
                const uploadResult = await uploadFile(
                    files.document[0],
                    "livinkey/tenants/documents"
                );
                if (uploadResult) {
                    documentUrl = uploadResult.secure_url;
                    documentPublicId = uploadResult.public_id;
                    documentResourceType = uploadResult.resource_type;
                }
            }

            await TenantModel.createTenantDetails(connection, {
                tenant_id: tenantId,
                pg_id: tenantData.pg_id,
                room_id: tenantData.room_id,
                residency: tenantData.residency,
                aadhaar_id: tenantData.aadhaar_id,
                father_aadhaar_id: tenantData.father_aadhaar_id,
                c_form_number: tenantData.c_form_number,
                efrro_from: tenantData.efrro_from,
                efrro_till: tenantData.efrro_till,
                rent: tenantData.rent,
                security_fee: tenantData.security_fee,
                payment_date: tenantData.payment_date,
                paid_from: tenantData.paid_from,
                paid_till: tenantData.paid_till,
                arrival_date: tenantData.arrival_date,
                document_url: documentUrl,
                document_public_id: documentPublicId,
                document_resource_type: documentResourceType
            });

            // Increment room occupancy
            try {
                await incrementRoomOccupancy(connection, tenantData.room_id, numberOfTenants);
            } catch (occupancyError) {
                if (occupancyError.code === 'ER_NO_SUCH_TABLE') {
                    console.warn('room_occupancy table does not exist; occupancy not tracked.');
                } else {
                    throw occupancyError;
                }
            }

            // Upload other documents
            if (files.otherDocuments && files.otherDocuments.length > 0) {
                for (const file of files.otherDocuments) {
                    const uploadResult = await uploadFile(
                        file,
                        "livinkey/tenants/documents"
                    );
                    if (uploadResult) {
                        await TenantModel.createTenantDocument(
                            connection,
                            tenantId,
                            uploadResult.secure_url,
                            uploadResult.public_id,
                            uploadResult.resource_type,
                            'id_proof'
                        );
                    }
                }
            }
        }

        await connection.commit();

        // Get PG and room info for email
        let pgName = null;
        let roomNumber = null;
        if (tenantData.role === 'tenant') {
            const [pgResult] = await connection.execute(
                `SELECT name FROM pgs WHERE id = ?`,
                [tenantData.pg_id]
            );
            pgName = pgResult[0]?.name || null;

            const [roomResult] = await connection.execute(
                `SELECT room_number FROM rooms WHERE id = ?`,
                [tenantData.room_id]
            );
            roomNumber = roomResult[0]?.room_number || null;
        }

        // Send welcome email
        try {
            await sendWelcomeTenantEmail(
                tenantData.email,
                tenantData.full_name,
                tenantData.role,
                plainPassword,
                pgName,
                roomNumber
            );
        } catch (emailError) {
            console.error("Failed to send welcome email:", emailError);
        }

        createdTenant = await TenantModel.getTenantWithDocuments(tenantId);

        // Send notifications
        try {
            if (tenantData.role === 'tenant') {
                await NotificationEventManager.onTenantCreated(createdTenant);
            } else {
                await NotificationEventManager.onGuestCreated(createdTenant);
            }
        } catch (notifError) {
            console.error("Failed to send tenant/guest notification:", notifError);
        }

        return createdTenant;

    } catch (error) {
        await connection.rollback();
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error("This tenant (email or phone) was already just registered.");
        }
        console.error("Tenant Creation Error:", error);
        throw error;
    } finally {
        connection.release();
    }
};

// ============ GET ALL TENANTS ============
const getAllTenants = async (search = null, role = null, gender = null, bill_status = null, pg_id = null) => {
    return await TenantModel.findAll(search, role, gender, bill_status, pg_id);
};

// ============ GET TENANT BY ID ============
const getTenantById = async (tenantId) => {
    return await TenantModel.getTenantWithDocuments(tenantId);
};

// ============ GET TENANT STATS ============
const getTenantStats = async () => {
    return await TenantModel.getStats();
};

// ============ GET GUEST STATS ============
const getGuestStats = async () => {
    return await TenantModel.getGuestStats();
};

// ============ UPDATE TENANT ============
const updateTenant = async (tenantId, tenantData, files = {}) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const existingTenant = await TenantModel.findById(tenantId);
        if (!existingTenant) {
            throw new Error("Tenant not found");
        }

        // Check existing email
        const existingEmail = await TenantModel.findByEmail(tenantData.email, tenantId);
        if (existingEmail) {
            throw new Error(`Email "${tenantData.email}" is already registered`);
        }

        // Check existing phone
        const existingPhone = await TenantModel.findByPhone(
            tenantData.country_code, 
            tenantData.phone, 
            tenantId
        );
        if (existingPhone) {
            throw new Error(`Phone number "${tenantData.country_code}${tenantData.phone}" is already registered`);
        }

        // Update tenant
        await TenantModel.updateTenant(connection, tenantId, {
            full_name: tenantData.full_name,
            email: tenantData.email,
            nationality: tenantData.nationality,
            country_code: tenantData.country_code,
            phone: tenantData.phone,
            gender: tenantData.gender
        });

        if (tenantData.role === 'tenant') {
            const numberOfTenants = normalizeNumberOfTenants(tenantData.number_of_tenants);
            const roomChanged = existingTenant.room_id !== tenantData.room_id;

            if (roomChanged) {
                await connection.execute(
                    `SELECT id FROM rooms WHERE id IN (?, ?) FOR UPDATE`,
                    [existingTenant.room_id, tenantData.room_id]
                );

                const availability = await TenantModel.checkRoomAvailability(
                    tenantData.room_id,
                    numberOfTenants
                );
                if (!availability.available) {
                    throw new Error(availability.message);
                }
            }

            // Handle document update
            let documentUrl = existingTenant.document_url;
            let documentPublicId = existingTenant.document_public_id;
            let documentResourceType = existingTenant.document_resource_type;

            if (files.document && files.document.length > 0) {
                if (existingTenant.document_public_id) {
                    try {
                        await deleteFile(
                            existingTenant.document_public_id,
                            existingTenant.document_resource_type
                        );
                    } catch (error) {
                        console.error("Failed to delete old document:", error);
                    }
                }

                const uploadResult = await uploadFile(
                    files.document[0],
                    "livinkey/tenants/documents"
                );
                if (uploadResult) {
                    documentUrl = uploadResult.secure_url;
                    documentPublicId = uploadResult.public_id;
                    documentResourceType = uploadResult.resource_type;
                }
            }

            // Update tenant details
            await TenantModel.updateTenantDetails(connection, tenantId, {
                residency: tenantData.residency,
                aadhaar_id: tenantData.aadhaar_id,
                father_aadhaar_id: tenantData.father_aadhaar_id,
                c_form_number: tenantData.c_form_number,
                efrro_from: tenantData.efrro_from,
                efrro_till: tenantData.efrro_till,
                rent: tenantData.rent,
                security_fee: tenantData.security_fee,
                payment_date: tenantData.payment_date,
                paid_from: tenantData.paid_from,
                paid_till: tenantData.paid_till,
                arrival_date: tenantData.arrival_date
            });

            // Handle room change
            if (roomChanged) {
                try {
                    await decrementRoomOccupancy(connection, existingTenant.room_id, numberOfTenants);
                    await incrementRoomOccupancy(connection, tenantData.room_id, numberOfTenants);
                } catch (occupancyError) {
                    if (occupancyError.code === 'ER_NO_SUCH_TABLE') {
                        console.warn('room_occupancy table does not exist; occupancy not tracked.');
                    } else {
                        throw occupancyError;
                    }
                }

                await connection.execute(
                    `UPDATE tenant_details SET room_id = ? WHERE tenant_id = ?`,
                    [tenantData.room_id, tenantId]
                );
            }

            // Handle other documents
            if (files.otherDocuments && files.otherDocuments.length > 0) {
                const oldDocuments = await TenantModel.getTenantDocuments(tenantId);
                for (const doc of oldDocuments) {
                    try {
                        await deleteFile(doc.document_public_id, doc.document_resource_type);
                    } catch (error) {
                        console.error("Failed to delete old additional document:", error);
                    }
                }

                await TenantModel.deleteTenantDocuments(connection, tenantId);

                for (const file of files.otherDocuments) {
                    const uploadResult = await uploadFile(
                        file,
                        "livinkey/tenants/documents"
                    );
                    if (uploadResult) {
                        await TenantModel.createTenantDocument(
                            connection,
                            tenantId,
                            uploadResult.secure_url,
                            uploadResult.public_id,
                            uploadResult.resource_type,
                            'id_proof'
                        );
                    }
                }
            }

            // Update document URL if new document uploaded
            if (files.document && files.document.length > 0) {
                await connection.execute(
                    `
                    UPDATE tenant_details
                    SET
                        document_url = ?,
                        document_public_id = ?,
                        document_resource_type = ?
                    WHERE tenant_id = ?
                    `,
                    [documentUrl, documentPublicId, documentResourceType, tenantId]
                );
            }
        }

        await connection.commit();

        const updatedTenant = await TenantModel.getTenantWithDocuments(tenantId);
        return updatedTenant;

    } catch (error) {
        await connection.rollback();
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error("This tenant (email or phone) was already just updated elsewhere.");
        }
        console.error("Tenant Update Error:", error);
        throw error;
    } finally {
        connection.release();
    }
};

// ============ DELETE TENANT ============
const deleteTenant = async (tenantId) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const tenant = await TenantModel.findById(tenantId);
        if (!tenant) {
            throw new Error("Tenant not found");
        }

        // Delete main document
        if (tenant.document_public_id) {
            try {
                await deleteFile(
                    tenant.document_public_id,
                    tenant.document_resource_type
                );
            } catch (error) {
                console.error("Failed to delete main document:", error);
            }
        }

        // Delete other documents
        const documents = await TenantModel.getTenantDocuments(tenantId);
        for (const doc of documents) {
            try {
                await deleteFile(doc.document_public_id, doc.document_resource_type);
            } catch (error) {
                console.error("Failed to delete additional document:", error);
            }
        }

        // Decrement room occupancy
        if (tenant.room_id) {
            try {
                await decrementRoomOccupancy(connection, tenant.room_id, 1);
            } catch (occupancyError) {
                if (occupancyError.code === 'ER_NO_SUCH_TABLE') {
                    console.warn('room_occupancy table does not exist; occupancy not tracked.');
                } else {
                    throw occupancyError;
                }
            }
        }

        // Delete tenant
        await TenantModel.deleteTenant(connection, tenantId);

        await connection.commit();
        return true;

    } catch (error) {
        await connection.rollback();
        console.error("Tenant Delete Error:", error);
        throw error;
    } finally {
        connection.release();
    }
};

// ============ CHECK AND SEND E-FRRO EXPIRY NOTIFICATIONS ============
const checkAndSendEFRROExpiryNotifications = async () => {
    try {
        console.log("Checking e-FRRO expiry notifications...");
        
        const expiringTenants = await TenantModel.getTenantsWithExpiringEFRRO();
        
        if (expiringTenants.length === 0) {
            console.log("No tenants with e-FRRO expiring within 30 days.");
            return { sent: 0, message: "No tenants with e-FRRO expiring soon." };
        }

        console.log(`Found ${expiringTenants.length} tenant(s) with e-FRRO expiring within 30 days.`);
        
        let tenantEmailsSent = 0;
        let tenantEmailErrors = 0;
        
        for (const tenant of expiringTenants) {
            try {
                await sendEFRROExpiryTenantEmail(
                    tenant.email,
                    tenant.full_name,
                    tenant
                );
                tenantEmailsSent++;
                console.log(`e-FRRO expiry email sent to ${tenant.full_name} (${tenant.email})`);
            } catch (error) {
                tenantEmailErrors++;
                console.error(`Failed to send e-FRRO expiry email to ${tenant.full_name}:`, error.message);
            }
        }

        // Send report to super admins
        const superAdmins = await TenantModel.getSuperAdmins();
        let adminEmailsSent = 0;
        let adminEmailErrors = 0;

        if (superAdmins.length > 0) {
            for (const admin of superAdmins) {
                try {
                    await sendEFRROExpiryAdminEmail(
                        admin.email,
                        admin.full_name,
                        expiringTenants
                    );
                    adminEmailsSent++;
                    console.log(`e-FRRO expiry report sent to super admin ${admin.full_name} (${admin.email})`);
                } catch (error) {
                    adminEmailErrors++;
                    console.error(`Failed to send e-FRRO expiry report to super admin ${admin.full_name}:`, error.message);
                }
            }
        }

        return {
            sent: tenantEmailsSent + adminEmailsSent,
            tenantEmailsSent,
            tenantEmailErrors,
            adminEmailsSent,
            adminEmailErrors,
            totalTenants: expiringTenants.length,
            tenantDetails: expiringTenants.map(t => ({
                name: t.full_name,
                email: t.email,
                daysUntilExpiry: t.days_until_expiry,
                expiryDate: t.efrro_till
            }))
        };

    } catch (error) {
        console.error("Error in checkAndSendEFRROExpiryNotifications:", error);
        throw error;
    }
};

// ============ GET E-FRRO STATS ============
const getEFRROStats = async () => {
    return await TenantModel.getEFRROStats();
};

// ============ GET E-FRRO EXPIRING LIST ============
const getEFRROExpiringList = async (daysRange = null) => {
    return await TenantModel.getEFRROExpiringList(daysRange);
};

module.exports = {
    createTenant,
    getAllTenants,
    getTenantById,
    getTenantStats,
    getGuestStats,
    updateTenant,
    deleteTenant,
    checkAndSendEFRROExpiryNotifications,
    getEFRROStats,
    getEFRROExpiringList
};