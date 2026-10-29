/**
 * IP based rate limiters (express-rate-limit v8).
 * Friendly JSON messages so the apps can show them directly.
 */
const rateLimit = require("express-rate-limit");

const make = ({ windowMs, limit, message }) =>
    rateLimit({
        windowMs,
        limit,
        standardHeaders: "draft-7",
        legacyHeaders: false,
        message: { success: false, code: "RATE_LIMITED", message },
        // behind a proxy (Render/Nginx) app.set('trust proxy') makes req.ip the real client
        validate: { trustProxy: false, xForwardedForHeader: false }
    });

// Whole API: generous, protects against floods
const apiLimiter = make({
    windowMs: 60 * 1000,
    limit: 300,
    message: "You're sending requests too quickly. Please wait a moment and try again."
});

// Login / OTP / password reset endpoints: strict
const authLimiter = make({
    windowMs: 15 * 60 * 1000,
    limit: 40,
    message: "Too many attempts. Please wait a few minutes and try again."
});

// Public chatbot / unauthenticated search: moderate
const publicLimiter = make({
    windowMs: 60 * 1000,
    limit: 60,
    message: "Too many requests. Please slow down a little."
});

// Payment gateway & Twilio webhooks
const webhookLimiter = make({
    windowMs: 60 * 1000,
    limit: 120,
    message: "Too many requests."
});

module.exports = { apiLimiter, authLimiter, publicLimiter, webhookLimiter };
