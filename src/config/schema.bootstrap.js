/**
 * Idempotent schema bootstrap for the admin-console upgrade.
 *
 * Adds (only when missing):
 *   - admins.last_login_at / last_login_ip / last_login_device / login_count
 *   - site_settings table (+ updated_by column)
 *   - default website-control settings
 *
 * Never drops or rewrites existing data. Runs once at server start, so no
 * manual migration is needed (migrations/011_*.sql documents the same change).
 */
const db = require("./db");

async function columnExists(conn, table, column) {
    const [rows] = await conn.query(
        `SELECT COUNT(*) AS c FROM information_schema.columns
         WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
        [table, column]
    );
    return Number(rows[0].c) > 0;
}

async function addColumnIfMissing(conn, table, column, ddl) {
    if (!(await columnExists(conn, table, column))) {
        await conn.query(`ALTER TABLE \`${table}\` ADD COLUMN ${ddl}`);
    }
}

const DEFAULT_SETTINGS = {
    // Website control
    site_name: "Livinkey",
    site_tagline: "Premium PG accommodation, managed with care.",
    contact_phone: "",
    contact_whatsapp: "919878383497",
    contact_email: "livinkey@gmail.com",
    contact_address: "",
    social_instagram: "https://www.instagram.com/livinkey",
    social_facebook: "https://www.facebook.com/livin.key.9/",
    announcement_enabled: "0",
    announcement_text: "",
    announcement_link: "",
    announcement_type: "info",
    maintenance_mode: "0",
    maintenance_message: "We're performing scheduled maintenance. Please check back shortly.",
    show_chatbot: "1",
    show_reviews: "1",
    show_stats: "1"
};

async function ensureSchema() {
    const conn = await db.getConnection();
    try {
        await addColumnIfMissing(conn, "admins", "last_login_at", "last_login_at DATETIME NULL");
        await addColumnIfMissing(conn, "admins", "last_login_ip", "last_login_ip VARCHAR(64) NULL");
        await addColumnIfMissing(conn, "admins", "last_login_device", "last_login_device VARCHAR(255) NULL");
        await addColumnIfMissing(conn, "admins", "login_count", "login_count INT NOT NULL DEFAULT 0");

        await conn.query(`
            CREATE TABLE IF NOT EXISTS site_settings (
                setting_key VARCHAR(64) NOT NULL PRIMARY KEY,
                setting_value TEXT NULL,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        await addColumnIfMissing(conn, "site_settings", "updated_by", "updated_by VARCHAR(150) NULL");

        for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
            await conn.query(
                `INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)
                 ON DUPLICATE KEY UPDATE setting_key = setting_key`,
                [key, value]
            );
        }
        console.log("✅ Admin console schema ready");
    } catch (error) {
        console.error("❌ Admin console schema setup failed:", error.message);
    } finally {
        conn.release();
    }
}

module.exports = ensureSchema;
module.exports.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
