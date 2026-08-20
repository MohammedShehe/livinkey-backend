require("dotenv").config();

const app = require("./app");
const db = require("./config/db");
const cron = require("node-cron");
const billService = require("./services/bill.service");
const tenantService = require("./services/tenant.service");
const NotificationEventManager = require("./utils/notification.events");

const PORT = process.env.PORT || 5000;

async function startServer() {
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

        // Cron job 5: Check document reminders (daily at 9:30 AM)
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

        // Cron job 6: Check payment reminders (daily at 8:00 AM)
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

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("❌ Database Connection Failed");
        console.error(error.message);
        process.exit(1);
    }
}

startServer();