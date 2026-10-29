// app.js - Livinkey API application (hardened)

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const { apiLimiter, authLimiter, publicLimiter, webhookLimiter } = require("./middleware/rate.limit");
const downloadTokenRoutes = require("./routes/download.token.routes");

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const pgRoutes = require("./routes/pg.routes");
const tenantRoutes = require("./routes/tenant.routes"); 
const billRoutes = require("./routes/bill.routes"); 
const paymentRoutes = require("./routes/payment.routes");
const notificationRoutes = require("./routes/notification.routes");
const feedbackRoutes = require("./routes/feedback.routes");
const tenantDocumentRoutes = require("./routes/tenant.document.routes");
const maintenanceRoutes = require("./routes/maintenance.routes");
const tenantPaymentRoutes = require("./routes/tenant.payment.routes");
const guestRoutes = require("./routes/guest.routes"); 
const publicRoutes = require("./routes/public.routes");
const chatbotRoutes = require("./routes/chatbot.routes");
const tenantNotificationRoutes = require("./routes/tenant.notification.routes");
const guestNotificationRoutes = require("./routes/guest.notification.routes");
const adminNotificationRoutes = require("./routes/admin.notification.routes");
const activityLogRoutes = require("./routes/activity.log.routes");
const ensureActivitySchema = require("./config/activity.schema");
const ensureAdminConsoleSchema = require("./config/schema.bootstrap");
const webhookRoutes = require("./routes/webhook.routes");
const conversationRoutes = require("./routes/conversation.routes");
const livinkeyNoticeRoutes = require("./routes/livinkey.notice.routes");
const livinkeyAdRoutes = require("./routes/livinkey.ad.routes");
const siteSettingsRoutes = require("./routes/site.settings.routes");

const app = express();

// Behind a reverse proxy (Render / Nginx) – needed for correct client IPs
app.set("trust proxy", 1);
app.disable("x-powered-by");

// ============================================================
// CORS – only the Livinkey websites (and local dev) may call the API from a
// browser. Mobile apps send no Origin header and are always allowed.
// Extra origins can be added with CORS_ORIGINS="https://a.com,https://b.com"
// ============================================================
const allowedOrigins = new Set([
    "https://livinkey.com",
    "https://www.livinkey.com",
    "https://admin.livinkey.com",
    ...String(process.env.CORS_ORIGINS || "").split(",").map((o) => o.trim()).filter(Boolean)
]);
const isDevOrigin = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.has(origin)) return callback(null, true);
        if (process.env.NODE_ENV !== "production" && isDevOrigin(origin)) return callback(null, true);
        return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    exposedHeaders: ["Content-Range", "X-Content-Range", "Content-Disposition"],
    maxAge: 86400
};
app.use(cors(corsOptions));

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Keep the raw request body – payment gateways sign it and we must verify it.
const keepRawBody = (req, res, buf) => { req.rawBody = buf; };
app.use(express.json({ limit: "10mb", verify: keepRawBody }));
app.use(express.urlencoded({ extended: true, limit: "10mb", verify: keepRawBody }));
app.use(cookieParser());

// Never write download tokens to the access log.
morgan.token("safe-url", (req) => String(req.originalUrl || req.url).replace(/([?&]token=)[^&]+/gi, "$1[redacted]"));
app.use(morgan(process.env.NODE_ENV === "production"
    ? ":remote-addr :method :safe-url :status :res[content-length] - :response-time ms"
    : ":method :safe-url :status :response-time ms"));

// Rate limiting
app.use("/api", apiLimiter);
app.use([
    "/api/auth/login", "/api/auth/verify-otp", "/api/auth/resend-otp", "/api/auth/forgot-password",
    "/api/auth/resend-forgot-password-otp", "/api/auth/verify-forgot-password-otp", "/api/auth/reset-password",
    "/api/tenants/auth/login", "/api/tenants/auth/forgot-password", "/api/tenants/auth/verify-otp", "/api/tenants/auth/reset-password",
    "/api/guests/register", "/api/guests/login", "/api/guests/forgot-password", "/api/guests/verify-otp", "/api/guests/reset-password"
], authLimiter);
app.use(["/api/public", "/api/chatbot"], publicLimiter);
app.use(["/api/webhooks", "/api/payments/webhook"], webhookLimiter);

// Hide internal details (SQL / stack / driver errors) from API responses.
const INTERNAL_ERROR_PATTERN = /(ER_[A-Z_]+|SQL|sqlstate|ECONN|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|socket hang up|Cannot read|is not defined|is not a function|undefined|at .+\(.+:\d+:\d+\)|mysql|node_modules|\/home\/|\/opt\/|\/app\/)/i;
app.use((req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = (body) => {
        if (res.statusCode >= 500 && body && typeof body === "object" && typeof body.message === "string"
            && INTERNAL_ERROR_PATTERN.test(body.message)) {
            console.error("Sanitised server error:", body.message);
            body = { ...body, message: "Something went wrong on our side. Please try again in a moment." };
        }
        return originalJson(body);
    };
    next();
});

// Health check endpoint
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Livinkey Backend Running",
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/pgs", pgRoutes);
app.use("/api/tenants", tenantRoutes); 
app.use("/api/bills", billRoutes); 
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/feedbacks", feedbackRoutes);
app.use("/api/documents", tenantDocumentRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/tenant-payments", tenantPaymentRoutes);
app.use("/api/guests", guestRoutes); 
app.use("/api/public", publicRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/tenant-notifications", tenantNotificationRoutes);
app.use("/api/guest-notifications", guestNotificationRoutes);
app.use("/api/admin-notifications", adminNotificationRoutes);
app.use("/api/activity-logs", activityLogRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/livinkey-notices", livinkeyNoticeRoutes);
app.use("/api/livinkey-ads", livinkeyAdRoutes);
app.use("/api/site-settings", siteSettingsRoutes);
app.use("/api/download-token", downloadTokenRoutes);

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

// Global error handler
app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);

    // File upload problems get a friendly message
    if (err && err.name === "MulterError") {
        const msg = err.code === "LIMIT_FILE_SIZE"
            ? "That file is too large. The maximum size is 5 MB."
            : "We couldn't process that upload. Please try again.";
        return res.status(err.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({ success: false, message: msg });
    }
    if (err && err.type === "entity.parse.failed") {
        return res.status(400).json({ success: false, message: "Invalid request format." });
    }
    if (err && err.type === "entity.too.large") {
        return res.status(413).json({ success: false, message: "The request is too large." });
    }

    const status = err.status || err.statusCode || 500;
    if (status >= 500) console.error("Global error:", err);
    res.status(status).json({
        success: false,
        message: status >= 500 ? "Something went wrong on our side. Please try again in a moment." : (err.message || "Request failed")
    });
});

ensureActivitySchema().catch(err => console.error("Activity schema init error:", err));
ensureAdminConsoleSchema().catch(err => console.error("Admin console schema init error:", err));

module.exports = app;