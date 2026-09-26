-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: livinkey
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

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

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_logs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) DEFAULT NULL,
  `guest_id` int(11) DEFAULT NULL,
  `pg_id` int(11) DEFAULT NULL,
  `actor_type` enum('tenant','guest','admin','system') NOT NULL,
  `actor_name` varchar(255) DEFAULT NULL,
  `actor_position` varchar(100) DEFAULT NULL,
  `action` varchar(120) NOT NULL,
  `module` varchar(80) NOT NULL,
  `entity_type` varchar(100) DEFAULT NULL,
  `entity_id` bigint(20) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `ip_address` varchar(64) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `device_info` varchar(255) DEFAULT NULL,
  `performed_by_admin_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_activity_tenant` (`tenant_id`),
  KEY `idx_activity_guest` (`guest_id`),
  KEY `idx_activity_pg` (`pg_id`),
  KEY `idx_activity_action` (`action`),
  KEY `idx_activity_module` (`module`),
  KEY `idx_activity_created` (`created_at`),
  KEY `idx_activity_admin` (`performed_by_admin_id`)
) ENGINE=InnoDB AUTO_INCREMENT=444 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_logs`
--

LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
INSERT INTO `activity_logs` VALUES (1,NULL,NULL,NULL,'admin','MO11','Super Admin','login','auth',NULL,NULL,'{\"result\": \"success\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0',NULL,1,'2026-09-23 17:04:32'),(2,1,NULL,NULL,'admin','MO11','Super Admin','admin_message_sent','messaging','person',1,'{\"title\": \"Kuhusu App\", \"subject\": \"App Fungua\", \"channels\": {\"push\": 1, \"email\": true, \"in_app\": true}}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0',NULL,1,'2026-09-23 17:24:54'),(3,NULL,NULL,NULL,'admin','MO11','Super Admin','activity_exported','activity_logs',NULL,NULL,'{\"rows\": 2}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0',NULL,1,'2026-09-23 17:26:20'),(4,NULL,NULL,NULL,'admin','MO11','Super Admin','login','auth',NULL,NULL,'{\"result\": \"success\"}','49.156.83.95','Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.0 Mobile/15E148 Safari/604.1',NULL,1,'2026-09-23 17:55:16'),(5,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread/count\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:35:29'),(6,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications?limit=100&offset=0\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:35:30'),(7,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread/count\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:35:30'),(8,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread/count\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:35:31'),(9,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications?limit=100&offset=0\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:35:31'),(10,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread/count\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:40'),(11,18,NULL,2,'tenant','Sri Ram','Tenant','device_registered','app','app',NULL,'{\"path\": \"/api/tenants/device/fcm-token\", \"method\": \"POST\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:41'),(12,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread/count\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:41'),(13,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications?limit=100&offset=0\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:41'),(14,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread/count\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:41'),(15,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread/count\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:42'),(16,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications?limit=100&offset=0\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:42'),(17,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications?limit=100&offset=0\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:42'),(18,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications?limit=100&offset=0\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:42'),(19,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread?limit=50\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:43'),(20,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','bills','bills',NULL,'{\"path\": \"/api/tenant-payments/bill\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:48'),(21,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','documents','documents',NULL,'{\"path\": \"/api/documents/types\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:49'),(22,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','feedbacks','feedbacks',NULL,'{\"path\": \"/api/feedbacks/status\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:49'),(23,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','maintenance','maintenance',NULL,'{\"path\": \"/api/maintenance/my-requests\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:49'),(24,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread/count\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:49'),(25,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','maintenance','maintenance',NULL,'{\"path\": \"/api/maintenance/my-stats\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:49'),(26,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','documents','documents',NULL,'{\"path\": \"/api/documents/my-documents\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:49'),(27,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread/count\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:49'),(28,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread/count\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:50'),(29,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications?limit=100&offset=0\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:50'),(30,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications?limit=100&offset=0\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:50'),(31,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','payments','payments',NULL,'{\"path\": \"/api/tenant-payments/history\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:50'),(32,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread/count\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:50'),(33,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications?limit=100&offset=0\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:51'),(34,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications?limit=100&offset=0\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:51'),(35,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread/count\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:57'),(36,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications?limit=100&offset=0\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:38:58'),(37,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',285,'{\"path\": \"/api/tenant-notifications/285/read\", \"method\": \"PUT\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:39:01'),(38,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread/count\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:39:01'),(39,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications?limit=100&offset=0\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:39:02'),(40,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread/count\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:39:03'),(41,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications?limit=100&offset=0\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:39:04'),(42,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread/count\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:39:10'),(43,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications?limit=100&offset=0\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:39:10'),(44,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','documents','documents',NULL,'{\"path\": \"/api/documents/types\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:39:12'),(45,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','documents','documents',NULL,'{\"path\": \"/api/documents/my-documents\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:39:13'),(46,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread/count\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:39:13'),(47,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications?limit=100&offset=0\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:39:14'),(48,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread/count\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:39:20'),(49,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications?limit=100&offset=0\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:39:21'),(50,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread/count\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:39:21'),(51,18,NULL,2,'tenant','Sri Ram','Tenant','notification_read','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications/unread/count\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:39:22'),(52,18,NULL,2,'tenant','Sri Ram','Tenant','viewed','notifications','notifications',NULL,'{\"path\": \"/api/tenant-notifications?limit=100&offset=0\", \"method\": \"GET\", \"status\": 200}','49.156.79.11','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-23 20:39:23'),(53,NULL,NULL,NULL,'admin','MO11','Super Admin','login','auth',NULL,NULL,'{\"result\":\"success\"}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0',NULL,1,'2026-09-24 13:29:58'),(54,NULL,NULL,NULL,'admin','MO11','Super Admin','created','tenants','tenant',NULL,'{\"method\":\"POST\",\"path\":\"/api/tenants\",\"status\":201}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0',NULL,1,'2026-09-24 13:57:07'),(55,NULL,NULL,NULL,'admin','MO11','Super Admin','updated','messaging','messaging',254,'{\"method\":\"PUT\",\"path\":\"/api/notifications/254/read\",\"status\":200}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0',NULL,1,'2026-09-24 13:57:21'),(56,13,NULL,NULL,'admin','MO11','Super Admin','admin_message_sent','messaging','person',13,'{\"title\":\"Welcome\",\"subject\":\"Welcome to Livinkey\",\"channels\":{\"in_app\":true,\"push\":0,\"email\":true}}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0',NULL,1,'2026-09-24 13:59:08'),(57,NULL,NULL,NULL,'admin','MO11','Super Admin','created','payments','payment',NULL,'{\"method\":\"POST\",\"path\":\"/api/bills\",\"status\":201}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0',NULL,1,'2026-09-24 14:03:59'),(58,13,NULL,2,'tenant','Little','Tenant','login','auth',NULL,NULL,'{\"result\":\"success\"}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:22:22'),(59,13,NULL,2,'tenant','Little','Tenant','device_registered','app','app',NULL,'{\"method\":\"POST\",\"path\":\"/api/tenants/device/fcm-token\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:22:22'),(60,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:22:23'),(61,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:22:23'),(62,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:22:39'),(63,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:22:39'),(64,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:22:39'),(65,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:22:39'),(66,13,NULL,2,'tenant','Little','Tenant','viewed','bills','bills',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/bill\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:23:03'),(67,13,NULL,2,'tenant','Little','Tenant','viewed','payments','payments',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/history\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:23:03'),(68,13,NULL,2,'tenant','Little','Tenant','viewed','maintenance','maintenance',NULL,'{\"method\":\"GET\",\"path\":\"/api/maintenance/my-requests\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:23:03'),(69,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:23:03'),(70,13,NULL,2,'tenant','Little','Tenant','viewed','feedbacks','feedbacks',NULL,'{\"method\":\"GET\",\"path\":\"/api/feedbacks/status\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:23:03'),(71,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:23:03'),(72,13,NULL,2,'tenant','Little','Tenant','viewed','documents','documents',NULL,'{\"method\":\"GET\",\"path\":\"/api/documents/types\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:23:03'),(73,13,NULL,2,'tenant','Little','Tenant','viewed','maintenance','maintenance',NULL,'{\"method\":\"GET\",\"path\":\"/api/maintenance/my-stats\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:23:03'),(74,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:23:03'),(75,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:23:03'),(76,13,NULL,2,'tenant','Little','Tenant','viewed','documents','documents',NULL,'{\"method\":\"GET\",\"path\":\"/api/documents/my-documents\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:23:03'),(77,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:23:04'),(78,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:23:04'),(79,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:23:04'),(80,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:23:04'),(81,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:23:22'),(82,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:23:23'),(83,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',47,'{\"method\":\"PUT\",\"path\":\"/api/tenant-notifications/47/read\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:23:25'),(84,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:23:25'),(85,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:23:25'),(86,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:23:27'),(87,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:23:27'),(88,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',48,'{\"method\":\"PUT\",\"path\":\"/api/tenant-notifications/48/read\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:23:29'),(89,13,NULL,2,'tenant','Little','Tenant','viewed','bills','bills',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/bill\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:23:29'),(90,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:23:29'),(91,13,NULL,2,'tenant','Little','Tenant','viewed','payments','payments',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/history\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:23:29'),(92,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:23:29'),(93,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:23:29'),(94,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:23:29'),(95,13,NULL,2,'tenant','Little','Tenant','created','payments','payments',NULL,'{\"method\":\"POST\",\"path\":\"/api/tenant-payments/partial-qr\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:24:34'),(96,13,NULL,2,'tenant','Little','Tenant','created','payments','payments',NULL,'{\"method\":\"POST\",\"path\":\"/api/tenant-payments/partial-qr\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:24:43'),(97,13,NULL,2,'tenant','Little','Tenant','created','payments','payments',NULL,'{\"method\":\"POST\",\"path\":\"/api/tenant-payments/partial-qr\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:24:47'),(98,13,NULL,2,'tenant','Little','Tenant','created','payments','payments',NULL,'{\"method\":\"POST\",\"path\":\"/api/tenant-payments/partial-qr\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:26:10'),(99,13,NULL,2,'tenant','Little','Tenant','created','payments','payments',NULL,'{\"method\":\"POST\",\"path\":\"/api/tenant-payments/partial-qr\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:27:08'),(100,13,NULL,2,'tenant','Little','Tenant','created','payments','payments',NULL,'{\"method\":\"POST\",\"path\":\"/api/tenant-payments/proof\",\"status\":201}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:27:41'),(101,13,NULL,2,'tenant','Little','Tenant','viewed','bills','bills',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/bill\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:27:41'),(102,13,NULL,2,'tenant','Little','Tenant','viewed','payments','payments',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/history\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:27:41'),(103,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:27:41'),(104,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:27:41'),(105,13,NULL,2,'tenant','Little','Tenant','viewed','bills','bills',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/bill\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:27:44'),(106,13,NULL,2,'tenant','Little','Tenant','viewed','payments','payments',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/history\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:27:44'),(107,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:27:44'),(108,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:27:44'),(109,13,NULL,2,'tenant','Little','Tenant','created','payments','payments',NULL,'{\"method\":\"POST\",\"path\":\"/api/tenant-payments/partial-qr\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:27:48'),(110,13,NULL,2,'tenant','Little','Tenant','viewed','bills','bills',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/bill\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:27:51'),(111,13,NULL,2,'tenant','Little','Tenant','viewed','payments','payments',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/history\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:27:51'),(112,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:27:51'),(113,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:27:51'),(114,13,NULL,2,'tenant','Little','Tenant','viewed','bills','bills',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/bill\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:27:57'),(115,13,NULL,2,'tenant','Little','Tenant','viewed','payments','payments',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/history\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:27:57'),(116,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:27:57'),(117,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:27:57'),(118,13,NULL,2,'tenant','Little','Tenant','viewed','bills','bills',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/bill\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:28:06'),(119,13,NULL,2,'tenant','Little','Tenant','viewed','payments','payments',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/history\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:28:06'),(120,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:28:06'),(121,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:28:06'),(122,13,NULL,2,'tenant','Little','Tenant','created','payments','payments',NULL,'{\"method\":\"POST\",\"path\":\"/api/tenant-payments/partial-qr\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:29:32'),(123,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:30:28'),(124,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:30:28'),(125,13,NULL,2,'tenant','Little','Tenant','device_registered','app','app',NULL,'{\"method\":\"POST\",\"path\":\"/api/tenants/device/fcm-token\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:30:28'),(126,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:30:28'),(127,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:30:28'),(128,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:30:28'),(129,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:30:29'),(130,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:30:29'),(131,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:30:29'),(132,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread?limit=50\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:30:30'),(133,13,NULL,2,'tenant','Little','Tenant','viewed','bills','bills',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/bill\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:30:32'),(134,13,NULL,2,'tenant','Little','Tenant','viewed','payments','payments',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/history\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:30:32'),(135,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:30:32'),(136,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:30:32'),(137,13,NULL,2,'tenant','Little','Tenant','document_downloaded','payments','payments',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/receipt/proof/6/download?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTMsInJvbGUiOiJ0ZW5hbnQiLCJlbWFpbCI6ImFiZHVsd2FyaXRoc2hlaGUyMDEwQGdtYWlsLmNvbSIsImlhdCI6MTc5MDI1OTc0MiwiZXhwIjoxNzkwODY0NTQyfQ.R8rVd-37dQMFAvzVZiT8N-o80H-s40Y43QYHFj90CjQ\",\"status\":200}','192.168.0.112','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36',NULL,NULL,'2026-09-24 14:30:38'),(138,NULL,NULL,NULL,'admin','MO11','Super Admin','updated','payments','payment',6,'{\"method\":\"PUT\",\"path\":\"/api/bills/payment-proofs/6/verify\",\"status\":200}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0',NULL,1,'2026-09-24 14:33:21'),(139,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:37:01'),(140,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:37:01'),(141,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:37:01'),(142,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:37:01'),(143,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:37:01'),(144,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread?limit=50\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:37:02'),(145,13,NULL,2,'tenant','Little','Tenant','viewed','bills','bills',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/bill\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:37:03'),(146,13,NULL,2,'tenant','Little','Tenant','viewed','payments','payments',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/history\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:37:03'),(147,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:37:03'),(148,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:37:03'),(149,13,NULL,2,'tenant','Little','Tenant','viewed','bills','bills',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/bill\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:37:15'),(150,13,NULL,2,'tenant','Little','Tenant','viewed','payments','payments',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/history\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:37:15'),(151,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:37:15'),(152,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:37:15'),(153,13,NULL,2,'tenant','Little','Tenant','created','payments','payments',NULL,'{\"method\":\"POST\",\"path\":\"/api/tenant-payments/partial-qr\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:37:19'),(154,13,NULL,2,'tenant','Little','Tenant','viewed','maintenance','maintenance',NULL,'{\"method\":\"GET\",\"path\":\"/api/maintenance/my-requests\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:37:56'),(155,13,NULL,2,'tenant','Little','Tenant','viewed','maintenance','maintenance',NULL,'{\"method\":\"GET\",\"path\":\"/api/maintenance/my-stats\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:37:56'),(156,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:37:56'),(157,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:37:56'),(158,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:38:15'),(159,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.112','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-24 14:38:15'),(160,NULL,NULL,NULL,'admin','MO11','Super Admin','created','payments','payment',6,'{\"method\":\"POST\",\"path\":\"/api/bills/6/cash-payment/request-otp\",\"status\":200}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0',NULL,1,'2026-09-24 14:38:49'),(161,NULL,NULL,NULL,'admin','MO11','Super Admin','created','payments','payment',6,'{\"method\":\"POST\",\"path\":\"/api/bills/6/cash-payment/verify\",\"status\":200}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0',NULL,1,'2026-09-24 14:39:10'),(162,NULL,NULL,NULL,'admin','MO11','Super Admin','updated','pgs','pg',2,'{\"method\":\"PUT\",\"path\":\"/api/pgs/2\",\"status\":200}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0',NULL,1,'2026-09-25 14:15:49'),(163,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:30:52'),(164,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:30:52'),(165,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:30:52'),(166,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:30:52'),(167,13,NULL,2,'tenant','Little','Tenant','device_registered','app','app',NULL,'{\"method\":\"POST\",\"path\":\"/api/tenants/device/fcm-token\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:30:52'),(168,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:30:52'),(169,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:30:52'),(170,13,NULL,2,'tenant','Little','Tenant','device_registered','app','app',NULL,'{\"method\":\"POST\",\"path\":\"/api/tenants/device/fcm-token\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:30:54'),(171,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:30:54'),(172,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:30:54'),(173,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread?limit=50\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:30:55'),(174,NULL,NULL,NULL,'admin','MO11','Super Admin','created','payments','payment',NULL,'{\"method\":\"POST\",\"path\":\"/api/bills\",\"status\":201}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0',NULL,1,'2026-09-25 14:35:16'),(175,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:42:00'),(176,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:42:00'),(177,13,NULL,2,'tenant','Little','Tenant','device_registered','app','app',NULL,'{\"method\":\"POST\",\"path\":\"/api/tenants/device/fcm-token\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:42:00'),(178,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:42:00'),(179,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:42:00'),(180,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:42:00'),(181,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:42:00'),(182,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:42:00'),(183,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:42:00'),(184,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread?limit=50\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:42:01'),(185,13,NULL,2,'tenant','Little','Tenant','viewed','bills','bills',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/bill\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:42:14'),(186,13,NULL,2,'tenant','Little','Tenant','viewed','payments','payments',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/history\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:42:14'),(187,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:42:14'),(188,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:42:14'),(189,13,NULL,2,'tenant','Little','Tenant','created','payments','payments',NULL,'{\"method\":\"POST\",\"path\":\"/api/tenant-payments/partial-qr\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:42:22'),(190,13,NULL,2,'tenant','Little','Tenant','created','payments','payments',NULL,'{\"method\":\"POST\",\"path\":\"/api/tenant-payments/partial-qr\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:42:30'),(191,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:43:45'),(192,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:43:45'),(193,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:43:46'),(194,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:43:46'),(195,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:43:46'),(196,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread?limit=50\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:43:46'),(197,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:45:52'),(198,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:45:52'),(199,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:45:52'),(200,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:45:52'),(201,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:45:52'),(202,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread?limit=50\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:45:53'),(203,13,NULL,2,'tenant','Little','Tenant','viewed','bills','bills',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/bill\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:48:02'),(204,13,NULL,2,'tenant','Little','Tenant','viewed','payments','payments',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/history\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:48:02'),(205,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:48:02'),(206,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:48:03'),(207,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:48:46'),(208,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:48:46'),(209,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:48:46'),(210,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:48:46'),(211,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:48:46'),(212,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread?limit=50\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:48:47'),(213,13,NULL,2,'tenant','Little','Tenant','created','payments','payments',NULL,'{\"method\":\"POST\",\"path\":\"/api/tenant-payments/proof\",\"status\":201}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:48:52'),(214,13,NULL,2,'tenant','Little','Tenant','viewed','bills','bills',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/bill\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:48:52'),(215,13,NULL,2,'tenant','Little','Tenant','viewed','payments','payments',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/history\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:48:53'),(216,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:48:53'),(217,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:48:53'),(218,13,NULL,2,'tenant','Little','Tenant','viewed','bills','bills',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/bill\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:48:54'),(219,13,NULL,2,'tenant','Little','Tenant','viewed','payments','payments',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/history\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:48:54'),(220,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:48:54'),(221,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:48:54'),(222,13,NULL,2,'tenant','Little','Tenant','viewed','bills','bills',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/bill\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:49:05'),(223,13,NULL,2,'tenant','Little','Tenant','viewed','payments','payments',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/history\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:49:05'),(224,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:49:05'),(225,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:49:05'),(226,13,NULL,2,'tenant','Little','Tenant','viewed','bills','bills',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/bill\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:49:31'),(227,13,NULL,2,'tenant','Little','Tenant','viewed','payments','payments',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/history\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:49:31'),(228,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:49:31'),(229,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:49:31'),(230,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:49:35'),(231,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:49:35'),(232,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:49:35'),(233,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:49:36'),(234,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:49:36'),(235,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread?limit=50\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:49:36'),(236,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:49:45'),(237,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:49:46'),(238,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:49:46'),(239,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:49:46'),(240,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:49:46'),(241,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread?limit=50\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:49:46'),(242,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:49:54'),(243,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:49:54'),(244,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',52,'{\"method\":\"PUT\",\"path\":\"/api/tenant-notifications/52/read\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:50:00'),(245,13,NULL,2,'tenant','Little','Tenant','viewed','bills','bills',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/bill\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:50:00'),(246,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:50:00'),(247,13,NULL,2,'tenant','Little','Tenant','viewed','payments','payments',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/history\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:50:00'),(248,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:50:00'),(249,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:50:00'),(250,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 14:50:00'),(251,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:00:54'),(252,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:00:54'),(253,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:00:54'),(254,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:00:54'),(255,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:00:54'),(256,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread?limit=50\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:00:55'),(257,13,NULL,2,'tenant','Little','Tenant','viewed','maintenance','maintenance',NULL,'{\"method\":\"GET\",\"path\":\"/api/maintenance/my-requests\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:01:00'),(258,13,NULL,2,'tenant','Little','Tenant','viewed','maintenance','maintenance',NULL,'{\"method\":\"GET\",\"path\":\"/api/maintenance/my-stats\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:01:00'),(259,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:01:00'),(260,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:01:00'),(261,13,NULL,2,'tenant','Little','Tenant','viewed','documents','documents',NULL,'{\"method\":\"GET\",\"path\":\"/api/documents/types\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:01:02'),(262,13,NULL,2,'tenant','Little','Tenant','viewed','documents','documents',NULL,'{\"method\":\"GET\",\"path\":\"/api/documents/my-documents\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:01:02'),(263,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:01:02'),(264,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:01:02'),(265,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:01:03'),(266,13,NULL,2,'tenant','Little','Tenant','viewed','feedbacks','feedbacks',NULL,'{\"method\":\"GET\",\"path\":\"/api/feedbacks/status\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:01:03'),(267,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:01:03'),(268,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:02:12'),(269,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:02:12'),(270,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:02:12'),(271,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:02:12'),(272,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:02:12'),(273,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread?limit=50\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:02:13'),(274,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:02:13'),(275,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:02:13'),(276,13,NULL,2,'tenant','Little','Tenant','viewed','bills','bills',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/bill\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:02:15'),(277,13,NULL,2,'tenant','Little','Tenant','viewed','payments','payments',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/history\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:02:15'),(278,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:02:15'),(279,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:02:15'),(280,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:02:21'),(281,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:02:21'),(282,13,NULL,2,'tenant','Little','Tenant','viewed','bills','bills',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/bill\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:02:23'),(283,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',51,'{\"method\":\"PUT\",\"path\":\"/api/tenant-notifications/51/read\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:02:23'),(284,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:02:23'),(285,13,NULL,2,'tenant','Little','Tenant','viewed','payments','payments',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/history\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:02:23'),(286,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:02:23'),(287,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:02:23'),(288,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:02:23'),(289,13,NULL,2,'tenant','Little','Tenant','document_downloaded','payments','payments',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/receipt/proof/6/download?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTMsInJvbGUiOiJ0ZW5hbnQiLCJlbWFpbCI6ImFiZHVsd2FyaXRoc2hlaGUyMDEwQGdtYWlsLmNvbSIsImlhdCI6MTc5MDI1OTc0MiwiZXhwIjoxNzkwODY0NTQyfQ.R8rVd-37dQMFAvzVZiT8N-o80H-s40Y43QYHFj90CjQ\",\"status\":200}','192.168.0.101','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36',NULL,NULL,'2026-09-25 15:03:18'),(290,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:14:01'),(291,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:14:01'),(292,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:14:01'),(293,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:14:01'),(294,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:14:01'),(295,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread?limit=50\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:14:02'),(296,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:17:47'),(297,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:17:47'),(298,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:17:47'),(299,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:17:47'),(300,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:17:47'),(301,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread?limit=50\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:17:48'),(302,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:20:27'),(303,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:20:27'),(304,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:20:27'),(305,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:20:27'),(306,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:20:27'),(307,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:20:27'),(308,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:20:27'),(309,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:20:27'),(310,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:20:27'),(311,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:20:27'),(312,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread?limit=50\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:20:27'),(313,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:47:30'),(314,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:47:30'),(315,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:47:31'),(316,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:47:31'),(317,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:47:31'),(318,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:47:31'),(319,13,NULL,2,'tenant','Little','Tenant','device_registered','app','app',NULL,'{\"method\":\"POST\",\"path\":\"/api/tenants/device/fcm-token\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:47:31'),(320,13,NULL,2,'tenant','Little','Tenant','device_registered','app','app',NULL,'{\"method\":\"POST\",\"path\":\"/api/tenants/device/fcm-token\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:47:32'),(321,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:47:32'),(322,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:47:32'),(323,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread?limit=50\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:47:33'),(324,13,NULL,2,'tenant','Little','Tenant','viewed','bills','bills',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/bill\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:47:39'),(325,13,NULL,2,'tenant','Little','Tenant','viewed','payments','payments',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/history\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:47:39'),(326,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:47:39'),(327,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:47:39'),(328,13,NULL,2,'tenant','Little','Tenant','viewed','maintenance','maintenance',NULL,'{\"method\":\"GET\",\"path\":\"/api/maintenance/my-requests\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:47:44'),(329,13,NULL,2,'tenant','Little','Tenant','viewed','maintenance','maintenance',NULL,'{\"method\":\"GET\",\"path\":\"/api/maintenance/my-stats\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:47:44'),(330,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:47:44'),(331,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:47:44'),(332,13,NULL,2,'tenant','Little','Tenant','viewed','documents','documents',NULL,'{\"method\":\"GET\",\"path\":\"/api/documents/types\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:47:45'),(333,13,NULL,2,'tenant','Little','Tenant','viewed','documents','documents',NULL,'{\"method\":\"GET\",\"path\":\"/api/documents/my-documents\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:47:45'),(334,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:47:45'),(335,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:47:45'),(336,13,NULL,2,'tenant','Little','Tenant','viewed','feedbacks','feedbacks',NULL,'{\"method\":\"GET\",\"path\":\"/api/feedbacks/status\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:47:46'),(337,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:47:46'),(338,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:47:46'),(339,NULL,NULL,NULL,'admin','MO11','Super Admin','created','messaging','messaging',NULL,'{\"method\":\"POST\",\"path\":\"/api/admin-notifications/send\",\"status\":200}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0',NULL,1,'2026-09-25 15:58:23'),(340,NULL,NULL,NULL,'admin','MO11','Super Admin','updated','payments','payment',7,'{\"method\":\"PUT\",\"path\":\"/api/bills/payment-proofs/7/verify\",\"status\":200}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0',NULL,1,'2026-09-25 15:59:17'),(341,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:59:52'),(342,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:59:52'),(343,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:59:52'),(344,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:59:52'),(345,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:59:52'),(346,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:59:52'),(347,13,NULL,2,'tenant','Little','Tenant','device_registered','app','app',NULL,'{\"method\":\"POST\",\"path\":\"/api/tenants/device/fcm-token\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:59:52'),(348,13,NULL,2,'tenant','Little','Tenant','device_registered','app','app',NULL,'{\"method\":\"POST\",\"path\":\"/api/tenants/device/fcm-token\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:59:52'),(349,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:59:53'),(350,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:59:53'),(351,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread?limit=50\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:59:54'),(352,13,NULL,2,'tenant','Little','Tenant','viewed','bills','bills',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/bill\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:59:58'),(353,13,NULL,2,'tenant','Little','Tenant','viewed','payments','payments',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/history\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:59:58'),(354,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:59:58'),(355,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 15:59:58'),(356,13,NULL,2,'tenant','Little','Tenant','viewed','bills','bills',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/bill\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:00:24'),(357,13,NULL,2,'tenant','Little','Tenant','viewed','payments','payments',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/history\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:00:24'),(358,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:00:24'),(359,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:00:24'),(360,13,NULL,2,'tenant','Little','Tenant','document_downloaded','payments','payments',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/receipt/proof/6/download?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTMsInJvbGUiOiJ0ZW5hbnQiLCJlbWFpbCI6ImFiZHVsd2FyaXRoc2hlaGUyMDEwQGdtYWlsLmNvbSIsImlhdCI6MTc5MDI1OTc0MiwiZXhwIjoxNzkwODY0NTQyfQ.R8rVd-37dQMFAvzVZiT8N-o80H-s40Y43QYHFj90CjQ\",\"status\":304}','192.168.0.101','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36',NULL,NULL,'2026-09-25 16:01:19'),(361,13,NULL,2,'tenant','Little','Tenant','document_downloaded','payments','payments',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/receipt/proof/6/download?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTMsInJvbGUiOiJ0ZW5hbnQiLCJlbWFpbCI6ImFiZHVsd2FyaXRoc2hlaGUyMDEwQGdtYWlsLmNvbSIsImlhdCI6MTc5MDI1OTc0MiwiZXhwIjoxNzkwODY0NTQyfQ.R8rVd-37dQMFAvzVZiT8N-o80H-s40Y43QYHFj90CjQ\",\"status\":200}','192.168.0.101','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36',NULL,NULL,'2026-09-25 16:01:19'),(362,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:01:27'),(363,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:01:27'),(364,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:01:27'),(365,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:01:27'),(366,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:01:28'),(367,13,NULL,2,'tenant','Little','Tenant','document_downloaded','payments','payments',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/receipt/cash/1/download?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTMsInJvbGUiOiJ0ZW5hbnQiLCJlbWFpbCI6ImFiZHVsd2FyaXRoc2hlaGUyMDEwQGdtYWlsLmNvbSIsImlhdCI6MTc5MDI1OTc0MiwiZXhwIjoxNzkwODY0NTQyfQ.R8rVd-37dQMFAvzVZiT8N-o80H-s40Y43QYHFj90CjQ\",\"status\":200}','192.168.0.101','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36',NULL,NULL,'2026-09-25 16:01:28'),(368,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread?limit=50\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:01:29'),(369,NULL,NULL,NULL,'admin','MO11','Super Admin','created','tenants','tenant',NULL,'{\"method\":\"POST\",\"path\":\"/api/tenants\",\"status\":201}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0',NULL,1,'2026-09-25 16:05:56'),(370,NULL,NULL,NULL,'admin','MO11','Super Admin','updated','tenants','tenant',14,'{\"method\":\"PUT\",\"path\":\"/api/tenants/14\",\"status\":200}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0',NULL,1,'2026-09-25 16:06:39'),(371,NULL,NULL,NULL,'admin','MO11','Super Admin','created','payments','payment',NULL,'{\"method\":\"POST\",\"path\":\"/api/bills\",\"status\":201}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0',NULL,1,'2026-09-25 16:08:25'),(372,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:09:16'),(373,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:09:16'),(374,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:09:16'),(375,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:09:16'),(376,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:09:16'),(377,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:09:16'),(378,13,NULL,2,'tenant','Little','Tenant','device_registered','app','app',NULL,'{\"method\":\"POST\",\"path\":\"/api/tenants/device/fcm-token\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:09:17'),(379,13,NULL,2,'tenant','Little','Tenant','device_registered','app','app',NULL,'{\"method\":\"POST\",\"path\":\"/api/tenants/device/fcm-token\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:09:17'),(380,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:09:17'),(381,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:09:17'),(382,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread?limit=50\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:09:18'),(383,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:09:21'),(384,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:09:21'),(385,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"PUT\",\"path\":\"/api/tenant-notifications/read-all\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:09:23'),(386,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:09:23'),(387,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:09:23'),(388,13,NULL,2,'tenant','Little','Tenant','viewed','bills','bills',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/bill\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:09:25'),(389,13,NULL,2,'tenant','Little','Tenant','viewed','payments','payments',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/history\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:09:25'),(390,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:09:25'),(391,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:09:25'),(392,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:09:45'),(393,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:09:45'),(394,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:09:45'),(395,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:09:46'),(396,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:09:46'),(397,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread?limit=50\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:09:46'),(398,13,NULL,2,'tenant','Little','Tenant','created','payments','payments',NULL,'{\"method\":\"POST\",\"path\":\"/api/tenant-payments/proof\",\"status\":201}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:10:23'),(399,13,NULL,2,'tenant','Little','Tenant','viewed','bills','bills',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/bill\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:10:23'),(400,13,NULL,2,'tenant','Little','Tenant','viewed','payments','payments',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/history\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:10:23'),(401,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:10:23'),(402,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:10:23'),(403,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:11:12'),(404,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:11:12'),(405,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:11:12'),(406,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:11:12'),(407,NULL,NULL,NULL,'admin','MO11','Super Admin','updated','payments','payment',8,'{\"method\":\"PUT\",\"path\":\"/api/bills/payment-proofs/8/verify\",\"status\":200}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0',NULL,1,'2026-09-25 16:11:12'),(408,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:11:12'),(409,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:11:12'),(410,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:11:12'),(411,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:11:12'),(412,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:11:12'),(413,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:11:12'),(414,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:11:12'),(415,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:11:12'),(416,13,NULL,2,'tenant','Little','Tenant','viewed','bills','bills',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/bill\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:11:34'),(417,13,NULL,2,'tenant','Little','Tenant','viewed','payments','payments',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/history\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:11:34'),(418,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:11:34'),(419,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:11:34'),(420,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:11:37'),(421,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:11:37'),(422,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:11:37'),(423,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:11:37'),(424,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:11:38'),(425,13,NULL,2,'tenant','Little','Tenant','viewed','bills','bills',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/bill\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:11:39'),(426,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread?limit=50\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:11:39'),(427,13,NULL,2,'tenant','Little','Tenant','viewed','payments','payments',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/history\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:11:39'),(428,13,NULL,2,'tenant','Little','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:11:39'),(429,13,NULL,2,'tenant','Little','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:11:39'),(430,13,NULL,2,'tenant','Little','Tenant','device_deactivated','app','app',NULL,'{\"method\":\"DELETE\",\"path\":\"/api/tenants/device/fcm-token\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:11:50'),(431,14,NULL,2,'tenant','MO11','Tenant','login','auth',NULL,NULL,'{\"result\":\"success\"}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:12:26'),(432,14,NULL,2,'tenant','MO11','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:12:26'),(433,14,NULL,2,'tenant','MO11','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:12:26'),(434,14,NULL,2,'tenant','MO11','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:12:44'),(435,14,NULL,2,'tenant','MO11','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:12:44'),(436,14,NULL,2,'tenant','MO11','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:12:44'),(437,14,NULL,2,'tenant','MO11','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:12:44'),(438,14,NULL,2,'tenant','MO11','Tenant','viewed','bills','bills',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/bill\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:12:47'),(439,14,NULL,2,'tenant','MO11','Tenant','viewed','payments','payments',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-payments/history\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:12:47'),(440,14,NULL,2,'tenant','MO11','Tenant','notification_read','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications/unread/count\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:12:47'),(441,14,NULL,2,'tenant','MO11','Tenant','viewed','notifications','notifications',NULL,'{\"method\":\"GET\",\"path\":\"/api/tenant-notifications?limit=100&offset=0\",\"status\":200}','192.168.0.101','Dart/3.10 (dart:io)',NULL,NULL,'2026-09-25 16:12:47'),(442,NULL,NULL,NULL,'admin','MO11','Super Admin','updated','tenants','tenant',14,'{\"method\":\"PUT\",\"path\":\"/api/tenants/14\",\"status\":200}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0',NULL,1,'2026-09-25 16:44:29'),(443,NULL,NULL,NULL,'admin','MO11','Super Admin','updated','tenants','tenant',13,'{\"method\":\"PUT\",\"path\":\"/api/tenants/13\",\"status\":200}','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 Edg/153.0.0.0',NULL,1,'2026-09-25 16:45:35');
/*!40000 ALTER TABLE `activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_notification_logs`
--

DROP TABLE IF EXISTS `admin_notification_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_notification_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `admin_id` int(11) NOT NULL,
  `recipient_type` enum('individual','pg','all') NOT NULL,
  `recipient_count` int(11) NOT NULL DEFAULT 0,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `send_push` tinyint(1) DEFAULT 1,
  `send_email` tinyint(1) DEFAULT 0,
  `sent_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_admin_notification_logs_admin_id` (`admin_id`),
  KEY `idx_admin_notification_logs_sent_at` (`sent_at`),
  KEY `idx_admin_notification_logs_recipient_type` (`recipient_type`),
  CONSTRAINT `fk_admin_notification_logs_admin_id` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_notification_logs`
--

LOCK TABLES `admin_notification_logs` WRITE;
/*!40000 ALTER TABLE `admin_notification_logs` DISABLE KEYS */;
INSERT INTO `admin_notification_logs` VALUES (1,1,'individual',1,'Nakupa Hi','Mr. Manyama Hi',1,0,'2026-09-25 21:28:23');
/*!40000 ALTER TABLE `admin_notification_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_notifications`
--

DROP TABLE IF EXISTS `admin_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `admin_id` int(11) NOT NULL COMMENT 'Admin who receives the notification',
  `type` varchar(50) NOT NULL COMMENT 'tenant_expiry, bill_payment, guest_register, etc.',
  `title` varchar(255) NOT NULL COMMENT 'Short title',
  `message` text NOT NULL COMMENT 'Notification message',
  `entity_id` int(11) DEFAULT NULL COMMENT 'Related entity ID (tenant_id, bill_id, etc.)',
  `entity_type` varchar(50) DEFAULT NULL COMMENT 'tenant, bill, guest, pg, etc.',
  `link` varchar(500) DEFAULT NULL COMMENT 'Frontend URL to navigate to',
  `icon` varchar(50) DEFAULT NULL COMMENT 'Icon class or name',
  `color` varchar(20) DEFAULT NULL COMMENT 'Color code for the notification',
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `read_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_admin_id` (`admin_id`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_admin_notifications_admin_id` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=287 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_notifications`
--

LOCK TABLES `admin_notifications` WRITE;
/*!40000 ALTER TABLE `admin_notifications` DISABLE KEYS */;
INSERT INTO `admin_notifications` VALUES (1,1,'pg_created','New PG Created','PG \"Alishan PG\" has been created',1,'pg','/pgs/1','?','#2ecc71',1,'2026-08-22 08:10:47','2026-08-22 13:55:59'),(2,1,'pg_created','New PG Created','PG \"Happy Living PG\" has been created',2,'pg','/pgs/2','?','#2ecc71',1,'2026-08-22 08:15:54','2026-08-22 13:55:59'),(3,1,'pg_created','New PG Created','PG \"DS Apartment\" has been created',3,'pg','/pgs/3','?','#2ecc71',1,'2026-08-22 08:17:48','2026-08-22 13:55:59'),(4,1,'pg_created','New PG Created','PG \"J T House (Plot No :- 257)\" has been created',4,'pg','/pgs/4','?','#2ecc71',1,'2026-08-22 08:20:08','2026-08-22 13:55:59'),(5,1,'pg_created','New PG Created','PG \"Shree Shyam Apartment\" has been created',5,'pg','/pgs/5','?','#2ecc71',1,'2026-08-22 08:21:22','2026-08-22 13:55:59'),(6,1,'pg_created','New PG Created','PG \"Royal Suits ( (Plot No :- 103,104)\" has been created',6,'pg','/pgs/6','?','#2ecc71',1,'2026-08-22 08:23:59','2026-08-22 13:55:59'),(7,1,'pg_created','New PG Created','PG \"Mannat Apartment (Plot No :- 99)\" has been created',7,'pg','/pgs/7','?','#2ecc71',1,'2026-08-22 08:25:49','2026-08-22 13:55:59'),(8,1,'tenant_registered','New Tenant Registered','Mohammed Aminu Shehe has been registered as a tenant',1,'tenant','/tenants/1','?','#2ecc71',1,'2026-08-22 10:26:54','2026-08-23 05:31:01'),(9,1,'feedback_submitted','New Feedback Received','Mohammed Aminu Shehe gave 10.0/10 rating for Happy Living PG',1,'feedback','/feedbacks/1','⭐','#f39c12',1,'2026-08-22 11:24:24','2026-08-23 05:31:01'),(10,1,'admin_created','New Admin Created','Admin \"Animesh\" has been created',3,'admin','/admins/3','?‍?','#3498db',1,'2026-08-22 16:13:56','2026-08-23 05:31:01'),(11,2,'admin_created','New Admin Created','Admin \"Animesh\" has been created',3,'admin','/admins/3','?‍?','#3498db',1,'2026-08-22 16:13:56','2026-08-22 22:10:36'),(12,1,'tenant_registered','New Tenant Registered','Sri Ram has been registered as a tenant',6,'tenant','/tenants/6','?','#2ecc71',1,'2026-08-22 16:48:25','2026-08-23 05:31:01'),(13,2,'tenant_registered','New Tenant Registered','Sri Ram has been registered as a tenant',6,'tenant','/tenants/6','?','#2ecc71',1,'2026-08-22 16:48:25','2026-08-24 13:42:59'),(15,1,'admin_created','New Admin Created','Admin \"Animesh\" has been created',4,'admin','/admins/4','?‍?','#3498db',1,'2026-08-22 16:51:31','2026-08-23 05:31:01'),(16,2,'admin_created','New Admin Created','Admin \"Animesh\" has been created',4,'admin','/admins/4','?‍?','#3498db',1,'2026-08-22 16:51:31','2026-08-24 13:42:59'),(17,1,'maintenance_created','New Maintenance Request','Sri Ram requested Electrician for Room 201',1,'maintenance','/maintenance/1','?','#3498db',1,'2026-08-22 16:53:21','2026-08-23 05:31:01'),(18,2,'maintenance_created','New Maintenance Request','Sri Ram requested Electrician for Room 201',1,'maintenance','/maintenance/1','?','#3498db',1,'2026-08-22 16:53:21','2026-08-24 13:42:59'),(19,4,'maintenance_created','New Maintenance Request','Sri Ram requested Electrician for Room 201',1,'maintenance','/maintenance/1','?','#3498db',0,'2026-08-22 16:53:21',NULL),(20,1,'maintenance_updated','Maintenance Request Started','Electrician request for Room 201 is now in_progress',1,'maintenance','/maintenance/1','?','#f39c12',1,'2026-08-22 16:55:41','2026-08-23 05:31:01'),(21,2,'maintenance_updated','Maintenance Request Started','Electrician request for Room 201 is now in_progress',1,'maintenance','/maintenance/1','?','#f39c12',1,'2026-08-22 16:55:41','2026-08-24 13:42:59'),(22,4,'maintenance_updated','Maintenance Request Started','Electrician request for Room 201 is now in_progress',1,'maintenance','/maintenance/1','?','#f39c12',0,'2026-08-22 16:55:41',NULL),(23,1,'tenant_registered','New Tenant Registered','Mohammed Aminu Shehe has been registered as a tenant',7,'tenant','/tenants/7','?','#2ecc71',1,'2026-08-22 18:32:54','2026-08-23 05:33:07'),(24,2,'tenant_registered','New Tenant Registered','Mohammed Aminu Shehe has been registered as a tenant',7,'tenant','/tenants/7','?','#2ecc71',1,'2026-08-22 18:32:54','2026-08-24 13:42:59'),(25,4,'tenant_registered','New Tenant Registered','Mohammed Aminu Shehe has been registered as a tenant',7,'tenant','/tenants/7','?','#2ecc71',0,'2026-08-22 18:32:54',NULL),(26,1,'tenant_registered','New Tenant Registered','Abdul-Warith Aminu has been registered as a tenant',8,'tenant','/tenants/8','?','#2ecc71',1,'2026-08-22 18:35:36','2026-08-23 05:36:00'),(27,2,'tenant_registered','New Tenant Registered','Abdul-Warith Aminu has been registered as a tenant',8,'tenant','/tenants/8','?','#2ecc71',1,'2026-08-22 18:35:36','2026-08-24 13:42:59'),(28,4,'tenant_registered','New Tenant Registered','Abdul-Warith Aminu has been registered as a tenant',8,'tenant','/tenants/8','?','#2ecc71',0,'2026-08-22 18:35:36',NULL),(29,1,'guest_registered','New Guest Registered','Kinjili has been registered as a guest',9,'guest','/tenants/9','?','#1abc9c',1,'2026-08-22 18:37:26','2026-08-23 05:38:29'),(30,2,'guest_registered','New Guest Registered','Kinjili has been registered as a guest',9,'guest','/tenants/9','?','#1abc9c',1,'2026-08-22 18:37:26','2026-08-24 13:42:59'),(31,4,'guest_registered','New Guest Registered','Kinjili has been registered as a guest',9,'guest','/tenants/9','?','#1abc9c',0,'2026-08-22 18:37:26',NULL),(32,1,'admin_created','New Admin Created','Admin \"Mohammed Aminu Shehe\" has been created',5,'admin','/admins/5','?‍?','#3498db',1,'2026-08-22 18:38:06','2026-08-23 05:38:29'),(33,2,'admin_created','New Admin Created','Admin \"Mohammed Aminu Shehe\" has been created',5,'admin','/admins/5','?‍?','#3498db',1,'2026-08-22 18:38:06','2026-08-24 13:42:59'),(34,1,'feedback_submitted','New Feedback Received','Abdul-Warith Aminu gave 9.8/10 rating for Happy Living PG',2,'feedback','/feedbacks/2','⭐','#f39c12',1,'2026-08-22 19:33:54','2026-08-23 06:40:31'),(35,2,'feedback_submitted','New Feedback Received','Abdul-Warith Aminu gave 9.8/10 rating for Happy Living PG',2,'feedback','/feedbacks/2','⭐','#f39c12',1,'2026-08-22 19:33:54','2026-08-24 13:42:59'),(36,4,'feedback_submitted','New Feedback Received','Abdul-Warith Aminu gave 9.8/10 rating for Happy Living PG',2,'feedback','/feedbacks/2','⭐','#f39c12',0,'2026-08-22 19:33:54',NULL),(38,1,'maintenance_created','New Maintenance Request','Abdul-Warith Aminu requested Electrician for Room 101',2,'maintenance','/maintenance/2','?','#3498db',1,'2026-08-22 19:35:11','2026-08-23 06:40:31'),(39,2,'maintenance_created','New Maintenance Request','Abdul-Warith Aminu requested Electrician for Room 101',2,'maintenance','/maintenance/2','?','#3498db',1,'2026-08-22 19:35:11','2026-08-24 13:42:59'),(40,4,'maintenance_created','New Maintenance Request','Abdul-Warith Aminu requested Electrician for Room 101',2,'maintenance','/maintenance/2','?','#3498db',0,'2026-08-22 19:35:11',NULL),(42,1,'maintenance_created','New Maintenance Request','Abdul-Warith Aminu requested Cleaning for Room 101',3,'maintenance','/maintenance/3','?','#3498db',1,'2026-08-22 19:35:55','2026-08-23 06:40:31'),(43,2,'maintenance_created','New Maintenance Request','Abdul-Warith Aminu requested Cleaning for Room 101',3,'maintenance','/maintenance/3','?','#3498db',1,'2026-08-22 19:35:55','2026-08-24 13:42:59'),(44,4,'maintenance_created','New Maintenance Request','Abdul-Warith Aminu requested Cleaning for Room 101',3,'maintenance','/maintenance/3','?','#3498db',0,'2026-08-22 19:35:55',NULL),(46,1,'maintenance_created','New Maintenance Request','Abdul-Warith Aminu requested Check-out for Room 101',4,'maintenance','/maintenance/4','?','#3498db',1,'2026-08-22 19:36:14','2026-08-23 06:40:31'),(47,2,'maintenance_created','New Maintenance Request','Abdul-Warith Aminu requested Check-out for Room 101',4,'maintenance','/maintenance/4','?','#3498db',1,'2026-08-22 19:36:14','2026-08-24 13:42:59'),(48,4,'maintenance_created','New Maintenance Request','Abdul-Warith Aminu requested Check-out for Room 101',4,'maintenance','/maintenance/4','?','#3498db',0,'2026-08-22 19:36:14',NULL),(50,1,'maintenance_updated','Maintenance Request Started','Check-out request for Room 101 is now in_progress',4,'maintenance','/maintenance/4','?','#f39c12',1,'2026-08-22 19:40:59','2026-08-23 06:43:22'),(51,2,'maintenance_updated','Maintenance Request Started','Check-out request for Room 101 is now in_progress',4,'maintenance','/maintenance/4','?','#f39c12',1,'2026-08-22 19:40:59','2026-08-24 13:42:59'),(52,4,'maintenance_updated','Maintenance Request Started','Check-out request for Room 101 is now in_progress',4,'maintenance','/maintenance/4','?','#f39c12',0,'2026-08-22 19:40:59',NULL),(54,1,'maintenance_updated','Maintenance Request Started','Cleaning request for Room 101 is now in_progress',3,'maintenance','/maintenance/3','?','#f39c12',1,'2026-08-22 19:41:28','2026-08-23 06:43:22'),(55,2,'maintenance_updated','Maintenance Request Started','Cleaning request for Room 101 is now in_progress',3,'maintenance','/maintenance/3','?','#f39c12',1,'2026-08-22 19:41:28','2026-08-24 13:42:59'),(56,4,'maintenance_updated','Maintenance Request Started','Cleaning request for Room 101 is now in_progress',3,'maintenance','/maintenance/3','?','#f39c12',0,'2026-08-22 19:41:28',NULL),(58,1,'maintenance_updated','Maintenance Request Started','Electrician request for Room 101 is now in_progress',2,'maintenance','/maintenance/2','?','#f39c12',1,'2026-08-22 19:41:32','2026-08-23 06:43:22'),(59,2,'maintenance_updated','Maintenance Request Started','Electrician request for Room 101 is now in_progress',2,'maintenance','/maintenance/2','?','#f39c12',1,'2026-08-22 19:41:32','2026-08-24 13:42:59'),(60,4,'maintenance_updated','Maintenance Request Started','Electrician request for Room 101 is now in_progress',2,'maintenance','/maintenance/2','?','#f39c12',0,'2026-08-22 19:41:32',NULL),(62,1,'maintenance_updated','Maintenance Request Completed','Electrician request for Room 201 is now completed',1,'maintenance','/maintenance/1','?','#f39c12',1,'2026-08-22 19:41:35','2026-08-23 06:43:22'),(63,2,'maintenance_updated','Maintenance Request Completed','Electrician request for Room 201 is now completed',1,'maintenance','/maintenance/1','?','#f39c12',1,'2026-08-22 19:41:35','2026-08-24 13:42:59'),(64,4,'maintenance_updated','Maintenance Request Completed','Electrician request for Room 201 is now completed',1,'maintenance','/maintenance/1','?','#f39c12',0,'2026-08-22 19:41:35',NULL),(66,1,'maintenance_updated','Maintenance Request Completed','Electrician request for Room 101 is now completed',2,'maintenance','/maintenance/2','?','#f39c12',1,'2026-08-22 19:41:36','2026-08-23 06:43:22'),(67,2,'maintenance_updated','Maintenance Request Completed','Electrician request for Room 101 is now completed',2,'maintenance','/maintenance/2','?','#f39c12',1,'2026-08-22 19:41:36','2026-08-24 13:42:59'),(68,4,'maintenance_updated','Maintenance Request Completed','Electrician request for Room 101 is now completed',2,'maintenance','/maintenance/2','?','#f39c12',0,'2026-08-22 19:41:36',NULL),(70,1,'maintenance_updated','Maintenance Request Completed','Cleaning request for Room 101 is now completed',3,'maintenance','/maintenance/3','?','#f39c12',1,'2026-08-22 19:41:37','2026-08-23 06:43:22'),(71,2,'maintenance_updated','Maintenance Request Completed','Cleaning request for Room 101 is now completed',3,'maintenance','/maintenance/3','?','#f39c12',1,'2026-08-22 19:41:37','2026-08-24 13:42:59'),(72,4,'maintenance_updated','Maintenance Request Completed','Cleaning request for Room 101 is now completed',3,'maintenance','/maintenance/3','?','#f39c12',0,'2026-08-22 19:41:37',NULL),(74,1,'maintenance_updated','Maintenance Request Completed','Check-out request for Room 101 is now completed',4,'maintenance','/maintenance/4','?','#f39c12',1,'2026-08-22 19:41:38','2026-08-23 06:43:22'),(75,2,'maintenance_updated','Maintenance Request Completed','Check-out request for Room 101 is now completed',4,'maintenance','/maintenance/4','?','#f39c12',1,'2026-08-22 19:41:38','2026-08-24 13:42:59'),(76,4,'maintenance_updated','Maintenance Request Completed','Check-out request for Room 101 is now completed',4,'maintenance','/maintenance/4','?','#f39c12',0,'2026-08-22 19:41:38',NULL),(78,1,'bill_created','New Bill Generated','Bill of ₹13190.00 created for undefined',1,'bill','/bills/1','?','#3498db',1,'2026-08-22 19:44:07','2026-08-23 06:47:02'),(79,2,'bill_created','New Bill Generated','Bill of ₹13190.00 created for undefined',1,'bill','/bills/1','?','#3498db',1,'2026-08-22 19:44:07','2026-08-24 13:42:59'),(80,4,'bill_created','New Bill Generated','Bill of ₹13190.00 created for undefined',1,'bill','/bills/1','?','#3498db',0,'2026-08-22 19:44:07',NULL),(82,1,'admin_created','New Admin Created','Admin \"Mohammed Aminu Shehe\" has been created',6,'admin','/admins/6','?‍?','#3498db',1,'2026-08-22 20:14:55','2026-08-23 08:55:01'),(83,2,'admin_created','New Admin Created','Admin \"Mohammed Aminu Shehe\" has been created',6,'admin','/admins/6','?‍?','#3498db',1,'2026-08-22 20:14:55','2026-08-24 13:42:59'),(84,1,'bill_created','New Bill Generated','Bill of ₹14200.00 created for undefined',2,'bill','/bills/2','?','#3498db',1,'2026-08-22 21:20:24','2026-08-23 08:55:01'),(85,2,'bill_created','New Bill Generated','Bill of ₹14200.00 created for undefined',2,'bill','/bills/2','?','#3498db',1,'2026-08-22 21:20:24','2026-08-24 13:42:59'),(86,4,'bill_created','New Bill Generated','Bill of ₹14200.00 created for undefined',2,'bill','/bills/2','?','#3498db',0,'2026-08-22 21:20:24',NULL),(89,1,'bill_created','New Bill Generated','Bill of ₹11800.00 created for undefined',3,'bill','/bills/3','?','#3498db',1,'2026-08-22 21:24:12','2026-08-23 08:55:01'),(90,2,'bill_created','New Bill Generated','Bill of ₹11800.00 created for undefined',3,'bill','/bills/3','?','#3498db',1,'2026-08-22 21:24:12','2026-08-24 13:42:59'),(91,4,'bill_created','New Bill Generated','Bill of ₹11800.00 created for undefined',3,'bill','/bills/3','?','#3498db',0,'2026-08-22 21:24:12',NULL),(94,1,'payment_proof_submitted','New Payment Proof Submitted','Mohammed Aminu Shehe submitted a payment proof of ₹11000.0',2,'payment_proof','/bills/payment-proofs/2','?','#3498db',1,'2026-08-22 21:54:07','2026-08-23 08:55:01'),(95,2,'payment_proof_submitted','New Payment Proof Submitted','Mohammed Aminu Shehe submitted a payment proof of ₹11000.0',2,'payment_proof','/bills/payment-proofs/2','?','#3498db',1,'2026-08-22 21:54:07','2026-08-24 13:42:59'),(96,4,'payment_proof_submitted','New Payment Proof Submitted','Mohammed Aminu Shehe submitted a payment proof of ₹11000.0',2,'payment_proof','/bills/payment-proofs/2','?','#3498db',0,'2026-08-22 21:54:07',NULL),(99,1,'payment_proof_submitted','New Payment Proof Submitted','Mohammed Aminu Shehe submitted a payment proof of ₹800.0',3,'payment_proof','/bills/payment-proofs/3','?','#3498db',1,'2026-08-22 21:56:12','2026-08-23 08:57:48'),(100,2,'payment_proof_submitted','New Payment Proof Submitted','Mohammed Aminu Shehe submitted a payment proof of ₹800.0',3,'payment_proof','/bills/payment-proofs/3','?','#3498db',1,'2026-08-22 21:56:12','2026-08-24 13:42:59'),(101,4,'payment_proof_submitted','New Payment Proof Submitted','Mohammed Aminu Shehe submitted a payment proof of ₹800.0',3,'payment_proof','/bills/payment-proofs/3','?','#3498db',0,'2026-08-22 21:56:12',NULL),(104,1,'payment_proof_submitted','New Payment Proof Submitted','Mohammed Aminu Shehe submitted a payment proof of ₹800.0',4,'payment_proof','/bills/payment-proofs/4','?','#3498db',1,'2026-08-22 21:58:09','2026-08-23 09:05:33'),(105,2,'payment_proof_submitted','New Payment Proof Submitted','Mohammed Aminu Shehe submitted a payment proof of ₹800.0',4,'payment_proof','/bills/payment-proofs/4','?','#3498db',1,'2026-08-22 21:58:09','2026-08-24 13:42:59'),(106,4,'payment_proof_submitted','New Payment Proof Submitted','Mohammed Aminu Shehe submitted a payment proof of ₹800.0',4,'payment_proof','/bills/payment-proofs/4','?','#3498db',0,'2026-08-22 21:58:09',NULL),(109,1,'bill_created','New Bill Generated','Bill of ₹11000.00 created for Mohammed Aminu Shehe',4,'bill','/bills/4','?','#3498db',1,'2026-08-22 22:02:08','2026-08-23 09:02:27'),(110,2,'bill_created','New Bill Generated','Bill of ₹11000.00 created for Mohammed Aminu Shehe',4,'bill','/bills/4','?','#3498db',1,'2026-08-22 22:02:08','2026-08-24 13:42:59'),(111,4,'bill_created','New Bill Generated','Bill of ₹11000.00 created for Mohammed Aminu Shehe',4,'bill','/bills/4','?','#3498db',0,'2026-08-22 22:02:08',NULL),(114,1,'tenant_registered','New Tenant Registered','Collins Mark has been registered as a tenant',10,'tenant','/tenants/10','?','#2ecc71',1,'2026-08-23 06:33:58','2026-08-23 18:07:25'),(115,2,'tenant_registered','New Tenant Registered','Collins Mark has been registered as a tenant',10,'tenant','/tenants/10','?','#2ecc71',1,'2026-08-23 06:33:58','2026-08-24 13:42:59'),(116,4,'tenant_registered','New Tenant Registered','Collins Mark has been registered as a tenant',10,'tenant','/tenants/10','?','#2ecc71',0,'2026-08-23 06:33:58',NULL),(119,1,'feedback_submitted','New Feedback Received','Collins Mark gave 9.5/10 rating for Happy Living PG',3,'feedback','/feedbacks/3','⭐','#f39c12',1,'2026-08-23 07:01:35','2026-08-23 18:07:25'),(120,2,'feedback_submitted','New Feedback Received','Collins Mark gave 9.5/10 rating for Happy Living PG',3,'feedback','/feedbacks/3','⭐','#f39c12',1,'2026-08-23 07:01:35','2026-08-24 13:42:59'),(121,4,'feedback_submitted','New Feedback Received','Collins Mark gave 9.5/10 rating for Happy Living PG',3,'feedback','/feedbacks/3','⭐','#f39c12',0,'2026-08-23 07:01:35',NULL),(124,1,'bill_created','New Bill Generated','Bill of ₹13900.00 created for Collins Mark',5,'bill','/bills/5','?','#3498db',1,'2026-08-23 07:10:20','2026-08-23 18:30:56'),(125,2,'bill_created','New Bill Generated','Bill of ₹13900.00 created for Collins Mark',5,'bill','/bills/5','?','#3498db',1,'2026-08-23 07:10:20','2026-08-24 13:42:59'),(126,4,'bill_created','New Bill Generated','Bill of ₹13900.00 created for Collins Mark',5,'bill','/bills/5','?','#3498db',0,'2026-08-23 07:10:20',NULL),(129,1,'payment_proof_submitted','New Payment Proof Submitted','Collins Mark submitted a payment proof of ₹13900.0',5,'payment_proof','/bills/payment-proofs/5','?','#3498db',1,'2026-08-23 07:15:08','2026-08-23 18:30:56'),(130,2,'payment_proof_submitted','New Payment Proof Submitted','Collins Mark submitted a payment proof of ₹13900.0',5,'payment_proof','/bills/payment-proofs/5','?','#3498db',1,'2026-08-23 07:15:08','2026-08-24 13:42:59'),(131,4,'payment_proof_submitted','New Payment Proof Submitted','Collins Mark submitted a payment proof of ₹13900.0',5,'payment_proof','/bills/payment-proofs/5','?','#3498db',0,'2026-08-23 07:15:08',NULL),(134,1,'tenant_registered','New Tenant Registered','Avinash Kumar has been registered as a tenant',11,'tenant','/tenants/11','?','#2ecc71',1,'2026-08-23 12:44:04','2026-08-24 20:35:56'),(135,2,'tenant_registered','New Tenant Registered','Avinash Kumar has been registered as a tenant',11,'tenant','/tenants/11','?','#2ecc71',1,'2026-08-23 12:44:04','2026-08-24 13:42:59'),(136,4,'tenant_registered','New Tenant Registered','Avinash Kumar has been registered as a tenant',11,'tenant','/tenants/11','?','#2ecc71',0,'2026-08-23 12:44:04',NULL),(139,1,'tenant_registered','New Tenant Registered','Avinash has been registered as a tenant',12,'tenant','/tenants/12','?','#2ecc71',1,'2026-08-23 12:48:56','2026-08-24 20:35:56'),(140,2,'tenant_registered','New Tenant Registered','Avinash has been registered as a tenant',12,'tenant','/tenants/12','?','#2ecc71',1,'2026-08-23 12:48:56','2026-08-24 13:42:59'),(141,4,'tenant_registered','New Tenant Registered','Avinash has been registered as a tenant',12,'tenant','/tenants/12','?','#2ecc71',0,'2026-08-23 12:48:56',NULL),(144,1,'maintenance_created','New Maintenance Request','Avinash requested Others for Room 202',5,'maintenance','/maintenance/5','?','#3498db',1,'2026-08-23 13:00:42','2026-08-24 20:35:56'),(145,2,'maintenance_created','New Maintenance Request','Avinash requested Others for Room 202',5,'maintenance','/maintenance/5','?','#3498db',1,'2026-08-23 13:00:42','2026-08-24 13:42:59'),(146,4,'maintenance_created','New Maintenance Request','Avinash requested Others for Room 202',5,'maintenance','/maintenance/5','?','#3498db',0,'2026-08-23 13:00:42',NULL),(149,1,'maintenance_created','New Maintenance Request','Mohammed Aminu Shehe requested Electrician for Room 402',6,'maintenance','/maintenance/6','?','#3498db',1,'2026-08-23 13:04:10','2026-08-24 20:35:56'),(150,2,'maintenance_created','New Maintenance Request','Mohammed Aminu Shehe requested Electrician for Room 402',6,'maintenance','/maintenance/6','?','#3498db',1,'2026-08-23 13:04:10','2026-08-24 13:42:59'),(151,4,'maintenance_created','New Maintenance Request','Mohammed Aminu Shehe requested Electrician for Room 402',6,'maintenance','/maintenance/6','?','#3498db',0,'2026-08-23 13:04:10',NULL),(154,1,'maintenance_updated','Maintenance Request Started','Others request for Room 202 is now in_progress',5,'maintenance','/maintenance/5','?','#f39c12',1,'2026-08-23 13:04:27','2026-08-24 20:35:56'),(155,2,'maintenance_updated','Maintenance Request Started','Others request for Room 202 is now in_progress',5,'maintenance','/maintenance/5','?','#f39c12',1,'2026-08-23 13:04:27','2026-08-24 13:42:59'),(156,4,'maintenance_updated','Maintenance Request Started','Others request for Room 202 is now in_progress',5,'maintenance','/maintenance/5','?','#f39c12',0,'2026-08-23 13:04:27',NULL),(159,1,'maintenance_updated','Maintenance Request Started','Electrician request for Room 402 is now in_progress',6,'maintenance','/maintenance/6','?','#f39c12',1,'2026-08-23 13:04:39','2026-08-24 20:35:56'),(160,2,'maintenance_updated','Maintenance Request Started','Electrician request for Room 402 is now in_progress',6,'maintenance','/maintenance/6','?','#f39c12',1,'2026-08-23 13:04:39','2026-08-24 13:42:59'),(161,4,'maintenance_updated','Maintenance Request Started','Electrician request for Room 402 is now in_progress',6,'maintenance','/maintenance/6','?','#f39c12',0,'2026-08-23 13:04:39',NULL),(164,1,'maintenance_updated','Maintenance Request Completed','Others request for Room 202 is now completed',5,'maintenance','/maintenance/5','?','#f39c12',1,'2026-08-23 13:04:51','2026-08-24 20:35:56'),(165,2,'maintenance_updated','Maintenance Request Completed','Others request for Room 202 is now completed',5,'maintenance','/maintenance/5','?','#f39c12',1,'2026-08-23 13:04:51','2026-08-24 13:42:59'),(166,4,'maintenance_updated','Maintenance Request Completed','Others request for Room 202 is now completed',5,'maintenance','/maintenance/5','?','#f39c12',0,'2026-08-23 13:04:51',NULL),(169,1,'maintenance_updated','Maintenance Request Completed','Electrician request for Room 402 is now completed',6,'maintenance','/maintenance/6','?','#f39c12',1,'2026-08-23 13:04:59','2026-08-24 20:35:56'),(170,2,'maintenance_updated','Maintenance Request Completed','Electrician request for Room 402 is now completed',6,'maintenance','/maintenance/6','?','#f39c12',1,'2026-08-23 13:04:59','2026-08-24 13:42:59'),(171,4,'maintenance_updated','Maintenance Request Completed','Electrician request for Room 402 is now completed',6,'maintenance','/maintenance/6','?','#f39c12',0,'2026-08-23 13:04:59',NULL),(174,1,'feedback_submitted','New Feedback Received','undefined gave 7.5/10 rating for DS Apartment',1,'feedback','/feedbacks/1','⭐','#f39c12',1,'2026-08-24 10:55:08','2026-08-24 20:35:56'),(175,2,'feedback_submitted','New Feedback Received','undefined gave 7.5/10 rating for DS Apartment',1,'feedback','/feedbacks/1','⭐','#f39c12',1,'2026-08-24 10:55:08','2026-08-24 16:26:00'),(176,4,'feedback_submitted','New Feedback Received','undefined gave 7.5/10 rating for DS Apartment',1,'feedback','/feedbacks/1','⭐','#f39c12',0,'2026-08-24 10:55:08',NULL),(179,1,'feedback_submitted','New Feedback Received','undefined gave 7.8/10 rating for Happy Living PG',2,'feedback','/feedbacks/2','⭐','#f39c12',1,'2026-08-24 11:17:14','2026-08-24 20:35:56'),(180,2,'feedback_submitted','New Feedback Received','undefined gave 7.8/10 rating for Happy Living PG',2,'feedback','/feedbacks/2','⭐','#f39c12',1,'2026-08-24 11:17:14','2026-08-24 16:47:29'),(181,4,'feedback_submitted','New Feedback Received','undefined gave 7.8/10 rating for Happy Living PG',2,'feedback','/feedbacks/2','⭐','#f39c12',0,'2026-08-24 11:17:14',NULL),(184,1,'feedback_submitted','New Feedback Received','undefined gave 9.2/10 rating for Mannat Apartment (Plot No :- 99)',3,'feedback','/feedbacks/3','⭐','#f39c12',1,'2026-08-24 11:28:47','2026-08-24 20:35:56'),(185,2,'feedback_submitted','New Feedback Received','undefined gave 9.2/10 rating for Mannat Apartment (Plot No :- 99)',3,'feedback','/feedbacks/3','⭐','#f39c12',1,'2026-08-24 11:28:47','2026-08-24 18:23:58'),(186,4,'feedback_submitted','New Feedback Received','undefined gave 9.2/10 rating for Mannat Apartment (Plot No :- 99)',3,'feedback','/feedbacks/3','⭐','#f39c12',0,'2026-08-24 11:28:47',NULL),(189,1,'maintenance_created','New Maintenance Request','Mohammed Aminu Shehe requested WiFi for Room 402',7,'maintenance','/maintenance/7','?','#3498db',1,'2026-08-24 12:55:25','2026-08-24 20:35:56'),(190,2,'maintenance_created','New Maintenance Request','Mohammed Aminu Shehe requested WiFi for Room 402',7,'maintenance','/maintenance/7','?','#3498db',1,'2026-08-24 12:55:25','2026-08-24 20:16:55'),(191,4,'maintenance_created','New Maintenance Request','Mohammed Aminu Shehe requested WiFi for Room 402',7,'maintenance','/maintenance/7','?','#3498db',0,'2026-08-24 12:55:25',NULL),(194,1,'maintenance_updated','Maintenance Request Started','WiFi request for Room 402 is now in_progress',7,'maintenance','/maintenance/7','?','#f39c12',1,'2026-08-24 12:55:38','2026-08-24 20:35:56'),(195,2,'maintenance_updated','Maintenance Request Started','WiFi request for Room 402 is now in_progress',7,'maintenance','/maintenance/7','?','#f39c12',1,'2026-08-24 12:55:38','2026-08-24 20:16:55'),(196,4,'maintenance_updated','Maintenance Request Started','WiFi request for Room 402 is now in_progress',7,'maintenance','/maintenance/7','?','#f39c12',0,'2026-08-24 12:55:38',NULL),(199,1,'feedback_submitted','New Feedback Received','Kinjili gave 6.0/10 rating for Shree Shyam Apartment',4,'feedback','/feedbacks/4','⭐','#f39c12',1,'2026-08-24 13:02:45','2026-08-24 20:35:56'),(200,2,'feedback_submitted','New Feedback Received','Kinjili gave 6.0/10 rating for Shree Shyam Apartment',4,'feedback','/feedbacks/4','⭐','#f39c12',1,'2026-08-24 13:02:45','2026-08-24 20:16:55'),(201,4,'feedback_submitted','New Feedback Received','Kinjili gave 6.0/10 rating for Shree Shyam Apartment',4,'feedback','/feedbacks/4','⭐','#f39c12',0,'2026-08-24 13:02:45',NULL),(204,1,'maintenance_updated','Maintenance Request Completed','WiFi request for Room 402 is now completed',7,'maintenance','/maintenance/7','?','#f39c12',1,'2026-08-24 13:21:11','2026-08-24 20:35:56'),(205,2,'maintenance_updated','Maintenance Request Completed','WiFi request for Room 402 is now completed',7,'maintenance','/maintenance/7','?','#f39c12',1,'2026-08-24 13:21:11','2026-08-24 20:16:55'),(206,4,'maintenance_updated','Maintenance Request Completed','WiFi request for Room 402 is now completed',7,'maintenance','/maintenance/7','?','#f39c12',0,'2026-08-24 13:21:11',NULL),(209,1,'maintenance_created','New Maintenance Request','Mohammed Aminu Shehe requested RO for Room 101',8,'maintenance','/maintenance/8','?','#3498db',1,'2026-08-24 15:03:02','2026-08-24 20:35:56'),(210,2,'maintenance_created','New Maintenance Request','Mohammed Aminu Shehe requested RO for Room 101',8,'maintenance','/maintenance/8','?','#3498db',1,'2026-08-24 15:03:02','2026-08-24 20:33:14'),(211,4,'maintenance_created','New Maintenance Request','Mohammed Aminu Shehe requested RO for Room 101',8,'maintenance','/maintenance/8','?','#3498db',0,'2026-08-24 15:03:02',NULL),(214,1,'maintenance_updated','Maintenance Request Started','RO request for Room 101 is now in_progress',8,'maintenance','/maintenance/8','?','#f39c12',1,'2026-08-24 15:04:46','2026-08-24 20:35:56'),(215,2,'maintenance_updated','Maintenance Request Started','RO request for Room 101 is now in_progress',8,'maintenance','/maintenance/8','?','#f39c12',0,'2026-08-24 15:04:46',NULL),(216,4,'maintenance_updated','Maintenance Request Started','RO request for Room 101 is now in_progress',8,'maintenance','/maintenance/8','?','#f39c12',0,'2026-08-24 15:04:46',NULL),(219,1,'maintenance_created','New Maintenance Request','Mohammed Aminu Shehe requested Electrician for Room 101',9,'maintenance','/maintenance/9','?','#3498db',1,'2026-08-24 15:10:35','2026-08-24 21:09:00'),(220,2,'maintenance_created','New Maintenance Request','Mohammed Aminu Shehe requested Electrician for Room 101',9,'maintenance','/maintenance/9','?','#3498db',0,'2026-08-24 15:10:35',NULL),(221,4,'maintenance_created','New Maintenance Request','Mohammed Aminu Shehe requested Electrician for Room 101',9,'maintenance','/maintenance/9','?','#3498db',0,'2026-08-24 15:10:35',NULL),(224,1,'maintenance_updated','Maintenance Request Completed','RO request for Room 101 is now completed',8,'maintenance','/maintenance/8','?','#f39c12',1,'2026-08-24 15:10:47','2026-08-24 21:09:00'),(225,2,'maintenance_updated','Maintenance Request Completed','RO request for Room 101 is now completed',8,'maintenance','/maintenance/8','?','#f39c12',0,'2026-08-24 15:10:47',NULL),(226,4,'maintenance_updated','Maintenance Request Completed','RO request for Room 101 is now completed',8,'maintenance','/maintenance/8','?','#f39c12',0,'2026-08-24 15:10:47',NULL),(229,1,'maintenance_updated','Maintenance Request Started','Electrician request for Room 101 is now in_progress',9,'maintenance','/maintenance/9','?','#f39c12',1,'2026-08-24 15:10:59','2026-08-24 21:09:00'),(230,2,'maintenance_updated','Maintenance Request Started','Electrician request for Room 101 is now in_progress',9,'maintenance','/maintenance/9','?','#f39c12',0,'2026-08-24 15:10:59',NULL),(231,4,'maintenance_updated','Maintenance Request Started','Electrician request for Room 101 is now in_progress',9,'maintenance','/maintenance/9','?','#f39c12',0,'2026-08-24 15:10:59',NULL),(234,1,'maintenance_updated','Maintenance Request Completed','Electrician request for Room 101 is now completed',9,'maintenance','/maintenance/9','?','#f39c12',1,'2026-08-24 15:15:08','2026-08-24 21:09:00'),(235,2,'maintenance_updated','Maintenance Request Completed','Electrician request for Room 101 is now completed',9,'maintenance','/maintenance/9','?','#f39c12',0,'2026-08-24 15:15:08',NULL),(236,4,'maintenance_updated','Maintenance Request Completed','Electrician request for Room 101 is now completed',9,'maintenance','/maintenance/9','?','#f39c12',0,'2026-08-24 15:15:08',NULL),(239,1,'maintenance_created','New Maintenance Request','Mohammed Aminu Shehe requested Check-out for Room 101',10,'maintenance','/maintenance/10','?','#3498db',1,'2026-08-24 15:15:57','2026-08-24 21:09:00'),(240,2,'maintenance_created','New Maintenance Request','Mohammed Aminu Shehe requested Check-out for Room 101',10,'maintenance','/maintenance/10','?','#3498db',0,'2026-08-24 15:15:57',NULL),(241,4,'maintenance_created','New Maintenance Request','Mohammed Aminu Shehe requested Check-out for Room 101',10,'maintenance','/maintenance/10','?','#3498db',0,'2026-08-24 15:15:57',NULL),(244,1,'maintenance_updated','Maintenance Request Started','Check-out request for Room 101 is now in_progress',10,'maintenance','/maintenance/10','?','#f39c12',1,'2026-08-24 15:16:06','2026-08-24 21:09:00'),(245,2,'maintenance_updated','Maintenance Request Started','Check-out request for Room 101 is now in_progress',10,'maintenance','/maintenance/10','?','#f39c12',0,'2026-08-24 15:16:06',NULL),(246,4,'maintenance_updated','Maintenance Request Started','Check-out request for Room 101 is now in_progress',10,'maintenance','/maintenance/10','?','#f39c12',0,'2026-08-24 15:16:06',NULL),(249,1,'maintenance_updated','Maintenance Request Completed','Check-out request for Room 101 is now completed',10,'maintenance','/maintenance/10','?','#f39c12',1,'2026-08-24 15:16:41','2026-08-24 21:09:00'),(250,2,'maintenance_updated','Maintenance Request Completed','Check-out request for Room 101 is now completed',10,'maintenance','/maintenance/10','?','#f39c12',0,'2026-08-24 15:16:41',NULL),(251,4,'maintenance_updated','Maintenance Request Completed','Check-out request for Room 101 is now completed',10,'maintenance','/maintenance/10','?','#f39c12',0,'2026-08-24 15:16:41',NULL),(254,1,'tenant_registered','New Tenant Registered','Little has been registered as a tenant',13,'tenant','/tenants/13','?','#2ecc71',1,'2026-09-24 13:57:07','2026-09-24 19:27:21'),(255,2,'tenant_registered','New Tenant Registered','Little has been registered as a tenant',13,'tenant','/tenants/13','?','#2ecc71',0,'2026-09-24 13:57:07',NULL),(256,4,'tenant_registered','New Tenant Registered','Little has been registered as a tenant',13,'tenant','/tenants/13','?','#2ecc71',0,'2026-09-24 13:57:07',NULL),(257,1,'bill_created','New Bill Generated','Bill of ₹11756.00 created for Little',6,'bill','/bills/6','?','#3498db',0,'2026-09-24 14:03:59',NULL),(258,2,'bill_created','New Bill Generated','Bill of ₹11756.00 created for Little',6,'bill','/bills/6','?','#3498db',0,'2026-09-24 14:03:59',NULL),(259,4,'bill_created','New Bill Generated','Bill of ₹11756.00 created for Little',6,'bill','/bills/6','?','#3498db',0,'2026-09-24 14:03:59',NULL),(260,1,'payment_proof_submitted','New Payment Proof Submitted','Little submitted a payment proof of ₹9000.0',6,'payment_proof','/bills/payment-proofs/6','?','#3498db',0,'2026-09-24 14:27:41',NULL),(261,2,'payment_proof_submitted','New Payment Proof Submitted','Little submitted a payment proof of ₹9000.0',6,'payment_proof','/bills/payment-proofs/6','?','#3498db',0,'2026-09-24 14:27:41',NULL),(262,4,'payment_proof_submitted','New Payment Proof Submitted','Little submitted a payment proof of ₹9000.0',6,'payment_proof','/bills/payment-proofs/6','?','#3498db',0,'2026-09-24 14:27:41',NULL),(263,1,'cash_payment_verified','Cash Payment Verified','Cash payment of ₹11756.00 verified for undefined',6,'bill','/bills/6','?','#2ecc71',0,'2026-09-24 14:39:10',NULL),(264,2,'cash_payment_verified','Cash Payment Verified','Cash payment of ₹11756.00 verified for undefined',6,'bill','/bills/6','?','#2ecc71',0,'2026-09-24 14:39:10',NULL),(265,4,'cash_payment_verified','Cash Payment Verified','Cash payment of ₹11756.00 verified for undefined',6,'bill','/bills/6','?','#2ecc71',0,'2026-09-24 14:39:10',NULL),(266,1,'pg_updated','PG Updated','PG \"Happy Living PG\" has been updated',2,'pg','/pgs/2','?️','#3498db',0,'2026-09-25 14:15:49',NULL),(267,2,'pg_updated','PG Updated','PG \"Happy Living PG\" has been updated',2,'pg','/pgs/2','?️','#3498db',0,'2026-09-25 14:15:49',NULL),(268,4,'pg_updated','PG Updated','PG \"Happy Living PG\" has been updated',2,'pg','/pgs/2','?️','#3498db',0,'2026-09-25 14:15:49',NULL),(269,1,'bill_created','New Bill Generated','Bill of ₹10600.00 created for Little',7,'bill','/bills/7','?','#3498db',0,'2026-09-25 14:35:16',NULL),(270,2,'bill_created','New Bill Generated','Bill of ₹10600.00 created for Little',7,'bill','/bills/7','?','#3498db',0,'2026-09-25 14:35:16',NULL),(271,4,'bill_created','New Bill Generated','Bill of ₹10600.00 created for Little',7,'bill','/bills/7','?','#3498db',0,'2026-09-25 14:35:16',NULL),(272,1,'payment_proof_submitted','New Payment Proof Submitted','Little submitted a payment proof of ₹10600.0',7,'payment_proof','/bills/payment-proofs/7','?','#3498db',0,'2026-09-25 14:48:52',NULL),(273,2,'payment_proof_submitted','New Payment Proof Submitted','Little submitted a payment proof of ₹10600.0',7,'payment_proof','/bills/payment-proofs/7','?','#3498db',0,'2026-09-25 14:48:52',NULL),(274,4,'payment_proof_submitted','New Payment Proof Submitted','Little submitted a payment proof of ₹10600.0',7,'payment_proof','/bills/payment-proofs/7','?','#3498db',0,'2026-09-25 14:48:52',NULL),(275,1,'tenant_registered','New Tenant Registered','MO11 has been registered as a tenant',14,'tenant','/tenants/14','?','#2ecc71',0,'2026-09-25 16:05:56',NULL),(276,2,'tenant_registered','New Tenant Registered','MO11 has been registered as a tenant',14,'tenant','/tenants/14','?','#2ecc71',0,'2026-09-25 16:05:56',NULL),(277,4,'tenant_registered','New Tenant Registered','MO11 has been registered as a tenant',14,'tenant','/tenants/14','?','#2ecc71',0,'2026-09-25 16:05:56',NULL),(278,1,'bill_created','New Bill Generated','Bill of ₹13080.00 created for Little',8,'bill','/bills/8','?','#3498db',0,'2026-09-25 16:08:19',NULL),(279,2,'bill_created','New Bill Generated','Bill of ₹13080.00 created for Little',8,'bill','/bills/8','?','#3498db',0,'2026-09-25 16:08:19',NULL),(280,4,'bill_created','New Bill Generated','Bill of ₹13080.00 created for Little',8,'bill','/bills/8','?','#3498db',0,'2026-09-25 16:08:19',NULL),(281,1,'bill_created','New Bill Generated','Bill of ₹13080.00 created for MO11',9,'bill','/bills/9','?','#3498db',0,'2026-09-25 16:08:25',NULL),(282,2,'bill_created','New Bill Generated','Bill of ₹13080.00 created for MO11',9,'bill','/bills/9','?','#3498db',0,'2026-09-25 16:08:25',NULL),(283,4,'bill_created','New Bill Generated','Bill of ₹13080.00 created for MO11',9,'bill','/bills/9','?','#3498db',0,'2026-09-25 16:08:25',NULL),(284,1,'payment_proof_submitted','New Payment Proof Submitted','Little submitted a payment proof of ₹7000.0',8,'payment_proof','/bills/payment-proofs/8','?','#3498db',0,'2026-09-25 16:10:23',NULL),(285,2,'payment_proof_submitted','New Payment Proof Submitted','Little submitted a payment proof of ₹7000.0',8,'payment_proof','/bills/payment-proofs/8','?','#3498db',0,'2026-09-25 16:10:23',NULL),(286,4,'payment_proof_submitted','New Payment Proof Submitted','Little submitted a payment proof of ₹7000.0',8,'payment_proof','/bills/payment-proofs/8','?','#3498db',0,'2026-09-25 16:10:23',NULL);
/*!40000 ALTER TABLE `admin_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_permissions`
--

DROP TABLE IF EXISTS `admin_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `admin_id` int(11) NOT NULL,
  `module_name` varchar(50) NOT NULL,
  `can_view` tinyint(1) DEFAULT 0,
  `can_add` tinyint(1) DEFAULT 0,
  `can_edit` tinyint(1) DEFAULT 0,
  `can_delete` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `can_message` tinyint(1) NOT NULL DEFAULT 0,
  `can_export` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `admin_id` (`admin_id`,`module_name`),
  CONSTRAINT `admin_permissions_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_permissions`
--

LOCK TABLES `admin_permissions` WRITE;
/*!40000 ALTER TABLE `admin_permissions` DISABLE KEYS */;
INSERT INTO `admin_permissions` VALUES (8,4,'tenants',1,0,0,0,'2026-08-22 16:51:28',0,0),(9,4,'guests',0,0,0,0,'2026-08-22 16:51:28',0,0),(10,4,'bills',0,0,0,0,'2026-08-22 16:51:28',0,0),(11,4,'pgs',1,0,0,0,'2026-08-22 16:51:28',0,0),(12,4,'maintenance',1,0,1,0,'2026-08-22 16:51:28',0,0),(13,4,'documents',1,0,1,0,'2026-08-22 16:51:28',0,0),(14,4,'feedbacks',0,0,0,0,'2026-08-22 16:51:28',0,0),(29,4,'activity_logs',0,0,0,0,'2026-09-24 08:55:03',0,0);
/*!40000 ALTER TABLE `admin_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `must_change_password` tinyint(1) DEFAULT 1,
  `role` enum('super_admin','admin') NOT NULL,
  `id_document` varchar(500) DEFAULT NULL,
  `id_document_public_id` varchar(255) DEFAULT NULL,
  `id_document_resource_type` varchar(20) DEFAULT NULL,
  `otp` varchar(255) DEFAULT NULL,
  `otp_expiry` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `otp_sent_at` datetime DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'MO11','molittle1011@gmail.com',NULL,'$2b$12$ERndXqISwxL48Vc/RDNhHe0iUhM1omZiqdvOppqFkORhIKX.ZLc/u',0,'super_admin',NULL,NULL,NULL,NULL,NULL,1,'2026-08-22 04:53:04','2026-09-24 13:29:58','2026-09-24 18:59:16',NULL,NULL),(2,'Livinkey Admin','livinkey@gmail.com',NULL,'$2b$12$jPhjgye4s7ASgXnRx8s/qO5Lu9GT7NNA0DhN8xGn4mc1zD5dHLv.6',0,'super_admin',NULL,NULL,NULL,NULL,NULL,1,'2026-08-22 15:14:41','2026-08-23 12:41:11','2026-08-23 23:40:45',NULL,NULL),(4,'Animesh','kanimesh373@gmail.com','8789397542','$2b$12$ZPWsPbF1XLRULoOZjgq5neXu28pg401mKRET6GkUn2wiGKix2Avme',0,'admin',NULL,NULL,NULL,NULL,NULL,1,'2026-08-22 16:51:28','2026-08-23 12:38:42','2026-08-23 23:37:15',NULL,NULL);
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bill_audit_logs`
--

DROP TABLE IF EXISTS `bill_audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bill_audit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bill_id` int(11) NOT NULL,
  `admin_id` int(11) DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `before_data` longtext DEFAULT NULL,
  `after_data` longtext DEFAULT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_bill_audit_bill` (`bill_id`),
  KEY `idx_bill_audit_admin` (`admin_id`),
  KEY `idx_bill_audit_created` (`created_at`),
  CONSTRAINT `fk_bill_audit_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_bill_audit_bill` FOREIGN KEY (`bill_id`) REFERENCES `bills` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bill_audit_logs`
--

LOCK TABLES `bill_audit_logs` WRITE;
/*!40000 ALTER TABLE `bill_audit_logs` DISABLE KEYS */;
INSERT INTO `bill_audit_logs` VALUES (1,7,1,'create',NULL,'{\"tenant_id\":13,\"billing_month\":\"2026-10\",\"rent_amount\":10000,\"total_amount\":10600}','Bill created for 2026-10','2026-09-25 14:35:11'),(2,8,1,'create',NULL,'{\"tenant_id\":13,\"billing_month\":\"2026-11\",\"rent_amount\":11000,\"total_amount\":13080}','Bill created for 2026-11','2026-09-25 16:08:15'),(3,9,1,'create',NULL,'{\"tenant_id\":14,\"billing_month\":\"2026-11\",\"rent_amount\":11000,\"total_amount\":13080}','Bill created for 2026-11','2026-09-25 16:08:21');
/*!40000 ALTER TABLE `bill_audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bill_fine_adjustments`
--

DROP TABLE IF EXISTS `bill_fine_adjustments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bill_fine_adjustments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bill_id` int(11) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `old_fine_amount` decimal(10,2) NOT NULL,
  `new_fine_amount` decimal(10,2) NOT NULL,
  `reason` varchar(200) NOT NULL,
  `adjusted_at` datetime NOT NULL DEFAULT current_timestamp(),
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
-- Table structure for table `bill_group_members`
--

DROP TABLE IF EXISTS `bill_group_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bill_group_members` (
  `bill_group_id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`bill_group_id`,`tenant_id`),
  KEY `idx_bill_group_members_tenant` (`tenant_id`),
  CONSTRAINT `fk_bill_group_members_group` FOREIGN KEY (`bill_group_id`) REFERENCES `bill_groups` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bill_group_members_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bill_group_members`
--

LOCK TABLES `bill_group_members` WRITE;
/*!40000 ALTER TABLE `bill_group_members` DISABLE KEYS */;
/*!40000 ALTER TABLE `bill_group_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bill_groups`
--

DROP TABLE IF EXISTS `bill_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bill_groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bill_id` int(11) NOT NULL,
  `billing_month` char(7) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_bill_groups_bill_id` (`bill_id`),
  KEY `idx_bill_groups_billing_month` (`billing_month`),
  KEY `fk_bill_groups_created_by` (`created_by`),
  CONSTRAINT `fk_bill_groups_bill` FOREIGN KEY (`bill_id`) REFERENCES `bills` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bill_groups_created_by` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bill_groups`
--

LOCK TABLES `bill_groups` WRITE;
/*!40000 ALTER TABLE `bill_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `bill_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bill_payments`
--

DROP TABLE IF EXISTS `bill_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bill_payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bill_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_date` datetime NOT NULL DEFAULT current_timestamp(),
  `payment_method` varchar(50) DEFAULT 'qr_code',
  `transaction_id` varchar(100) DEFAULT NULL,
  `paid_from` date DEFAULT NULL,
  `paid_till` date DEFAULT NULL,
  `is_partial` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_bill_id` (`bill_id`),
  KEY `idx_bill_payments_paid_till` (`paid_till`),
  CONSTRAINT `fk_bill_payments_bill_id` FOREIGN KEY (`bill_id`) REFERENCES `bills` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bill_payments`
--

LOCK TABLES `bill_payments` WRITE;
/*!40000 ALTER TABLE `bill_payments` DISABLE KEYS */;
INSERT INTO `bill_payments` VALUES (1,1,13190.00,'2026-08-23 06:46:06','payment_proof','ttyh','2026-07-31','2026-08-30',0,'2026-08-22 19:46:06'),(5,6,9000.00,'2026-09-24 20:03:20','payment_proof','uusuus','2026-08-31','2026-08-31',1,'2026-09-24 14:33:20'),(6,6,2756.00,'2026-09-24 20:09:05','cash','CASH-1','2026-08-31','2026-10-29',0,'2026-09-24 14:39:05'),(7,7,10600.00,'2026-09-25 21:29:14','payment_proof','ttcluiop','2026-08-31','2026-09-29',0,'2026-09-25 15:59:14'),(8,8,7000.00,'2026-09-25 21:41:12','payment_proof','gggh','2026-10-30','2026-12-01',1,'2026-09-25 16:11:12');
/*!40000 ALTER TABLE `bill_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bills`
--

DROP TABLE IF EXISTS `bills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bills` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `bill_group_id` int(11) DEFAULT NULL,
  `billing_month` char(7) NOT NULL,
  `period_from` date DEFAULT NULL,
  `period_till` date DEFAULT NULL,
  `rent_amount` decimal(10,2) NOT NULL,
  `electricity_amount` decimal(10,2) DEFAULT 0.00,
  `electricity_meter_image` varchar(500) DEFAULT NULL,
  `electricity_meter_public_id` varchar(255) DEFAULT NULL,
  `electricity_meter_resource_type` varchar(20) DEFAULT 'image',
  `electricity_meter_image_2` varchar(500) DEFAULT NULL,
  `electricity_meter_public_id_2` varchar(255) DEFAULT NULL,
  `electricity_meter_resource_type_2` varchar(20) DEFAULT 'image',
  `maintenance_amount` decimal(10,2) DEFAULT 0.00,
  `other_charges` decimal(10,2) DEFAULT 0.00,
  `total_amount` decimal(10,2) NOT NULL,
  `paid_amount` decimal(10,2) DEFAULT 0.00,
  `fine_amount` decimal(10,2) DEFAULT 0.00,
  `status` enum('unpaid','partially_paid','paid','delayed','overdue') DEFAULT 'unpaid',
  `payment_qr` varchar(500) DEFAULT NULL,
  `payment_qr_public_id` varchar(255) DEFAULT NULL,
  `payment_qr_resource_type` varchar(20) DEFAULT 'image',
  `partial_payment_qr` varchar(500) DEFAULT NULL,
  `partial_payment_qr_public_id` varchar(255) DEFAULT NULL,
  `partial_payment_qr_resource_type` varchar(20) DEFAULT 'image',
  `sent_at` datetime NOT NULL,
  `valid_until` datetime NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `fine_applied_days` int(11) DEFAULT 0,
  `last_fine_email_sent` datetime DEFAULT NULL,
  `initial_email_sent` tinyint(1) DEFAULT 0,
  `admin_qr` varchar(500) DEFAULT NULL,
  `admin_qr_public_id` varchar(255) DEFAULT NULL,
  `admin_qr_resource_type` varchar(20) DEFAULT NULL,
  `payment_details_source` varchar(20) NOT NULL DEFAULT 'pg',
  `payment_bank_name` varchar(150) DEFAULT NULL,
  `payment_account_holder_name` varchar(150) DEFAULT NULL,
  `payment_account_number` varchar(100) DEFAULT NULL,
  `payment_ifsc_code` varchar(20) DEFAULT NULL,
  `payment_upi_id` varchar(100) DEFAULT NULL,
  `payment_details_qr` varchar(500) DEFAULT NULL,
  `payment_details_qr_public_id` varchar(255) DEFAULT NULL,
  `payment_details_qr_resource_type` varchar(20) DEFAULT 'image',
  `last_message_sent` datetime DEFAULT NULL,
  `custom_message_qr` varchar(500) DEFAULT NULL,
  `custom_message_qr_public_id` varchar(255) DEFAULT NULL,
  `custom_message_qr_resource_type` varchar(20) DEFAULT NULL,
  `custom_message_admin_qr` varchar(500) DEFAULT NULL,
  `custom_message_admin_qr_public_id` varchar(255) DEFAULT NULL,
  `custom_message_admin_qr_resource_type` varchar(20) DEFAULT NULL,
  `last_custom_message` text DEFAULT NULL,
  `qr_expires_at` datetime DEFAULT NULL,
  `cash_payment_otp` varchar(10) DEFAULT NULL,
  `cash_payment_otp_expiry` datetime DEFAULT NULL,
  `cash_payment_verified` tinyint(1) DEFAULT 0,
  `cash_payment_requested_at` datetime DEFAULT NULL,
  `cash_payment_verified_at` datetime DEFAULT NULL,
  `payment_gateway` varchar(50) DEFAULT 'upi',
  `gateway_payment_id` varchar(255) DEFAULT NULL,
  `gateway_order_id` varchar(255) DEFAULT NULL,
  `gateway_status` varchar(50) DEFAULT NULL,
  `gateway_response` text DEFAULT NULL,
  `payment_link` varchar(500) DEFAULT NULL,
  `upi_qr_code` varchar(500) DEFAULT NULL,
  `upi_qr_public_id` varchar(255) DEFAULT NULL,
  `upi_qr_resource_type` varchar(20) DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL,
  `fine_start_date` date DEFAULT NULL,
  `daily_fine_rate` decimal(10,2) NOT NULL DEFAULT 100.00,
  `max_fine` decimal(10,2) NOT NULL DEFAULT 0.00,
  `partial_payment_made_at` datetime DEFAULT NULL,
  `active_billing_key` varchar(80) GENERATED ALWAYS AS (case when `deleted_at` is null then concat(cast(`tenant_id` as char charset utf8mb4),':',rtrim(`billing_month`)) else NULL end) STORED,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_bills_active_billing_period` (`active_billing_key`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_status` (`status`),
  KEY `idx_valid_until` (`valid_until`),
  KEY `fk_bills_created_by` (`created_by`),
  KEY `idx_qr_expires_at` (`qr_expires_at`),
  KEY `idx_bills_tenant_created` (`tenant_id`,`created_at`),
  KEY `idx_bills_tenant_billing_month` (`tenant_id`,`billing_month`),
  KEY `idx_bills_deleted_at` (`deleted_at`),
  KEY `idx_bills_tenant_status` (`tenant_id`,`status`),
  KEY `idx_bills_bill_group_id` (`bill_group_id`),
  CONSTRAINT `fk_bills_created_by` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bills_tenant_id` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bills`
--

LOCK TABLES `bills` WRITE;
/*!40000 ALTER TABLE `bills` DISABLE KEYS */;
INSERT INTO `bills` (`id`, `tenant_id`, `bill_group_id`, `billing_month`, `period_from`, `period_till`, `rent_amount`, `electricity_amount`, `electricity_meter_image`, `electricity_meter_public_id`, `electricity_meter_resource_type`, `electricity_meter_image_2`, `electricity_meter_public_id_2`, `electricity_meter_resource_type_2`, `maintenance_amount`, `other_charges`, `total_amount`, `paid_amount`, `fine_amount`, `status`, `payment_qr`, `payment_qr_public_id`, `payment_qr_resource_type`, `partial_payment_qr`, `partial_payment_qr_public_id`, `partial_payment_qr_resource_type`, `sent_at`, `valid_until`, `created_by`, `created_at`, `updated_at`, `fine_applied_days`, `last_fine_email_sent`, `initial_email_sent`, `admin_qr`, `admin_qr_public_id`, `admin_qr_resource_type`, `payment_details_source`, `payment_bank_name`, `payment_account_holder_name`, `payment_account_number`, `payment_ifsc_code`, `payment_upi_id`, `payment_details_qr`, `payment_details_qr_public_id`, `payment_details_qr_resource_type`, `last_message_sent`, `custom_message_qr`, `custom_message_qr_public_id`, `custom_message_qr_resource_type`, `custom_message_admin_qr`, `custom_message_admin_qr_public_id`, `custom_message_admin_qr_resource_type`, `last_custom_message`, `qr_expires_at`, `cash_payment_otp`, `cash_payment_otp_expiry`, `cash_payment_verified`, `cash_payment_requested_at`, `cash_payment_verified_at`, `payment_gateway`, `gateway_payment_id`, `gateway_order_id`, `gateway_status`, `gateway_response`, `payment_link`, `upi_qr_code`, `upi_qr_public_id`, `upi_qr_resource_type`, `deleted_at`, `deleted_by`, `fine_start_date`, `daily_fine_rate`, `max_fine`, `partial_payment_made_at`) VALUES (1,8,NULL,'2026-08','2026-08-01','2026-08-31',11000.00,1890.00,NULL,NULL,NULL,NULL,NULL,'image',300.00,0.00,13190.00,13190.00,0.00,'paid',NULL,NULL,NULL,NULL,NULL,NULL,'2026-08-23 06:44:03','2026-08-30 06:44:03',1,'2026-08-22 19:44:03','2026-09-24 13:23:25',0,NULL,0,NULL,NULL,NULL,'pg',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'image',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'upi',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-08-30',100.00,0.00,NULL),(2,7,NULL,'2026-08','2026-08-01','2026-08-31',11000.00,2900.00,NULL,NULL,NULL,NULL,NULL,'image',300.00,0.00,14200.00,0.00,0.00,'overdue','https://res.cloudinary.com/dlokcqf1h/image/upload/v1787453418/livinkey/bills/qr/safsyfr1h1zsourslbbx.png','livinkey/bills/qr/safsyfr1h1zsourslbbx','image','https://res.cloudinary.com/dlokcqf1h/image/upload/v1787453419/livinkey/bills/qr/srodsaogp6wqv0lopxrq.png','livinkey/bills/qr/srodsaogp6wqv0lopxrq','image','2026-08-23 08:20:20','2026-08-30 08:20:20',1,'2026-08-22 21:20:20','2026-09-24 13:23:25',0,NULL,0,NULL,NULL,NULL,'pg',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'image',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'upi',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-08-30',100.00,0.00,NULL),(6,13,NULL,'2026-09','2026-09-01','2026-09-30',10000.00,1456.00,NULL,NULL,NULL,NULL,NULL,NULL,300.00,0.00,11756.00,11756.00,0.00,'paid','https://res.cloudinary.com/rpmfr1xe/image/upload/v1790260748/livinkey/bills/qr/ivpqxh3smlsbnvnwmm7t.png','livinkey/bills/qr/ivpqxh3smlsbnvnwmm7t','image',NULL,NULL,NULL,'2026-09-24 19:33:54','2026-10-01 19:33:54',1,'2026-09-24 14:03:54','2026-09-24 14:39:10',0,NULL,0,NULL,NULL,NULL,'pg',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'image',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'2026-09-24 20:09:05','upi',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-01',100.00,0.00,'2026-09-24 20:03:20'),(7,13,NULL,'2026-10','2026-10-01','2026-10-31',10000.00,300.00,NULL,NULL,NULL,NULL,NULL,NULL,300.00,0.00,10600.00,10600.00,0.00,'paid',NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-25 20:05:11','2026-10-02 20:05:11',1,'2026-09-25 14:35:11','2026-09-25 15:59:16',0,NULL,0,NULL,NULL,NULL,'pg','PNB','LIVINKEY','1775102100001869','PUNB0177510','null','https://res.cloudinary.com/rpmfr1xe/image/upload/v1790345748/livinkey/pgs/qr/qgksrvqphgl1m9susabu.jpg','livinkey/pgs/qr/qgksrvqphgl1m9susabu','image',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'upi',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-02',100.00,0.00,NULL),(8,13,NULL,'2026-11','2026-11-01','2026-11-30',11000.00,1780.00,NULL,NULL,NULL,NULL,NULL,NULL,300.00,0.00,13080.00,7000.00,0.00,'partially_paid','https://res.cloudinary.com/rpmfr1xe/image/upload/v1790352495/livinkey/bills/qr/kq7bblmrfcyuvi6pepxi.png','livinkey/bills/qr/kq7bblmrfcyuvi6pepxi','image',NULL,NULL,NULL,'2026-09-25 21:38:15','2026-10-02 21:38:15',1,'2026-09-25 16:08:15','2026-09-25 16:11:12',0,NULL,0,NULL,NULL,NULL,'pg','PNB','LIVINKEY','1775102100001869','PUNB0177510','null','https://res.cloudinary.com/rpmfr1xe/image/upload/v1790345748/livinkey/pgs/qr/qgksrvqphgl1m9susabu.jpg','livinkey/pgs/qr/qgksrvqphgl1m9susabu','image',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'upi',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-02',100.00,0.00,'2026-09-25 21:41:12'),(9,14,NULL,'2026-11','2026-11-01','2026-11-30',11000.00,1780.00,NULL,NULL,NULL,NULL,NULL,NULL,300.00,0.00,13080.00,0.00,0.00,'unpaid','https://res.cloudinary.com/rpmfr1xe/image/upload/v1790352501/livinkey/bills/qr/d0qbnnurhh1lgpnwz0mc.png','livinkey/bills/qr/d0qbnnurhh1lgpnwz0mc','image',NULL,NULL,NULL,'2026-09-25 21:38:21','2026-10-02 21:38:21',1,'2026-09-25 16:08:21','2026-09-25 16:08:21',0,NULL,0,NULL,NULL,NULL,'pg','PNB','LIVINKEY','1775102100001869','PUNB0177510','null','https://res.cloudinary.com/rpmfr1xe/image/upload/v1790345748/livinkey/pgs/qr/qgksrvqphgl1m9susabu.jpg','livinkey/pgs/qr/qgksrvqphgl1m9susabu','image',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'upi',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-02',100.00,0.00,NULL);
/*!40000 ALTER TABLE `bills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cash_payments`
--

DROP TABLE IF EXISTS `cash_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cash_payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bill_id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `paid_from` date NOT NULL,
  `paid_till` date NOT NULL,
  `payment_date` datetime NOT NULL DEFAULT current_timestamp(),
  `verified_by` int(11) NOT NULL,
  `otp` varchar(10) NOT NULL,
  `status` enum('pending','verified','cancelled') DEFAULT 'verified',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
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
INSERT INTO `cash_payments` VALUES (1,6,13,2756.00,'2026-08-31','2026-10-29','2026-09-24 20:09:05',1,'8516','verified','Asd','2026-09-24 14:39:05');
/*!40000 ALTER TABLE `cash_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `floors`
--

DROP TABLE IF EXISTS `floors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `floors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pg_id` int(11) NOT NULL,
  `floor_number` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_pg_floor` (`pg_id`,`floor_number`),
  KEY `idx_pg_id` (`pg_id`),
  KEY `idx_floors_is_active` (`is_active`),
  KEY `idx_floors_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_floors_pg_id` FOREIGN KEY (`pg_id`) REFERENCES `pgs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `floors`
--

LOCK TABLES `floors` WRITE;
/*!40000 ALTER TABLE `floors` DISABLE KEYS */;
INSERT INTO `floors` VALUES (1,1,1,'2026-08-22 08:10:30','2026-08-22 08:10:30',1,NULL),(2,1,2,'2026-08-22 08:10:34','2026-08-22 08:10:34',1,NULL),(3,1,3,'2026-08-22 08:10:37','2026-08-22 08:10:37',1,NULL),(4,2,1,'2026-08-22 08:15:18','2026-08-22 08:15:18',1,NULL),(5,2,2,'2026-08-22 08:15:26','2026-08-22 08:15:26',1,NULL),(6,2,3,'2026-08-22 08:15:35','2026-08-22 08:15:35',1,NULL),(7,2,4,'2026-08-22 08:15:44','2026-08-22 08:15:44',1,NULL),(8,3,1,'2026-08-22 08:17:38','2026-08-22 08:17:38',1,NULL),(9,3,2,'2026-08-22 08:17:40','2026-08-22 08:17:40',1,NULL),(10,4,1,'2026-08-22 08:20:01','2026-08-22 08:20:01',1,NULL),(11,4,2,'2026-08-22 08:20:03','2026-08-22 08:20:03',1,NULL),(12,5,1,'2026-08-22 08:21:15','2026-08-22 08:21:15',1,NULL),(13,5,2,'2026-08-22 08:21:16','2026-08-22 08:21:16',1,NULL),(14,6,1,'2026-08-22 08:23:44','2026-08-22 08:23:44',1,NULL),(15,6,2,'2026-08-22 08:23:48','2026-08-22 08:23:48',1,NULL),(16,6,3,'2026-08-22 08:23:51','2026-08-22 08:23:51',1,NULL),(17,7,1,'2026-08-22 08:25:42','2026-08-22 08:25:42',1,NULL),(18,7,2,'2026-08-22 08:25:44','2026-08-22 08:25:44',1,NULL);
/*!40000 ALTER TABLE `floors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guest_notifications`
--

DROP TABLE IF EXISTS `guest_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guest_notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `guest_id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `link` varchar(500) DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `color` varchar(20) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `read_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_guest_id` (`guest_id`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `guest_notifications_ibfk_1` FOREIGN KEY (`guest_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guest_notifications`
--

LOCK TABLES `guest_notifications` WRITE;
/*!40000 ALTER TABLE `guest_notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `guest_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `maintenance_requests`
--

DROP TABLE IF EXISTS `maintenance_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `maintenance_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `issue_type` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `service_date` date NOT NULL,
  `free_time` varchar(100) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `image_public_id` varchar(255) DEFAULT NULL,
  `image_resource_type` varchar(20) DEFAULT NULL,
  `status` enum('pending','in_progress','completed') DEFAULT 'pending',
  `completed_by` varchar(50) DEFAULT NULL COMMENT 'admin_{id} or tenant_{id}',
  `completion_reminder_sent` tinyint(1) DEFAULT 0,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `room_id` (`room_id`),
  KEY `idx_status` (`status`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_issue_type` (`issue_type`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_maintenance_status_reminder` (`status`,`completion_reminder_sent`,`updated_at`),
  CONSTRAINT `maintenance_requests_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `maintenance_requests_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maintenance_requests`
--

LOCK TABLES `maintenance_requests` WRITE;
/*!40000 ALTER TABLE `maintenance_requests` DISABLE KEYS */;
INSERT INTO `maintenance_requests` VALUES (1,6,32,'Electrician','light issue','2026-08-23','12:00 PM',NULL,NULL,NULL,'completed',NULL,0,6,'2026-08-22 16:53:20','2026-08-22 19:41:35'),(2,8,15,'Electrician','dddd','2026-08-26','22:50','https://res.cloudinary.com/dlokcqf1h/image/upload/v1787447108/livinkey/maintenance/8/cbya7ubcubq9ifoyqr52.jpg','livinkey/maintenance/8/cbya7ubcubq9ifoyqr52','image','completed',NULL,0,8,'2026-08-22 19:35:11','2026-08-22 19:41:36'),(3,8,15,'Cleaning','tttf','2026-08-26','06:35','https://res.cloudinary.com/dlokcqf1h/image/upload/v1787447150/livinkey/maintenance/8/g8m2cqy4ixlxebj9rpbt.jpg','livinkey/maintenance/8/g8m2cqy4ixlxebj9rpbt','image','completed',NULL,0,8,'2026-08-22 19:35:55','2026-08-22 19:41:37'),(4,8,15,'Check-out','tggg','2026-08-29','14:25',NULL,NULL,NULL,'completed',NULL,0,8,'2026-08-22 19:36:14','2026-08-22 19:41:38'),(8,7,15,'RO','fgy','2026-08-26','18:32','https://res.cloudinary.com/dlokcqf1h/image/upload/v1787583781/livinkey/maintenance/7/xwnctenuktanwie4oagz.jpg','livinkey/maintenance/7/xwnctenuktanwie4oagz','image','completed','tenant_7',0,7,'2026-08-24 15:03:02','2026-08-24 15:10:47'),(9,7,15,'Electrician','bgfd','2026-08-27','16:40','https://res.cloudinary.com/dlokcqf1h/image/upload/v1787584235/livinkey/maintenance/7/j5g08boipuqc5u4ldfa1.jpg','livinkey/maintenance/7/j5g08boipuqc5u4ldfa1','image','completed','admin_5',0,7,'2026-08-24 15:10:35','2026-08-24 15:15:08'),(10,7,15,'Check-out','ftt','2026-08-27','05:45','https://res.cloudinary.com/dlokcqf1h/image/upload/v1787584556/livinkey/maintenance/7/ofmkkf9a1w5yg3rxdf6y.jpg','livinkey/maintenance/7/ofmkkf9a1w5yg3rxdf6y','image','completed','tenant_7',0,7,'2026-08-24 15:15:57','2026-08-24 15:16:41');
/*!40000 ALTER TABLE `maintenance_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_proofs`
--

DROP TABLE IF EXISTS `payment_proofs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_proofs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bill_id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `transaction_id` varchar(100) NOT NULL,
  `amount_paid` decimal(10,2) NOT NULL,
  `paid_from` date DEFAULT NULL,
  `paid_till` date DEFAULT NULL,
  `proof_url` varchar(500) NOT NULL,
  `proof_public_id` varchar(255) NOT NULL,
  `proof_resource_type` varchar(20) DEFAULT 'image',
  `status` enum('pending','verified','rejected') DEFAULT 'pending',
  `is_partial` tinyint(1) NOT NULL DEFAULT 0,
  `due_before_payment` decimal(10,2) DEFAULT NULL,
  `due_after_payment` decimal(10,2) DEFAULT NULL,
  `admin_notes` text DEFAULT NULL,
  `verified_by` int(11) DEFAULT NULL,
  `verified_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_payment_proofs_tenant_transaction` (`tenant_id`,`transaction_id`),
  KEY `bill_id` (`bill_id`),
  KEY `tenant_id` (`tenant_id`),
  KEY `verified_by` (`verified_by`),
  KEY `idx_status` (`status`),
  KEY `idx_transaction_id` (`transaction_id`),
  KEY `idx_payment_proofs_paid_till` (`paid_till`),
  CONSTRAINT `payment_proofs_ibfk_1` FOREIGN KEY (`bill_id`) REFERENCES `bills` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payment_proofs_ibfk_2` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payment_proofs_ibfk_3` FOREIGN KEY (`verified_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_proofs`
--

LOCK TABLES `payment_proofs` WRITE;
/*!40000 ALTER TABLE `payment_proofs` DISABLE KEYS */;
INSERT INTO `payment_proofs` VALUES (1,1,8,'ttyh',13190.00,'2026-07-31','2026-08-30','https://res.cloudinary.com/dlokcqf1h/image/upload/v1787447731/livinkey/payments/proofs/8/bfisvousscnuu51u7iwh.jpg','livinkey/payments/proofs/8/bfisvousscnuu51u7iwh','image','verified',0,NULL,0.00,NULL,1,'2026-08-23 06:46:06','2026-08-22 19:45:32','2026-09-25 14:01:32'),(6,6,13,'uusuus',9000.00,'2026-08-31','2026-08-31','https://res.cloudinary.com/rpmfr1xe/image/upload/v1790260060/livinkey/payments/proofs/13/irge0i49hzfsedpgg0z7.jpg','livinkey/payments/proofs/13/irge0i49hzfsedpgg0z7','image','verified',1,NULL,2756.00,NULL,1,'2026-09-24 20:03:20','2026-09-24 14:27:41','2026-09-25 14:01:32'),(7,7,13,'ttcluiop',10600.00,'2026-08-31','2026-09-29','https://res.cloudinary.com/rpmfr1xe/image/upload/v1790347732/livinkey/payments/proofs/13/qamj7qeibhtpqptvgxf3.jpg','livinkey/payments/proofs/13/qamj7qeibhtpqptvgxf3','image','verified',0,10600.00,NULL,NULL,1,'2026-09-25 21:29:14','2026-09-25 14:48:52','2026-09-25 15:59:14'),(8,8,13,'gggh',7000.00,'2026-10-30','2026-12-01','https://res.cloudinary.com/rpmfr1xe/image/upload/v1790352622/livinkey/payments/proofs/13/woaw4cijiqeydxtyzvau.jpg','livinkey/payments/proofs/13/woaw4cijiqeydxtyzvau','image','verified',1,13080.00,NULL,NULL,1,'2026-09-25 21:41:12','2026-09-25 16:10:23','2026-09-25 16:11:12');
/*!40000 ALTER TABLE `payment_proofs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_transactions`
--

DROP TABLE IF EXISTS `payment_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bill_id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_type` enum('upi','card','netbanking','wallet','cash') DEFAULT 'upi',
  `gateway` varchar(50) NOT NULL,
  `gateway_order_id` varchar(255) NOT NULL,
  `gateway_payment_id` varchar(255) DEFAULT NULL,
  `status` enum('pending','processing','success','failed','refunded','cancelled') DEFAULT 'pending',
  `payment_link` varchar(500) DEFAULT NULL,
  `upi_id` varchar(100) DEFAULT NULL,
  `transaction_date` datetime NOT NULL DEFAULT current_timestamp(),
  `response_data` text DEFAULT NULL,
  `webhook_received` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_payment_transactions_order` (`gateway_order_id`),
  KEY `idx_bill_id` (`bill_id`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_gateway_order_id` (`gateway_order_id`),
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
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pg_id` int(11) NOT NULL,
  `amenity_name` varchar(100) NOT NULL,
  `is_custom` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_pg_id` (`pg_id`),
  CONSTRAINT `fk_pg_amenities_pg_id` FOREIGN KEY (`pg_id`) REFERENCES `pgs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pg_amenities`
--

LOCK TABLES `pg_amenities` WRITE;
/*!40000 ALTER TABLE `pg_amenities` DISABLE KEYS */;
INSERT INTO `pg_amenities` VALUES (1,1,'Free WiFi',0,'2026-08-22 08:10:21'),(2,1,'24×7 Assistance',0,'2026-08-22 08:10:22'),(3,1,'24×7 Power Backup',0,'2026-08-22 08:10:23'),(4,1,'43 Inch LED',0,'2026-08-22 08:10:23'),(5,1,'Ventilated Rooms',0,'2026-08-22 08:10:24'),(6,1,'Free Housekeeping',0,'2026-08-22 08:10:24'),(7,1,'CCTV',0,'2026-08-22 08:10:25'),(8,1,'AC',0,'2026-08-22 08:10:25'),(17,3,'Free WiFi',0,'2026-08-22 08:17:27'),(18,3,'24×7 Assistance',0,'2026-08-22 08:17:28'),(19,3,'24×7 Power Backup',0,'2026-08-22 08:17:28'),(20,3,'Ventilated Rooms',0,'2026-08-22 08:17:28'),(21,3,'Free Housekeeping',0,'2026-08-22 08:17:29'),(22,3,'CCTV',0,'2026-08-22 08:17:29'),(23,3,'AC',0,'2026-08-22 08:17:30'),(24,4,'Free WiFi',0,'2026-08-22 08:19:36'),(25,4,'24×7 Assistance',0,'2026-08-22 08:19:36'),(26,4,'24×7 Power Backup',0,'2026-08-22 08:19:37'),(27,4,'43 Inch LED',0,'2026-08-22 08:19:37'),(28,4,'Ventilated Rooms',0,'2026-08-22 08:19:38'),(29,4,'Free Housekeeping',0,'2026-08-22 08:19:38'),(30,4,'CCTV',0,'2026-08-22 08:19:39'),(31,4,'AC',0,'2026-08-22 08:19:39'),(32,4,'Washing Machine',1,'2026-08-22 08:19:40'),(33,5,'Free WiFi',0,'2026-08-22 08:21:07'),(34,5,'24×7 Assistance',0,'2026-08-22 08:21:08'),(35,5,'24×7 Power Backup',0,'2026-08-22 08:21:08'),(36,5,'Ventilated Rooms',0,'2026-08-22 08:21:09'),(37,5,'Free Housekeeping',0,'2026-08-22 08:21:09'),(38,5,'CCTV',0,'2026-08-22 08:21:10'),(39,5,'AC',0,'2026-08-22 08:21:10'),(40,6,'Free WiFi',0,'2026-08-22 08:23:31'),(41,6,'24×7 Assistance',0,'2026-08-22 08:23:32'),(42,6,'24×7 Power Backup',0,'2026-08-22 08:23:32'),(43,6,'43 Inch LED',0,'2026-08-22 08:23:32'),(44,6,'Ventilated Rooms',0,'2026-08-22 08:23:33'),(45,6,'Free Housekeeping',0,'2026-08-22 08:23:33'),(46,6,'CCTV',0,'2026-08-22 08:23:34'),(47,6,'AC',0,'2026-08-22 08:23:34'),(48,7,'Free WiFi',0,'2026-08-22 08:25:33'),(49,7,'24×7 Assistance',0,'2026-08-22 08:25:34'),(50,7,'24×7 Power Backup',0,'2026-08-22 08:25:34'),(51,7,'43 Inch LED',0,'2026-08-22 08:25:35'),(52,7,'Ventilated Rooms',0,'2026-08-22 08:25:36'),(53,7,'Free Housekeeping',0,'2026-08-22 08:25:36'),(54,7,'CCTV',0,'2026-08-22 08:25:36'),(55,7,'AC',0,'2026-08-22 08:25:37'),(56,2,'Free WiFi',0,'2026-09-25 14:15:49'),(57,2,'24×7 Assistance',0,'2026-09-25 14:15:49'),(58,2,'24×7 Power Backup',0,'2026-09-25 14:15:49'),(59,2,'43 Inch LED',0,'2026-09-25 14:15:49'),(60,2,'Ventilated Rooms',0,'2026-09-25 14:15:49'),(61,2,'Free Housekeeping',0,'2026-09-25 14:15:49'),(62,2,'CCTV',0,'2026-09-25 14:15:49'),(63,2,'AC',0,'2026-09-25 14:15:49');
/*!40000 ALTER TABLE `pg_amenities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pg_images`
--

DROP TABLE IF EXISTS `pg_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pg_images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pg_id` int(11) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `public_id` varchar(255) NOT NULL,
  `resource_type` varchar(20) DEFAULT 'image',
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
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
INSERT INTO `pg_images` VALUES (1,1,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1787406028/livinkey/pgs/images/axjnkq7iphdvvwwzemt3.jpg','livinkey/pgs/images/axjnkq7iphdvvwwzemt3','image',0,'2026-08-22 08:10:29'),(2,2,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1787406313/livinkey/pgs/images/fhim35ypwtly2uuzk2i6.jpg','livinkey/pgs/images/fhim35ypwtly2uuzk2i6','image',0,'2026-08-22 08:15:14'),(3,2,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1787406317/livinkey/pgs/images/dywcxg5avqemoyyzfhhf.jpg','livinkey/pgs/images/dywcxg5avqemoyyzfhhf','image',1,'2026-08-22 08:15:18'),(4,3,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1787406453/livinkey/pgs/images/nqd2o7rtyxkyxd4y90hq.jpg','livinkey/pgs/images/nqd2o7rtyxkyxd4y90hq','image',0,'2026-08-22 08:17:34'),(5,3,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1787406455/livinkey/pgs/images/igxnabo0xm5rjxfbucch.jpg','livinkey/pgs/images/igxnabo0xm5rjxfbucch','image',1,'2026-08-22 08:17:36'),(6,3,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1787406457/livinkey/pgs/images/cvh1bzyd7bvwx7fhewnf.jpg','livinkey/pgs/images/cvh1bzyd7bvwx7fhewnf','image',2,'2026-08-22 08:17:37'),(7,4,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1787406584/livinkey/pgs/images/ycb7iijelspdpztr4xhk.png','livinkey/pgs/images/ycb7iijelspdpztr4xhk','image',0,'2026-08-22 08:19:46'),(8,4,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1787406587/livinkey/pgs/images/hivnxeod5emgsbkxeiyy.png','livinkey/pgs/images/hivnxeod5emgsbkxeiyy','image',1,'2026-08-22 08:19:47'),(9,4,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1787406593/livinkey/pgs/images/ldqju6iagtl0t8e8tvj2.png','livinkey/pgs/images/ldqju6iagtl0t8e8tvj2','image',2,'2026-08-22 08:19:53'),(10,4,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1787406596/livinkey/pgs/images/usetswi7sj6rzcpdiebj.png','livinkey/pgs/images/usetswi7sj6rzcpdiebj','image',3,'2026-08-22 08:19:56'),(11,4,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1787406599/livinkey/pgs/images/ute18qw5ycrthxoj4twv.png','livinkey/pgs/images/ute18qw5ycrthxoj4twv','image',4,'2026-08-22 08:20:00'),(12,5,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1787406673/livinkey/pgs/images/qtf97igtlvvnnj10wthm.jpg','livinkey/pgs/images/qtf97igtlvvnnj10wthm','image',0,'2026-08-22 08:21:14'),(13,6,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1787406818/livinkey/pgs/images/m5mr4h4i0t37argu2rgu.jpg','livinkey/pgs/images/m5mr4h4i0t37argu2rgu','image',0,'2026-08-22 08:23:39'),(14,6,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1787406820/livinkey/pgs/images/ywhnynsbb0grydzwmln0.jpg','livinkey/pgs/images/ywhnynsbb0grydzwmln0','image',1,'2026-08-22 08:23:41'),(15,6,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1787406821/livinkey/pgs/images/zoudresfq3kdtsr5psjf.jpg','livinkey/pgs/images/zoudresfq3kdtsr5psjf','image',2,'2026-08-22 08:23:42'),(16,6,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1787406823/livinkey/pgs/images/lrr2dp7uhvket4kktmoo.jpg','livinkey/pgs/images/lrr2dp7uhvket4kktmoo','image',3,'2026-08-22 08:23:44'),(17,7,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1787406940/livinkey/pgs/images/l63zv35ng8dx48e9ci7r.jpg','livinkey/pgs/images/l63zv35ng8dx48e9ci7r','image',0,'2026-08-22 08:25:41');
/*!40000 ALTER TABLE `pg_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pgs`
--

DROP TABLE IF EXISTS `pgs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pgs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `location` text NOT NULL,
  `number_of_floors` int(11) NOT NULL DEFAULT 1,
  `payment_qr` varchar(500) DEFAULT NULL,
  `payment_qr_public_id` varchar(255) DEFAULT NULL,
  `payment_qr_resource_type` varchar(20) DEFAULT NULL,
  `payment_bank_name` varchar(150) DEFAULT NULL,
  `payment_account_holder_name` varchar(150) DEFAULT NULL,
  `payment_account_number` varchar(100) DEFAULT NULL,
  `payment_ifsc_code` varchar(20) DEFAULT NULL,
  `payment_upi_id` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `rent` decimal(10,2) NOT NULL DEFAULT 0.00,
  `security_fee` decimal(10,2) DEFAULT 0.00,
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
INSERT INTO `pgs` VALUES (1,'Alishan PG','LawGate, Phagwara',3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,1,'2026-08-22 08:10:20','2026-08-22 08:10:20',10000.00,10000.00),(2,'Happy Living PG','LawGate, Phagwara',4,'https://res.cloudinary.com/rpmfr1xe/image/upload/v1790345748/livinkey/pgs/qr/qgksrvqphgl1m9susabu.jpg','livinkey/pgs/qr/qgksrvqphgl1m9susabu','image','PNB','LIVINKEY','1775102100001869','PUNB0177510','null',1,1,'2026-08-22 08:15:06','2026-09-25 14:15:49',12000.00,12000.00),(3,'DS Apartment','LawGate, Phagwara',2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,1,'2026-08-22 08:17:27','2026-08-22 08:17:27',8500.00,8500.00),(4,'J T House (Plot No :- 257)','Green Valley, Phagwara',2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,1,'2026-08-22 08:19:35','2026-08-22 08:19:35',12000.00,12000.00),(5,'Shree Shyam Apartment','LawGate, Phagwara',2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,1,'2026-08-22 08:21:07','2026-08-22 08:21:07',10000.00,10000.00),(6,'Royal Suits ( (Plot No :- 103,104)','Green Valley, Phagwara',3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,1,'2026-08-22 08:23:31','2026-08-22 08:23:31',15000.00,15000.00),(7,'Mannat Apartment (Plot No :- 99)','Green Valley, Phagwara',2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,1,'2026-08-22 08:25:33','2026-08-22 08:25:33',14000.00,14000.00);
/*!40000 ALTER TABLE `pgs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `public_feedbacks`
--

DROP TABLE IF EXISTS `public_feedbacks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `public_feedbacks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pg_id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `living_experience_rating` decimal(3,1) NOT NULL,
  `maintenance_handling_rating` decimal(3,1) NOT NULL,
  `communication_rating` decimal(3,1) NOT NULL,
  `amenities_rating` decimal(3,1) NOT NULL,
  `technology_handling_rating` decimal(3,1) NOT NULL,
  `overall_rating` decimal(3,1) NOT NULL,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_pg_id` (`pg_id`),
  KEY `idx_email` (`email`),
  KEY `idx_phone` (`phone`),
  KEY `idx_rating` (`overall_rating`),
  CONSTRAINT `fk_public_feedbacks_pg_id` FOREIGN KEY (`pg_id`) REFERENCES `pgs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `public_feedbacks_chk_1` CHECK (`living_experience_rating` between 1 and 10),
  CONSTRAINT `public_feedbacks_chk_2` CHECK (`maintenance_handling_rating` between 1 and 10),
  CONSTRAINT `public_feedbacks_chk_3` CHECK (`communication_rating` between 1 and 10),
  CONSTRAINT `public_feedbacks_chk_4` CHECK (`amenities_rating` between 1 and 10),
  CONSTRAINT `public_feedbacks_chk_5` CHECK (`technology_handling_rating` between 1 and 10),
  CONSTRAINT `public_feedbacks_chk_6` CHECK (`overall_rating` between 1 and 10)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `public_feedbacks`
--

LOCK TABLES `public_feedbacks` WRITE;
/*!40000 ALTER TABLE `public_feedbacks` DISABLE KEYS */;
INSERT INTO `public_feedbacks` VALUES (1,3,'MO11','abdulwarithshehe2010@gmail.com','774730606',8.5,9.0,3.0,8.5,8.5,7.5,'Nice','2026-08-24 10:55:08','2026-08-24 10:55:08'),(2,2,'MO11','abdulwarithshehe2010@gmail.com','774730606',10.0,7.5,1.5,10.0,10.0,7.8,'I like the size of the rooms','2026-08-24 11:17:14','2026-08-24 11:17:14'),(3,7,'MO','abdulwarithshehe2010@gmail.com','9988105427',7.5,9.0,10.0,9.5,10.0,9.2,'Testing','2026-08-24 11:28:47','2026-08-24 11:28:47');
/*!40000 ALTER TABLE `public_feedbacks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `receipts`
--

DROP TABLE IF EXISTS `receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `receipts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `receipt_number` varchar(32) NOT NULL,
  `bill_id` int(11) NOT NULL,
  `payment_id` int(11) DEFAULT NULL,
  `payment_proof_id` int(11) DEFAULT NULL,
  `cash_payment_id` int(11) DEFAULT NULL,
  `tenant_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `breakdown_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`breakdown_json`)),
  `issued_at` datetime NOT NULL DEFAULT current_timestamp(),
  `issued_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `receipt_number` (`receipt_number`),
  UNIQUE KEY `payment_id` (`payment_id`),
  UNIQUE KEY `payment_proof_id` (`payment_proof_id`),
  UNIQUE KEY `cash_payment_id` (`cash_payment_id`),
  KEY `idx_receipts_bill` (`bill_id`),
  KEY `idx_receipts_tenant` (`tenant_id`),
  KEY `fk_receipts_issued_by` (`issued_by`),
  CONSTRAINT `fk_receipts_bill` FOREIGN KEY (`bill_id`) REFERENCES `bills` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_receipts_issued_by` FOREIGN KEY (`issued_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_receipts_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `receipts`
--

LOCK TABLES `receipts` WRITE;
/*!40000 ALTER TABLE `receipts` DISABLE KEYS */;
/*!40000 ALTER TABLE `receipts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room_occupancy`
--

DROP TABLE IF EXISTS `room_occupancy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room_occupancy` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `room_id` int(11) NOT NULL,
  `occupied_count` int(11) NOT NULL DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_room_occupancy` (`room_id`),
  CONSTRAINT `fk_room_occupancy_room_id` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room_occupancy`
--

LOCK TABLES `room_occupancy` WRITE;
/*!40000 ALTER TABLE `room_occupancy` DISABLE KEYS */;
INSERT INTO `room_occupancy` VALUES (1,67,0,'2026-08-25 06:21:15'),(2,32,1,'2026-08-22 16:48:15'),(3,15,2,'2026-08-22 18:35:33'),(5,66,0,'2026-08-25 05:59:47'),(6,33,0,'2026-08-25 06:21:20'),(8,16,2,'2026-09-25 16:05:51');
/*!40000 ALTER TABLE `room_occupancy` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `floor_id` int(11) NOT NULL,
  `room_number` varchar(50) NOT NULL,
  `capacity` int(11) NOT NULL DEFAULT 1,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `rent` decimal(10,2) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_floor_room` (`floor_id`,`room_number`),
  KEY `idx_floor_id` (`floor_id`),
  KEY `idx_rooms_is_active` (`is_active`),
  KEY `idx_rooms_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_rooms_floor_id` FOREIGN KEY (`floor_id`) REFERENCES `floors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=112 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES (1,1,'101',2,1,'2026-08-22 08:10:32','2026-08-22 08:10:32',10000.00,NULL),(2,1,'102',2,1,'2026-08-22 08:10:32','2026-08-22 08:10:32',10000.00,NULL),(3,1,'103',2,1,'2026-08-22 08:10:33','2026-08-22 08:10:33',10000.00,NULL),(4,1,'104',2,1,'2026-08-22 08:10:33','2026-08-22 08:10:33',10000.00,NULL),(5,1,'105',2,1,'2026-08-22 08:10:33','2026-08-22 08:10:33',10000.00,NULL),(6,1,'106',2,1,'2026-08-22 08:10:34','2026-08-22 08:10:34',10000.00,NULL),(7,2,'201',2,1,'2026-08-22 08:10:35','2026-08-22 08:10:35',10000.00,NULL),(8,2,'202',2,1,'2026-08-22 08:10:35','2026-08-22 08:10:35',10000.00,NULL),(9,2,'203',2,1,'2026-08-22 08:10:36','2026-08-22 08:10:36',10000.00,NULL),(10,2,'204',2,1,'2026-08-22 08:10:36','2026-08-22 08:10:36',10000.00,NULL),(11,2,'205',2,1,'2026-08-22 08:10:36','2026-08-22 08:10:36',10000.00,NULL),(12,2,'206',2,1,'2026-08-22 08:10:37','2026-08-22 08:10:37',10000.00,NULL),(13,3,'301',2,1,'2026-08-22 08:10:38','2026-08-22 08:10:38',10000.00,NULL),(14,3,'302',2,1,'2026-08-22 08:10:38','2026-08-22 08:10:38',10000.00,NULL),(15,4,'101',2,1,'2026-08-22 08:15:19','2026-08-22 08:15:19',12000.00,NULL),(16,4,'102',2,1,'2026-08-22 08:15:19','2026-08-22 08:15:19',12000.00,NULL),(17,4,'103',2,1,'2026-08-22 08:15:20','2026-08-22 08:15:20',12000.00,NULL),(18,4,'104',2,1,'2026-08-22 08:15:20','2026-08-22 08:15:20',12000.00,NULL),(19,4,'105',2,1,'2026-08-22 08:15:21','2026-08-22 08:15:21',12000.00,NULL),(20,4,'106',2,1,'2026-08-22 08:15:21','2026-08-22 08:15:21',12000.00,NULL),(21,4,'107',2,1,'2026-08-22 08:15:21','2026-08-22 08:15:21',12000.00,NULL),(22,4,'108',2,1,'2026-08-22 08:15:22','2026-08-22 08:15:22',12000.00,NULL),(23,4,'109',2,1,'2026-08-22 08:15:22','2026-08-22 08:15:22',12000.00,NULL),(24,4,'110',2,1,'2026-08-22 08:15:23','2026-08-22 08:15:23',12000.00,NULL),(25,4,'111',2,1,'2026-08-22 08:15:23','2026-08-22 08:15:23',12000.00,NULL),(26,4,'112',2,1,'2026-08-22 08:15:24','2026-08-22 08:15:24',12000.00,NULL),(27,4,'113',2,1,'2026-08-22 08:15:24','2026-08-22 08:15:24',12000.00,NULL),(28,4,'114',2,1,'2026-08-22 08:15:25','2026-08-22 08:15:25',12000.00,NULL),(29,4,'115',2,1,'2026-08-22 08:15:25','2026-08-22 08:15:25',12000.00,NULL),(30,4,'116',2,1,'2026-08-22 08:15:25','2026-08-22 08:15:25',12000.00,NULL),(31,4,'117',2,1,'2026-08-22 08:15:26','2026-08-22 08:15:26',12000.00,NULL),(32,5,'201',2,1,'2026-08-22 08:15:27','2026-08-22 08:15:27',12000.00,NULL),(33,5,'202',2,1,'2026-08-22 08:15:27','2026-08-22 08:15:27',12000.00,NULL),(34,5,'203',2,1,'2026-08-22 08:15:28','2026-08-22 08:15:28',12000.00,NULL),(35,5,'204',2,1,'2026-08-22 08:15:28','2026-08-22 08:15:28',12000.00,NULL),(36,5,'205',2,1,'2026-08-22 08:15:29','2026-08-22 08:15:29',12000.00,NULL),(37,5,'206',2,1,'2026-08-22 08:15:29','2026-08-22 08:15:29',12000.00,NULL),(38,5,'207',2,1,'2026-08-22 08:15:30','2026-08-22 08:15:30',12000.00,NULL),(39,5,'208',2,1,'2026-08-22 08:15:30','2026-08-22 08:15:30',12000.00,NULL),(40,5,'209',2,1,'2026-08-22 08:15:31','2026-08-22 08:15:31',12000.00,NULL),(41,5,'210',2,1,'2026-08-22 08:15:31','2026-08-22 08:15:31',12000.00,NULL),(42,5,'211',2,1,'2026-08-22 08:15:32','2026-08-22 08:15:32',12000.00,NULL),(43,5,'212',2,1,'2026-08-22 08:15:32','2026-08-22 08:15:32',12000.00,NULL),(44,5,'213',2,1,'2026-08-22 08:15:33','2026-08-22 08:15:33',10000.00,NULL),(45,5,'214',2,1,'2026-08-22 08:15:33','2026-08-22 08:15:33',12000.00,NULL),(46,5,'215',2,1,'2026-08-22 08:15:34','2026-08-22 08:15:34',12000.00,NULL),(47,5,'216',2,1,'2026-08-22 08:15:34','2026-08-22 08:15:34',12000.00,NULL),(48,5,'217',2,1,'2026-08-22 08:15:35','2026-08-22 08:15:35',12000.00,NULL),(49,6,'301',2,1,'2026-08-22 08:15:36','2026-08-22 08:15:36',12000.00,NULL),(50,6,'302',2,1,'2026-08-22 08:15:36','2026-08-22 08:15:36',12000.00,NULL),(51,6,'303',2,1,'2026-08-22 08:15:37','2026-08-22 08:15:37',12000.00,NULL),(52,6,'304',2,1,'2026-08-22 08:15:37','2026-08-22 08:15:37',12000.00,NULL),(53,6,'305',2,1,'2026-08-22 08:15:37','2026-08-22 08:15:37',12000.00,NULL),(54,6,'306',2,1,'2026-08-22 08:15:38','2026-08-22 08:15:38',12000.00,NULL),(55,6,'307',2,1,'2026-08-22 08:15:38','2026-08-22 08:15:38',12000.00,NULL),(56,6,'308',2,1,'2026-08-22 08:15:39','2026-08-22 08:15:39',12000.00,NULL),(57,6,'309',2,1,'2026-08-22 08:15:40','2026-08-22 08:15:40',12000.00,NULL),(58,6,'310',2,1,'2026-08-22 08:15:40','2026-08-22 08:15:40',12000.00,NULL),(59,6,'311',2,1,'2026-08-22 08:15:41','2026-08-22 08:15:41',12000.00,NULL),(60,6,'312',2,1,'2026-08-22 08:15:41','2026-08-22 08:15:41',12000.00,NULL),(61,6,'313',2,1,'2026-08-22 08:15:42','2026-08-22 08:15:42',12000.00,NULL),(62,6,'314',2,1,'2026-08-22 08:15:42','2026-08-22 08:15:42',12000.00,NULL),(63,6,'315',2,1,'2026-08-22 08:15:43','2026-08-22 08:15:43',12000.00,NULL),(64,6,'316',2,1,'2026-08-22 08:15:43','2026-08-22 08:15:43',12000.00,NULL),(65,6,'317',2,1,'2026-08-22 08:15:44','2026-08-22 08:15:44',12000.00,NULL),(66,7,'401',2,1,'2026-08-22 08:15:45','2026-08-22 08:15:45',12000.00,NULL),(67,7,'402',2,1,'2026-08-22 08:15:45','2026-08-22 08:15:45',12000.00,NULL),(68,7,'403',2,1,'2026-08-22 08:15:46','2026-08-22 08:15:46',12000.00,NULL),(69,8,'101',2,1,'2026-08-22 08:17:38','2026-08-22 08:17:38',8500.00,NULL),(70,8,'102',2,1,'2026-08-22 08:17:39','2026-08-22 08:17:39',8500.00,NULL),(71,8,'103',2,1,'2026-08-22 08:17:39','2026-08-22 08:17:39',8500.00,NULL),(72,8,'104',2,1,'2026-08-22 08:17:40','2026-08-22 08:17:40',8500.00,NULL),(73,9,'201',2,1,'2026-08-22 08:17:41','2026-08-22 08:17:41',8500.00,NULL),(74,9,'202',2,1,'2026-08-22 08:17:41','2026-08-22 08:17:41',8500.00,NULL),(75,9,'203',2,1,'2026-08-22 08:17:42','2026-08-22 08:17:42',8500.00,NULL),(76,10,'101',2,1,'2026-08-22 08:20:01','2026-08-22 08:20:01',12000.00,NULL),(77,10,'102',2,1,'2026-08-22 08:20:01','2026-08-22 08:20:01',12000.00,NULL),(78,10,'103',2,1,'2026-08-22 08:20:02','2026-08-22 08:20:02',12000.00,NULL),(79,10,'104',2,1,'2026-08-22 08:20:02','2026-08-22 08:20:02',12000.00,NULL),(80,11,'201',2,1,'2026-08-22 08:20:03','2026-08-22 08:20:03',12000.00,NULL),(81,11,'202',2,1,'2026-08-22 08:20:04','2026-08-22 08:20:04',12000.00,NULL),(82,11,'203',2,1,'2026-08-22 08:20:04','2026-08-22 08:20:04',12000.00,NULL),(83,12,'101',2,1,'2026-08-22 08:21:15','2026-08-22 08:21:15',10000.00,NULL),(84,12,'102',2,1,'2026-08-22 08:21:16','2026-08-22 08:21:16',10000.00,NULL),(85,12,'103',2,1,'2026-08-22 08:21:16','2026-08-22 08:21:16',10000.00,NULL),(86,13,'201',2,1,'2026-08-22 08:21:17','2026-08-22 08:21:17',10000.00,NULL),(87,13,'202',2,1,'2026-08-22 08:21:17','2026-08-22 08:21:17',10000.00,NULL),(88,14,'101',2,1,'2026-08-22 08:23:45','2026-08-22 08:23:45',15000.00,NULL),(89,14,'102',2,1,'2026-08-22 08:23:45','2026-08-22 08:23:45',15000.00,NULL),(90,14,'103',2,1,'2026-08-22 08:23:46','2026-08-22 08:23:46',15000.00,NULL),(91,14,'104',2,1,'2026-08-22 08:23:46','2026-08-22 08:23:46',15000.00,NULL),(92,14,'105',2,1,'2026-08-22 08:23:47','2026-08-22 08:23:47',15000.00,NULL),(93,14,'106',2,1,'2026-08-22 08:23:47','2026-08-22 08:23:47',15000.00,NULL),(94,15,'201',2,1,'2026-08-22 08:23:48','2026-08-22 08:23:48',15000.00,NULL),(95,15,'202',2,1,'2026-08-22 08:23:49','2026-08-22 08:23:49',15000.00,NULL),(96,15,'203',2,1,'2026-08-22 08:23:49','2026-08-22 08:23:49',15000.00,NULL),(97,15,'204',2,1,'2026-08-22 08:23:50','2026-08-22 08:23:50',15000.00,NULL),(98,15,'205',2,1,'2026-08-22 08:23:50','2026-08-22 08:23:50',15000.00,NULL),(99,15,'206',2,1,'2026-08-22 08:23:51','2026-08-22 08:23:51',15000.00,NULL),(100,16,'301',2,1,'2026-08-22 08:23:52','2026-08-22 08:23:52',15000.00,NULL),(101,16,'302',2,1,'2026-08-22 08:23:52','2026-08-22 08:23:52',15000.00,NULL),(102,16,'303',2,1,'2026-08-22 08:23:53','2026-08-22 08:23:53',15000.00,NULL),(103,16,'304',2,1,'2026-08-22 08:23:53','2026-08-22 08:23:53',15000.00,NULL),(104,16,'305',2,1,'2026-08-22 08:23:54','2026-08-22 08:23:54',15000.00,NULL),(105,17,'101',2,1,'2026-08-22 08:25:42','2026-08-22 08:25:42',14000.00,NULL),(106,17,'102',2,1,'2026-08-22 08:25:43','2026-08-22 08:25:43',14000.00,NULL),(107,17,'103',2,1,'2026-08-22 08:25:43','2026-08-22 08:25:43',14000.00,NULL),(108,17,'104',2,1,'2026-08-22 08:25:44','2026-08-22 08:25:44',14000.00,NULL),(109,18,'201',2,1,'2026-08-22 08:25:45','2026-08-22 08:25:45',14000.00,NULL),(110,18,'202',2,1,'2026-08-22 08:25:45','2026-08-22 08:25:45',14000.00,NULL),(111,18,'203',2,1,'2026-08-22 08:25:46','2026-08-22 08:25:46',14000.00,NULL);
/*!40000 ALTER TABLE `rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_details`
--

DROP TABLE IF EXISTS `tenant_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `pg_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `residency` enum('national','international') NOT NULL,
  `aadhaar_id` varchar(20) DEFAULT NULL,
  `father_aadhaar_id` varchar(20) DEFAULT NULL,
  `c_form_number` varchar(50) DEFAULT NULL,
  `efrro_from` date DEFAULT NULL,
  `efrro_till` date DEFAULT NULL,
  `rent` decimal(10,2) NOT NULL,
  `security_fee` decimal(10,2) NOT NULL,
  `payment_date` int(11) NOT NULL COMMENT 'Day of month (1-31)',
  `paid_from` date NOT NULL,
  `paid_till` date NOT NULL,
  `arrival_date` date NOT NULL,
  `document_url` varchar(500) DEFAULT NULL,
  `document_public_id` varchar(255) DEFAULT NULL,
  `document_resource_type` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_tenant` (`tenant_id`),
  KEY `idx_pg_id` (`pg_id`),
  KEY `idx_room_id` (`room_id`),
  KEY `idx_efrro_till` (`efrro_till`),
  CONSTRAINT `fk_tenant_details_pg_id` FOREIGN KEY (`pg_id`) REFERENCES `pgs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tenant_details_room_id` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tenant_details_tenant_id` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_details`
--

LOCK TABLES `tenant_details` WRITE;
/*!40000 ALTER TABLE `tenant_details` DISABLE KEYS */;
INSERT INTO `tenant_details` VALUES (2,6,2,32,'international','201275598440','201275598440','ADFGBBCX','2026-07-22','2026-09-30',11000.00,8000.00,1,'2026-08-01','2026-09-01','2026-08-01',NULL,NULL,NULL,'2026-08-22 16:48:14','2026-08-22 16:48:14'),(3,7,2,15,'national','201275598440','201275598440','170626CH433T','0000-00-00','0000-00-00',11000.00,10500.00,14,'2026-08-14','2026-09-13','2026-06-14',NULL,NULL,NULL,'2026-08-22 18:32:50','2026-08-22 18:32:50'),(4,8,2,15,'international','null','null','170626CH433T','0000-00-00','2026-09-13',10000.00,10500.00,14,'2026-07-31','2026-08-30','2026-06-14',NULL,NULL,NULL,'2026-08-22 18:35:33','2026-08-22 19:46:06'),(8,13,2,16,'international','null','null','C21313rfff','2026-10-01','2027-08-31',10000.00,11000.00,14,'2026-08-01','2026-08-21','2026-08-01',NULL,NULL,NULL,'2026-09-24 13:57:01','2026-09-25 16:45:35'),(9,14,2,16,'international','null','null','C21313rfff','2026-09-06','2027-04-01',10000.00,11000.00,14,'2026-04-30','2026-08-21','2026-09-30',NULL,NULL,NULL,'2026-09-25 16:05:51','2026-09-25 16:44:29');
/*!40000 ALTER TABLE `tenant_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_devices`
--

DROP TABLE IF EXISTS `tenant_devices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant_devices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `fcm_token` varchar(255) NOT NULL,
  `device_type` enum('android','ios','web') DEFAULT 'android',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_tenant_device` (`tenant_id`,`fcm_token`),
  KEY `idx_tenant_devices_tenant_id` (`tenant_id`),
  KEY `idx_tenant_devices_fcm_token` (`fcm_token`),
  KEY `idx_tenant_devices_is_active` (`is_active`),
  CONSTRAINT `tenant_devices_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_devices`
--

LOCK TABLES `tenant_devices` WRITE;
/*!40000 ALTER TABLE `tenant_devices` DISABLE KEYS */;
INSERT INTO `tenant_devices` VALUES (2,6,'dEv9oTDQQ5qTB_f6i8iOG-:APA91bHYgEG5mhNwG3qR1Tleq5It_nzcybCOsUIn8atTD4dy6e5LDezjki5061-Wc8affqVtJ6tQvT26Z5N4Uu_Y0RVg0gmrEkVOFUGR_pM__Ph6NcSC6xs','android',1,'2026-08-22 16:49:47','2026-08-23 15:25:12'),(3,8,'eoNVDXU9S0qErgMiF1f2yR:APA91bGbpSm8nCBwDIO-NRVho88_u2ILApjZd43EOATRvu1cGuQvnlrXOj3mPgkf1E_v4CuhiCZ3OXKTemOVn_Tfy1df7XD2pqcepw_1Pl2ZDkxav-in20M','android',0,'2026-08-22 19:30:30','2026-08-22 20:45:38'),(4,7,'eoNVDXU9S0qErgMiF1f2yR:APA91bGbpSm8nCBwDIO-NRVho88_u2ILApjZd43EOATRvu1cGuQvnlrXOj3mPgkf1E_v4CuhiCZ3OXKTemOVn_Tfy1df7XD2pqcepw_1Pl2ZDkxav-in20M','android',1,'2026-08-22 21:22:06','2026-08-24 15:02:23'),(7,13,'eYxNxGYITV2URZUdpFUt7T:APA91bHiDnOrX_QnFEsxv_I8QbWXx44N9Yj_K5itgQHRkF-QgVJFuZVY0sqEUxVBY1zX-yVi16dvW0HAb7MOX2FVpL7QmCE8zETTqSIjXFhUy7eQ3s6jGQY','android',0,'2026-09-24 14:22:22','2026-09-25 16:11:50');
/*!40000 ALTER TABLE `tenant_devices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_documents`
--

DROP TABLE IF EXISTS `tenant_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant_documents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `document_url` varchar(500) NOT NULL,
  `document_public_id` varchar(255) NOT NULL,
  `document_resource_type` varchar(20) DEFAULT 'image',
  `document_type` varchar(50) DEFAULT 'id_proof',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `original_name` varchar(255) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tenant_id` (`tenant_id`),
  CONSTRAINT `fk_tenant_documents_tenant_id` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_documents`
--

LOCK TABLES `tenant_documents` WRITE;
/*!40000 ALTER TABLE `tenant_documents` DISABLE KEYS */;
INSERT INTO `tenant_documents` VALUES (1,8,'https://res.cloudinary.com/dlokcqf1h/image/upload/v1787446880/livinkey/tenants/8/documents/nfausevmm86r1vhu5uk7.jpg','livinkey/tenants/8/documents/nfausevmm86r1vhu5uk7','image','passport_photo','2026-08-22 19:31:21','doc_1787446878031.jpg',62897,'2026-08-22 19:31:21'),(2,8,'https://res.cloudinary.com/dlokcqf1h/image/upload/v1787446889/livinkey/tenants/8/documents/xhirgossagetsqealo72.jpg','livinkey/tenants/8/documents/xhirgossagetsqealo72','image','passport','2026-08-22 19:31:30','doc_1787446886279.jpg',66095,'2026-08-22 19:31:30'),(3,8,'https://res.cloudinary.com/dlokcqf1h/image/upload/v1787446900/livinkey/tenants/8/documents/wxglexixcd4qeqqvteho.jpg','livinkey/tenants/8/documents/wxglexixcd4qeqqvteho','image','visa','2026-08-22 19:31:41','doc_1787446897733.jpg',38207,'2026-08-22 19:31:41'),(4,8,'https://res.cloudinary.com/dlokcqf1h/image/upload/v1787446911/livinkey/tenants/8/documents/oznk7wm6bldx132plxnz.jpg','livinkey/tenants/8/documents/oznk7wm6bldx132plxnz','image','arrival_stamp','2026-08-22 19:31:52','doc_1787446908698.jpg',26804,'2026-08-22 19:31:52'),(5,8,'https://res.cloudinary.com/dlokcqf1h/image/upload/v1787446919/livinkey/tenants/8/documents/tl3ykoafckp6jn19gwk2.jpg','livinkey/tenants/8/documents/tl3ykoafckp6jn19gwk2','image','c_form','2026-08-22 19:32:00','doc_1787446916210.jpg',47196,'2026-08-22 19:32:00'),(6,8,'https://res.cloudinary.com/dlokcqf1h/image/upload/v1787446925/livinkey/tenants/8/documents/foz6qju4s8gg3ynxldnc.jpg','livinkey/tenants/8/documents/foz6qju4s8gg3ynxldnc','image','efrro','2026-08-22 19:32:06','doc_1787446924105.jpg',16677,'2026-08-22 19:32:06'),(7,8,'https://res.cloudinary.com/dlokcqf1h/image/upload/v1787446938/livinkey/tenants/8/documents/cdwkww05xwvhebr2r35u.jpg','livinkey/tenants/8/documents/cdwkww05xwvhebr2r35u','image','university_id','2026-08-22 19:32:19','doc_1787446935399.jpg',47196,'2026-08-22 19:32:19');
/*!40000 ALTER TABLE `tenant_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_feedbacks`
--

DROP TABLE IF EXISTS `tenant_feedbacks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant_feedbacks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `user_type` enum('tenant','guest') DEFAULT 'tenant',
  `pg_id` int(11) NOT NULL,
  `living_experience_rating` decimal(3,1) NOT NULL,
  `maintenance_handling_rating` decimal(3,1) NOT NULL,
  `communication_rating` decimal(3,1) NOT NULL,
  `amenities_rating` decimal(3,1) NOT NULL,
  `technology_handling_rating` decimal(3,1) NOT NULL,
  `overall_rating` decimal(3,1) NOT NULL,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_tenant_feedback` (`tenant_id`),
  KEY `idx_pg_id` (`pg_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_rating` (`overall_rating`),
  CONSTRAINT `tenant_feedbacks_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tenant_feedbacks_ibfk_2` FOREIGN KEY (`pg_id`) REFERENCES `pgs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tenant_feedbacks_chk_1` CHECK (`living_experience_rating` between 1 and 10),
  CONSTRAINT `tenant_feedbacks_chk_2` CHECK (`maintenance_handling_rating` between 1 and 10),
  CONSTRAINT `tenant_feedbacks_chk_3` CHECK (`communication_rating` between 1 and 10),
  CONSTRAINT `tenant_feedbacks_chk_4` CHECK (`amenities_rating` between 1 and 10),
  CONSTRAINT `tenant_feedbacks_chk_5` CHECK (`technology_handling_rating` between 1 and 10),
  CONSTRAINT `tenant_feedbacks_chk_6` CHECK (`overall_rating` between 1 and 10)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_feedbacks`
--

LOCK TABLES `tenant_feedbacks` WRITE;
/*!40000 ALTER TABLE `tenant_feedbacks` DISABLE KEYS */;
INSERT INTO `tenant_feedbacks` VALUES (2,8,'tenant',2,10.0,9.0,10.0,10.0,10.0,9.8,NULL,'2026-08-22 19:33:54','2026-08-22 19:33:54');
/*!40000 ALTER TABLE `tenant_feedbacks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_notifications`
--

DROP TABLE IF EXISTS `tenant_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant_notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `type` enum('bill_created','bill_paid','bill_partially_paid','bill_overdue','bill_fine_applied','maintenance_created','maintenance_started','maintenance_completed','document_reminder','efrro_expiry','payment_reminder','feedback_submitted','bill_fine_adjusted') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `link` varchar(500) DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `color` varchar(20) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `read_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `tenant_notifications_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_notifications`
--

LOCK TABLES `tenant_notifications` WRITE;
/*!40000 ALTER TABLE `tenant_notifications` DISABLE KEYS */;
INSERT INTO `tenant_notifications` VALUES (2,6,'maintenance_created','Maintenance Request Submitted','Your Electrician request has been submitted.',1,'maintenance','/maintenance/my-requests','?','#f39c12',0,NULL,'2026-08-22 16:53:22'),(3,6,'maintenance_started','Maintenance Started','Your Electrician request is now in progress.',1,'maintenance','/maintenance/my-requests','?','#3498db',0,NULL,'2026-08-22 16:55:41'),(4,8,'feedback_submitted','Thank You for Your Feedback!','We appreciate you taking the time to share your experience with us.',NULL,'feedback','/profile','⭐','#f39c12',1,'2026-08-23 06:39:15','2026-08-22 19:33:54'),(5,8,'maintenance_created','Maintenance Request Submitted','Your Electrician request has been submitted.',2,'maintenance','/maintenance/my-requests','?','#f39c12',1,'2026-08-23 06:39:15','2026-08-22 19:35:11'),(6,8,'maintenance_created','Maintenance Request Submitted','Your Cleaning request has been submitted.',3,'maintenance','/maintenance/my-requests','?','#f39c12',1,'2026-08-23 06:39:15','2026-08-22 19:35:55'),(7,8,'maintenance_created','Maintenance Request Submitted','Your Check-out request has been submitted.',4,'maintenance','/maintenance/my-requests','?','#f39c12',1,'2026-08-23 06:39:15','2026-08-22 19:36:14'),(8,8,'maintenance_started','Maintenance Started','Your Check-out request is now in progress.',4,'maintenance','/maintenance/my-requests','?','#3498db',1,'2026-08-23 06:41:20','2026-08-22 19:40:59'),(9,8,'maintenance_started','Maintenance Started','Your Cleaning request is now in progress.',3,'maintenance','/maintenance/my-requests','?','#3498db',1,'2026-08-23 06:41:59','2026-08-22 19:41:28'),(10,8,'maintenance_started','Maintenance Started','Your Electrician request is now in progress.',2,'maintenance','/maintenance/my-requests','?','#3498db',1,'2026-08-23 06:41:59','2026-08-22 19:41:32'),(11,6,'maintenance_completed','Maintenance Completed','Your Electrician request has been completed.',1,'maintenance','/maintenance/my-requests','✅','#2ecc71',0,NULL,'2026-08-22 19:41:35'),(12,8,'maintenance_completed','Maintenance Completed','Your Electrician request has been completed.',2,'maintenance','/maintenance/my-requests','✅','#2ecc71',1,'2026-08-23 06:41:59','2026-08-22 19:41:36'),(13,8,'maintenance_completed','Maintenance Completed','Your Cleaning request has been completed.',3,'maintenance','/maintenance/my-requests','✅','#2ecc71',1,'2026-08-23 06:41:59','2026-08-22 19:41:37'),(14,8,'maintenance_completed','Maintenance Completed','Your Check-out request has been completed.',4,'maintenance','/maintenance/my-requests','✅','#2ecc71',1,'2026-08-23 06:41:59','2026-08-22 19:41:38'),(23,8,'efrro_expiry','e-FRRO Expiry Alert','Your e-FRRO expires in 21 days. Please renew immediately.',NULL,'document','/documents','?','#e74c3c',0,NULL,'2026-08-22 22:00:04'),(24,7,'bill_created','New Bill Generated','A new bill of ₹11000.00 has been generated for you.',4,'bill','/tenant-payments/bill','?','#3498db',1,'2026-08-23 09:02:47','2026-08-22 22:02:08'),(38,7,'maintenance_created','Maintenance Request Submitted','Your RO request has been submitted.',8,'maintenance','/maintenance/my-requests','?','#f39c12',0,NULL,'2026-08-24 15:03:02'),(39,7,'maintenance_started','Maintenance Started','Your RO request is now in progress.',8,'maintenance','/maintenance/my-requests','?','#3498db',0,NULL,'2026-08-24 15:04:46'),(40,7,'maintenance_created','Maintenance Request Submitted','Your Electrician request has been submitted.',9,'maintenance','/maintenance/my-requests','?','#f39c12',0,NULL,'2026-08-24 15:10:35'),(41,7,'maintenance_completed','Maintenance Completed','Your RO request has been completed.',8,'maintenance','/maintenance/my-requests','✅','#2ecc71',0,NULL,'2026-08-24 15:10:47'),(42,7,'maintenance_started','Maintenance Started','Your Electrician request is now in progress.',9,'maintenance','/maintenance/my-requests','?','#3498db',0,NULL,'2026-08-24 15:10:59'),(43,7,'maintenance_completed','Maintenance Completed','Your Electrician request has been completed.',9,'maintenance','/maintenance/my-requests','✅','#2ecc71',0,NULL,'2026-08-24 15:15:08'),(44,7,'maintenance_created','Maintenance Request Submitted','Your Check-out request has been submitted.',10,'maintenance','/maintenance/my-requests','?','#f39c12',0,NULL,'2026-08-24 15:15:57'),(45,7,'maintenance_started','Maintenance Started','Your Check-out request is now in progress.',10,'maintenance','/maintenance/my-requests','?','#3498db',0,NULL,'2026-08-24 15:16:06'),(46,7,'maintenance_completed','Maintenance Completed','Your Check-out request has been completed.',10,'maintenance','/maintenance/my-requests','✅','#2ecc71',0,NULL,'2026-08-24 15:16:41'),(47,13,'','Welcome','Please, download our app from PlayStore or AppStore',NULL,'admin_message','/tenant-notifications','?','#3498db',1,'2026-09-24 19:53:25','2026-09-24 13:59:03'),(48,13,'bill_created','New Bill Generated','(Admin) A new bill of ₹11756.00 has been generated for you.',6,'bill','/tenant-payments/bill','?','#3498db',1,'2026-09-24 19:53:29','2026-09-24 14:03:59'),(49,13,'','Payment Proof Verified','(Admin) Your payment proof of ₹9000 has been verified.',6,'bill','/tenant-payments/history','✅','#2ecc71',1,'2026-09-25 21:39:23','2026-09-24 14:33:20'),(50,13,'bill_partially_paid','Partial Payment Received','(Admin) Your partial payment of ₹9000 has been received.',6,'bill','/tenant-payments/history','?','#f39c12',1,'2026-09-25 21:39:23','2026-09-24 14:33:21'),(51,13,'bill_paid','Payment Confirmed','Your payment of ₹11756.00 has been confirmed.',6,'bill','/tenant-payments/history','✅','#2ecc71',1,'2026-09-25 20:32:23','2026-09-24 14:39:10'),(52,13,'bill_created','New Bill Generated','(Admin) A new bill of ₹10600.00 has been generated for you.',7,'bill','/tenant-payments/bill','?','#3498db',1,'2026-09-25 20:20:00','2026-09-25 14:35:16'),(53,13,'','Nakupa Hi','Mr. Manyama Hi',NULL,'admin_message','/tenant-notifications','?','#3498db',1,'2026-09-25 21:39:23','2026-09-25 15:58:22'),(54,13,'','Payment Proof Verified','(Admin) Your payment proof of ₹10600 has been verified.',7,'bill','/tenant-payments/history','✅','#2ecc71',1,'2026-09-25 21:39:23','2026-09-25 15:59:16'),(55,13,'bill_paid','Payment Confirmed','(Admin) Your payment of ₹10600 has been confirmed.',7,'bill','/tenant-payments/history','✅','#2ecc71',1,'2026-09-25 21:39:23','2026-09-25 15:59:17'),(56,13,'bill_created','New Bill Generated','(Admin) A new bill of ₹13080.00 has been generated for you.',8,'bill','/tenant-payments/bill','?','#3498db',1,'2026-09-25 21:39:23','2026-09-25 16:08:19'),(57,14,'bill_created','New Bill Generated','(Admin) A new bill of ₹13080.00 has been generated for you.',9,'bill','/tenant-payments/bill','?','#3498db',0,NULL,'2026-09-25 16:08:25'),(58,13,'','Payment Proof Verified','(Admin) Your payment proof of ₹7000 has been verified.',8,'bill','/tenant-payments/history','✅','#2ecc71',0,NULL,'2026-09-25 16:11:12'),(59,13,'bill_partially_paid','Partial Payment Received','(Admin) Your partial payment of ₹7000 has been received.',8,'bill','/tenant-payments/history','?','#f39c12',0,NULL,'2026-09-25 16:11:12');
/*!40000 ALTER TABLE `tenant_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenants`
--

DROP TABLE IF EXISTS `tenants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenants` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role` enum('tenant','guest') NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `nationality` varchar(100) NOT NULL,
  `country_code` varchar(10) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `international_phone` varchar(50) DEFAULT NULL,
  `gender` enum('male','female','other') NOT NULL,
  `residency` enum('national','international') DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `password` varchar(255) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `must_change_password` tinyint(1) DEFAULT 0,
  `otp` varchar(255) DEFAULT NULL,
  `otp_expiry` datetime DEFAULT NULL,
  `otp_sent_at` datetime DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tenants_email` (`email`),
  UNIQUE KEY `uq_country_phone` (`country_code`,`phone`),
  KEY `idx_created_by` (`created_by`),
  CONSTRAINT `fk_tenants_created_by` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenants`
--

LOCK TABLES `tenants` WRITE;
/*!40000 ALTER TABLE `tenants` DISABLE KEYS */;
INSERT INTO `tenants` VALUES (6,'tenant','Sri Ram','sriramprasad1662@gmail.com','Tanzanian','+91','9381124050',NULL,'male','international',1,'$2b$12$dreVE/r.mK2fWEXr80/5TOMm7z2nJXjgZrrRzj5TGrxcTIqfZhNc2',1,'2026-08-22 16:48:13','2026-08-22 16:50:41',0,NULL,NULL,NULL,NULL,NULL),(7,'tenant','Mohammed Aminu Shehe','mosnake111@gmail.com','Indian','+91','677532140',NULL,'male','national',1,'$2b$12$71/NNxxWoumM4.tpd1bZquVk6GAmXOBHxOFA6lPYIaUNjO855viqa',1,'2026-08-22 18:32:50','2026-08-22 21:22:22',0,NULL,NULL,NULL,NULL,NULL),(8,'tenant','Abdul-Warith Aminu','fourbrothers10112627@gmail.com','Tanzanian','+91','777730606','+255 677 532 140','male','international',1,'$2b$12$ieuuNh0jsbvzFFXIhf7GyuEmhbqvnne/b6/16cViO8/ob6dIDHZbm',1,'2026-08-22 18:35:33','2026-08-22 19:30:46',0,NULL,NULL,NULL,NULL,NULL),(13,'tenant','Little','abdulwarithshehe2010@gmail.com','Tanzanian','+91','7681969865','+255 677 532 140','male','international',1,'$2b$12$sK6O3tpfuEHWyO6sXp68rOThzyuBPB5yC/Hjh0fEfxl.do79q5nbC',1,'2026-09-24 13:57:01','2026-09-24 14:22:38',0,NULL,NULL,NULL,NULL,NULL),(14,'tenant','MO11','molittle1011@gmail.com','Tanzanian','+91','987653718','+255 677 532 149','male','international',1,'$2b$12$W/c9DuB0ZGVr7sPYhOD/.eygqKlv2utATcd8wduRIQeTNv0rmsdVy',1,'2026-09-25 16:05:51','2026-09-25 16:12:43',0,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `tenants` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-25 22:28:27
