const feedbackService = require("../services/feedback.service");

// ============ TENANT FEEDBACK ENDPOINTS ============

const submitFeedback = async (req, res) => {
    try {
        const tenantId = req.tenant.id;
        const {
            living_experience_rating,
            maintenance_handling_rating,
            communication_rating,
            amenities_rating,
            technology_handling_rating,
            comment
        } = req.body;

        // Validate required fields
        if (living_experience_rating === undefined ||
            maintenance_handling_rating === undefined ||
            communication_rating === undefined ||
            amenities_rating === undefined ||
            technology_handling_rating === undefined) {
            return res.status(400).json({
                success: false,
                message: "All rating fields are required."
            });
        }

        // Validate rating ranges
        const ratings = [
            living_experience_rating,
            maintenance_handling_rating,
            communication_rating,
            amenities_rating,
            technology_handling_rating
        ];

        for (const rating of ratings) {
            if (rating < 1 || rating > 10) {
                return res.status(400).json({
                    success: false,
                    message: "All ratings must be between 1 and 10."
                });
            }
        }

        const feedback = await feedbackService.createFeedback(tenantId, {
            living_experience_rating,
            maintenance_handling_rating,
            communication_rating,
            amenities_rating,
            technology_handling_rating,
            comment: comment || null
        });

        return res.status(201).json({
            success: true,
            message: "Feedback submitted successfully.",
            data: feedback
        });

    } catch (error) {
        console.error("Submit Feedback Error:", error);
        
        if (error.message === "You have already submitted feedback. You can only provide feedback once.") {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error."
        });
    }
};

const getMyFeedback = async (req, res) => {
    try {
        const tenantId = req.tenant.id;
        const feedback = await feedbackService.getFeedbackByTenant(tenantId);

        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: "You haven't submitted any feedback yet."
            });
        }

        return res.json({
            success: true,
            data: feedback
        });

    } catch (error) {
        console.error("Get My Feedback Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

const checkFeedbackStatus = async (req, res) => {
    try {
        const tenantId = req.tenant.id;
        const hasSubmitted = await feedbackService.hasTenantGivenFeedback(tenantId);

        return res.json({
            success: true,
            has_submitted: hasSubmitted,
            message: hasSubmitted ? "You have already submitted feedback." : "You can submit feedback."
        });

    } catch (error) {
        console.error("Check Feedback Status Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

// ============ ADMIN FEEDBACK ENDPOINTS ============

const getAdminFeedbackStats = async (req, res) => {
    try {
        const stats = await feedbackService.getAdminFeedbackStats();

        return res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error("Get Admin Feedback Stats Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

const getAllFeedbacksAdmin = async (req, res) => {
    try {
        const { type, nationality, gender, pg_id, pg_name } = req.query;
        const feedbacks = await feedbackService.getAllFeedbacksAdmin({
            type,
            nationality,
            gender,
            pg_id,
            pg_name
        });

        return res.json({
            success: true,
            count: feedbacks.length,
            data: feedbacks
        });

    } catch (error) {
        console.error("Get All Feedbacks Admin Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

// ============ PUBLIC FEEDBACK ENDPOINTS (No Auth) ============

const getPublicPGReviews = async (req, res) => {
    try {
        const reviews = await feedbackService.getPublicPGReviews();

        return res.json({
            success: true,
            data: reviews
        });

    } catch (error) {
        console.error("Get Public PG Reviews Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

module.exports = {
    submitFeedback,
    getMyFeedback,
    checkFeedbackStatus,
    getAdminFeedbackStats,
    getAllFeedbacksAdmin,
    getPublicPGReviews
};