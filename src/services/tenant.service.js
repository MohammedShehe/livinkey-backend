const db = require("../config/db");
const TenantModel = require("../models/tenant.model");
const { uploadFile, deleteFile } = require("./upload.service");

// =============================================
// Tenant Service - Business Logic & Transactions
// =============================================
//
// KEY FIX: room_occupancy is now updated with a single atomic SQL
// statement (`occupied_count = occupied_count + ?`) instead of a
// "SELECT current value, add in JS, then UPDATE" pattern.
//
// The old pattern had a race window: two near-simultaneous requests
// (double-click submit, a retried request, etc.) could both read the
// same "current" value before either had written back, so both would
// compute newCount = current + 1 and the room would end up +2 for a
// single logical tenant. Doing the increment inside the SQL statement
// itself removes that window entirely — MySQL serializes the update.
//
// We also now surface duplicate-key races (two submissions with the
// same email/phone landing at the same time) as a clean 409-style
// error instead of letting both silently succeed and double-book a
// room. This requires a UNIQUE constraint on tenants.email and
// tenants.phone at the DB level — see the note at the bottom of this
// file if those constraints don't exist yet.

const normalizeNumberOfTenants = (value) => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed <= 0) return 1;
    return parsed;
};

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

    try {
        await connection.beginTransaction();

        // Lock the target room row for the duration of this transaction
        // so two concurrent submissions can't both pass the availability
        // check before either commits.
        if (tenantData.role === 'tenant') {
            await connection.execute(
                `SELECT id FROM rooms WHERE id = ? FOR UPDATE`,
                [tenantData.room_id]
            );
        }

        // Check for duplicate email / phone (still useful for a fast,
        // friendly error message; the DB unique constraint below is the
        // real guarantee against races)
        const existingEmail = await TenantModel.findByEmail(tenantData.email);
        if (existingEmail) {
            throw new Error(`Email "${tenantData.email}" is already registered`);
        }

        const existingPhone = await TenantModel.findByPhone(tenantData.phone);
        if (existingPhone) {
            throw new Error(`Phone number "${tenantData.phone}" is already registered`);
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

        // Create tenant
        const tenantId = await TenantModel.createTenant(connection, {
            role: tenantData.role,
            full_name: tenantData.full_name,
            email: tenantData.email,
            nationality: tenantData.nationality,
            country_code: tenantData.country_code,
            phone: tenantData.phone,
            gender: tenantData.gender,
            created_by: tenantData.created_by
        });

        if (tenantData.role === 'tenant') {
            // Upload document if provided
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

            // Atomic occupancy increment - see incrementRoomOccupancy() above
            try {
                await incrementRoomOccupancy(connection, tenantData.room_id, numberOfTenants);
            } catch (occupancyError) {
                if (occupancyError.code === 'ER_NO_SUCH_TABLE') {
                    console.warn('room_occupancy table does not exist; occupancy not tracked.');
                } else {
                    throw occupancyError;
                }
            }

            // Upload additional documents if provided
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

        const createdTenant = await TenantModel.getTenantWithDocuments(tenantId);
        return createdTenant;

    } catch (error) {
        await connection.rollback();

        // A duplicate-key race (two simultaneous submissions with the
        // same email/phone both getting past the pre-check) surfaces
        // here. Because everything above happened in one transaction,
        // rolling back also undoes the occupancy increment for the
        // request that loses the race - so occupancy never over-counts.
        if (error.code === 'ER_DUP_ENTRY') {
            console.error("Tenant Creation Error (duplicate race):", error.message);
            throw new Error("This tenant (email or phone) was already just registered.");
        }

        console.error("Tenant Creation Error:", error);
        throw error;

    } finally {
        connection.release();
    }
};

const getAllTenants = async (search = null, role = null, gender = null, bill_status = null) => {
    return await TenantModel.findAll(search, role, gender, bill_status);
};

const getTenantById = async (tenantId) => {
    return await TenantModel.getTenantWithDocuments(tenantId);
};

const getTenantStats = async () => {
    return await TenantModel.getStats();
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

        const existingPhone = await TenantModel.findByPhone(tenantData.phone, tenantId);
        if (existingPhone) {
            throw new Error(`Phone number "${tenantData.phone}" is already registered`);
        }

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
                // Lock both rooms' occupancy rows for this transaction
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
            console.error("Tenant Update Error (duplicate race):", error.message);
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

module.exports = {
    createTenant,
    getAllTenants,
    getTenantById,
    getTenantStats,
    updateTenant,
    deleteTenant
};

// -------------------------------------------------------------------
// IMPORTANT DB NOTE:
// For the duplicate-submission race guard (ER_DUP_ENTRY handling above)
// to actually kick in, `tenants.email` and `tenants.phone` need a
// UNIQUE constraint in the schema. If you haven't added these yet:
//
//   ALTER TABLE tenants ADD UNIQUE KEY uq_tenants_email (email);
//   ALTER TABLE tenants ADD UNIQUE KEY uq_tenants_phone (phone);
//
// Without a DB-level unique constraint, two simultaneous requests can
// both pass the JS pre-check and both insert successfully - which is
// exactly the kind of race that was doubling your occupancy count.
// -------------------------------------------------------------------