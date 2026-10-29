// server.js - Livinkey API bootstrap

require("dotenv").config();

const app = require("./app");
const db = require("./config/db");
const cron = require("node-cron");
const billService = require("./services/bill.service");
const tenantService = require("./services/tenant.service");
const NotificationEventManager = require("./utils/notification.events");

const PORT = process.env.PORT || 5000;

let server;

// Warn loudly about unsafe or unfinished configuration
function checkConfiguration() {
    const warn = (m) => console.warn(`⚠️  CONFIG: ${m}`);
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
        warn("JWT_SECRET should be a random string of at least 32 characters.");
    }
    if (!process.env.MERCHANT_UPI_ID || /your_|merchant@upi/i.test(process.env.MERCHANT_UPI_ID)) {
        warn("MERCHANT_UPI_ID is not set to a real UPI ID – UPI payments will not reach you.");
    }
    if (!process.env.TWILIO_AUTH_TOKEN || /^your/i.test(process.env.TWILIO_AUTH_TOKEN)) {
        warn("TWILIO_AUTH_TOKEN is not configured – WhatsApp webhooks will be rejected.");
    }
    if (process.env.CASHFREE_APP_ID && !process.env.CASHFREE_SECRET_KEY) {
        warn("Cashfree is partly configured.");
    }
}

async function startServer() {
    checkConfiguration();
    try {
        // Test database connection once at startup
        const connection = await db.getConnection();
        console.log("✅ MySQL Connected");
        connection.release();

        // Cron job 1: Run every day at midnight to process delayed payments
        cron.schedule('0 0 * * *', async () => {
            console.log('🔄 Processing delayed payments...');
            try {
                const count = await billService.processDelayedPayments();
                console.log(`✅ Processed ${count} delayed bill(s)`);
            } catch (error) {
                console.error('❌ Error processing delayed payments:', error);
            }
        });
        console.log('📅 Delayed payment processor scheduled to run daily at midnight');

        // Cron job 2: Run every day at 9:00 AM to check e-FRRO expiries
        cron.schedule('0 9 * * *', async () => {
            console.log('🔄 Checking e-FRRO expiries...');
            try {
                const result = await tenantService.checkAndSendEFRROExpiryNotifications();
                console.log(`✅ e-FRRO expiry check completed: ${result.sent} emails sent`);
                if (result.totalTenants > 0) {
                    console.log(`   📊 ${result.totalTenants} tenant(s) with expiring e-FRRO`);
                    console.log(`   📧 ${result.tenantEmailsSent} tenant emails sent`);
                    console.log(`   👤 ${result.adminEmailsSent} admin emails sent`);
                }
            } catch (error) {
                console.error('❌ Error checking e-FRRO expiries:', error);
            }
        });
        console.log('📅 e-FRRO expiry checker scheduled to run daily at 9:00 AM');

        // Cron job 3: Check e-FRRO expiry notifications (daily at 10:00 AM)
        cron.schedule('0 10 * * *', async () => {
            console.log('🔄 Checking e-FRRO expiry notifications...');
            try {
                const count = await NotificationEventManager.checkEFRROExpiry();
                console.log(`✅ Sent ${count} e-FRRO expiry notification(s)`);
            } catch (error) {
                console.error('❌ Error checking e-FRRO expiry:', error);
            }
        });
        console.log('📅 e-FRRO notification scheduler running daily at 10:00 AM');

        // Cron job 4: Check overdue payment notifications (daily at 11:00 AM)
        cron.schedule('0 11 * * *', async () => {
            console.log('🔄 Checking overdue payment notifications...');
            try {
                const count = await NotificationEventManager.checkOverduePayments();
                console.log(`✅ Sent ${count} overdue payment notification(s)`);
            } catch (error) {
                console.error('❌ Error checking overdue payments:', error);
            }
        });
        console.log('📅 Overdue payment notification scheduler running daily at 11:00 AM');

        // Cron job 5: Check tenant stay expiry (daily at 9:15 AM)
        cron.schedule('15 9 * * *', async () => {
            console.log('🔄 Checking tenant stay periods ending in one month...');
            try {
                const count = await NotificationEventManager.checkTenantStayExpiry();
                console.log(`✅ Sent ${count} tenant stay expiry reminder(s)`);
            } catch (error) {
                console.error('❌ Error checking tenant stay expiry:', error);
            }
        });
        console.log('📅 Tenant stay expiry checker scheduled daily at 9:15 AM');

        // Cron job 6a: Check document reminders (daily at 9:30 AM)
        cron.schedule('30 9 * * *', async () => {
            console.log('🔄 Checking document reminders...');
            try {
                const result = await tenantService.checkAndSendDocumentReminders();
                console.log(`✅ Document reminders sent: ${result.sent} (checked ${result.totalChecked || 0} tenants)`);
            } catch (error) {
                console.error('❌ Error checking document reminders:', error);
            }
        });
        console.log('📅 Document reminder checker scheduled to run daily at 9:30 AM');

        // Cron job 7: Check payment reminders (daily at 8:00 AM)
        cron.schedule('0 8 * * *', async () => {
            console.log('🔄 Checking payment reminders...');
            try {
                const result = await billService.checkAndSendPaymentReminders();
                console.log(`✅ Payment reminders sent: ${result.sent} (checked ${result.totalChecked || 0} tenants)`);
            } catch (error) {
                console.error('❌ Error checking payment reminders:', error);
            }
        });
        console.log('📅 Payment reminder checker scheduled to run daily at 8:00 AM');
        // ============================================================
        // NEW: Cron job for maintenance completion reminders
        // Runs every 10 minutes to check for in_progress requests
        // older than 20 minutes
        // ============================================================
        cron.schedule('*/10 * * * *', async () => {
            console.log('🔄 Checking maintenance completion reminders...');
            try {
                const maintenanceService = require("./services/maintenance.service");
                const result = await maintenanceService.checkAndSendCompletionReminders();
                if (result.sent > 0) {
                    console.log(`✅ Sent ${result.sent} maintenance completion reminder(s)`);
                }
            } catch (error) {
                console.error('❌ Error checking maintenance completion reminders:', error);
            }
        });
        console.log('📅 Maintenance completion reminder scheduler running every 10 minutes');
        // Start server on all interfaces
        const httpServer = app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
            console.log(`🔒 CORS restricted to Livinkey origins`);
        });
        server = httpServer;

    } catch (error) {
        console.error("❌ Database Connection Failed");
        console.error(error.message);
        process.exit(1);
    }
}

startServer();

// Graceful shutdown & safety nets
const shutdown = (signal) => {
    console.log(`${signal} received – shutting down gracefully`);
    if (server) server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 10000).unref();
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (reason) => console.error("Unhandled rejection:", reason));
