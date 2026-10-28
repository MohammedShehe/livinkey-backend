-- 011: Admin last-login tracking + website control settings
-- This is ALSO applied automatically at server start by config/schema.bootstrap.js
-- (idempotent), so running this file manually is optional.

-- MySQL 8.0.29+/MariaDB 10.3+ support IF NOT EXISTS for ADD COLUMN.
-- On older MySQL, run each statement only once.
ALTER TABLE admins ADD COLUMN last_login_at DATETIME NULL;
ALTER TABLE admins ADD COLUMN last_login_ip VARCHAR(64) NULL;
ALTER TABLE admins ADD COLUMN last_login_device VARCHAR(255) NULL;
ALTER TABLE admins ADD COLUMN login_count INT NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS site_settings (
  setting_key VARCHAR(64) NOT NULL PRIMARY KEY,
  setting_value TEXT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE site_settings ADD COLUMN updated_by VARCHAR(150) NULL;
