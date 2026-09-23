const db = require("../config/db");

const create = async ({
    tenantId = null,
    guestId = null,
    pgId = null,
    actorType,
    actorName,
    actorPosition,
    action,
    module,
    entityType = null,
    entityId = null,
    metadata = {},
    ipAddress = null,
    userAgent = null,
    deviceInfo = null,
    performedByAdminId = null
}) => {
    const [result] = await db.execute(
        `INSERT INTO activity_logs
        (tenant_id, guest_id, pg_id, actor_type, actor_name, actor_position, action, module,
         entity_type, entity_id, metadata, ip_address, user_agent, device_info, performed_by_admin_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            tenantId, guestId, pgId, actorType, actorName || null, actorPosition || null,
            action, module, entityType, entityId,
            JSON.stringify(metadata || {}), ipAddress, userAgent, deviceInfo,
            performedByAdminId
        ]
    );
    return result.insertId;
};

const list = async (filters = {}) => {
    let query = `
        SELECT
            al.*,
            t.full_name AS tenant_name,
            t.email AS tenant_email,
            p.name AS pg_name,
            a.name AS admin_name,
            a.role AS admin_role
        FROM activity_logs al
        LEFT JOIN tenants t ON al.tenant_id = t.id
        LEFT JOIN pgs p ON al.pg_id = p.id
        LEFT JOIN admins a ON al.performed_by_admin_id = a.id
        WHERE 1=1
    `;
    const params = [];

    if (filters.tenant_id) { query += " AND al.tenant_id = ?"; params.push(filters.tenant_id); }
    if (filters.guest_id) { query += " AND al.guest_id = ?"; params.push(filters.guest_id); }
    if (filters.pg_id) { query += " AND al.pg_id = ?"; params.push(filters.pg_id); }
    if (filters.actor_type) { query += " AND al.actor_type = ?"; params.push(filters.actor_type); }
    if (filters.module) { query += " AND al.module = ?"; params.push(filters.module); }
    if (filters.action) { query += " AND al.action = ?"; params.push(filters.action); }
    if (filters.app_status === "installed") {
        query += " AND EXISTS (SELECT 1 FROM tenant_devices td WHERE td.tenant_id = al.tenant_id AND td.is_active = 1)";
    }
    if (filters.app_status === "not_installed") {
        query += " AND NOT EXISTS (SELECT 1 FROM tenant_devices td WHERE td.tenant_id = al.tenant_id AND td.is_active = 1)";
    }
    if (filters.from) { query += " AND al.created_at >= ?"; params.push(`${filters.from} 00:00:00`); }
    if (filters.to) { query += " AND al.created_at <= ?"; params.push(`${filters.to} 23:59:59`); }

    query += " ORDER BY al.created_at DESC LIMIT ? OFFSET ?";
    const limit = Math.min(Math.max(parseInt(filters.limit, 10) || 50, 1), 500);
    const offset = Math.max(parseInt(filters.offset, 10) || 0, 0);
    params.push(limit, offset);

    // mysql2 execute accepts numeric LIMIT/OFFSET bindings on current versions,
    // but inline validated integers for compatibility with older deployments.
    const finalQuery = query.replace("LIMIT ? OFFSET ?", `LIMIT ${limit} OFFSET ${offset}`);
    params.splice(-2, 2);

    const [rows] = await db.execute(finalQuery, params);
    return rows.map(row => {
        let metadata = {};
        try { metadata = typeof row.metadata === "string" ? JSON.parse(row.metadata) : (row.metadata || {}); }
        catch (_) {}
        return { ...row, metadata };
    });
};

const count = async (filters = {}) => {
    // Keep count semantics aligned with list() filters.
    let query = `
        SELECT COUNT(*) AS total
        FROM activity_logs al
        WHERE 1=1
    `;
    const params = [];
    if (filters.tenant_id) { query += " AND al.tenant_id = ?"; params.push(filters.tenant_id); }
    if (filters.guest_id) { query += " AND al.guest_id = ?"; params.push(filters.guest_id); }
    if (filters.pg_id) { query += " AND al.pg_id = ?"; params.push(filters.pg_id); }
    if (filters.actor_type) { query += " AND al.actor_type = ?"; params.push(filters.actor_type); }
    if (filters.module) { query += " AND al.module = ?"; params.push(filters.module); }
    if (filters.action) { query += " AND al.action = ?"; params.push(filters.action); }
    if (filters.app_status === "installed") query += " AND EXISTS (SELECT 1 FROM tenant_devices td WHERE td.tenant_id = al.tenant_id AND td.is_active = 1)";
    if (filters.app_status === "not_installed") query += " AND NOT EXISTS (SELECT 1 FROM tenant_devices td WHERE td.tenant_id = al.tenant_id AND td.is_active = 1)";
    if (filters.from) { query += " AND al.created_at >= ?"; params.push(`${filters.from} 00:00:00`); }
    if (filters.to) { query += " AND al.created_at <= ?"; params.push(`${filters.to} 23:59:59`); }
    const [rows] = await db.execute(query, params);
    return Number(rows[0]?.total || 0);
};

const getStats = async () => {
    const [rows] = await db.execute(`
        SELECT
            COUNT(*) AS total_activities,
            COUNT(DISTINCT tenant_id) AS active_profiles,
            COUNT(DISTINCT CASE WHEN actor_type = 'tenant' THEN tenant_id END) AS tenant_actors,
            COUNT(DISTINCT CASE WHEN actor_type = 'guest' THEN guest_id END) AS guest_actors
        FROM activity_logs
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);
    const [app] = await db.execute(`
        SELECT
            COUNT(DISTINCT t.id) AS total_tenants,
            COUNT(DISTINCT CASE WHEN td.tenant_id IS NOT NULL THEN t.id END) AS installed_tenants
        FROM tenants t
        LEFT JOIN tenant_devices td ON td.tenant_id = t.id AND td.is_active = 1
        WHERE t.role IN ('tenant','guest') AND t.is_active = 1
    `);
    const [pgs] = await db.execute(`
        SELECT p.id, p.name,
               COUNT(DISTINCT t.id) AS total_users,
               COUNT(DISTINCT CASE WHEN td.tenant_id IS NOT NULL THEN t.id END) AS installed_users
        FROM pgs p
        LEFT JOIN tenant_details d ON d.pg_id = p.id
        LEFT JOIN tenants t ON t.id = d.tenant_id AND t.is_active = 1
        LEFT JOIN tenant_devices td ON td.tenant_id = t.id AND td.is_active = 1
        GROUP BY p.id, p.name
        ORDER BY p.name
    `);
    return {
        last_30_days: rows[0] || {},
        app_adoption: app[0] || {},
        per_pg: pgs
    };
};

module.exports = { create, list, count, getStats };
