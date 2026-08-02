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
INSERT INTO `admins` VALUES (1,'Super Admin','molittle1011@gmail.com',NULL,'$2b$12$G70dlPpJLTsE0nnRxSDDG.rlHXY6ohIls2XLQeDsHDgtzxU3kG7Sm',0,'super_admin',NULL,NULL,NULL,NULL,NULL,1,'2026-08-01 19:54:33','2026-08-02 00:21:13','2026-08-02 05:49:15',NULL,NULL),(2,'Mohammed Aminu Shehe','mosnake111@gmail.com','0677532140','$2b$12$TPc9GjihkUFS5jR/NKefHO1e6Kcd1sCfu88hLmZePWLbHiROVL2tW',0,'admin','https://res.cloudinary.com/dlokcqf1h/image/upload/v1785631345/livinkey/admins/thwkmzoz3tmanoxydk8m.jpg','livinkey/admins/thwkmzoz3tmanoxydk8m','image',NULL,NULL,1,'2026-08-01 19:54:47','2026-08-02 00:42:26','2026-08-02 03:40:34',NULL,NULL);
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `floors`
--

LOCK TABLES `floors` WRITE;
/*!40000 ALTER TABLE `floors` DISABLE KEYS */;
INSERT INTO `floors` VALUES (4,2,1,'2026-08-02 19:23:14','2026-08-02 19:23:14');
/*!40000 ALTER TABLE `floors` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pg_amenities`
--

LOCK TABLES `pg_amenities` WRITE;
/*!40000 ALTER TABLE `pg_amenities` DISABLE KEYS */;
INSERT INTO `pg_amenities` VALUES (7,2,'Free WiFi',0,'2026-08-02 19:23:10'),(8,2,'Swimming Pool',1,'2026-08-02 19:23:10');
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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pg_images`
--

LOCK TABLES `pg_images` WRITE;
/*!40000 ALTER TABLE `pg_images` DISABLE KEYS */;
INSERT INTO `pg_images` VALUES (10,2,'https://res.cloudinary.com/dlokcqf1h/image/upload/v1785698591/livinkey/pgs/images/cwap5bha7oawaght3azr.png','livinkey/pgs/images/cwap5bha7oawaght3azr','image',0,'2026-08-02 19:23:11'),(11,2,'https://res.cloudinary.com/dlokcqf1h/image/upload/v1785698592/livinkey/pgs/images/e5hxv5mukqmhjpevs58r.png','livinkey/pgs/images/e5hxv5mukqmhjpevs58r','image',1,'2026-08-02 19:23:13'),(12,2,'https://res.cloudinary.com/dlokcqf1h/image/upload/v1785698593/livinkey/pgs/images/yieusskobochedxvdhsy.png','livinkey/pgs/images/yieusskobochedxvdhsy','image',2,'2026-08-02 19:23:14');
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
INSERT INTO `pgs` VALUES (2,'Happy Living','123 Main Street, Bangalore',4,'https://res.cloudinary.com/dlokcqf1h/image/upload/v1785698589/livinkey/pgs/qr/grdw8yumdunrxfigb7jv.png','livinkey/pgs/qr/grdw8yumdunrxfigb7jv','image',1,1,'2026-08-02 19:23:10','2026-08-02 19:23:10');
/*!40000 ALTER TABLE `pgs` ENABLE KEYS */;
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_floor_room` (`floor_id`,`room_number`),
  KEY `idx_floor_id` (`floor_id`),
  CONSTRAINT `fk_rooms_floor_id` FOREIGN KEY (`floor_id`) REFERENCES `floors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES (4,4,'101',2,1,'2026-08-02 19:23:14','2026-08-02 19:23:14');
/*!40000 ALTER TABLE `rooms` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-03  1:07:46
