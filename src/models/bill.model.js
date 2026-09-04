const db = require("../config/db");

const createBill = async (connection, billData) => {
    const [result] = await connection.execute(
        `
        INSERT INTO bills (
            tenant_id,
            rent_amount,
            electricity_amount,
            electricity_meter_image,
            electricity_meter_public_id,
            electricity_meter_resource_type,
            maintenance_amount,
            other_charges,
            total_amount,
            payment_qr,
            payment_qr_public_id,
            payment_qr_resource_type,
            partial_payment_qr,
            partial_payment_qr_public_id,
            partial_payment_qr_resource_type,
            admin_qr,
            admin_qr_public_id,
            admin_qr_resource_type,
            sent_at,
            valid_until,
            created_by,
            fine_applied_days,
            last_fine_email_sent,
            initial_email_sent,
            qr_expires_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            billData.tenant_id,
            billData.rent_amount,
            billData.electricity_amount || 0,
            billData.electricity_meter_image || null,
            billData.electricity_meter_public_id || null,
            billData.electricity_meter_resource_type || null,
            billData.maintenance_amount || 0,
            billData.other_charges || 0,
            billData.total_amount,
            billData.payment_qr || null,
            billData.payment_qr_public_id || null,
            billData.payment_qr_resource_type || null,
            billData.partial_payment_qr || null,
            billData.partial_payment_qr_public_id || null,
            billData.partial_payment_qr_resource_type || null,
            billData.admin_qr || null,
            billData.admin_qr_public_id || null,
            billData.admin_qr_resource_type || null,
            billData.sent_at,
            billData.valid_until,
            billData.created_by,
            billData.fine_applied_days || 0,
            billData.last_fine_email_sent || null,
            billData.initial_email_sent || 0,
            billData.qr_expires_at || null
        ]
    );
    return result.insertId;
};

/**
 * FIXED: Get unpaid tenants using bills table as source of truth
 */
const getUnpaidTenants = async () => {
    const [rows] = await db.execute(
        `
        SELECT 
            t.id,
            t.full_name,
            t.email,
            t.phone,
            t.role,
            td.rent,
            td.paid_till,
            td.paid_from,
            td.payment_date,
            td.pg_id,
            p.name as pg_name,
            r.room_number,
            COALESCE(
                (SELECT status FROM bills WHERE tenant_id = t.id ORDER BY created_at DESC LIMIT 1),
                'unpaid'
            ) as bill_status,
            COALESCE(
                (SELECT total_amount FROM bills WHERE tenant_id = t.id ORDER BY created_at DESC LIMIT 1),
                0
            ) as total_amount,
            COALESCE(
                (SELECT paid_amount FROM bills WHERE tenant_id = t.id ORDER BY created_at DESC LIMIT 1),
                0
            ) as paid_amount,
            COALESCE(
                (SELECT fine_amount FROM bills WHERE tenant_id = t.id ORDER BY created_at DESC LIMIT 1),
                0
            ) as fine_amount
        FROM tenants t
        INNER JOIN tenant_details td ON t.id = td.tenant_id
        INNER JOIN pgs p ON td.pg_id = p.id
        INNER JOIN rooms r ON td.room_id = r.id
        WHERE t.role = 'tenant'
        AND t.is_active = 1
        AND td.paid_from IS NOT NULL
        AND td.rent > 0
        AND COALESCE(
            (SELECT status FROM bills WHERE tenant_id = t.id ORDER BY created_at DESC LIMIT 1),
            'unpaid'
        ) != 'paid'
        ORDER BY t.full_name ASC
        `
    );
    return rows;
};

const getBills = async (filters = {}) => {
    let query = `
        SELECT 
            b.*,
            t.full_name as tenant_name,
            t.email as tenant_email,
            t.phone as tenant_phone,
            p.name as pg_name,
            r.room_number,
            COALESCE(
                (SELECT SUM(amount) FROM bill_payments WHERE bill_id = b.id AND is_partial = 0), 
                0
            ) as total_paid,
            COALESCE(
                (SELECT SUM(amount) FROM bill_payments WHERE bill_id = b.id AND is_partial = 1), 
                0
            ) as total_partial_paid,
            COALESCE(
                (SELECT SUM(amount) FROM cash_payments WHERE bill_id = b.id AND status = 'verified'), 
                0
            ) as total_cash_paid,
            DATEDIFF(NOW(), b.sent_at) as days_since_sent,
            CASE 
                WHEN b.qr_expires_at IS NOT NULL AND b.qr_expires_at > NOW() THEN 'active'
                WHEN b.qr_expires_at IS NOT NULL AND b.qr_expires_at <= NOW() THEN 'expired'
                ELSE 'none'
            END as qr_status,
            (b.total_amount + b.fine_amount - b.paid_amount - COALESCE(
                (SELECT SUM(amount) FROM cash_payments WHERE bill_id = b.id AND status = 'verified'), 0
            )) as due_amount
        FROM bills b
        INNER JOIN tenants t ON b.tenant_id = t.id
        LEFT JOIN tenant_details td ON t.id = td.tenant_id
        LEFT JOIN pgs p ON td.pg_id = p.id
        LEFT JOIN rooms r ON td.room_id = r.id
        WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
        if (filters.status === 'unpaid') {
            query += ` AND b.status = 'unpaid'`;
        } else if (filters.status === 'partially_paid') {
            query += ` AND b.status = 'partially_paid'`;
        } else if (filters.status === 'paid') {
            query += ` AND b.status = 'paid'`;
        } else if (filters.status === 'delayed') {
            query += ` AND b.status = 'delayed'`;
        } else if (filters.status === 'overdue') {
            query += ` AND b.status = 'overdue'`;
        }
    }

    if (filters.tenant_id) {
        query += ` AND b.tenant_id = ?`;
        params.push(filters.tenant_id);
    }

    if (filters.pg_id) {
        query += ` AND td.pg_id = ?`;
        params.push(filters.pg_id);
    }

    if (filters.search) {
        query += ` AND (t.full_name LIKE ? OR t.email LIKE ? OR t.phone LIKE ?)`;
        const searchPattern = `%${filters.search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
    }

    query += ` ORDER BY b.created_at DESC`;

    const [rows] = await db.execute(query, params);
    return rows;
};

const getBillById = async (billId) => {
    const [rows] = await db.execute(
        `
        SELECT 
            b.*,
            t.full_name as tenant_name,
            t.email as tenant_email,
            t.phone as tenant_phone,
            t.nationality as tenant_nationality,
            td.rent as monthly_rent,
            td.payment_date as tenant_payment_date,
            td.pg_id,
            td.room_id,
            p.name as pg_name,
            r.room_number,
            COALESCE(
                (SELECT SUM(amount) FROM bill_payments WHERE bill_id = b.id AND is_partial = 0), 
                0
            ) as total_paid,
            COALESCE(
                (SELECT SUM(amount) FROM bill_payments WHERE bill_id = b.id AND is_partial = 1), 
                0
            ) as total_partial_paid,
            COALESCE(
                (SELECT SUM(amount) FROM cash_payments WHERE bill_id = b.id AND status = 'verified'), 
                0
            ) as total_cash_paid,
            DATEDIFF(NOW(), b.sent_at) as days_since_sent,
            CASE 
                WHEN b.qr_expires_at IS NOT NULL AND b.qr_expires_at > NOW() THEN 'active'
                WHEN b.qr_expires_at IS NOT NULL AND b.qr_expires_at <= NOW() THEN 'expired'
                ELSE 'none'
            END as qr_status,
            (b.total_amount + b.fine_amount - b.paid_amount - COALESCE(
                (SELECT SUM(amount) FROM cash_payments WHERE bill_id = b.id AND status = 'verified'), 0
            )) as due_amount,
            b.cash_payment_otp,
            b.cash_payment_otp_expiry,
            b.cash_payment_verified,
            b.cash_payment_requested_at
        FROM bills b
        INNER JOIN tenants t ON b.tenant_id = t.id
        INNER JOIN tenant_details td ON t.id = td.tenant_id
        INNER JOIN pgs p ON td.pg_id = p.id
        INNER JOIN rooms r ON td.room_id = r.id
        WHERE b.id = ?
        `,
        [billId]
    );
    return rows[0] || null;
};

const getBillsByTenant = async (tenantId) => {
    const [rows] = await db.execute(
        `
        SELECT 
            b.*,
            COALESCE(
                (SELECT SUM(amount) FROM bill_payments WHERE bill_id = b.id), 
                0
            ) as total_paid,
            COALESCE(
                (SELECT SUM(amount) FROM cash_payments WHERE bill_id = b.id AND status = 'verified'), 
                0
            ) as total_cash_paid,
            CASE 
                WHEN b.qr_expires_at IS NOT NULL AND b.qr_expires_at > NOW() THEN 'active'
                WHEN b.qr_expires_at IS NOT NULL AND b.qr_expires_at <= NOW() THEN 'expired'
                ELSE 'none'
            END as qr_status,
            (b.total_amount + b.fine_amount - b.paid_amount - COALESCE(
                (SELECT SUM(amount) FROM cash_payments WHERE bill_id = b.id AND status = 'verified'), 0
            )) as due_amount
        FROM bills b
        WHERE b.tenant_id = ?
        ORDER BY b.created_at DESC
        `,
        [tenantId]
    );
    return rows;
};

const updateBillStatus = async (connection, billId, status, paidAmount = null) => {
    let query = `UPDATE bills SET status = ?`;
    const params = [status];
    
    if (paidAmount !== null) {
        query += `, paid_amount = paid_amount + ?`;
        params.push(paidAmount);
    }
    
    query += ` WHERE id = ?`;
    params.push(billId);
    
    const [result] = await connection.execute(query, params);
    return result.affectedRows;
};

const updateBillFine = async (connection, billId, fineAmount, validUntil, fineAppliedDays, lastFineEmailSent) => {
    const [result] = await connection.execute(
        `
        UPDATE bills
        SET 
            fine_amount = ?,
            valid_until = ?,
            status = 'delayed',
            fine_applied_days = ?,
            last_fine_email_sent = ?
        WHERE id = ?
        `,
        [fineAmount, validUntil, fineAppliedDays, lastFineEmailSent, billId]
    );
    return result.affectedRows;
};

/**
 * FIXED: Create bill payment with paid_from and paid_till
 */
const createBillPayment = async (connection, paymentData) => {
    const [result] = await connection.execute(
        `
        INSERT INTO bill_payments (
            bill_id,
            amount,
            payment_method,
            transaction_id,
            is_partial,
            paid_from,
            paid_till
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
            paymentData.bill_id,
            paymentData.amount,
            paymentData.payment_method || 'qr_code',
            paymentData.transaction_id || null,
            paymentData.is_partial || 0,
            paymentData.paid_from || null,
            paymentData.paid_till || null
        ]
    );
    return result.insertId;
};

/**
 * FIXED: Create cash payment with paid_from and paid_till
 */
const createCashPayment = async (connection, paymentData) => {
    const [result] = await connection.execute(
        `
        INSERT INTO cash_payments (
            bill_id,
            tenant_id,
            amount,
            paid_from,
            paid_till,
            verified_by,
            otp,
            status,
            notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            paymentData.bill_id,
            paymentData.tenant_id,
            paymentData.amount,
            paymentData.paid_from,
            paymentData.paid_till,
            paymentData.verified_by,
            paymentData.otp,
            'verified',
            paymentData.notes || null
        ]
    );
    return result.insertId;
};

const getCashPayments = async (filters = {}) => {
    let query = `
        SELECT 
            cp.*,
            t.full_name as tenant_name,
            t.email as tenant_email,
            t.phone as tenant_phone,
            p.name as pg_name,
            r.room_number,
            a.name as verified_by_name
        FROM cash_payments cp
        INNER JOIN tenants t ON cp.tenant_id = t.id
        LEFT JOIN tenant_details td ON t.id = td.tenant_id
        LEFT JOIN pgs p ON td.pg_id = p.id
        LEFT JOIN rooms r ON td.room_id = r.id
        LEFT JOIN admins a ON cp.verified_by = a.id
        WHERE 1=1
    `;
    const params = [];

    if (filters.tenant_id) {
        query += ` AND cp.tenant_id = ?`;
        params.push(filters.tenant_id);
    }

    if (filters.status) {
        query += ` AND cp.status = ?`;
        params.push(filters.status);
    }

    if (filters.search) {
        query += ` AND (t.full_name LIKE ? OR t.email LIKE ? OR t.phone LIKE ?)`;
        const searchPattern = `%${filters.search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
    }

    query += ` ORDER BY cp.created_at DESC`;

    const [rows] = await db.execute(query, params);
    return rows;
};

const getOverdueBills = async () => {
    const [rows] = await db.execute(
        `
        SELECT 
            b.*,
            t.full_name as tenant_name,
            t.email as tenant_email,
            td.payment_date as tenant_payment_date,
            DATEDIFF(NOW(), b.sent_at) as days_since_sent
        FROM bills b
        INNER JOIN tenants t ON b.tenant_id = t.id
        LEFT JOIN tenant_details td ON t.id = td.tenant_id
        WHERE b.status IN ('unpaid', 'partially_paid', 'delayed')
        AND b.valid_until < NOW()
        AND b.sent_at IS NOT NULL
        AND b.initial_email_sent = 1
        ORDER BY b.valid_until ASC
        `
    );
    return rows;
};

const getBillStats = async (filters = {}) => {
    let where = ` WHERE 1=1 `;
    const params = [];

    // Optional PG filter via tenant_details
    const needsJoin = !!filters.pg_id;
    if (filters.pg_id) {
        where += ` AND td.pg_id = ? `;
        params.push(filters.pg_id);
    }

    const fromClause = needsJoin
        ? ` FROM bills b
            INNER JOIN tenants t ON b.tenant_id = t.id
            LEFT JOIN tenant_details td ON t.id = td.tenant_id `
        : ` FROM bills b `;

    const [countRows] = await db.execute(
        `
        SELECT
            COUNT(*) as total,
            SUM(CASE WHEN b.status = 'unpaid' THEN 1 ELSE 0 END) as unpaid,
            SUM(CASE WHEN b.status = 'partially_paid' THEN 1 ELSE 0 END) as partially_paid,
            SUM(CASE WHEN b.status = 'paid' THEN 1 ELSE 0 END) as paid,
            SUM(CASE WHEN b.status = 'delayed' THEN 1 ELSE 0 END) as delayed_count,
            SUM(CASE WHEN b.status = 'overdue' THEN 1 ELSE 0 END) as overdue,
            COALESCE(SUM(b.total_amount), 0) as total_billed,
            COALESCE(SUM(b.paid_amount), 0) as total_paid_amount,
            COALESCE(SUM(b.fine_amount), 0) as total_fine_amount,
            COALESCE(SUM(
                GREATEST(
                    (b.total_amount + COALESCE(b.fine_amount, 0) - COALESCE(b.paid_amount, 0)),
                    0
                )
            ), 0) as total_due_amount
        ${fromClause}
        ${where}
        `,
        params
    );

    const row = countRows[0] || {};
    return {
        total: parseInt(row.total) || 0,
        unpaid: parseInt(row.unpaid) || 0,
        partially_paid: parseInt(row.partially_paid) || 0,
        paid: parseInt(row.paid) || 0,
        delayed: parseInt(row.delayed_count) || 0,
        overdue: parseInt(row.overdue) || 0,
        total_billed: parseFloat(row.total_billed) || 0,
        total_paid_amount: parseFloat(row.total_paid_amount) || 0,
        total_fine_amount: parseFloat(row.total_fine_amount) || 0,
        total_due_amount: parseFloat(row.total_due_amount) || 0
    };
};

const updateInitialEmailSent = async (connection, billId) => {
    const [result] = await connection.execute(
        `
        UPDATE bills SET initial_email_sent = 1 WHERE id = ?
        `,
        [billId]
    );
    return result.affectedRows;
};

const updateCustomMessage = async (connection, billId, messageData) => {
    const [result] = await connection.execute(
        `
        UPDATE bills 
        SET 
            custom_message_qr = ?,
            custom_message_qr_public_id = ?,
            custom_message_qr_resource_type = ?,
            custom_message_admin_qr = ?,
            custom_message_admin_qr_public_id = ?,
            custom_message_admin_qr_resource_type = ?,
            last_custom_message = ?,
            last_message_sent = NOW(),
            qr_expires_at = ?
        WHERE id = ?
        `,
        [
            messageData.qr_code_url || null,
            messageData.qr_code_public_id || null,
            messageData.qr_code_resource_type || null,
            messageData.admin_qr_url || null,
            messageData.admin_qr_public_id || null,
            messageData.admin_qr_resource_type || null,
            messageData.message || null,
            messageData.qr_expires_at || null,
            billId
        ]
    );
    return result.affectedRows;
};

const getActiveCustomMessage = async (billId) => {
    const [rows] = await db.execute(
        `
        SELECT 
            custom_message_qr,
            custom_message_qr_public_id,
            custom_message_qr_resource_type,
            custom_message_admin_qr,
            custom_message_admin_qr_public_id,
            custom_message_admin_qr_resource_type,
            last_custom_message,
            qr_expires_at,
            last_message_sent
        FROM bills
        WHERE id = ?
        AND qr_expires_at > NOW()
        AND status != 'paid'
        `,
        [billId]
    );
    return rows[0] || null;
};

const setCashPaymentOTP = async (connection, billId, otp, expiry) => {
    const [result] = await connection.execute(
        `
        UPDATE bills 
        SET 
            cash_payment_otp = ?,
            cash_payment_otp_expiry = ?,
            cash_payment_verified = 0,
            cash_payment_requested_at = NOW()
        WHERE id = ?
        `,
        [otp, expiry, billId]
    );
    return result.affectedRows;
};

const verifyCashPaymentOTP = async (connection, billId, otp) => {
    const [rows] = await connection.execute(
        `
        SELECT id, cash_payment_otp, cash_payment_otp_expiry, cash_payment_verified
        FROM bills
        WHERE id = ?
        AND cash_payment_otp = ?
        AND cash_payment_verified = 0
        AND cash_payment_otp_expiry > NOW()
        `,
        [billId, otp]
    );
    
    if (rows.length === 0) {
        return { valid: false, message: "Invalid or expired OTP" };
    }
    
    await connection.execute(
        `
        UPDATE bills 
        SET 
            cash_payment_verified = 1,
            cash_payment_verified_at = NOW()
        WHERE id = ?
        `,
        [billId]
    );
    
    return { valid: true, message: "OTP verified successfully" };
};

const clearCashPaymentOTP = async (connection, billId) => {
    await connection.execute(
        `
        UPDATE bills 
        SET 
            cash_payment_otp = NULL,
            cash_payment_otp_expiry = NULL,
            cash_payment_verified = 0,
            cash_payment_requested_at = NULL
        WHERE id = ?
        `,
        [billId]
    );
    return true;
};

const updateBillQRCodes = async (connection, billId, qrData) => {
    const [result] = await connection.execute(
        `
        UPDATE bills 
        SET 
            payment_qr = ?,
            payment_qr_public_id = ?,
            payment_qr_resource_type = ?,
            partial_payment_qr = ?,
            partial_payment_qr_public_id = ?,
            partial_payment_qr_resource_type = ?
        WHERE id = ?
        `,
        [
            qrData.payment_qr || null,
            qrData.payment_qr_public_id || null,
            qrData.payment_qr_resource_type || null,
            qrData.partial_payment_qr || null,
            qrData.partial_payment_qr_public_id || null,
            qrData.partial_payment_qr_resource_type || null,
            billId
        ]
    );
    return result.affectedRows;
};

module.exports = {
    createBill,
    getUnpaidTenants,
    getBills,
    getBillById,
    getBillsByTenant,
    updateBillStatus,
    updateBillFine,
    createBillPayment,
    createCashPayment,
    getCashPayments,
    getOverdueBills,
    getBillStats,
    updateInitialEmailSent,
    updateCustomMessage,
    getActiveCustomMessage,
    setCashPaymentOTP,
    verifyCashPaymentOTP,
    clearCashPaymentOTP,
    updateBillQRCodes
};