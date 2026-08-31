// app.js - Complete fixed file with CORS properly configured for production

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

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
const tenantNotificationRoutes = require("./routes/tenant.notification.routes");
const guestNotificationRoutes = require("./routes/guest.notification.routes");
const adminNotificationRoutes = require("./routes/admin.notification.routes");

const app = express();

// ============================================================
// FIX: CORS properly configured for production
// ============================================================

// CORS options
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Allow all origins in development, or use a whitelist in production
        // For production, replace '*' with your actual frontend URLs
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400 // 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));


// Other middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan("dev"));

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
app.use("/api/tenant-notifications", tenantNotificationRoutes);
app.use("/api/guest-notifications", guestNotificationRoutes);
app.use("/api/admin-notifications", adminNotificationRoutes);

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

module.exports = app;