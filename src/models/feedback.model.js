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
            t.nationality,
            t.country_code,
            t.phone,
            t.gender,
            p.name as pg_name,
            r.room_number
        FROM tenant_feedbacks tf
        INNER JOIN tenants t ON tf.tenant_id = t.id
        INNER JOIN pgs p ON tf.pg_id = p.id
        LEFT JOIN tenant_details td ON t.id = td.tenant_id
        LEFT JOIN rooms r ON td.room_id = r.id
        WHERE tf.tenant_id = ?
        `,
        [tenantId]
    );
    return rows[0] || null;
};

const hasTenantGivenFeedback = async (tenantId) => {
    const [rows] = await db.execute(
        `SELECT id FROM tenant_feedbacks WHERE tenant_id = ? LIMIT 1`,
        [tenantId]
    );
    return rows.length > 0;
};

// Admin functions
const getAdminFeedbackStats = async () => {
    const [rows] = await db.execute(
        `
        SELECT 
            COUNT(*) as total_feedbacks,
            COUNT(CASE WHEN overall_rating >= 7 THEN 1 END) as positive_feedbacks,
            COUNT(CASE WHEN overall_rating <= 5 THEN 1 END) as negative_feedbacks,
            ROUND(AVG(overall_rating), 1) as avg_rating,
            ROUND(AVG(living_experience_rating), 1) as avg_living_experience,
            ROUND(AVG(maintenance_handling_rating), 1) as avg_maintenance_handling,
            ROUND(AVG(communication_rating), 1) as avg_communication,
            ROUND(AVG(amenities_rating), 1) as avg_amenities,
            ROUND(AVG(technology_handling_rating), 1) as avg_technology_handling
        FROM tenant_feedbacks
        `
    );
    return rows[0] || null;
};

const getAllFeedbacksAdmin = async (filters = {}) => {
    let query = `
        SELECT 
            tf.*,
            t.full_name as tenant_name,
            t.email as tenant_email,
            t.nationality,
            t.country_code,
            t.phone,
            t.gender,
            t.created_at as tenant_created_at,
            p.name as pg_name,
            r.room_number,
            DATE(tf.created_at) as feedback_date
        FROM tenant_feedbacks tf
        INNER JOIN tenants t ON tf.tenant_id = t.id
        INNER JOIN pgs p ON tf.pg_id = p.id
        LEFT JOIN tenant_details td ON t.id = td.tenant_id
        LEFT JOIN rooms r ON td.room_id = r.id
        WHERE 1=1
    `;
    const params = [];

    // Filter by PG ID
    if (filters.pg_id) {
        query += ` AND tf.pg_id = ?`;
        params.push(parseInt(filters.pg_id));
    }

    // Filter by PG Name (search)
    if (filters.pg_name) {
        query += ` AND p.name LIKE ?`;
        params.push(`%${filters.pg_name}%`);
    }

    // Filter by feedback type (positive, negative, all)
    if (filters.type) {
        if (filters.type === 'positive') {
            query += ` AND tf.overall_rating >= 7`;
        } else if (filters.type === 'negative') {
            query += ` AND tf.overall_rating <= 5`;
        }
    }

    // Filter by nationality
    if (filters.nationality) {
        query += ` AND t.nationality = ?`;
        params.push(filters.nationality);
    }

    // Filter by gender
    if (filters.gender) {
        query += ` AND t.gender = ?`;
        params.push(filters.gender);
    }

    query += ` ORDER BY tf.created_at DESC`;

    const [rows] = await db.execute(query, params);
    return rows;
};

// Public functions (No Auth) - Shows EACH PG individually with its rating
const getPublicPGReviews = async () => {
    // Get ALL PGs (including those with 0 reviews)
    const [pgData] = await db.execute(
        `
        SELECT 
            p.id as pg_id,
            p.name as pg_name,
            COALESCE(ROUND(AVG(tf.overall_rating), 1), 0) as overall_rating,
            COUNT(tf.id) as total_reviews
        FROM pgs p
        LEFT JOIN tenant_feedbacks tf ON p.id = tf.pg_id
        WHERE p.is_active = 1
        GROUP BY p.id, p.name
        ORDER BY p.name ASC
        `
    );

    // For each PG, get the reviews (name + comment only)
    const result = [];
    for (const pg of pgData) {
        let reviews = [];
        
        // Only get reviews if PG has reviews
        if (pg.total_reviews > 0) {
            const [reviewRows] = await db.execute(
                `
                SELECT 
                    t.full_name as name,
                    tf.comment
                FROM tenant_feedbacks tf
                INNER JOIN tenants t ON tf.tenant_id = t.id
                WHERE tf.pg_id = ?
                ORDER BY tf.created_at DESC
                LIMIT 50
                `,
                [pg.pg_id]
            );
            reviews = reviewRows;
        }

        result.push({
            pg_id: pg.pg_id,
            pg_name: pg.pg_name,
            overall_rating: parseFloat(pg.overall_rating) || 0,
            total_reviews: pg.total_reviews,
            reviews: reviews // Only name + comment
        });
    }

    return result;
};

module.exports = {
    createFeedback,
    getFeedbackByTenant,
    hasTenantGivenFeedback,
    getAdminFeedbackStats,
    getAllFeedbacksAdmin,
    getPublicPGReviews
};