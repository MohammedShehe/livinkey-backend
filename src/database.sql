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
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_notifications`
--

LOCK TABLES `admin_notifications` WRITE;
/*!40000 ALTER TABLE `admin_notifications` DISABLE KEYS */;
INSERT INTO `admin_notifications` VALUES (1,1,'feedback_submitted','New Feedback Received','Mohammed Aminu Shehe gave 8.0/10 rating for Happy Living PG',1,'feedback','/feedbacks/1','⭐','#f39c12',1,'2026-08-12 08:47:08','2026-08-16 16:57:44'),(3,1,'maintenance_created','New Maintenance Request','Mohammed Aminu Shehe requested Plumber for Room 101',1,'maintenance','/maintenance/1','?','#3498db',1,'2026-08-12 16:02:12','2026-08-16 16:57:44'),(5,1,'pg_created','New PG Created','PG \"Hii Najaribu\" has been created',2,'pg','/pgs/2','?','#2ecc71',1,'2026-08-15 13:17:16','2026-08-16 16:57:44'),(7,1,'pg_updated','PG Updated','PG \"Hii Najaribu\" has been updated',2,'pg','/pgs/2','?️','#3498db',1,'2026-08-15 13:22:09','2026-08-16 16:57:44'),(9,1,'pg_updated','PG Updated','PG \"Happy Living PG\" has been updated',1,'pg','/pgs/1','?️','#3498db',1,'2026-08-15 13:34:36','2026-08-16 16:57:44'),(11,1,'pg_updated','PG Updated','PG \"Hii Najaribu\" has been updated',2,'pg','/pgs/2','?️','#3498db',1,'2026-08-15 13:40:14','2026-08-16 16:57:44'),(13,1,'pg_updated','PG Updated','PG \"Hii Najaribu\" has been updated',2,'pg','/pgs/2','?️','#3498db',1,'2026-08-15 13:40:52','2026-08-16 16:57:44'),(15,1,'pg_updated','PG Updated','PG \"Hii Najaribu\" has been updated',2,'pg','/pgs/2','?️','#3498db',1,'2026-08-15 13:41:03','2026-08-16 16:57:44'),(17,1,'pg_updated','PG Updated','PG \"Hii Najaribu\" has been updated',2,'pg','/pgs/2','?️','#3498db',1,'2026-08-15 13:50:27','2026-08-16 16:57:44'),(19,1,'tenant_registered','New Tenant Registered','Mohammed Aminu Shehe has been registered as a tenant',1,'tenant','/tenants/1','?','#2ecc71',1,'2026-08-15 16:21:06','2026-08-16 16:57:44'),(21,1,'tenant_registered','New Tenant Registered','Mohammed Aminu Shehe has been registered as a tenant',1,'tenant','/tenants/1','?','#2ecc71',1,'2026-08-15 16:46:15','2026-08-16 16:57:44'),(23,1,'tenant_registered','New Tenant Registered','Mohammed Aminu Shehe has been registered as a tenant',2,'tenant','/tenants/2','?','#2ecc71',1,'2026-08-15 16:53:47','2026-08-16 16:57:44'),(25,1,'tenant_registered','New Tenant Registered','Mohammed Aminu Shehe has been registered as a tenant',1,'tenant','/tenants/1','?','#2ecc71',1,'2026-08-15 17:08:35','2026-08-16 16:57:44'),(27,1,'tenant_registered','New Tenant Registered','Mohammed Aminu Shehe has been registered as a tenant',3,'tenant','/tenants/3','?','#2ecc71',1,'2026-08-15 17:37:13','2026-08-16 16:57:44'),(29,1,'tenant_registered','New Tenant Registered','Mohammed Aminu Shehe has been registered as a tenant',1,'tenant','/tenants/1','?','#2ecc71',1,'2026-08-15 17:47:47','2026-08-16 16:57:44'),(31,1,'tenant_registered','New Tenant Registered','Mohammed Aminu Shehe has been registered as a tenant',3,'tenant','/tenants/3','?','#2ecc71',1,'2026-08-15 18:28:53','2026-08-16 16:57:44'),(33,1,'tenant_registered','New Tenant Registered','Mohammed Aminu Shehe has been registered as a tenant',4,'tenant','/tenants/4','?','#2ecc71',1,'2026-08-15 18:32:51','2026-08-16 16:57:44'),(35,1,'tenant_registered','New Tenant Registered','Abdul-warith Shehe has been registered as a tenant',5,'tenant','/tenants/5','?','#2ecc71',1,'2026-08-15 18:35:56','2026-08-16 16:57:44'),(37,1,'tenant_registered','New Tenant Registered','Abdul-warith Shehe has been registered as a tenant',1,'tenant','/tenants/1','?','#2ecc71',1,'2026-08-15 18:51:36','2026-08-16 16:57:44'),(39,1,'tenant_registered','New Tenant Registered','Abdul-warith Shehe has been registered as a tenant',1,'tenant','/tenants/1','?','#2ecc71',1,'2026-08-15 19:03:27','2026-08-16 16:57:44'),(41,1,'tenant_registered','New Tenant Registered','Milah has been registered as a tenant',3,'tenant','/tenants/3','?','#2ecc71',1,'2026-08-15 19:07:09','2026-08-16 16:57:44'),(43,1,'tenant_registered','New Tenant Registered','Wa Tatu has been registered as a tenant',4,'tenant','/tenants/4','?','#2ecc71',1,'2026-08-15 19:11:34','2026-08-16 16:57:44'),(45,1,'tenant_registered','New Tenant Registered','Wa nne has been registered as a tenant',5,'tenant','/tenants/5','?','#2ecc71',1,'2026-08-15 19:11:38','2026-08-16 16:57:44'),(47,1,'guest_registered','New Guest Registered','FOUR BROTHERS has been registered as a guest',6,'guest','/tenants/6','?','#1abc9c',1,'2026-08-15 19:29:26','2026-08-16 16:57:44'),(49,1,'guest_registered','New Guest Registered','FOUR BROTHERS has been registered as a guest',7,'guest','/tenants/7','?','#1abc9c',1,'2026-08-15 20:12:18','2026-08-16 16:57:39'),(51,1,'guest_registered','New Guest Registered','FOUR BROTHERS has been registered as a guest',8,'guest','/tenants/8','?','#1abc9c',1,'2026-08-15 21:32:53','2026-08-16 16:57:44'),(53,1,'admin_created','New Admin Created','Admin \"Mohammed Aminu Shehe\" has been created',8,'admin','/admins/8','?‍?','#3498db',1,'2026-08-15 21:53:30','2026-08-16 16:57:44'),(54,1,'pg_updated','PG Updated','PG \"Hii Najaribu Tu\" has been updated',2,'pg','/pgs/2','?️','#3498db',1,'2026-08-15 22:04:45','2026-08-16 16:57:36'),(56,1,'pg_updated','PG Updated','PG \"Hii Najaribu\" has been updated',2,'pg','/pgs/2','?️','#3498db',1,'2026-08-15 22:05:32','2026-08-16 16:57:44'),(58,1,'tenant_registered','New Tenant Registered','Abdul-warith Shehe has been registered as a tenant',9,'tenant','/tenants/9','?','#2ecc71',1,'2026-08-16 01:28:15','2026-08-16 16:57:44'),(59,1,'bill_created','New Bill Generated','Bill of ₹12510.00 created for undefined',8,'bill','/bills/8','?','#3498db',1,'2026-08-16 01:32:18','2026-08-16 16:57:34'),(60,1,'tenant_registered','New Tenant Registered','MO11 has been registered as a tenant',10,'tenant','/tenants/10','?','#2ecc71',1,'2026-08-16 01:34:22','2026-08-16 16:57:44'),(61,1,'bill_created','New Bill Generated','Bill of ₹14990.00 created for undefined',9,'bill','/bills/9','?','#3498db',1,'2026-08-16 01:35:31','2026-08-16 16:57:44'),(62,1,'bill_paid','Bill Paid','MO11 has paid the bill of ₹14990.00',9,'bill','/bills/9','✅','#2ecc71',1,'2026-08-16 01:40:36','2026-08-16 16:57:44'),(63,1,'bill_partially_paid','Partial Payment Made','Abdul-warith Shehe made a partial payment of ₹11000.00',8,'bill','/bills/8','?','#f39c12',1,'2026-08-16 01:41:35','2026-08-16 16:57:44'),(64,1,'bill_created','New Bill Generated','Bill of ₹12500.00 created for undefined',10,'bill','/bills/10','?','#3498db',1,'2026-08-16 02:01:22','2026-08-16 16:57:32'),(65,1,'bill_created','New Bill Generated','Bill of ₹12500.00 created for undefined',11,'bill','/bills/11','?','#3498db',1,'2026-08-16 02:01:43','2026-08-16 16:57:44'),(66,1,'cash_payment_verified','Cash Payment Verified','Cash payment of ₹12500.00 verified for MO11',10,'bill','/bills/10','?','#2ecc71',1,'2026-08-16 10:31:51','2026-08-16 16:57:29'),(67,1,'tenant_registered','New Tenant Registered','Mohammed Aminu Shehe has been registered as a tenant',1,'tenant','/tenants/1','?','#2ecc71',1,'2026-08-16 13:10:49','2026-08-16 19:38:01'),(68,1,'maintenance_created','New Maintenance Request','Mohammed Aminu Shehe requested AC for Room 103',2,'maintenance','/maintenance/2','?','#3498db',1,'2026-08-16 15:10:17','2026-08-16 21:24:12'),(69,1,'maintenance_updated','Maintenance Request Started','AC request for Room 103 is now in_progress',2,'maintenance','/maintenance/2','?','#f39c12',1,'2026-08-16 17:32:06','2026-08-16 23:34:59'),(70,1,'maintenance_updated','Maintenance Request Completed','AC request for Room 103 is now completed',2,'maintenance','/maintenance/2','?','#f39c12',1,'2026-08-16 17:32:26','2026-08-16 23:34:59'),(71,1,'bill_created','New Bill Generated','Bill of ₹12799.00 created for undefined',12,'bill','/bills/12','?','#3498db',1,'2026-08-16 17:36:02','2026-08-16 23:34:59');
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `admin_id` (`admin_id`,`module_name`),
  CONSTRAINT `admin_permissions_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_permissions`
--

LOCK TABLES `admin_permissions` WRITE;
/*!40000 ALTER TABLE `admin_permissions` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'Super Admin','molittle1011@gmail.com',NULL,'$2b$12$6V2v.oUhzW7r2qhvZaVnSeYJJ9uXONALQRrPqBk71WPhscPXBdHk2',0,'super_admin',NULL,NULL,NULL,NULL,NULL,1,'2026-08-01 19:54:33','2026-08-16 13:09:14','2026-08-16 18:38:48',NULL,NULL);
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
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
  `is_partial` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_bill_id` (`bill_id`),
  CONSTRAINT `fk_bill_payments_bill_id` FOREIGN KEY (`bill_id`) REFERENCES `bills` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bill_payments`
--

LOCK TABLES `bill_payments` WRITE;
/*!40000 ALTER TABLE `bill_payments` DISABLE KEYS */;
INSERT INTO `bill_payments` VALUES (3,9,14990.00,'2026-08-16 07:10:31','cash','AGSAHt566G',0,'2026-08-16 01:40:31'),(4,8,11000.00,'2026-08-16 07:11:30','online','cgcywchwcgyw',0,'2026-08-16 01:41:30');
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
  `rent_amount` decimal(10,2) NOT NULL,
  `electricity_amount` decimal(10,2) DEFAULT 0.00,
  `electricity_meter_image` varchar(500) DEFAULT NULL,
  `electricity_meter_public_id` varchar(255) DEFAULT NULL,
  `electricity_meter_resource_type` varchar(20) DEFAULT 'image',
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
  PRIMARY KEY (`id`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_status` (`status`),
  KEY `idx_valid_until` (`valid_until`),
  KEY `fk_bills_created_by` (`created_by`),
  KEY `idx_qr_expires_at` (`qr_expires_at`),
  CONSTRAINT `fk_bills_created_by` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bills_tenant_id` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bills`
--

LOCK TABLES `bills` WRITE;
/*!40000 ALTER TABLE `bills` DISABLE KEYS */;
INSERT INTO `bills` VALUES (8,9,11000.00,1200.00,NULL,NULL,NULL,300.00,10.00,12510.00,11000.00,0.00,'partially_paid','https://res.cloudinary.com/dlokcqf1h/image/upload/v1786844493/livinkey/bills/qr/ywf4fzhuw6hbphqv301d.png','livinkey/bills/qr/ywf4fzhuw6hbphqv301d','image','https://res.cloudinary.com/dlokcqf1h/image/upload/v1786844494/livinkey/bills/qr/ygpw1aeqtumdkuriozal.png','livinkey/bills/qr/ygpw1aeqtumdkuriozal','image','2026-08-16 07:02:15','2026-08-23 07:02:15',1,'2026-08-16 01:32:15','2026-08-16 01:51:25',0,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'upi',NULL,'LIVMSV5FCSX82A30F8D',NULL,NULL,'upi://pay?pa=your_merchant%40upi&pn=Livinkey&am=1510&tn=Payment+for+PG+Rent&cu=INR&mc=LIVINKEY&tid=LIVMSV5FCSX82A30F8D','https://res.cloudinary.com/dlokcqf1h/image/upload/v1786845083/livinkey/payments/qr/fsepvim5h6jazghy35h1.png','livinkey/payments/qr/fsepvim5h6jazghy35h1','image'),(9,10,12000.00,2690.00,'https://res.cloudinary.com/dlokcqf1h/image/upload/v1786844123/livinkey/bills/meters/vzhwurxehigu0kv5vid7.jpg','livinkey/bills/meters/vzhwurxehigu0kv5vid7','image',300.00,0.00,14990.00,14990.00,0.00,'paid','https://res.cloudinary.com/dlokcqf1h/image/upload/v1786844434/livinkey/bills/qr/dkfqt3gfyidlgc5rrgcb.png','livinkey/bills/qr/dkfqt3gfyidlgc5rrgcb','image','https://res.cloudinary.com/dlokcqf1h/image/upload/v1786844435/livinkey/bills/qr/a3rfmmtyzzrpnm4orf79.png','livinkey/bills/qr/a3rfmmtyzzrpnm4orf79','image','2026-08-16 07:05:28','2026-08-23 07:05:28',1,'2026-08-16 01:35:28','2026-08-16 01:40:36',0,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'upi',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(10,10,11000.00,1200.00,NULL,NULL,NULL,300.00,0.00,12500.00,12500.00,0.00,'paid','https://res.cloudinary.com/dlokcqf1h/image/upload/v1786876309/livinkey/bills/qr/thhhatvdmbwhdkdzeeoq.png','livinkey/bills/qr/thhhatvdmbwhdkdzeeoq','image','https://res.cloudinary.com/dlokcqf1h/image/upload/v1786876310/livinkey/bills/qr/r1wwycfnhodffxng8ig8.png','livinkey/bills/qr/r1wwycfnhodffxng8ig8','image','2026-08-16 07:31:19','2026-08-23 07:31:19',1,'2026-08-16 02:01:19','2026-08-16 10:31:51',0,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'2026-08-16 16:01:46','upi',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(11,9,11000.00,1200.00,NULL,NULL,NULL,300.00,0.00,12500.00,0.00,0.00,'unpaid','https://res.cloudinary.com/dlokcqf1h/image/upload/v1786845697/livinkey/bills/qr/z5f5sdaly3jo0iqowcym.png','livinkey/bills/qr/z5f5sdaly3jo0iqowcym','image','https://res.cloudinary.com/dlokcqf1h/image/upload/v1786845698/livinkey/bills/qr/uvv8eysj8abvzjnkg2kv.png','livinkey/bills/qr/uvv8eysj8abvzjnkg2kv','image','2026-08-16 07:31:40','2026-08-23 07:31:40',1,'2026-08-16 02:01:40','2026-08-16 10:38:15',0,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'upi',NULL,'LIVMSVO8UP8548AF8B3',NULL,NULL,'upi://pay?pa=your_merchant%40upi&pn=Livinkey&am=12500&tn=Payment+for+PG+Rent&cu=INR&mc=LIVINKEY&tid=LIVMSVO8UP8548AF8B3','https://res.cloudinary.com/dlokcqf1h/image/upload/v1786876692/livinkey/payments/qr/ykddujwltrnu4gasta1l.png','livinkey/payments/qr/ykddujwltrnu4gasta1l','image'),(12,1,10000.00,2499.00,'https://res.cloudinary.com/dlokcqf1h/image/upload/v1786901754/livinkey/bills/meters/leydtrzklbrcswar9k5u.jpg','livinkey/bills/meters/leydtrzklbrcswar9k5u','image',300.00,0.00,12799.00,0.00,0.00,'unpaid','https://res.cloudinary.com/dlokcqf1h/image/upload/v1786901756/livinkey/bills/qr/tgoueq1omkqrcraojgef.png','livinkey/bills/qr/tgoueq1omkqrcraojgef','image','https://res.cloudinary.com/dlokcqf1h/image/upload/v1786901757/livinkey/bills/qr/bn6ztfk8587kaevxyndo.png','livinkey/bills/qr/bn6ztfk8587kaevxyndo','image','2026-08-16 23:05:58','2026-08-23 23:05:58',1,'2026-08-16 17:35:58','2026-08-16 17:35:58',0,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'upi',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cash_payments`
--

LOCK TABLES `cash_payments` WRITE;
/*!40000 ALTER TABLE `cash_payments` DISABLE KEYS */;
INSERT INTO `cash_payments` VALUES (2,10,10,12500.00,'2026-08-16','2026-09-16','2026-08-16 16:01:46',1,'3915','verified','Paid full','2026-08-16 10:31:46');
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_pg_floor` (`pg_id`,`floor_number`),
  KEY `idx_pg_id` (`pg_id`),
  CONSTRAINT `fk_floors_pg_id` FOREIGN KEY (`pg_id`) REFERENCES `pgs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `floors`
--

LOCK TABLES `floors` WRITE;
/*!40000 ALTER TABLE `floors` DISABLE KEYS */;
INSERT INTO `floors` VALUES (18,2,1,'2026-08-15 22:05:32','2026-08-15 22:05:32'),(19,2,2,'2026-08-15 22:05:32','2026-08-15 22:05:32');
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guest_notifications`
--

LOCK TABLES `guest_notifications` WRITE;
/*!40000 ALTER TABLE `guest_notifications` DISABLE KEYS */;
INSERT INTO `guest_notifications` VALUES (1,17,'pg_added','New PG Available','A new PG \"Hii Najaribu\" has been added. Check it out!',2,'pg','/public/pgs/2','?','#2ecc71',0,NULL,'2026-08-15 13:17:16'),(2,18,'pg_added','New PG Available','A new PG \"Hii Najaribu\" has been added. Check it out!',2,'pg','/public/pgs/2','?','#2ecc71',0,NULL,'2026-08-15 13:17:16'),(3,20,'pg_added','New PG Available','A new PG \"Hii Najaribu\" has been added. Check it out!',2,'pg','/public/pgs/2','?','#2ecc71',0,NULL,'2026-08-15 13:17:16'),(4,17,'pg_updated','PG Updated','PG \"Hii Najaribu\" has been updated with new details.',2,'pg','/public/pgs/2','?️','#3498db',0,NULL,'2026-08-15 13:22:09'),(5,18,'pg_updated','PG Updated','PG \"Hii Najaribu\" has been updated with new details.',2,'pg','/public/pgs/2','?️','#3498db',0,NULL,'2026-08-15 13:22:09'),(6,20,'pg_updated','PG Updated','PG \"Hii Najaribu\" has been updated with new details.',2,'pg','/public/pgs/2','?️','#3498db',0,NULL,'2026-08-15 13:22:09');
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
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `room_id` (`room_id`),
  KEY `idx_status` (`status`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_issue_type` (`issue_type`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `maintenance_requests_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `maintenance_requests_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maintenance_requests`
--

LOCK TABLES `maintenance_requests` WRITE;
/*!40000 ALTER TABLE `maintenance_requests` DISABLE KEYS */;
INSERT INTO `maintenance_requests` VALUES (2,1,36,'AC','AC is not working','2026-08-17','8:30 PM',NULL,NULL,NULL,'completed',1,'2026-08-16 15:10:17','2026-08-16 17:32:26');
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
  `proof_url` varchar(500) NOT NULL,
  `proof_public_id` varchar(255) NOT NULL,
  `proof_resource_type` varchar(20) DEFAULT 'image',
  `status` enum('pending','verified','rejected') DEFAULT 'pending',
  `admin_notes` text DEFAULT NULL,
  `verified_by` int(11) DEFAULT NULL,
  `verified_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `bill_id` (`bill_id`),
  KEY `tenant_id` (`tenant_id`),
  KEY `verified_by` (`verified_by`),
  KEY `idx_status` (`status`),
  KEY `idx_transaction_id` (`transaction_id`),
  CONSTRAINT `payment_proofs_ibfk_1` FOREIGN KEY (`bill_id`) REFERENCES `bills` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payment_proofs_ibfk_2` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payment_proofs_ibfk_3` FOREIGN KEY (`verified_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_proofs`
--

LOCK TABLES `payment_proofs` WRITE;
/*!40000 ALTER TABLE `payment_proofs` DISABLE KEYS */;
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
  KEY `idx_bill_id` (`bill_id`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_gateway_order_id` (`gateway_order_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_payment_transactions_bill_id` FOREIGN KEY (`bill_id`) REFERENCES `bills` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_payment_transactions_tenant_id` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_transactions`
--

LOCK TABLES `payment_transactions` WRITE;
/*!40000 ALTER TABLE `payment_transactions` DISABLE KEYS */;
INSERT INTO `payment_transactions` VALUES (1,8,9,1510.00,'upi','upi_qr','LIVMSV5536M300896F0',NULL,'pending','upi://pay?pa=your_merchant%40upi&pn=Livinkey&am=1510&tn=Payment+for+PG+Rent&cu=INR&mc=LIVINKEY&tid=LIVMSV5536M300896F0','your_merchant@upi','2026-08-16 07:13:26',NULL,0,'2026-08-16 01:43:26','2026-08-16 01:43:26'),(2,8,9,1510.00,'upi','upi_qr','LIVMSV5FCSX82A30F8D',NULL,'pending','upi://pay?pa=your_merchant%40upi&pn=Livinkey&am=1510&tn=Payment+for+PG+Rent&cu=INR&mc=LIVINKEY&tid=LIVMSV5FCSX82A30F8D','your_merchant@upi','2026-08-16 07:21:25',NULL,0,'2026-08-16 01:51:25','2026-08-16 01:51:25'),(3,11,9,12500.00,'upi','upi_qr','LIVMSVO8UP8548AF8B3',NULL,'pending','upi://pay?pa=your_merchant%40upi&pn=Livinkey&am=12500&tn=Payment+for+PG+Rent&cu=INR&mc=LIVINKEY&tid=LIVMSVO8UP8548AF8B3','your_merchant@upi','2026-08-16 16:08:15',NULL,0,'2026-08-16 10:38:15','2026-08-16 10:38:15');
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
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pg_amenities`
--

LOCK TABLES `pg_amenities` WRITE;
/*!40000 ALTER TABLE `pg_amenities` DISABLE KEYS */;
INSERT INTO `pg_amenities` VALUES (61,2,'Free WiFi',0,'2026-08-15 22:05:32'),(62,2,'24×7 Assistance',0,'2026-08-15 22:05:32'),(63,2,'24×7 Power Backup',0,'2026-08-15 22:05:32'),(64,2,'Ventilated Rooms',0,'2026-08-15 22:05:32'),(65,2,'CCTV',0,'2026-08-15 22:05:32'),(66,2,'AC',0,'2026-08-15 22:05:32'),(67,2,'Water Free',1,'2026-08-15 22:05:32');
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pg_images`
--

LOCK TABLES `pg_images` WRITE;
/*!40000 ALTER TABLE `pg_images` DISABLE KEYS */;
INSERT INTO `pg_images` VALUES (2,2,'https://res.cloudinary.com/dlokcqf1h/image/upload/v1786800127/livinkey/pgs/images/m2yys2umdirbrk5idkmq.webp','livinkey/pgs/images/m2yys2umdirbrk5idkmq','image',0,'2026-08-15 13:22:09');
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
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `rent` decimal(10,2) NOT NULL DEFAULT 0.00,
  `security_fee` decimal(10,2) DEFAULT 0.00,
  PRIMARY KEY (`id`),
  KEY `idx_created_by` (`created_by`),
  CONSTRAINT `fk_pgs_created_by` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pgs`
--

LOCK TABLES `pgs` WRITE;
/*!40000 ALTER TABLE `pgs` DISABLE KEYS */;
INSERT INTO `pgs` VALUES (2,'Hii Najaribu','Plot No. 45, Sector 12, Kharghar, Navi Mumbai',2,'https://res.cloudinary.com/dlokcqf1h/image/upload/v1786801825/livinkey/pgs/qr/a2ohvnsjaruombhhdwjx.jpg','livinkey/pgs/qr/a2ohvnsjaruombhhdwjx','image',1,1,'2026-08-15 13:17:13','2026-08-15 22:05:32',11000.00,11000.00);
/*!40000 ALTER TABLE `pgs` ENABLE KEYS */;
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
INSERT INTO `room_occupancy` VALUES (5,34,2,'2026-08-16 01:14:57'),(7,35,2,'2026-08-16 01:34:19'),(9,36,1,'2026-08-16 13:10:46');
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_floor_room` (`floor_id`,`room_number`),
  KEY `idx_floor_id` (`floor_id`),
  CONSTRAINT `fk_rooms_floor_id` FOREIGN KEY (`floor_id`) REFERENCES `floors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES (34,18,'101',2,1,'2026-08-15 22:05:32','2026-08-15 22:05:32',11000.00),(35,18,'102',2,1,'2026-08-15 22:05:32','2026-08-15 22:05:32',11000.00),(36,18,'103',2,1,'2026-08-15 22:05:32','2026-08-15 22:05:32',11000.00),(37,19,'201',3,1,'2026-08-15 22:05:32','2026-08-15 22:05:32',11000.00);
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
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_details`
--

LOCK TABLES `tenant_details` WRITE;
/*!40000 ALTER TABLE `tenant_details` DISABLE KEYS */;
INSERT INTO `tenant_details` VALUES (23,9,2,35,'international','5152525D1RD','YYHHCQ','fwdwedweq','2026-08-07','2026-12-19',11000.00,11000.00,14,'2026-07-10','2026-08-09','2026-08-15',NULL,NULL,NULL,'2026-08-16 01:28:11','2026-08-16 01:28:11'),(24,10,2,35,'international','5152525D1RD','YYHHCQ','fwdwedweq','2026-07-22','2026-09-30',11000.00,11000.00,14,'2026-07-14','2026-08-14','2026-08-15',NULL,NULL,NULL,'2026-08-16 01:34:19','2026-08-16 01:34:19'),(25,1,2,36,'international','null','null','CF14231011','2026-07-22','2026-09-30',11000.00,11000.00,14,'2026-06-14','2026-08-14','2026-06-14',NULL,NULL,NULL,'2026-08-16 13:10:46','2026-08-16 13:10:46');
/*!40000 ALTER TABLE `tenant_details` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_documents`
--

LOCK TABLES `tenant_documents` WRITE;
/*!40000 ALTER TABLE `tenant_documents` DISABLE KEYS */;
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
  `pg_id` int(11) NOT NULL,
  `living_experience_rating` decimal(3,1) NOT NULL CHECK (`living_experience_rating` between 1 and 10),
  `maintenance_handling_rating` decimal(3,1) NOT NULL CHECK (`maintenance_handling_rating` between 1 and 10),
  `communication_rating` decimal(3,1) NOT NULL CHECK (`communication_rating` between 1 and 10),
  `amenities_rating` decimal(3,1) NOT NULL CHECK (`amenities_rating` between 1 and 10),
  `technology_handling_rating` decimal(3,1) NOT NULL CHECK (`technology_handling_rating` between 1 and 10),
  `overall_rating` decimal(3,1) NOT NULL CHECK (`overall_rating` between 1 and 10),
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_tenant_feedback` (`tenant_id`),
  KEY `idx_pg_id` (`pg_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_rating` (`overall_rating`),
  CONSTRAINT `tenant_feedbacks_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tenant_feedbacks_ibfk_2` FOREIGN KEY (`pg_id`) REFERENCES `pgs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
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
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
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
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `tenant_notifications_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_notifications`
--

LOCK TABLES `tenant_notifications` WRITE;
/*!40000 ALTER TABLE `tenant_notifications` DISABLE KEYS */;
INSERT INTO `tenant_notifications` VALUES (1,8,'bill_created','New Bill Generated','A new bill of ₹12510.00 has been generated for you.',8,'bill','/tenant-payments/bill','?','#3498db',0,NULL,'2026-08-16 01:32:18'),(2,9,'bill_created','New Bill Generated','A new bill of ₹14990.00 has been generated for you.',9,'bill','/tenant-payments/bill','?','#3498db',0,NULL,'2026-08-16 01:35:31'),(3,10,'bill_paid','Payment Confirmed','Your payment of ₹14990.00 has been confirmed.',9,'bill','/tenant-payments/history','✅','#2ecc71',0,NULL,'2026-08-16 01:40:36'),(4,9,'bill_partially_paid','Partial Payment Received','Your partial payment of ₹11000.00 has been received.',8,'bill','/tenant-payments/history','?','#f39c12',0,NULL,'2026-08-16 01:41:35'),(5,10,'bill_created','New Bill Generated','A new bill of ₹12500.00 has been generated for you.',10,'bill','/tenant-payments/bill','?','#3498db',0,NULL,'2026-08-16 02:01:22'),(7,10,'bill_paid','Payment Confirmed','Your payment of ₹12500.00 has been confirmed.',10,'bill','/tenant-payments/history','✅','#2ecc71',0,NULL,'2026-08-16 10:31:51'),(8,1,'maintenance_created','Maintenance Request Submitted','Your AC request has been submitted.',2,'maintenance','/maintenance/my-requests','?','#f39c12',1,'2026-08-16 22:06:14','2026-08-16 15:10:17'),(9,1,'maintenance_started','Maintenance Started','Your AC request is now in progress.',2,'maintenance','/maintenance/my-requests','?','#3498db',1,'2026-08-16 23:06:46','2026-08-16 17:32:06'),(10,1,'maintenance_completed','Maintenance Completed','Your AC request has been completed.',2,'maintenance','/maintenance/my-requests','✅','#2ecc71',1,'2026-08-16 23:06:46','2026-08-16 17:32:26');
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenants`
--

LOCK TABLES `tenants` WRITE;
/*!40000 ALTER TABLE `tenants` DISABLE KEYS */;
INSERT INTO `tenants` VALUES (1,'tenant','Mohammed Aminu Shehe','molittle1011@gmail.com','Tanzanian','+91','7681969865','male','international',1,'$2b$12$Kuk.iEw467TlVSELiYRAte.ntUiBolImE06aVPs8zxyt.nXQpbXtu',1,'2026-08-16 13:10:46','2026-08-16 16:22:36',0,NULL,NULL,'2026-08-16 21:52:20','f0d8cc3959a570554ae4d101a3957699d3a9f19b789012e4a38a158b70c463cd','2026-08-16 22:02:36'),(2,'guest','Mohammed Aminu Shehe','mosnake111@gmail.com','Tanzanian','+255','677532140','other','international',1,'$2b$12$mGMKt4jHK7KlNpX/0HvQL.EO4OeKs/lDQs/kFUhlSbDQDj//.5aS.',1,'2026-08-16 13:43:43','2026-08-16 13:43:43',0,NULL,NULL,NULL,NULL,NULL);
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

-- Dump completed on 2026-08-16 23:44:10
