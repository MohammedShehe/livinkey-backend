const db = require("../config/db");

const createTenant = async (connection, tenantData) => {
    const [result] = await connection.execute(
        `
        INSERT INTO tenants (
            role,
            full_name,
            email,
            nationality,
            country_code,
            phone,
            gender,
            password,
            created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            tenantData.role,
            tenantData.full_name,
            tenantData.email,
            tenantData.nationality,
            tenantData.country_code,
            tenantData.phone,
            tenantData.gender,
            tenantData.password,
            tenantData.created_by
        ]
    );
    return result.insertId;
};

const createTenantDetails = async (connection, detailsData) => {
    const [result] = await connection.execute(
        `
        INSERT INTO tenant_details (
            tenant_id,
            pg_id,
            room_id,
            residency,
            aadhaar_id,
            father_aadhaar_id,
            c_form_number,
            rent,
            security_fee,
            payment_date,
            paid_from,
            paid_till,
            arrival_date,
            document_url,
            document_public_id,
            document_resource_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            detailsData.tenant_id,
            detailsData.pg_id,
            detailsData.room_id,
            detailsData.residency,
            detailsData.aadhaar_id || null,
            detailsData.father_aadhaar_id || null,
            detailsData.c_form_number || null,
            detailsData.rent,
            detailsData.security_fee,
            detailsData.payment_date,
            detailsData.paid_from,
            detailsData.paid_till,
            detailsData.arrival_date,
            detailsData.document_url || null,
            detailsData.document_public_id || null,
            detailsData.document_resource_type || null
        ]
    );
    return result.insertId;
};

const createTenantDocument = async (connection, tenantId, documentUrl, publicId, resourceType, documentType = 'id_proof') => {
    const [result] = await connection.execute(
        `
        INSERT INTO tenant_documents (
            tenant_id,
            document_url,
            document_public_id,
            document_resource_type,
            document_type
        ) VALUES (?, ?, ?, ?, ?)
        `,
        [tenantId, documentUrl, publicId, resourceType, documentType]
    );
    return result.insertId;
};

const findByEmail = async (email, excludeId = null) => {
    let query = `SELECT id, full_name, email, password FROM tenants WHERE email = ?`;
    const params = [email];
    
    if (excludeId) {
        query += ` AND id != ?`;
        params.push(excludeId);
    }
    
    query += ` LIMIT 1`;
    
    const [rows] = await db.execute(query, params);
    return rows[0] || null;
};

const findByPhone = async (phone, excludeId = null) => {
    let query = `SELECT id, full_name, phone FROM tenants WHERE phone = ?`;
    const params = [phone];
    
    if (excludeId) {
        query += ` AND id != ?`;
        params.push(excludeId);
    }
    
    query += ` LIMIT 1`;
    
    const [rows] = await db.execute(query, params);
    return rows[0] || null;
};

const findAll = async (search = null, role = null, gender = null, bill_status = null) => {
    let query = `
        SELECT 
            t.id,
            t.role,
            t.full_name,
            t.email,
            t.nationality,
            t.country_code,
            t.phone,
            t.gender,
            t.created_at,
            t.updated_at,
            td.pg_id,
            td.room_id,
            td.residency,
            td.aadhaar_id,
            td.father_aadhaar_id,
            td.c_form_number,
            td.rent,
            td.security_fee,
            td.payment_date,
            td.paid_from,
            td.paid_till,
            td.arrival_date,
            td.document_url,
            p.name as pg_name,
            r.room_number,
            CASE 
                WHEN td.paid_till < CURDATE() THEN 'unpaid'
                WHEN td.paid_from <= CURDATE() AND td.paid_till >= CURDATE() THEN 'paid'
                WHEN td.paid_from > CURDATE() THEN 'unpaid'
                ELSE 'unpaid'
            END as bill_status
        FROM tenants t
        LEFT JOIN tenant_details td ON t.id = td.tenant_id
        LEFT JOIN pgs p ON td.pg_id = p.id
        LEFT JOIN rooms r ON td.room_id = r.id
        WHERE 1=1
    `;
    const params = [];

    if (search) {
        query += ` AND (t.full_name LIKE ? OR r.room_number LIKE ? OR t.nationality LIKE ? OR t.gender LIKE ?)`;
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (role) {
        query += ` AND t.role = ?`;
        params.push(role);
    }

    if (gender) {
        query += ` AND t.gender = ?`;
        params.push(gender);
    }

    if (bill_status) {
        if (bill_status === 'paid') {
            query += ` AND td.paid_from <= CURDATE() AND td.paid_till >= CURDATE()`;
        } else if (bill_status === 'unpaid') {
            query += ` AND (td.paid_till < CURDATE() OR td.paid_from > CURDATE())`;
        } else if (bill_status === 'partially_paid') {
            query += ` AND td.paid_from <= CURDATE() AND td.paid_till >= CURDATE() AND td.paid_till = CURDATE()`;
        }
    }

    query += ` ORDER BY t.created_at DESC`;

    const [rows] = await db.execute(query, params);
    return rows;
};

const findById = async (id) => {
    const [rows] = await db.execute(
        `
        SELECT 
            t.id,
            t.role,
            t.full_name,
            t.email,
            t.nationality,
            t.country_code,
            t.phone,
            t.gender,
            t.password,
            t.created_at,
            t.updated_at,
            td.pg_id,
            td.room_id,
            td.residency,
            td.aadhaar_id,
            td.father_aadhaar_id,
            td.c_form_number,
            td.rent,
            td.security_fee,
            td.payment_date,
            td.paid_from,
            td.paid_till,
            td.arrival_date,
            td.document_url,
            td.document_public_id,
            td.document_resource_type,
            p.name as pg_name,
            r.room_number,
            r.capacity,
            COALESCE(ro.occupied_count, 0) as occupied_count,
            CASE 
                WHEN td.paid_till < CURDATE() THEN 'unpaid'
                WHEN td.paid_from <= CURDATE() AND td.paid_till >= CURDATE() THEN 'paid'
                WHEN td.paid_from > CURDATE() THEN 'unpaid'
                ELSE 'unpaid'
            END as bill_status
        FROM tenants t
        LEFT JOIN tenant_details td ON t.id = td.tenant_id
        LEFT JOIN pgs p ON td.pg_id = p.id
        LEFT JOIN rooms r ON td.room_id = r.id
        LEFT JOIN room_occupancy ro ON r.id = ro.room_id
        WHERE t.id = ?
        `,
        [id]
    );
    return rows[0] || null;
};

const getTenantDocuments = async (tenantId) => {
    const [rows] = await db.execute(
        `
        SELECT
            id,
            document_url,
            document_public_id,
            document_resource_type,
            document_type,
            created_at
        FROM tenant_documents
        WHERE tenant_id = ?
        ORDER BY created_at DESC
        `,
        [tenantId]
    );
    return rows;
};

const getTenantWithDocuments = async (tenantId) => {
    const tenant = await findById(tenantId);
    if (!tenant) return null;
    
    const documents = await getTenantDocuments(tenantId);
    return {
        ...tenant,
        documents
    };
};

const getStats = async () => {
    const [totalResult] = await db.execute(
        `SELECT COUNT(*) as total FROM tenants`
    );
    const total = totalResult[0].total;

    const [nationalResult] = await db.execute(
        `SELECT COUNT(*) as national FROM tenants t 
         JOIN tenant_details td ON t.id = td.tenant_id 
         WHERE td.residency = 'national'`
    );
    const national = nationalResult[0].national;

    const [internationalResult] = await db.execute(
        `SELECT COUNT(*) as international FROM tenants t 
         JOIN tenant_details td ON t.id = td.tenant_id 
         WHERE td.residency = 'international'`
    );
    const international = internationalResult[0].international;

    const [maleResult] = await db.execute(
        `SELECT COUNT(*) as male FROM tenants WHERE gender = 'male'`
    );
    const male = maleResult[0].male;

    const [femaleResult] = await db.execute(
        `SELECT COUNT(*) as female FROM tenants WHERE gender = 'female'`
    );
    const female = femaleResult[0].female;

    const [paidResult] = await db.execute(
        `
        SELECT COUNT(*) as paid 
        FROM tenants t
        JOIN tenant_details td ON t.id = td.tenant_id
        WHERE td.paid_from <= CURDATE() AND td.paid_till >= CURDATE()
        `
    );
    const paid = paidResult[0].paid;

    const [unpaidResult] = await db.execute(
        `
        SELECT COUNT(*) as unpaid 
        FROM tenants t
        JOIN tenant_details td ON t.id = td.tenant_id
        WHERE td.paid_till < CURDATE() OR td.paid_from > CURDATE()
        `
    );
    const unpaid = unpaidResult[0].unpaid;

    const [partiallyPaidResult] = await db.execute(
        `
        SELECT COUNT(*) as partially_paid 
        FROM tenants t
        JOIN tenant_details td ON t.id = td.tenant_id
        WHERE td.paid_from <= CURDATE() AND td.paid_till = CURDATE()
        `
    );
    const partially_paid = partiallyPaidResult[0].partially_paid;

    return {
        total,
        national,
        international,
        male,
        female,
        paid,
        unpaid,
        partially_paid
    };
};

const getGuestStats = async () => {
    // Total guests
    const [totalResult] = await db.execute(
        `SELECT COUNT(*) as total_guests FROM tenants WHERE role = 'guest'`
    );
    const total_guests = totalResult[0].total_guests;

    // This month guests (created in current month)
    const [thisMonthResult] = await db.execute(
        `
        SELECT COUNT(*) as this_month_guests 
        FROM tenants 
        WHERE role = 'guest' 
        AND MONTH(created_at) = MONTH(CURDATE()) 
        AND YEAR(created_at) = YEAR(CURDATE())
        `
    );
    const this_month_guests = thisMonthResult[0].this_month_guests;

    // Last month guests
    const [lastMonthResult] = await db.execute(
        `
        SELECT COUNT(*) as last_month_guests 
        FROM tenants 
        WHERE role = 'guest' 
        AND MONTH(created_at) = MONTH(CURDATE() - INTERVAL 1 MONTH) 
        AND YEAR(created_at) = YEAR(CURDATE() - INTERVAL 1 MONTH)
        `
    );
    const last_month_guests = lastMonthResult[0].last_month_guests;

    // Today's guests
    const [todayResult] = await db.execute(
        `
        SELECT COUNT(*) as today_guests 
        FROM tenants 
        WHERE role = 'guest' 
        AND DATE(created_at) = CURDATE()
        `
    );
    const today_guests = todayResult[0].today_guests;

    return {
        total_guests,
        this_month_guests,
        last_month_guests,
        today_guests
    };
};

const updateTenant = async (connection, tenantId, tenantData) => {
    const [result] = await connection.execute(
        `
        UPDATE tenants
        SET
            full_name = ?,
            email = ?,
            nationality = ?,
            country_code = ?,
            phone = ?,
            gender = ?
        WHERE id = ?
        `,
        [
            tenantData.full_name,
            tenantData.email,
            tenantData.nationality,
            tenantData.country_code,
            tenantData.phone,
            tenantData.gender,
            tenantId
        ]
    );
    return result.affectedRows;
};

const updateTenantPassword = async (connection, tenantId, hashedPassword) => {
    const [result] = await connection.execute(
        `
        UPDATE tenants
        SET password = ?
        WHERE id = ?
        `,
        [hashedPassword, tenantId]
    );
    return result.affectedRows;
};

const updateTenantDetails = async (connection, tenantId, detailsData) => {
    const [result] = await connection.execute(
        `
        UPDATE tenant_details
        SET
            residency = ?,
            aadhaar_id = ?,
            father_aadhaar_id = ?,
            c_form_number = ?,
            rent = ?,
            security_fee = ?,
            payment_date = ?,
            paid_from = ?,
            paid_till = ?,
            arrival_date = ?
        WHERE tenant_id = ?
        `,
        [
            detailsData.residency,
            detailsData.aadhaar_id || null,
            detailsData.father_aadhaar_id || null,
            detailsData.c_form_number || null,
            detailsData.rent,
            detailsData.security_fee,
            detailsData.payment_date,
            detailsData.paid_from,
            detailsData.paid_till,
            detailsData.arrival_date,
            tenantId
        ]
    );
    return result.affectedRows;
};

const deleteTenantDocuments = async (connection, tenantId) => {
    await connection.execute(
        `DELETE FROM tenant_documents WHERE tenant_id = ?`,
        [tenantId]
    );
};

const deleteTenant = async (connection, tenantId) => {
    const [result] = await connection.execute(
        `DELETE FROM tenants WHERE id = ?`,
        [tenantId]
    );
    return result.affectedRows;
};

const checkRoomAvailability = async (roomId, additionalOccupants = 1) => {
    try {
        const [rows] = await db.execute(
            `
            SELECT 
                r.capacity,
                COALESCE(ro.occupied_count, 0) as occupied_count
            FROM rooms r
            LEFT JOIN room_occupancy ro ON r.id = ro.room_id
            WHERE r.id = ?
            `,
            [roomId]
        );
        
        if (rows.length === 0) {
            return { available: false, message: "Room not found" };
        }
        
        const room = rows[0];
        const available = room.capacity - room.occupied_count;
        
        if (available < additionalOccupants) {
            return {
                available: false,
                message: `Only ${available} spot(s) available in this room`
            };
        }
        
        return { available: true, available_spots: available };
    } catch (error) {
        if (error.code === 'ER_NO_SUCH_TABLE') {
            const [rows] = await db.execute(
                `
                SELECT 
                    r.capacity
                FROM rooms r
                WHERE r.id = ?
                `,
                [roomId]
            );
            
            if (rows.length === 0) {
                return { available: false, message: "Room not found" };
            }
            
            const room = rows[0];
            if (room.capacity < additionalOccupants) {
                return {
                    available: false,
                    message: `Room capacity is ${room.capacity}, but you're adding ${additionalOccupants} tenant(s)`
                };
            }
            
            return { 
                available: true, 
                available_spots: room.capacity,
                warning: "Room occupancy tracking is not set up. Please ensure room_occupancy table exists."
            };
        }
        throw error;
    }
};

module.exports = {
    createTenant,
    createTenantDetails,
    createTenantDocument,
    findByEmail,
    findByPhone,
    findAll,
    findById,
    getTenantDocuments,
    getTenantWithDocuments,
    getStats,
    getGuestStats,
    updateTenant,
    updateTenantPassword,
    updateTenantDetails,
    deleteTenantDocuments,
    deleteTenant,
    checkRoomAvailability
};