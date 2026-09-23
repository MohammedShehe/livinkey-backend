const db = require("./db");

async function ensureActivitySchema() {
    const connection = await db.getConnection();
    try {
        await connection.query(`
            CREATE TABLE IF NOT EXISTS activity_logs (
                id BIGINT NOT NULL AUTO_INCREMENT,
                tenant_id INT NULL,
                guest_id INT NULL,
                pg_id INT NULL,
                actor_type ENUM('tenant','guest','admin','system') NOT NULL,
                actor_name VARCHAR(255) NULL,
                actor_position VARCHAR(100) NULL,
                action VARCHAR(120) NOT NULL,
                module VARCHAR(80) NOT NULL,
                entity_type VARCHAR(100) NULL,
                entity_id BIGINT NULL,
                metadata JSON NULL,
                ip_address VARCHAR(64) NULL,
                user_agent TEXT NULL,
                device_info VARCHAR(255) NULL,
                performed_by_admin_id INT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                KEY idx_activity_tenant (tenant_id),
                KEY idx_activity_guest (guest_id),
                KEY idx_activity_pg (pg_id),
                KEY idx_activity_action (action),
                KEY idx_activity_module (module),
                KEY idx_activity_created (created_at),
                KEY idx_activity_admin (performed_by_admin_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `);

        const [cols] = await connection.query(`
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'admin_permissions'
        `);
        const names = new Set(cols.map(c => c.COLUMN_NAME));
        if (!names.has("can_message")) await connection.query("ALTER TABLE admin_permissions ADD COLUMN can_message TINYINT(1) NOT NULL DEFAULT 0");
        if (!names.has("can_export")) await connection.query("ALTER TABLE admin_permissions ADD COLUMN can_export TINYINT(1) NOT NULL DEFAULT 0");

        const [admins] = await connection.query("SELECT id FROM admins WHERE role='admin'");
        for (const a of admins) {
            await connection.query(`
                INSERT INTO admin_permissions (admin_id,module_name,can_view,can_add,can_edit,can_delete,can_message,can_export)
                VALUES (?, 'activity_logs', 0,0,0,0,0,0)
                ON DUPLICATE KEY UPDATE module_name=VALUES(module_name)
            `,[a.id]);
        }
        console.log("✅ Activity tracking schema ready");
    } catch (error) {
        console.error("❌ Activity schema setup failed:", error.message);
    } finally {
        connection.release();
    }
}
module.exports = ensureActivitySchema;
