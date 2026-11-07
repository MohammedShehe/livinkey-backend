-- Messaging delivery chain (WhatsApp -> SMS -> e-mail) + maintenance forwarding.
-- These statements run automatically at server start (config/schema.bootstrap.js);
-- this file only documents them for manual deployments.

ALTER TABLE messages MODIFY COLUMN channel ENUM('whatsapp','sms','email','system') NOT NULL DEFAULT 'whatsapp';
ALTER TABLE conversations MODIFY COLUMN phone VARCHAR(32) NULL;

CREATE TABLE IF NOT EXISTS message_deliveries (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  message_id INT NULL,
  forward_id INT NULL,
  channel VARCHAR(12) NOT NULL,
  status VARCHAR(12) NOT NULL DEFAULT 'queued',
  external_id VARCHAR(64) NULL,
  pending_chain MEDIUMTEXT NULL,
  attempts LONGTEXT NULL,
  error_code VARCHAR(20) NULL,
  error_message VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_md_external (external_id),
  KEY idx_md_message (message_id),
  KEY idx_md_forward (forward_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS maintenance_forwards (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  admin_id INT NULL,
  to_phone VARCHAR(20) NOT NULL,
  to_name VARCHAR(120) NULL,
  note VARCHAR(500) NULL,
  channel VARCHAR(12) NULL,
  status VARCHAR(12) NOT NULL DEFAULT 'queued',
  error_message VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_mf_request (request_id),
  KEY idx_mf_phone (to_phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
