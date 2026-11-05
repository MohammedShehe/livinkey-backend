const db = require("../config/db");

const createMaintenanceRequest = async (connection, requestData) => {
    const [result] = await connection.execute(
        `
        INSERT INTO maintenance_requests (
            tenant_id,
            room_id,
            issue_type,
            description,
            service_date,
            free_time,
            image_url,
            image_public_id,
            image_resource_type,
            status,
            created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            requestData.tenant_id,
            requestData.room_id,
            requestData.issue_type,
            requestData.description || null,
            requestData.service_date,
            requestData.free_time || null,
            requestData.image_url || null,
            requestData.image_public_id || null,
            requestData.image_resource_type || null,
            'pending',
            requestData.created_by
        ]
    );
    return result.insertId;
};

const getRequestsByTenant = async (tenantId, status = null) => {
    let query = `
        SELECT 
            mr.*,
            t.full_name as tenant_name,
            t.email as tenant_email,
            t.phone as tenant_phone,
            r.room_number,
            p.name as pg_name,
            DATE(mr.created_at) as request_date,
            TIME(mr.created_at) as request_time
        FROM maintenance_requests mr
        INNER JOIN tenants t ON mr.tenant_id = t.id
        INNER JOIN rooms r ON mr.room_id = r.id
        LEFT JOIN tenant_details td ON t.id = td.tenant_id
        LEFT JOIN pgs p ON td.pg_id = p.id
        WHERE mr.tenant_id = ?
    `;
    const params = [tenantId];

    if (status) {
        query += ` AND mr.status = ?`;
        params.push(status);
    }

    query += ` ORDER BY mr.created_at DESC`;

    const [rows] = await db.execute(query, params);
    return rows;
};

const getRequestById = async (requestId) => {
    const [rows] = await db.execute(
        `
        SELECT 
            mr.*,
            t.full_name as tenant_name,
            t.email as tenant_email,
            t.phone as tenant_phone,
            t.nationality,
            t.gender,
            r.room_number,
            p.name as pg_name,
            DATE(mr.created_at) as request_date,
            TIME(mr.created_at) as request_time
        FROM maintenance_requests mr
        INNER JOIN tenants t ON mr.tenant_id = t.id
        INNER JOIN rooms r ON mr.room_id = r.id
        LEFT JOIN tenant_details td ON t.id = td.tenant_id
        LEFT JOIN pgs p ON td.pg_id = p.id
        WHERE mr.id = ?
        `,
        [requestId]
    );
    return rows[0] || null;
};

// ------------------------------------------------------------------
// Admin listing / stats. A request belongs to the PG of the ROOM it was raised
// for (rooms -> floors -> pgs), the same rule bills use, so it stays correct
// even if the tenant later moves.
// ------------------------------------------------------------------
const ADMIN_FROM = `
    FROM maintenance_requests mr
    INNER JOIN tenants t ON mr.tenant_id = t.id
    INNER JOIN rooms r ON mr.room_id = r.id
    LEFT JOIN floors fl ON fl.id = r.floor_id
    LEFT JOIN pgs p ON p.id = fl.pg_id
`;
const OVERDUE_SQL = `(mr.status <> 'completed' AND mr.service_date < CURDATE())`;
const STATUSES = ["pending", "in_progress", "completed"];
const SORTS = {
    status: `CASE mr.status WHEN 'pending' THEN 1 WHEN 'in_progress' THEN 2 ELSE 3 END, mr.created_at DESC`,
    newest: `mr.created_at DESC`,
    oldest: `mr.created_at ASC`,
    service_asc: `mr.service_date ASC, mr.created_at DESC`,
    service_desc: `mr.service_date DESC, mr.created_at DESC`,
    pg: `p.name ASC, r.room_number ASC, mr.created_at DESC`
};

/**
 * Builds the shared WHERE clause.
 *   status      pending | in_progress | completed | open (= pending + in_progress)
 *   issue_type  exact type
 *   pg_id       PG of the room
 *   month       YYYY-MM  (by date_field)
 *   date_field  created (date requested, default) | service (service date)
 *   from / to   YYYY-MM-DD inclusive range (by date_field)
 *   overdue     1 = not completed and the service date has passed
 *   has_image   1 = with a photo, 0 = without
 *   search      tenant name / email / phone, room, PG, type, description
 */
function buildAdminWhere(filters = {}, { skipStatus = false } = {}) {
    let where = " WHERE 1=1";
    const params = [];
    const col = filters.date_field === "service" ? "mr.service_date" : "mr.created_at";

    if (!skipStatus && filters.status) {
        if (filters.status === "open") where += ` AND mr.status IN ('pending','in_progress')`;
        else if (STATUSES.includes(filters.status)) { where += ` AND mr.status = ?`; params.push(filters.status); }
    }
    if (filters.issue_type) { where += ` AND mr.issue_type = ?`; params.push(filters.issue_type); }
    if (filters.pg_id) { where += ` AND fl.pg_id = ?`; params.push(parseInt(filters.pg_id, 10)); }
    if (filters.month && /^\d{4}-(0[1-9]|1[0-2])$/.test(filters.month)) {
        where += ` AND ${col} >= ? AND ${col} < DATE_ADD(?, INTERVAL 1 MONTH)`;
        params.push(`${filters.month}-01`, `${filters.month}-01`);
    }
    if (filters.from && /^\d{4}-\d{2}-\d{2}$/.test(filters.from)) { where += ` AND ${col} >= ?`; params.push(filters.from); }
    if (filters.to && /^\d{4}-\d{2}-\d{2}$/.test(filters.to)) { where += ` AND ${col} < DATE_ADD(?, INTERVAL 1 DAY)`; params.push(filters.to); }
    if (filters.overdue === "1" || filters.overdue === 1 || filters.overdue === true) where += ` AND ${OVERDUE_SQL}`;
    if (filters.has_image === "1") where += ` AND mr.image_url IS NOT NULL AND mr.image_url <> ''`;
    if (filters.has_image === "0") where += ` AND (mr.image_url IS NULL OR mr.image_url = '')`;
    if (filters.search && String(filters.search).trim()) {
        where += ` AND (t.full_name LIKE ? OR t.email LIKE ? OR t.phone LIKE ? OR r.room_number LIKE ? OR p.name LIKE ? OR mr.issue_type LIKE ? OR mr.description LIKE ?)`;
        const like = `%${String(filters.search).trim()}%`;
        params.push(like, like, like, like, like, like, like);
    }
    return { where, params };
}

const getAllRequests = async (filters = {}) => {
    const { where, params } = buildAdminWhere(filters);
    const order = SORTS[filters.sort] || SORTS.status;
    const [rows] = await db.query(
        `SELECT
            mr.*,
            t.full_name as tenant_name,
            t.email as tenant_email,
            t.phone as tenant_phone,
            t.nationality,
            t.gender,
            r.room_number,
            fl.pg_id as pg_id,
            p.name as pg_name,
            DATE(mr.created_at) as request_date,
            TIME(mr.created_at) as request_time,
            DATE_FORMAT(mr.created_at, '%Y-%m') as request_month,
            DATEDIFF(CURDATE(), DATE(mr.created_at)) as age_days,
            ${OVERDUE_SQL} as is_overdue,
            CASE WHEN mr.status = 'completed' THEN TIMESTAMPDIFF(HOUR, mr.created_at, mr.updated_at) END as resolution_hours
         ${ADMIN_FROM}
         ${where}
         ORDER BY ${order}
         LIMIT 5000`,
        params
    );
    return rows;
};

const getTenantStats = async (tenantId) => {
    const [rows] = await db.execute(
        `
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
        FROM maintenance_requests
        WHERE tenant_id = ?
        `,
        [tenantId]
    );
    return rows[0] || { total: 0, pending: 0, in_progress: 0, completed: 0 };
};

/**
 * Counts for the summary cards. The status filter is ignored on purpose so the
 * cards always show the whole picture for the chosen PG / month / type, plus the
 * lists needed to fill the filter drop-downs.
 */
const getAdminStats = async (filters = {}) => {
    const { where, params } = buildAdminWhere(filters, { skipStatus: true });
    const [[sum]] = await db.query(
        `SELECT
            COUNT(*) as total,
            COALESCE(SUM(mr.status = 'pending'), 0) as pending,
            COALESCE(SUM(mr.status = 'in_progress'), 0) as in_progress,
            COALESCE(SUM(mr.status = 'completed'), 0) as completed,
            COALESCE(SUM(${OVERDUE_SQL}), 0) as overdue,
            ROUND(AVG(CASE WHEN mr.status = 'completed' THEN TIMESTAMPDIFF(HOUR, mr.created_at, mr.updated_at) END), 1) as avg_resolution_hours
         ${ADMIN_FROM} ${where}`, params);
    const [types] = await db.query(
        `SELECT mr.issue_type as issue_type, COUNT(*) as count ${ADMIN_FROM} ${where} GROUP BY mr.issue_type ORDER BY count DESC`, params);
    // Months that have requests (ignores the month / range filter so the list never shrinks to one entry)
    const { where: w2, params: p2 } = buildAdminWhere({ ...filters, month: null, from: null, to: null }, { skipStatus: true });
    const dcol = filters.date_field === "service" ? "mr.service_date" : "mr.created_at";
    const [months] = await db.query(
        `SELECT DATE_FORMAT(${dcol}, '%Y-%m') as month, COUNT(*) as count ${ADMIN_FROM} ${w2} GROUP BY month ORDER BY month DESC LIMIT 36`, p2);
    return {
        total: Number(sum.total) || 0, pending: Number(sum.pending) || 0, in_progress: Number(sum.in_progress) || 0,
        completed: Number(sum.completed) || 0, overdue: Number(sum.overdue) || 0,
        avg_resolution_hours: sum.avg_resolution_hours === null ? null : Number(sum.avg_resolution_hours),
        types, months
    };
};

// ============================================================
// UPDATED: updateRequestStatus now accepts completed_by
// ============================================================
const updateRequestStatus = async (connection, requestId, status, completedBy = null) => {
    let query = `UPDATE maintenance_requests SET status = ?, updated_at = NOW()`;
    const params = [status];

    if (status === 'completed' && completedBy) {
        query += `, completed_by = ?`;
        params.push(completedBy);
    }

    query += ` WHERE id = ?`;
    params.push(requestId);

    const [result] = await connection.execute(query, params);
    return result.affectedRows;
};

const deleteRequest = async (connection, requestId) => {
    const [result] = await connection.execute(
        `DELETE FROM maintenance_requests WHERE id = ?`,
        [requestId]
    );
    return result.affectedRows;
};

module.exports = {
    createMaintenanceRequest,
    getRequestsByTenant,
    getRequestById,
    getAllRequests,
    getTenantStats,
    getAdminStats,
    updateRequestStatus,
    deleteRequest
};