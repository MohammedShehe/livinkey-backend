const db = require("../config/db");

// Helper function to convert date values to proper NULL
const toDateOrNull = (value) => {
    // If value is null, undefined, empty string, 'null' string, or '0000-00-00', return null
    if (!value || value === '' || value === 'null' || value === 'NULL' || value === '0000-00-00') {
        return null;
    }
    // If it's a valid date string, return it
    return value;
};

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
            international_phone,
            parent_phone,
            gender,
            password,
            created_by,
            residency,
            must_change_password
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            tenantData.role,
            tenantData.full_name,
            tenantData.email,
            tenantData.nationality,
            tenantData.country_code,
            tenantData.phone,
            tenantData.international_phone || null,
            tenantData.parent_phone || null,
            tenantData.gender,
            tenantData.password,
            tenantData.created_by,
            tenantData.residency || null,
            tenantData.role === 'tenant' ? 1 : 0
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
            period_of_stay,
            document_url,
            document_public_id,
            document_resource_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            detailsData.tenant_id,
            detailsData.pg_id,
            detailsData.room_id,
            detailsData.residency,
            detailsData.aadhaar_id || null,
            detailsData.father_aadhaar_id || null,
            detailsData.c_form_number || null,
            toDateOrNull(detailsData.efrro_from),
            toDateOrNull(detailsData.efrro_till),
            detailsData.rent,
            detailsData.security_fee,
            detailsData.payment_date,
            toDateOrNull(detailsData.paid_from),
            toDateOrNull(detailsData.paid_till),
            toDateOrNull(detailsData.arrival_date),
            detailsData.period_of_stay || null,
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
            t.international_phone,
            t.parent_phone,
            t.gender,
            t.created_at,
            t.updated_at,
            t.is_active,
            COALESCE(t.status, 'active') as status,
            t.checkout_date,
            t.archived_at,
            t.archive_reason,
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
            td.period_of_stay,
            td.document_url,
            p.name as pg_name,
            r.room_number,
            -- Use bills table as source of truth for payment status
            COALESCE(
                (SELECT b2.status 
                 FROM bills b2
                 WHERE b2.deleted_at IS NULL
                   AND (b2.tenant_id = t.id OR EXISTS (
                       SELECT 1
                       FROM bill_group_members bgm2
                       INNER JOIN bill_groups bg2 ON bg2.id = bgm2.bill_group_id
                       WHERE bg2.bill_id = b2.id AND bgm2.tenant_id = t.id
                   ))
                 ORDER BY b2.created_at DESC 
                 LIMIT 1),
                'unpaid'
            ) as bill_status,
            COALESCE(
                (SELECT b2.total_amount 
                 FROM bills b2
                 WHERE b2.deleted_at IS NULL
                   AND (b2.tenant_id = t.id OR EXISTS (
                       SELECT 1
                       FROM bill_group_members bgm2
                       INNER JOIN bill_groups bg2 ON bg2.id = bgm2.bill_group_id
                       WHERE bg2.bill_id = b2.id AND bgm2.tenant_id = t.id
                   ))
                 ORDER BY b2.created_at DESC 
                 LIMIT 1),
                0
            ) as bill_total_amount,
            COALESCE(
                (SELECT b2.paid_amount 
                 FROM bills b2
                 WHERE b2.deleted_at IS NULL
                   AND (b2.tenant_id = t.id OR EXISTS (
                       SELECT 1
                       FROM bill_group_members bgm2
                       INNER JOIN bill_groups bg2 ON bg2.id = bgm2.bill_group_id
                       WHERE bg2.bill_id = b2.id AND bgm2.tenant_id = t.id
                   ))
                 ORDER BY b2.created_at DESC 
                 LIMIT 1),
                0
            ) as bill_paid_amount,
            COALESCE(
                (SELECT b2.fine_amount 
                 FROM bills b2
                 WHERE b2.deleted_at IS NULL
                   AND (b2.tenant_id = t.id OR EXISTS (
                       SELECT 1
                       FROM bill_group_members bgm2
                       INNER JOIN bill_groups bg2 ON bg2.id = bgm2.bill_group_id
                       WHERE bg2.bill_id = b2.id AND bgm2.tenant_id = t.id
                   ))
                 ORDER BY b2.created_at DESC 
                 LIMIT 1),
                0
            ) as bill_fine_amount
        FROM tenants t
        LEFT JOIN tenant_details td ON t.id = td.tenant_id
        LEFT JOIN pgs p ON td.pg_id = p.id
        LEFT JOIN rooms r ON td.room_id = r.id
        WHERE 1=1
          AND (t.status IS NULL OR t.status = 'active')
          AND (t.is_active IS NULL OR t.is_active = 1)
    `;
    const params = [];

    if (role) {
        query += ` AND t.role = ?`;
        params.push(role);
    }

    if (pg_id) {
        query += ` AND td.pg_id = ?`;
        params.push(parseInt(pg_id));
    }

    if (search) {
        query += ` AND (t.full_name LIKE ? OR r.room_number LIKE ? OR t.nationality LIKE ? OR t.gender LIKE ?)`;
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (gender) {
        query += ` AND t.gender = ?`;
        params.push(gender);
    }

    // Filter by bill_status using the SUBQUERY
    if (bill_status) {
        query += ` AND COALESCE(
            (SELECT b2.status
             FROM bills b2
             WHERE b2.deleted_at IS NULL
               AND (b2.tenant_id = t.id OR EXISTS (
                   SELECT 1
                   FROM bill_group_members bgm2
                   INNER JOIN bill_groups bg2 ON bg2.id = bgm2.bill_group_id
                   WHERE bg2.bill_id = b2.id AND bgm2.tenant_id = t.id
               ))
             ORDER BY b2.created_at DESC
             LIMIT 1),
            'unpaid'
        ) = ?`;
        params.push(bill_status);
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
            t.international_phone,
            t.parent_phone,
            t.gender,
            t.password,
            t.must_change_password,
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
            td.period_of_stay,
            td.document_url,
            td.document_public_id,
            td.document_resource_type,
            p.name as pg_name,
            r.room_number,
            r.capacity,
            COALESCE(ro.occupied_count, 0) as occupied_count,
            -- Use bills table as source of truth for payment status
            COALESCE(
                (SELECT b2.status 
                 FROM bills b2
                 WHERE b2.deleted_at IS NULL
                   AND (b2.tenant_id = t.id OR EXISTS (
                       SELECT 1
                       FROM bill_group_members bgm2
                       INNER JOIN bill_groups bg2 ON bg2.id = bgm2.bill_group_id
                       WHERE bg2.bill_id = b2.id AND bgm2.tenant_id = t.id
                   ))
                 ORDER BY b2.created_at DESC 
                 LIMIT 1),
                'unpaid'
            ) as bill_status,
            COALESCE(
                (SELECT b2.total_amount 
                 FROM bills b2
                 WHERE b2.deleted_at IS NULL
                   AND (b2.tenant_id = t.id OR EXISTS (
                       SELECT 1
                       FROM bill_group_members bgm2
                       INNER JOIN bill_groups bg2 ON bg2.id = bgm2.bill_group_id
                       WHERE bg2.bill_id = b2.id AND bgm2.tenant_id = t.id
                   ))
                 ORDER BY b2.created_at DESC 
                 LIMIT 1),
                0
            ) as bill_total_amount,
            COALESCE(
                (SELECT b2.paid_amount 
                 FROM bills b2
                 WHERE b2.deleted_at IS NULL
                   AND (b2.tenant_id = t.id OR EXISTS (
                       SELECT 1
                       FROM bill_group_members bgm2
                       INNER JOIN bill_groups bg2 ON bg2.id = bgm2.bill_group_id
                       WHERE bg2.bill_id = b2.id AND bgm2.tenant_id = t.id
                   ))
                 ORDER BY b2.created_at DESC 
                 LIMIT 1),
                0
            ) as bill_paid_amount,
            COALESCE(
                (SELECT b2.fine_amount 
                 FROM bills b2
                 WHERE b2.deleted_at IS NULL
                   AND (b2.tenant_id = t.id OR EXISTS (
                       SELECT 1
                       FROM bill_group_members bgm2
                       INNER JOIN bill_groups bg2 ON bg2.id = bgm2.bill_group_id
                       WHERE bg2.bill_id = b2.id AND bgm2.tenant_id = t.id
                   ))
                 ORDER BY b2.created_at DESC 
                 LIMIT 1),
                0
            ) as bill_fine_amount
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
          AND deleted_at IS NULL
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
        `SELECT COUNT(*) as total FROM tenants WHERE (status IS NULL OR status = 'active') AND (is_active IS NULL OR is_active = 1)`
    );
    const total = totalResult[0].total;

    const [nationalResult] = await db.execute(
        `SELECT COUNT(*) as national FROM tenants t 
         JOIN tenant_details td ON t.id = td.tenant_id 
         WHERE td.residency = 'national' AND (t.status IS NULL OR t.status = 'active') AND (t.is_active IS NULL OR t.is_active = 1)`
    );
    const national = nationalResult[0].national;

    const [internationalResult] = await db.execute(
        `SELECT COUNT(*) as international FROM tenants t 
         JOIN tenant_details td ON t.id = td.tenant_id 
         WHERE td.residency = 'international' AND (t.status IS NULL OR t.status = 'active') AND (t.is_active IS NULL OR t.is_active = 1)`
    );
    const international = internationalResult[0].international;

    const [maleResult] = await db.execute(
        `SELECT COUNT(*) as male FROM tenants WHERE gender = 'male' AND (status IS NULL OR status = 'active') AND (is_active IS NULL OR is_active = 1)`
    );
    const male = maleResult[0].male;

    const [femaleResult] = await db.execute(
        `SELECT COUNT(*) as female FROM tenants WHERE gender = 'female' AND (status IS NULL OR status = 'active') AND (is_active IS NULL OR is_active = 1)`
    );
    const female = femaleResult[0].female;

    // Use bills table to determine payment status
    const [paidResult] = await db.execute(
        `
        SELECT COUNT(*) as paid 
        FROM tenants t
        WHERE EXISTS (
            SELECT 1 FROM bills 
            WHERE tenant_id = t.id 
            AND status = 'paid'
            ORDER BY created_at DESC 
            LIMIT 1
        )
        `
    );
    const paid = paidResult[0].paid;

    const [unpaidResult] = await db.execute(
        `
        SELECT COUNT(*) as unpaid 
        FROM tenants t
        WHERE NOT EXISTS (
            SELECT 1 FROM bills 
            WHERE tenant_id = t.id 
            AND status = 'paid'
            ORDER BY created_at DESC 
            LIMIT 1
        )
        `
    );
    const unpaid = unpaidResult[0].unpaid;

    // Partially paid tenants
    const [partiallyPaidResult] = await db.execute(
        `
        SELECT COUNT(*) as partially_paid 
        FROM tenants t
        WHERE EXISTS (
            SELECT 1 FROM bills 
            WHERE tenant_id = t.id 
            AND status = 'partially_paid'
            ORDER BY created_at DESC 
            LIMIT 1
        )
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
            international_phone = ?,
            parent_phone = ?,
            gender = ?,
            residency = ?
        WHERE id = ?
        `,
        [
            tenantData.full_name,
            tenantData.email,
            tenantData.nationality,
            tenantData.country_code,
            tenantData.phone,
            tenantData.international_phone || null,
            tenantData.parent_phone || null,
            tenantData.gender,
            tenantData.residency || null,
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
            arrival_date = ?,
            period_of_stay = ?
        WHERE tenant_id = ?
        `,
        [
            detailsData.residency,
            detailsData.aadhaar_id || null,
            detailsData.father_aadhaar_id || null,
            detailsData.c_form_number || null,
            toDateOrNull(detailsData.efrro_from),
            toDateOrNull(detailsData.efrro_till),
            detailsData.rent,
            detailsData.security_fee,
            detailsData.payment_date,
            toDateOrNull(detailsData.paid_from),
            toDateOrNull(detailsData.paid_till),
            toDateOrNull(detailsData.arrival_date),
            detailsData.period_of_stay || null,
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

const softDeleteTenantDocuments = async (connection, tenantId, deletedBy = null, reason = null) => {
    await connection.execute(
        `UPDATE tenant_documents
         SET deleted_at = NOW(), deleted_by = ?, delete_reason = ?
         WHERE tenant_id = ? AND deleted_at IS NULL`,
        [deletedBy, reason, tenantId]
    );
};

const restoreTenantDocuments = async (connection, tenantId) => {
    await connection.execute(
        `UPDATE tenant_documents
         SET deleted_at = NULL, deleted_by = NULL, delete_reason = NULL
         WHERE tenant_id = ? AND deleted_at IS NOT NULL`,
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

/**
 * Soft-archive a tenant (checkout or archive).
 * Frees email/phone uniqueness by rewriting them while storing originals.
 */
const archiveTenant = async (connection, tenantId, {
    status = 'archived', // 'checked_out' | 'archived'
    checkoutDate = null,
    reason = null,
    archivedBy = null
} = {}) => {
    // Load current identity
    const [rows] = await connection.execute(
        `SELECT email, phone, country_code FROM tenants WHERE id = ? FOR UPDATE`,
        [tenantId]
    );
    if (!rows.length) return 0;
    const { email, phone, country_code } = rows[0];

    const archivedEmail = `archived_${tenantId}_${email}`;
    // Keep under unique constraints
    const archivedPhone = (`a${tenantId}${phone}`).slice(0, 20);

    const [result] = await connection.execute(
        `
        UPDATE tenants SET
            status = ?,
            is_active = 0,
            checkout_date = ?,
            archived_at = NOW(),
            archive_reason = ?,
            archived_by = ?,
            original_email = COALESCE(original_email, email),
            original_phone = COALESCE(original_phone, phone),
            email = ?,
            phone = ?
        WHERE id = ?
        `,
        [
            status,
            checkoutDate,
            reason,
            archivedBy,
            archivedEmail,
            archivedPhone,
            tenantId
        ]
    );
    return result.affectedRows;
};

const restoreTenant = async (connection, tenantId) => {
    const [rows] = await connection.execute(
        `SELECT
            original_email,
            original_phone,
            email,
            phone,
            country_code
         FROM tenants
         WHERE id = ?
         FOR UPDATE`,
        [tenantId]
    );

    if (!rows.length) {
        return {
            ok: false,
            message: 'Tenant not found'
        };
    }

    const tenant = rows[0];

    const restoreEmail =
        tenant.original_email ||
        tenant.email.replace(
            new RegExp(`^archived_${tenantId}_`),
            ''
        );

    const restorePhone =
        tenant.original_phone || tenant.phone;

    // Check whether another record already uses this email.
    const [emailConflict] = await connection.execute(
        `SELECT id
         FROM tenants
         WHERE email = ?
           AND id != ?
         LIMIT 1`,
        [restoreEmail, tenantId]
    );

    if (emailConflict.length > 0) {
        return {
            ok: false,
            message: `Cannot restore: email ${restoreEmail} is already in use by another record`
        };
    }

    // Only another active tenant can block phone restoration.
    // Guest records and inactive tenants are excluded.
    const [phoneConflict] = await connection.execute(
        `SELECT id
         FROM tenants
         WHERE phone = ?
           AND country_code = ?
           AND role = 'tenant'
           AND id != ?
           AND (status IS NULL OR status = 'active')
           AND (is_active IS NULL OR is_active = 1)
         LIMIT 1`,
        [
            restorePhone,
            tenant.country_code,
            tenantId
        ]
    );

    if (phoneConflict.length > 0) {
        return {
            ok: false,
            message: `Cannot restore: phone ${restorePhone} is already in use by another active tenant`
        };
    }

    // Restore the original contact details and active status.
    const [result] = await connection.execute(
        `UPDATE tenants
         SET
            status = 'active',
            is_active = 1,
            checkout_date = NULL,
            archived_at = NULL,
            archive_reason = NULL,
            archived_by = NULL,
            email = ?,
            phone = ?,
            original_email = NULL,
            original_phone = NULL
         WHERE id = ?`,
        [
            restoreEmail,
            restorePhone,
            tenantId
        ]
    );

    return {
        ok: result.affectedRows > 0,
        affected: result.affectedRows
    };
};

const findArchived = async (filters = {}) => {
    const {
        search = null,
        role = null,
        gender = null,
        pg_id = null,
        status = null, // checked_out | archived | all inactive
        month = null,
        year = null,
        residency = null
    } = filters;

    let query = `
        SELECT 
            t.id,
            t.role,
            t.full_name,
            COALESCE(t.original_email, t.email) as email,
            t.email as archived_email,
            t.nationality,
            t.country_code,
            COALESCE(t.original_phone, t.phone) as phone,
            t.international_phone,
            t.parent_phone,
            t.gender,
            t.created_at,
            t.updated_at,
            t.is_active,
            COALESCE(t.status, 'active') as status,
            t.checkout_date,
            t.archived_at,
            t.archive_reason,
            t.archived_by,
            a.name as archived_by_name,
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
            td.period_of_stay,
            td.document_url,
            p.name as pg_name,
            r.room_number
        FROM tenants t
        LEFT JOIN tenant_details td ON t.id = td.tenant_id
        LEFT JOIN pgs p ON td.pg_id = p.id
        LEFT JOIN rooms r ON td.room_id = r.id
        LEFT JOIN admins a ON t.archived_by = a.id
        WHERE (t.status IN ('checked_out', 'archived') OR t.is_active = 0)
    `;
    const params = [];

    if (status && status !== 'all') {
        query += ` AND t.status = ?`;
        params.push(status);
    }
    if (role) {
        query += ` AND t.role = ?`;
        params.push(role);
    }
    if (pg_id) {
        query += ` AND td.pg_id = ?`;
        params.push(parseInt(pg_id));
    }
    if (gender) {
        query += ` AND t.gender = ?`;
        params.push(gender);
    }
    if (residency) {
        query += ` AND td.residency = ?`;
        params.push(residency);
    }
    if (year) {
        query += ` AND YEAR(COALESCE(t.archived_at, t.checkout_date, t.updated_at)) = ?`;
        params.push(parseInt(year));
    }
    if (month) {
        query += ` AND MONTH(COALESCE(t.archived_at, t.checkout_date, t.updated_at)) = ?`;
        params.push(parseInt(month));
    }
    if (search) {
        query += ` AND (
            t.full_name LIKE ? OR
            COALESCE(t.original_email, t.email) LIKE ? OR
            COALESCE(t.original_phone, t.phone) LIKE ? OR
            r.room_number LIKE ? OR
            p.name LIKE ?
        )`;
        const s = `%${search}%`;
        params.push(s, s, s, s, s);
    }

    query += ` ORDER BY COALESCE(t.archived_at, t.checkout_date, t.updated_at) DESC`;
    const [rows] = await db.execute(query, params);
    return rows;
};

const getArchiveStats = async () => {
    const [rows] = await db.execute(`
        SELECT
            SUM(CASE WHEN (status IS NULL OR status = 'active') AND (is_active IS NULL OR is_active = 1) THEN 1 ELSE 0 END) as active_count,
            SUM(CASE WHEN status = 'checked_out' THEN 1 ELSE 0 END) as checked_out_count,
            SUM(CASE WHEN status = 'archived' THEN 1 ELSE 0 END) as archived_count,
            SUM(CASE WHEN status IN ('checked_out','archived') OR is_active = 0 THEN 1 ELSE 0 END) as inactive_count,
            COUNT(*) as all_count
        FROM tenants
        WHERE role = 'tenant'
    `);
    return rows[0] || { active_count: 0, checked_out_count: 0, archived_count: 0, inactive_count: 0, all_count: 0 };
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

const getSuperAdmins = async () => {
    const [rows] = await db.execute(
        `
        SELECT 
            id,
            name as full_name,
            email
        FROM admins
        WHERE role = 'super_admin'
        `
    );
    return rows;
};

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

const getEFRROStats = async () => {
    const [totalInternationalResult] = await db.execute(
        `SELECT COUNT(*) as total_international FROM tenants t 
         JOIN tenant_details td ON t.id = td.tenant_id 
         WHERE td.residency = 'international' AND t.role = 'tenant'`
    );
    const totalInternational = totalInternationalResult[0].total_international || 0;

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

    const [expiredResult] = await db.execute(
        `
        SELECT COUNT(*) as expired 
        FROM tenants t
        JOIN tenant_details td ON t.id = td.tenant_id
        WHERE 
            t.role = 'tenant'
            AND td.residency = 'international'
            AND td.efrro_till IS NOT NULL
            AND td.efrro_till != ''
            AND td.efrro_till <= CURDATE()
        `
    );
    const expired = expiredResult[0].expired || 0;

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
            urgent: urgent,
            soon: soon,
            upcoming: upcoming,
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
    softDeleteTenantDocuments,
    restoreTenantDocuments,
    deleteTenant,
    archiveTenant,
    restoreTenant,
    findArchived,
    getArchiveStats,
    checkRoomAvailability,
    getTenantsWithExpiringEFRRO,
    getSuperAdmins,
    getTenantForNotification,
    getEFRROStats,
    getEFRROExpiringList,
    toDateOrNull // Export for use in other services if needed
};