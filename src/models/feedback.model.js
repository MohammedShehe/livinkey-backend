const db = require("../config/db");

const createFeedback = async (connection, feedbackData) => {
    const [result] = await connection.execute(
        `
        INSERT INTO tenant_feedbacks (
            tenant_id,
            pg_id,
            living_experience_rating,
            maintenance_handling_rating,
            communication_rating,
            amenities_rating,
            technology_handling_rating,
            overall_rating,
            comment
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            feedbackData.tenant_id,
            feedbackData.pg_id,
            feedbackData.living_experience_rating,
            feedbackData.maintenance_handling_rating,
            feedbackData.communication_rating,
            feedbackData.amenities_rating,
            feedbackData.technology_handling_rating,
            feedbackData.overall_rating,
            feedbackData.comment || null
        ]
    );
    return result.insertId;
};

const getFeedbackByTenant = async (tenantId) => {
    const [rows] = await db.execute(
        `
        SELECT 
            tf.*,
            t.full_name as tenant_name,
            t.email as tenant_email,
            p.name as pg_name
        FROM tenant_feedbacks tf
        INNER JOIN tenants t ON tf.tenant_id = t.id
        INNER JOIN pgs p ON tf.pg_id = p.id
        WHERE tf.tenant_id = ?
        `,
        [tenantId]
    );
    return rows[0] || null;
};

const getFeedbackByPG = async (pgId) => {
    const [rows] = await db.execute(
        `
        SELECT 
            tf.*,
            t.full_name as tenant_name,
            t.email as tenant_email,
            p.name as pg_name
        FROM tenant_feedbacks tf
        INNER JOIN tenants t ON tf.tenant_id = t.id
        INNER JOIN pgs p ON tf.pg_id = p.id
        WHERE tf.pg_id = ?
        ORDER BY tf.created_at DESC
        `,
        [pgId]
    );
    return rows;
};

const getAllFeedbacks = async (pgId = null, search = null) => {
    let query = `
        SELECT 
            tf.*,
            t.full_name as tenant_name,
            t.email as tenant_email,
            p.name as pg_name
        FROM tenant_feedbacks tf
        INNER JOIN tenants t ON tf.tenant_id = t.id
        INNER JOIN pgs p ON tf.pg_id = p.id
        WHERE 1=1
    `;
    const params = [];

    if (pgId) {
        query += ` AND tf.pg_id = ?`;
        params.push(pgId);
    }

    if (search) {
        query += ` AND (t.full_name LIKE ? OR t.email LIKE ? OR p.name LIKE ?)`;
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
    }

    query += ` ORDER BY tf.created_at DESC`;

    const [rows] = await db.execute(query, params);
    return rows;
};

const getFeedbackStats = async (pgId = null) => {
    let query = `
        SELECT 
            COUNT(*) as total_feedbacks,
            AVG(living_experience_rating) as avg_living_experience,
            AVG(maintenance_handling_rating) as avg_maintenance_handling,
            AVG(communication_rating) as avg_communication,
            AVG(amenities_rating) as avg_amenities,
            AVG(technology_handling_rating) as avg_technology_handling,
            AVG(overall_rating) as avg_overall
        FROM tenant_feedbacks tf
        WHERE 1=1
    `;
    const params = [];

    if (pgId) {
        query += ` AND tf.pg_id = ?`;
        params.push(pgId);
    }

    const [rows] = await db.execute(query, params);
    return rows[0] || null;
};

const hasTenantGivenFeedback = async (tenantId) => {
    const [rows] = await db.execute(
        `SELECT id FROM tenant_feedbacks WHERE tenant_id = ? LIMIT 1`,
        [tenantId]
    );
    return rows.length > 0;
};

const getPGIdByTenant = async (tenantId) => {
    const [rows] = await db.execute(
        `
        SELECT pg_id FROM tenant_details WHERE tenant_id = ?
        `,
        [tenantId]
    );
    return rows[0]?.pg_id || null;
};

module.exports = {
    createFeedback,
    getFeedbackByTenant,
    getFeedbackByPG,
    getAllFeedbacks,
    getFeedbackStats,
    hasTenantGivenFeedback,
    getPGIdByTenant
};