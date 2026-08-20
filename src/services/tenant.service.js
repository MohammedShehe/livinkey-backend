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

const createTenant = async (tenantData, files = {}) => {
    const connection = await db.getConnection();
    let createdTenant = null;

    try {
        await connection.beginTransaction();

        if (tenantData.role === 'tenant') {
            await connection.execute(
                `SELECT id FROM rooms WHERE id = ? FOR UPDATE`,
                [tenantData.room_id]
            );
        }

        const existingEmail = await TenantModel.findByEmail(tenantData.email);
        if (existingEmail) {
            throw new Error(`Email "${tenantData.email}" is already registered`);
        }

        const existingPhone = await TenantModel.findByPhone(
            tenantData.country_code, 
            tenantData.phone
        );
        if (existingPhone) {
            throw new Error(`Phone number "${tenantData.country_code}${tenantData.phone}" is already registered`);
        }

        const numberOfTenants = normalizeNumberOfTenants(tenantData.number_of_tenants);

        if (tenantData.role === 'tenant') {
            const availability = await TenantModel.checkRoomAvailability(
                tenantData.room_id,
                numberOfTenants
            );
            if (!availability.available) {
                throw new Error(availability.message);
            }
        }

        const plainPassword = generatePassword();
        const hashedPassword = await bcrypt.hash(plainPassword, 12);

        const tenantId = await TenantModel.createTenant(connection, {
            role: tenantData.role,
            full_name: tenantData.full_name,
            email: tenantData.email,
            nationality: tenantData.nationality,
            country_code: tenantData.country_code,
            phone: tenantData.phone,
            international_phone: tenantData.international_phone || null,
            gender: tenantData.gender,
            password: hashedPassword,
            created_by: tenantData.created_by,
            residency: tenantData.residency
        });

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

            try {
                await incrementRoomOccupancy(connection, tenantData.room_id, numberOfTenants);
            } catch (occupancyError) {
                if (occupancyError.code === 'ER_NO_SUCH_TABLE') {
                    console.warn('room_occupancy table does not exist; occupancy not tracked.');
                } else {
                    throw occupancyError;
                }
            }

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

const getAllTenants = async (search = null, role = null, gender = null, bill_status = null, pg_id = null) => {
    return await TenantModel.findAll(search, role, gender, bill_status, pg_id);
};

const getTenantById = async (tenantId) => {
    return await TenantModel.getTenantWithDocuments(tenantId);
};

const getTenantStats = async () => {
    return await TenantModel.getStats();
};

const getGuestStats = async () => {
    return await TenantModel.getGuestStats();
};

const updateTenant = async (tenantId, tenantData, files = {}) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const existingTenant = await TenantModel.findById(tenantId);
        if (!existingTenant) {
            throw new Error("Tenant not found");
        }

        const existingEmail = await TenantModel.findByEmail(tenantData.email, tenantId);
        if (existingEmail) {
            throw new Error(`Email "${tenantData.email}" is already registered`);
        }

        const existingPhone = await TenantModel.findByPhone(
            tenantData.country_code, 
            tenantData.phone, 
            tenantId
        );
        if (existingPhone) {
            throw new Error(`Phone number "${tenantData.country_code}${tenantData.phone}" is already registered`);
        }

        await TenantModel.updateTenant(connection, tenantId, {
            full_name: tenantData.full_name,
            email: tenantData.email,
            nationality: tenantData.nationality,
            country_code: tenantData.country_code,
            phone: tenantData.phone,
            international_phone: tenantData.international_phone || null,
            gender: tenantData.gender,
            residency: tenantData.residency
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

const deleteTenant = async (tenantId) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const tenant = await TenantModel.findById(tenantId);
        if (!tenant) {
            throw new Error("Tenant not found");
        }

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

        const documents = await TenantModel.getTenantDocuments(tenantId);
        for (const doc of documents) {
            try {
                await deleteFile(doc.document_public_id, doc.document_resource_type);
            } catch (error) {
                console.error("Failed to delete additional document:", error);
            }
        }

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

            // NEW: Push in-app notification to the tenant as well
            try {
                await NotificationEventManager.onTenantEFRROExpiry(tenant, tenant.days_until_expiry);
            } catch (notifError) {
                console.error(`Failed to send e-FRRO app notification to ${tenant.full_name}:`, notifError.message);
            }
        }

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

// ============================================================
// NEW: Check and send document reminder notifications
// Notifies tenants who are missing required documents based on
// their residency (national/international), matching the same
// document catalog used by tenant.document.service.js
// ============================================================
const checkAndSendDocumentReminders = async () => {
    try {
        console.log("Checking document reminders...");

        const [tenants] = await db.query(
            `
            SELECT id, full_name, email, residency
            FROM tenants
            WHERE role = 'tenant' AND is_active = 1
            `
        );

        if (tenants.length === 0) {
            return { sent: 0, message: "No active tenants found." };
        }

        const { INTERNATIONAL_DOCUMENTS, NATIONAL_DOCUMENTS } = require("../config/document.types");

        let notificationsSent = 0;
        const details = [];

        for (const tenant of tenants) {
            const requiredDocs = tenant.residency === 'international'
                ? INTERNATIONAL_DOCUMENTS.filter(d => d.required)
                : NATIONAL_DOCUMENTS.filter(d => d.required);

            const [uploadedDocs] = await db.query(
                `SELECT document_type FROM tenant_documents WHERE tenant_id = ?`,
                [tenant.id]
            );
            const uploadedTypes = uploadedDocs.map(d => d.document_type);

            const missingDocs = requiredDocs.filter(d => !uploadedTypes.includes(d.key));

            if (missingDocs.length > 0) {
                // Send one notification per tenant listing the first missing doc,
                // to avoid spamming with one notification per missing document.
                const docLabel = missingDocs.length === 1
                    ? missingDocs[0].label
                    : `${missingDocs[0].label} and ${missingDocs.length - 1} other document(s)`;

                try {
                    await NotificationEventManager.onTenantDocumentReminder(tenant, docLabel);
                    notificationsSent++;
                    details.push({ tenant: tenant.full_name, missing: missingDocs.map(d => d.label) });
                } catch (notifError) {
                    console.error(`Failed to send document reminder to ${tenant.full_name}:`, notifError.message);
                }
            }
        }

        console.log(`Document reminders sent: ${notificationsSent}`);
        return { sent: notificationsSent, totalChecked: tenants.length, details };

    } catch (error) {
        console.error("Error in checkAndSendDocumentReminders:", error);
        throw error;
    }
};

const getEFRROStats = async () => {
    return await TenantModel.getEFRROStats();
};

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
    checkAndSendDocumentReminders,
    getEFRROStats,
    getEFRROExpiringList
};