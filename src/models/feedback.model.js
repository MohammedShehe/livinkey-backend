const db = require("../config/db");

// ============================================================
// CREATE FEEDBACK (Tenant or Guest)
// ============================================================
const createFeedback = async (connection, feedbackData) => {
    const [result] = await connection.execute(
        `
        INSERT INTO tenant_feedbacks (
            tenant_id,
            user_type,
            pg_id,
            living_experience_rating,
            maintenance_handling_rating,
            communication_rating,
            amenities_rating,
            technology_handling_rating,
            overall_rating,
            comment
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            feedbackData.user_id,
            feedbackData.user_type || 'tenant',
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

// ============================================================
// CHECK IF USER HAS GIVEN FEEDBACK
// ============================================================
const hasUserGivenFeedback = async (connection, userId, userType) => {
    const conn = connection || await db.getConnection();
    const [rows] = await conn.execute(
        `SELECT id FROM tenant_feedbacks WHERE tenant_id = ? AND user_type = ? LIMIT 1`,
        [userId, userType]
    );
    if (!connection) conn.release();
    return rows.length > 0;
};

// ============================================================
// GET FEEDBACK BY USER
// ============================================================
const getFeedbackByUser = async (userId, userType) => {
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
            r.room_number,
            tf.user_type
        FROM tenant_feedbacks tf
        INNER JOIN tenants t ON tf.tenant_id = t.id
        INNER JOIN pgs p ON tf.pg_id = p.id
        LEFT JOIN tenant_details td ON t.id = td.tenant_id
        LEFT JOIN rooms r ON td.room_id = r.id
        WHERE tf.tenant_id = ? AND tf.user_type = ?
        `,
        [userId, userType]
    );
    return rows[0] || null;
};

// ============================================================
// GET FEEDBACK BY ID
// ============================================================
const getFeedbackById = async (feedbackId) => {
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
            r.room_number,
            tf.user_type
        FROM tenant_feedbacks tf
        INNER JOIN tenants t ON tf.tenant_id = t.id
        INNER JOIN pgs p ON tf.pg_id = p.id
        LEFT JOIN tenant_details td ON t.id = td.tenant_id
        LEFT JOIN rooms r ON td.room_id = r.id
        WHERE tf.id = ?
        `,
        [feedbackId]
    );
    return rows[0] || null;
};

// ============================================================
// GET PUBLIC FEEDBACK BY ID
// ============================================================
const getPublicFeedbackById = async (feedbackId) => {
    const [rows] = await db.execute(
        `
        SELECT 
            pf.*,
            p.name as pg_name
        FROM public_feedbacks pf
        INNER JOIN pgs p ON pf.pg_id = p.id
        WHERE pf.id = ?
        `,
        [feedbackId]
    );
    return rows[0] || null;
};

// ============================================================
// CHECK IF PUBLIC USER HAS GIVEN FEEDBACK
// ============================================================
const hasPublicUserGivenFeedback = async (email, phone) => {
    const [rows] = await db.execute(
        `SELECT id FROM public_feedbacks WHERE email = ? AND phone = ? LIMIT 1`,
        [email, phone]
    );
    return rows.length > 0;
};

// ============================================================
// ADMIN FUNCTIONS
// ============================================================

const getAdminFeedbackStats = async () => {
    // Get tenant/guest feedback stats
    const [tenantRows] = await db.execute(
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
            ROUND(AVG(technology_handling_rating), 1) as avg_technology_handling,
            COUNT(CASE WHEN user_type = 'tenant' THEN 1 END) as tenant_feedbacks,
            COUNT(CASE WHEN user_type = 'guest' THEN 1 END) as guest_feedbacks
        FROM tenant_feedbacks
        `
    );

    // Get public feedback stats
    const [publicRows] = await db.execute(
        `
        SELECT 
            COUNT(*) as total_public_feedbacks,
            ROUND(AVG(overall_rating), 1) as avg_public_rating
        FROM public_feedbacks
        `
    );

    return {
        ...tenantRows[0],
        ...publicRows[0],
        total_feedbacks: (tenantRows[0]?.total_feedbacks || 0) + (publicRows[0]?.total_public_feedbacks || 0)
    };
};

const getAllFeedbacksAdmin = async (filters = {}) => {
    let tenantQuery = `
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
            DATE(tf.created_at) as feedback_date,
            'user' as feedback_type,
            tf.user_type
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
        tenantQuery += ` AND tf.pg_id = ?`;
        params.push(parseInt(filters.pg_id));
    }

    // Filter by PG Name (search)
    if (filters.pg_name) {
        tenantQuery += ` AND p.name LIKE ?`;
        params.push(`%${filters.pg_name}%`);
    }

    // Filter by feedback type (positive, negative, all)
    if (filters.type) {
        if (filters.type === 'positive') {
            tenantQuery += ` AND tf.overall_rating >= 7`;
        } else if (filters.type === 'negative') {
            tenantQuery += ` AND tf.overall_rating <= 5`;
        }
    }

    // Filter by nationality
    if (filters.nationality) {
        tenantQuery += ` AND t.nationality = ?`;
        params.push(filters.nationality);
    }

    // Filter by gender
    if (filters.gender) {
        tenantQuery += ` AND t.gender = ?`;
        params.push(filters.gender);
    }

    // Filter by user_type (tenant, guest)
    if (filters.user_type) {
        tenantQuery += ` AND tf.user_type = ?`;
        params.push(filters.user_type);
    }

    tenantQuery += ` ORDER BY tf.created_at DESC`;

    const [tenantFeedbacks] = await db.execute(tenantQuery, params);

    // Get public feedbacks
    let publicQuery = `
        SELECT 
            pf.*,
            'public' as feedback_type,
            pf.full_name as tenant_name,
            pf.email as tenant_email,
            pf.phone as tenant_phone,
            NULL as nationality,
            NULL as gender,
            NULL as room_number,
            p.name as pg_name,
            DATE(pf.created_at) as feedback_date
        FROM public_feedbacks pf
        INNER JOIN pgs p ON pf.pg_id = p.id
        WHERE 1=1
    `;
    const publicParams = [];

    if (filters.pg_id) {
        publicQuery += ` AND pf.pg_id = ?`;
        publicParams.push(parseInt(filters.pg_id));
    }

    if (filters.pg_name) {
        publicQuery += ` AND p.name LIKE ?`;
        publicParams.push(`%${filters.pg_name}%`);
    }

    if (filters.type) {
        if (filters.type === 'positive') {
            publicQuery += ` AND pf.overall_rating >= 7`;
        } else if (filters.type === 'negative') {
            publicQuery += ` AND pf.overall_rating <= 5`;
        }
    }

    publicQuery += ` ORDER BY pf.created_at DESC`;

    const [publicFeedbacks] = await db.execute(publicQuery, publicParams);

    return [...tenantFeedbacks, ...publicFeedbacks];
};

// ============================================================
// PUBLIC FUNCTIONS (No Auth)
// ============================================================

const getPublicPGReviews = async () => {
    // Get ALL PGs (including those with 0 reviews)
    const [pgData] = await db.execute(
        `
        SELECT 
            p.id as pg_id,
            p.name as pg_name,
            COALESCE(ROUND(AVG(tf.overall_rating), 1), 0) as overall_rating,
            COUNT(tf.id) as total_reviews,
            (
                SELECT COUNT(*) 
                FROM public_feedbacks pf 
                WHERE pf.pg_id = p.id
            ) as total_public_reviews,
            (
                SELECT ROUND(AVG(pf.overall_rating), 1) 
                FROM public_feedbacks pf 
                WHERE pf.pg_id = p.id
            ) as public_avg_rating
        FROM pgs p
        LEFT JOIN tenant_feedbacks tf ON p.id = tf.pg_id
        WHERE p.is_active = 1
        GROUP BY p.id, p.name
        ORDER BY p.name ASC
        `
    );

    // For each PG, get the reviews (tenant + guest + public)
    const result = [];
    for (const pg of pgData) {
        let reviews = [];

        // Get tenant and guest reviews
        const [userReviews] = await db.execute(
            `
            SELECT 
                t.full_name as name,
                tf.comment,
                tf.overall_rating as rating,
                DATE(tf.created_at) as date
            FROM tenant_feedbacks tf
            INNER JOIN tenants t ON tf.tenant_id = t.id
            WHERE tf.pg_id = ?
            ORDER BY tf.created_at DESC
            LIMIT 50
            `,
            [pg.pg_id]
        );
        reviews = reviews.concat(userReviews);

        // Get public reviews
        const [publicReviews] = await db.execute(
            `
            SELECT 
                full_name as name,
                comment,
                overall_rating as rating,
                DATE(created_at) as date
            FROM public_feedbacks
            WHERE pg_id = ?
            ORDER BY created_at DESC
            LIMIT 50
            `,
            [pg.pg_id]
        );
        reviews = reviews.concat(publicReviews);

        // Sort by date (most recent first)
        reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
        reviews = reviews.slice(0, 50);

        // Calculate combined rating
        const totalRatingCount = pg.total_reviews + pg.total_public_reviews;
        let combinedRating = 0;
        if (totalRatingCount > 0) {
            const tenantTotal = pg.overall_rating * pg.total_reviews;
            const publicTotal = (pg.public_avg_rating || 0) * pg.total_public_reviews;
            combinedRating = (tenantTotal + publicTotal) / totalRatingCount;
            combinedRating = Math.round(combinedRating * 10) / 10;
        }

        result.push({
            pg_id: pg.pg_id,
            pg_name: pg.pg_name,
            overall_rating: combinedRating || 0,
            total_reviews: totalRatingCount,
            reviews: reviews
        });
    }

    return result;
};


// ============================================================
// NEW: Get combined feedback stats for a PG
// ============================================================
const getCombinedPGStats = async (pgId) => {
    const [tenantStats] = await db.execute(
        `
        SELECT 
            COUNT(*) as count,
            AVG(overall_rating) as avg_rating
        FROM tenant_feedbacks
        WHERE pg_id = ?
        `,
        [pgId]
    );

    const [publicStats] = await db.execute(
        `
        SELECT 
            COUNT(*) as count,
            AVG(overall_rating) as avg_rating
        FROM public_feedbacks
        WHERE pg_id = ?
        `,
        [pgId]
    );

    const tenantCount = parseInt(tenantStats[0]?.count || 0);
    const publicCount = parseInt(publicStats[0]?.count || 0);
    const tenantAvg = parseFloat(tenantStats[0]?.avg_rating || 0);
    const publicAvg = parseFloat(publicStats[0]?.avg_rating || 0);

    const totalCount = tenantCount + publicCount;
    let combinedAvg = 0;
    if (totalCount > 0) {
        combinedAvg = ((tenantAvg * tenantCount) + (publicAvg * publicCount)) / totalCount;
        combinedAvg = Math.round(combinedAvg * 10) / 10;
    }

    return {
        total_reviews: totalCount,
        tenant_reviews: tenantCount,
        public_reviews: publicCount,
        overall_rating: combinedAvg,
        tenant_avg_rating: tenantAvg,
        public_avg_rating: publicAvg
    };
};

// ============================================================
// NEW: Get combined reviews for a PG
// ============================================================
const getCombinedReviews = async (pgId, limit = 50) => {
    const [tenantReviews] = await db.execute(
        `
        SELECT 
            t.full_name as name,
            tf.comment,
            tf.overall_rating as rating,
            tf.created_at as date,
            'tenant' as source
        FROM tenant_feedbacks tf
        INNER JOIN tenants t ON tf.tenant_id = t.id
        WHERE tf.pg_id = ?
        ORDER BY tf.created_at DESC
        `,
        [pgId]
    );

    const [publicReviews] = await db.execute(
        `
        SELECT 
            full_name as name,
            comment,
            overall_rating as rating,
            created_at as date,
            'public' as source
        FROM public_feedbacks
        WHERE pg_id = ?
        ORDER BY created_at DESC
        `,
        [pgId]
    );

    const allReviews = [...tenantReviews, ...publicReviews];
    allReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return allReviews.slice(0, limit);
};


module.exports = {
    createFeedback,
    hasUserGivenFeedback,
    getFeedbackByUser,
    getFeedbackById,
    getPublicFeedbackById,
    hasPublicUserGivenFeedback,
    getAdminFeedbackStats,
    getAllFeedbacksAdmin,
    getPublicPGReviews,
    getCombinedPGStats,
    getCombinedReviews
};