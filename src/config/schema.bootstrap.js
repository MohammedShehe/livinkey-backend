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

        // ------------------------------------------------------------
        // v2 upgrade: offers, expenses, electricity formulas, document review
        // ------------------------------------------------------------
        await conn.query(`
            CREATE TABLE IF NOT EXISTS pg_offers (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                pg_id INT NOT NULL,
                title VARCHAR(150) NOT NULL,
                description TEXT NULL,
                offer_type ENUM('percent','flat','free','custom') NOT NULL DEFAULT 'custom',
                offer_value DECIMAL(10,2) NULL,
                badge_text VARCHAR(40) NULL,
                coupon_code VARCHAR(40) NULL,
                terms TEXT NULL,
                valid_from DATE NULL,
                valid_until DATE NULL,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                sort_order INT NOT NULL DEFAULT 0,
                created_by INT NULL,
                updated_by INT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                KEY idx_pg_offers_pg (pg_id),
                KEY idx_pg_offers_live (is_active, valid_until),
                CONSTRAINT fk_pg_offers_pg FOREIGN KEY (pg_id) REFERENCES pgs (id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        await conn.query(`
            CREATE TABLE IF NOT EXISTS expenses (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                pg_id INT NULL,
                category VARCHAR(50) NOT NULL,
                title VARCHAR(200) NOT NULL,
                amount DECIMAL(12,2) NOT NULL,
                expense_date DATE NOT NULL,
                payment_method VARCHAR(30) NOT NULL DEFAULT 'cash',
                paid_to VARCHAR(150) NULL,
                reference_no VARCHAR(100) NULL,
                notes TEXT NULL,
                receipt_url VARCHAR(500) NULL,
                receipt_public_id VARCHAR(255) NULL,
                receipt_resource_type VARCHAR(20) NULL,
                created_by INT NULL,
                updated_by INT NULL,
                deleted_at DATETIME NULL,
                deleted_by INT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                KEY idx_expenses_pg (pg_id),
                KEY idx_expenses_date (expense_date),
                KEY idx_expenses_category (category),
                KEY idx_expenses_deleted (deleted_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        await conn.query(`
            CREATE TABLE IF NOT EXISTS pg_electricity_settings (
                pg_id INT NOT NULL PRIMARY KEY,
                billing_mode ENUM('flat','slab') NOT NULL DEFAULT 'flat',
                rate_per_unit DECIMAL(8,3) NOT NULL DEFAULT 0,
                slabs JSON NULL,
                fixed_charge DECIMAL(10,2) NOT NULL DEFAULT 0,
                min_charge DECIMAL(10,2) NOT NULL DEFAULT 0,
                multiplier DECIMAL(8,3) NOT NULL DEFAULT 1,
                tax_percent DECIMAL(6,2) NOT NULL DEFAULT 0,
                round_to_rupee TINYINT(1) NOT NULL DEFAULT 1,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                updated_by INT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                CONSTRAINT fk_pg_elec_pg FOREIGN KEY (pg_id) REFERENCES pgs (id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        await addColumnIfMissing(conn, "bills", "previous_reading", "previous_reading DECIMAL(12,2) NULL");
        await addColumnIfMissing(conn, "bills", "current_reading", "current_reading DECIMAL(12,2) NULL");
        await addColumnIfMissing(conn, "bills", "units_consumed", "units_consumed DECIMAL(12,2) NULL");
        await addColumnIfMissing(conn, "bills", "electricity_rate", "electricity_rate DECIMAL(8,3) NULL");
        await addColumnIfMissing(conn, "bills", "electricity_breakdown", "electricity_breakdown TEXT NULL");

        // Document review workflow. Documents that already existed before this
        // upgrade are treated as approved so admins are not flooded.
        const reviewColumnIsNew = !(await columnExists(conn, "tenant_documents", "review_status"));
        await addColumnIfMissing(conn, "tenant_documents", "review_status",
            "review_status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending'");
        await addColumnIfMissing(conn, "tenant_documents", "reviewed_by", "reviewed_by INT NULL");
        await addColumnIfMissing(conn, "tenant_documents", "reviewed_at", "reviewed_at DATETIME NULL");
        await addColumnIfMissing(conn, "tenant_documents", "review_note", "review_note TEXT NULL");
        await addColumnIfMissing(conn, "tenant_documents", "uploaded_by_type",
            "uploaded_by_type ENUM('tenant','admin') NOT NULL DEFAULT 'tenant'");
        await addColumnIfMissing(conn, "tenant_documents", "admin_seen_at", "admin_seen_at DATETIME NULL");
        if (reviewColumnIsNew) {
            await conn.query(`UPDATE tenant_documents SET review_status='approved', admin_seen_at=NOW() WHERE deleted_at IS NULL`);
        }


        // Widen the tenant notification type list (new document + payment-proof events)
        await conn.query(`ALTER TABLE tenant_notifications MODIFY COLUMN type ENUM('admin_message','bill','bill_created','bill_fine_adjusted','bill_fine_applied','bill_overdue','bill_paid','bill_partially_paid','document','document_approved','document_rejected','document_reminder','efrro_expiry','feedback','feedback_submitted','maintenance','maintenance_completed','maintenance_created','maintenance_started','payment','payment_proof_rejected','payment_proof_verified','payment_reminder','stay_expiry') NOT NULL`)
            .catch(e => console.error("tenant_notifications enum:", e.message));

        // 'expenses' permission row for every existing admin (off by default).
        await conn.query(`
            INSERT INTO admin_permissions (admin_id, module_name, can_view, can_add, can_edit, can_delete, can_message, can_export)
            SELECT a.id, 'expenses', 0, 0, 0, 0, 0, 0 FROM admins a
            WHERE a.role <> 'super_admin'
              AND NOT EXISTS (SELECT 1 FROM admin_permissions ap WHERE ap.admin_id = a.id AND ap.module_name = 'expenses')
        `).catch(e => console.error("expenses permission seed:", e.message));

        console.log("✅ Admin console schema ready");
    } catch (error) {
        console.error("❌ Admin console schema setup failed:", error.message);
    } finally {
        conn.release();
    }
}

module.exports = ensureSchema;
module.exports.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
