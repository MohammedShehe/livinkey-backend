-- Migration: Create conversations and messages tables
-- Run this on your MySQL / MariaDB database

CREATE TABLE IF NOT EXISTS `conversations` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL COMMENT 'ID of tenant / guest / admin',
  `user_type` ENUM('tenant', 'guest', 'admin') NOT NULL DEFAULT 'tenant',
  `phone` VARCHAR(20) NULL,
  `email` VARCHAR(255) NULL,
  `name` VARCHAR(150) NULL,
  `last_message_at` DATETIME NULL,
  `unread_count` INT NOT NULL DEFAULT 0,
  `is_archived` TINYINT(1) NOT NULL DEFAULT 0,
  `assigned_to` INT NULL COMMENT 'Admin ID if assigned',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_user` (`user_id`, `user_type`),
  KEY `idx_last_message` (`last_message_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `messages` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `conversation_id` INT NOT NULL,
  `direction` ENUM('inbound', 'outbound') NOT NULL,
  `channel` ENUM('whatsapp', 'email', 'system') NOT NULL DEFAULT 'whatsapp',
  `message_type` VARCHAR(50) NULL COMMENT 'otp | bill | fine | custom | text | media',
  `content` TEXT NULL,
  `media_url` VARCHAR(500) NULL,
  `status` ENUM('queued', 'sent', 'delivered', 'read', 'failed', 'received') NOT NULL DEFAULT 'queued',
  `external_id` VARCHAR(100) NULL COMMENT 'Twilio Message SID',
  `metadata` JSON NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_conversation` (`conversation_id`),
  KEY `idx_external_id` (`external_id`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `fk_messages_conversation`
    FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
