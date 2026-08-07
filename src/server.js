require("dotenv").config();

const app = require("./app");
const db = require("./config/db");
const cron = require("node-cron");
const billService = require("./services/bill.service");
const tenantService = require("./services/tenant.service");

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
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