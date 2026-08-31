const db = require("../config/db");

/**
 * Create notification log
 */
const createLog = async (connection, logData) => {
    const [result] = await connection.execute(
        `
        INSERT INTO admin_notification_logs (
            admin_id,
            recipient_type,
            recipient_count,
            title,
            message,
            send_push,
            send_email
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
            logData.admin_id,
            logData.recipient_type,
            logData.recipient_count,
            logData.title,
            logData.message,
            logData.send_push ? 1 : 0,
            logData.send_email ? 1 : 0
        ]
    );
    return result.insertId;
};

/**
 * Get notification logs with filters
 */
const getLogs = async (filters = {}) => {
    let query = `
        SELECT 
            nl.*,
            a.name as admin_name,
            a.email as admin_email
        FROM admin_notification_logs nl
        LEFT JOIN admins a ON nl.admin_id = a.id
        WHERE 1=1
    `;
    const params = [];

    if (filters.admin_id) {
        query += ` AND nl.admin_id = ?`;
        params.push(filters.admin_id);
    }

    if (filters.recipient_type) {
        query += ` AND nl.recipient_type = ?`;
        params.push(filters.recipient_type);
    }

    if (filters.from_date) {
        query += ` AND DATE(nl.sent_at) >= ?`;
        params.push(filters.from_date);
    }

    if (filters.to_date) {
        query += ` AND DATE(nl.sent_at) <= ?`;
        params.push(filters.to_date);
    }

    query += ` ORDER BY nl.sent_at DESC`;

    const [rows] = await db.execute(query, params);
    return rows;
};

/**
 * Get log by ID
 */
const getLogById = async (logId) => {
    const [rows] = await db.execute(
        `
        SELECT 
            nl.*,
            a.name as admin_name,
            a.email as admin_email
        FROM admin_notification_logs nl
        LEFT JOIN admins a ON nl.admin_id = a.id
        WHERE nl.id = ?
        `,
        [logId]
    );
    return rows[0] || null;
};

module.exports = {
    createLog,
    getLogs,
    getLogById
};