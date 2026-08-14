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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_notifications`
--

LOCK TABLES `admin_notifications` WRITE;
/*!40000 ALTER TABLE `admin_notifications` DISABLE KEYS */;
INSERT INTO `admin_notifications` VALUES (1,1,'feedback_submitted','New Feedback Received','Mohammed Aminu Shehe gave 8.0/10 rating for Happy Living PG',1,'feedback','/feedbacks/1','⭐','#f39c12',0,'2026-08-12 08:47:08',NULL),(2,2,'feedback_submitted','New Feedback Received','Mohammed Aminu Shehe gave 8.0/10 rating for Happy Living PG',1,'feedback','/feedbacks/1','⭐','#f39c12',0,'2026-08-12 08:47:08',NULL),(3,1,'maintenance_created','New Maintenance Request','Mohammed Aminu Shehe requested Plumber for Room 101',1,'maintenance','/maintenance/1','?','#3498db',0,'2026-08-12 16:02:12',NULL),(4,2,'maintenance_created','New Maintenance Request','Mohammed Aminu Shehe requested Plumber for Room 101',1,'maintenance','/maintenance/1','?','#3498db',0,'2026-08-12 16:02:12',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_permissions`
--

LOCK TABLES `admin_permissions` WRITE;
/*!40000 ALTER TABLE `admin_permissions` DISABLE KEYS */;
INSERT INTO `admin_permissions` VALUES (1,2,'tenants',1,1,1,0,'2026-08-01 21:44:32'),(2,2,'guests',1,0,0,0,'2026-08-01 21:44:32'),(3,2,'bills',1,1,0,0,'2026-08-01 21:44:32'),(4,2,'pgs',1,1,1,1,'2026-08-01 21:44:32'),(5,2,'maintenance',0,0,0,0,'2026-08-01 21:44:32'),(6,2,'documents',1,0,0,0,'2026-08-01 21:44:32'),(7,2,'feedbacks',1,0,0,0,'2026-08-01 21:44:32');
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'Super Admin','molittle1011@gmail.com',NULL,'$2b$12$G70dlPpJLTsE0nnRxSDDG.rlHXY6ohIls2XLQeDsHDgtzxU3kG7Sm',0,'super_admin',NULL,NULL,NULL,NULL,NULL,1,'2026-08-01 19:54:33','2026-08-02 00:21:13','2026-08-02 05:49:15',NULL,NULL),(2,'Mohammed Aminu Shehe','mosnake111@gmail.com','0677532140','$2b$12$/a/DOw69OlD/lHsNSwQJIuLIi0u6fKIl14e7pfuB61DGif0djoHwC',0,'admin','https://res.cloudinary.com/dlokcqf1h/image/upload/v1785631345/livinkey/admins/thwkmzoz3tmanoxydk8m.jpg','livinkey/admins/thwkmzoz3tmanoxydk8m','image','$2b$10$6/QFK6ymIyenaxno328p7ucQNCHVuStQiqesdqzFEJtXBrTdXPj.q','2026-08-14 10:19:38',1,'2026-08-01 19:54:47','2026-08-14 04:44:42','2026-08-14 10:14:42',NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bill_payments`
--

LOCK TABLES `bill_payments` WRITE;
/*!40000 ALTER TABLE `bill_payments` DISABLE KEYS */;
INSERT INTO `bill_payments` VALUES (1,1,6000.00,'2026-08-05 01:11:05','qr_code','TXN123456',1,'2026-08-04 19:41:05'),(2,1,400.00,'2026-08-05 01:11:50','qr_code','TXN123456',1,'2026-08-04 19:41:50');
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bills`
--

LOCK TABLES `bills` WRITE;
/*!40000 ALTER TABLE `bills` DISABLE KEYS */;
INSERT INTO `bills` VALUES (1,1,11000.00,1200.00,'https://res.cloudinary.com/dlokcqf1h/image/upload/v1785753320/livinkey/bills/meters/hi73zbtj3dw0iti1dxl7.png','livinkey/bills/meters/hi73zbtj3dw0iti1dxl7','image',500.00,0.00,12700.00,13400.00,800.00,'partially_paid','https://res.cloudinary.com/dlokcqf1h/image/upload/v1785872608/livinkey/bills/qr/fine/wfqktwgvq1dpcwsbva9l.png','livinkey/bills/qr/m2lokyyshyuvz8gt6kfw','image','https://res.cloudinary.com/dlokcqf1h/image/upload/v1785872610/livinkey/bills/qr/fine/fvqqpstpxwz9oob0xihy.png','livinkey/bills/qr/ww8kd0e4wljnoww9vjpx','image','2026-07-21 01:12:42','2026-08-06 01:13:27',1,'2026-08-03 10:35:25','2026-08-04 21:30:17',8,'2026-08-05 00:55:12',1,NULL,NULL,NULL,'2026-08-05 02:37:57','https://res.cloudinary.com/dlokcqf1h/image/upload/v1785875997/livinkey/bills/custom_qr/u4jta4ls66aimnre6nz9.png','livinkey/bills/custom_qr/u4jta4ls66aimnre6nz9','image',NULL,NULL,NULL,'Dear Tenant, Your payment is due. Please pay tomorrow if possible. Regards, Livinkey Team','2026-08-05 23:59:59',NULL,NULL,0,NULL,'2026-08-05 03:00:17','upi',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2,1,11000.00,1200.00,'https://res.cloudinary.com/dlokcqf1h/image/upload/v1785754010/livinkey/bills/meters/el40mcmgybifxszpx9r6.png','livinkey/bills/meters/el40mcmgybifxszpx9r6','image',500.00,0.00,12700.00,0.00,0.00,'unpaid','https://res.cloudinary.com/dlokcqf1h/image/upload/v1785754014/livinkey/bills/qr/q2aamsdjc8cy7mseg2yf.jpg','livinkey/bills/qr/q2aamsdjc8cy7mseg2yf','image','https://res.cloudinary.com/dlokcqf1h/image/upload/v1785754013/livinkey/bills/qr/rblmqupwnpdreg1nhuqh.png','livinkey/bills/qr/rblmqupwnpdreg1nhuqh','image','2026-08-03 16:16:55','2026-08-10 16:16:55',1,'2026-08-03 10:46:55','2026-08-04 19:59:10',0,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'upi',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(3,1,11000.00,1200.00,'https://res.cloudinary.com/dlokcqf1h/image/upload/v1785754192/livinkey/bills/meters/n79zrgdd0e8u5mapt2wn.png','livinkey/bills/meters/n79zrgdd0e8u5mapt2wn','image',500.00,0.00,12700.00,0.00,0.00,'unpaid','https://res.cloudinary.com/dlokcqf1h/image/upload/v1785754195/livinkey/bills/qr/anqrk2ysbojstfr9redn.jpg','livinkey/bills/qr/anqrk2ysbojstfr9redn','image','https://res.cloudinary.com/dlokcqf1h/image/upload/v1785754194/livinkey/bills/qr/avg1mrotyxmblbkqrund.png','livinkey/bills/qr/avg1mrotyxmblbkqrund','image','2026-08-03 16:19:56','2026-08-10 16:19:56',1,'2026-08-03 10:49:56','2026-08-04 19:59:10',0,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'upi',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(4,1,11000.00,1200.00,'https://res.cloudinary.com/dlokcqf1h/image/upload/v1785754341/livinkey/bills/meters/nnb6fgjjysauijnv2tny.png','livinkey/bills/meters/nnb6fgjjysauijnv2tny','image',500.00,0.00,12700.00,0.00,0.00,'unpaid','https://res.cloudinary.com/dlokcqf1h/image/upload/v1785754345/livinkey/bills/qr/wf63ipxidxeebbemgfy1.jpg','livinkey/bills/qr/wf63ipxidxeebbemgfy1','image','https://res.cloudinary.com/dlokcqf1h/image/upload/v1785754344/livinkey/bills/qr/yhkel35gi3rlsun3a0st.png','livinkey/bills/qr/yhkel35gi3rlsun3a0st','image','2026-08-03 16:22:26','2026-08-10 16:22:26',1,'2026-08-03 10:52:26','2026-08-04 19:59:10',0,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'upi',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(5,1,11000.00,1200.00,'https://res.cloudinary.com/dlokcqf1h/image/upload/v1785755017/livinkey/bills/meters/slpg5jtsnarycjism7ua.png','livinkey/bills/meters/slpg5jtsnarycjism7ua','image',500.00,0.00,12700.00,0.00,0.00,'unpaid','https://res.cloudinary.com/dlokcqf1h/image/upload/v1785755021/livinkey/bills/qr/aq4bfhir9jel7qewjbq3.jpg','livinkey/bills/qr/aq4bfhir9jel7qewjbq3','image','https://res.cloudinary.com/dlokcqf1h/image/upload/v1785755019/livinkey/bills/qr/jpokmvby5qmvsvzs8xcl.png','livinkey/bills/qr/jpokmvby5qmvsvzs8xcl','image','2026-08-03 16:33:42','2026-08-10 16:33:42',1,'2026-08-03 11:03:42','2026-08-04 19:59:10',0,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'upi',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(6,1,11000.00,1200.00,'https://res.cloudinary.com/dlokcqf1h/image/upload/v1785755758/livinkey/bills/meters/kudetl0k4smyjvmy7xnn.png','livinkey/bills/meters/kudetl0k4smyjvmy7xnn','image',500.00,0.00,12700.00,0.00,0.00,'unpaid','https://res.cloudinary.com/dlokcqf1h/image/upload/v1785755759/livinkey/bills/qr/ofk4fsk3nypdvyh47mqw.png','livinkey/bills/qr/ofk4fsk3nypdvyh47mqw','image','https://res.cloudinary.com/dlokcqf1h/image/upload/v1785755760/livinkey/bills/qr/f89npidhdh6d1qbg7tlh.png','livinkey/bills/qr/f89npidhdh6d1qbg7tlh','image','2026-08-03 16:46:03','2026-08-10 16:46:03',1,'2026-08-03 11:16:03','2026-08-04 19:59:10',0,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'upi',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(7,1,11000.00,1200.00,NULL,NULL,NULL,500.00,0.00,12700.00,0.00,0.00,'unpaid','https://res.cloudinary.com/dlokcqf1h/image/upload/v1785871004/livinkey/bills/qr/l0gmurrz2sj3ysnfvnqn.png','livinkey/bills/qr/l0gmurrz2sj3ysnfvnqn','image','https://res.cloudinary.com/dlokcqf1h/image/upload/v1785871005/livinkey/bills/qr/mk4zatw8fyyhraie813r.png','livinkey/bills/qr/mk4zatw8fyyhraie813r','image','2026-08-05 00:46:48','2026-08-12 00:46:48',1,'2026-08-04 19:16:48','2026-08-04 19:59:10',0,NULL,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'upi',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
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
INSERT INTO `cash_payments` VALUES (1,1,1,7000.00,'2026-08-14','2026-09-30','2026-08-05 03:00:17',1,'3012','verified','Cash payment for August rent','2026-08-04 21:30:17');
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `floors`
--

LOCK TABLES `floors` WRITE;
/*!40000 ALTER TABLE `floors` DISABLE KEYS */;
INSERT INTO `floors` VALUES (1,1,1,'2026-08-03 09:20:37','2026-08-03 09:20:37'),(2,1,2,'2026-08-03 09:20:37','2026-08-03 09:20:37'),(3,1,3,'2026-08-03 09:20:37','2026-08-03 09:20:37');
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maintenance_requests`
--

LOCK TABLES `maintenance_requests` WRITE;
/*!40000 ALTER TABLE `maintenance_requests` DISABLE KEYS */;
INSERT INTO `maintenance_requests` VALUES (1,1,1,'Plumber','Leaking pipe in bathroom','2026-08-15','10:00 AM - 2:00 PM','https://res.cloudinary.com/dlokcqf1h/image/upload/v1786550529/livinkey/maintenance/1/trewdrdfjhiw4xegpeax.png','livinkey/maintenance/1/trewdrdfjhiw4xegpeax','image','pending',1,'2026-08-12 16:02:12','2026-08-12 16:02:12');
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_proofs`
--

LOCK TABLES `payment_proofs` WRITE;
/*!40000 ALTER TABLE `payment_proofs` DISABLE KEYS */;
INSERT INTO `payment_proofs` VALUES (1,7,1,'TXN123456789',12700.00,'https://res.cloudinary.com/dlokcqf1h/image/upload/v1786604102/livinkey/payments/proofs/1/nxwrhumifwkkjzoqf66r.png','livinkey/payments/proofs/1/nxwrhumifwkkjzoqf66r','image','pending',NULL,NULL,NULL,'2026-08-13 06:55:04','2026-08-13 06:55:04');
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pg_amenities`
--

LOCK TABLES `pg_amenities` WRITE;
/*!40000 ALTER TABLE `pg_amenities` DISABLE KEYS */;
INSERT INTO `pg_amenities` VALUES (1,1,'Free WiFi',0,'2026-08-03 09:20:37'),(2,1,'24*7 Assistance',0,'2026-08-03 09:20:37'),(3,1,'24*7 Power Backup',0,'2026-08-03 09:20:37'),(4,1,'CCTV',0,'2026-08-03 09:20:37'),(5,1,'AC',0,'2026-08-03 09:20:37'),(6,1,'Free Housekeeping',0,'2026-08-03 09:20:37'),(7,1,'Swimming Pool',1,'2026-08-03 09:20:37');
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pg_images`
--

LOCK TABLES `pg_images` WRITE;
/*!40000 ALTER TABLE `pg_images` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pgs`
--

LOCK TABLES `pgs` WRITE;
/*!40000 ALTER TABLE `pgs` DISABLE KEYS */;
INSERT INTO `pgs` VALUES (1,'Happy Living PG','123 Main Street, Bangalore',3,NULL,NULL,NULL,1,1,'2026-08-03 09:20:37','2026-08-03 09:20:37',0.00,0.00);
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room_occupancy`
--

LOCK TABLES `room_occupancy` WRITE;
/*!40000 ALTER TABLE `room_occupancy` DISABLE KEYS */;
INSERT INTO `room_occupancy` VALUES (1,1,2,'2026-08-06 16:53:50'),(3,2,3,'2026-08-07 23:56:55');
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES (1,1,'101',2,1,'2026-08-03 09:20:37','2026-08-03 09:20:37',NULL),(2,1,'102',3,1,'2026-08-03 09:20:37','2026-08-03 09:20:37',NULL),(3,2,'201',4,1,'2026-08-03 09:20:37','2026-08-03 09:20:37',NULL),(4,2,'202',2,1,'2026-08-03 09:20:37','2026-08-03 09:20:37',NULL),(5,3,'301',3,1,'2026-08-03 09:20:37','2026-08-03 09:20:37',NULL),(6,3,'302',2,1,'2026-08-03 09:20:37','2026-08-03 09:20:37',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_details`
--

LOCK TABLES `tenant_details` WRITE;
/*!40000 ALTER TABLE `tenant_details` DISABLE KEYS */;
INSERT INTO `tenant_details` VALUES (1,1,1,1,'international',NULL,NULL,'CF123456',NULL,NULL,11000.00,5000.00,1,'2026-07-01','2026-07-31','2026-07-22',NULL,NULL,NULL,'2026-08-03 09:22:22','2026-08-03 10:30:46'),(2,12,1,1,'international',NULL,NULL,'CF123456',NULL,NULL,11000.00,5000.00,10,'2026-07-31','0000-00-00','2026-07-22',NULL,NULL,NULL,'2026-08-06 16:53:50','2026-08-06 16:53:50'),(3,13,1,2,'international',NULL,NULL,'CF123456',NULL,NULL,11000.00,5000.00,10,'2026-07-31','0000-00-00','2026-07-22',NULL,NULL,NULL,'2026-08-07 17:53:34','2026-08-07 17:53:34'),(5,16,1,2,'international',NULL,NULL,'CF123456','2026-01-01','2026-08-10',11000.00,5000.00,10,'2026-07-31','0000-00-00','2026-07-22',NULL,NULL,NULL,'2026-08-07 23:56:55','2026-08-07 23:56:55');
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
INSERT INTO `tenant_documents` VALUES (1,1,'https://res.cloudinary.com/dlokcqf1h/image/upload/v1786544337/livinkey/tenants/1/documents/kq64qugmb5ayvy2tzkel.png','livinkey/tenants/1/documents/kq64qugmb5ayvy2tzkel','image','passport_photo','2026-08-12 14:19:01','Screenshot 2025-09-15 161841.png',381270,'2026-08-12 14:19:01');
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
INSERT INTO `tenant_feedbacks` VALUES (1,1,1,10.0,7.0,9.0,8.0,6.0,8.0,NULL,'2026-08-12 08:47:08','2026-08-12 08:47:08');
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_notifications`
--

LOCK TABLES `tenant_notifications` WRITE;
/*!40000 ALTER TABLE `tenant_notifications` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenants`
--

LOCK TABLES `tenants` WRITE;
/*!40000 ALTER TABLE `tenants` DISABLE KEYS */;
INSERT INTO `tenants` VALUES (1,'tenant','Mohammed Aminu Shehe','mosnake111@gmail.com','Tanzanian','+255','677532140x','male',NULL,1,'$2b$12$QnvPFIM91qqYQr9iEFxpE.b/sTLY1E9Ay9N0UiFTVeiSoxTB.PbA.',1,'2026-08-03 09:22:22','2026-08-12 08:31:02',0,NULL,NULL,'2026-08-12 13:58:34',NULL,NULL),(2,'guest','Mohammed Aminu Shehe','molittle1011@gmail.com','Tanzanian','+255','677532140','male','international',1,'$2b$12$emFlKU1/GuJXUtsuqx8jHebdrAf1LZmssQFDPidSwjAxtrcuDV6w2',1,'2026-08-03 09:37:09','2026-08-14 03:48:51',0,NULL,NULL,NULL,NULL,NULL),(12,'tenant','Shaggy','shaghiramchomvu1@gmail.com','Tanzanian','+255','656635975','male',NULL,1,'$2b$12$0E64egZycpEfB..HVFK0.eK96o8bGnWpmWf5pZYfVLJOlPpuiYkuu',1,'2026-08-06 16:53:50','2026-08-06 16:53:50',0,NULL,NULL,NULL,NULL,NULL),(13,'tenant','Mohammed','livinkey@gmail.com','Tanzanian','+255','656635970','male',NULL,1,'$2b$12$WTEvldPXJIF5eyO6tz03IuFt2zd4gzEb4BTQvmDiXFvDBoXU/PY76',1,'2026-08-07 17:53:34','2026-08-07 17:53:34',0,NULL,NULL,NULL,NULL,NULL),(16,'tenant','Mohammed','fourbrothers10112627@gmail.com','Tanzanian','+255','656635979','male',NULL,1,'$2b$12$.DWEEfgEMQOcqijEQ03tQejCncC2YW1rEbWcogW.hqRKCCB05DZzi',1,'2026-08-07 23:56:55','2026-08-07 23:56:55',0,NULL,NULL,NULL,NULL,NULL),(17,'guest','John Doe','molittle10111@gmail.com','American','+1','1234567890','other','international',1,'$2b$12$uvbYa42SgMtXtTAN2aYlqucHga2blISptSu341wPkvawu.LWMe/0O',1,'2026-08-14 03:52:21','2026-08-14 03:52:21',0,NULL,NULL,NULL,NULL,NULL);
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

-- Dump completed on 2026-08-14 15:17:42
