const db = require("../config/db");
const FeedbackModel = require("../models/feedback.model");
const NotificationEventManager = require("../utils/notification.events");

const createFeedback = async (tenantId, feedbackData) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Check if tenant exists and is active
        const [tenant] = await connection.execute(
            `SELECT t.id, t.role, t.full_name, t.nationality, t.country_code, t.phone, t.gender, td.pg_id 
             FROM tenants t
             LEFT JOIN tenant_details td ON t.id = td.tenant_id
             WHERE t.id = ? AND t.is_active = 1`,
            [tenantId]
        );

        if (tenant.length === 0) {
            throw new Error("Tenant not found or inactive.");
        }

        if (tenant[0].role !== 'tenant') {
            throw new Error("Only tenants can provide feedback.");
        }

        // Check if tenant has already given feedback
        const hasFeedback = await FeedbackModel.hasTenantGivenFeedback(tenantId);
        if (hasFeedback) {
            throw new Error("You have already submitted feedback. You can only provide feedback once.");
        }

        const pgId = tenant[0].pg_id;
        if (!pgId) {
            throw new Error("No PG assigned to this tenant.");
        }

        // Validate ratings (1-10)
        const ratings = [
            feedbackData.living_experience_rating,
            feedbackData.maintenance_handling_rating,
            feedbackData.communication_rating,
            feedbackData.amenities_rating,
            feedbackData.technology_handling_rating
        ];

        for (const rating of ratings) {
            if (rating === undefined || rating === null || rating < 1 || rating > 10) {
                throw new Error("All ratings must be between 1 and 10.");
            }
        }

        // Calculate overall rating
        const overall_rating = Math.round(
            (ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10
        ) / 10;

        // Create feedback
        const feedbackId = await FeedbackModel.createFeedback(connection, {
            tenant_id: tenantId,
            pg_id: pgId,
            living_experience_rating: parseFloat(feedbackData.living_experience_rating),
            maintenance_handling_rating: parseFloat(feedbackData.maintenance_handling_rating),
            communication_rating: parseFloat(feedbackData.communication_rating),
            amenities_rating: parseFloat(feedbackData.amenities_rating),
            technology_handling_rating: parseFloat(feedbackData.technology_handling_rating),
            overall_rating: overall_rating,
            comment: feedbackData.comment || null
        });

        await connection.commit();

        // Get the created feedback with details
        const feedback = await FeedbackModel.getFeedbackByTenant(tenantId);

        // Send feedback notification to admins
        try {
            await NotificationEventManager.onFeedbackSubmitted(feedback);
        } catch (notifError) {
            console.error("Failed to send feedback notification:", notifError);
        }

        // NEW: Send confirmation/thank-you notification to the tenant themselves
        try {
            await NotificationEventManager.onTenantFeedbackSubmitted(tenantId);
        } catch (notifError) {
            console.error("Failed to send tenant feedback confirmation:", notifError);
        }

        return feedback;

    } catch (error) {
        await connection.rollback();
        console.error("Create Feedback Error:", error);
        throw error;

    } finally {
        connection.release();
    }
};

const getFeedbackByTenant = async (tenantId) => {
    return await FeedbackModel.getFeedbackByTenant(tenantId);
};

const hasTenantGivenFeedback = async (tenantId) => {
    return await FeedbackModel.hasTenantGivenFeedback(tenantId);
};

// Admin functions
const getAdminFeedbackStats = async () => {
    return await FeedbackModel.getAdminFeedbackStats();
};

const getAllFeedbacksAdmin = async (filters = {}) => {
    return await FeedbackModel.getAllFeedbacksAdmin(filters);
};

// Public functions (No Auth)
const getPublicPGReviews = async () => {
    return await FeedbackModel.getPublicPGReviews();
};

module.exports = {
    createFeedback,
    getFeedbackByTenant,
    hasTenantGivenFeedback,
    getAdminFeedbackStats,
    getAllFeedbacksAdmin,
    getPublicPGReviews
};