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
) ENGINE=InnoDB AUTO_INCREMENT=114 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_notifications`
--

LOCK TABLES `admin_notifications` WRITE;
/*!40000 ALTER TABLE `admin_notifications` DISABLE KEYS */;
INSERT INTO `admin_notifications` VALUES (1,1,'pg_created','New PG Created','PG \"Alishan PG\" has been created',1,'pg','/pgs/1','?','#2ecc71',1,'2026-08-22 13:40:47','2026-08-22 13:55:59'),(2,1,'pg_created','New PG Created','PG \"Happy Living PG\" has been created',2,'pg','/pgs/2','?','#2ecc71',1,'2026-08-22 13:45:54','2026-08-22 13:55:59'),(3,1,'pg_created','New PG Created','PG \"DS Apartment\" has been created',3,'pg','/pgs/3','?','#2ecc71',1,'2026-08-22 13:47:48','2026-08-22 13:55:59'),(4,1,'pg_created','New PG Created','PG \"J T House (Plot No :- 257)\" has been created',4,'pg','/pgs/4','?','#2ecc71',1,'2026-08-22 13:50:08','2026-08-22 13:55:59'),(5,1,'pg_created','New PG Created','PG \"Shree Shyam Apartment\" has been created',5,'pg','/pgs/5','?','#2ecc71',1,'2026-08-22 13:51:22','2026-08-22 13:55:59'),(6,1,'pg_created','New PG Created','PG \"Royal Suits ( (Plot No :- 103,104)\" has been created',6,'pg','/pgs/6','?','#2ecc71',1,'2026-08-22 13:53:59','2026-08-22 13:55:59'),(7,1,'pg_created','New PG Created','PG \"Mannat Apartment (Plot No :- 99)\" has been created',7,'pg','/pgs/7','?','#2ecc71',1,'2026-08-22 13:55:49','2026-08-22 13:55:59'),(8,1,'tenant_registered','New Tenant Registered','Mohammed Aminu Shehe has been registered as a tenant',1,'tenant','/tenants/1','?','#2ecc71',1,'2026-08-22 15:56:54','2026-08-23 05:31:01'),(9,1,'feedback_submitted','New Feedback Received','Mohammed Aminu Shehe gave 10.0/10 rating for Happy Living PG',1,'feedback','/feedbacks/1','⭐','#f39c12',1,'2026-08-22 16:54:24','2026-08-23 05:31:01'),(10,1,'admin_created','New Admin Created','Admin \"Animesh\" has been created',3,'admin','/admins/3','?‍?','#3498db',1,'2026-08-22 21:43:56','2026-08-23 05:31:01'),(11,2,'admin_created','New Admin Created','Admin \"Animesh\" has been created',3,'admin','/admins/3','?‍?','#3498db',1,'2026-08-22 21:43:56','2026-08-22 22:10:36'),(12,1,'tenant_registered','New Tenant Registered','Sri Ram has been registered as a tenant',6,'tenant','/tenants/6','?','#2ecc71',1,'2026-08-22 22:18:25','2026-08-23 05:31:01'),(13,2,'tenant_registered','New Tenant Registered','Sri Ram has been registered as a tenant',6,'tenant','/tenants/6','?','#2ecc71',0,'2026-08-22 22:18:25',NULL),(15,1,'admin_created','New Admin Created','Admin \"Animesh\" has been created',4,'admin','/admins/4','?‍?','#3498db',1,'2026-08-22 22:21:31','2026-08-23 05:31:01'),(16,2,'admin_created','New Admin Created','Admin \"Animesh\" has been created',4,'admin','/admins/4','?‍?','#3498db',0,'2026-08-22 22:21:31',NULL),(17,1,'maintenance_created','New Maintenance Request','Sri Ram requested Electrician for Room 201',1,'maintenance','/maintenance/1','?','#3498db',1,'2026-08-22 22:23:21','2026-08-23 05:31:01'),(18,2,'maintenance_created','New Maintenance Request','Sri Ram requested Electrician for Room 201',1,'maintenance','/maintenance/1','?','#3498db',0,'2026-08-22 22:23:21',NULL),(19,4,'maintenance_created','New Maintenance Request','Sri Ram requested Electrician for Room 201',1,'maintenance','/maintenance/1','?','#3498db',0,'2026-08-22 22:23:21',NULL),(20,1,'maintenance_updated','Maintenance Request Started','Electrician request for Room 201 is now in_progress',1,'maintenance','/maintenance/1','?','#f39c12',1,'2026-08-22 22:25:41','2026-08-23 05:31:01'),(21,2,'maintenance_updated','Maintenance Request Started','Electrician request for Room 201 is now in_progress',1,'maintenance','/maintenance/1','?','#f39c12',0,'2026-08-22 22:25:41',NULL),(22,4,'maintenance_updated','Maintenance Request Started','Electrician request for Room 201 is now in_progress',1,'maintenance','/maintenance/1','?','#f39c12',0,'2026-08-22 22:25:41',NULL),(23,1,'tenant_registered','New Tenant Registered','Mohammed Aminu Shehe has been registered as a tenant',7,'tenant','/tenants/7','?','#2ecc71',1,'2026-08-23 00:02:54','2026-08-23 05:33:07'),(24,2,'tenant_registered','New Tenant Registered','Mohammed Aminu Shehe has been registered as a tenant',7,'tenant','/tenants/7','?','#2ecc71',0,'2026-08-23 00:02:54',NULL),(25,4,'tenant_registered','New Tenant Registered','Mohammed Aminu Shehe has been registered as a tenant',7,'tenant','/tenants/7','?','#2ecc71',0,'2026-08-23 00:02:54',NULL),(26,1,'tenant_registered','New Tenant Registered','Abdul-Warith Aminu has been registered as a tenant',8,'tenant','/tenants/8','?','#2ecc71',1,'2026-08-23 00:05:36','2026-08-23 05:36:00'),(27,2,'tenant_registered','New Tenant Registered','Abdul-Warith Aminu has been registered as a tenant',8,'tenant','/tenants/8','?','#2ecc71',0,'2026-08-23 00:05:36',NULL),(28,4,'tenant_registered','New Tenant Registered','Abdul-Warith Aminu has been registered as a tenant',8,'tenant','/tenants/8','?','#2ecc71',0,'2026-08-23 00:05:36',NULL),(29,1,'guest_registered','New Guest Registered','Kinjili has been registered as a guest',9,'guest','/tenants/9','?','#1abc9c',1,'2026-08-23 00:07:26','2026-08-23 05:38:29'),(30,2,'guest_registered','New Guest Registered','Kinjili has been registered as a guest',9,'guest','/tenants/9','?','#1abc9c',0,'2026-08-23 00:07:26',NULL),(31,4,'guest_registered','New Guest Registered','Kinjili has been registered as a guest',9,'guest','/tenants/9','?','#1abc9c',0,'2026-08-23 00:07:26',NULL),(32,1,'admin_created','New Admin Created','Admin \"Mohammed Aminu Shehe\" has been created',5,'admin','/admins/5','?‍?','#3498db',1,'2026-08-23 00:08:06','2026-08-23 05:38:29'),(33,2,'admin_created','New Admin Created','Admin \"Mohammed Aminu Shehe\" has been created',5,'admin','/admins/5','?‍?','#3498db',0,'2026-08-23 00:08:06',NULL),(34,1,'feedback_submitted','New Feedback Received','Abdul-Warith Aminu gave 9.8/10 rating for Happy Living PG',2,'feedback','/feedbacks/2','⭐','#f39c12',1,'2026-08-23 01:03:54','2026-08-23 06:40:31'),(35,2,'feedback_submitted','New Feedback Received','Abdul-Warith Aminu gave 9.8/10 rating for Happy Living PG',2,'feedback','/feedbacks/2','⭐','#f39c12',0,'2026-08-23 01:03:54',NULL),(36,4,'feedback_submitted','New Feedback Received','Abdul-Warith Aminu gave 9.8/10 rating for Happy Living PG',2,'feedback','/feedbacks/2','⭐','#f39c12',0,'2026-08-23 01:03:54',NULL),(37,5,'feedback_submitted','New Feedback Received','Abdul-Warith Aminu gave 9.8/10 rating for Happy Living PG',2,'feedback','/feedbacks/2','⭐','#f39c12',1,'2026-08-23 01:03:54','2026-08-23 06:51:31'),(38,1,'maintenance_created','New Maintenance Request','Abdul-Warith Aminu requested Electrician for Room 101',2,'maintenance','/maintenance/2','?','#3498db',1,'2026-08-23 01:05:11','2026-08-23 06:40:31'),(39,2,'maintenance_created','New Maintenance Request','Abdul-Warith Aminu requested Electrician for Room 101',2,'maintenance','/maintenance/2','?','#3498db',0,'2026-08-23 01:05:11',NULL),(40,4,'maintenance_created','New Maintenance Request','Abdul-Warith Aminu requested Electrician for Room 101',2,'maintenance','/maintenance/2','?','#3498db',0,'2026-08-23 01:05:11',NULL),(41,5,'maintenance_created','New Maintenance Request','Abdul-Warith Aminu requested Electrician for Room 101',2,'maintenance','/maintenance/2','?','#3498db',1,'2026-08-23 01:05:11','2026-08-23 06:51:31'),(42,1,'maintenance_created','New Maintenance Request','Abdul-Warith Aminu requested Cleaning for Room 101',3,'maintenance','/maintenance/3','?','#3498db',1,'2026-08-23 01:05:55','2026-08-23 06:40:31'),(43,2,'maintenance_created','New Maintenance Request','Abdul-Warith Aminu requested Cleaning for Room 101',3,'maintenance','/maintenance/3','?','#3498db',0,'2026-08-23 01:05:55',NULL),(44,4,'maintenance_created','New Maintenance Request','Abdul-Warith Aminu requested Cleaning for Room 101',3,'maintenance','/maintenance/3','?','#3498db',0,'2026-08-23 01:05:55',NULL),(45,5,'maintenance_created','New Maintenance Request','Abdul-Warith Aminu requested Cleaning for Room 101',3,'maintenance','/maintenance/3','?','#3498db',1,'2026-08-23 01:05:55','2026-08-23 06:51:31'),(46,1,'maintenance_created','New Maintenance Request','Abdul-Warith Aminu requested Check-out for Room 101',4,'maintenance','/maintenance/4','?','#3498db',1,'2026-08-23 01:06:14','2026-08-23 06:40:31'),(47,2,'maintenance_created','New Maintenance Request','Abdul-Warith Aminu requested Check-out for Room 101',4,'maintenance','/maintenance/4','?','#3498db',0,'2026-08-23 01:06:14',NULL),(48,4,'maintenance_created','New Maintenance Request','Abdul-Warith Aminu requested Check-out for Room 101',4,'maintenance','/maintenance/4','?','#3498db',0,'2026-08-23 01:06:14',NULL),(49,5,'maintenance_created','New Maintenance Request','Abdul-Warith Aminu requested Check-out for Room 101',4,'maintenance','/maintenance/4','?','#3498db',1,'2026-08-23 01:06:14','2026-08-23 06:51:31'),(50,1,'maintenance_updated','Maintenance Request Started','Check-out request for Room 101 is now in_progress',4,'maintenance','/maintenance/4','?','#f39c12',1,'2026-08-23 01:10:59','2026-08-23 06:43:22'),(51,2,'maintenance_updated','Maintenance Request Started','Check-out request for Room 101 is now in_progress',4,'maintenance','/maintenance/4','?','#f39c12',0,'2026-08-23 01:10:59',NULL),(52,4,'maintenance_updated','Maintenance Request Started','Check-out request for Room 101 is now in_progress',4,'maintenance','/maintenance/4','?','#f39c12',0,'2026-08-23 01:10:59',NULL),(53,5,'maintenance_updated','Maintenance Request Started','Check-out request for Room 101 is now in_progress',4,'maintenance','/maintenance/4','?','#f39c12',1,'2026-08-23 01:10:59','2026-08-23 06:51:31'),(54,1,'maintenance_updated','Maintenance Request Started','Cleaning request for Room 101 is now in_progress',3,'maintenance','/maintenance/3','?','#f39c12',1,'2026-08-23 01:11:28','2026-08-23 06:43:22'),(55,2,'maintenance_updated','Maintenance Request Started','Cleaning request for Room 101 is now in_progress',3,'maintenance','/maintenance/3','?','#f39c12',0,'2026-08-23 01:11:28',NULL),(56,4,'maintenance_updated','Maintenance Request Started','Cleaning request for Room 101 is now in_progress',3,'maintenance','/maintenance/3','?','#f39c12',0,'2026-08-23 01:11:28',NULL),(57,5,'maintenance_updated','Maintenance Request Started','Cleaning request for Room 101 is now in_progress',3,'maintenance','/maintenance/3','?','#f39c12',1,'2026-08-23 01:11:28','2026-08-23 06:51:31'),(58,1,'maintenance_updated','Maintenance Request Started','Electrician request for Room 101 is now in_progress',2,'maintenance','/maintenance/2','?','#f39c12',1,'2026-08-23 01:11:32','2026-08-23 06:43:22'),(59,2,'maintenance_updated','Maintenance Request Started','Electrician request for Room 101 is now in_progress',2,'maintenance','/maintenance/2','?','#f39c12',0,'2026-08-23 01:11:32',NULL),(60,4,'maintenance_updated','Maintenance Request Started','Electrician request for Room 101 is now in_progress',2,'maintenance','/maintenance/2','?','#f39c12',0,'2026-08-23 01:11:32',NULL),(61,5,'maintenance_updated','Maintenance Request Started','Electrician request for Room 101 is now in_progress',2,'maintenance','/maintenance/2','?','#f39c12',1,'2026-08-23 01:11:32','2026-08-23 06:51:31'),(62,1,'maintenance_updated','Maintenance Request Completed','Electrician request for Room 201 is now completed',1,'maintenance','/maintenance/1','?','#f39c12',1,'2026-08-23 01:11:35','2026-08-23 06:43:22'),(63,2,'maintenance_updated','Maintenance Request Completed','Electrician request for Room 201 is now completed',1,'maintenance','/maintenance/1','?','#f39c12',0,'2026-08-23 01:11:35',NULL),(64,4,'maintenance_updated','Maintenance Request Completed','Electrician request for Room 201 is now completed',1,'maintenance','/maintenance/1','?','#f39c12',0,'2026-08-23 01:11:35',NULL),(65,5,'maintenance_updated','Maintenance Request Completed','Electrician request for Room 201 is now completed',1,'maintenance','/maintenance/1','?','#f39c12',1,'2026-08-23 01:11:35','2026-08-23 06:51:31'),(66,1,'maintenance_updated','Maintenance Request Completed','Electrician request for Room 101 is now completed',2,'maintenance','/maintenance/2','?','#f39c12',1,'2026-08-23 01:11:36','2026-08-23 06:43:22'),(67,2,'maintenance_updated','Maintenance Request Completed','Electrician request for Room 101 is now completed',2,'maintenance','/maintenance/2','?','#f39c12',0,'2026-08-23 01:11:36',NULL),(68,4,'maintenance_updated','Maintenance Request Completed','Electrician request for Room 101 is now completed',2,'maintenance','/maintenance/2','?','#f39c12',0,'2026-08-23 01:11:36',NULL),(69,5,'maintenance_updated','Maintenance Request Completed','Electrician request for Room 101 is now completed',2,'maintenance','/maintenance/2','?','#f39c12',1,'2026-08-23 01:11:36','2026-08-23 06:51:31'),(70,1,'maintenance_updated','Maintenance Request Completed','Cleaning request for Room 101 is now completed',3,'maintenance','/maintenance/3','?','#f39c12',1,'2026-08-23 01:11:37','2026-08-23 06:43:22'),(71,2,'maintenance_updated','Maintenance Request Completed','Cleaning request for Room 101 is now completed',3,'maintenance','/maintenance/3','?','#f39c12',0,'2026-08-23 01:11:37',NULL),(72,4,'maintenance_updated','Maintenance Request Completed','Cleaning request for Room 101 is now completed',3,'maintenance','/maintenance/3','?','#f39c12',0,'2026-08-23 01:11:37',NULL),(73,5,'maintenance_updated','Maintenance Request Completed','Cleaning request for Room 101 is now completed',3,'maintenance','/maintenance/3','?','#f39c12',1,'2026-08-23 01:11:37','2026-08-23 06:51:31'),(74,1,'maintenance_updated','Maintenance Request Completed','Check-out request for Room 101 is now completed',4,'maintenance','/maintenance/4','?','#f39c12',1,'2026-08-23 01:11:38','2026-08-23 06:43:22'),(75,2,'maintenance_updated','Maintenance Request Completed','Check-out request for Room 101 is now completed',4,'maintenance','/maintenance/4','?','#f39c12',0,'2026-08-23 01:11:38',NULL),(76,4,'maintenance_updated','Maintenance Request Completed','Check-out request for Room 101 is now completed',4,'maintenance','/maintenance/4','?','#f39c12',0,'2026-08-23 01:11:38',NULL),(77,5,'maintenance_updated','Maintenance Request Completed','Check-out request for Room 101 is now completed',4,'maintenance','/maintenance/4','?','#f39c12',1,'2026-08-23 01:11:38','2026-08-23 06:51:31'),(78,1,'bill_created','New Bill Generated','Bill of ₹13190.00 created for undefined',1,'bill','/bills/1','?','#3498db',1,'2026-08-23 01:14:07','2026-08-23 06:47:02'),(79,2,'bill_created','New Bill Generated','Bill of ₹13190.00 created for undefined',1,'bill','/bills/1','?','#3498db',0,'2026-08-23 01:14:07',NULL),(80,4,'bill_created','New Bill Generated','Bill of ₹13190.00 created for undefined',1,'bill','/bills/1','?','#3498db',0,'2026-08-23 01:14:07',NULL),(81,5,'bill_created','New Bill Generated','Bill of ₹13190.00 created for undefined',1,'bill','/bills/1','?','#3498db',1,'2026-08-23 01:14:07','2026-08-23 06:51:31'),(82,1,'admin_created','New Admin Created','Admin \"Mohammed Aminu Shehe\" has been created',6,'admin','/admins/6','?‍?','#3498db',1,'2026-08-23 01:44:55','2026-08-23 08:55:01'),(83,2,'admin_created','New Admin Created','Admin \"Mohammed Aminu Shehe\" has been created',6,'admin','/admins/6','?‍?','#3498db',0,'2026-08-23 01:44:55',NULL),(84,1,'bill_created','New Bill Generated','Bill of ₹14200.00 created for undefined',2,'bill','/bills/2','?','#3498db',1,'2026-08-23 02:50:24','2026-08-23 08:55:01'),(85,2,'bill_created','New Bill Generated','Bill of ₹14200.00 created for undefined',2,'bill','/bills/2','?','#3498db',0,'2026-08-23 02:50:24',NULL),(86,4,'bill_created','New Bill Generated','Bill of ₹14200.00 created for undefined',2,'bill','/bills/2','?','#3498db',0,'2026-08-23 02:50:24',NULL),(87,5,'bill_created','New Bill Generated','Bill of ₹14200.00 created for undefined',2,'bill','/bills/2','?','#3498db',0,'2026-08-23 02:50:24',NULL),(88,6,'bill_created','New Bill Generated','Bill of ₹14200.00 created for undefined',2,'bill','/bills/2','?','#3498db',0,'2026-08-23 02:50:24',NULL),(89,1,'bill_created','New Bill Generated','Bill of ₹11800.00 created for undefined',3,'bill','/bills/3','?','#3498db',1,'2026-08-23 02:54:12','2026-08-23 08:55:01'),(90,2,'bill_created','New Bill Generated','Bill of ₹11800.00 created for undefined',3,'bill','/bills/3','?','#3498db',0,'2026-08-23 02:54:12',NULL),(91,4,'bill_created','New Bill Generated','Bill of ₹11800.00 created for undefined',3,'bill','/bills/3','?','#3498db',0,'2026-08-23 02:54:12',NULL),(92,5,'bill_created','New Bill Generated','Bill of ₹11800.00 created for undefined',3,'bill','/bills/3','?','#3498db',0,'2026-08-23 02:54:12',NULL),(93,6,'bill_created','New Bill Generated','Bill of ₹11800.00 created for undefined',3,'bill','/bills/3','?','#3498db',0,'2026-08-23 02:54:12',NULL),(94,1,'payment_proof_submitted','New Payment Proof Submitted','Mohammed Aminu Shehe submitted a payment proof of ₹11000.0',2,'payment_proof','/bills/payment-proofs/2','?','#3498db',1,'2026-08-23 03:24:07','2026-08-23 08:55:01'),(95,2,'payment_proof_submitted','New Payment Proof Submitted','Mohammed Aminu Shehe submitted a payment proof of ₹11000.0',2,'payment_proof','/bills/payment-proofs/2','?','#3498db',0,'2026-08-23 03:24:07',NULL),(96,4,'payment_proof_submitted','New Payment Proof Submitted','Mohammed Aminu Shehe submitted a payment proof of ₹11000.0',2,'payment_proof','/bills/payment-proofs/2','?','#3498db',0,'2026-08-23 03:24:07',NULL),(97,5,'payment_proof_submitted','New Payment Proof Submitted','Mohammed Aminu Shehe submitted a payment proof of ₹11000.0',2,'payment_proof','/bills/payment-proofs/2','?','#3498db',0,'2026-08-23 03:24:07',NULL),(98,6,'payment_proof_submitted','New Payment Proof Submitted','Mohammed Aminu Shehe submitted a payment proof of ₹11000.0',2,'payment_proof','/bills/payment-proofs/2','?','#3498db',0,'2026-08-23 03:24:07',NULL),(99,1,'payment_proof_submitted','New Payment Proof Submitted','Mohammed Aminu Shehe submitted a payment proof of ₹800.0',3,'payment_proof','/bills/payment-proofs/3','?','#3498db',1,'2026-08-23 03:26:12','2026-08-23 08:57:48'),(100,2,'payment_proof_submitted','New Payment Proof Submitted','Mohammed Aminu Shehe submitted a payment proof of ₹800.0',3,'payment_proof','/bills/payment-proofs/3','?','#3498db',0,'2026-08-23 03:26:12',NULL),(101,4,'payment_proof_submitted','New Payment Proof Submitted','Mohammed Aminu Shehe submitted a payment proof of ₹800.0',3,'payment_proof','/bills/payment-proofs/3','?','#3498db',0,'2026-08-23 03:26:12',NULL),(102,5,'payment_proof_submitted','New Payment Proof Submitted','Mohammed Aminu Shehe submitted a payment proof of ₹800.0',3,'payment_proof','/bills/payment-proofs/3','?','#3498db',0,'2026-08-23 03:26:12',NULL),(103,6,'payment_proof_submitted','New Payment Proof Submitted','Mohammed Aminu Shehe submitted a payment proof of ₹800.0',3,'payment_proof','/bills/payment-proofs/3','?','#3498db',0,'2026-08-23 03:26:12',NULL),(104,1,'payment_proof_submitted','New Payment Proof Submitted','Mohammed Aminu Shehe submitted a payment proof of ₹800.0',4,'payment_proof','/bills/payment-proofs/4','?','#3498db',0,'2026-08-23 03:28:09',NULL),(105,2,'payment_proof_submitted','New Payment Proof Submitted','Mohammed Aminu Shehe submitted a payment proof of ₹800.0',4,'payment_proof','/bills/payment-proofs/4','?','#3498db',0,'2026-08-23 03:28:09',NULL),(106,4,'payment_proof_submitted','New Payment Proof Submitted','Mohammed Aminu Shehe submitted a payment proof of ₹800.0',4,'payment_proof','/bills/payment-proofs/4','?','#3498db',0,'2026-08-23 03:28:09',NULL),(107,5,'payment_proof_submitted','New Payment Proof Submitted','Mohammed Aminu Shehe submitted a payment proof of ₹800.0',4,'payment_proof','/bills/payment-proofs/4','?','#3498db',0,'2026-08-23 03:28:09',NULL),(108,6,'payment_proof_submitted','New Payment Proof Submitted','Mohammed Aminu Shehe submitted a payment proof of ₹800.0',4,'payment_proof','/bills/payment-proofs/4','?','#3498db',0,'2026-08-23 03:28:09',NULL),(109,1,'bill_created','New Bill Generated','Bill of ₹11000.00 created for Mohammed Aminu Shehe',4,'bill','/bills/4','?','#3498db',1,'2026-08-23 03:32:08','2026-08-23 09:02:27'),(110,2,'bill_created','New Bill Generated','Bill of ₹11000.00 created for Mohammed Aminu Shehe',4,'bill','/bills/4','?','#3498db',0,'2026-08-23 03:32:08',NULL),(111,4,'bill_created','New Bill Generated','Bill of ₹11000.00 created for Mohammed Aminu Shehe',4,'bill','/bills/4','?','#3498db',0,'2026-08-23 03:32:08',NULL),(112,5,'bill_created','New Bill Generated','Bill of ₹11000.00 created for Mohammed Aminu Shehe',4,'bill','/bills/4','?','#3498db',0,'2026-08-23 03:32:08',NULL),(113,6,'bill_created','New Bill Generated','Bill of ₹11000.00 created for Mohammed Aminu Shehe',4,'bill','/bills/4','?','#3498db',0,'2026-08-23 03:32:08',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_permissions`
--

LOCK TABLES `admin_permissions` WRITE;
/*!40000 ALTER TABLE `admin_permissions` DISABLE KEYS */;
INSERT INTO `admin_permissions` VALUES (8,4,'tenants',1,0,0,0,'2026-08-22 22:21:28'),(9,4,'guests',0,0,0,0,'2026-08-22 22:21:28'),(10,4,'bills',0,0,0,0,'2026-08-22 22:21:28'),(11,4,'pgs',1,0,0,0,'2026-08-22 22:21:28'),(12,4,'maintenance',1,0,1,0,'2026-08-22 22:21:28'),(13,4,'documents',1,0,1,0,'2026-08-22 22:21:28'),(14,4,'feedbacks',0,0,0,0,'2026-08-22 22:21:28'),(15,5,'tenants',1,1,0,0,'2026-08-23 00:08:06'),(16,5,'guests',1,0,0,0,'2026-08-23 00:08:06'),(17,5,'bills',1,0,0,0,'2026-08-23 00:08:06'),(18,5,'pgs',1,0,0,0,'2026-08-23 00:08:06'),(19,5,'maintenance',1,0,0,0,'2026-08-23 00:08:06'),(20,5,'documents',1,0,0,0,'2026-08-23 00:08:06'),(21,5,'feedbacks',1,0,0,0,'2026-08-23 00:08:06'),(22,6,'tenants',0,0,0,0,'2026-08-23 01:44:55'),(23,6,'guests',0,0,0,0,'2026-08-23 01:44:55'),(24,6,'bills',0,0,0,0,'2026-08-23 01:44:55'),(25,6,'pgs',0,0,0,0,'2026-08-23 01:44:55'),(26,6,'maintenance',0,0,0,0,'2026-08-23 01:44:55'),(27,6,'documents',0,0,0,0,'2026-08-23 01:44:55'),(28,6,'feedbacks',0,0,0,0,'2026-08-23 01:44:55');
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
INSERT INTO `admins` VALUES (1,'MO11','molittle1011@gmail.com',NULL,'$2b$12$ERndXqISwxL48Vc/RDNhHe0iUhM1omZiqdvOppqFkORhIKX.ZLc/u',0,'super_admin',NULL,NULL,NULL,NULL,NULL,1,'2026-08-22 10:23:04','2026-08-23 01:39:12','2026-08-23 07:08:58',NULL,NULL),(2,'Livinkey Admin','livinkey@gmail.com',NULL,'$2b$12$jPhjgye4s7ASgXnRx8s/qO5Lu9GT7NNA0DhN8xGn4mc1zD5dHLv.6',0,'super_admin',NULL,NULL,NULL,NULL,NULL,1,'2026-08-22 20:44:41','2026-08-22 21:41:17','2026-08-22 21:40:46',NULL,NULL),(4,'Animesh','kanimesh373@gmail.com','8789397542','$2b$12$ZPWsPbF1XLRULoOZjgq5neXu28pg401mKRET6GkUn2wiGKix2Avme',0,'admin',NULL,NULL,NULL,NULL,NULL,1,'2026-08-22 22:21:28','2026-08-22 22:23:49',NULL,NULL,NULL),(5,'Mohammed Aminu Shehe','mosnake111@gmail.com','7681969865','$2b$12$Ia8ZeExV9BSiqcTsvtYRaedlyrLHiXb2mG/3eAqnw7sy2Is4psd/y',0,'admin',NULL,NULL,NULL,NULL,NULL,1,'2026-08-23 00:08:06','2026-08-23 01:22:47','2026-08-23 06:52:33',NULL,NULL),(6,'Mohammed Aminu Shehe','abdulwarithshehe2010@gmail.com','774730606','$2b$12$kranSpvb3YcQo2cb0RlLtOX6rYYqlsP9Hn5V32uDGFi/WZoaTJhky',1,'admin','https://res.cloudinary.com/dlokcqf1h/image/upload/v1787449514/livinkey/admins/xtnsx4o5ldfmm3yn88zn.webp','livinkey/admins/xtnsx4o5ldfmm3yn88zn','image',NULL,NULL,1,'2026-08-23 01:44:55','2026-08-23 01:45:15',NULL,NULL,NULL);
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
  `paid_from` date DEFAULT NULL,
  `paid_till` date DEFAULT NULL,
  `is_partial` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_bill_id` (`bill_id`),
  KEY `idx_bill_payments_paid_till` (`paid_till`),
  CONSTRAINT `fk_bill_payments_bill_id` FOREIGN KEY (`bill_id`) REFERENCES `bills` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bill_payments`
--

LOCK TABLES `bill_payments` WRITE;
/*!40000 ALTER TABLE `bill_payments` DISABLE KEYS */;
INSERT INTO `bill_payments` VALUES (1,1,13190.00,'2026-08-23 06:46:06','payment_proof','ttyh','2026-07-31','2026-08-30',0,'2026-08-23 01:16:06'),(2,3,11000.00,'2026-08-23 08:54:57','payment_proof','455ookh','2026-07-31','2026-08-30',1,'2026-08-23 03:24:57'),(3,3,800.00,'2026-08-23 08:58:19','payment_proof','hdhud','2026-07-31','2026-08-30',0,'2026-08-23 03:28:19');
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
  KEY `idx_bills_tenant_created` (`tenant_id`,`created_at`),
  CONSTRAINT `fk_bills_created_by` FOREIGN KEY (`created_by`) REFERENCES `admins` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bills_tenant_id` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bills`
--

LOCK TABLES `bills` WRITE;
/*!40000 ALTER TABLE `bills` DISABLE KEYS */;
INSERT INTO `bills` VALUES (1,8,11000.00,1890.00,NULL,NULL,NULL,300.00,0.00,13190.00,13190.00,0.00,'paid',NULL,NULL,NULL,NULL,NULL,NULL,'2026-08-23 06:44:03','2026-08-30 06:44:03',1,'2026-08-23 01:14:03','2026-08-23 01:16:09',0,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'upi',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2,7,11000.00,2900.00,NULL,NULL,NULL,300.00,0.00,14200.00,0.00,0.00,'unpaid','https://res.cloudinary.com/dlokcqf1h/image/upload/v1787453418/livinkey/bills/qr/safsyfr1h1zsourslbbx.png','livinkey/bills/qr/safsyfr1h1zsourslbbx','image','https://res.cloudinary.com/dlokcqf1h/image/upload/v1787453419/livinkey/bills/qr/srodsaogp6wqv0lopxrq.png','livinkey/bills/qr/srodsaogp6wqv0lopxrq','image','2026-08-23 08:20:20','2026-08-30 08:20:20',1,'2026-08-23 02:50:20','2026-08-23 02:50:20',0,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'upi',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(3,1,11000.00,500.00,NULL,NULL,NULL,300.00,0.00,11800.00,11800.00,0.00,'paid',NULL,NULL,NULL,NULL,NULL,NULL,'2026-08-23 08:24:08','2026-08-30 08:24:08',1,'2026-08-23 02:54:08','2026-08-23 03:28:19',0,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'upi',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(4,7,11000.00,0.00,NULL,NULL,NULL,0.00,0.00,11000.00,0.00,0.00,'unpaid','https://res.cloudinary.com/dlokcqf1h/image/upload/v1787455923/livinkey/bills/qr/hmqw5kn4xvwktqfcjvlw.png','livinkey/bills/qr/hmqw5kn4xvwktqfcjvlw','image','https://res.cloudinary.com/dlokcqf1h/image/upload/v1787455924/livinkey/bills/qr/xnhgpjdft64yaxdnxlbq.png','livinkey/bills/qr/xnhgpjdft64yaxdnxlbq','image','2026-08-23 09:02:04','2026-08-30 09:02:04',1,'2026-08-23 03:32:04','2026-08-23 03:32:04',0,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'upi',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cash_payments`
--

LOCK TABLES `cash_payments` WRITE;
/*!40000 ALTER TABLE `cash_payments` DISABLE KEYS */;
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
INSERT INTO `floors` VALUES (1,1,1,'2026-08-22 13:40:30','2026-08-22 13:40:30',1,NULL),(2,1,2,'2026-08-22 13:40:34','2026-08-22 13:40:34',1,NULL),(3,1,3,'2026-08-22 13:40:37','2026-08-22 13:40:37',1,NULL),(4,2,1,'2026-08-22 13:45:18','2026-08-22 13:45:18',1,NULL),(5,2,2,'2026-08-22 13:45:26','2026-08-22 13:45:26',1,NULL),(6,2,3,'2026-08-22 13:45:35','2026-08-22 13:45:35',1,NULL),(7,2,4,'2026-08-22 13:45:44','2026-08-22 13:45:44',1,NULL),(8,3,1,'2026-08-22 13:47:38','2026-08-22 13:47:38',1,NULL),(9,3,2,'2026-08-22 13:47:40','2026-08-22 13:47:40',1,NULL),(10,4,1,'2026-08-22 13:50:01','2026-08-22 13:50:01',1,NULL),(11,4,2,'2026-08-22 13:50:03','2026-08-22 13:50:03',1,NULL),(12,5,1,'2026-08-22 13:51:15','2026-08-22 13:51:15',1,NULL),(13,5,2,'2026-08-22 13:51:16','2026-08-22 13:51:16',1,NULL),(14,6,1,'2026-08-22 13:53:44','2026-08-22 13:53:44',1,NULL),(15,6,2,'2026-08-22 13:53:48','2026-08-22 13:53:48',1,NULL),(16,6,3,'2026-08-22 13:53:51','2026-08-22 13:53:51',1,NULL),(17,7,1,'2026-08-22 13:55:42','2026-08-22 13:55:42',1,NULL),(18,7,2,'2026-08-22 13:55:44','2026-08-22 13:55:44',1,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maintenance_requests`
--

LOCK TABLES `maintenance_requests` WRITE;
/*!40000 ALTER TABLE `maintenance_requests` DISABLE KEYS */;
INSERT INTO `maintenance_requests` VALUES (1,6,32,'Electrician','light issue','2026-08-23','12:00 PM',NULL,NULL,NULL,'completed',6,'2026-08-22 22:23:20','2026-08-23 01:11:35'),(2,8,15,'Electrician','dddd','2026-08-26','22:50','https://res.cloudinary.com/dlokcqf1h/image/upload/v1787447108/livinkey/maintenance/8/cbya7ubcubq9ifoyqr52.jpg','livinkey/maintenance/8/cbya7ubcubq9ifoyqr52','image','completed',8,'2026-08-23 01:05:11','2026-08-23 01:11:36'),(3,8,15,'Cleaning','tttf','2026-08-26','06:35','https://res.cloudinary.com/dlokcqf1h/image/upload/v1787447150/livinkey/maintenance/8/g8m2cqy4ixlxebj9rpbt.jpg','livinkey/maintenance/8/g8m2cqy4ixlxebj9rpbt','image','completed',8,'2026-08-23 01:05:55','2026-08-23 01:11:37'),(4,8,15,'Check-out','tggg','2026-08-29','14:25',NULL,NULL,NULL,'completed',8,'2026-08-23 01:06:14','2026-08-23 01:11:38');
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
  KEY `idx_payment_proofs_paid_till` (`paid_till`),
  CONSTRAINT `payment_proofs_ibfk_1` FOREIGN KEY (`bill_id`) REFERENCES `bills` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payment_proofs_ibfk_2` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payment_proofs_ibfk_3` FOREIGN KEY (`verified_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_proofs`
--

LOCK TABLES `payment_proofs` WRITE;
/*!40000 ALTER TABLE `payment_proofs` DISABLE KEYS */;
INSERT INTO `payment_proofs` VALUES (1,1,8,'ttyh',13190.00,'2026-07-31','2026-08-30','https://res.cloudinary.com/dlokcqf1h/image/upload/v1787447731/livinkey/payments/proofs/8/bfisvousscnuu51u7iwh.jpg','livinkey/payments/proofs/8/bfisvousscnuu51u7iwh','image','verified',NULL,1,'2026-08-23 06:46:06','2026-08-23 01:15:32','2026-08-23 01:16:06'),(2,3,1,'455ookh',11000.00,'2026-07-31','2026-08-30','https://res.cloudinary.com/dlokcqf1h/image/upload/v1787455446/livinkey/payments/proofs/1/w3jqctqnukix2hhq84sd.jpg','livinkey/payments/proofs/1/w3jqctqnukix2hhq84sd','image','verified',NULL,1,'2026-08-23 08:54:57','2026-08-23 03:24:07','2026-08-23 03:24:57'),(3,3,1,'ygi',800.00,NULL,NULL,'https://res.cloudinary.com/dlokcqf1h/image/upload/v1787455571/livinkey/payments/proofs/1/oxujbr35pqma5apt4ker.jpg','livinkey/payments/proofs/1/oxujbr35pqma5apt4ker','image','rejected','Not Valid',NULL,NULL,'2026-08-23 03:26:12','2026-08-23 03:27:19'),(4,3,1,'hdhud',800.00,'2026-07-31','2026-08-30','https://res.cloudinary.com/dlokcqf1h/image/upload/v1787455688/livinkey/payments/proofs/1/j2410b7xudlnsoifdrft.jpg','livinkey/payments/proofs/1/j2410b7xudlnsoifdrft','image','verified',NULL,1,'2026-08-23 08:58:19','2026-08-23 03:28:09','2026-08-23 03:28:19');
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
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pg_amenities`
--

LOCK TABLES `pg_amenities` WRITE;
/*!40000 ALTER TABLE `pg_amenities` DISABLE KEYS */;
INSERT INTO `pg_amenities` VALUES (1,1,'Free WiFi',0,'2026-08-22 13:40:21'),(2,1,'24×7 Assistance',0,'2026-08-22 13:40:22'),(3,1,'24×7 Power Backup',0,'2026-08-22 13:40:23'),(4,1,'43 Inch LED',0,'2026-08-22 13:40:23'),(5,1,'Ventilated Rooms',0,'2026-08-22 13:40:24'),(6,1,'Free Housekeeping',0,'2026-08-22 13:40:24'),(7,1,'CCTV',0,'2026-08-22 13:40:25'),(8,1,'AC',0,'2026-08-22 13:40:25'),(9,2,'Free WiFi',0,'2026-08-22 13:45:06'),(10,2,'24×7 Assistance',0,'2026-08-22 13:45:07'),(11,2,'24×7 Power Backup',0,'2026-08-22 13:45:07'),(12,2,'43 Inch LED',0,'2026-08-22 13:45:08'),(13,2,'Ventilated Rooms',0,'2026-08-22 13:45:08'),(14,2,'Free Housekeeping',0,'2026-08-22 13:45:09'),(15,2,'CCTV',0,'2026-08-22 13:45:09'),(16,2,'AC',0,'2026-08-22 13:45:10'),(17,3,'Free WiFi',0,'2026-08-22 13:47:27'),(18,3,'24×7 Assistance',0,'2026-08-22 13:47:28'),(19,3,'24×7 Power Backup',0,'2026-08-22 13:47:28'),(20,3,'Ventilated Rooms',0,'2026-08-22 13:47:28'),(21,3,'Free Housekeeping',0,'2026-08-22 13:47:29'),(22,3,'CCTV',0,'2026-08-22 13:47:29'),(23,3,'AC',0,'2026-08-22 13:47:30'),(24,4,'Free WiFi',0,'2026-08-22 13:49:36'),(25,4,'24×7 Assistance',0,'2026-08-22 13:49:36'),(26,4,'24×7 Power Backup',0,'2026-08-22 13:49:37'),(27,4,'43 Inch LED',0,'2026-08-22 13:49:37'),(28,4,'Ventilated Rooms',0,'2026-08-22 13:49:38'),(29,4,'Free Housekeeping',0,'2026-08-22 13:49:38'),(30,4,'CCTV',0,'2026-08-22 13:49:39'),(31,4,'AC',0,'2026-08-22 13:49:39'),(32,4,'Washing Machine',1,'2026-08-22 13:49:40'),(33,5,'Free WiFi',0,'2026-08-22 13:51:07'),(34,5,'24×7 Assistance',0,'2026-08-22 13:51:08'),(35,5,'24×7 Power Backup',0,'2026-08-22 13:51:08'),(36,5,'Ventilated Rooms',0,'2026-08-22 13:51:09'),(37,5,'Free Housekeeping',0,'2026-08-22 13:51:09'),(38,5,'CCTV',0,'2026-08-22 13:51:10'),(39,5,'AC',0,'2026-08-22 13:51:10'),(40,6,'Free WiFi',0,'2026-08-22 13:53:31'),(41,6,'24×7 Assistance',0,'2026-08-22 13:53:32'),(42,6,'24×7 Power Backup',0,'2026-08-22 13:53:32'),(43,6,'43 Inch LED',0,'2026-08-22 13:53:32'),(44,6,'Ventilated Rooms',0,'2026-08-22 13:53:33'),(45,6,'Free Housekeeping',0,'2026-08-22 13:53:33'),(46,6,'CCTV',0,'2026-08-22 13:53:34'),(47,6,'AC',0,'2026-08-22 13:53:34'),(48,7,'Free WiFi',0,'2026-08-22 13:55:33'),(49,7,'24×7 Assistance',0,'2026-08-22 13:55:34'),(50,7,'24×7 Power Backup',0,'2026-08-22 13:55:34'),(51,7,'43 Inch LED',0,'2026-08-22 13:55:35'),(52,7,'Ventilated Rooms',0,'2026-08-22 13:55:36'),(53,7,'Free Housekeeping',0,'2026-08-22 13:55:36'),(54,7,'CCTV',0,'2026-08-22 13:55:36'),(55,7,'AC',0,'2026-08-22 13:55:37');
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pgs`
--

LOCK TABLES `pgs` WRITE;
/*!40000 ALTER TABLE `pgs` DISABLE KEYS */;
INSERT INTO `pgs` VALUES (1,'Alishan PG','LawGate, Phagwara',3,NULL,NULL,NULL,1,1,'2026-08-22 13:40:20','2026-08-22 13:40:20',10000.00,10000.00),(2,'Happy Living PG','LawGate, Phagwara',4,NULL,NULL,NULL,1,1,'2026-08-22 13:45:06','2026-08-22 13:45:06',12000.00,12000.00),(3,'DS Apartment','LawGate, Phagwara',2,NULL,NULL,NULL,1,1,'2026-08-22 13:47:27','2026-08-22 13:47:27',8500.00,8500.00),(4,'J T House (Plot No :- 257)','Green Valley, Phagwara',2,NULL,NULL,NULL,1,1,'2026-08-22 13:49:35','2026-08-22 13:49:35',12000.00,12000.00),(5,'Shree Shyam Apartment','LawGate, Phagwara',2,NULL,NULL,NULL,1,1,'2026-08-22 13:51:07','2026-08-22 13:51:07',10000.00,10000.00),(6,'Royal Suits ( (Plot No :- 103,104)','Green Valley, Phagwara',3,NULL,NULL,NULL,1,1,'2026-08-22 13:53:31','2026-08-22 13:53:31',15000.00,15000.00),(7,'Mannat Apartment (Plot No :- 99)','Green Valley, Phagwara',2,NULL,NULL,NULL,1,1,'2026-08-22 13:55:33','2026-08-22 13:55:33',14000.00,14000.00);
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room_occupancy`
--

LOCK TABLES `room_occupancy` WRITE;
/*!40000 ALTER TABLE `room_occupancy` DISABLE KEYS */;
INSERT INTO `room_occupancy` VALUES (1,67,1,'2026-08-22 15:56:45'),(2,32,1,'2026-08-22 22:18:15'),(3,15,2,'2026-08-23 00:05:33');
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
INSERT INTO `rooms` VALUES (1,1,'101',2,1,'2026-08-22 13:40:32','2026-08-22 13:40:32',10000.00,NULL),(2,1,'102',2,1,'2026-08-22 13:40:32','2026-08-22 13:40:32',10000.00,NULL),(3,1,'103',2,1,'2026-08-22 13:40:33','2026-08-22 13:40:33',10000.00,NULL),(4,1,'104',2,1,'2026-08-22 13:40:33','2026-08-22 13:40:33',10000.00,NULL),(5,1,'105',2,1,'2026-08-22 13:40:33','2026-08-22 13:40:33',10000.00,NULL),(6,1,'106',2,1,'2026-08-22 13:40:34','2026-08-22 13:40:34',10000.00,NULL),(7,2,'201',2,1,'2026-08-22 13:40:35','2026-08-22 13:40:35',10000.00,NULL),(8,2,'202',2,1,'2026-08-22 13:40:35','2026-08-22 13:40:35',10000.00,NULL),(9,2,'203',2,1,'2026-08-22 13:40:36','2026-08-22 13:40:36',10000.00,NULL),(10,2,'204',2,1,'2026-08-22 13:40:36','2026-08-22 13:40:36',10000.00,NULL),(11,2,'205',2,1,'2026-08-22 13:40:36','2026-08-22 13:40:36',10000.00,NULL),(12,2,'206',2,1,'2026-08-22 13:40:37','2026-08-22 13:40:37',10000.00,NULL),(13,3,'301',2,1,'2026-08-22 13:40:38','2026-08-22 13:40:38',10000.00,NULL),(14,3,'302',2,1,'2026-08-22 13:40:38','2026-08-22 13:40:38',10000.00,NULL),(15,4,'101',2,1,'2026-08-22 13:45:19','2026-08-22 13:45:19',12000.00,NULL),(16,4,'102',2,1,'2026-08-22 13:45:19','2026-08-22 13:45:19',12000.00,NULL),(17,4,'103',2,1,'2026-08-22 13:45:20','2026-08-22 13:45:20',12000.00,NULL),(18,4,'104',2,1,'2026-08-22 13:45:20','2026-08-22 13:45:20',12000.00,NULL),(19,4,'105',2,1,'2026-08-22 13:45:21','2026-08-22 13:45:21',12000.00,NULL),(20,4,'106',2,1,'2026-08-22 13:45:21','2026-08-22 13:45:21',12000.00,NULL),(21,4,'107',2,1,'2026-08-22 13:45:21','2026-08-22 13:45:21',12000.00,NULL),(22,4,'108',2,1,'2026-08-22 13:45:22','2026-08-22 13:45:22',12000.00,NULL),(23,4,'109',2,1,'2026-08-22 13:45:22','2026-08-22 13:45:22',12000.00,NULL),(24,4,'110',2,1,'2026-08-22 13:45:23','2026-08-22 13:45:23',12000.00,NULL),(25,4,'111',2,1,'2026-08-22 13:45:23','2026-08-22 13:45:23',12000.00,NULL),(26,4,'112',2,1,'2026-08-22 13:45:24','2026-08-22 13:45:24',12000.00,NULL),(27,4,'113',2,1,'2026-08-22 13:45:24','2026-08-22 13:45:24',12000.00,NULL),(28,4,'114',2,1,'2026-08-22 13:45:25','2026-08-22 13:45:25',12000.00,NULL),(29,4,'115',2,1,'2026-08-22 13:45:25','2026-08-22 13:45:25',12000.00,NULL),(30,4,'116',2,1,'2026-08-22 13:45:25','2026-08-22 13:45:25',12000.00,NULL),(31,4,'117',2,1,'2026-08-22 13:45:26','2026-08-22 13:45:26',12000.00,NULL),(32,5,'201',2,1,'2026-08-22 13:45:27','2026-08-22 13:45:27',12000.00,NULL),(33,5,'202',2,1,'2026-08-22 13:45:27','2026-08-22 13:45:27',12000.00,NULL),(34,5,'203',2,1,'2026-08-22 13:45:28','2026-08-22 13:45:28',12000.00,NULL),(35,5,'204',2,1,'2026-08-22 13:45:28','2026-08-22 13:45:28',12000.00,NULL),(36,5,'205',2,1,'2026-08-22 13:45:29','2026-08-22 13:45:29',12000.00,NULL),(37,5,'206',2,1,'2026-08-22 13:45:29','2026-08-22 13:45:29',12000.00,NULL),(38,5,'207',2,1,'2026-08-22 13:45:30','2026-08-22 13:45:30',12000.00,NULL),(39,5,'208',2,1,'2026-08-22 13:45:30','2026-08-22 13:45:30',12000.00,NULL),(40,5,'209',2,1,'2026-08-22 13:45:31','2026-08-22 13:45:31',12000.00,NULL),(41,5,'210',2,1,'2026-08-22 13:45:31','2026-08-22 13:45:31',12000.00,NULL),(42,5,'211',2,1,'2026-08-22 13:45:32','2026-08-22 13:45:32',12000.00,NULL),(43,5,'212',2,1,'2026-08-22 13:45:32','2026-08-22 13:45:32',12000.00,NULL),(44,5,'213',2,1,'2026-08-22 13:45:33','2026-08-22 13:45:33',10000.00,NULL),(45,5,'214',2,1,'2026-08-22 13:45:33','2026-08-22 13:45:33',12000.00,NULL),(46,5,'215',2,1,'2026-08-22 13:45:34','2026-08-22 13:45:34',12000.00,NULL),(47,5,'216',2,1,'2026-08-22 13:45:34','2026-08-22 13:45:34',12000.00,NULL),(48,5,'217',2,1,'2026-08-22 13:45:35','2026-08-22 13:45:35',12000.00,NULL),(49,6,'301',2,1,'2026-08-22 13:45:36','2026-08-22 13:45:36',12000.00,NULL),(50,6,'302',2,1,'2026-08-22 13:45:36','2026-08-22 13:45:36',12000.00,NULL),(51,6,'303',2,1,'2026-08-22 13:45:37','2026-08-22 13:45:37',12000.00,NULL),(52,6,'304',2,1,'2026-08-22 13:45:37','2026-08-22 13:45:37',12000.00,NULL),(53,6,'305',2,1,'2026-08-22 13:45:37','2026-08-22 13:45:37',12000.00,NULL),(54,6,'306',2,1,'2026-08-22 13:45:38','2026-08-22 13:45:38',12000.00,NULL),(55,6,'307',2,1,'2026-08-22 13:45:38','2026-08-22 13:45:38',12000.00,NULL),(56,6,'308',2,1,'2026-08-22 13:45:39','2026-08-22 13:45:39',12000.00,NULL),(57,6,'309',2,1,'2026-08-22 13:45:40','2026-08-22 13:45:40',12000.00,NULL),(58,6,'310',2,1,'2026-08-22 13:45:40','2026-08-22 13:45:40',12000.00,NULL),(59,6,'311',2,1,'2026-08-22 13:45:41','2026-08-22 13:45:41',12000.00,NULL),(60,6,'312',2,1,'2026-08-22 13:45:41','2026-08-22 13:45:41',12000.00,NULL),(61,6,'313',2,1,'2026-08-22 13:45:42','2026-08-22 13:45:42',12000.00,NULL),(62,6,'314',2,1,'2026-08-22 13:45:42','2026-08-22 13:45:42',12000.00,NULL),(63,6,'315',2,1,'2026-08-22 13:45:43','2026-08-22 13:45:43',12000.00,NULL),(64,6,'316',2,1,'2026-08-22 13:45:43','2026-08-22 13:45:43',12000.00,NULL),(65,6,'317',2,1,'2026-08-22 13:45:44','2026-08-22 13:45:44',12000.00,NULL),(66,7,'401',2,1,'2026-08-22 13:45:45','2026-08-22 13:45:45',12000.00,NULL),(67,7,'402',2,1,'2026-08-22 13:45:45','2026-08-22 13:45:45',12000.00,NULL),(68,7,'403',2,1,'2026-08-22 13:45:46','2026-08-22 13:45:46',12000.00,NULL),(69,8,'101',2,1,'2026-08-22 13:47:38','2026-08-22 13:47:38',8500.00,NULL),(70,8,'102',2,1,'2026-08-22 13:47:39','2026-08-22 13:47:39',8500.00,NULL),(71,8,'103',2,1,'2026-08-22 13:47:39','2026-08-22 13:47:39',8500.00,NULL),(72,8,'104',2,1,'2026-08-22 13:47:40','2026-08-22 13:47:40',8500.00,NULL),(73,9,'201',2,1,'2026-08-22 13:47:41','2026-08-22 13:47:41',8500.00,NULL),(74,9,'202',2,1,'2026-08-22 13:47:41','2026-08-22 13:47:41',8500.00,NULL),(75,9,'203',2,1,'2026-08-22 13:47:42','2026-08-22 13:47:42',8500.00,NULL),(76,10,'101',2,1,'2026-08-22 13:50:01','2026-08-22 13:50:01',12000.00,NULL),(77,10,'102',2,1,'2026-08-22 13:50:01','2026-08-22 13:50:01',12000.00,NULL),(78,10,'103',2,1,'2026-08-22 13:50:02','2026-08-22 13:50:02',12000.00,NULL),(79,10,'104',2,1,'2026-08-22 13:50:02','2026-08-22 13:50:02',12000.00,NULL),(80,11,'201',2,1,'2026-08-22 13:50:03','2026-08-22 13:50:03',12000.00,NULL),(81,11,'202',2,1,'2026-08-22 13:50:04','2026-08-22 13:50:04',12000.00,NULL),(82,11,'203',2,1,'2026-08-22 13:50:04','2026-08-22 13:50:04',12000.00,NULL),(83,12,'101',2,1,'2026-08-22 13:51:15','2026-08-22 13:51:15',10000.00,NULL),(84,12,'102',2,1,'2026-08-22 13:51:16','2026-08-22 13:51:16',10000.00,NULL),(85,12,'103',2,1,'2026-08-22 13:51:16','2026-08-22 13:51:16',10000.00,NULL),(86,13,'201',2,1,'2026-08-22 13:51:17','2026-08-22 13:51:17',10000.00,NULL),(87,13,'202',2,1,'2026-08-22 13:51:17','2026-08-22 13:51:17',10000.00,NULL),(88,14,'101',2,1,'2026-08-22 13:53:45','2026-08-22 13:53:45',15000.00,NULL),(89,14,'102',2,1,'2026-08-22 13:53:45','2026-08-22 13:53:45',15000.00,NULL),(90,14,'103',2,1,'2026-08-22 13:53:46','2026-08-22 13:53:46',15000.00,NULL),(91,14,'104',2,1,'2026-08-22 13:53:46','2026-08-22 13:53:46',15000.00,NULL),(92,14,'105',2,1,'2026-08-22 13:53:47','2026-08-22 13:53:47',15000.00,NULL),(93,14,'106',2,1,'2026-08-22 13:53:47','2026-08-22 13:53:47',15000.00,NULL),(94,15,'201',2,1,'2026-08-22 13:53:48','2026-08-22 13:53:48',15000.00,NULL),(95,15,'202',2,1,'2026-08-22 13:53:49','2026-08-22 13:53:49',15000.00,NULL),(96,15,'203',2,1,'2026-08-22 13:53:49','2026-08-22 13:53:49',15000.00,NULL),(97,15,'204',2,1,'2026-08-22 13:53:50','2026-08-22 13:53:50',15000.00,NULL),(98,15,'205',2,1,'2026-08-22 13:53:50','2026-08-22 13:53:50',15000.00,NULL),(99,15,'206',2,1,'2026-08-22 13:53:51','2026-08-22 13:53:51',15000.00,NULL),(100,16,'301',2,1,'2026-08-22 13:53:52','2026-08-22 13:53:52',15000.00,NULL),(101,16,'302',2,1,'2026-08-22 13:53:52','2026-08-22 13:53:52',15000.00,NULL),(102,16,'303',2,1,'2026-08-22 13:53:53','2026-08-22 13:53:53',15000.00,NULL),(103,16,'304',2,1,'2026-08-22 13:53:53','2026-08-22 13:53:53',15000.00,NULL),(104,16,'305',2,1,'2026-08-22 13:53:54','2026-08-22 13:53:54',15000.00,NULL),(105,17,'101',2,1,'2026-08-22 13:55:42','2026-08-22 13:55:42',14000.00,NULL),(106,17,'102',2,1,'2026-08-22 13:55:43','2026-08-22 13:55:43',14000.00,NULL),(107,17,'103',2,1,'2026-08-22 13:55:43','2026-08-22 13:55:43',14000.00,NULL),(108,17,'104',2,1,'2026-08-22 13:55:44','2026-08-22 13:55:44',14000.00,NULL),(109,18,'201',2,1,'2026-08-22 13:55:45','2026-08-22 13:55:45',14000.00,NULL),(110,18,'202',2,1,'2026-08-22 13:55:45','2026-08-22 13:55:45',14000.00,NULL),(111,18,'203',2,1,'2026-08-22 13:55:46','2026-08-22 13:55:46',14000.00,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_details`
--

LOCK TABLES `tenant_details` WRITE;
/*!40000 ALTER TABLE `tenant_details` DISABLE KEYS */;
INSERT INTO `tenant_details` VALUES (1,1,2,67,'international','null','null','170626CH433T','2026-07-22','2026-09-30',10000.00,10500.00,14,'2026-07-31','2026-08-30','2026-06-14',NULL,NULL,NULL,'2026-08-22 15:56:44','2026-08-23 03:24:57'),(2,6,2,32,'international','201275598440','201275598440','ADFGBBCX','2026-07-22','2026-09-30',11000.00,8000.00,1,'2026-08-01','2026-09-01','2026-08-01',NULL,NULL,NULL,'2026-08-22 22:18:14','2026-08-22 22:18:14'),(3,7,2,15,'national','201275598440','201275598440','170626CH433T','0000-00-00','0000-00-00',11000.00,10500.00,14,'2026-08-14','2026-09-13','2026-06-14',NULL,NULL,NULL,'2026-08-23 00:02:50','2026-08-23 00:02:50'),(4,8,2,15,'international','null','null','170626CH433T','0000-00-00','2026-09-13',10000.00,10500.00,14,'2026-07-31','2026-08-30','2026-06-14',NULL,NULL,NULL,'2026-08-23 00:05:33','2026-08-23 01:16:06');
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_devices`
--

LOCK TABLES `tenant_devices` WRITE;
/*!40000 ALTER TABLE `tenant_devices` DISABLE KEYS */;
INSERT INTO `tenant_devices` VALUES (1,1,'eoNVDXU9S0qErgMiF1f2yR:APA91bGbpSm8nCBwDIO-NRVho88_u2ILApjZd43EOATRvu1cGuQvnlrXOj3mPgkf1E_v4CuhiCZ3OXKTemOVn_Tfy1df7XD2pqcepw_1Pl2ZDkxav-in20M','android',0,'2026-08-22 16:50:36','2026-08-23 03:29:36'),(2,6,'dEv9oTDQQ5qTB_f6i8iOG-:APA91bHYgEG5mhNwG3qR1Tleq5It_nzcybCOsUIn8atTD4dy6e5LDezjki5061-Wc8affqVtJ6tQvT26Z5N4Uu_Y0RVg0gmrEkVOFUGR_pM__Ph6NcSC6xs','android',1,'2026-08-22 22:19:47','2026-08-22 22:40:36'),(3,8,'eoNVDXU9S0qErgMiF1f2yR:APA91bGbpSm8nCBwDIO-NRVho88_u2ILApjZd43EOATRvu1cGuQvnlrXOj3mPgkf1E_v4CuhiCZ3OXKTemOVn_Tfy1df7XD2pqcepw_1Pl2ZDkxav-in20M','android',0,'2026-08-23 01:00:30','2026-08-23 02:15:38'),(4,7,'eoNVDXU9S0qErgMiF1f2yR:APA91bGbpSm8nCBwDIO-NRVho88_u2ILApjZd43EOATRvu1cGuQvnlrXOj3mPgkf1E_v4CuhiCZ3OXKTemOVn_Tfy1df7XD2pqcepw_1Pl2ZDkxav-in20M','android',1,'2026-08-23 02:52:06','2026-08-23 03:32:40');
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_documents`
--

LOCK TABLES `tenant_documents` WRITE;
/*!40000 ALTER TABLE `tenant_documents` DISABLE KEYS */;
INSERT INTO `tenant_documents` VALUES (1,8,'https://res.cloudinary.com/dlokcqf1h/image/upload/v1787446880/livinkey/tenants/8/documents/nfausevmm86r1vhu5uk7.jpg','livinkey/tenants/8/documents/nfausevmm86r1vhu5uk7','image','passport_photo','2026-08-23 01:01:21','doc_1787446878031.jpg',62897,'2026-08-23 01:01:21'),(2,8,'https://res.cloudinary.com/dlokcqf1h/image/upload/v1787446889/livinkey/tenants/8/documents/xhirgossagetsqealo72.jpg','livinkey/tenants/8/documents/xhirgossagetsqealo72','image','passport','2026-08-23 01:01:30','doc_1787446886279.jpg',66095,'2026-08-23 01:01:30'),(3,8,'https://res.cloudinary.com/dlokcqf1h/image/upload/v1787446900/livinkey/tenants/8/documents/wxglexixcd4qeqqvteho.jpg','livinkey/tenants/8/documents/wxglexixcd4qeqqvteho','image','visa','2026-08-23 01:01:41','doc_1787446897733.jpg',38207,'2026-08-23 01:01:41'),(4,8,'https://res.cloudinary.com/dlokcqf1h/image/upload/v1787446911/livinkey/tenants/8/documents/oznk7wm6bldx132plxnz.jpg','livinkey/tenants/8/documents/oznk7wm6bldx132plxnz','image','arrival_stamp','2026-08-23 01:01:52','doc_1787446908698.jpg',26804,'2026-08-23 01:01:52'),(5,8,'https://res.cloudinary.com/dlokcqf1h/image/upload/v1787446919/livinkey/tenants/8/documents/tl3ykoafckp6jn19gwk2.jpg','livinkey/tenants/8/documents/tl3ykoafckp6jn19gwk2','image','c_form','2026-08-23 01:02:00','doc_1787446916210.jpg',47196,'2026-08-23 01:02:00'),(6,8,'https://res.cloudinary.com/dlokcqf1h/image/upload/v1787446925/livinkey/tenants/8/documents/foz6qju4s8gg3ynxldnc.jpg','livinkey/tenants/8/documents/foz6qju4s8gg3ynxldnc','image','efrro','2026-08-23 01:02:06','doc_1787446924105.jpg',16677,'2026-08-23 01:02:06'),(7,8,'https://res.cloudinary.com/dlokcqf1h/image/upload/v1787446938/livinkey/tenants/8/documents/cdwkww05xwvhebr2r35u.jpg','livinkey/tenants/8/documents/cdwkww05xwvhebr2r35u','image','university_id','2026-08-23 01:02:19','doc_1787446935399.jpg',47196,'2026-08-23 01:02:19'),(8,1,'https://res.cloudinary.com/dlokcqf1h/image/upload/v1787451374/livinkey/tenants/1/documents/fdjjpymzg2zwsppojf0h.jpg','livinkey/tenants/1/documents/fdjjpymzg2zwsppojf0h','image','passport_photo','2026-08-23 02:16:15','doc_1787451371070.jpg',103229,'2026-08-23 02:16:15');
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_feedbacks`
--

LOCK TABLES `tenant_feedbacks` WRITE;
/*!40000 ALTER TABLE `tenant_feedbacks` DISABLE KEYS */;
INSERT INTO `tenant_feedbacks` VALUES (1,1,2,10.0,10.0,10.0,10.0,10.0,10.0,'Good Services. The rooms have enough space. They handle maintenance properly','2026-08-22 16:54:23','2026-08-22 16:54:23'),(2,8,2,10.0,9.0,10.0,10.0,10.0,9.8,NULL,'2026-08-23 01:03:54','2026-08-23 01:03:54');
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
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_notifications`
--

LOCK TABLES `tenant_notifications` WRITE;
/*!40000 ALTER TABLE `tenant_notifications` DISABLE KEYS */;
INSERT INTO `tenant_notifications` VALUES (2,6,'maintenance_created','Maintenance Request Submitted','Your Electrician request has been submitted.',1,'maintenance','/maintenance/my-requests','?','#f39c12',0,NULL,'2026-08-22 22:23:22'),(3,6,'maintenance_started','Maintenance Started','Your Electrician request is now in progress.',1,'maintenance','/maintenance/my-requests','?','#3498db',0,NULL,'2026-08-22 22:25:41'),(4,8,'feedback_submitted','Thank You for Your Feedback!','We appreciate you taking the time to share your experience with us.',NULL,'feedback','/profile','⭐','#f39c12',1,'2026-08-23 06:39:15','2026-08-23 01:03:54'),(5,8,'maintenance_created','Maintenance Request Submitted','Your Electrician request has been submitted.',2,'maintenance','/maintenance/my-requests','?','#f39c12',1,'2026-08-23 06:39:15','2026-08-23 01:05:11'),(6,8,'maintenance_created','Maintenance Request Submitted','Your Cleaning request has been submitted.',3,'maintenance','/maintenance/my-requests','?','#f39c12',1,'2026-08-23 06:39:15','2026-08-23 01:05:55'),(7,8,'maintenance_created','Maintenance Request Submitted','Your Check-out request has been submitted.',4,'maintenance','/maintenance/my-requests','?','#f39c12',1,'2026-08-23 06:39:15','2026-08-23 01:06:14'),(8,8,'maintenance_started','Maintenance Started','Your Check-out request is now in progress.',4,'maintenance','/maintenance/my-requests','?','#3498db',1,'2026-08-23 06:41:20','2026-08-23 01:10:59'),(9,8,'maintenance_started','Maintenance Started','Your Cleaning request is now in progress.',3,'maintenance','/maintenance/my-requests','?','#3498db',1,'2026-08-23 06:41:59','2026-08-23 01:11:28'),(10,8,'maintenance_started','Maintenance Started','Your Electrician request is now in progress.',2,'maintenance','/maintenance/my-requests','?','#3498db',1,'2026-08-23 06:41:59','2026-08-23 01:11:32'),(11,6,'maintenance_completed','Maintenance Completed','Your Electrician request has been completed.',1,'maintenance','/maintenance/my-requests','✅','#2ecc71',0,NULL,'2026-08-23 01:11:35'),(12,8,'maintenance_completed','Maintenance Completed','Your Electrician request has been completed.',2,'maintenance','/maintenance/my-requests','✅','#2ecc71',1,'2026-08-23 06:41:59','2026-08-23 01:11:36'),(13,8,'maintenance_completed','Maintenance Completed','Your Cleaning request has been completed.',3,'maintenance','/maintenance/my-requests','✅','#2ecc71',1,'2026-08-23 06:41:59','2026-08-23 01:11:37'),(14,8,'maintenance_completed','Maintenance Completed','Your Check-out request has been completed.',4,'maintenance','/maintenance/my-requests','✅','#2ecc71',1,'2026-08-23 06:41:59','2026-08-23 01:11:38'),(15,1,'bill_created','New Bill Generated','A new bill of ₹13190.00 has been generated for you.',1,'bill','/tenant-payments/bill','?','#3498db',1,'2026-08-23 07:46:26','2026-08-23 01:14:07'),(18,1,'payment_proof_verified','Payment Proof Verified','Your payment proof of ₹11000.00 has been verified.',3,'bill','/tenant-payments/history','✅','#2ecc71',1,'2026-08-23 08:55:38','2026-08-23 03:24:57'),(20,1,'payment_proof_rejected','Payment Proof Rejected','Your payment proof was rejected. Reason: Not Valid',NULL,'bill','/tenant-payments/history','❌','#e74c3c',1,'2026-08-23 08:57:32','2026-08-23 03:27:19'),(21,1,'payment_proof_verified','Payment Proof Verified','Your payment proof of ₹800.00 has been verified.',3,'bill','/tenant-payments/history','✅','#2ecc71',1,'2026-08-23 08:58:32','2026-08-23 03:28:19'),(22,1,'bill_paid','Payment Confirmed','Your payment of ₹800.00 has been confirmed.',3,'bill','/tenant-payments/history','✅','#2ecc71',1,'2026-08-23 08:58:31','2026-08-23 03:28:19'),(23,8,'efrro_expiry','e-FRRO Expiry Alert','Your e-FRRO expires in 21 days. Please renew immediately.',NULL,'document','/documents','?','#e74c3c',0,NULL,'2026-08-23 03:30:04'),(24,7,'bill_created','New Bill Generated','A new bill of ₹11000.00 has been generated for you.',4,'bill','/tenant-payments/bill','?','#3498db',1,'2026-08-23 09:02:47','2026-08-23 03:32:08');
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenants`
--

LOCK TABLES `tenants` WRITE;
/*!40000 ALTER TABLE `tenants` DISABLE KEYS */;
INSERT INTO `tenants` VALUES (1,'tenant','Mohammed Aminu Shehe','molittle1011@gmail.com','Tanzanian','+91','7681969865','+255 677 532 140','male','international',1,'$2b$12$IHH5IuHU0rIYD81HIwBJYu9tesed6CcHEXQ7fmWhpz8ht7PJG/HtK',1,'2026-08-22 15:56:43','2026-08-22 16:51:02',0,NULL,NULL,NULL,NULL,NULL),(6,'tenant','Sri Ram','sriramprasad1662@gmail.com','Tanzanian','+91','9381124050',NULL,'male','international',1,'$2b$12$dreVE/r.mK2fWEXr80/5TOMm7z2nJXjgZrrRzj5TGrxcTIqfZhNc2',1,'2026-08-22 22:18:13','2026-08-22 22:20:41',0,NULL,NULL,NULL,NULL,NULL),(7,'tenant','Mohammed Aminu Shehe','mosnake111@gmail.com','Indian','+91','677532140',NULL,'male','national',1,'$2b$12$71/NNxxWoumM4.tpd1bZquVk6GAmXOBHxOFA6lPYIaUNjO855viqa',1,'2026-08-23 00:02:50','2026-08-23 02:52:22',0,NULL,NULL,NULL,NULL,NULL),(8,'tenant','Abdul-Warith Aminu','fourbrothers10112627@gmail.com','Tanzanian','+91','777730606','+255 677 532 140','male','international',1,'$2b$12$ieuuNh0jsbvzFFXIhf7GyuEmhbqvnne/b6/16cViO8/ob6dIDHZbm',1,'2026-08-23 00:05:33','2026-08-23 01:00:46',0,NULL,NULL,NULL,NULL,NULL),(9,'guest','Kinjili','abdulwarithshehe2010@gmail.com','Mexican','+52','7681969865',NULL,'other',NULL,1,'$2b$12$1/Xy0EuW8b/fu6xE/sHYseA3HQGAoI/lNmWtGTHMOLVCWZ1JjigVG',1,'2026-08-23 00:07:22','2026-08-23 00:07:22',0,NULL,NULL,NULL,NULL,NULL);
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

-- Dump completed on 2026-08-23  9:05:19
