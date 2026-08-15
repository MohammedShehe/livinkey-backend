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
            created_by,
            residency  -- <-- FIX: Added residency column
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            tenantData.created_by,
            tenantData.residency || null  // <-- FIX: Include residency value
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
            efrro_from,
            efrro_till,
            rent,
            security_fee,
            payment_date,
            paid_from,
            paid_till,
            arrival_date,
            document_url,
            document_public_id,
            document_resource_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            detailsData.tenant_id,
            detailsData.pg_id,
            detailsData.room_id,
            detailsData.residency,
            detailsData.aadhaar_id || null,
            detailsData.father_aadhaar_id || null,
            detailsData.c_form_number || null,
            detailsData.efrro_from || null,
            detailsData.efrro_till || null,
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

const findByPhone = async (country_code, phone, excludeId = null) => {
    let query = `SELECT id, full_name, phone, country_code FROM tenants WHERE country_code = ? AND phone = ?`;
    const params = [country_code, phone];
    
    if (excludeId) {
        query += ` AND id != ?`;
        params.push(excludeId);
    }
    
    query += ` LIMIT 1`;
    
    const [rows] = await db.execute(query, params);
    return rows[0] || null;
};

const findPhoneInAnyCountry = async (phone, excludeId = null) => {
    let query = `SELECT id, full_name, phone, country_code FROM tenants WHERE phone = ?`;
    const params = [phone];
    
    if (excludeId) {
        query += ` AND id != ?`;
        params.push(excludeId);
    }
    
    query += ` LIMIT 1`;
    
    const [rows] = await db.execute(query, params);
    return rows[0] || null;
};

const findAll = async (search = null, role = null, gender = null, bill_status = null, pg_id = null) => {
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
            td.efrro_from,
            td.efrro_till,
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

    if (pg_id) {
        query += ` AND td.pg_id = ?`;
        params.push(parseInt(pg_id));
    }

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
            td.efrro_from,
            td.efrro_till,
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
    const [totalResult] = await db.execute(
        `SELECT COUNT(*) as total_guests FROM tenants WHERE role = 'guest'`
    );
    const total_guests = totalResult[0].total_guests;

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
            gender = ?,
            residency = ?  -- <-- FIX: Added residency column
        WHERE id = ?
        `,
        [
            tenantData.full_name,
            tenantData.email,
            tenantData.nationality,
            tenantData.country_code,
            tenantData.phone,
            tenantData.gender,
            tenantData.residency || null,  // <-- FIX: Include residency value
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
            efrro_from = ?,
            efrro_till = ?,
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
            detailsData.efrro_from || null,
            detailsData.efrro_till || null,
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

// Get tenants with e-FRRO expiring within the next month
const getTenantsWithExpiringEFRRO = async () => {
    const [rows] = await db.execute(
        `
        SELECT 
            t.id,
            t.full_name,
            t.email,
            t.nationality,
            t.country_code,
            t.phone,
            t.gender,
            td.efrro_from,
            td.efrro_till,
            td.pg_id,
            td.room_id,
            td.residency,
            p.name as pg_name,
            r.room_number,
            DATEDIFF(td.efrro_till, CURDATE()) as days_until_expiry
        FROM tenants t
        JOIN tenant_details td ON t.id = td.tenant_id
        LEFT JOIN pgs p ON td.pg_id = p.id
        LEFT JOIN rooms r ON td.room_id = r.id
        WHERE 
            t.role = 'tenant'
            AND td.residency = 'international'
            AND td.efrro_till IS NOT NULL
            AND td.efrro_till != ''
            AND td.efrro_till > CURDATE()
            AND DATEDIFF(td.efrro_till, CURDATE()) <= 30
        ORDER BY td.efrro_till ASC
        `,
        []
    );
    return rows;
};

// Get super admins for notifications
const getSuperAdmins = async () => {
    const [rows] = await db.execute(
        `
        SELECT 
            id,
            full_name,
            email
        FROM admins
        WHERE role = 'super_admin'
        `
    );
    return rows;
};

// Get tenant by ID for notification
const getTenantForNotification = async (tenantId) => {
    const [rows] = await db.execute(
        `
        SELECT 
            t.id,
            t.full_name,
            t.email,
            t.nationality,
            t.country_code,
            t.phone,
            t.gender,
            td.efrro_from,
            td.efrro_till,
            td.pg_id,
            td.room_id,
            p.name as pg_name,
            r.room_number,
            DATEDIFF(td.efrro_till, CURDATE()) as days_until_expiry
        FROM tenants t
        JOIN tenant_details td ON t.id = td.tenant_id
        LEFT JOIN pgs p ON td.pg_id = p.id
        LEFT JOIN rooms r ON td.room_id = r.id
        WHERE t.id = ?
        `,
        [tenantId]
    );
    return rows[0] || null;
};

// NEW: Get e-FRRO expiry statistics
const getEFRROStats = async () => {
    const [totalInternationalResult] = await db.execute(
        `SELECT COUNT(*) as total_international FROM tenants t 
         JOIN tenant_details td ON t.id = td.tenant_id 
         WHERE td.residency = 'international' AND t.role = 'tenant'`
    );
    const totalInternational = totalInternationalResult[0].total_international || 0;

    // Tenants with e-FRRO expiring in 0-7 days (URGENT)
    const [urgentResult] = await db.execute(
        `
        SELECT COUNT(*) as urgent 
        FROM tenants t
        JOIN tenant_details td ON t.id = td.tenant_id
        WHERE 
            t.role = 'tenant'
            AND td.residency = 'international'
            AND td.efrro_till IS NOT NULL
            AND td.efrro_till != ''
            AND td.efrro_till > CURDATE()
            AND DATEDIFF(td.efrro_till, CURDATE()) BETWEEN 0 AND 7
        `
    );
    const urgent = urgentResult[0].urgent || 0;

    // Tenants with e-FRRO expiring in 8-14 days (Soon)
    const [soonResult] = await db.execute(
        `
        SELECT COUNT(*) as soon 
        FROM tenants t
        JOIN tenant_details td ON t.id = td.tenant_id
        WHERE 
            t.role = 'tenant'
            AND td.residency = 'international'
            AND td.efrro_till IS NOT NULL
            AND td.efrro_till != ''
            AND td.efrro_till > CURDATE()
            AND DATEDIFF(td.efrro_till, CURDATE()) BETWEEN 8 AND 14
        `
    );
    const soon = soonResult[0].soon || 0;

    // Tenants with e-FRRO expiring in 15-30 days (Upcoming)
    const [upcomingResult] = await db.execute(
        `
        SELECT COUNT(*) as upcoming 
        FROM tenants t
        JOIN tenant_details td ON t.id = td.tenant_id
        WHERE 
            t.role = 'tenant'
            AND td.residency = 'international'
            AND td.efrro_till IS NOT NULL
            AND td.efrro_till != ''
            AND td.efrro_till > CURDATE()
            AND DATEDIFF(td.efrro_till, CURDATE()) BETWEEN 15 AND 30
        `
    );
    const upcoming = upcomingResult[0].upcoming || 0;

    // Tenants with e-FRRO expiring in more than 30 days (Valid)
    const [validResult] = await db.execute(
        `
        SELECT COUNT(*) as valid 
        FROM tenants t
        JOIN tenant_details td ON t.id = td.tenant_id
        WHERE 
            t.role = 'tenant'
            AND td.residency = 'international'
            AND td.efrro_till IS NOT NULL
            AND td.efrro_till != ''
            AND td.efrro_till > CURDATE()
            AND DATEDIFF(td.efrro_till, CURDATE()) > 30
        `
    );
    const valid = validResult[0].valid || 0;

    // Tenants with e-FRRO expired (Overdue)
    const [expiredResult] = await db.execute(
        `
        SELECT COUNT(*) as expired 
        FROM tenants t        JOIN tenant_details td ON t.id = td.tenant_id
        WHERE 
            t.role = 'tenant'
            AND td.residency = 'international'
            AND td.efrro_till IS NOT NULL
            AND td.efrro_till != ''
            AND td.efrro_till <= CURDATE()
        `
    );
    const expired = expiredResult[0].expired || 0;

    // Tenants with e-FRRO not set (No e-FRRO)
    const [noEfrroResult] = await db.execute(
        `
        SELECT COUNT(*) as no_efrro 
        FROM tenants t
        JOIN tenant_details td ON t.id = td.tenant_id
        WHERE 
            t.role = 'tenant'
            AND td.residency = 'international'
            AND (td.efrro_till IS NULL OR td.efrro_till = '')
        `
    );
    const noEfrro = noEfrroResult[0].no_efrro || 0;

    // Total with e-FRRO set (has e-FRRO date)
    const [withEfrroResult] = await db.execute(
        `
        SELECT COUNT(*) as with_efrro 
        FROM tenants t
        JOIN tenant_details td ON t.id = td.tenant_id
        WHERE 
            t.role = 'tenant'
            AND td.residency = 'international'
            AND td.efrro_till IS NOT NULL
            AND td.efrro_till != ''
        `
    );
    const withEfrro = withEfrroResult[0].with_efrro || 0;

    return {
        total_international: totalInternational,
        with_efrro: withEfrro,
        no_efrro: noEfrro,
        expired: expired,
        expiring_soon: {
            urgent: urgent,      // 0-7 days
            soon: soon,          // 8-14 days
            upcoming: upcoming,  // 15-30 days
            total: urgent + soon + upcoming
        },
        valid: valid,
        breakdown: {
            urgent: {
                count: urgent,
                percentage: totalInternational > 0 ? Math.round((urgent / totalInternational) * 100) : 0,
                label: 'URGENT (0-7 days)'
            },
            soon: {
                count: soon,
                percentage: totalInternational > 0 ? Math.round((soon / totalInternational) * 100) : 0,
                label: 'Soon (8-14 days)'
            },
            upcoming: {
                count: upcoming,
                percentage: totalInternational > 0 ? Math.round((upcoming / totalInternational) * 100) : 0,
                label: 'Upcoming (15-30 days)'
            },
            valid: {
                count: valid,
                percentage: totalInternational > 0 ? Math.round((valid / totalInternational) * 100) : 0,
                label: 'Valid (>30 days)'
            },
            expired: {
                count: expired,
                percentage: totalInternational > 0 ? Math.round((expired / totalInternational) * 100) : 0,
                label: 'Expired'
            },
            no_efrro: {
                count: noEfrro,
                percentage: totalInternational > 0 ? Math.round((noEfrro / totalInternational) * 100) : 0,
                label: 'No e-FRRO Set'
            }
        }
    };
};

// NEW: Get detailed e-FRRO expiring tenants list
const getEFRROExpiringList = async (daysRange = null) => {
    let query = `
        SELECT 
            t.id,
            t.full_name,
            t.email,
            t.nationality,
            t.country_code,
            t.phone,
            t.gender,
            td.efrro_from,
            td.efrro_till,
            td.pg_id,
            td.room_id,
            td.residency,
            p.name as pg_name,
            r.room_number,
            DATEDIFF(td.efrro_till, CURDATE()) as days_until_expiry
        FROM tenants t
        JOIN tenant_details td ON t.id = td.tenant_id
        LEFT JOIN pgs p ON td.pg_id = p.id
        LEFT JOIN rooms r ON td.room_id = r.id
        WHERE 
            t.role = 'tenant'
            AND td.residency = 'international'
            AND td.efrro_till IS NOT NULL
            AND td.efrro_till != ''
    `;
    
    const params = [];
    
    if (daysRange) {
        if (daysRange === 'urgent') {
            query += ` AND DATEDIFF(td.efrro_till, CURDATE()) BETWEEN 0 AND 7`;
        } else if (daysRange === 'soon') {
            query += ` AND DATEDIFF(td.efrro_till, CURDATE()) BETWEEN 8 AND 14`;
        } else if (daysRange === 'upcoming') {
            query += ` AND DATEDIFF(td.efrro_till, CURDATE()) BETWEEN 15 AND 30`;
        } else if (daysRange === 'expired') {
            query += ` AND td.efrro_till <= CURDATE()`;
        } else if (daysRange === 'valid') {
            query += ` AND DATEDIFF(td.efrro_till, CURDATE()) > 30`;
        } else if (daysRange === 'no_efrro') {
            query = `
                SELECT 
                    t.id,
                    t.full_name,
                    t.email,
                    t.nationality,
                    t.country_code,
                    t.phone,
                    t.gender,
                    td.efrro_from,
                    td.efrro_till,
                    td.pg_id,
                    td.room_id,
                    td.residency,
                    p.name as pg_name,
                    r.room_number,
                    NULL as days_until_expiry
                FROM tenants t
                JOIN tenant_details td ON t.id = td.tenant_id
                LEFT JOIN pgs p ON td.pg_id = p.id
                LEFT JOIN rooms r ON td.room_id = r.id
                WHERE 
                    t.role = 'tenant'
                    AND td.residency = 'international'
                    AND (td.efrro_till IS NULL OR td.efrro_till = '')
            `;
        }
    } else {
        // Get all international tenants with e-FRRO expiring within 30 days
        query += ` AND DATEDIFF(td.efrro_till, CURDATE()) <= 30 AND td.efrro_till > CURDATE()`;
    }
    
    if (daysRange !== 'no_efrro' && daysRange !== 'expired') {
        query += ` ORDER BY td.efrro_till ASC`;
    } else {
        query += ` ORDER BY t.full_name ASC`;
    }
    
    const [rows] = await db.execute(query, params);
    return rows;
};

module.exports = {
    createTenant,
    createTenantDetails,
    createTenantDocument,
    findByEmail,
    findByPhone,
    findPhoneInAnyCountry,
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
    checkRoomAvailability,
    getTenantsWithExpiringEFRRO,
    getSuperAdmins,
    getTenantForNotification,
    getEFRROStats,
    getEFRROExpiringList
};