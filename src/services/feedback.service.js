const db = require("../config/db");
const FeedbackModel = require("../models/feedback.model");
const NotificationEventManager = require("../utils/notification.events");

const createFeedback = async (userId, feedbackData) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const userType = feedbackData.user_type || 'tenant';
        const pgId = feedbackData.pg_id;

        // Verify PG exists
        const [pg] = await connection.execute(
            `SELECT id, name FROM pgs WHERE id = ? AND is_active = 1`,
            [pgId]
        );

        if (pg.length === 0) {
            throw new Error("PG not found or inactive.");
        }

        // Check if user has already given feedback
        const hasFeedback = await FeedbackModel.hasUserGivenFeedback(
            connection,
            userId,
            userType
        );
        
        if (hasFeedback) {
            throw new Error("You have already submitted feedback. You can only provide feedback once.");
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
            user_id: userId,
            user_type: userType,
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
        const feedback = await FeedbackModel.getFeedbackById(feedbackId);

        // Send feedback notification to admins
        try {
            await NotificationEventManager.onFeedbackSubmitted(feedback);
        } catch (notifError) {
            console.error("Failed to send feedback notification:", notifError);
        }

        // Send confirmation/thank-you notification to the user (if tenant)
        if (userType === 'tenant') {
            try {
                await NotificationEventManager.onTenantFeedbackSubmitted(userId);
            } catch (notifError) {
                console.error("Failed to send tenant feedback confirmation:", notifError);
            }
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

// NEW: Create public feedback (no auth - uses email/phone as identifier)
const createPublicFeedback = async (feedbackData) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const pgId = feedbackData.pg_id;

        // Verify PG exists
        const [pg] = await connection.execute(
            `SELECT id, name FROM pgs WHERE id = ? AND is_active = 1`,
            [pgId]
        );

        if (pg.length === 0) {
            throw new Error("PG not found or inactive.");
        }

        // Check if this email/phone has already given feedback for this PG
        const [existing] = await connection.execute(
            `SELECT id FROM public_feedbacks 
             WHERE email = ? AND phone = ? AND pg_id = ?`,
            [feedbackData.email, feedbackData.phone, pgId]
        );

        if (existing.length > 0) {
            throw new Error("You have already submitted feedback for this PG. You can only provide feedback once.");
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

        // Create public feedback
        const [result] = await connection.execute(
            `
            INSERT INTO public_feedbacks (
                pg_id,
                full_name,
                email,
                phone,
                living_experience_rating,
                maintenance_handling_rating,
                communication_rating,
                amenities_rating,
                technology_handling_rating,
                overall_rating,
                comment
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                pgId,
                feedbackData.full_name,
                feedbackData.email,
                feedbackData.phone,
                parseFloat(feedbackData.living_experience_rating),
                parseFloat(feedbackData.maintenance_handling_rating),
                parseFloat(feedbackData.communication_rating),
                parseFloat(feedbackData.amenities_rating),
                parseFloat(feedbackData.technology_handling_rating),
                overall_rating,
                feedbackData.comment || null
            ]
        );

        await connection.commit();

        const feedbackId = result.insertId;
        const feedback = await FeedbackModel.getPublicFeedbackById(feedbackId);

        // Send feedback notification to admins
        try {
            await NotificationEventManager.onFeedbackSubmitted(feedback);
        } catch (notifError) {
            console.error("Failed to send feedback notification:", notifError);
        }

        return feedback;

    } catch (error) {
        await connection.rollback();
        console.error("Create Public Feedback Error:", error);
        throw error;

    } finally {
        connection.release();
    }
};

const getFeedbackByTenant = async (tenantId) => {
    return await FeedbackModel.getFeedbackByUser(tenantId, 'tenant');
};

const getFeedbackByUser = async (userId, userType) => {
    return await FeedbackModel.getFeedbackByUser(userId, userType);
};

const hasUserGivenFeedback = async (userId, userType) => {
    return await FeedbackModel.hasUserGivenFeedback(null, userId, userType);
};

const hasPublicUserGivenFeedback = async (email, phone) => {
    return await FeedbackModel.hasPublicUserGivenFeedback(email, phone);
};

// Admin functions
const getAdminFeedbackStats = async () => {
    return await FeedbackModel.getAdminFeedbackStats();
};

const getAllFeedbacksAdmin = async (filters = {}) => {
    return await FeedbackModel.getAllFeedbacksAdmin(filters);
};

// NEW: Delete feedback (admin)
const deleteFeedback = async (feedbackId) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Check if feedback exists
        const [feedback] = await connection.execute(
            `SELECT id FROM tenant_feedbacks WHERE id = ?`,
            [feedbackId]
        );

        if (feedback.length === 0) {
            // Check public feedbacks
            const [publicFeedback] = await connection.execute(
                `SELECT id FROM public_feedbacks WHERE id = ?`,
                [feedbackId]
            );
            if (publicFeedback.length === 0) {
                throw new Error("Feedback not found.");
            }
            // Delete from public_feedbacks
            await connection.execute(
                `DELETE FROM public_feedbacks WHERE id = ?`,
                [feedbackId]
            );
        } else {
            // Delete from tenant_feedbacks
            await connection.execute(
                `DELETE FROM tenant_feedbacks WHERE id = ?`,
                [feedbackId]
            );
        }

        await connection.commit();
        return true;

    } catch (error) {
        await connection.rollback();
        console.error("Delete Feedback Error:", error);
        throw error;

    } finally {
        connection.release();
    }
};

// Public functions (No Auth)
const getPublicPGReviews = async () => {
    return await FeedbackModel.getPublicPGReviews();
};

module.exports = {
    createFeedback,
    createPublicFeedback,
    getFeedbackByTenant,
    getFeedbackByUser,
    hasUserGivenFeedback,
    hasPublicUserGivenFeedback,
    getAdminFeedbackStats,
    getAllFeedbacksAdmin,
    deleteFeedback,
    getPublicPGReviews
};