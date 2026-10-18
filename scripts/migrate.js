
/**
 * LivinKey additive production schema migration.
 *
 * Safety guarantees:
 * - Never imports a dump, drops a table, or truncates data.
 * - Existing tables and columns are checked before adding.
 * - CREATE TABLE statements use IF NOT EXISTS.
 * - Existing admin permissions are never overwritten; only missing module
 *   rows are inserted.
 * - Multiple bills per tenant/month are supported.
 *
 * IMPORTANT:
 * Take a provider-side database backup before running a production migration.
 */
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const db = require("../src/config/db");

async function tableExists(connection, table) {
  const [rows] = await connection.execute(
    `SELECT COUNT(*) AS c
     FROM information_schema.tables
     WHERE table_schema = DATABASE() AND table_name = ?`,
    [table]
  );
  return Number(rows[0].c) > 0;
}

async function columnExists(connection, table, column) {
  const [rows] = await connection.execute(
    `SELECT COUNT(*) AS c
     FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = ?
       AND column_name = ?`,
    [table, column]
  );
  return Number(rows[0].c) > 0;
}

async function indexExists(connection, table, index) {
  const [rows] = await connection.execute(
    `SELECT COUNT(*) AS c
     FROM information_schema.statistics
     WHERE table_schema = DATABASE()
       AND table_name = ?
       AND index_name = ?`,
    [table, index]
  );
  return Number(rows[0].c) > 0;
}

async function constraintExists(connection, table, constraint) {
  const [rows] = await connection.execute(
    `SELECT COUNT(*) AS c
     FROM information_schema.table_constraints
     WHERE constraint_schema = DATABASE()
       AND table_name = ?
       AND constraint_name = ?`,
    [table, constraint]
  );
  return Number(rows[0].c) > 0;
}

async function addColumnIfMissing(connection, table, column, ddl) {
  console.log(`Checking migration step: ${table}.${column}`);

  if (!(await tableExists(connection, table))) {
    throw new Error(
      `Required table "${table}" does not exist; refusing to continue.`
    );
  }

  if (!(await columnExists(connection, table, column))) {
    await connection.execute(ddl);
    console.log(`Added ${table}.${column}`);
  } else {
    console.log(`Already present: ${table}.${column}`);
  }
}

async function createTableIfMissing(connection, name, ddl) {
  await connection.execute(ddl);
  console.log(`Table ready: ${name}`);
}

async function migrate() {
  const connection = await db.getConnection();

  try {
    console.log(
      "Starting LivinKey additive schema migration " +
      "(existing business data is not intentionally rewritten)."
    );

    const database = process.env.DB_NAME;

    if (!database) {
      throw new Error("DB_NAME is not set. Refusing to run migration.");
    }

    // Verify that the connected database contains the required application
    // tables before making schema changes.
    const requiredTables = [
      "admins",
      "admin_permissions",
      "tenants",
      "pgs",
      "rooms",
      "tenant_details",
      "bills",
      "payment_proofs",
      "bill_payments"
    ];

    const missing = [];

    for (const table of requiredTables) {
      if (!(await tableExists(connection, table))) {
        missing.push(table);
      }
    }

    if (missing.length) {
      throw new Error(
        `Database "${database}" is missing required existing tables: ` +
        `${missing.join(", ")}. ` +
        "Verify DB_HOST, DB_PORT and DB_NAME before proceeding."
      );
    }

    // ------------------------------------------------------------
    // Existing application tables: add only missing columns.
    // ------------------------------------------------------------

    await addColumnIfMissing(
      connection,
      "tenants",
      "parent_phone",
      "ALTER TABLE tenants ADD COLUMN parent_phone VARCHAR(50) NULL AFTER international_phone"
    );

    await addColumnIfMissing(
      connection,
      "pgs",
      "tenant_agreement_enabled",
      "ALTER TABLE pgs ADD COLUMN tenant_agreement_enabled TINYINT(1) NOT NULL DEFAULT 1 AFTER payment_upi_id"
    );

    await addColumnIfMissing(
      connection,
      "pgs",
      "tenant_agreement_text",
      "ALTER TABLE pgs ADD COLUMN tenant_agreement_text TEXT NULL AFTER tenant_agreement_enabled"
    );

    await addColumnIfMissing(
      connection,
      "tenant_details",
      "period_of_stay",
      "ALTER TABLE tenant_details ADD COLUMN period_of_stay TINYINT UNSIGNED NULL COMMENT 'Duration of stay in months (1-12)' AFTER arrival_date"
    );

    await addColumnIfMissing(
      connection,
      "bills",
      "room_id",
      "ALTER TABLE bills ADD COLUMN room_id INT NULL AFTER tenant_id"
    );

    await addColumnIfMissing(
      connection,
      "bills",
      "fine_accrual_frozen",
      "ALTER TABLE bills ADD COLUMN fine_accrual_frozen TINYINT(1) NOT NULL DEFAULT 0 AFTER max_fine"
    );

    // IMPORTANT:
    // Do not create active_billing_key. The application source search
    // found no runtime references to this column, and its generated-column
    // ALTER operation fails on the current LIVE database.
    //
    // Multiple bills per tenant/month must remain supported.

    await addColumnIfMissing(
      connection,
      "payment_proofs",
      "payment_scope",
      "ALTER TABLE payment_proofs ADD COLUMN payment_scope ENUM('bill','outstanding') NOT NULL DEFAULT 'bill' AFTER bill_id"
    );

    await addColumnIfMissing(
      connection,
      "payment_proofs",
      "payment_target_bill_id",
      "ALTER TABLE payment_proofs ADD COLUMN payment_target_bill_id INT NULL AFTER payment_scope"
    );

    await addColumnIfMissing(
      connection,
      "payment_proofs",
      "due_before_payment",
      "ALTER TABLE payment_proofs ADD COLUMN due_before_payment DECIMAL(10,2) NULL AFTER is_partial"
    );

    await addColumnIfMissing(
      connection,
      "payment_proofs",
      "due_after_payment",
      "ALTER TABLE payment_proofs ADD COLUMN due_after_payment DECIMAL(10,2) NULL AFTER due_before_payment"
    );

    // ------------------------------------------------------------
    // Multiple bills per tenant/month.
    //
    // Remove only the obsolete unique index if it exists.
    // This does not delete or update bill rows.
    // ------------------------------------------------------------

    if (
      await indexExists(
        connection,
        "bills",
        "uq_bills_active_billing_period"
      )
    ) {
      await connection.execute(
        "ALTER TABLE bills DROP INDEX uq_bills_active_billing_period"
      );

      console.log(
        "Removed obsolete one-bill-per-period unique index."
      );
    }

    // Add the room lookup index if missing.
    if (
      !(await indexExists(connection, "bills", "idx_bills_room_id"))
    ) {
      await connection.execute(
        "ALTER TABLE bills ADD KEY idx_bills_room_id (room_id)"
      );

      console.log("Added bills room index.");
    }

    // Add the room foreign key if missing.
    if (
      !(await constraintExists(connection, "bills", "fk_bills_room_id"))
    ) {
      await connection.execute(
        "ALTER TABLE bills " +
        "ADD CONSTRAINT fk_bills_room_id " +
        "FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL"
      );

      console.log("Added bills room foreign key.");
    }

    // ------------------------------------------------------------
    // Multi-bill payment allocation ledger.
    // Existing payment records are not migrated or rewritten here.
    // ------------------------------------------------------------

    await createTableIfMissing(
      connection,
      "payment_allocations",
      `
        CREATE TABLE IF NOT EXISTS payment_allocations (
          id INT NOT NULL AUTO_INCREMENT,
          payment_proof_id INT NULL,
          bill_payment_id INT NULL,
          tenant_id INT NOT NULL,
          bill_id INT NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          allocation_order INT NOT NULL DEFAULT 1,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          KEY idx_payment_allocations_proof (payment_proof_id),
          KEY idx_payment_allocations_bill (bill_id),
          KEY idx_payment_allocations_tenant (tenant_id),
          CONSTRAINT fk_payment_allocations_proof
            FOREIGN KEY (payment_proof_id)
            REFERENCES payment_proofs(id) ON DELETE SET NULL,
          CONSTRAINT fk_payment_allocations_bill_payment
            FOREIGN KEY (bill_payment_id)
            REFERENCES bill_payments(id) ON DELETE SET NULL,
          CONSTRAINT fk_payment_allocations_tenant
            FOREIGN KEY (tenant_id)
            REFERENCES tenants(id) ON DELETE CASCADE,
          CONSTRAINT fk_payment_allocations_bill
            FOREIGN KEY (bill_id)
            REFERENCES bills(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `
    );

    // ------------------------------------------------------------
    // Tenant agreement acceptance and stay-expiry notification tables.
    // ------------------------------------------------------------

    await createTableIfMissing(
      connection,
      "tenant_agreement_acceptances",
      `
        CREATE TABLE IF NOT EXISTS tenant_agreement_acceptances (
          id INT NOT NULL AUTO_INCREMENT,
          tenant_id INT NOT NULL,
          pg_id INT NOT NULL,
          agreement_hash CHAR(64) NOT NULL,
          agreement_text TEXT NOT NULL,
          accepted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          ip_address VARCHAR(64) DEFAULT NULL,
          user_agent TEXT DEFAULT NULL,
          PRIMARY KEY (id),
          UNIQUE KEY uq_tenant_agreement_hash
            (tenant_id, agreement_hash),
          KEY idx_tenant_agreement_tenant (tenant_id),
          KEY idx_tenant_agreement_pg (pg_id),
          CONSTRAINT fk_tenant_agreement_tenant
            FOREIGN KEY (tenant_id)
            REFERENCES tenants(id) ON DELETE CASCADE,
          CONSTRAINT fk_tenant_agreement_pg
            FOREIGN KEY (pg_id)
            REFERENCES pgs(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `
    );

    await createTableIfMissing(
      connection,
      "tenant_stay_expiry_notifications",
      `
        CREATE TABLE IF NOT EXISTS tenant_stay_expiry_notifications (
          id INT NOT NULL AUTO_INCREMENT,
          tenant_id INT NOT NULL,
          stay_end_date DATE NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          UNIQUE KEY uq_tenant_stay_expiry
            (tenant_id, stay_end_date),
          CONSTRAINT fk_tenant_stay_expiry_tenant
            FOREIGN KEY (tenant_id)
            REFERENCES tenants(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `
    );

    // ------------------------------------------------------------
    // Admin messaging tables.
    // IF NOT EXISTS preserves rows in existing tables.
    // ------------------------------------------------------------

    await createTableIfMissing(
      connection,
      "conversations",
      `
        CREATE TABLE IF NOT EXISTS conversations (
          id INT NOT NULL AUTO_INCREMENT,
          user_id INT NOT NULL,
          user_type ENUM('tenant','guest','admin')
            NOT NULL DEFAULT 'tenant',
          phone VARCHAR(20) NULL,
          email VARCHAR(255) NULL,
          name VARCHAR(150) NULL,
          last_message_at DATETIME NULL,
          unread_count INT NOT NULL DEFAULT 0,
          is_archived TINYINT(1) NOT NULL DEFAULT 0,
          assigned_to INT NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          UNIQUE KEY uniq_user (user_id, user_type),
          KEY idx_last_message (last_message_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
          COLLATE=utf8mb4_unicode_ci
      `
    );

    await createTableIfMissing(
      connection,
      "messages",
      `
        CREATE TABLE IF NOT EXISTS messages (
          id INT NOT NULL AUTO_INCREMENT,
          conversation_id INT NOT NULL,
          direction ENUM('inbound','outbound') NOT NULL,
          channel ENUM('whatsapp','email','system')
            NOT NULL DEFAULT 'whatsapp',
          message_type VARCHAR(50) NULL,
          content TEXT NULL,
          media_url VARCHAR(500) NULL,
          status ENUM(
            'queued','sent','delivered','read','failed','received'
          ) NOT NULL DEFAULT 'queued',
          external_id VARCHAR(100) NULL,
          metadata JSON NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          KEY idx_conversation (conversation_id),
          KEY idx_external_id (external_id),
          KEY idx_created (created_at),
          CONSTRAINT fk_messages_conversation
            FOREIGN KEY (conversation_id)
            REFERENCES conversations(id)
            ON DELETE CASCADE ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
          COLLATE=utf8mb4_unicode_ci
      `
    );

    // ------------------------------------------------------------
    // Receipt records.
    // Create the table only if it does not already exist.
    // ------------------------------------------------------------

    await createTableIfMissing(
      connection,
      "receipts",
      `
        CREATE TABLE IF NOT EXISTS receipts (
          id INT NOT NULL AUTO_INCREMENT,
          receipt_number VARCHAR(32) NOT NULL,
          bill_id INT NOT NULL,
          payment_id INT NULL,
          payment_proof_id INT NULL,
          cash_payment_id INT NULL,
          tenant_id INT NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          payment_method VARCHAR(50) NOT NULL,
          breakdown_json JSON NULL,
          issued_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          issued_by INT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          UNIQUE KEY uq_receipts_number (receipt_number),
          UNIQUE KEY uq_receipts_payment_id (payment_id),
          UNIQUE KEY uq_receipts_proof_id (payment_proof_id),
          UNIQUE KEY uq_receipts_cash_payment_id (cash_payment_id),
          KEY idx_receipts_bill (bill_id),
          KEY idx_receipts_tenant (tenant_id),
          KEY idx_receipts_issued_by (issued_by),
          CONSTRAINT fk_receipts_bill
            FOREIGN KEY (bill_id)
            REFERENCES bills(id) ON DELETE CASCADE,
          CONSTRAINT fk_receipts_issued_by
            FOREIGN KEY (issued_by)
            REFERENCES admins(id) ON DELETE SET NULL,
          CONSTRAINT fk_receipts_tenant
            FOREIGN KEY (tenant_id)
            REFERENCES tenants(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `
    );

    // ------------------------------------------------------------
    // Ads and notices.
    // ------------------------------------------------------------

    await createTableIfMissing(
      connection,
      "livinkey_ads",
      `
        CREATE TABLE IF NOT EXISTS livinkey_ads (
          id INT NOT NULL AUTO_INCREMENT,
          title VARCHAR(255) NOT NULL,
          images JSON NOT NULL,
          valid_till DATE NOT NULL,
          is_enabled TINYINT(1) NOT NULL DEFAULT 0,
          display_order INT NOT NULL DEFAULT 0,
          link_url VARCHAR(500) NULL,
          created_by INT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          KEY idx_livinkey_ads_active (is_enabled, valid_till),
          KEY idx_livinkey_ads_order (display_order),
          CONSTRAINT fk_livinkey_ad_admin
            FOREIGN KEY (created_by)
            REFERENCES admins(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `
    );

    await addColumnIfMissing(
      connection,
      "livinkey_ads",
      "link_url",
      "ALTER TABLE livinkey_ads ADD COLUMN link_url VARCHAR(500) NULL AFTER display_order"
    );

    await createTableIfMissing(
      connection,
      "livinkey_notices",
      `
        CREATE TABLE IF NOT EXISTS livinkey_notices (
          id INT NOT NULL AUTO_INCREMENT,
          image_url TEXT NOT NULL,
          public_id VARCHAR(255) NOT NULL,
          resource_type VARCHAR(32) NOT NULL DEFAULT 'image',
          display_order TINYINT UNSIGNED NOT NULL DEFAULT 0,
          created_by INT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          KEY idx_livinkey_notices_order (display_order),
          CONSTRAINT fk_livinkey_notice_admin
            FOREIGN KEY (created_by)
            REFERENCES admins(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `
    );


    // ------------------------------------------------------------
    // Tenant archive / soft-delete support
    // ------------------------------------------------------------
    await addColumnIfMissing(
      connection,
      "tenants",
      "status",
      "ALTER TABLE tenants ADD COLUMN status ENUM('active','checked_out','archived') NOT NULL DEFAULT 'active' AFTER is_active"
    );
    await addColumnIfMissing(
      connection,
      "tenants",
      "checkout_date",
      "ALTER TABLE tenants ADD COLUMN checkout_date DATE NULL DEFAULT NULL AFTER status"
    );
    await addColumnIfMissing(
      connection,
      "tenants",
      "archived_at",
      "ALTER TABLE tenants ADD COLUMN archived_at DATETIME NULL DEFAULT NULL AFTER checkout_date"
    );
    await addColumnIfMissing(
      connection,
      "tenants",
      "archive_reason",
      "ALTER TABLE tenants ADD COLUMN archive_reason TEXT NULL DEFAULT NULL AFTER archived_at"
    );
    await addColumnIfMissing(
      connection,
      "tenants",
      "archived_by",
      "ALTER TABLE tenants ADD COLUMN archived_by INT NULL DEFAULT NULL AFTER archive_reason"
    );
    await addColumnIfMissing(
      connection,
      "tenants",
      "original_email",
      "ALTER TABLE tenants ADD COLUMN original_email VARCHAR(255) NULL DEFAULT NULL AFTER archived_by"
    );
    await addColumnIfMissing(
      connection,
      "tenants",
      "original_phone",
      "ALTER TABLE tenants ADD COLUMN original_phone VARCHAR(20) NULL DEFAULT NULL AFTER original_email"
    );
    await addColumnIfMissing(
      connection,
      "tenant_documents",
      "deleted_at",
      "ALTER TABLE tenant_documents ADD COLUMN deleted_at DATETIME NULL DEFAULT NULL"
    );
    await addColumnIfMissing(
      connection,
      "tenant_documents",
      "deleted_by",
      "ALTER TABLE tenant_documents ADD COLUMN deleted_by INT NULL DEFAULT NULL AFTER deleted_at"
    );
    await addColumnIfMissing(
      connection,
      "tenant_documents",
      "delete_reason",
      "ALTER TABLE tenant_documents ADD COLUMN delete_reason TEXT NULL DEFAULT NULL AFTER deleted_by"
    );

    // ------------------------------------------------------------
    // Add missing admin permission rows only.
    // Never overwrite existing permission settings.
    // ------------------------------------------------------------

    const [adminRows] = await connection.execute(
      "SELECT id FROM admins WHERE role = 'admin'"
    );

    for (const admin of adminRows) {
      for (const moduleName of [
        "ads",
        "about_livinkey",
        "conversations",
        "archive"
      ]) {
        await connection.execute(
          `
            INSERT IGNORE INTO admin_permissions
              (
                admin_id,
                module_name,
                can_view,
                can_add,
                can_edit,
                can_delete,
                can_message,
                can_export
              )
            VALUES (?, ?, 0, 0, 0, 0, 0, 0)
          `,
          [admin.id, moduleName]
        );
      }
    }

    console.log(
      "LivinKey schema migration completed. " +
      "Existing business rows were not intentionally rewritten or deleted."
    );
  } finally {
    connection.release();
  }
}

migrate().catch((error) => {
  console.error("LivinKey schema migration failed:", {
    message: error.message,
    code: error.code,
    errno: error.errno,
    sqlState: error.sqlState,
    sqlMessage: error.sqlMessage,
    sql: error.sql,
    stack: error.stack
  });

  process.exitCode = 1;
});
