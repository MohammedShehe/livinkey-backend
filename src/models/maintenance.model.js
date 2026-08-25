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

const getAllRequests = async (filters = {}) => {
    let query = `
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
        WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
        query += ` AND mr.status = ?`;
        params.push(filters.status);
    }

    if (filters.issue_type) {
        query += ` AND mr.issue_type = ?`;
        params.push(filters.issue_type);
    }

    if (filters.pg_id) {
        query += ` AND td.pg_id = ?`;
        params.push(parseInt(filters.pg_id));
    }

    if (filters.search) {
        query += ` AND (t.full_name LIKE ? OR r.room_number LIKE ? OR t.email LIKE ?)`;
        const searchPattern = `%${filters.search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
    }

    query += ` ORDER BY 
        CASE mr.status 
            WHEN 'pending' THEN 1 
            WHEN 'in_progress' THEN 2 
            WHEN 'completed' THEN 3 
        END, 
        mr.created_at DESC`;

    const [rows] = await db.execute(query, params);
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

const getAdminStats = async (filters = {}) => {
    let query = `
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
        FROM maintenance_requests mr
        INNER JOIN tenants t ON mr.tenant_id = t.id
        LEFT JOIN tenant_details td ON t.id = td.tenant_id
        WHERE 1=1
    `;
    const params = [];

    if (filters.pg_id) {
        query += ` AND td.pg_id = ?`;
        params.push(parseInt(filters.pg_id));
    }

    const [rows] = await db.execute(query, params);
    return rows[0] || { total: 0, pending: 0, in_progress: 0, completed: 0 };
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