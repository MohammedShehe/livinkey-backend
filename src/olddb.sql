-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: altaria.proxy.rlwy.net    Database: railway
-- ------------------------------------------------------
-- Server version	9.7.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '';

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tenant_id` int DEFAULT NULL,
  `guest_id` int DEFAULT NULL,
  `pg_id` int DEFAULT NULL,
  `actor_type` enum('tenant','guest','admin','system') COLLATE utf8mb4_general_ci NOT NULL,
  `actor_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `actor_position` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `action` varchar(120) COLLATE utf8mb4_general_ci NOT NULL,
  `module` varchar(80) COLLATE utf8mb4_general_ci NOT NULL,
  `entity_type` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `entity_id` bigint DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `ip_address` varchar(64) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_general_ci,
  `device_info` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `performed_by_admin_id` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_activity_tenant` (`tenant_id`),
  KEY `idx_activity_guest` (`guest_id`),
  KEY `idx_activity_pg` (`pg_id`),
  KEY `idx_activity_action` (`action`),
  KEY `idx_activity_module` (`module`),
  KEY `idx_activity_created` (`created_at`),
  KEY `idx_activity_admin` (`performed_by_admin_id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_logs`
--

LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
INSERT INTO `activity_logs` VALUES (1,NULL,NULL,NULL,'admin','MO11','Super Admin','login','auth',NULL,NULL,'{\"result\": \"success\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0',NULL,1,'2026-09-23 17:04:32'),(2,1,NULL,NULL,'admin','MO11','Super Admin','admin_message_sent','messaging','person',1,'{\"title\": \"Kuhusu App\", \"subject\": \"App Fungua\", \"channels\": {\"push\": 1, \"email\": true, \"in_app\": true}}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0',NULL,1,'2026-09-23 17:24:54'),(3,NULL,NULL,NULL,'admin','MO11','Super Admin','activity_exported','activity_logs',NULL,NULL,'{\"rows\": 2}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0',NULL,1,'2026-09-23 17:26:20'),(4,NULL,NULL,NULL,'admin','MO11','Super Admin','login','auth',NULL,NULL,'{\"result\": \"success\"}','49.156.83.95','Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.0 Mobile/15E148 Safari/604.1',NULL,1,'2026-09-23 17:55:16'),(5,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread/count\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:35:29'),(6,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications?limit=100&offset=0\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:35:30'),(7,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread/count\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:35:30'),(8,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread/count\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:35:31'),(9,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications?limit=100&offset=0\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:35:31'),(10,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread/count\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:40'),(11,18,NULL,2,'tenant','Sri Ram','Tenant','device_registered','app','app',NULL,'{\"path\": \"/api/tenants/device/fcm-token\", \"method\": \"POST\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:41'),(12,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread/count\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:41'),(13,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications?limit=100&offset=0\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:41'),(14,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread/count\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:41'),(15,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread/count\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:42'),(16,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications?limit=100&offset=0\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:42'),(17,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications?limit=100&offset=0\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:42'),(18,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications?limit=100&offset=0\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:42'),(19,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread?limit=50\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:43'),(20,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','bills','bills',NULL,'{\"path\": \"/api/tenant-payments/bill\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:48'),(21,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','documents','documents',NULL,'{\"path\": \"/api/documents/types\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:49'),(22,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','feedbacks','feedbacks',NULL,'{\"path\": \"/api/feedbacks/status\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:49'),(23,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','maintenance','maintenance',NULL,'{\"path\": \"/api/maintenance/my-requests\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:49'),(24,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread/count\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:49'),(25,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','maintenance','maintenance',NULL,'{\"path\": \"/api/maintenance/my-stats\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:49'),(26,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','documents','documents',NULL,'{\"path\": \"/api/documents/my-documents\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:49'),(27,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread/count\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:49'),(28,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread/count\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:50'),(29,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications?limit=100&offset=0\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:50'),(30,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications?limit=100&offset=0\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:50'),(31,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','payments','payments',NULL,'{\"path\": \"/api/tenant-payments/history\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:50'),(32,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread/count\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:50'),(33,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications?limit=100&offset=0\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:51'),(34,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications?limit=100&offset=0\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:51'),(35,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread/count\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:57'),(36,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications?limit=100&offset=0\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:58'),(37,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',285,'{\"path\": \"/api/tenant-notifications/285/read\", \"method\": \"PUT\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:39:01'),(38,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread/count\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:39:01'),(39,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications?limit=100&offset=0\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:39:02'),(40,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread/count\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:39:03'),(41,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications?limit=100&offset=0\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:39:04'),(42,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread/count\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:39:10'),(43,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications?limit=100&offset=0\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:39:10'),(44,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','documents','documents',NULL,'{\"path\": \"/api/documents/types\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:39:12'),(45,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','documents','documents',NULL,'{\"path\": \"/api/documents/my-documents\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:39:13'),(46,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread/count\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:39:13'),(47,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications?limit=100&offset=0\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:39:14'),(48,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread/count\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:39:20'),(49,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications?limit=100&offset=0\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:39:21'),(50,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread/count\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:39:21'),(51,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread/count\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:39:22'),(52,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications?limit=100&offset=0\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:39:23');
/*!40000 ALTER TABLE `activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_notification_logs`
--

DROP TABLE IF EXISTS `admin_notification_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_notification_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int NOT NULL,
  `recipient_type` enum('individual','pg','all') NOT NULL,
  `recipient_count` int NOT NULL DEFAULT '0',
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `send_push` tinyint(1) DEFAULT '1',
  `send_email` tinyint(1) DEFAULT '0',
  `sent_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_admin_id` (`admin_id`),
  KEY `idx_sent_at` (`sent_at`),
  KEY `idx_recipient_type` (`recipient_type`),
  CONSTRAINT `fk_notification_logs_admin_id` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_notification_logs`
--

LOCK TABLES `admin_notification_logs` WRITE;
/*!40000 ALTER TABLE `admin_notification_logs` DISABLE KEYS */;
INSERT INTO `admin_notification_logs` VALUES (10,2,'all',5,'Documents','please upload your documents on app',1,0,'2026-09-01 14:47:03'),(15,2,'individual',1,'documents','plz sens docu',1,0,'2026-09-23 15:21:41');
/*!40000 ALTER TABLE `admin_notification_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_notifications`
--

DROP TABLE IF EXISTS `admin_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int NOT NULL COMMENT 'Admin who receives the notification',
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'tenant_expiry, bill_payment, guest_register, etc.',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Short title',
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Notification message',
  `entity_id` int DEFAULT NULL COMMENT 'Related entity ID (tenant_id, bill_id, etc.)',
  `entity_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'tenant, bill, guest, pg, etc.',
  `link` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Frontend URL to navigate to',
  `icon` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Icon class or name',
  `color` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Color code for the notification',
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `read_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_admin_id` (`admin_id`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_admin_notifications_admin_id` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=375 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_notifications`
--

LOCK TABLES `admin_notifications` WRITE;
/*!40000 ALTER TABLE `admin_notifications` DISABLE KEYS */;
INSERT INTO `admin_notifications` VALUES (1,1,'pg_created','New PG Created','PG \"Alishan PG\" has been created',1,'pg','/pgs/1','?','#2ecc71',1,'2026-08-22 13:40:47','2026-08-22 13:55:59'),(3,1,'pg_created','New PG Created','PG \"DS Apartment\" has been created',3,'pg','/pgs/3','?','#2ecc71',1,'2026-08-22 13:47:48','2026-08-22 13:55:59'),(4,1,'pg_created','New PG Created','PG \"J T House (Plot No :- 257)\" has been created',4,'pg','/pgs/4','?','#2ecc71',1,'2026-08-22 13:50:08','2026-08-22 13:55:59'),(5,1,'pg_created','New PG Created','PG \"Shree Shyam Apartment\" has been created',5,'pg','/pgs/5','?','#2ecc71',1,'2026-08-22 13:51:22','2026-08-22 13:55:59'),(6,1,'pg_created','New PG Created','PG \"Royal Suits ( (Plot No :- 103,104)\" has been created',6,'pg','/pgs/6','?','#2ecc71',1,'2026-08-22 13:53:59','2026-08-22 13:55:59'),(7,1,'pg_created','New PG Created','PG \"Mannat Apartment (Plot No :- 99)\" has been created',7,'pg','/pgs/7','?','#2ecc71',1,'2026-08-22 13:55:49','2026-08-22 13:55:59'),(8,1,'tenant_registered','New Tenant Registered','Mohammed Aminu Shehe has been registered as a tenant',1,'tenant','/tenants/1','?','#2ecc71',1,'2026-08-22 15:56:54','2026-08-23 05:31:01'),(9,1,'feedback_submitted','New Feedback Received','Mohammed Aminu Shehe gave 10.0/10 rating for Happy Living PG',1,'feedback','/feedbacks/1','⭐','#f39c12',1,'2026-08-22 16:54:24','2026-08-23 05:31:01'),(10,1,'admin_created','New Admin Created','Admin \"Animesh\" has been created',3,'admin','/admins/3','?‍?','#3498db',1,'2026-08-22 21:43:56','2026-08-23 05:31:01'),(11,2,'admin_created','New Admin Created','Admin \"Animesh\" has been created',3,'admin','/admins/3','?‍?','#3498db',1,'2026-08-22 21:43:56','2026-08-22 22:10:36'),(12,1,'tenant_registered','New Tenant Registered','Sri Ram has been registered as a tenant',6,'tenant','/tenants/6','?','#2ecc71',1,'2026-08-22 22:18:25','2026-08-23 05:31:01'),(13,2,'tenant_registered','New Tenant Registered','Sri Ram has been registered as a tenant',6,'tenant','/tenants/6','?','#2ecc71',1,'2026-08-22 22:18:25','2026-09-01 14:50:27'),(15,1,'admin_created','New Admin Created','Admin \"Animesh\" has been created',4,'admin','/admins/4','?‍?','#3498db',1,'2026-08-22 22:21:31','2026-08-23 05:31:01'),(16,2,'admin_created','New Admin Created','Admin \"Animesh\" has been created',4,'admin','/admins/4','?‍?','#3498db',1,'2026-08-22 22:21:31','2026-09-01 14:50:27'),(17,1,'maintenance_created','New Maintenance Request','Sri Ram requested Electrician for Room 201',1,'maintenance','/maintenance/1','?','#3498db',1,'2026-08-22 22:23:21','2026-08-23 05:31:01'),(18,2,'maintenance_created','New Maintenance Request','Sri Ram requested Electrician for Room 201',1,'maintenance','/maintenance/1','?','#3498db',1,'2026-08-22 22:23:21','2026-09-01 14:50:27'),(20,1,'maintenance_updated','Maintenance Request Started','Electrician request for Room 201 is now in_progress',1,'maintenance','/maintenance/1','?','#f39c12',1,'2026-08-22 22:25:41','2026-08-23 05:31:01'),(21,2,'maintenance_updated','Maintenance Request Started','Electrician request for Room 201 is now in_progress',1,'maintenance','/maintenance/1','?','#f39c12',1,'2026-08-22 22:25:41','2026-09-01 14:50:27'),(23,1,'tenant_registered','New Tenant Registered','Mohammed Aminu Shehe has been registered as a tenant',7,'tenant','/tenants/7','?','#2ecc71',1,'2026-08-23 00:02:54','2026-08-23 05:33:07'),(24,2,'tenant_registered','New Tenant Registered','Mohammed Aminu Shehe has been registered as a tenant',7,'tenant','/tenants/7','?','#2ecc71',1,'2026-08-23 00:02:54','2026-09-01 14:50:27'),(26,1,'tenant_registered','New Tenant Registered','Abdul-Warith Aminu has been registered as a tenant',8,'tenant','/tenants/8','?','#2ecc71',1,'2026-08-23 00:05:36','2026-08-23 05:36:00'),(27,2,'tenant_registered','New Tenant Registered','Abdul-Warith Aminu has been registered as a tenant',8,'tenant','/tenants/8','?','#2ecc71',1,'2026-08-23 00:05:36','2026-09-01 14:50:27'),(29,1,'guest_registered','New Guest Registered','Kinjili has been registered as a guest',9,'guest','/tenants/9','?','#1abc9c',1,'2026-08-23 00:07:26','2026-08-23 05:38:29'),(30,2,'guest_registered','New Guest Registered','Kinjili has been registered as a guest',9,'guest','/tenants/9','?','#1abc9c',1,'2026-08-23 00:07:26','2026-09-01 14:50:27'),(32,1,'admin_created','New Admin Created','Admin \"Mohammed Aminu Shehe\" has been created',5,'admin','/admins/5','?‍?','#3498db',1,'2026-08-23 00:08:06','2026-08-23 05:38:29'),(33,2,'admin_created','New Admin Created','Admin \"Mohammed Aminu Shehe\" has been created',5,'admin','/admins/5','?‍?','#3498db',1,'2026-08-23 00:08:06','2026-09-01 14:50:27'),(34,1,'feedback_submitted','New Feedback Received','Abdul-Warith Aminu gave 9.8/10 rating for Happy Living PG',2,'feedback','/feedbacks/2','⭐','#f39c12',1,'2026-08-23 01:03:54','2026-08-23 06:40:31'),(35,2,'feedback_submitted','New Feedback Received','Abdul-Warith Aminu gave 9.8/10 rating for Happy Living PG',2,'feedback','/feedbacks/2','⭐','#f39c12',1,'2026-08-23 01:03:54','2026-09-01 14:50:27'),(38,1,'maintenance_created','New Maintenance Request','Abdul-Warith Aminu requested Electrician for Room 101',2,'maintenance','/maintenance/2','?','#3498db',1,'2026-08-23 01:05:11','2026-08-23 06:40:31'),(39,2,'maintenance_created','New Maintenance Request','Abdul-Warith Aminu requested Electrician for Room 101',2,'maintenance','/maintenance/2','?','#3498db',1,'2026-08-23 01:05:11','2026-09-01 14:50:27'),(42,1,'maintenance_created','New Maintenance Request','Abdul-Warith Aminu requested Cleaning for Room 101',3,'maintenance','/maintenance/3','?','#3498db',1,'2026-08-23 01:05:55','2026-08-23 06:40:31'),(43,2,'maintenance_created','New Maintenance Request','Abdul-Warith Aminu requested Cleaning for Room 101',3,'maintenance','/maintenance/3','?','#3498db',1,'2026-08-23 01:05:55','2026-09-01 14:50:27'),(46,1,'maintenance_created','New Maintenance Request','Abdul-Warith Aminu requested Check-out for Room 101',4,'maintenance','/maintenance/4','?','#3498db',1,'2026-08-23 01:06:14','2026-08-23 06:40:31'),(47,2,'maintenance_created','New Maintenance Request','Abdul-Warith Aminu requested Check-out for Room 101',4,'maintenance','/maintenance/4','?','#3498db',1,'2026-08-23 01:06:14','2026-09-01 14:50:27'),(50,1,'maintenance_updated','Maintenance Request Started','Check-out request for Room 101 is now in_progress',4,'maintenance','/maintenance/4','?','#f39c12',1,'2026-08-23 01:10:59','2026-08-23 06:43:22'),(51,2,'maintenance_updated','Maintenance Request Started','Check-out request for Room 101 is now in_progress',4,'maintenance','/maintenance/4','?','#f39c12',1,'2026-08-23 01:10:59','2026-09-01 14:50:27'),(54,1,'maintenance_updated','Maintenance Request Started','Cleaning request for Room 101 is now in_progress',3,'maintenance','/maintenance/3','?','#f39c12',1,'2026-08-23 01:11:28','2026-08-23 06:43:22'),(55,2,'maintenance_updated','Maintenance Request Started','Cleaning request for Room 101 is now in_progress',3,'maintenance','/maintenance/3','?','#f39c12',1,'2026-08-23 01:11:28','2026-09-01 14:50:27'),(58,1,'maintenance_updated','Maintenance Request Started','Electrician request for Room 101 is now in_progress',2,'maintenance','/maintenance/2','?','#f39c12',1,'2026-08-23 01:11:32','2026-08-23 06:43:22'),(59,2,'maintenance_updated','Maintenance Request Started','Electrician request for Room 101 is now in_progress',2,'maintenance','/maintenance/2','?','#f39c12',1,'2026-08-23 01:11:32','2026-09-01 14:50:27'),(62,1,'maintenance_updated','Maintenance Request Completed','Electrician request for Room 201 is now completed',1,'maintenance','/maintenance/1','?','#f39c12',1,'2026-08-23 01:11:35','2026-08-23 06:43:22'),(63,2,'maintenance_updated','Maintenance Request Completed','Electrician request for Room 201 is now completed',1,'maintenance','/maintenance/1','?','#f39c12',1,'2026-08-23 01:11:35','2026-09-01 14:50:27'),(66,1,'maintenance_updated','Maintenance Request Completed','Electrician request for Room 101 is now completed',2,'maintenance','/maintenance/2','?','#f39c12',1,'2026-08-23 01:11:36','2026-08-23 06:43:22'),(67,2,'maintenance_updated','Maintenance Request Completed','Electrician request for Room 101 is now completed',2,'maintenance','/maintenance/2','?','#f39c12',1,'2026-08-23 01:11:36','2026-09-01 14:50:27'),(70,1,'maintenance_updated','Maintenance Request Completed','Cleaning request for Room 101 is now completed',3,'maintenance','/maintenance/3','?','#f39c12',1,'2026-08-23 01:11:37','2026-08-23 06:43:22'),(71,2,'maintenance_updated','Maintenance Request Completed','Cleaning request for Room 101 is now completed',3,'maintenance','/maintenance/3','?','#f39c12',1,'2026-08-23 01:11:37','2026-09-01 14:50:27'),(74,1,'maintenance_updated','Maintenance Request Completed','Check-out request for Room 101 is now completed',4,'maintenance','/maintenance/4','?','#f39c12',1,'2026-08-23 01:11:38','2026-08-23 06:43:22'),(75,2,'maintenance_updated','Maintenance Request Completed','Check-out request for Room 101 is now completed',4,'maintenance','/maintenance/4','?','#f39c12',1,'2026-08-23 01:11:38','2026-09-01 14:50:27'),(78,1,'bill_created','New Bill Generated','Bill of ₹13190.00 created for undefined',1,'bill','/bills/1','?','#3498db',1,'2026-08-23 01:14:07','2026-08-23 06:47:02'),(79,2,'bill_created','New Bill Generated','Bill of ₹13190.00 created for undefined',1,'bill','/bills/1','?','#3498db',1,'2026-08-23 01:14:07','2026-09-01 14:50:27'),(82,1,'admin_created','New Admin Created','Admin \"Mohammed Aminu Shehe\" has been created',6,'admin','/admins/6','?‍?','#3498db',1,'2026-08-23 01:44:55','2026-08-23 08:55:01'),(83,2,'admin_created','New Admin Created','Admin \"Mohammed Aminu Shehe\" has been created',6,'admin','/admins/6','?‍?','#3498db',1,'2026-08-23 01:44:55','2026-09-01 14:50:27'),(84,1,'bill_created','New Bill Generated','Bill of ₹14200.00 created for undefined',2,'bill','/bills/2','?','#3498db',1,'2026-08-23 02:50:24','2026-08-23 08:55:01'),(85,2,'bill_created','New Bill Generated','Bill of ₹14200.00 created for undefined',2,'bill','/bills/2','?','#3498db',1,'2026-08-23 02:50:24','2026-09-01 14:50:27'),(89,1,'bill_created','New Bill Generated','Bill of ₹11800.00 created for undefined',3,'bill','/bills/3','?','#3498db',1,'2026-08-23 02:54:12','2026-08-23 08:55:01'),(90,2,'bill_created','New Bill Generated','Bill of ₹11800.00 created for undefined',3,'bill','/bills/3','?','#3498db',1,'2026-08-23 02:54:12','2026-09-01 14:50:27'),(94,1,'payment_proof_submitted','New Payment Proof Submitted','Mohammed Aminu Shehe submitted a payment proof of ₹11000.0',2,'payment_proof','/bills/payment-proofs/2','?','#3498db',1,'2026-08-23 03:24:07','2026-08-23 08:55:01'),(95,2,'payment_proof_submitted','New Payment Proof Submitted','Mohammed Aminu Shehe submitted a payment proof of ₹11000.0',2,'payment_proof','/bills/payment-proofs/2','?','#3498db',1,'2026-08-23 03:24:07','2026-09-01 14:50:27'),(99,1,'payment_proof_submitted','New Payment Proof Submitted','Mohammed Aminu Shehe submitted a payment proof of ₹800.0',3,'payment_proof','/bills/payment-proofs/3','?','#3498db',1,'2026-08-23 03:26:12','2026-08-23 08:57:48'),(100,2,'payment_proof_submitted','New Payment Proof Submitted','Mohammed Aminu Shehe submitted a payment proof of ₹800.0',3,'payment_proof','/bills/payment-proofs/3','?','#3498db',1,'2026-08-23 03:26:12','2026-09-01 14:50:27'),(104,1,'payment_proof_submitted','New Payment Proof Submitted','Mohammed Aminu Shehe submitted a payment proof of ₹800.0',4,'payment_proof','/bills/payment-proofs/4','?','#3498db',1,'2026-08-23 03:28:09','2026-08-23 09:05:33'),(105,2,'payment_proof_submitted','New Payment Proof Submitted','Mohammed Aminu Shehe submitted a payment proof of ₹800.0',4,'payment_proof','/bills/payment-proofs/4','?','#3498db',1,'2026-08-23 03:28:09','2026-09-01 14:50:27'),(109,1,'bill_created','New Bill Generated','Bill of ₹11000.00 created for Mohammed Aminu Shehe',4,'bill','/bills/4','?','#3498db',1,'2026-08-23 03:32:08','2026-08-23 09:02:27'),(110,2,'bill_created','New Bill Generated','Bill of ₹11000.00 created for Mohammed Aminu Shehe',4,'bill','/bills/4','?','#3498db',1,'2026-08-23 03:32:08','2026-09-01 14:50:27'),(114,1,'tenant_registered','New Tenant Registered','Collins Mark has been registered as a tenant',10,'tenant','/tenants/10','?','#2ecc71',1,'2026-08-23 12:03:58','2026-08-23 18:07:25'),(115,2,'tenant_registered','New Tenant Registered','Collins Mark has been registered as a tenant',10,'tenant','/tenants/10','?','#2ecc71',1,'2026-08-23 12:03:58','2026-09-01 14:50:27'),(119,1,'feedback_submitted','New Feedback Received','Collins Mark gave 9.5/10 rating for Happy Living PG',3,'feedback','/feedbacks/3','⭐','#f39c12',1,'2026-08-23 12:31:35','2026-08-23 18:07:25'),(120,2,'feedback_submitted','New Feedback Received','Collins Mark gave 9.5/10 rating for Happy Living PG',3,'feedback','/feedbacks/3','⭐','#f39c12',1,'2026-08-23 12:31:35','2026-09-01 14:50:27'),(124,1,'bill_created','New Bill Generated','Bill of ₹13900.00 created for Collins Mark',5,'bill','/bills/5','?','#3498db',1,'2026-08-23 12:40:20','2026-08-23 18:30:56'),(125,2,'bill_created','New Bill Generated','Bill of ₹13900.00 created for Collins Mark',5,'bill','/bills/5','?','#3498db',1,'2026-08-23 12:40:20','2026-09-01 14:50:27'),(129,1,'payment_proof_submitted','New Payment Proof Submitted','Collins Mark submitted a payment proof of ₹13900.0',5,'payment_proof','/bills/payment-proofs/5','?','#3498db',1,'2026-08-23 12:45:08','2026-08-23 18:30:56'),(130,2,'payment_proof_submitted','New Payment Proof Submitted','Collins Mark submitted a payment proof of ₹13900.0',5,'payment_proof','/bills/payment-proofs/5','?','#3498db',1,'2026-08-23 12:45:08','2026-09-01 14:50:27'),(134,1,'tenant_registered','New Tenant Registered','Avinash Kumar has been registered as a tenant',11,'tenant','/tenants/11','?','#2ecc71',1,'2026-08-23 18:14:04','2026-08-25 14:27:25'),(135,2,'tenant_registered','New Tenant Registered','Avinash Kumar has been registered as a tenant',11,'tenant','/tenants/11','?','#2ecc71',1,'2026-08-23 18:14:04','2026-09-01 14:50:27'),(139,1,'tenant_registered','New Tenant Registered','Avinash has been registered as a tenant',12,'tenant','/tenants/12','?','#2ecc71',1,'2026-08-23 18:18:56','2026-08-25 14:27:25'),(140,2,'tenant_registered','New Tenant Registered','Avinash has been registered as a tenant',12,'tenant','/tenants/12','?','#2ecc71',1,'2026-08-23 18:18:56','2026-09-01 14:50:27'),(144,1,'maintenance_created','New Maintenance Request','Avinash requested Others for Room 202',5,'maintenance','/maintenance/5','?','#3498db',1,'2026-08-23 18:30:42','2026-08-25 14:27:25'),(145,2,'maintenance_created','New Maintenance Request','Avinash requested Others for Room 202',5,'maintenance','/maintenance/5','?','#3498db',1,'2026-08-23 18:30:42','2026-09-01 14:50:27'),(149,1,'maintenance_created','New Maintenance Request','Mohammed Aminu Shehe requested Electrician for Room 402',6,'maintenance','/maintenance/6','?','#3498db',1,'2026-08-23 18:34:10','2026-08-25 14:27:25'),(150,2,'maintenance_created','New Maintenance Request','Mohammed Aminu Shehe requested Electrician for Room 402',6,'maintenance','/maintenance/6','?','#3498db',1,'2026-08-23 18:34:10','2026-09-01 14:50:27'),(154,1,'maintenance_updated','Maintenance Request Started','Others request for Room 202 is now in_progress',5,'maintenance','/maintenance/5','?','#f39c12',1,'2026-08-23 18:34:27','2026-08-25 14:27:25'),(155,2,'maintenance_updated','Maintenance Request Started','Others request for Room 202 is now in_progress',5,'maintenance','/maintenance/5','?','#f39c12',1,'2026-08-23 18:34:27','2026-09-01 14:50:27'),(159,1,'maintenance_updated','Maintenance Request Started','Electrician request for Room 402 is now in_progress',6,'maintenance','/maintenance/6','?','#f39c12',1,'2026-08-23 18:34:39','2026-08-25 14:27:25'),(160,2,'maintenance_updated','Maintenance Request Started','Electrician request for Room 402 is now in_progress',6,'maintenance','/maintenance/6','?','#f39c12',1,'2026-08-23 18:34:39','2026-09-01 14:50:27'),(164,1,'maintenance_updated','Maintenance Request Completed','Others request for Room 202 is now completed',5,'maintenance','/maintenance/5','?','#f39c12',1,'2026-08-23 18:34:51','2026-08-25 14:27:25'),(165,2,'maintenance_updated','Maintenance Request Completed','Others request for Room 202 is now completed',5,'maintenance','/maintenance/5','?','#f39c12',1,'2026-08-23 18:34:51','2026-09-01 14:50:27'),(169,1,'maintenance_updated','Maintenance Request Completed','Electrician request for Room 402 is now completed',6,'maintenance','/maintenance/6','?','#f39c12',1,'2026-08-23 18:34:59','2026-08-25 14:27:25'),(170,2,'maintenance_updated','Maintenance Request Completed','Electrician request for Room 402 is now completed',6,'maintenance','/maintenance/6','?','#f39c12',1,'2026-08-23 18:34:59','2026-09-01 14:50:27'),(174,1,'feedback_submitted','New Feedback Received','undefined gave 6.5/10 rating for Shree Shyam Apartment',1,'feedback','/feedbacks/1','⭐','#f39c12',1,'2026-08-25 06:44:44','2026-08-25 14:27:25'),(175,2,'feedback_submitted','New Feedback Received','undefined gave 6.5/10 rating for Shree Shyam Apartment',1,'feedback','/feedbacks/1','⭐','#f39c12',1,'2026-08-25 06:44:44','2026-09-01 14:50:27'),(179,1,'tenant_registered','New Tenant Registered','Sri Ram has been registered as a tenant',18,'tenant','/tenants/18','?','#2ecc71',1,'2026-08-25 21:56:57','2026-08-26 11:36:26'),(180,2,'tenant_registered','New Tenant Registered','Sri Ram has been registered as a tenant',18,'tenant','/tenants/18','?','#2ecc71',1,'2026-08-25 21:56:57','2026-09-01 14:50:27'),(182,1,'maintenance_created','New Maintenance Request','Sri Ram requested Electrician for Room 201',7,'maintenance','/maintenance/7','?','#3498db',1,'2026-08-25 22:00:38','2026-08-26 11:36:26'),(183,2,'maintenance_created','New Maintenance Request','Sri Ram requested Electrician for Room 201',7,'maintenance','/maintenance/7','?','#3498db',1,'2026-08-25 22:00:38','2026-09-01 14:50:27'),(185,1,'maintenance_updated','Maintenance Request Started','Electrician request for Room 201 is now in_progress',7,'maintenance','/maintenance/7','?','#f39c12',1,'2026-08-25 22:01:50','2026-08-26 11:36:26'),(186,2,'maintenance_updated','Maintenance Request Started','Electrician request for Room 201 is now in_progress',7,'maintenance','/maintenance/7','?','#f39c12',1,'2026-08-25 22:01:50','2026-09-01 14:50:27'),(188,1,'pg_updated','PG Updated','PG \"Mannat Apartment (Plot No :- 99)\" has been updated',7,'pg','/pgs/7','?️','#3498db',1,'2026-08-25 22:06:18','2026-08-26 11:36:18'),(189,2,'pg_updated','PG Updated','PG \"Mannat Apartment (Plot No :- 99)\" has been updated',7,'pg','/pgs/7','?️','#3498db',1,'2026-08-25 22:06:18','2026-09-01 14:50:27'),(191,1,'maintenance_updated','Maintenance Request Completed','Electrician request for Room 201 is now completed',7,'maintenance','/maintenance/7','?','#f39c12',1,'2026-08-31 12:10:51','2026-08-31 12:46:14'),(192,2,'maintenance_updated','Maintenance Request Completed','Electrician request for Room 201 is now completed',7,'maintenance','/maintenance/7','?','#f39c12',1,'2026-08-31 12:10:51','2026-09-01 14:50:27'),(194,1,'bill_created','New Bill Generated','Bill of ₹14156.00 created for Sri Ram',6,'bill','/bills/6','?','#3498db',1,'2026-08-31 12:13:06','2026-08-31 12:46:14'),(195,2,'bill_created','New Bill Generated','Bill of ₹14156.00 created for Sri Ram',6,'bill','/bills/6','?','#3498db',1,'2026-08-31 12:13:06','2026-09-01 14:50:27'),(197,1,'tenant_registered','New Tenant Registered','MO11 has been registered as a tenant',31,'tenant','/tenants/31','?','#2ecc71',1,'2026-08-31 12:54:40','2026-08-31 12:55:23'),(198,2,'tenant_registered','New Tenant Registered','MO11 has been registered as a tenant',31,'tenant','/tenants/31','?','#2ecc71',1,'2026-08-31 12:54:40','2026-09-01 14:50:27'),(201,2,'pg_updated','PG Updated','PG \"Shree Shyam Apartment\" has been updated',5,'pg','/pgs/5','?️','#3498db',1,'2026-08-31 15:24:53','2026-09-01 14:50:27'),(203,1,'tenant_registered','New Tenant Registered','Soniya Sharma has been registered as a tenant',32,'tenant','/tenants/32','?','#2ecc71',0,'2026-08-31 15:37:34',NULL),(204,2,'tenant_registered','New Tenant Registered','Soniya Sharma has been registered as a tenant',32,'tenant','/tenants/32','?','#2ecc71',1,'2026-08-31 15:37:34','2026-09-01 14:50:27'),(206,1,'bill_created','New Bill Generated','Bill of ₹12268.00 created for Soniya Sharma',7,'bill','/bills/7','?','#3498db',0,'2026-08-31 15:42:01',NULL),(207,2,'bill_created','New Bill Generated','Bill of ₹12268.00 created for Soniya Sharma',7,'bill','/bills/7','?','#3498db',1,'2026-08-31 15:42:01','2026-09-01 14:50:27'),(209,1,'cash_payment_verified','Cash Payment Verified','Cash payment of ₹14156.00 verified for Sri Ram',6,'bill','/bills/6','?','#2ecc71',0,'2026-09-01 08:18:02',NULL),(210,2,'cash_payment_verified','Cash Payment Verified','Cash payment of ₹14156.00 verified for Sri Ram',6,'bill','/bills/6','?','#2ecc71',1,'2026-09-01 08:18:02','2026-09-01 14:50:27'),(212,1,'tenant_registered','New Tenant Registered','Prosad Das has been registered as a tenant',33,'tenant','/tenants/33','?','#2ecc71',0,'2026-09-01 13:11:49',NULL),(213,2,'tenant_registered','New Tenant Registered','Prosad Das has been registered as a tenant',33,'tenant','/tenants/33','?','#2ecc71',1,'2026-09-01 13:11:49','2026-09-01 14:50:27'),(215,1,'tenant_registered','New Tenant Registered','Shuvo Das has been registered as a tenant',34,'tenant','/tenants/34','?','#2ecc71',0,'2026-09-01 13:24:15',NULL),(216,2,'tenant_registered','New Tenant Registered','Shuvo Das has been registered as a tenant',34,'tenant','/tenants/34','?','#2ecc71',1,'2026-09-01 13:24:15','2026-09-01 14:50:27'),(218,1,'admin_created','New Admin Created','Admin \"Asif Ali Mir\" has been created',7,'admin','/admins/7','?‍?','#3498db',0,'2026-09-01 14:37:06',NULL),(219,2,'admin_created','New Admin Created','Admin \"Asif Ali Mir\" has been created',7,'admin','/admins/7','?‍?','#3498db',1,'2026-09-01 14:37:06','2026-09-01 14:50:27'),(220,1,'pg_updated','PG Updated','PG \"J T House (Plot No :- 257)\" has been updated',4,'pg','/pgs/4','?️','#3498db',0,'2026-09-01 17:32:43',NULL),(221,2,'pg_updated','PG Updated','PG \"J T House (Plot No :- 257)\" has been updated',4,'pg','/pgs/4','?️','#3498db',1,'2026-09-01 17:32:43','2026-09-01 17:47:53'),(223,7,'pg_updated','PG Updated','PG \"J T House (Plot No :- 257)\" has been updated',4,'pg','/pgs/4','?️','#3498db',0,'2026-09-01 17:32:43',NULL),(224,1,'tenant_registered','New Tenant Registered','Vishwa Singh has been registered as a tenant',36,'tenant','/tenants/36','?','#2ecc71',0,'2026-09-01 17:34:51',NULL),(225,2,'tenant_registered','New Tenant Registered','Vishwa Singh has been registered as a tenant',36,'tenant','/tenants/36','?','#2ecc71',1,'2026-09-01 17:34:51','2026-09-01 17:47:53'),(227,7,'tenant_registered','New Tenant Registered','Vishwa Singh has been registered as a tenant',36,'tenant','/tenants/36','?','#2ecc71',0,'2026-09-01 17:34:51',NULL),(228,1,'bill_created','New Bill Generated','Bill of ₹11000.00 created for Vishwa Singh',8,'bill','/bills/8','?','#3498db',0,'2026-09-01 17:47:36',NULL),(229,2,'bill_created','New Bill Generated','Bill of ₹11000.00 created for Vishwa Singh',8,'bill','/bills/8','?','#3498db',1,'2026-09-01 17:47:36','2026-09-01 17:47:53'),(231,7,'bill_created','New Bill Generated','Bill of ₹11000.00 created for Vishwa Singh',8,'bill','/bills/8','?','#3498db',0,'2026-09-01 17:47:36',NULL),(232,1,'maintenance_created','New Maintenance Request','Shuvo Das requested Cleaning for Room 216',8,'maintenance','/maintenance/8','?','#3498db',0,'2026-09-02 14:52:03',NULL),(233,2,'maintenance_created','New Maintenance Request','Shuvo Das requested Cleaning for Room 216',8,'maintenance','/maintenance/8','?','#3498db',0,'2026-09-02 14:52:03',NULL),(235,7,'maintenance_created','New Maintenance Request','Shuvo Das requested Cleaning for Room 216',8,'maintenance','/maintenance/8','?','#3498db',0,'2026-09-02 14:52:03',NULL),(236,1,'tenant_registered','New Tenant Registered','Sohil Khan has been registered as a tenant',37,'tenant','/tenants/37','?','#2ecc71',0,'2026-09-03 14:12:17',NULL),(237,2,'tenant_registered','New Tenant Registered','Sohil Khan has been registered as a tenant',37,'tenant','/tenants/37','?','#2ecc71',0,'2026-09-03 14:12:17',NULL),(239,7,'tenant_registered','New Tenant Registered','Sohil Khan has been registered as a tenant',37,'tenant','/tenants/37','?','#2ecc71',0,'2026-09-03 14:12:17',NULL),(240,1,'tenant_registered','New Tenant Registered','Ahin Vinod has been registered as a tenant',38,'tenant','/tenants/38','?','#2ecc71',0,'2026-09-03 14:12:23',NULL),(241,2,'tenant_registered','New Tenant Registered','Ahin Vinod has been registered as a tenant',38,'tenant','/tenants/38','?','#2ecc71',0,'2026-09-03 14:12:23',NULL),(243,7,'tenant_registered','New Tenant Registered','Ahin Vinod has been registered as a tenant',38,'tenant','/tenants/38','?','#2ecc71',0,'2026-09-03 14:12:23',NULL),(244,1,'bill_created','New Bill Generated','Bill of ₹17108.00 created for Ahin Vinod',9,'bill','/bills/9','?','#3498db',0,'2026-09-03 14:18:46',NULL),(245,2,'bill_created','New Bill Generated','Bill of ₹17108.00 created for Ahin Vinod',9,'bill','/bills/9','?','#3498db',0,'2026-09-03 14:18:46',NULL),(247,7,'bill_created','New Bill Generated','Bill of ₹17108.00 created for Ahin Vinod',9,'bill','/bills/9','?','#3498db',0,'2026-09-03 14:18:46',NULL),(248,1,'bill_created','New Bill Generated','Bill of ₹17108.00 created for Sohil Khan',10,'bill','/bills/10','?','#3498db',0,'2026-09-03 14:19:32',NULL),(249,2,'bill_created','New Bill Generated','Bill of ₹17108.00 created for Sohil Khan',10,'bill','/bills/10','?','#3498db',0,'2026-09-03 14:19:32',NULL),(251,7,'bill_created','New Bill Generated','Bill of ₹17108.00 created for Sohil Khan',10,'bill','/bills/10','?','#3498db',0,'2026-09-03 14:19:32',NULL),(252,1,'pg_updated','PG Updated','PG \"Mannat Apartment (Plot No :- 99)\" has been updated',7,'pg','/pgs/7','?️','#3498db',0,'2026-09-04 11:27:54',NULL),(253,2,'pg_updated','PG Updated','PG \"Mannat Apartment (Plot No :- 99)\" has been updated',7,'pg','/pgs/7','?️','#3498db',0,'2026-09-04 11:27:54',NULL),(254,7,'pg_updated','PG Updated','PG \"Mannat Apartment (Plot No :- 99)\" has been updated',7,'pg','/pgs/7','?️','#3498db',0,'2026-09-04 11:27:54',NULL),(255,1,'pg_updated','PG Updated','PG \"Mannat Apartment (Plot No :- 99)\" has been updated',7,'pg','/pgs/7','?️','#3498db',0,'2026-09-04 11:30:39',NULL),(256,2,'pg_updated','PG Updated','PG \"Mannat Apartment (Plot No :- 99)\" has been updated',7,'pg','/pgs/7','?️','#3498db',0,'2026-09-04 11:30:39',NULL),(257,7,'pg_updated','PG Updated','PG \"Mannat Apartment (Plot No :- 99)\" has been updated',7,'pg','/pgs/7','?️','#3498db',0,'2026-09-04 11:30:39',NULL),(258,1,'tenant_registered','New Tenant Registered','Shubham has been registered as a tenant',39,'tenant','/tenants/39','?','#2ecc71',0,'2026-09-04 13:49:01',NULL),(259,2,'tenant_registered','New Tenant Registered','Shubham has been registered as a tenant',39,'tenant','/tenants/39','?','#2ecc71',0,'2026-09-04 13:49:01',NULL),(260,7,'tenant_registered','New Tenant Registered','Shubham has been registered as a tenant',39,'tenant','/tenants/39','?','#2ecc71',0,'2026-09-04 13:49:01',NULL),(261,1,'tenant_registered','New Tenant Registered','Himanshu has been registered as a tenant',40,'tenant','/tenants/40','?','#2ecc71',0,'2026-09-04 13:49:08',NULL),(262,2,'tenant_registered','New Tenant Registered','Himanshu has been registered as a tenant',40,'tenant','/tenants/40','?','#2ecc71',0,'2026-09-04 13:49:08',NULL),(263,7,'tenant_registered','New Tenant Registered','Himanshu has been registered as a tenant',40,'tenant','/tenants/40','?','#2ecc71',0,'2026-09-04 13:49:08',NULL),(264,1,'bill_created','New Bill Generated','Bill of ₹10820.00 created for Himanshu',11,'bill','/bills/11','?','#3498db',0,'2026-09-04 13:53:27',NULL),(265,2,'bill_created','New Bill Generated','Bill of ₹10820.00 created for Himanshu',11,'bill','/bills/11','?','#3498db',0,'2026-09-04 13:53:27',NULL),(266,7,'bill_created','New Bill Generated','Bill of ₹10820.00 created for Himanshu',11,'bill','/bills/11','?','#3498db',0,'2026-09-04 13:53:27',NULL),(267,1,'maintenance_created','New Maintenance Request','Himanshu requested Cleaning for Room 106',9,'maintenance','/maintenance/9','?','#3498db',0,'2026-09-04 15:53:23',NULL),(268,2,'maintenance_created','New Maintenance Request','Himanshu requested Cleaning for Room 106',9,'maintenance','/maintenance/9','?','#3498db',0,'2026-09-04 15:53:23',NULL),(269,7,'maintenance_created','New Maintenance Request','Himanshu requested Cleaning for Room 106',9,'maintenance','/maintenance/9','?','#3498db',0,'2026-09-04 15:53:23',NULL),(270,1,'bill_created','New Bill Generated','Bill of ₹11600.00 created for Shuvo Das',12,'bill','/bills/12','?','#3498db',0,'2026-09-04 18:44:55',NULL),(271,2,'bill_created','New Bill Generated','Bill of ₹11600.00 created for Shuvo Das',12,'bill','/bills/12','?','#3498db',0,'2026-09-04 18:44:55',NULL),(272,7,'bill_created','New Bill Generated','Bill of ₹11600.00 created for Shuvo Das',12,'bill','/bills/12','?','#3498db',0,'2026-09-04 18:44:55',NULL),(273,1,'bill_created','New Bill Generated','Bill of ₹3180.00 created for Mohammed Aminu Shehe',13,'bill','/bills/13','?','#3498db',0,'2026-09-04 19:12:01',NULL),(274,2,'bill_created','New Bill Generated','Bill of ₹3180.00 created for Mohammed Aminu Shehe',13,'bill','/bills/13','?','#3498db',0,'2026-09-04 19:12:01',NULL),(275,7,'bill_created','New Bill Generated','Bill of ₹3180.00 created for Mohammed Aminu Shehe',13,'bill','/bills/13','?','#3498db',0,'2026-09-04 19:12:01',NULL),(279,1,'maintenance_created','New Maintenance Request','Shuvo Das requested Cleaning for Room 216',10,'maintenance','/maintenance/10','?','#3498db',0,'2026-09-06 04:19:05',NULL),(280,2,'maintenance_created','New Maintenance Request','Shuvo Das requested Cleaning for Room 216',10,'maintenance','/maintenance/10','?','#3498db',0,'2026-09-06 04:19:05',NULL),(281,7,'maintenance_created','New Maintenance Request','Shuvo Das requested Cleaning for Room 216',10,'maintenance','/maintenance/10','?','#3498db',0,'2026-09-06 04:19:05',NULL),(282,1,'payment_proof_submitted','New Payment Proof Submitted','Soniya Sharma submitted a payment proof of ₹16181.0',6,'payment_proof','/bills/payment-proofs/6','?','#3498db',0,'2026-09-06 19:17:31',NULL),(283,2,'payment_proof_submitted','New Payment Proof Submitted','Soniya Sharma submitted a payment proof of ₹16181.0',6,'payment_proof','/bills/payment-proofs/6','?','#3498db',0,'2026-09-06 19:17:31',NULL),(284,7,'payment_proof_submitted','New Payment Proof Submitted','Soniya Sharma submitted a payment proof of ₹16181.0',6,'payment_proof','/bills/payment-proofs/6','?','#3498db',0,'2026-09-06 19:17:31',NULL),(285,1,'tenant_expiry','Payment Overdue','Soniya Sharma\'s rent is 7 days overdue',32,'tenant','/tenants/32','⚠️','#e74c3c',0,'2026-09-07 11:00:00',NULL),(286,2,'tenant_expiry','Payment Overdue','Soniya Sharma\'s rent is 7 days overdue',32,'tenant','/tenants/32','⚠️','#e74c3c',0,'2026-09-07 11:00:00',NULL),(287,7,'tenant_expiry','Payment Overdue','Soniya Sharma\'s rent is 7 days overdue',32,'tenant','/tenants/32','⚠️','#e74c3c',0,'2026-09-07 11:00:00',NULL),(288,1,'tenant_expiry','Payment Overdue','Shuvo Das\'s rent is 7 days overdue',34,'tenant','/tenants/34','⚠️','#e74c3c',0,'2026-09-07 11:00:01',NULL),(289,2,'tenant_expiry','Payment Overdue','Shuvo Das\'s rent is 7 days overdue',34,'tenant','/tenants/34','⚠️','#e74c3c',0,'2026-09-07 11:00:01',NULL),(290,7,'tenant_expiry','Payment Overdue','Shuvo Das\'s rent is 7 days overdue',34,'tenant','/tenants/34','⚠️','#e74c3c',0,'2026-09-07 11:00:01',NULL),(291,1,'tenant_expiry','Payment Overdue','Vishwa Singh\'s rent is 7 days overdue',36,'tenant','/tenants/36','⚠️','#e74c3c',0,'2026-09-07 11:00:01',NULL),(292,2,'tenant_expiry','Payment Overdue','Vishwa Singh\'s rent is 7 days overdue',36,'tenant','/tenants/36','⚠️','#e74c3c',0,'2026-09-07 11:00:01',NULL),(293,7,'tenant_expiry','Payment Overdue','Vishwa Singh\'s rent is 7 days overdue',36,'tenant','/tenants/36','⚠️','#e74c3c',0,'2026-09-07 11:00:01',NULL),(294,1,'tenant_expiry','Payment Overdue','Sohil Khan\'s rent is 7 days overdue',37,'tenant','/tenants/37','⚠️','#e74c3c',0,'2026-09-07 11:00:01',NULL),(295,2,'tenant_expiry','Payment Overdue','Sohil Khan\'s rent is 7 days overdue',37,'tenant','/tenants/37','⚠️','#e74c3c',0,'2026-09-07 11:00:01',NULL),(296,7,'tenant_expiry','Payment Overdue','Sohil Khan\'s rent is 7 days overdue',37,'tenant','/tenants/37','⚠️','#e74c3c',0,'2026-09-07 11:00:01',NULL),(297,1,'tenant_expiry','Payment Overdue','Ahin Vinod\'s rent is 7 days overdue',38,'tenant','/tenants/38','⚠️','#e74c3c',0,'2026-09-07 11:00:02',NULL),(298,2,'tenant_expiry','Payment Overdue','Ahin Vinod\'s rent is 7 days overdue',38,'tenant','/tenants/38','⚠️','#e74c3c',0,'2026-09-07 11:00:02',NULL),(299,7,'tenant_expiry','Payment Overdue','Ahin Vinod\'s rent is 7 days overdue',38,'tenant','/tenants/38','⚠️','#e74c3c',0,'2026-09-07 11:00:02',NULL),(300,1,'tenant_expiry','Payment Overdue','Shubham\'s rent is 7 days overdue',39,'tenant','/tenants/39','⚠️','#e74c3c',0,'2026-09-07 11:00:02',NULL),(301,2,'tenant_expiry','Payment Overdue','Shubham\'s rent is 7 days overdue',39,'tenant','/tenants/39','⚠️','#e74c3c',0,'2026-09-07 11:00:02',NULL),(302,7,'tenant_expiry','Payment Overdue','Shubham\'s rent is 7 days overdue',39,'tenant','/tenants/39','⚠️','#e74c3c',0,'2026-09-07 11:00:02',NULL),(303,1,'tenant_expiry','Payment Overdue','Himanshu\'s rent is 7 days overdue',40,'tenant','/tenants/40','⚠️','#e74c3c',0,'2026-09-07 11:00:02',NULL),(304,2,'tenant_expiry','Payment Overdue','Himanshu\'s rent is 7 days overdue',40,'tenant','/tenants/40','⚠️','#e74c3c',0,'2026-09-07 11:00:02',NULL),(305,7,'tenant_expiry','Payment Overdue','Himanshu\'s rent is 7 days overdue',40,'tenant','/tenants/40','⚠️','#e74c3c',0,'2026-09-07 11:00:02',NULL),(306,1,'tenant_registered','New Tenant Registered','Sameer has been registered as a tenant',41,'tenant','/tenants/41','?','#2ecc71',0,'2026-09-07 14:45:23',NULL),(307,2,'tenant_registered','New Tenant Registered','Sameer has been registered as a tenant',41,'tenant','/tenants/41','?','#2ecc71',0,'2026-09-07 14:45:23',NULL),(308,7,'tenant_registered','New Tenant Registered','Sameer has been registered as a tenant',41,'tenant','/tenants/41','?','#2ecc71',0,'2026-09-07 14:45:23',NULL),(309,1,'tenant_registered','New Tenant Registered','Arayan has been registered as a tenant',42,'tenant','/tenants/42','?','#2ecc71',0,'2026-09-07 14:45:29',NULL),(310,2,'tenant_registered','New Tenant Registered','Arayan has been registered as a tenant',42,'tenant','/tenants/42','?','#2ecc71',0,'2026-09-07 14:45:29',NULL),(311,7,'tenant_registered','New Tenant Registered','Arayan has been registered as a tenant',42,'tenant','/tenants/42','?','#2ecc71',0,'2026-09-07 14:45:29',NULL),(312,1,'bill_created','New Bill Generated','Bill of ₹11341.00 created for Sameer',15,'bill','/bills/15','?','#3498db',0,'2026-09-07 14:47:08',NULL),(313,2,'bill_created','New Bill Generated','Bill of ₹11341.00 created for Sameer',15,'bill','/bills/15','?','#3498db',0,'2026-09-07 14:47:08',NULL),(314,7,'bill_created','New Bill Generated','Bill of ₹11341.00 created for Sameer',15,'bill','/bills/15','?','#3498db',0,'2026-09-07 14:47:08',NULL),(315,1,'payment_proof_submitted','New Payment Proof Submitted','Sameer submitted a payment proof of ₹11341.0',7,'payment_proof','/bills/payment-proofs/7','?','#3498db',0,'2026-09-07 15:46:18',NULL),(316,2,'payment_proof_submitted','New Payment Proof Submitted','Sameer submitted a payment proof of ₹11341.0',7,'payment_proof','/bills/payment-proofs/7','?','#3498db',0,'2026-09-07 15:46:18',NULL),(317,7,'payment_proof_submitted','New Payment Proof Submitted','Sameer submitted a payment proof of ₹11341.0',7,'payment_proof','/bills/payment-proofs/7','?','#3498db',0,'2026-09-07 15:46:18',NULL),(318,1,'maintenance_created','New Maintenance Request','Himanshu requested Others for Room 106',11,'maintenance','/maintenance/11','?','#3498db',0,'2026-09-07 17:13:16',NULL),(319,2,'maintenance_created','New Maintenance Request','Himanshu requested Others for Room 106',11,'maintenance','/maintenance/11','?','#3498db',0,'2026-09-07 17:13:16',NULL),(320,7,'maintenance_created','New Maintenance Request','Himanshu requested Others for Room 106',11,'maintenance','/maintenance/11','?','#3498db',0,'2026-09-07 17:13:16',NULL),(321,1,'maintenance_created','New Maintenance Request','Himanshu requested Electrician for Room 106',12,'maintenance','/maintenance/12','?','#3498db',0,'2026-09-07 17:14:02',NULL),(322,2,'maintenance_created','New Maintenance Request','Himanshu requested Electrician for Room 106',12,'maintenance','/maintenance/12','?','#3498db',0,'2026-09-07 17:14:02',NULL),(323,7,'maintenance_created','New Maintenance Request','Himanshu requested Electrician for Room 106',12,'maintenance','/maintenance/12','?','#3498db',0,'2026-09-07 17:14:02',NULL),(324,1,'tenant_expiry','Payment Overdue','Soniya Sharma\'s rent is 14 days overdue',32,'tenant','/tenants/32','⚠️','#e74c3c',0,'2026-09-14 11:00:00',NULL),(325,2,'tenant_expiry','Payment Overdue','Soniya Sharma\'s rent is 14 days overdue',32,'tenant','/tenants/32','⚠️','#e74c3c',0,'2026-09-14 11:00:00',NULL),(326,7,'tenant_expiry','Payment Overdue','Soniya Sharma\'s rent is 14 days overdue',32,'tenant','/tenants/32','⚠️','#e74c3c',0,'2026-09-14 11:00:00',NULL),(327,1,'tenant_expiry','Payment Overdue','Shuvo Das\'s rent is 14 days overdue',34,'tenant','/tenants/34','⚠️','#e74c3c',0,'2026-09-14 11:00:01',NULL),(328,2,'tenant_expiry','Payment Overdue','Shuvo Das\'s rent is 14 days overdue',34,'tenant','/tenants/34','⚠️','#e74c3c',0,'2026-09-14 11:00:01',NULL),(329,7,'tenant_expiry','Payment Overdue','Shuvo Das\'s rent is 14 days overdue',34,'tenant','/tenants/34','⚠️','#e74c3c',0,'2026-09-14 11:00:01',NULL),(330,1,'tenant_expiry','Payment Overdue','Vishwa Singh\'s rent is 14 days overdue',36,'tenant','/tenants/36','⚠️','#e74c3c',0,'2026-09-14 11:00:01',NULL),(331,2,'tenant_expiry','Payment Overdue','Vishwa Singh\'s rent is 14 days overdue',36,'tenant','/tenants/36','⚠️','#e74c3c',0,'2026-09-14 11:00:01',NULL),(332,7,'tenant_expiry','Payment Overdue','Vishwa Singh\'s rent is 14 days overdue',36,'tenant','/tenants/36','⚠️','#e74c3c',0,'2026-09-14 11:00:01',NULL),(333,1,'tenant_expiry','Payment Overdue','Sohil Khan\'s rent is 14 days overdue',37,'tenant','/tenants/37','⚠️','#e74c3c',0,'2026-09-14 11:00:01',NULL),(334,2,'tenant_expiry','Payment Overdue','Sohil Khan\'s rent is 14 days overdue',37,'tenant','/tenants/37','⚠️','#e74c3c',0,'2026-09-14 11:00:01',NULL),(335,7,'tenant_expiry','Payment Overdue','Sohil Khan\'s rent is 14 days overdue',37,'tenant','/tenants/37','⚠️','#e74c3c',0,'2026-09-14 11:00:01',NULL),(336,1,'tenant_expiry','Payment Overdue','Ahin Vinod\'s rent is 14 days overdue',38,'tenant','/tenants/38','⚠️','#e74c3c',0,'2026-09-14 11:00:02',NULL),(337,2,'tenant_expiry','Payment Overdue','Ahin Vinod\'s rent is 14 days overdue',38,'tenant','/tenants/38','⚠️','#e74c3c',0,'2026-09-14 11:00:02',NULL),(338,7,'tenant_expiry','Payment Overdue','Ahin Vinod\'s rent is 14 days overdue',38,'tenant','/tenants/38','⚠️','#e74c3c',0,'2026-09-14 11:00:02',NULL),(339,1,'tenant_expiry','Payment Overdue','Shubham\'s rent is 14 days overdue',39,'tenant','/tenants/39','⚠️','#e74c3c',0,'2026-09-14 11:00:02',NULL),(340,2,'tenant_expiry','Payment Overdue','Shubham\'s rent is 14 days overdue',39,'tenant','/tenants/39','⚠️','#e74c3c',0,'2026-09-14 11:00:02',NULL),(341,7,'tenant_expiry','Payment Overdue','Shubham\'s rent is 14 days overdue',39,'tenant','/tenants/39','⚠️','#e74c3c',0,'2026-09-14 11:00:02',NULL),(342,1,'tenant_expiry','Payment Overdue','Himanshu\'s rent is 14 days overdue',40,'tenant','/tenants/40','⚠️','#e74c3c',0,'2026-09-14 11:00:02',NULL),(343,2,'tenant_expiry','Payment Overdue','Himanshu\'s rent is 14 days overdue',40,'tenant','/tenants/40','⚠️','#e74c3c',0,'2026-09-14 11:00:02',NULL),(344,7,'tenant_expiry','Payment Overdue','Himanshu\'s rent is 14 days overdue',40,'tenant','/tenants/40','⚠️','#e74c3c',0,'2026-09-14 11:00:02',NULL),(345,1,'maintenance_created','New Maintenance Request','Prosad Das requested Cleaning for Room 308',13,'maintenance','/maintenance/13','?','#3498db',0,'2026-09-18 02:42:49',NULL),(346,2,'maintenance_created','New Maintenance Request','Prosad Das requested Cleaning for Room 308',13,'maintenance','/maintenance/13','?','#3498db',0,'2026-09-18 02:42:49',NULL),(347,7,'maintenance_created','New Maintenance Request','Prosad Das requested Cleaning for Room 308',13,'maintenance','/maintenance/13','?','#3498db',0,'2026-09-18 02:42:49',NULL),(348,1,'maintenance_created','New Maintenance Request','Prosad Das requested Cleaning for Room 308',14,'maintenance','/maintenance/14','?','#3498db',0,'2026-09-20 03:14:03',NULL),(349,2,'maintenance_created','New Maintenance Request','Prosad Das requested Cleaning for Room 308',14,'maintenance','/maintenance/14','?','#3498db',0,'2026-09-20 03:14:03',NULL),(350,7,'maintenance_created','New Maintenance Request','Prosad Das requested Cleaning for Room 308',14,'maintenance','/maintenance/14','?','#3498db',0,'2026-09-20 03:14:03',NULL),(351,1,'tenant_expiry','Payment Overdue','Mohammed Aminu Shehe\'s rent is 7 days overdue',1,'tenant','/tenants/1','⚠️','#e74c3c',0,'2026-09-20 11:00:00',NULL),(352,2,'tenant_expiry','Payment Overdue','Mohammed Aminu Shehe\'s rent is 7 days overdue',1,'tenant','/tenants/1','⚠️','#e74c3c',0,'2026-09-20 11:00:00',NULL),(353,7,'tenant_expiry','Payment Overdue','Mohammed Aminu Shehe\'s rent is 7 days overdue',1,'tenant','/tenants/1','⚠️','#e74c3c',0,'2026-09-20 11:00:00',NULL),(354,1,'tenant_expiry','Payment Overdue','Soniya Sharma\'s rent is 21 days overdue',32,'tenant','/tenants/32','⚠️','#e74c3c',0,'2026-09-21 11:00:00',NULL),(355,2,'tenant_expiry','Payment Overdue','Soniya Sharma\'s rent is 21 days overdue',32,'tenant','/tenants/32','⚠️','#e74c3c',0,'2026-09-21 11:00:00',NULL),(356,7,'tenant_expiry','Payment Overdue','Soniya Sharma\'s rent is 21 days overdue',32,'tenant','/tenants/32','⚠️','#e74c3c',0,'2026-09-21 11:00:00',NULL),(357,1,'tenant_expiry','Payment Overdue','Shuvo Das\'s rent is 21 days overdue',34,'tenant','/tenants/34','⚠️','#e74c3c',0,'2026-09-21 11:00:01',NULL),(358,2,'tenant_expiry','Payment Overdue','Shuvo Das\'s rent is 21 days overdue',34,'tenant','/tenants/34','⚠️','#e74c3c',0,'2026-09-21 11:00:01',NULL),(359,7,'tenant_expiry','Payment Overdue','Shuvo Das\'s rent is 21 days overdue',34,'tenant','/tenants/34','⚠️','#e74c3c',0,'2026-09-21 11:00:01',NULL),(360,1,'tenant_expiry','Payment Overdue','Vishwa Singh\'s rent is 21 days overdue',36,'tenant','/tenants/36','⚠️','#e74c3c',0,'2026-09-21 11:00:01',NULL),(361,2,'tenant_expiry','Payment Overdue','Vishwa Singh\'s rent is 21 days overdue',36,'tenant','/tenants/36','⚠️','#e74c3c',0,'2026-09-21 11:00:01',NULL),(362,7,'tenant_expiry','Payment Overdue','Vishwa Singh\'s rent is 21 days overdue',36,'tenant','/tenants/36','⚠️','#e74c3c',0,'2026-09-21 11:00:01',NULL),(363,1,'tenant_expiry','Payment Overdue','Sohil Khan\'s rent is 21 days overdue',37,'tenant','/tenants/37','⚠️','#e74c3c',0,'2026-09-21 11:00:01',NULL),(364,2,'tenant_expiry','Payment Overdue','Sohil Khan\'s rent is 21 days overdue',37,'tenant','/tenants/37','⚠️','#e74c3c',0,'2026-09-21 11:00:01',NULL),(365,7,'tenant_expiry','Payment Overdue','Sohil Khan\'s rent is 21 days overdue',37,'tenant','/tenants/37','⚠️','#e74c3c',0,'2026-09-21 11:00:01',NULL),(366,1,'tenant_expiry','Payment Overdue','Ahin Vinod\'s rent is 21 days overdue',38,'tenant','/tenants/38','⚠️','#e74c3c',0,'2026-09-21 11:00:02',NULL),(367,2,'tenant_expiry','Payment Overdue','Ahin Vinod\'s rent is 21 days overdue',38,'tenant','/tenants/38','⚠️','#e74c3c',0,'2026-09-21 11:00:02',NULL),(368,7,'tenant_expiry','Payment Overdue','Ahin Vinod\'s rent is 21 days overdue',38,'tenant','/tenants/38','⚠️','#e74c3c',0,'2026-09-21 11:00:02',NULL),(369,1,'tenant_expiry','Payment Overdue','Shubham\'s rent is 21 days overdue',39,'tenant','/tenants/39','⚠️','#e74c3c',0,'2026-09-21 11:00:02',NULL),(370,2,'tenant_expiry','Payment Overdue','Shubham\'s rent is 21 days overdue',39,'tenant','/tenants/39','⚠️','#e74c3c',0,'2026-09-21 11:00:02',NULL),(371,7,'tenant_expiry','Payment Overdue','Shubham\'s rent is 21 days overdue',39,'tenant','/tenants/39','⚠️','#e74c3c',0,'2026-09-21 11:00:02',NULL),(372,1,'tenant_expiry','Payment Overdue','Himanshu\'s rent is 21 days overdue',40,'tenant','/tenants/40','⚠️','#e74c3c',0,'2026-09-21 11:00:02',NULL),(373,2,'tenant_expiry','Payment Overdue','Himanshu\'s rent is 21 days overdue',40,'tenant','/tenants/40','⚠️','#e74c3c',0,'2026-09-21 11:00:02',NULL),(374,7,'tenant_expiry','Payment Overdue','Himanshu\'s rent is 21 days overdue',40,'tenant','/tenants/40','⚠️','#e74c3c',0,'2026-09-21 11:00:02',NULL);
/*!40000 ALTER TABLE `admin_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_permissions`
--

DROP TABLE IF EXISTS `admin_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int NOT NULL,
  `module_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `can_view` tinyint(1) DEFAULT '0',
  `can_add` tinyint(1) DEFAULT '0',
  `can_edit` tinyint(1) DEFAULT '0',
  `can_delete` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `can_message` tinyint(1) NOT NULL DEFAULT '0',
  `can_export` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `admin_id` (`admin_id`,`module_name`),
  CONSTRAINT `admin_permissions_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_permissions`
--

LOCK TABLES `admin_permissions` WRITE;
/*!40000 ALTER TABLE `admin_permissions` DISABLE KEYS */;
INSERT INTO `admin_permissions` VALUES (29,7,'tenants',1,0,0,0,'2026-09-01 14:37:05',0,0),(30,7,'guests',0,0,0,0,'2026-09-01 14:37:05',0,0),(31,7,'bills',1,0,1,0,'2026-09-01 14:37:05',0,0),(32,7,'pgs',0,0,0,0,'2026-09-01 14:37:05',0,0),(33,7,'maintenance',1,0,1,0,'2026-09-01 14:37:05',0,0),(34,7,'documents',0,0,0,0,'2026-09-01 14:37:05',0,0),(35,7,'feedbacks',0,0,0,0,'2026-09-01 14:37:05',0,0),(36,7,'activity_logs',0,0,0,0,'2026-09-23 16:32:06',0,0);
/*!40000 ALTER TABLE `admin_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `must_change_password` tinyint(1) DEFAULT '1',
  `role` enum('super_admin','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `id_document` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `id_document_public_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `id_document_resource_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `otp` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `otp_expiry` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `otp_sent_at` datetime DEFAULT NULL,
  `reset_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'MO11','molittle1011@gmail.com',NULL,'$2b$12$ERndXqISwxL48Vc/RDNhHe0iUhM1omZiqdvOppqFkORhIKX.ZLc/u',0,'super_admin',NULL,NULL,NULL,NULL,NULL,1,'2026-08-22 10:23:04','2026-09-23 17:55:15','2026-09-23 17:54:32',NULL,NULL),(2,'Livinkey Admin','livinkey@gmail.com',NULL,'$2b$12$jPhjgye4s7ASgXnRx8s/qO5Lu9GT7NNA0DhN8xGn4mc1zD5dHLv.6',0,'super_admin',NULL,NULL,NULL,NULL,NULL,1,'2026-08-22 20:44:41','2026-09-23 15:18:58','2026-09-23 15:17:51',NULL,NULL),(7,'Asif Ali Mir','miraasif2477@gmail.com','7889743773','$2b$12$wGFA0uQwLepYrYLmRhhwgeWFl69.Zw17m1jgk5rVeSjhSiTG2Og66',0,'admin',NULL,NULL,NULL,NULL,NULL,1,'2026-09-01 14:37:05','2026-09-01 14:50:24','2026-09-01 14:50:10',NULL,NULL);
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bill_audit_logs`
--

DROP TABLE IF EXISTS `bill_audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bill_audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bill_id` int NOT NULL,
  `admin_id` int DEFAULT NULL,
  `action` varchar(50) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'create, update, soft_delete',
  `before_data` json DEFAULT NULL,
  `after_data` json DEFAULT NULL,
  `note` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_bill_audit_bill_id` (`bill_id`),
  KEY `idx_bill_audit_admin_id` (`admin_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bill_audit_logs`
--

LOCK TABLES `bill_audit_logs` WRITE;
/*!40000 ALTER TABLE `bill_audit_logs` DISABLE KEYS */;
INSERT INTO `bill_audit_logs` VALUES (1,14,1,'create',NULL,'{\"tenant_id\": 1, \"rent_amount\": 11000, \"total_amount\": 13190, \"billing_month\": \"2026-08\"}','Bill created for 2026-08','2026-09-04 19:45:49'),(2,14,1,'soft_delete','{\"status\": \"unpaid\", \"total_amount\": \"13190.00\", \"billing_month\": \"2026-08\"}','{\"deleted\": true}','Bill soft-deleted by admin','2026-09-04 20:12:41'),(3,15,2,'create',NULL,'{\"tenant_id\": 41, \"rent_amount\": 9000, \"total_amount\": 11341, \"billing_month\": \"2026-09\"}','Bill created for 2026-09','2026-09-07 14:47:04');
/*!40000 ALTER TABLE `bill_audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bill_fine_adjustments`
--

DROP TABLE IF EXISTS `bill_fine_adjustments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bill_fine_adjustments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bill_id` int NOT NULL,
  `admin_id` int NOT NULL,
  `old_fine_amount` decimal(10,2) NOT NULL,
  `new_fine_amount` decimal(10,2) NOT NULL,
  `reason` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `adjusted_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_bill_id` (`bill_id`),
  KEY `idx_admin_id` (`admin_id`),
  KEY `idx_adjusted_at` (`adjusted_at`),
  CONSTRAINT `fk_fine_adjustments_admin_id` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fine_adjustments_bill_id` FOREIGN KEY (`bill_id`) REFERENCES `bills` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bill_fine_adjustments`
--

LOCK TABLES `bill_fine_adjustments` WRITE;
/*!40000 ALTER TABLE `bill_fine_adjustments` DISABLE KEYS */;
/*!40000 ALTER TABLE `bill_fine_adjustments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bill_payments`
--

DROP TABLE IF EXISTS `bill_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bill_payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bill_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `payment_method` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'qr_code',
  `transaction_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `paid_from` date DEFAULT NULL,
  `paid_till` date DEFAULT NULL,
  `is_partial` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_bill_id` (`bill_id`),
  KEY `idx_bill_payments_paid_till` (`paid_till`),
  CONSTRAINT `fk_bill_payments_bill_id` FOREIGN KEY (`bill_id`) REFERENCES `bills` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bill_payments`
--

LOCK TABLES `bill_payments` WRITE;
/*!40000 ALTER TABLE `bill_payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `bill_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bills`
--

DROP TABLE IF EXISTS `bills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bills` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int NOT NULL,
  `billing_month` varchar(7) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'YYYY-MM',
  `period_from` date DEFAULT NULL,
  `period_till` date DEFAULT NULL,
  `rent_amount` decimal(10,2) NOT NULL,
  `electricity_amount` decimal(10,2) DEFAULT '0.00',
  `electricity_meter_image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `electricity_meter_public_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `electricity_meter_resource_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'image',
  `electricity_meter_image_2` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `electricity_meter_public_id_2` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `electricity_meter_resource_type_2` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'image',
  `maintenance_amount` decimal(10,2) DEFAULT '0.00',
  `other_charges` decimal(10,2) DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL,
  `paid_amount` decimal(10,2) DEFAULT '0.00',
  `fine_amount` decimal(10,2) DEFAULT '0.00',
  `status` enum('unpaid','partially_paid','paid','delayed','overdue') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'unpaid',
  `payment_qr` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `payment_qr_public_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `payment_qr_resource_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'image',
  `partial_payment_qr` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `partial_payment_qr_public_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `partial_payment_qr_resource_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'image',
  `sent_at` datetime NOT NULL,
  `valid_until` datetime NOT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `fine_applied_days` int DEFAULT '0',
  `last_fine_email_sent` datetime DEFAULT NULL,
  `initial_email_sent` tinyint(1) DEFAULT '0',
  `admin_qr` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `admin_qr_public_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `admin_qr_resource_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `last_message_sent` datetime DEFAULT NULL,
  `custom_message_qr` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `custom_message_qr_public_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `custom_message_qr_resource_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `custom_message_admin_qr` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `custom_message_admin_qr_public_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `custom_message_admin_qr_resource_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `last_custom_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `qr_expires_at` datetime DEFAULT NULL,
  `cash_payment_otp` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `cash_payment_otp_expiry` datetime DEFAULT NULL,
  `cash_payment_verified` tinyint(1) DEFAULT '0',
  `cash_payment_requested_at` datetime DEFAULT NULL,
  `cash_payment_verified_at` datetime DEFAULT NULL,
  `payment_gateway` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'upi',
  `gateway_payment_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `gateway_order_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `gateway_status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `gateway_response` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `payment_link` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `upi_qr_code` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `upi_qr_public_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `upi_qr_resource_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_status` (`status`),
  KEY `idx_valid_until` (`valid_until`),
  KEY `fk_bills_created_by` (`created_by`),
  KEY `idx_qr_expires_at` (`qr_expires_at`),
  KEY `idx_bills_tenant_created` (`tenant_id`,`created_at`),
  UNIQUE KEY `uq_bills_tenant_billing_month` (`tenant_id`,`billing_month`),
  KEY `idx_bills_tenant_billing_month` (`tenant_id`,`billing_month`),
  KEY `idx_bills_deleted_at` (`deleted_at`),
  KEY `idx_bills_tenant_status` (`tenant_id`,`status`),
  CONSTRAINT `fk_bills_created_by` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bills_tenant_id` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bills`
--

LOCK TABLES `bills` WRITE;
/*!40000 ALTER TABLE `bills` DISABLE KEYS */;
INSERT INTO `bills` VALUES (6,18,'2026-08','2026-08-01','2026-08-31',11000.00,2856.00,NULL,NULL,NULL,NULL,NULL,'image',300.00,0.00,14156.00,10000.00,0.00,'partially_paid','https://res.cloudinary.com/rpmfr1xe/image/upload/v1788250679/livinkey/bills/qr/cfewuegns0fagawliqcb.png','livinkey/bills/qr/cfewuegns0fagawliqcb','image','https://res.cloudinary.com/rpmfr1xe/image/upload/v1788250680/livinkey/bills/qr/y8rf8chka2gabxmhm5ea.png','livinkey/bills/qr/y8rf8chka2gabxmhm5ea','image','2026-08-31 12:13:02','2026-09-07 12:13:02',2,'2026-08-31 12:13:02','2026-09-04 19:43:23',0,NULL,0,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1788178381/livinkey/bills/qr/admin/wtuw3b63oqvtkkkafok8.jpg','livinkey/bills/qr/admin/wtuw3b63oqvtkkkafok8','image',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'2026-09-01 08:17:55','upi',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(7,32,'2026-08','2026-08-01','2026-08-31',6500.00,1583.00,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1788190913/livinkey/bills/meters/yuputcmix6b0m0pgczel.jpg','livinkey/bills/meters/yuputcmix6b0m0pgczel','image',NULL,NULL,'image',300.00,3885.00,12268.00,0.00,0.00,'unpaid','https://res.cloudinary.com/rpmfr1xe/image/upload/v1788190914/livinkey/bills/qr/bxbi8xnyxrkilkhp07vh.png','livinkey/bills/qr/bxbi8xnyxrkilkhp07vh','image','https://res.cloudinary.com/rpmfr1xe/image/upload/v1788190915/livinkey/bills/qr/kqauhefbsyofywy91zp5.png','livinkey/bills/qr/kqauhefbsyofywy91zp5','image','2026-08-31 15:41:57','2026-09-07 15:41:57',2,'2026-08-31 15:41:57','2026-09-04 19:43:23',0,NULL,0,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1788190916/livinkey/bills/qr/admin/jv73pctsmscptyyklqu8.jpg','livinkey/bills/qr/admin/jv73pctsmscptyyklqu8','image',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'5429','2026-09-01 08:21:41',0,'2026-09-01 08:16:41',NULL,'upi',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(8,36,'2026-09','2026-09-01','2026-09-30',11000.00,0.00,NULL,NULL,NULL,NULL,NULL,'image',0.00,0.00,11000.00,0.00,0.00,'unpaid','https://res.cloudinary.com/rpmfr1xe/image/upload/v1788284850/livinkey/bills/qr/ovrmylo1ej9gq92a52gz.png','livinkey/bills/qr/ovrmylo1ej9gq92a52gz','image','https://res.cloudinary.com/rpmfr1xe/image/upload/v1788284851/livinkey/bills/qr/sp60uwvlbibwediitlho.png','livinkey/bills/qr/sp60uwvlbibwediitlho','image','2026-09-01 17:47:33','2026-09-08 17:47:33',2,'2026-09-01 17:47:32','2026-09-04 19:43:23',0,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'upi',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(9,38,'2026-09','2026-09-01','2026-09-30',14000.00,2808.00,NULL,NULL,NULL,NULL,NULL,'image',300.00,0.00,17108.00,0.00,0.00,'unpaid','https://res.cloudinary.com/rpmfr1xe/image/upload/v1788445118/livinkey/bills/qr/ifvcniyfvudofbiu1vv1.png','livinkey/bills/qr/ifvcniyfvudofbiu1vv1','image','https://res.cloudinary.com/rpmfr1xe/image/upload/v1788445120/livinkey/bills/qr/vsdzwa8q7jjbopo1n0no.png','livinkey/bills/qr/vsdzwa8q7jjbopo1n0no','image','2026-09-03 14:18:42','2026-09-10 14:18:42',2,'2026-09-03 14:18:42','2026-09-04 19:43:23',0,NULL,0,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1788445121/livinkey/bills/qr/admin/v2lbg7jwoukpxmribrgn.jpg','livinkey/bills/qr/admin/v2lbg7jwoukpxmribrgn','image',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'upi',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(10,37,'2026-09','2026-09-01','2026-09-30',14000.00,2808.00,NULL,NULL,NULL,NULL,NULL,'image',300.00,0.00,17108.00,0.00,0.00,'unpaid','https://res.cloudinary.com/rpmfr1xe/image/upload/v1788445165/livinkey/bills/qr/pt5kledbdqqgr2aklu9u.png','livinkey/bills/qr/pt5kledbdqqgr2aklu9u','image','https://res.cloudinary.com/rpmfr1xe/image/upload/v1788445166/livinkey/bills/qr/e3rwr2ownydohrdvg6rt.png','livinkey/bills/qr/e3rwr2ownydohrdvg6rt','image','2026-09-03 14:19:28','2026-09-10 14:19:28',2,'2026-09-03 14:19:28','2026-09-04 19:43:23',0,NULL,0,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1788445167/livinkey/bills/qr/admin/hoe6hdjxql4sxnv0hyq8.jpg','livinkey/bills/qr/admin/hoe6hdjxql4sxnv0hyq8','image',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'upi',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(11,40,'2026-09','2026-09-01','2026-09-30',10000.00,520.00,NULL,NULL,NULL,NULL,NULL,'image',300.00,0.00,10820.00,0.00,0.00,'unpaid','https://res.cloudinary.com/rpmfr1xe/image/upload/v1788530001/livinkey/bills/qr/elargwhu9ovuiprg8lns.png','livinkey/bills/qr/elargwhu9ovuiprg8lns','image','https://res.cloudinary.com/rpmfr1xe/image/upload/v1788530003/livinkey/bills/qr/nmkw19a91cgkcnrtvnp7.png','livinkey/bills/qr/nmkw19a91cgkcnrtvnp7','image','2026-09-04 13:53:24','2026-09-11 13:53:24',2,'2026-09-04 13:53:23','2026-09-04 19:43:23',0,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'upi',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(14,1,'2026-08','2026-08-01','2026-08-31',11000.00,1890.00,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1788551143/livinkey/bills/meters/grqeehsjvcdmkku5o5ps.png','livinkey/bills/meters/grqeehsjvcdmkku5o5ps','image','https://res.cloudinary.com/rpmfr1xe/image/upload/v1788551144/livinkey/bills/meters/j31vmvbjhtcmgul69lhf.jpg','livinkey/bills/meters/j31vmvbjhtcmgul69lhf','image',300.00,0.00,13190.00,0.00,0.00,'unpaid','https://res.cloudinary.com/rpmfr1xe/image/upload/v1788551146/livinkey/bills/qr/c1k3cqwyzfiz48snjf6d.png','livinkey/bills/qr/c1k3cqwyzfiz48snjf6d','image','https://res.cloudinary.com/rpmfr1xe/image/upload/v1788551147/livinkey/bills/qr/rfppo2lt9ytuwnoc9ifo.png','livinkey/bills/qr/rfppo2lt9ytuwnoc9ifo','image','2026-09-05 01:15:48','2026-09-12 01:15:48',1,'2026-09-04 19:45:48','2026-09-04 20:12:41',0,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'upi',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-04 20:12:41',1),(15,41,'2026-09','2026-09-01','2026-09-30',9000.00,2041.00,NULL,NULL,NULL,NULL,NULL,NULL,300.00,0.00,11341.00,0.00,0.00,'unpaid','https://res.cloudinary.com/rpmfr1xe/image/upload/v1788792422/livinkey/bills/qr/gfbl0zodgydaoap6uiwl.png','livinkey/bills/qr/gfbl0zodgydaoap6uiwl','image','https://res.cloudinary.com/rpmfr1xe/image/upload/v1788792423/livinkey/bills/qr/dz9tigbtgzkihwvlg7dv.png','livinkey/bills/qr/dz9tigbtgzkihwvlg7dv','image','2026-09-07 14:47:04','2026-09-14 14:47:04',2,'2026-09-07 14:47:04','2026-09-07 14:47:04',0,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'upi',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `bills` ENABLE KEYS */;
UNLOCK TABLES;

-- Production billing columns are added after importing the legacy bill rows,
-- because the existing dump uses positional INSERTs for bills.
ALTER TABLE `bills`
  ADD COLUMN `fine_start_date` date DEFAULT NULL,
  ADD COLUMN `daily_fine_rate` decimal(10,2) NOT NULL DEFAULT '100.00',
  ADD COLUMN `max_fine` decimal(10,2) NOT NULL DEFAULT '0.00',
  ADD COLUMN `partial_payment_made_at` datetime DEFAULT NULL;

--
-- Table structure for table `cash_payments`
--

DROP TABLE IF EXISTS `cash_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cash_payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bill_id` int NOT NULL,
  `tenant_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `paid_from` date NOT NULL,
  `paid_till` date NOT NULL,
  `payment_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `verified_by` int NOT NULL,
  `otp` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `status` enum('pending','verified','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'verified',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_bill_id` (`bill_id`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_status` (`status`),
  KEY `fk_cash_payments_verified_by` (`verified_by`),
  CONSTRAINT `fk_cash_payments_bill_id` FOREIGN KEY (`bill_id`) REFERENCES `bills` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cash_payments_tenant_id` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cash_payments_verified_by` FOREIGN KEY (`verified_by`) REFERENCES `admins` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cash_payments`
--

LOCK TABLES `cash_payments` WRITE;
/*!40000 ALTER TABLE `cash_payments` DISABLE KEYS */;
INSERT INTO `cash_payments` VALUES (1,6,18,10000.00,'2026-09-01','2026-09-30','2026-09-01 08:17:56',2,'7464','verified',NULL,'2026-09-01 08:17:56');
/*!40000 ALTER TABLE `cash_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `floors`
--

DROP TABLE IF EXISTS `floors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `floors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pg_id` int NOT NULL,
  `floor_number` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_pg_floor` (`pg_id`,`floor_number`),
  KEY `idx_pg_id` (`pg_id`),
  KEY `idx_floors_is_active` (`is_active`),
  KEY `idx_floors_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_floors_pg_id` FOREIGN KEY (`pg_id`) REFERENCES `pgs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `floors`
--

LOCK TABLES `floors` WRITE;
/*!40000 ALTER TABLE `floors` DISABLE KEYS */;
INSERT INTO `floors` VALUES (1,1,1,'2026-08-22 13:40:30','2026-08-22 13:40:30',1,NULL),(2,1,2,'2026-08-22 13:40:34','2026-08-22 13:40:34',1,NULL),(3,1,3,'2026-08-22 13:40:37','2026-08-22 13:40:37',1,NULL),(4,2,1,'2026-08-22 13:45:18','2026-08-22 13:45:18',1,NULL),(5,2,2,'2026-08-22 13:45:26','2026-08-22 13:45:26',1,NULL),(6,2,3,'2026-08-22 13:45:35','2026-08-22 13:45:35',1,NULL),(7,2,4,'2026-08-22 13:45:44','2026-08-22 13:45:44',1,NULL),(8,3,1,'2026-08-22 13:47:38','2026-08-22 13:47:38',1,NULL),(9,3,2,'2026-08-22 13:47:40','2026-08-22 13:47:40',1,NULL),(10,4,1,'2026-08-22 13:50:01','2026-08-22 13:50:01',1,NULL),(11,4,2,'2026-08-22 13:50:03','2026-08-22 13:50:03',1,NULL),(12,5,1,'2026-08-22 13:51:15','2026-08-22 13:51:15',1,NULL),(13,5,2,'2026-08-22 13:51:16','2026-08-22 13:51:16',1,NULL),(14,6,1,'2026-08-22 13:53:44','2026-08-22 13:53:44',1,NULL),(15,6,2,'2026-08-22 13:53:48','2026-08-22 13:53:48',1,NULL),(16,6,3,'2026-08-22 13:53:51','2026-08-22 13:53:51',1,NULL),(17,7,1,'2026-08-22 13:55:42','2026-08-22 13:55:42',1,NULL),(18,7,2,'2026-08-22 13:55:44','2026-08-22 13:55:44',1,NULL),(19,7,3,'2026-08-25 22:06:10','2026-08-25 22:06:10',1,NULL),(20,7,4,'2026-08-25 22:06:12','2026-08-25 22:06:12',1,NULL),(21,5,3,'2026-08-31 15:24:51','2026-08-31 15:24:51',1,NULL),(22,4,3,'2026-09-01 17:32:40','2026-09-01 17:32:40',1,NULL),(23,4,4,'2026-09-01 17:32:41','2026-09-01 17:32:41',1,NULL);
/*!40000 ALTER TABLE `floors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guest_notifications`
--

DROP TABLE IF EXISTS `guest_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guest_notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `guest_id` int NOT NULL,
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `entity_id` int DEFAULT NULL,
  `entity_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `link` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `icon` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `color` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `read_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_guest_id` (`guest_id`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `guest_notifications_ibfk_1` FOREIGN KEY (`guest_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guest_notifications`
--

LOCK TABLES `guest_notifications` WRITE;
/*!40000 ALTER TABLE `guest_notifications` DISABLE KEYS */;
INSERT INTO `guest_notifications` VALUES (1,9,'pg_updated','PG Updated','PG \"Mannat Apartment (Plot No :- 99)\" has been updated with new details.',7,'pg','/public/pgs/7','?️','#3498db',0,NULL,'2026-08-25 22:06:19'),(2,9,'pg_updated','PG Updated','PG \"Shree Shyam Apartment\" has been updated with new details.',5,'pg','/public/pgs/5','?️','#3498db',0,NULL,'2026-08-31 15:24:54'),(3,9,'pg_updated','PG Updated','PG \"J T House (Plot No :- 257)\" has been updated with new details.',4,'pg','/public/pgs/4','?️','#3498db',0,NULL,'2026-09-01 17:32:44'),(4,35,'pg_updated','PG Updated','PG \"J T House (Plot No :- 257)\" has been updated with new details.',4,'pg','/public/pgs/4','?️','#3498db',0,NULL,'2026-09-01 17:32:44'),(5,9,'pg_updated','PG Updated','PG \"Mannat Apartment (Plot No :- 99)\" has been updated with new details.',7,'pg','/public/pgs/7','?️','#3498db',0,NULL,'2026-09-04 11:27:55'),(6,35,'pg_updated','PG Updated','PG \"Mannat Apartment (Plot No :- 99)\" has been updated with new details.',7,'pg','/public/pgs/7','?️','#3498db',0,NULL,'2026-09-04 11:27:55'),(7,9,'pg_updated','PG Updated','PG \"Mannat Apartment (Plot No :- 99)\" has been updated with new details.',7,'pg','/public/pgs/7','?️','#3498db',0,NULL,'2026-09-04 11:30:40'),(8,35,'pg_updated','PG Updated','PG \"Mannat Apartment (Plot No :- 99)\" has been updated with new details.',7,'pg','/public/pgs/7','?️','#3498db',0,NULL,'2026-09-04 11:30:40');
/*!40000 ALTER TABLE `guest_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `maintenance_requests`
--

DROP TABLE IF EXISTS `maintenance_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `maintenance_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int NOT NULL,
  `room_id` int NOT NULL,
  `issue_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `service_date` date NOT NULL,
  `free_time` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `image_public_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `image_resource_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` enum('pending','in_progress','completed') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `completed_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'admin_{id} or tenant_{id}',
  `completion_reminder_sent` tinyint(1) DEFAULT '0',
  `created_by` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `room_id` (`room_id`),
  KEY `idx_status` (`status`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_issue_type` (`issue_type`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_maintenance_status_reminder` (`status`,`completion_reminder_sent`,`updated_at`),
  CONSTRAINT `maintenance_requests_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `maintenance_requests_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maintenance_requests`
--

LOCK TABLES `maintenance_requests` WRITE;
/*!40000 ALTER TABLE `maintenance_requests` DISABLE KEYS */;
INSERT INTO `maintenance_requests` VALUES (7,18,32,'Electrician','switch','2026-08-27','8:30 PM','https://res.cloudinary.com/rpmfr1xe/image/upload/v1787695237/livinkey/maintenance/18/ktkos6gp1kszv9smzitf.jpg','livinkey/maintenance/18/ktkos6gp1kszv9smzitf','image','completed','admin_2',1,18,'2026-08-25 22:00:37','2026-08-31 12:10:51'),(8,34,47,'Cleaning','need cleaning','2026-09-03','18:00',NULL,NULL,NULL,'pending',NULL,0,34,'2026-09-02 14:52:02','2026-09-02 14:52:02'),(9,40,93,'Cleaning','room cleaning and infront of store room smell very bad','2026-09-05','9:00 AM',NULL,NULL,NULL,'pending',NULL,0,40,'2026-09-04 15:53:22','2026-09-04 15:53:22'),(10,34,47,'Cleaning','cleaning','2026-09-06',NULL,NULL,NULL,NULL,'pending',NULL,0,34,'2026-09-06 04:19:04','2026-09-06 04:19:04'),(11,40,93,'Others','fridge not close properly from starting days','2026-09-07','4:30 PM',NULL,NULL,NULL,'pending',NULL,0,40,'2026-09-07 17:13:15','2026-09-07 17:13:15'),(12,40,93,'Electrician','switch are not good in condition','2026-09-08','4:30 PM',NULL,NULL,NULL,'pending',NULL,0,40,'2026-09-07 17:14:01','2026-09-07 17:14:01'),(13,33,56,'Cleaning','just want to clean my room','2026-09-18','4:00 PM',NULL,NULL,NULL,'pending',NULL,0,33,'2026-09-18 02:42:48','2026-09-18 02:42:48'),(14,33,56,'Cleaning','want to clean my room','2026-09-20','5:00 PM',NULL,NULL,NULL,'pending',NULL,0,33,'2026-09-20 03:14:02','2026-09-20 03:14:02');
/*!40000 ALTER TABLE `maintenance_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_proofs`
--

DROP TABLE IF EXISTS `payment_proofs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_proofs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bill_id` int NOT NULL,
  `tenant_id` int NOT NULL,
  `transaction_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `amount_paid` decimal(10,2) NOT NULL,
  `paid_from` date DEFAULT NULL,
  `paid_till` date DEFAULT NULL,
  `proof_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `proof_public_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `proof_resource_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'image',
  `status` enum('pending','verified','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `admin_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `verified_by` int DEFAULT NULL,
  `verified_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `bill_id` (`bill_id`),
  KEY `tenant_id` (`tenant_id`),
  KEY `verified_by` (`verified_by`),
  KEY `idx_status` (`status`),
  UNIQUE KEY `uq_payment_proofs_tenant_transaction` (`tenant_id`,`transaction_id`),
  KEY `idx_payment_proofs_paid_till` (`paid_till`),
  CONSTRAINT `payment_proofs_ibfk_1` FOREIGN KEY (`bill_id`) REFERENCES `bills` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payment_proofs_ibfk_2` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payment_proofs_ibfk_3` FOREIGN KEY (`verified_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_proofs`
--

LOCK TABLES `payment_proofs` WRITE;
/*!40000 ALTER TABLE `payment_proofs` DISABLE KEYS */;
INSERT INTO `payment_proofs` VALUES (6,7,32,'T2609070045116056208053',16181.00,NULL,NULL,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1788722250/livinkey/payments/proofs/32/bx44xpi4uvygllmml4m3.jpg','livinkey/payments/proofs/32/bx44xpi4uvygllmml4m3','image','pending',NULL,NULL,NULL,'2026-09-06 19:17:31','2026-09-06 19:17:31'),(7,15,41,'004777752900',11341.00,NULL,NULL,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1788795976/livinkey/payments/proofs/41/lrl6tdxkaqkpyeksmkm1.jpg','livinkey/payments/proofs/41/lrl6tdxkaqkpyeksmkm1','image','pending',NULL,NULL,NULL,'2026-09-07 15:46:18','2026-09-07 15:46:18');
/*!40000 ALTER TABLE `payment_proofs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `receipts`
--
DROP TABLE IF EXISTS `receipts`;
CREATE TABLE `receipts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `receipt_number` varchar(32) NOT NULL,
  `bill_id` int NOT NULL,
  `payment_id` int DEFAULT NULL,
  `payment_proof_id` int DEFAULT NULL,
  `cash_payment_id` int DEFAULT NULL,
  `tenant_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `breakdown_json` json DEFAULT NULL,
  `issued_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `issued_by` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_receipt_number` (`receipt_number`),
  UNIQUE KEY `uq_receipt_payment` (`payment_id`),
  UNIQUE KEY `uq_receipt_proof` (`payment_proof_id`),
  UNIQUE KEY `uq_receipt_cash` (`cash_payment_id`),
  KEY `idx_receipts_bill` (`bill_id`),
  KEY `idx_receipts_tenant` (`tenant_id`),
  CONSTRAINT `fk_receipts_bill` FOREIGN KEY (`bill_id`) REFERENCES `bills` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_receipts_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_receipts_issued_by` FOREIGN KEY (`issued_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `payment_transactions`
--

DROP TABLE IF EXISTS `payment_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bill_id` int NOT NULL,
  `tenant_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_type` enum('upi','card','netbanking','wallet','cash') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'upi',
  `gateway` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `gateway_order_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `gateway_payment_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` enum('pending','processing','success','failed','refunded','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `payment_link` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `upi_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `transaction_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `response_data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `webhook_received` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_bill_id` (`bill_id`),
  KEY `idx_tenant_id` (`tenant_id`),
  UNIQUE KEY `uq_payment_transactions_order` (`gateway_order_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_payment_transactions_bill_id` FOREIGN KEY (`bill_id`) REFERENCES `bills` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_payment_transactions_tenant_id` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_transactions`
--

LOCK TABLES `payment_transactions` WRITE;
/*!40000 ALTER TABLE `payment_transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pg_amenities`
--

DROP TABLE IF EXISTS `pg_amenities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pg_amenities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pg_id` int NOT NULL,
  `amenity_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `is_custom` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pg_id` (`pg_id`),
  CONSTRAINT `fk_pg_amenities_pg_id` FOREIGN KEY (`pg_id`) REFERENCES `pgs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pg_amenities`
--

LOCK TABLES `pg_amenities` WRITE;
/*!40000 ALTER TABLE `pg_amenities` DISABLE KEYS */;
INSERT INTO `pg_amenities` VALUES (1,1,'Free WiFi',0,'2026-08-22 13:40:21'),(2,1,'24×7 Assistance',0,'2026-08-22 13:40:22'),(3,1,'24×7 Power Backup',0,'2026-08-22 13:40:23'),(4,1,'43 Inch LED',0,'2026-08-22 13:40:23'),(5,1,'Ventilated Rooms',0,'2026-08-22 13:40:24'),(6,1,'Free Housekeeping',0,'2026-08-22 13:40:24'),(7,1,'CCTV',0,'2026-08-22 13:40:25'),(8,1,'AC',0,'2026-08-22 13:40:25'),(9,2,'Free WiFi',0,'2026-08-22 13:45:06'),(10,2,'24×7 Assistance',0,'2026-08-22 13:45:07'),(11,2,'24×7 Power Backup',0,'2026-08-22 13:45:07'),(12,2,'43 Inch LED',0,'2026-08-22 13:45:08'),(13,2,'Ventilated Rooms',0,'2026-08-22 13:45:08'),(14,2,'Free Housekeeping',0,'2026-08-22 13:45:09'),(15,2,'CCTV',0,'2026-08-22 13:45:09'),(16,2,'AC',0,'2026-08-22 13:45:10'),(17,3,'Free WiFi',0,'2026-08-22 13:47:27'),(18,3,'24×7 Assistance',0,'2026-08-22 13:47:28'),(19,3,'24×7 Power Backup',0,'2026-08-22 13:47:28'),(20,3,'Ventilated Rooms',0,'2026-08-22 13:47:28'),(21,3,'Free Housekeeping',0,'2026-08-22 13:47:29'),(22,3,'CCTV',0,'2026-08-22 13:47:29'),(23,3,'AC',0,'2026-08-22 13:47:30'),(40,6,'Free WiFi',0,'2026-08-22 13:53:31'),(41,6,'24×7 Assistance',0,'2026-08-22 13:53:32'),(42,6,'24×7 Power Backup',0,'2026-08-22 13:53:32'),(43,6,'43 Inch LED',0,'2026-08-22 13:53:32'),(44,6,'Ventilated Rooms',0,'2026-08-22 13:53:33'),(45,6,'Free Housekeeping',0,'2026-08-22 13:53:33'),(46,6,'CCTV',0,'2026-08-22 13:53:34'),(47,6,'AC',0,'2026-08-22 13:53:34'),(64,5,'Free WiFi',0,'2026-08-31 15:24:47'),(65,5,'24×7 Assistance',0,'2026-08-31 15:24:47'),(66,5,'24×7 Power Backup',0,'2026-08-31 15:24:47'),(67,5,'Ventilated Rooms',0,'2026-08-31 15:24:47'),(68,5,'Free Housekeeping',0,'2026-08-31 15:24:47'),(69,5,'CCTV',0,'2026-08-31 15:24:48'),(70,5,'AC',0,'2026-08-31 15:24:48'),(71,4,'Free WiFi',0,'2026-09-01 17:32:36'),(72,4,'24×7 Assistance',0,'2026-09-01 17:32:36'),(73,4,'24×7 Power Backup',0,'2026-09-01 17:32:36'),(74,4,'43 Inch LED',0,'2026-09-01 17:32:36'),(75,4,'Ventilated Rooms',0,'2026-09-01 17:32:36'),(76,4,'Free Housekeeping',0,'2026-09-01 17:32:36'),(77,4,'CCTV',0,'2026-09-01 17:32:37'),(78,4,'AC',0,'2026-09-01 17:32:37'),(79,4,'Washing Machine',1,'2026-09-01 17:32:37'),(88,7,'Free WiFi',0,'2026-09-04 11:30:33'),(89,7,'24×7 Assistance',0,'2026-09-04 11:30:33'),(90,7,'24×7 Power Backup',0,'2026-09-04 11:30:33'),(91,7,'Ventilated Rooms',0,'2026-09-04 11:30:33'),(92,7,'Free Housekeeping',0,'2026-09-04 11:30:33'),(93,7,'CCTV',0,'2026-09-04 11:30:33'),(94,7,'AC',0,'2026-09-04 11:30:34'),(95,7,'LED TV',1,'2026-09-04 11:30:34');
/*!40000 ALTER TABLE `pg_amenities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pg_images`
--

DROP TABLE IF EXISTS `pg_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pg_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pg_id` int NOT NULL,
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `public_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `resource_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'image',
  `display_order` int DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pg_id` (`pg_id`),
  CONSTRAINT `fk_pg_images_pg_id` FOREIGN KEY (`pg_id`) REFERENCES `pgs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pg_images`
--

LOCK TABLES `pg_images` WRITE;
/*!40000 ALTER TABLE `pg_images` DISABLE KEYS */;
INSERT INTO `pg_images` VALUES (1,1,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1787406028/livinkey/pgs/images/axjnkq7iphdvvwwzemt3.jpg','livinkey/pgs/images/axjnkq7iphdvvwwzemt3','image',0,'2026-08-22 13:40:29'),(2,2,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1787406313/livinkey/pgs/images/fhim35ypwtly2uuzk2i6.jpg','livinkey/pgs/images/fhim35ypwtly2uuzk2i6','image',0,'2026-08-22 13:45:14'),(3,2,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1787406317/livinkey/pgs/images/dywcxg5avqemoyyzfhhf.jpg','livinkey/pgs/images/dywcxg5avqemoyyzfhhf','image',1,'2026-08-22 13:45:18'),(4,3,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1787406453/livinkey/pgs/images/nqd2o7rtyxkyxd4y90hq.jpg','livinkey/pgs/images/nqd2o7rtyxkyxd4y90hq','image',0,'2026-08-22 13:47:34'),(5,3,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1787406455/livinkey/pgs/images/igxnabo0xm5rjxfbucch.jpg','livinkey/pgs/images/igxnabo0xm5rjxfbucch','image',1,'2026-08-22 13:47:36'),(6,3,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1787406457/livinkey/pgs/images/cvh1bzyd7bvwx7fhewnf.jpg','livinkey/pgs/images/cvh1bzyd7bvwx7fhewnf','image',2,'2026-08-22 13:47:37'),(7,4,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1787406584/livinkey/pgs/images/ycb7iijelspdpztr4xhk.png','livinkey/pgs/images/ycb7iijelspdpztr4xhk','image',0,'2026-08-22 13:49:46'),(8,4,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1787406587/livinkey/pgs/images/hivnxeod5emgsbkxeiyy.png','livinkey/pgs/images/hivnxeod5emgsbkxeiyy','image',1,'2026-08-22 13:49:47'),(9,4,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1787406593/livinkey/pgs/images/ldqju6iagtl0t8e8tvj2.png','livinkey/pgs/images/ldqju6iagtl0t8e8tvj2','image',2,'2026-08-22 13:49:53'),(10,4,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1787406596/livinkey/pgs/images/usetswi7sj6rzcpdiebj.png','livinkey/pgs/images/usetswi7sj6rzcpdiebj','image',3,'2026-08-22 13:49:56'),(11,4,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1787406599/livinkey/pgs/images/ute18qw5ycrthxoj4twv.png','livinkey/pgs/images/ute18qw5ycrthxoj4twv','image',4,'2026-08-22 13:50:00'),(12,5,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1787406673/livinkey/pgs/images/qtf97igtlvvnnj10wthm.jpg','livinkey/pgs/images/qtf97igtlvvnnj10wthm','image',0,'2026-08-22 13:51:14'),(13,6,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1787406818/livinkey/pgs/images/m5mr4h4i0t37argu2rgu.jpg','livinkey/pgs/images/m5mr4h4i0t37argu2rgu','image',0,'2026-08-22 13:53:39'),(14,6,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1787406820/livinkey/pgs/images/ywhnynsbb0grydzwmln0.jpg','livinkey/pgs/images/ywhnynsbb0grydzwmln0','image',1,'2026-08-22 13:53:41'),(15,6,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1787406821/livinkey/pgs/images/zoudresfq3kdtsr5psjf.jpg','livinkey/pgs/images/zoudresfq3kdtsr5psjf','image',2,'2026-08-22 13:53:42'),(16,6,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1787406823/livinkey/pgs/images/lrr2dp7uhvket4kktmoo.jpg','livinkey/pgs/images/lrr2dp7uhvket4kktmoo','image',3,'2026-08-22 13:53:44'),(17,7,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1787406940/livinkey/pgs/images/l63zv35ng8dx48e9ci7r.jpg','livinkey/pgs/images/l63zv35ng8dx48e9ci7r','image',0,'2026-08-22 13:55:41');
/*!40000 ALTER TABLE `pg_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pgs`
--

DROP TABLE IF EXISTS `pgs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pgs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `location` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `number_of_floors` int NOT NULL DEFAULT '1',
  `payment_qr` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `payment_qr_public_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `payment_qr_resource_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `rent` decimal(10,2) NOT NULL DEFAULT '0.00',
  `security_fee` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `idx_created_by` (`created_by`),
  CONSTRAINT `fk_pgs_created_by` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pgs`
--

LOCK TABLES `pgs` WRITE;
/*!40000 ALTER TABLE `pgs` DISABLE KEYS */;
INSERT INTO `pgs` VALUES (1,'Alishan PG','LawGate, Phagwara',3,NULL,NULL,NULL,1,1,'2026-08-22 13:40:20','2026-08-22 13:40:20',10000.00,10000.00),(2,'Happy Living PG','LawGate, Phagwara',4,NULL,NULL,NULL,1,1,'2026-08-22 13:45:06','2026-08-22 13:45:06',12000.00,12000.00),(3,'DS Apartment','LawGate, Phagwara',2,NULL,NULL,NULL,1,1,'2026-08-22 13:47:27','2026-08-22 13:47:27',8500.00,8500.00),(4,'J T House (Plot No :- 257)','Green Valley, Phagwara',4,NULL,NULL,NULL,1,1,'2026-08-22 13:49:35','2026-09-01 17:32:35',12000.00,12000.00),(5,'Shree Shyam Apartment','LawGate, Phagwara',3,NULL,NULL,NULL,1,1,'2026-08-22 13:51:07','2026-08-31 15:24:46',10000.00,10000.00),(6,'Royal Suits ( (Plot No :- 103,104)','Green Valley, Phagwara',3,NULL,NULL,NULL,1,1,'2026-08-22 13:53:31','2026-08-22 13:53:31',15000.00,15000.00),(7,'Mannat Apartment (Plot No :- 99)','Green Valley, Phagwara',4,NULL,NULL,NULL,1,1,'2026-08-22 13:55:33','2026-08-25 22:06:05',14000.00,14000.00);
/*!40000 ALTER TABLE `pgs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `public_feedbacks`
--

DROP TABLE IF EXISTS `public_feedbacks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `public_feedbacks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pg_id` int NOT NULL,
  `full_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `living_experience_rating` decimal(3,1) NOT NULL,
  `maintenance_handling_rating` decimal(3,1) NOT NULL,
  `communication_rating` decimal(3,1) NOT NULL,
  `amenities_rating` decimal(3,1) NOT NULL,
  `technology_handling_rating` decimal(3,1) NOT NULL,
  `overall_rating` decimal(3,1) NOT NULL,
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pg_id` (`pg_id`),
  KEY `idx_email` (`email`),
  KEY `idx_phone` (`phone`),
  KEY `idx_rating` (`overall_rating`),
  CONSTRAINT `fk_public_feedbacks_pg_id` FOREIGN KEY (`pg_id`) REFERENCES `pgs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `public_feedbacks_chk_1` CHECK ((`living_experience_rating` between 1 and 10)),
  CONSTRAINT `public_feedbacks_chk_2` CHECK ((`maintenance_handling_rating` between 1 and 10)),
  CONSTRAINT `public_feedbacks_chk_3` CHECK ((`communication_rating` between 1 and 10)),
  CONSTRAINT `public_feedbacks_chk_4` CHECK ((`amenities_rating` between 1 and 10)),
  CONSTRAINT `public_feedbacks_chk_5` CHECK ((`technology_handling_rating` between 1 and 10)),
  CONSTRAINT `public_feedbacks_chk_6` CHECK ((`overall_rating` between 1 and 10))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `public_feedbacks`
--

LOCK TABLES `public_feedbacks` WRITE;
/*!40000 ALTER TABLE `public_feedbacks` DISABLE KEYS */;
/*!40000 ALTER TABLE `public_feedbacks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room_occupancy`
--

DROP TABLE IF EXISTS `room_occupancy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room_occupancy` (
  `id` int NOT NULL AUTO_INCREMENT,
  `room_id` int NOT NULL,
  `occupied_count` int NOT NULL DEFAULT '0',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_room_occupancy` (`room_id`),
  CONSTRAINT `fk_room_occupancy_room_id` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room_occupancy`
--

LOCK TABLES `room_occupancy` WRITE;
/*!40000 ALTER TABLE `room_occupancy` DISABLE KEYS */;
INSERT INTO `room_occupancy` VALUES (1,67,1,'2026-08-22 15:56:45'),(2,32,1,'2026-08-25 21:56:53'),(3,15,0,'2026-08-31 12:55:02'),(5,66,0,'2026-08-25 14:28:15'),(6,33,0,'2026-08-25 14:28:01'),(10,86,1,'2026-08-31 15:37:30'),(11,56,1,'2026-09-01 13:11:45'),(12,47,1,'2026-09-01 13:24:11'),(13,116,1,'2026-09-01 17:34:46'),(14,109,2,'2026-09-03 14:12:18'),(16,93,2,'2026-09-04 13:49:03'),(18,13,2,'2026-09-07 14:45:24');
/*!40000 ALTER TABLE `room_occupancy` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `floor_id` int NOT NULL,
  `room_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `capacity` int NOT NULL DEFAULT '1',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `rent` decimal(10,2) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_floor_room` (`floor_id`,`room_number`),
  KEY `idx_floor_id` (`floor_id`),
  KEY `idx_rooms_is_active` (`is_active`),
  KEY `idx_rooms_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_rooms_floor_id` FOREIGN KEY (`floor_id`) REFERENCES `floors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=119 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES (1,1,'101',2,1,'2026-08-22 13:40:32','2026-08-22 13:40:32',10000.00,NULL),(2,1,'102',2,1,'2026-08-22 13:40:32','2026-08-22 13:40:32',10000.00,NULL),(3,1,'103',2,1,'2026-08-22 13:40:33','2026-08-22 13:40:33',10000.00,NULL),(4,1,'104',2,1,'2026-08-22 13:40:33','2026-08-22 13:40:33',10000.00,NULL),(5,1,'105',2,1,'2026-08-22 13:40:33','2026-08-22 13:40:33',10000.00,NULL),(6,1,'106',2,1,'2026-08-22 13:40:34','2026-08-22 13:40:34',10000.00,NULL),(7,2,'201',2,1,'2026-08-22 13:40:35','2026-08-22 13:40:35',10000.00,NULL),(8,2,'202',2,1,'2026-08-22 13:40:35','2026-08-22 13:40:35',10000.00,NULL),(9,2,'203',2,1,'2026-08-22 13:40:36','2026-08-22 13:40:36',10000.00,NULL),(10,2,'204',2,1,'2026-08-22 13:40:36','2026-08-22 13:40:36',10000.00,NULL),(11,2,'205',2,1,'2026-08-22 13:40:36','2026-08-22 13:40:36',10000.00,NULL),(12,2,'206',2,1,'2026-08-22 13:40:37','2026-08-22 13:40:37',10000.00,NULL),(13,3,'301',2,1,'2026-08-22 13:40:38','2026-08-22 13:40:38',10000.00,NULL),(14,3,'302',2,1,'2026-08-22 13:40:38','2026-08-22 13:40:38',10000.00,NULL),(15,4,'101',2,1,'2026-08-22 13:45:19','2026-08-22 13:45:19',12000.00,NULL),(16,4,'102',2,1,'2026-08-22 13:45:19','2026-08-22 13:45:19',12000.00,NULL),(17,4,'103',2,1,'2026-08-22 13:45:20','2026-08-22 13:45:20',12000.00,NULL),(18,4,'104',2,1,'2026-08-22 13:45:20','2026-08-22 13:45:20',12000.00,NULL),(19,4,'105',2,1,'2026-08-22 13:45:21','2026-08-22 13:45:21',12000.00,NULL),(20,4,'106',2,1,'2026-08-22 13:45:21','2026-08-22 13:45:21',12000.00,NULL),(21,4,'107',2,1,'2026-08-22 13:45:21','2026-08-22 13:45:21',12000.00,NULL),(22,4,'108',2,1,'2026-08-22 13:45:22','2026-08-22 13:45:22',12000.00,NULL),(23,4,'109',2,1,'2026-08-22 13:45:22','2026-08-22 13:45:22',12000.00,NULL),(24,4,'110',2,1,'2026-08-22 13:45:23','2026-08-22 13:45:23',12000.00,NULL),(25,4,'111',2,1,'2026-08-22 13:45:23','2026-08-22 13:45:23',12000.00,NULL),(26,4,'112',2,1,'2026-08-22 13:45:24','2026-08-22 13:45:24',12000.00,NULL),(27,4,'113',2,1,'2026-08-22 13:45:24','2026-08-22 13:45:24',12000.00,NULL),(28,4,'114',2,1,'2026-08-22 13:45:25','2026-08-22 13:45:25',12000.00,NULL),(29,4,'115',2,1,'2026-08-22 13:45:25','2026-08-22 13:45:25',12000.00,NULL),(30,4,'116',2,1,'2026-08-22 13:45:25','2026-08-22 13:45:25',12000.00,NULL),(31,4,'117',2,1,'2026-08-22 13:45:26','2026-08-22 13:45:26',12000.00,NULL),(32,5,'201',2,1,'2026-08-22 13:45:27','2026-08-22 13:45:27',12000.00,NULL),(33,5,'202',2,1,'2026-08-22 13:45:27','2026-08-22 13:45:27',12000.00,NULL),(34,5,'203',2,1,'2026-08-22 13:45:28','2026-08-22 13:45:28',12000.00,NULL),(35,5,'204',2,1,'2026-08-22 13:45:28','2026-08-22 13:45:28',12000.00,NULL),(36,5,'205',2,1,'2026-08-22 13:45:29','2026-08-22 13:45:29',12000.00,NULL),(37,5,'206',2,1,'2026-08-22 13:45:29','2026-08-22 13:45:29',12000.00,NULL),(38,5,'207',2,1,'2026-08-22 13:45:30','2026-08-22 13:45:30',12000.00,NULL),(39,5,'208',2,1,'2026-08-22 13:45:30','2026-08-22 13:45:30',12000.00,NULL),(40,5,'209',2,1,'2026-08-22 13:45:31','2026-08-22 13:45:31',12000.00,NULL),(41,5,'210',2,1,'2026-08-22 13:45:31','2026-08-22 13:45:31',12000.00,NULL),(42,5,'211',2,1,'2026-08-22 13:45:32','2026-08-22 13:45:32',12000.00,NULL),(43,5,'212',2,1,'2026-08-22 13:45:32','2026-08-22 13:45:32',12000.00,NULL),(44,5,'213',2,1,'2026-08-22 13:45:33','2026-08-22 13:45:33',10000.00,NULL),(45,5,'214',2,1,'2026-08-22 13:45:33','2026-08-22 13:45:33',12000.00,NULL),(46,5,'215',2,1,'2026-08-22 13:45:34','2026-08-22 13:45:34',12000.00,NULL),(47,5,'216',2,1,'2026-08-22 13:45:34','2026-08-22 13:45:34',12000.00,NULL),(48,5,'217',2,1,'2026-08-22 13:45:35','2026-08-22 13:45:35',12000.00,NULL),(49,6,'301',2,1,'2026-08-22 13:45:36','2026-08-22 13:45:36',12000.00,NULL),(50,6,'302',2,1,'2026-08-22 13:45:36','2026-08-22 13:45:36',12000.00,NULL),(51,6,'303',2,1,'2026-08-22 13:45:37','2026-08-22 13:45:37',12000.00,NULL),(52,6,'304',2,1,'2026-08-22 13:45:37','2026-08-22 13:45:37',12000.00,NULL),(53,6,'305',2,1,'2026-08-22 13:45:37','2026-08-22 13:45:37',12000.00,NULL),(54,6,'306',2,1,'2026-08-22 13:45:38','2026-08-22 13:45:38',12000.00,NULL),(55,6,'307',2,1,'2026-08-22 13:45:38','2026-08-22 13:45:38',12000.00,NULL),(56,6,'308',2,1,'2026-08-22 13:45:39','2026-08-22 13:45:39',12000.00,NULL),(57,6,'309',2,1,'2026-08-22 13:45:40','2026-08-22 13:45:40',12000.00,NULL),(58,6,'310',2,1,'2026-08-22 13:45:40','2026-08-22 13:45:40',12000.00,NULL),(59,6,'311',2,1,'2026-08-22 13:45:41','2026-08-22 13:45:41',12000.00,NULL),(60,6,'312',2,1,'2026-08-22 13:45:41','2026-08-22 13:45:41',12000.00,NULL),(61,6,'313',2,1,'2026-08-22 13:45:42','2026-08-22 13:45:42',12000.00,NULL),(62,6,'314',2,1,'2026-08-22 13:45:42','2026-08-22 13:45:42',12000.00,NULL),(63,6,'315',2,1,'2026-08-22 13:45:43','2026-08-22 13:45:43',12000.00,NULL),(64,6,'316',2,1,'2026-08-22 13:45:43','2026-08-22 13:45:43',12000.00,NULL),(65,6,'317',2,1,'2026-08-22 13:45:44','2026-08-22 13:45:44',12000.00,NULL),(66,7,'401',2,1,'2026-08-22 13:45:45','2026-08-22 13:45:45',12000.00,NULL),(67,7,'402',2,1,'2026-08-22 13:45:45','2026-08-22 13:45:45',12000.00,NULL),(68,7,'403',2,1,'2026-08-22 13:45:46','2026-08-22 13:45:46',12000.00,NULL),(69,8,'101',2,1,'2026-08-22 13:47:38','2026-08-22 13:47:38',8500.00,NULL),(70,8,'102',2,1,'2026-08-22 13:47:39','2026-08-22 13:47:39',8500.00,NULL),(71,8,'103',2,1,'2026-08-22 13:47:39','2026-08-22 13:47:39',8500.00,NULL),(72,8,'104',2,1,'2026-08-22 13:47:40','2026-08-22 13:47:40',8500.00,NULL),(73,9,'201',2,1,'2026-08-22 13:47:41','2026-08-22 13:47:41',8500.00,NULL),(74,9,'202',2,1,'2026-08-22 13:47:41','2026-08-22 13:47:41',8500.00,NULL),(75,9,'203',2,1,'2026-08-22 13:47:42','2026-08-22 13:47:42',8500.00,NULL),(76,10,'101',2,1,'2026-08-22 13:50:01','2026-08-22 13:50:01',12000.00,NULL),(77,10,'102',2,1,'2026-08-22 13:50:01','2026-08-22 13:50:01',12000.00,NULL),(78,10,'103',2,0,'2026-08-22 13:50:02','2026-09-01 17:32:42',12000.00,'2026-09-01 17:32:42'),(79,10,'104',2,0,'2026-08-22 13:50:02','2026-09-01 17:32:42',12000.00,'2026-09-01 17:32:42'),(80,11,'201',2,1,'2026-08-22 13:50:03','2026-08-22 13:50:03',12000.00,NULL),(81,11,'202',2,1,'2026-08-22 13:50:04','2026-08-22 13:50:04',12000.00,NULL),(82,11,'203',2,0,'2026-08-22 13:50:04','2026-09-01 17:32:42',12000.00,'2026-09-01 17:32:42'),(83,12,'101',2,1,'2026-08-22 13:51:15','2026-08-22 13:51:15',10000.00,NULL),(84,12,'102',2,1,'2026-08-22 13:51:16','2026-08-22 13:51:16',10000.00,NULL),(85,12,'103',2,0,'2026-08-22 13:51:16','2026-08-31 15:24:52',10000.00,'2026-08-31 15:24:52'),(86,13,'201',2,1,'2026-08-22 13:51:17','2026-08-22 13:51:17',10000.00,NULL),(87,13,'202',2,1,'2026-08-22 13:51:17','2026-08-22 13:51:17',10000.00,NULL),(88,14,'101',2,1,'2026-08-22 13:53:45','2026-08-22 13:53:45',15000.00,NULL),(89,14,'102',2,1,'2026-08-22 13:53:45','2026-08-22 13:53:45',15000.00,NULL),(90,14,'103',2,1,'2026-08-22 13:53:46','2026-08-22 13:53:46',15000.00,NULL),(91,14,'104',2,1,'2026-08-22 13:53:46','2026-08-22 13:53:46',15000.00,NULL),(92,14,'105',2,1,'2026-08-22 13:53:47','2026-08-22 13:53:47',15000.00,NULL),(93,14,'106',2,1,'2026-08-22 13:53:47','2026-08-22 13:53:47',15000.00,NULL),(94,15,'201',2,1,'2026-08-22 13:53:48','2026-08-22 13:53:48',15000.00,NULL),(95,15,'202',2,1,'2026-08-22 13:53:49','2026-08-22 13:53:49',15000.00,NULL),(96,15,'203',2,1,'2026-08-22 13:53:49','2026-08-22 13:53:49',15000.00,NULL),(97,15,'204',2,1,'2026-08-22 13:53:50','2026-08-22 13:53:50',15000.00,NULL),(98,15,'205',2,1,'2026-08-22 13:53:50','2026-08-22 13:53:50',15000.00,NULL),(99,15,'206',2,1,'2026-08-22 13:53:51','2026-08-22 13:53:51',15000.00,NULL),(100,16,'301',2,1,'2026-08-22 13:53:52','2026-08-22 13:53:52',15000.00,NULL),(101,16,'302',2,1,'2026-08-22 13:53:52','2026-08-22 13:53:52',15000.00,NULL),(102,16,'303',2,1,'2026-08-22 13:53:53','2026-08-22 13:53:53',15000.00,NULL),(103,16,'304',2,1,'2026-08-22 13:53:53','2026-08-22 13:53:53',15000.00,NULL),(104,16,'305',2,1,'2026-08-22 13:53:54','2026-08-22 13:53:54',15000.00,NULL),(105,17,'101',3,1,'2026-08-22 13:55:42','2026-09-04 11:30:35',14000.00,NULL),(106,17,'102',2,1,'2026-08-22 13:55:43','2026-09-04 11:30:35',14000.00,NULL),(107,17,'103',2,0,'2026-08-22 13:55:43','2026-09-04 11:30:38',14000.00,'2026-09-04 11:30:38'),(108,17,'104',2,0,'2026-08-22 13:55:44','2026-09-04 11:30:38',14000.00,'2026-09-04 11:30:38'),(109,18,'201',2,1,'2026-08-22 13:55:45','2026-09-04 11:30:36',14000.00,NULL),(110,18,'202',1,1,'2026-08-22 13:55:45','2026-08-25 22:06:10',14000.00,NULL),(111,18,'203',2,0,'2026-08-22 13:55:46','2026-09-04 11:30:38',14000.00,'2026-09-04 11:30:38'),(112,19,'301',1,1,'2026-08-25 22:06:11','2026-08-25 22:06:11',14000.00,NULL),(113,19,'302',1,1,'2026-08-25 22:06:11','2026-08-25 22:06:11',14000.00,NULL),(114,20,'401',2,1,'2026-08-25 22:06:12','2026-09-04 11:30:37',13000.00,NULL),(115,21,'301',2,1,'2026-08-31 15:24:52','2026-08-31 15:24:52',10000.00,NULL),(116,22,'301',1,1,'2026-09-01 17:32:40','2026-09-01 17:32:40',11000.00,NULL),(117,22,'302',1,1,'2026-09-01 17:32:41','2026-09-01 17:32:41',12000.00,NULL),(118,23,'401',1,1,'2026-09-01 17:32:42','2026-09-01 17:32:42',12000.00,NULL);
/*!40000 ALTER TABLE `rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_details`
--

DROP TABLE IF EXISTS `tenant_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int NOT NULL,
  `pg_id` int NOT NULL,
  `room_id` int NOT NULL,
  `residency` enum('national','international') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `aadhaar_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `father_aadhaar_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `c_form_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `efrro_from` date DEFAULT NULL,
  `efrro_till` date DEFAULT NULL,
  `rent` decimal(10,2) NOT NULL,
  `security_fee` decimal(10,2) NOT NULL,
  `payment_date` int NOT NULL COMMENT 'Day of month (1-31)',
  `paid_from` date NOT NULL,
  `paid_till` date NOT NULL,
  `arrival_date` date NOT NULL,
  `document_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `document_public_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `document_resource_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_tenant` (`tenant_id`),
  KEY `idx_pg_id` (`pg_id`),
  KEY `idx_room_id` (`room_id`),
  KEY `idx_efrro_till` (`efrro_till`),
  CONSTRAINT `fk_tenant_details_pg_id` FOREIGN KEY (`pg_id`) REFERENCES `pgs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tenant_details_room_id` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tenant_details_tenant_id` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_details`
--

LOCK TABLES `tenant_details` WRITE;
/*!40000 ALTER TABLE `tenant_details` DISABLE KEYS */;
INSERT INTO `tenant_details` VALUES (1,1,2,67,'international','null','null','170626CH433T','2026-07-22','2026-09-30',10000.00,10500.00,14,'2026-08-14','2026-09-13','2026-06-14',NULL,NULL,NULL,'2026-08-22 15:56:44','2026-09-04 19:21:41'),(8,18,2,32,'national','12346789989','123654789963','bfzkjnrgvklg5312','2026-08-12','2027-02-18',11000.00,8000.00,1,'2026-09-01','2026-09-30','2026-08-01',NULL,NULL,NULL,'2026-08-25 21:56:53','2026-09-01 08:17:57'),(10,32,5,86,'national','null','null','null',NULL,NULL,6501.00,6500.00,1,'2026-08-01','2026-08-31','2026-08-01',NULL,NULL,NULL,'2026-08-31 15:37:29','2026-08-31 15:37:29'),(11,33,2,56,'international','null','null','null','2026-04-27','2027-04-26',11000.00,11000.00,1,'2026-09-01','2026-09-30','2026-09-01',NULL,NULL,NULL,'2026-09-01 13:11:45','2026-09-01 13:11:45'),(12,34,2,47,'international','null','null','null','2026-02-28','2027-01-21',11001.00,11000.00,1,'2026-08-01','2026-08-31','2026-08-01',NULL,NULL,NULL,'2026-09-01 13:24:11','2026-09-01 13:24:11'),(13,36,4,116,'national','null','null','null',NULL,NULL,11000.00,0.00,1,'2026-08-01','2026-08-31','2026-08-01',NULL,NULL,NULL,'2026-09-01 17:34:46','2026-09-01 17:34:46'),(14,37,7,109,'national','621837003366','823448438191','null',NULL,NULL,14000.00,14000.00,5,'2026-08-01','2026-08-31','2026-08-01',NULL,NULL,NULL,'2026-09-03 14:12:11','2026-09-03 14:12:11'),(15,38,7,109,'national','633253654945','599399324325','null',NULL,NULL,14000.00,14000.00,1,'2026-08-01','2026-08-31','2026-08-01',NULL,NULL,NULL,'2026-09-03 14:12:18','2026-09-03 14:12:18'),(16,39,6,93,'national','null','null','null',NULL,NULL,10000.00,10000.00,10,'2026-08-01','2026-08-31','2026-08-01',NULL,NULL,NULL,'2026-09-04 13:48:52','2026-09-04 13:48:52'),(17,40,6,93,'national','null','null','null',NULL,NULL,10000.00,10000.00,10,'2026-08-01','2026-08-31','2026-08-01',NULL,NULL,NULL,'2026-09-04 13:49:03','2026-09-04 13:49:03'),(18,41,1,13,'national','655724927533','250135795628','null',NULL,NULL,9000.00,9000.00,1,'2026-09-01','2026-09-30','2026-08-01',NULL,NULL,NULL,'2026-09-07 14:45:17','2026-09-07 14:45:17'),(19,42,1,13,'national','573955317167','963884101972','null',NULL,NULL,11000.00,11000.00,1,'2026-09-01','2026-09-30','2026-08-01',NULL,NULL,NULL,'2026-09-07 14:45:24','2026-09-07 14:45:24');
/*!40000 ALTER TABLE `tenant_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_devices`
--

DROP TABLE IF EXISTS `tenant_devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant_devices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int NOT NULL,
  `fcm_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `device_type` enum('android','ios','web') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'android',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_tenant_device` (`tenant_id`,`fcm_token`),
  KEY `idx_tenant_devices_tenant_id` (`tenant_id`),
  KEY `idx_tenant_devices_fcm_token` (`fcm_token`),
  KEY `idx_tenant_devices_is_active` (`is_active`),
  CONSTRAINT `tenant_devices_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_devices`
--

LOCK TABLES `tenant_devices` WRITE;
/*!40000 ALTER TABLE `tenant_devices` DISABLE KEYS */;
INSERT INTO `tenant_devices` VALUES (1,1,'eoNVDXU9S0qErgMiF1f2yR:APA91bGbpSm8nCBwDIO-NRVho88_u2ILApjZd43EOATRvu1cGuQvnlrXOj3mPgkf1E_v4CuhiCZ3OXKTemOVn_Tfy1df7XD2pqcepw_1Pl2ZDkxav-in20M','android',0,'2026-08-22 16:50:36','2026-08-23 03:29:36'),(7,1,'eYxNxGYITV2URZUdpFUt7T:APA91bGNsT6WSEvT6Wi1Edji5a-zjdYwxcoT26s13gcYj_qdYQjGUSofriJ22LvGVFLAvKPkRYWkKUtuM8pdBbaSWoqe551zoK5zEBy6YqYJ_e7XIlUi99w','android',1,'2026-08-25 15:53:12','2026-09-02 12:20:35'),(8,18,'dnxQmE14TiafmSFrlQhOnp:APA91bHuVyPDAPbKU4ro7he9B_y2av41SkjEgJIFnlvBqTKi4osyxw5ioNvnEyAp048gcfNLjHbLSbfdyYRipWyoNeUguOuMxYa7DAXEOXVQmIave7YDqfY','android',1,'2026-08-25 21:58:38','2026-09-09 21:42:11'),(11,1,'chCfvs3dRwG_DFCO_3fuXl:APA91bFyEXzdPw-R34e8uQ7loh8s3wZdLkxagzylJzrzNZbheQysfJ_PTwlNhq38n4fTmvD56BJMyUAQMi9zShCrGyuVFDCWeSOh3FgmbDvKDvOWhdfosRA','android',1,'2026-08-28 18:52:36','2026-08-28 18:57:03'),(13,32,'dvJlsgyrS7uGdMXkM6MYD-:APA91bExZ8hEOCuDOrb3oQJ-TV56NTc9xQqf09sTDaJrYocXmLBo7T7ZwXLs1Mil459rEHFDw27_KF9laWS6bLxF6Mzjht5AM_14Iw5lmW2L2ofdlqxzbAk','android',1,'2026-08-31 15:39:06','2026-09-18 17:07:30'),(14,33,'d0FeBXHJSyea01kRL4g1qd:APA91bF7MyLhfo_SccfT6_Z_nCrWv5wGmdW5MjyF5QXYsdOS-VPSlWRpJkO6Ec-XONlyGRFpRC_Ba2Qsm5ljlN1uTD3EWtkErT0XzWDAKT2eF-jPVwH-CIw','android',1,'2026-09-01 13:13:19','2026-09-20 03:13:06'),(15,34,'d7I9pNdvQquDPZIoYdYqJN:APA91bFosqse6YinlXi8BiKc-ZCYfFvmmejhOryuNQsFbqbUtqJrUPcbcMRFAWUKUgKwcrFnFDc55E_kCeabxRGi7_fLsxHGP87lwpkKKZ8kCDaPYLwQMWw','android',1,'2026-09-01 13:26:04','2026-09-14 15:40:55'),(16,1,'eYxNxGYITV2URZUdpFUt7T:APA91bEW4PqTJXzhdZzHWQEC6FKlGebjxa0Wg5nFiP1d-ynbIMYRL9irKW66wiuoj-g3Qe1Khqusvlv6H9vfmPEPq3I0Q8SSv_WnvNiPlmZJVr28JtfhPjQ','android',1,'2026-09-02 12:50:20','2026-09-23 17:22:38'),(18,37,'dkSZs01USV2j0YnKlu0cwB:APA91bEUvraRmGCaMUm8-VMbA7sr40-XlzbYaS-B13fUhdMzg9rmuqCgbGmofyCjtloV1qzSTYnR52uZ43bN0Dc7LVW4bGchZ9_C5nR_zQGoBQGklgisXSU','android',1,'2026-09-03 14:14:18','2026-09-09 09:30:52'),(19,40,'e_jofJltTmeEfnut3yVsg3:APA91bHbEFLXc8HNwNnZBJ6-NANBcpQ-Xqzlz08mMK83Cj6vTWgBq3qMuVwLljT52EKADLzqMy7mcivgs4CuX8e8Vcao4h9KEfPXi8bC614BC1KiXAkUnMM','android',1,'2026-09-04 13:51:35','2026-09-20 11:35:14'),(20,41,'fLAnG47jSwiV7nckbseYls:APA91bFe7h_6AlanjJowDQmkH03gz5nNRmsdwKbPFtniD_9plRFHjL6-gucRzFPkawVn0MiQcneemADKWeRRoigaHpm6OhN94Sq8cfNviaFZBUK2chUJYr8','android',1,'2026-09-07 15:44:56','2026-09-08 08:23:35'),(21,18,'dQA2nHLZQyWAiVvpYFkKr9:APA91bHk1V3hAmdmN-wEaDw09D7GHtYKseys60OxNeRmepzpcit0NcVy7JYB_TDYElcghkXTgtMp6bPTLM24RrECyYJlZWJyr6x8Hdfyz5CIcot3e2gMBf8','android',1,'2026-09-21 17:39:40','2026-09-23 20:38:40');
/*!40000 ALTER TABLE `tenant_devices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_documents`
--

DROP TABLE IF EXISTS `tenant_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant_documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int NOT NULL,
  `document_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `document_public_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `document_resource_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'image',
  `document_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'id_proof',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `original_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `file_size` int DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_id` (`tenant_id`),
  CONSTRAINT `fk_tenant_documents_tenant_id` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_documents`
--

LOCK TABLES `tenant_documents` WRITE;
/*!40000 ALTER TABLE `tenant_documents` DISABLE KEYS */;
INSERT INTO `tenant_documents` VALUES (12,1,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1788279984/livinkey/tenants/1/documents/m5d6c2lc7bhy1n55tng4.jpg','livinkey/tenants/1/documents/m5d6c2lc7bhy1n55tng4','image','passport_photo','2026-09-01 16:26:25','doc_1788279981590.jpg',36717,'2026-09-01 16:26:25'),(13,1,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1788280005/livinkey/tenants/1/documents/qwqftudmxty1fv3jeqqu.jpg','livinkey/tenants/1/documents/qwqftudmxty1fv3jeqqu','image','visa','2026-09-01 16:26:45','doc_1788280001877.jpg',130563,'2026-09-01 16:26:45'),(14,1,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1788280028/livinkey/tenants/1/documents/x7hca6nqo58cwutljv0z.jpg','livinkey/tenants/1/documents/x7hca6nqo58cwutljv0z','image','arrival_stamp','2026-09-01 16:27:09','doc_1788280023513.jpg',196608,'2026-09-01 16:27:09'),(15,1,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1788280044/livinkey/tenants/1/documents/omtgzvu1xpvxrx0ekeau.jpg','livinkey/tenants/1/documents/omtgzvu1xpvxrx0ekeau','image','efrro','2026-09-01 16:27:24','doc_1788280041352.jpg',130563,'2026-09-01 16:27:24'),(16,1,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1788280259/livinkey/tenants/1/documents/cy9oa3idnjx4dk3uwhqz.jpg','livinkey/tenants/1/documents/cy9oa3idnjx4dk3uwhqz','image','passport','2026-09-01 16:31:00','doc_1788280257439.jpg',96577,'2026-09-01 16:31:00'),(17,33,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1788313423/livinkey/tenants/33/documents/mdvfyc4gjledbmrslquw.jpg','livinkey/tenants/33/documents/mdvfyc4gjledbmrslquw','image','passport','2026-09-02 01:43:43','doc_1788313408370.jpg',113649,'2026-09-02 01:43:43'),(18,33,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1788313438/livinkey/tenants/33/documents/n8timj3roaq1ild6ath8.jpg','livinkey/tenants/33/documents/n8timj3roaq1ild6ath8','image','passport_photo','2026-09-02 01:43:59','doc_1788313424561.jpg',55192,'2026-09-02 01:43:59'),(19,33,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1788313455/livinkey/tenants/33/documents/oljeb1xpcezcq8b3cg6c.jpg','livinkey/tenants/33/documents/oljeb1xpcezcq8b3cg6c','image','arrival_stamp','2026-09-02 01:44:16','doc_1788313441201.jpg',134234,'2026-09-02 01:44:16'),(20,33,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1788313536/livinkey/tenants/33/documents/wi3zc7vc0qdbjentlmw0.jpg','livinkey/tenants/33/documents/wi3zc7vc0qdbjentlmw0','image','visa','2026-09-02 01:45:37','doc_1788313522297.jpg',116023,'2026-09-02 01:45:37'),(21,33,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1788315025/livinkey/tenants/33/documents/hoyyg3tptuim3lqs1dpj.jpg','livinkey/tenants/33/documents/hoyyg3tptuim3lqs1dpj','image','efrro','2026-09-02 02:10:26','doc_1788315010815.jpg',136156,'2026-09-02 02:10:26'),(22,33,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1788315035/livinkey/tenants/33/documents/gurkbu3bn8nwuj4k17ss.jpg','livinkey/tenants/33/documents/gurkbu3bn8nwuj4k17ss','image','university_id','2026-09-02 02:10:36','doc_1788315021596.jpg',76949,'2026-09-02 02:10:36'),(23,32,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1788341620/livinkey/tenants/32/documents/et1pjrva4dmlmysxwki7.jpg','livinkey/tenants/32/documents/et1pjrva4dmlmysxwki7','image','passport_photo','2026-09-02 09:33:41','doc_1788341618364.jpg',21902,'2026-09-02 09:33:41'),(24,1,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1788350895/livinkey/tenants/1/documents/tv9ps7k3tfp5qvsxydjo.jpg','livinkey/tenants/1/documents/tv9ps7k3tfp5qvsxydjo','image','c_form','2026-09-02 12:08:16','doc_1788350892659.jpg',114959,'2026-09-02 12:08:16'),(25,1,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1788351115/livinkey/tenants/1/documents/vgug0mxlof79vrc372hd.jpg','livinkey/tenants/1/documents/vgug0mxlof79vrc372hd','image','university_id','2026-09-02 12:11:56','doc_1788351113118.jpg',158977,'2026-09-02 12:11:56'),(26,34,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1788354145/livinkey/tenants/34/documents/u7aysagda63zcgnaigf4.jpg','livinkey/tenants/34/documents/u7aysagda63zcgnaigf4','image','efrro','2026-09-02 13:02:26','doc_1788354143779.jpg',63552,'2026-09-02 13:02:26'),(27,33,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1788367403/livinkey/tenants/33/documents/am5iuatfo8byrb0l1acg.jpg','livinkey/tenants/33/documents/am5iuatfo8byrb0l1acg','image','c_form','2026-09-02 16:43:24','doc_1788367388997.jpg',110530,'2026-09-02 16:43:24'),(28,34,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1789400556/livinkey/tenants/34/documents/xgzslkaajxv9s8wpwr9a.jpg','livinkey/tenants/34/documents/xgzslkaajxv9s8wpwr9a','image','c_form','2026-09-14 15:42:37','doc_1789400553727.jpg',99416,'2026-09-14 15:42:37'),(29,34,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1789400602/livinkey/tenants/34/documents/ztefonqgmneudbjrxzkm.jpg','livinkey/tenants/34/documents/ztefonqgmneudbjrxzkm','image','arrival_stamp','2026-09-14 15:43:23','doc_1789400600464.jpg',125895,'2026-09-14 15:43:23'),(30,34,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1789400638/livinkey/tenants/34/documents/b2xje4p1b5oklrgecom8.jpg','livinkey/tenants/34/documents/b2xje4p1b5oklrgecom8','image','visa','2026-09-14 15:43:59','doc_1789400636092.jpg',183172,'2026-09-14 15:43:59'),(31,34,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1789400680/livinkey/tenants/34/documents/mgr3xmyglftroggmgx8i.jpg','livinkey/tenants/34/documents/mgr3xmyglftroggmgx8i','image','passport','2026-09-14 15:44:41','doc_1789400678305.jpg',178035,'2026-09-14 15:44:41'),(32,34,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1789400764/livinkey/tenants/34/documents/m9aplnyz5kkm8qsumvzq.jpg','livinkey/tenants/34/documents/m9aplnyz5kkm8qsumvzq','image','passport_photo','2026-09-14 15:46:04','doc_1789400761771.jpg',114792,'2026-09-14 15:46:04'),(33,34,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1789400797/livinkey/tenants/34/documents/ayn8xndovwcokkh2akzk.jpg','livinkey/tenants/34/documents/ayn8xndovwcokkh2akzk','image','university_id','2026-09-14 15:46:38','doc_1789400795879.jpg',84869,'2026-09-14 15:46:38');
/*!40000 ALTER TABLE `tenant_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_feedbacks`
--

DROP TABLE IF EXISTS `tenant_feedbacks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant_feedbacks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int NOT NULL,
  `user_type` enum('tenant','guest') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'tenant',
  `pg_id` int NOT NULL,
  `living_experience_rating` decimal(3,1) NOT NULL,
  `maintenance_handling_rating` decimal(3,1) NOT NULL,
  `communication_rating` decimal(3,1) NOT NULL,
  `amenities_rating` decimal(3,1) NOT NULL,
  `technology_handling_rating` decimal(3,1) NOT NULL,
  `overall_rating` decimal(3,1) NOT NULL,
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_tenant_feedback` (`tenant_id`),
  KEY `idx_pg_id` (`pg_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_rating` (`overall_rating`),
  CONSTRAINT `tenant_feedbacks_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tenant_feedbacks_ibfk_2` FOREIGN KEY (`pg_id`) REFERENCES `pgs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tenant_feedbacks_chk_1` CHECK ((`living_experience_rating` between 1 and 10)),
  CONSTRAINT `tenant_feedbacks_chk_2` CHECK ((`maintenance_handling_rating` between 1 and 10)),
  CONSTRAINT `tenant_feedbacks_chk_3` CHECK ((`communication_rating` between 1 and 10)),
  CONSTRAINT `tenant_feedbacks_chk_4` CHECK ((`amenities_rating` between 1 and 10)),
  CONSTRAINT `tenant_feedbacks_chk_5` CHECK ((`technology_handling_rating` between 1 and 10)),
  CONSTRAINT `tenant_feedbacks_chk_6` CHECK ((`overall_rating` between 1 and 10))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_feedbacks`
--

LOCK TABLES `tenant_feedbacks` WRITE;
/*!40000 ALTER TABLE `tenant_feedbacks` DISABLE KEYS */;
/*!40000 ALTER TABLE `tenant_feedbacks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_notifications`
--

DROP TABLE IF EXISTS `tenant_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant_notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int NOT NULL,
  `type` enum('bill_created','bill_paid','bill_partially_paid','bill_overdue','bill_fine_applied','maintenance_created','maintenance_started','maintenance_completed','document_reminder','efrro_expiry','payment_reminder','feedback_submitted','bill_fine_adjusted','admin_message') COLLATE utf8mb4_general_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `entity_id` int DEFAULT NULL,
  `entity_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `link` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `icon` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `color` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `read_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `tenant_notifications_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=287 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_notifications`
--

LOCK TABLES `tenant_notifications` WRITE;
/*!40000 ALTER TABLE `tenant_notifications` DISABLE KEYS */;
INSERT INTO `tenant_notifications` VALUES (35,18,'maintenance_created','Maintenance Request Submitted','Your Electrician request has been submitted.',7,'maintenance','/maintenance/my-requests','?','#f39c12',1,'2026-09-23 14:56:26','2026-08-25 22:00:39'),(36,18,'maintenance_started','Maintenance Started','Your Electrician request is now in progress.',7,'maintenance','/maintenance/my-requests','?','#3498db',1,'2026-09-23 14:56:26','2026-08-25 22:01:50'),(38,18,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',1,'2026-09-23 14:56:26','2026-08-26 09:30:01'),(40,18,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',1,'2026-09-23 14:56:26','2026-08-27 09:30:01'),(42,18,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',1,'2026-09-23 14:56:26','2026-08-28 09:30:01'),(44,18,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',1,'2026-09-23 14:56:26','2026-08-29 09:30:01'),(46,18,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',1,'2026-09-01 08:06:09','2026-08-30 09:30:01'),(48,18,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',1,'2026-09-01 08:06:05','2026-08-31 09:30:01'),(49,18,'maintenance_completed','Maintenance Completed','Your Electrician request has been completed.',7,'maintenance','/maintenance/my-requests','✅','#2ecc71',1,'2026-09-01 08:05:57','2026-08-31 12:10:52'),(50,18,'bill_created','New Bill Generated','A new bill of ₹14156.00 has been generated for you.',6,'bill','/tenant-payments/bill','?','#3498db',1,'2026-08-31 12:13:33','2026-08-31 12:13:07'),(52,18,'admin_message','Hi','Hellow, I am Testing',NULL,'admin_message','/tenant-notifications','?','#3498db',1,'2026-09-01 08:06:24','2026-08-31 13:59:38'),(55,18,'admin_message','Testing','Hujambo',NULL,'admin_message','/tenant-notifications','?','#3498db',1,'2026-09-23 14:56:26','2026-08-31 14:11:58'),(56,32,'bill_created','New Bill Generated','A new bill of ₹12268.00 has been generated for you.',7,'bill','/tenant-payments/bill','?','#3498db',0,NULL,'2026-08-31 15:42:02'),(60,18,'bill_partially_paid','Partial Payment Received','Your partial payment of ₹10000.00 has been received.',6,'bill','/tenant-payments/history','?','#f39c12',1,'2026-09-23 14:56:26','2026-09-01 08:18:02'),(62,18,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',1,'2026-09-23 14:56:26','2026-09-01 09:30:01'),(63,32,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-01 09:30:01'),(65,18,'admin_message','Documents','please upload your documents on app',NULL,'admin_message','/tenant-notifications','?','#3498db',1,'2026-09-01 14:47:49','2026-09-01 14:47:01'),(66,32,'admin_message','Documents','please upload your documents on app',NULL,'admin_message','/tenant-notifications','?','#3498db',0,NULL,'2026-09-01 14:47:01'),(67,33,'admin_message','Documents','please upload your documents on app',NULL,'admin_message','/tenant-notifications','?','#3498db',1,'2026-09-14 14:51:50','2026-09-01 14:47:01'),(68,34,'admin_message','Documents','please upload your documents on app',NULL,'admin_message','/tenant-notifications','?','#3498db',0,NULL,'2026-09-01 14:47:01'),(69,36,'bill_created','New Bill Generated','A new bill of ₹11000.00 has been generated for you.',8,'bill','/tenant-payments/bill','?','#3498db',0,NULL,'2026-09-01 17:47:37'),(71,18,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',1,'2026-09-23 14:56:26','2026-09-02 09:30:01'),(72,32,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',1,'2026-09-02 09:30:23','2026-09-02 09:30:02'),(73,33,'document_reminder','Document Required','Please upload your C-Form.',NULL,'document','/documents','?','#e67e22',1,'2026-09-14 14:51:45','2026-09-02 09:30:02'),(74,34,'document_reminder','Document Required','Please upload your Passport Size Photo and 5 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-02 09:30:03'),(75,36,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-02 09:30:03'),(80,34,'maintenance_created','Maintenance Request Submitted','Your Cleaning request has been submitted.',8,'maintenance','/maintenance/my-requests','?','#f39c12',0,NULL,'2026-09-02 14:52:04'),(81,18,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',1,'2026-09-23 14:56:26','2026-09-03 09:30:00'),(82,32,'document_reminder','Document Required','Please upload your Tenant Aadhaar Card and 1 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-03 09:30:01'),(83,34,'document_reminder','Document Required','Please upload your Passport Size Photo and 4 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-03 09:30:02'),(84,36,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-03 09:30:02'),(85,38,'bill_created','New Bill Generated','A new bill of ₹17108.00 has been generated for you.',9,'bill','/tenant-payments/bill','?','#3498db',0,NULL,'2026-09-03 14:18:46'),(86,37,'bill_created','New Bill Generated','A new bill of ₹17108.00 has been generated for you.',10,'bill','/tenant-payments/bill','?','#3498db',0,NULL,'2026-09-03 14:19:33'),(87,37,'payment_reminder','Payment Reminder','Your rent payment is due in 1 days.',NULL,'payment','/tenant-payments/bill','?','#e74c3c',0,NULL,'2026-09-04 08:00:00'),(88,18,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',1,'2026-09-04 11:18:14','2026-09-04 09:30:00'),(89,32,'document_reminder','Document Required','Please upload your Tenant Aadhaar Card and 1 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-04 09:30:01'),(90,34,'document_reminder','Document Required','Please upload your Passport Size Photo and 4 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-04 09:30:02'),(91,36,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-04 09:30:03'),(92,37,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-04 09:30:03'),(93,38,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-04 09:30:04'),(94,40,'bill_created','New Bill Generated','A new bill of ₹10820.00 has been generated for you.',11,'bill','/tenant-payments/bill','?','#3498db',0,NULL,'2026-09-04 13:53:28'),(95,40,'maintenance_created','Maintenance Request Submitted','Your Cleaning request has been submitted.',9,'maintenance','/maintenance/my-requests','?','#f39c12',0,NULL,'2026-09-04 15:53:23'),(96,34,'bill_created','New Bill Generated','A new bill of ₹11600.00 has been generated for you.',12,'bill','/tenant-payments/bill','?','#3498db',0,NULL,'2026-09-04 18:44:56'),(97,1,'bill_created','New Bill Generated','A new bill of ₹3180.00 has been generated for you.',13,'bill','/tenant-payments/bill','?','#3498db',1,'2026-09-04 19:12:27','2026-09-04 19:12:01'),(99,18,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',1,'2026-09-07 07:59:36','2026-09-05 09:30:00'),(100,32,'document_reminder','Document Required','Please upload your Tenant Aadhaar Card and 1 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-05 09:30:01'),(101,34,'document_reminder','Document Required','Please upload your Passport Size Photo and 4 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-05 09:30:02'),(102,36,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-05 09:30:03'),(103,37,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-05 09:30:03'),(104,38,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-05 09:30:04'),(105,39,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-05 09:30:04'),(106,40,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-05 09:30:05'),(107,34,'maintenance_created','Maintenance Request Submitted','Your Cleaning request has been submitted.',10,'maintenance','/maintenance/my-requests','?','#f39c12',0,NULL,'2026-09-06 04:19:05'),(108,18,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',1,'2026-09-23 14:56:26','2026-09-06 09:30:00'),(109,32,'document_reminder','Document Required','Please upload your Tenant Aadhaar Card and 1 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-06 09:30:01'),(110,34,'document_reminder','Document Required','Please upload your Passport Size Photo and 4 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-06 09:30:02'),(111,36,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-06 09:30:02'),(112,37,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-06 09:30:03'),(113,38,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-06 09:30:03'),(114,39,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-06 09:30:04'),(115,40,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-06 09:30:04'),(116,1,'payment_reminder','Payment Reminder','Your rent payment is due in 7 days.',NULL,'payment','/tenant-payments/bill','?','#e74c3c',1,'2026-09-07 17:32:18','2026-09-07 08:00:00'),(117,40,'payment_reminder','Payment Reminder','Your rent payment is due in 3 days.',NULL,'payment','/tenant-payments/bill','?','#e74c3c',0,NULL,'2026-09-07 08:00:01'),(118,18,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',1,'2026-09-23 14:56:26','2026-09-07 09:30:00'),(119,32,'document_reminder','Document Required','Please upload your Tenant Aadhaar Card and 1 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-07 09:30:01'),(120,34,'document_reminder','Document Required','Please upload your Passport Size Photo and 4 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-07 09:30:02'),(121,36,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-07 09:30:02'),(122,37,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-07 09:30:03'),(123,38,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-07 09:30:03'),(124,39,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-07 09:30:04'),(125,40,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-07 09:30:04'),(126,41,'bill_created','New Bill Generated','A new bill of ₹11341.00 has been generated for you.',15,'bill','/tenant-payments/bill','?','#3498db',1,'2026-09-07 15:45:29','2026-09-07 14:47:08'),(127,40,'maintenance_created','Maintenance Request Submitted','Your Others request has been submitted.',11,'maintenance','/maintenance/my-requests','?','#f39c12',0,NULL,'2026-09-07 17:13:16'),(128,40,'maintenance_created','Maintenance Request Submitted','Your Electrician request has been submitted.',12,'maintenance','/maintenance/my-requests','?','#f39c12',0,NULL,'2026-09-07 17:14:02'),(129,18,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',1,'2026-09-23 14:56:26','2026-09-08 09:30:00'),(130,32,'document_reminder','Document Required','Please upload your Tenant Aadhaar Card and 1 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-08 09:30:01'),(131,34,'document_reminder','Document Required','Please upload your Passport Size Photo and 4 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-08 09:30:02'),(132,36,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-08 09:30:02'),(133,37,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-08 09:30:03'),(134,38,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-08 09:30:03'),(135,39,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-08 09:30:04'),(136,40,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-08 09:30:04'),(137,41,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-08 09:30:05'),(138,42,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-08 09:30:05'),(139,40,'payment_reminder','Payment Reminder','Your rent payment is due in 1 days.',NULL,'payment','/tenant-payments/bill','?','#e74c3c',0,NULL,'2026-09-09 08:00:00'),(140,18,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',1,'2026-09-23 14:56:26','2026-09-09 09:30:00'),(141,32,'document_reminder','Document Required','Please upload your Tenant Aadhaar Card and 1 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-09 09:30:01'),(142,34,'document_reminder','Document Required','Please upload your Passport Size Photo and 4 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-09 09:30:02'),(143,36,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-09 09:30:02'),(144,37,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-09 09:30:03'),(145,38,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-09 09:30:03'),(146,39,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-09 09:30:04'),(147,40,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-09 09:30:04'),(148,41,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-09 09:30:05'),(149,42,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-09 09:30:05'),(150,18,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',1,'2026-09-23 14:56:26','2026-09-10 09:30:00'),(151,32,'document_reminder','Document Required','Please upload your Tenant Aadhaar Card and 1 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-10 09:30:02'),(152,34,'document_reminder','Document Required','Please upload your Passport Size Photo and 4 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-10 09:30:02'),(153,36,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-10 09:30:03'),(154,37,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-10 09:30:04'),(155,38,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-10 09:30:04'),(156,39,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-10 09:30:05'),(157,40,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-10 09:30:05'),(158,41,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-10 09:30:06'),(159,42,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-10 09:30:06'),(160,1,'payment_reminder','Payment Reminder','Your rent payment is due in 3 days.',NULL,'payment','/tenant-payments/bill','?','#e74c3c',1,'2026-09-15 13:02:10','2026-09-11 08:00:00'),(161,18,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',1,'2026-09-23 14:56:26','2026-09-11 09:30:00'),(162,32,'document_reminder','Document Required','Please upload your Tenant Aadhaar Card and 1 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-11 09:30:01'),(163,34,'document_reminder','Document Required','Please upload your Passport Size Photo and 4 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-11 09:30:02'),(164,36,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-11 09:30:03'),(165,37,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-11 09:30:03'),(166,38,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-11 09:30:04'),(167,39,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-11 09:30:05'),(168,40,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-11 09:30:05'),(169,41,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-11 09:30:06'),(170,42,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-11 09:30:06'),(171,18,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',1,'2026-09-23 14:56:26','2026-09-12 09:30:00'),(172,32,'document_reminder','Document Required','Please upload your Tenant Aadhaar Card and 1 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-12 09:30:01'),(173,34,'document_reminder','Document Required','Please upload your Passport Size Photo and 4 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-12 09:30:02'),(174,36,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-12 09:30:02'),(175,37,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-12 09:30:03'),(176,38,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-12 09:30:03'),(177,39,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-12 09:30:04'),(178,40,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-12 09:30:04'),(179,41,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-12 09:30:05'),(180,42,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-12 09:30:05'),(181,1,'payment_reminder','Payment Reminder','Your rent payment is due in 1 days.',NULL,'payment','/tenant-payments/bill','?','#e74c3c',1,'2026-09-15 13:02:10','2026-09-13 08:00:00'),(182,18,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',1,'2026-09-23 14:56:26','2026-09-13 09:30:00'),(183,32,'document_reminder','Document Required','Please upload your Tenant Aadhaar Card and 1 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-13 09:30:01'),(184,34,'document_reminder','Document Required','Please upload your Passport Size Photo and 4 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-13 09:30:01'),(185,36,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-13 09:30:02'),(186,37,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-13 09:30:02'),(187,38,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-13 09:30:03'),(188,39,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-13 09:30:03'),(189,40,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-13 09:30:04'),(190,41,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-13 09:30:04'),(191,42,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-13 09:30:05'),(192,18,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',1,'2026-09-23 14:56:26','2026-09-14 09:30:00'),(193,32,'document_reminder','Document Required','Please upload your Tenant Aadhaar Card and 1 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-14 09:30:01'),(194,34,'document_reminder','Document Required','Please upload your Passport Size Photo and 4 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-14 09:30:02'),(195,36,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-14 09:30:02'),(196,37,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-14 09:30:03'),(197,38,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-14 09:30:03'),(198,39,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-14 09:30:04'),(199,40,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-14 09:30:04'),(200,41,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-14 09:30:05'),(201,42,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-14 09:30:05'),(202,18,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',1,'2026-09-23 14:56:26','2026-09-15 09:30:00'),(203,32,'document_reminder','Document Required','Please upload your Tenant Aadhaar Card and 1 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-15 09:30:01'),(204,36,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-15 09:30:02'),(205,37,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-15 09:30:02'),(206,38,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-15 09:30:03'),(207,39,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-15 09:30:03'),(208,40,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-15 09:30:04'),(209,41,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-15 09:30:05'),(210,42,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-15 09:30:05'),(211,18,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',1,'2026-09-23 14:56:26','2026-09-16 09:30:00'),(212,32,'document_reminder','Document Required','Please upload your Tenant Aadhaar Card and 1 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-16 09:30:01'),(213,36,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-16 09:30:02'),(214,37,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-16 09:30:03'),(215,38,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-16 09:30:03'),(216,39,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-16 09:30:04'),(217,40,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-16 09:30:04'),(218,41,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-16 09:30:05'),(219,42,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-16 09:30:05'),(220,18,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',1,'2026-09-23 14:56:26','2026-09-17 09:30:00'),(221,32,'document_reminder','Document Required','Please upload your Tenant Aadhaar Card and 1 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-17 09:30:01'),(222,36,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-17 09:30:02'),(223,37,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-17 09:30:03'),(224,38,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-17 09:30:03'),(225,39,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-17 09:30:04'),(226,40,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-17 09:30:04'),(227,41,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-17 09:30:05'),(228,42,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-17 09:30:05'),(229,33,'maintenance_created','Maintenance Request Submitted','Your Cleaning request has been submitted.',13,'maintenance','/maintenance/my-requests','?','#f39c12',1,'2026-09-20 03:13:13','2026-09-18 02:42:49'),(230,18,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',1,'2026-09-23 14:56:26','2026-09-18 09:30:00'),(231,32,'document_reminder','Document Required','Please upload your Tenant Aadhaar Card and 1 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-18 09:30:01'),(232,36,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-18 09:30:02'),(233,37,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-18 09:30:02'),(234,38,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-18 09:30:03'),(235,39,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-18 09:30:03'),(236,40,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-18 09:30:04'),(237,41,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-18 09:30:04'),(238,42,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-18 09:30:05'),(239,18,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',1,'2026-09-21 17:40:36','2026-09-19 09:30:00'),(240,32,'document_reminder','Document Required','Please upload your Tenant Aadhaar Card and 1 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-19 09:30:01'),(241,36,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-19 09:30:02'),(242,37,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-19 09:30:03'),(243,38,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-19 09:30:03'),(244,39,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-19 09:30:04'),(245,40,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-19 09:30:04'),(246,41,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-19 09:30:05'),(247,42,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-19 09:30:05'),(248,33,'maintenance_created','Maintenance Request Submitted','Your Cleaning request has been submitted.',14,'maintenance','/maintenance/my-requests','?','#f39c12',0,NULL,'2026-09-20 03:14:03'),(249,18,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',1,'2026-09-21 17:40:15','2026-09-20 09:30:00'),(250,32,'document_reminder','Document Required','Please upload your Tenant Aadhaar Card and 1 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-20 09:30:01'),(251,36,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-20 09:30:02'),(252,37,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-20 09:30:02'),(253,38,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-20 09:30:03'),(254,39,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-20 09:30:03'),(255,40,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-20 09:30:04'),(256,41,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-20 09:30:04'),(257,42,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-20 09:30:05'),(258,18,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',1,'2026-09-21 17:40:04','2026-09-21 09:30:00'),(259,32,'document_reminder','Document Required','Please upload your Tenant Aadhaar Card and 1 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-21 09:30:01'),(260,36,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-21 09:30:02'),(261,37,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-21 09:30:02'),(262,38,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-21 09:30:03'),(263,39,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-21 09:30:03'),(264,40,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-21 09:30:04'),(265,41,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-21 09:30:05'),(266,42,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-21 09:30:05'),(267,18,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',1,'2026-09-23 14:56:26','2026-09-22 09:30:00'),(268,32,'document_reminder','Document Required','Please upload your Tenant Aadhaar Card and 1 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-22 09:30:01'),(269,36,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-22 09:30:02'),(270,37,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-22 09:30:03'),(271,38,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-22 09:30:03'),(272,39,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-22 09:30:04'),(273,40,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-22 09:30:04'),(274,41,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-22 09:30:05'),(275,42,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-22 09:30:05'),(276,18,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',1,'2026-09-23 14:56:26','2026-09-23 09:30:00'),(277,32,'document_reminder','Document Required','Please upload your Tenant Aadhaar Card and 1 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-23 09:30:01'),(278,36,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-23 09:30:02'),(279,37,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-23 09:30:03'),(280,38,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-23 09:30:03'),(281,39,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-23 09:30:04'),(282,40,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-23 09:30:04'),(283,41,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-23 09:30:05'),(284,42,'document_reminder','Document Required','Please upload your Passport Size Photo and 2 other document(s).',NULL,'document','/documents','?','#e67e22',0,NULL,'2026-09-23 09:30:05'),(285,18,'admin_message','documents','plz sens docu',NULL,'admin_message','/tenant-notifications','?','#3498db',1,'2026-09-23 20:39:00','2026-09-23 15:21:40'),(286,1,'admin_message','Kuhusu App','Hautumii sana App',NULL,'admin_message','/tenant-notifications','?','#3498db',1,'2026-09-23 17:25:10','2026-09-23 17:24:34');
/*!40000 ALTER TABLE `tenant_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenants`
--

DROP TABLE IF EXISTS `tenants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role` enum('tenant','guest') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `full_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nationality` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `country_code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `international_phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `gender` enum('male','female','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `residency` enum('national','international') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `must_change_password` tinyint(1) DEFAULT '0',
  `otp` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `otp_expiry` datetime DEFAULT NULL,
  `otp_sent_at` datetime DEFAULT NULL,
  `reset_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tenants_email` (`email`),
  UNIQUE KEY `uq_country_phone` (`country_code`,`phone`),
  KEY `idx_created_by` (`created_by`),
  CONSTRAINT `fk_tenants_created_by` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenants`
--

LOCK TABLES `tenants` WRITE;
/*!40000 ALTER TABLE `tenants` DISABLE KEYS */;
INSERT INTO `tenants` VALUES (1,'tenant','Mohammed Aminu Shehe','molittle1011@gmail.com','Tanzanian','+91','7681969865','+255 677 532 140','male','international',1,'$2b$12$IHH5IuHU0rIYD81HIwBJYu9tesed6CcHEXQ7fmWhpz8ht7PJG/HtK',1,'2026-08-22 15:56:43','2026-08-22 16:51:02',0,NULL,NULL,NULL,NULL,NULL),(9,'guest','Kinjili','abdulwarithshehe2010@gmail.com','Mexican','+52','7681969865',NULL,'other',NULL,1,'$2b$12$1fPR3V50rH5gAatyfDZ6cOgdZMxTxBOxzqsuNvvr.jhri2iUDUdNi',1,'2026-08-23 00:07:22','2026-09-02 12:52:26',0,NULL,NULL,'2026-09-02 12:51:54',NULL,NULL),(18,'tenant','Sri Ram','sriramprasad1662@gmail.com','Indian','+91','9381124050',NULL,'male','national',1,'$2b$12$d68kOr3rTDuDFLDhUzxf3uk/hQ0igLpwfQsXx8KepsoIVoB5fFlLq',2,'2026-08-25 21:56:53','2026-08-25 21:59:04',0,NULL,NULL,NULL,NULL,NULL),(32,'tenant','Soniya Sharma','soniyasharma10920@gmail.com','Indian','+91','8962443887',NULL,'female','national',1,'$2b$12$uD3cR1kgzkcDZ8eSwwHX7.rTGkKstgb18bK53HA4s8b9uCx6ZwhW6',2,'2026-08-31 15:37:29','2026-08-31 15:39:35',0,NULL,NULL,NULL,NULL,NULL),(33,'tenant','Prosad Das','prosad726@gmail.com','Bangladeshi','+91','9046049359','+880 01540065713','male','international',1,'$2b$12$adIjGLSN1SzLUpnbpQ0bte6wI0eNSd5KKmJOmbASwZO08PBZintDy',2,'2026-09-01 13:11:44','2026-09-01 13:14:02',0,NULL,NULL,NULL,NULL,NULL),(34,'tenant','Shuvo Das','shuvodas985c@gmail.com','Bangladeshi','+91','7696945698','+880 1747274481','male','international',1,'$2b$12$TroRt.p57aJln1wam8iq7u7TXqNM.EKHE/2HNydFxY94K0l6iVyAa',2,'2026-09-01 13:24:10','2026-09-01 13:26:51',0,NULL,NULL,NULL,NULL,NULL),(35,'guest','arvindra pal','arvindrapal6386@gmail.com','Indian','+91','6386079263',NULL,'other','national',1,'$2b$12$sntACkN5I2rlYkmmmACIquIGRGzi.Ow8QEVgNT.n5MdAw6X7luv.G',1,'2026-09-01 14:41:53','2026-09-01 14:41:53',0,NULL,NULL,NULL,NULL,NULL),(36,'tenant','Vishwa Singh','singhvishwa04@gmail.com','Indian','+91','7307799664',NULL,'female','national',1,'$2b$12$RW43xuCly6rITjm3iAe/R..Qau8Yao1.lCxjpglXHuLCt5tT26Ree',2,'2026-09-01 17:34:46','2026-09-01 17:34:46',1,NULL,NULL,NULL,NULL,NULL),(37,'tenant','Sohil Khan','sohilkhan786687apple@gmail.com','Indian','+91','7973525727',NULL,'male','national',1,'$2b$12$7AQycmxtijSvEyeS9WyFiun2/hZtMzYLLNGoCDtopaJrZR/S//rV.',2,'2026-09-03 14:12:11','2026-09-03 14:14:37',0,NULL,NULL,NULL,NULL,NULL),(38,'tenant','Ahin Vinod','ahinvinod04@gmail.com','Indian','+91','7994014080',NULL,'male','national',1,'$2b$12$84iNUiJ30kIoKf3ObajoDOAWrnN3fJMkNNE8MfGcodFxgqkDaS/6G',2,'2026-09-03 14:12:18','2026-09-03 14:12:18',1,NULL,NULL,NULL,NULL,NULL),(39,'tenant','Shubham','sy9237522@gmail.com','Indian','+91','9369210373',NULL,'male','national',1,'$2b$12$dOTV/4WY1nPacehou6Jv2eAZ/eqHz3l2kqht0nKwZTJ1QItikmliq',2,'2026-09-04 13:48:52','2026-09-04 13:48:52',1,NULL,NULL,NULL,NULL,NULL),(40,'tenant','Himanshu','himanshukr7520@gmail.com','Indian','+91','9110969318',NULL,'male','national',1,'$2b$12$yXb44qig40HrL615dFJu/eVrT52739ilLx1ZHvuO59jASCQwROXYa',2,'2026-09-04 13:49:03','2026-09-04 13:51:56',0,NULL,NULL,NULL,NULL,NULL),(41,'tenant','Sameer','krsameer88094@gmail.com','Indian','+91','8809410373',NULL,'male','national',1,'$2b$12$xcD0SXvR3Lhg8L/FaI0SY.lgNGGHgg6YkejN4bWsX.Rr6Hqi23qIO',2,'2026-09-07 14:45:17','2026-09-07 15:44:39',0,NULL,NULL,'2026-09-07 15:44:00',NULL,NULL),(42,'tenant','Arayan','aryanbhardwaaj007@gmail.com','Indian','+91','9142371330',NULL,'male','national',1,'$2b$12$BDiyZB8/yejuQDISYSwzMOlye7H6./sheR8oBZviHdjaXZXFNmlKG',2,'2026-09-07 14:45:24','2026-09-07 14:45:24',1,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `tenants` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-24 13:06:41
