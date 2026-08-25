const db = require("../config/db");
const feedbackService = require("../services/feedback.service");
const NotificationEventManager = require("../utils/notification.events");

// ============ TENANT FEEDBACK ENDPOINTS ============

const submitFeedback = async (req, res) => {
    try {
        const tenantId = req.tenant.id;
        const {
            pg_id,
            living_experience_rating,
            maintenance_handling_rating,
            communication_rating,
            amenities_rating,
            technology_handling_rating,
            comment
        } = req.body;

        // Validate required fields
        if (!pg_id) {
            return res.status(400).json({
                success: false,
                message: "PG ID is required."
            });
        }

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
            pg_id,
            living_experience_rating,
            maintenance_handling_rating,
            communication_rating,
            amenities_rating,
            technology_handling_rating,
            comment: comment || null,
            user_type: 'tenant'
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
        const hasSubmitted = await feedbackService.hasUserGivenFeedback(tenantId, 'tenant');

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

// ============ GUEST FEEDBACK ENDPOINTS (Mobile App) ============

const submitGuestFeedback = async (req, res) => {
    try {
        const guestId = req.guest.id;
        const {
            pg_id,
            living_experience_rating,
            maintenance_handling_rating,
            communication_rating,
            amenities_rating,
            technology_handling_rating,
            comment
        } = req.body;

        // Validate required fields
        if (!pg_id) {
            return res.status(400).json({
                success: false,
                message: "PG ID is required."
            });
        }

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

        const feedback = await feedbackService.createFeedback(guestId, {
            pg_id,
            living_experience_rating,
            maintenance_handling_rating,
            communication_rating,
            amenities_rating,
            technology_handling_rating,
            comment: comment || null,
            user_type: 'guest'
        });

        return res.status(201).json({
            success: true,
            message: "Feedback submitted successfully.",
            data: feedback
        });

    } catch (error) {
        console.error("Submit Guest Feedback Error:", error);
        
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

const checkGuestFeedbackStatus = async (req, res) => {
    try {
        const guestId = req.guest.id;
        const hasSubmitted = await feedbackService.hasUserGivenFeedback(guestId, 'guest');

        return res.json({
            success: true,
            has_submitted: hasSubmitted,
            message: hasSubmitted ? "You have already submitted feedback." : "You can submit feedback."
        });

    } catch (error) {
        console.error("Check Guest Feedback Status Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

const getMyGuestFeedback = async (req, res) => {
    try {
        const guestId = req.guest.id;
        const feedback = await feedbackService.getFeedbackByUser(guestId, 'guest');

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
        console.error("Get My Guest Feedback Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};

// ============ PUBLIC FEEDBACK ENDPOINTS (Website - No Auth) ============

const submitPublicFeedback = async (req, res) => {
    try {
        const {
            pg_id,
            full_name,
            email,
            phone,
            living_experience_rating,
            maintenance_handling_rating,
            communication_rating,
            amenities_rating,
            technology_handling_rating,
            comment
        } = req.body;

        // Validate required fields
        if (!pg_id) {
            return res.status(400).json({
                success: false,
                message: "PG ID is required."
            });
        }

        if (!full_name || !email || !phone) {
            return res.status(400).json({
                success: false,
                message: "Full name, email, and phone are required."
            });
        }

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

        // Validate email format
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        const feedback = await feedbackService.createPublicFeedback({
            pg_id,
            full_name,
            email,
            phone,
            living_experience_rating,
            maintenance_handling_rating,
            communication_rating,
            amenities_rating,
            technology_handling_rating,
            comment: comment || null
        });

        return res.status(201).json({
            success: true,
            message: "Feedback submitted successfully. Thank you!",
            data: feedback
        });

    } catch (error) {
        console.error("Submit Public Feedback Error:", error);
        
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

const checkPublicFeedbackStatus = async (req, res) => {
    try {
        const { email, phone } = req.query;

        if (!email && !phone) {
            return res.status(400).json({
                success: false,
                message: "Email or phone is required."
            });
        }

        const hasSubmitted = await feedbackService.hasPublicUserGivenFeedback(email, phone);

        return res.json({
            success: true,
            has_submitted: hasSubmitted,
            message: hasSubmitted ? "You have already submitted feedback." : "You can submit feedback."
        });

    } catch (error) {
        console.error("Check Public Feedback Status Error:", error);
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
        const { type, nationality, gender, pg_id, pg_name, user_type } = req.query;
        const feedbacks = await feedbackService.getAllFeedbacksAdmin({
            type,
            nationality,
            gender,
            pg_id,
            pg_name,
            user_type
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

// ============================================================
// NEW: ADMIN DELETE FEEDBACK
// ============================================================
const deleteFeedbackAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await feedbackService.deleteFeedback(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Feedback not found."
            });
        }

        return res.json({
            success: true,
            message: "Feedback deleted successfully."
        });

    } catch (error) {
        console.error("Delete Feedback Admin Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error."
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
    // Tenant endpoints
    submitFeedback,
    getMyFeedback,
    checkFeedbackStatus,
    
    // Guest endpoints (NEW)
    submitGuestFeedback,
    checkGuestFeedbackStatus,
    getMyGuestFeedback,
    
    // Public endpoints (NEW)
    submitPublicFeedback,
    checkPublicFeedbackStatus,
    
    // Admin endpoints
    getAdminFeedbackStats,
    getAllFeedbacksAdmin,
    deleteFeedbackAdmin,  // NEW
    
    // Public (no auth) endpoints
    getPublicPGReviews
};