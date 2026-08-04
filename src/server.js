require("dotenv").config();

const app = require("./app");
const db = require("./config/db");
const cron = require("node-cron");
const billService = require("./services/bill.service");

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        const connection = await db.getConnection();
        console.log("✅ MySQL Connected");
        connection.release();

        // Cron job: Run every day at midnight to process delayed payments
        cron.schedule('0 0 * * *', async () => {
            console.log('🔄 Processing delayed payments...');
            try {
                const count = await billService.processDelayedPayments();
                console.log(`✅ Processed ${count} delayed bill(s)`);
            } catch (error) {
                console.error('❌ Error processing delayed payments:', error);
            }
        });

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("Database Connection Failed");
        console.error(error.message);
    }
}

startServer();