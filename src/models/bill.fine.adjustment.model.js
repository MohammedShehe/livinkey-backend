const db = require("../config/db");

/**
 * Create a fine adjustment record
 */
const createFineAdjustment = async (connection, adjustmentData) => {
    const [result] = await connection.execute(
        `
        INSERT INTO bill_fine_adjustments (
            bill_id,
            admin_id,
            old_fine_amount,
            new_fine_amount,
            reason,
            adjusted_at
        ) VALUES (?, ?, ?, ?, ?, NOW())
        `,
        [
            adjustmentData.bill_id,
            adjustmentData.admin_id,
            adjustmentData.old_fine_amount,
            adjustmentData.new_fine_amount,
            adjustmentData.reason
        ]
    );
    return result.insertId;
};

/**
 * Get fine adjustment history for a bill
 */
const getFineAdjustmentsByBillId = async (billId) => {
    const [rows] = await db.execute(
        `
        SELECT 
            bfa.id,
            bfa.bill_id,
            bfa.admin_id,
            bfa.old_fine_amount,
            bfa.new_fine_amount,
            bfa.reason,
            bfa.adjusted_at,
            a.name as admin_name,
            a.email as admin_email
        FROM bill_fine_adjustments bfa
        LEFT JOIN admins a ON bfa.admin_id = a.id
        WHERE bfa.bill_id = ?
        ORDER BY bfa.adjusted_at DESC
        `,
        [billId]
    );
    return rows;
};

/**
 * Get all fine adjustments with filters
 */
const getFineAdjustments = async (filters = {}) => {
    let query = `
        SELECT 
            bfa.*,
            a.name as admin_name,
            t.full_name as tenant_name,
            t.email as tenant_email
        FROM bill_fine_adjustments bfa
        LEFT JOIN admins a ON bfa.admin_id = a.id
        LEFT JOIN bills b ON bfa.bill_id = b.id
        LEFT JOIN tenants t ON b.tenant_id = t.id
        WHERE 1=1
    `;
    const params = [];

    if (filters.bill_id) {
        query += ` AND bfa.bill_id = ?`;
        params.push(filters.bill_id);
    }

    if (filters.admin_id) {
        query += ` AND bfa.admin_id = ?`;
        params.push(filters.admin_id);
    }

    if (filters.from_date) {
        query += ` AND DATE(bfa.adjusted_at) >= ?`;
        params.push(filters.from_date);
    }

    if (filters.to_date) {
        query += ` AND DATE(bfa.adjusted_at) <= ?`;
        params.push(filters.to_date);
    }

    query += ` ORDER BY bfa.adjusted_at DESC`;

    const [rows] = await db.execute(query, params);
    return rows;
};

module.exports = {
    createFineAdjustment,
    getFineAdjustmentsByBillId,
    getFineAdjustments
};