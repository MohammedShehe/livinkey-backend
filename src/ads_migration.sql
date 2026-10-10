-- Livinkey advertisements + admin permissions
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
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_livinkey_ads_active (is_enabled, valid_till),
  KEY idx_livinkey_ads_order (display_order),
  CONSTRAINT fk_livinkey_ad_admin FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- For existing deployments that already have livinkey_ads without link_url,
-- run: backend/src/migrations/006_ads_link_url.sql

-- For existing admin accounts, run these through the application's migrate.js
-- so duplicate permission rows are avoided safely.
