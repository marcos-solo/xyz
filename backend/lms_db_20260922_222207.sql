/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.8.8-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: lms_db
-- ------------------------------------------------------
-- Server version	11.8.8-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `announcements`
--

DROP TABLE IF EXISTS `announcements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcements` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `organization_id` bigint(20) unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` longtext NOT NULL,
  `target_type` enum('all','branch','department','course','batch','role','users') NOT NULL DEFAULT 'all',
  `target_id` bigint(20) unsigned DEFAULT NULL,
  `publish_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  `status` enum('published','draft','archived') NOT NULL DEFAULT 'published',
  `created_by` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `announcements_uuid_unique` (`uuid`),
  KEY `announcements_organization_id_foreign` (`organization_id`),
  KEY `announcements_created_by_foreign` (`created_by`),
  KEY `announcements_target_type_target_id_index` (`target_type`,`target_id`),
  CONSTRAINT `announcements_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `announcements_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcements`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `announcements` WRITE;
/*!40000 ALTER TABLE `announcements` DISABLE KEYS */;
INSERT INTO `announcements` VALUES
(1,'dae4893c-834b-47a3-9576-38660f13298d',1,'Welcome to the New IAT Multi-Branch LMS Platform','We are thrilled to unveil our unified Institute of Advanced Technology Ltd (IAT) LMS and student management platform across Nairobi, Embu, Meru, and Mombasa campuses. Trainers and students can now access real-time timetables, assessments, and verifiable digital certificates.','all',NULL,'2026-08-28 17:59:10',NULL,'published',1,'2026-09-07 17:59:10','2026-09-07 18:02:07','2026-09-07 18:02:07'),
(2,'072874ca-b914-4e8d-9d34-9675a5054d8d',1,'Upcoming Cisco Packet Tracer Practical Lab Evaluation','All CCNA cohorts are reminded that the Enterprise Topology Packet Tracer assignment submission portal closes on Friday at 23:59 EAT.','branch',5,'2026-09-05 17:59:10',NULL,'published',1,'2026-09-07 17:59:10','2026-09-07 18:02:29',NULL);
/*!40000 ALTER TABLE `announcements` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `assessment_answers`
--

DROP TABLE IF EXISTS `assessment_answers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `assessment_answers` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `attempt_id` bigint(20) unsigned NOT NULL,
  `question_id` bigint(20) unsigned NOT NULL,
  `selected_option_id` bigint(20) unsigned DEFAULT NULL,
  `selected_options_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`selected_options_json`)),
  `text_answer` longtext DEFAULT NULL,
  `marks_awarded` decimal(5,2) DEFAULT NULL,
  `feedback` text DEFAULT NULL,
  `graded_by` bigint(20) unsigned DEFAULT NULL,
  `graded_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `assessment_answers_uuid_unique` (`uuid`),
  KEY `assessment_answers_question_id_foreign` (`question_id`),
  KEY `assessment_answers_selected_option_id_foreign` (`selected_option_id`),
  KEY `assessment_answers_graded_by_foreign` (`graded_by`),
  KEY `assessment_answers_attempt_id_question_id_index` (`attempt_id`,`question_id`),
  CONSTRAINT `assessment_answers_attempt_id_foreign` FOREIGN KEY (`attempt_id`) REFERENCES `assessment_attempts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `assessment_answers_graded_by_foreign` FOREIGN KEY (`graded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `assessment_answers_question_id_foreign` FOREIGN KEY (`question_id`) REFERENCES `assessment_questions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `assessment_answers_selected_option_id_foreign` FOREIGN KEY (`selected_option_id`) REFERENCES `assessment_options` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessment_answers`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `assessment_answers` WRITE;
/*!40000 ALTER TABLE `assessment_answers` DISABLE KEYS */;
INSERT INTO `assessment_answers` VALUES
(1,'8d098edf-acce-4cbe-841b-e5a4a2722652',1,1,2,NULL,NULL,25.00,NULL,NULL,NULL,'2026-09-07 17:59:10','2026-09-07 17:59:10'),
(2,'ba0a6bb9-9094-41ff-baa6-c8656361f79b',1,2,5,NULL,NULL,25.00,NULL,NULL,NULL,'2026-09-07 17:59:10','2026-09-07 17:59:10'),
(3,'414e5544-c3ec-4385-9737-c7b01f46d198',1,3,10,NULL,NULL,25.00,NULL,NULL,NULL,'2026-09-07 17:59:10','2026-09-07 17:59:10'),
(4,'a51fdac9-5df0-4879-a6c2-172d25781941',1,4,11,NULL,NULL,5.00,'Close, but OSPF default AD is 110.',NULL,NULL,'2026-09-07 17:59:10','2026-09-07 17:59:10');
/*!40000 ALTER TABLE `assessment_answers` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `assessment_attempts`
--

DROP TABLE IF EXISTS `assessment_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `assessment_attempts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `assessment_id` bigint(20) unsigned NOT NULL,
  `student_id` bigint(20) unsigned NOT NULL,
  `attempt_number` int(10) unsigned NOT NULL DEFAULT 1,
  `started_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `submitted_at` timestamp NULL DEFAULT NULL,
  `score` decimal(6,2) DEFAULT NULL,
  `percentage` decimal(5,2) DEFAULT NULL,
  `passed` tinyint(1) DEFAULT NULL,
  `status` enum('in_progress','submitted','graded','abandoned') NOT NULL DEFAULT 'in_progress',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_assess_student_attempt` (`assessment_id`,`student_id`,`attempt_number`),
  UNIQUE KEY `assessment_attempts_uuid_unique` (`uuid`),
  KEY `assessment_attempts_student_id_foreign` (`student_id`),
  CONSTRAINT `assessment_attempts_assessment_id_foreign` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `assessment_attempts_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessment_attempts`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `assessment_attempts` WRITE;
/*!40000 ALTER TABLE `assessment_attempts` DISABLE KEYS */;
INSERT INTO `assessment_attempts` VALUES
(1,'9729b96f-5c7a-4618-90e5-26b884ad2520',1,13,1,'2026-09-02 17:59:10','2026-09-02 18:17:10',80.00,80.00,1,'graded','2026-09-07 17:59:10','2026-09-07 17:59:10'),
(2,'ec7cd281-cb8a-451e-be5c-8baba3c64091',1,14,1,'2026-09-02 17:59:10','2026-09-02 18:14:10',90.00,90.00,1,'graded','2026-09-07 17:59:10','2026-09-07 17:59:10'),
(3,'ce1cfe18-2ba2-4b79-9706-98dc011a7c03',2,13,1,'2026-09-04 17:59:10','2026-09-04 18:44:10',75.00,75.00,1,'graded','2026-09-07 17:59:10','2026-09-07 17:59:10'),
(4,'b21c3268-be1a-4a1f-b083-79803b531900',2,14,1,'2026-09-04 17:59:10','2026-09-04 18:39:10',88.00,88.00,1,'graded','2026-09-07 17:59:10','2026-09-07 17:59:10'),
(5,'c813efa7-0134-437b-932e-7b25974d2811',4,13,1,'2026-09-06 17:59:10','2026-09-06 19:49:10',78.00,78.00,1,'graded','2026-09-07 17:59:10','2026-09-07 17:59:10'),
(6,'3e407e2b-34be-4e85-b470-5a8468c6374f',4,14,1,'2026-09-06 17:59:10','2026-09-06 19:34:10',92.00,92.00,1,'graded','2026-09-07 17:59:10','2026-09-07 17:59:10');
/*!40000 ALTER TABLE `assessment_attempts` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `assessment_options`
--

DROP TABLE IF EXISTS `assessment_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `assessment_options` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `question_id` bigint(20) unsigned NOT NULL,
  `option_text` text NOT NULL,
  `is_correct` tinyint(1) NOT NULL DEFAULT 0,
  `order` int(10) unsigned NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `assessment_options_uuid_unique` (`uuid`),
  KEY `assessment_options_question_id_index` (`question_id`),
  CONSTRAINT `assessment_options_question_id_foreign` FOREIGN KEY (`question_id`) REFERENCES `assessment_questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=495 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessment_options`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `assessment_options` WRITE;
/*!40000 ALTER TABLE `assessment_options` DISABLE KEYS */;
INSERT INTO `assessment_options` VALUES
(1,'78e72785-5fba-409d-97f2-fa6837d8cf6b',1,'Data Link Layer (Layer 2)',0,1,'2026-09-07 17:59:10','2026-09-07 17:59:10'),
(2,'eb12f321-d117-46cc-8d63-7386e550dd5e',1,'Network Layer (Layer 3)',1,2,'2026-09-07 17:59:10','2026-09-07 17:59:10'),
(3,'f3bdbe06-9491-4bf6-a1d7-5e3e9814cec3',1,'Transport Layer (Layer 4)',0,3,'2026-09-07 17:59:10','2026-09-07 17:59:10'),
(4,'c821df83-8f17-4fe5-aeda-307721f97896',1,'Session Layer (Layer 5)',0,4,'2026-09-07 17:59:10','2026-09-07 17:59:10'),
(5,'470ada69-5991-499e-8a53-93195c907055',2,'192.168.10.65 to 192.168.10.126',1,1,'2026-09-07 17:59:10','2026-09-07 17:59:10'),
(6,'5935220c-e9ca-4c1b-ae31-64934f5f1f94',2,'192.168.10.64 to 192.168.10.127',0,2,'2026-09-07 17:59:10','2026-09-07 17:59:10'),
(7,'c1eae335-6f34-4b0d-a67a-d159844da5a5',2,'192.168.10.65 to 192.168.10.127',0,3,'2026-09-07 17:59:10','2026-09-07 17:59:10'),
(8,'8e543b8e-34c1-42f6-b97a-e9d09ff08041',2,'192.168.10.1 to 192.168.10.62',0,4,'2026-09-07 17:59:10','2026-09-07 17:59:10'),
(9,'12c48ed1-fe05-4189-a776-5ba87515957e',3,'True',0,1,'2026-09-07 17:59:10','2026-09-07 17:59:10'),
(10,'f14f07d7-746c-4e63-88c8-cde37fcec917',3,'False',1,2,'2026-09-07 17:59:10','2026-09-07 17:59:10'),
(11,'b079e82f-ecb7-4cee-ab67-92fb460b1c8c',4,'90',0,1,'2026-09-07 17:59:10','2026-09-07 17:59:10'),
(12,'4f08c7e2-b7a0-406f-99a5-56d1a5cb7ed0',4,'110',1,2,'2026-09-07 17:59:10','2026-09-07 17:59:10'),
(13,'2e6fc076-d249-45db-94d5-07f0971484ba',4,'120',0,3,'2026-09-07 17:59:10','2026-09-07 17:59:10'),
(14,'3bd6d93b-7c39-4a10-9b9c-1f302a3dbfa1',4,'1',0,4,'2026-09-07 17:59:10','2026-09-07 17:59:10'),
(15,'d8ce5120-8dce-412f-b7de-73f0a5e60f3b',5,'An invitation to treat',0,1,'2026-09-16 06:43:41','2026-09-16 06:43:41'),
(16,'e42f1520-9e42-44cf-94e0-d615a1ef589e',5,'A definite promise to be bound on specific terms upon acceptance',1,2,'2026-09-16 06:43:41','2026-09-16 06:43:41'),
(17,'3d1d41ad-4520-40c8-95c6-3a46cb826c83',5,'A statement of intent without legal intention',0,3,'2026-09-16 06:43:41','2026-09-16 06:43:41'),
(18,'00fb93da-f974-4dbc-92df-b1d423879204',5,'A preliminary commercial inquiry',0,4,'2026-09-16 06:43:41','2026-09-16 06:43:41'),
(19,'06c36e8d-ed4e-47cc-9cb1-d33b8099b249',6,'A company and its shareholders are legally indistinguishable',0,1,'2026-09-16 06:43:41','2026-09-16 06:43:41'),
(20,'938e60d2-40a2-4cbd-8294-b25beb58f8eb',6,'A registered company is an independent legal person distinct from its subscribers',1,2,'2026-09-16 06:43:41','2026-09-16 06:43:41'),
(21,'a2595bba-0b4f-461d-9382-92e3908795f7',6,'Directors are strictly personally liable for ordinary trading debts',0,3,'2026-09-16 06:43:41','2026-09-16 06:43:41'),
(22,'b0e794fa-8e21-4df6-a1d3-142b4bacfa62',6,'One-person limited companies are prohibited under common law',0,4,'2026-09-16 06:43:41','2026-09-16 06:43:41'),
(23,'d4161e32-698f-4021-9409-5bf53535fa50',7,'Goods displayed on the shelf of a self-service store with prices attached',1,1,'2026-09-16 06:43:41','2026-09-16 06:43:41'),
(24,'8ed2e4c9-a785-41b5-bdab-f39d37b8f7a4',7,'A written formal tender acceptance',0,2,'2026-09-16 06:43:41','2026-09-16 06:43:41'),
(25,'307257e1-8d93-4e48-afe5-41ef53493840',7,'An unambiguous unilateral reward advertisement for finding a lost item',0,3,'2026-09-16 06:43:41','2026-09-16 06:43:41'),
(26,'4ec79de7-9e48-4166-a1b2-6be97d2bca18',7,'A firm quotation with clear intention to be bound immediately',0,4,'2026-09-16 06:43:41','2026-09-16 06:43:41'),
(27,'78f26539-5854-43d0-bf8e-a2ab36591813',8,'To penalize and punish the defaulting party for bad conduct',0,1,'2026-09-16 06:43:41','2026-09-16 06:43:41'),
(28,'db81f60a-c028-42e1-806a-3312c2d1ccb6',8,'To put the innocent party in the financial position they would have been in had the contract been performed',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(29,'cb022c97-c693-4fdd-984c-8bbf8562342d',8,'To disgorge all revenues collected across the business',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(30,'993defaf-54cd-4fe0-a3c2-59dce487e917',8,'To cancel all past valid contracts between both parties',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(31,'97e6fb7c-f304-474f-964a-ab6f67f7f08b',9,'Executory consideration',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(32,'73346d18-b528-4686-93fe-0fed23da6498',9,'Executed consideration',0,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(33,'fe8c8041-a3ba-40e6-82e6-c6c77282402a',9,'Past consideration',1,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(34,'9f6caf6c-3050-4c2c-8b67-c1f3167df973',9,'Adequate economic consideration',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(35,'218a0b5c-3916-4544-a61f-e33ab0a8fed6',10,'An invitation to treat',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(36,'024efd7d-4607-42fe-a974-007cbf0e1deb',10,'A definite promise to be bound on specific terms upon acceptance',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(37,'708964ca-5805-4ed4-901d-902312bb9454',10,'A statement of intent without legal intention',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(38,'7433ee69-2949-45de-8179-10bb44ad57e9',10,'A preliminary commercial inquiry',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(39,'08f80c40-dcdd-4162-8c15-c34b035dde8d',11,'A company and its shareholders are legally indistinguishable',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(40,'de66cc97-b679-416a-81ab-b451fab50fda',11,'A registered company is an independent legal person distinct from its subscribers',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(41,'b586de0b-ee6e-4218-99f1-fc6e1a5ae5e2',11,'Directors are strictly personally liable for ordinary trading debts',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(42,'11985b0c-5a2d-4d8d-8a57-6deb81fba1b7',11,'One-person limited companies are prohibited under common law',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(43,'c040e4a6-d81f-4267-908d-87e5e804da0e',12,'Goods displayed on the shelf of a self-service store with prices attached',1,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(44,'c188d6b0-c119-48a5-893a-9217fa1d3515',12,'A written formal tender acceptance',0,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(45,'e676fcee-f0be-4c4e-bcc3-f24663ffbb02',12,'An unambiguous unilateral reward advertisement for finding a lost item',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(46,'93428d12-f02a-4273-a92e-e70bf6a336e1',12,'A firm quotation with clear intention to be bound immediately',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(47,'2de0aa31-c0ec-4d78-b7f8-b08f48817a5f',13,'To penalize and punish the defaulting party for bad conduct',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(48,'61dfec17-0571-4816-b188-d7eabd33dfd4',13,'To put the innocent party in the financial position they would have been in had the contract been performed',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(49,'de1243fd-789a-4b3b-9d6a-cd7ddc06a0bd',13,'To disgorge all revenues collected across the business',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(50,'6ca6db4f-6029-409c-b982-43209e81188a',13,'To cancel all past valid contracts between both parties',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(51,'f13b860a-0eb4-4f2e-abac-eec2506a9be9',14,'Executory consideration',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(52,'06aa1e33-1d3f-4170-a496-b55bbe29a6ea',14,'Executed consideration',0,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(53,'f1c1c333-45da-43ca-ab4d-5ef291d58714',14,'Past consideration',1,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(54,'a4a565c8-07a7-4864-923a-1d366d5e9887',14,'Adequate economic consideration',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(55,'5e6c70de-fe3a-4530-82c1-e05eb142b4fc',15,'An invitation to treat',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(56,'a200aff8-2a47-4dc3-b0e6-f488eceec54c',15,'A definite promise to be bound on specific terms upon acceptance',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(57,'c5c8c1c2-c96a-4796-90f4-26ac089c875b',15,'A statement of intent without legal intention',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(58,'c65ae206-456c-4023-b1f8-883589ca0d8e',15,'A preliminary commercial inquiry',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(59,'8ac09654-9331-487f-9a00-3327ce353f63',16,'A company and its shareholders are legally indistinguishable',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(60,'e7bb385d-97f2-45c1-81a1-803936e27097',16,'A registered company is an independent legal person distinct from its subscribers',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(61,'82bb4972-ad55-4aee-8cb5-aede903256dc',16,'Directors are strictly personally liable for ordinary trading debts',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(62,'8158b355-4b4b-42b7-9f47-d5c9e1142a11',16,'One-person limited companies are prohibited under common law',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(63,'fa32cdce-1b17-47c2-b717-182a7c1a64e2',17,'Goods displayed on the shelf of a self-service store with prices attached',1,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(64,'c3b05706-67eb-400f-8d3a-6bbc44a36697',17,'A written formal tender acceptance',0,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(65,'ff8e8198-5e9e-4b7b-b083-e2a1d85e3f6d',17,'An unambiguous unilateral reward advertisement for finding a lost item',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(66,'fa139a48-f4fa-4d77-9679-3f4f99272c81',17,'A firm quotation with clear intention to be bound immediately',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(67,'1e7f3c83-288a-4102-a377-642b85aa2b93',18,'To penalize and punish the defaulting party for bad conduct',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(68,'cb71aca2-1c60-4c9a-8897-be53557148ac',18,'To put the innocent party in the financial position they would have been in had the contract been performed',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(69,'02000239-7197-4b76-9a59-fb708d1a6b58',18,'To disgorge all revenues collected across the business',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(70,'df71596f-a8d3-4ba4-9ecc-2a3ca02181fc',18,'To cancel all past valid contracts between both parties',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(71,'1cc610eb-e265-4a79-97fa-8e9de7763d02',19,'Executory consideration',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(72,'06c706a5-7d4e-4b8c-8c42-bd1b8797314c',19,'Executed consideration',0,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(73,'2bf0b1d4-25ee-4560-8620-0b6c584b0f6f',19,'Past consideration',1,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(74,'76196661-aee0-4055-ba83-cbbbc626d12d',19,'Adequate economic consideration',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(75,'384843e8-d811-4fbb-8a18-63beb9b6cc37',20,'An invitation to treat',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(76,'062f9dd1-d5cb-405c-a438-41b15b221eb2',20,'A definite promise to be bound on specific terms upon acceptance',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(77,'43250ce0-9beb-4fe3-a5d1-22d0d1247e44',20,'A statement of intent without legal intention',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(78,'6f1b8d0d-be41-47e9-994a-c8791b1403e6',20,'A preliminary commercial inquiry',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(79,'e892bcb2-c582-4d95-9ba0-e34fd8137b71',21,'A company and its shareholders are legally indistinguishable',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(80,'aeb932b1-a6e6-4d97-bb01-64182ab288f9',21,'A registered company is an independent legal person distinct from its subscribers',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(81,'677b8a06-717c-4a8e-939e-9f4f2aa0a3cb',21,'Directors are strictly personally liable for ordinary trading debts',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(82,'fa5d1c26-6817-4153-a898-1871454135c0',21,'One-person limited companies are prohibited under common law',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(83,'721d9e4d-9afe-4f9a-95e1-485f64b46842',22,'Goods displayed on the shelf of a self-service store with prices attached',1,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(84,'47ec727e-8bd0-4ac5-85b4-8c6241d4f82f',22,'A written formal tender acceptance',0,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(85,'28f23833-5942-4fca-959e-ed70431ce451',22,'An unambiguous unilateral reward advertisement for finding a lost item',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(86,'984e77b0-86ea-421a-9099-159966eb9380',22,'A firm quotation with clear intention to be bound immediately',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(87,'887a14f9-5636-4fec-93b3-2b928cd58e68',23,'To penalize and punish the defaulting party for bad conduct',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(88,'96c3bea8-f0f6-43cc-8a81-6fab0f37f2b0',23,'To put the innocent party in the financial position they would have been in had the contract been performed',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(89,'699eca54-3e35-4f23-868d-3fb036f73144',23,'To disgorge all revenues collected across the business',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(90,'5d10a86b-4408-41b4-86dc-9eef8c775a88',23,'To cancel all past valid contracts between both parties',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(91,'3f69e9a2-b173-4b48-bba6-20eb794a10a9',24,'Executory consideration',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(92,'14f0ea59-0d67-41f7-b010-fd1991691407',24,'Executed consideration',0,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(93,'d6957e49-bd22-4d4f-b509-666d258c4222',24,'Past consideration',1,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(94,'da5f7fd8-da12-46c2-8e26-9aae5f7273e1',24,'Adequate economic consideration',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(95,'20e92df1-25f0-47fa-8196-07a463cefe91',25,'Reimbursement of exact substantiated business travel expenses',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(96,'f6cad450-eb67-47ac-9547-8a5219d66a54',25,'Base salary, annual cash performance bonuses, and private vehicle perks',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(97,'7c30e5f3-398c-4640-b699-f218638a6918',25,'Exempt occupational pension scheme contributions made by the employer',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(98,'1f2a5495-109d-4375-b080-ff2854b636a5',25,'Free staff cafeteria meals provided to all employees equally',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(99,'192f3457-ed1a-4cd9-820a-cea0d3f298bb',26,'Staff occupational training and certifications',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(100,'e4661998-6a4f-4717-89b8-0849adcaa02d',26,'Client entertaining and lavish hospitality costs',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(101,'d4133c43-4261-40a1-ad45-365799c5f5cf',26,'Statutory audit and annual filing compliance costs',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(102,'9513e061-5bc6-45c7-8c9e-1bd16a15e475',26,'Office electricity and broadband utilities',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(103,'cfb25be4-c08e-447e-9ad8-0fd8b00e3ce3',27,'Output VAT is 0%, and the business CAN reclaim related input VAT',1,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(104,'74dda236-9ac3-428a-8537-337e640b5b8e',27,'Output VAT is 0%, and the business CANNOT reclaim related input VAT',0,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(105,'2631ce2a-e9d3-43b3-9861-c748f6b8e675',27,'The supply is treated outside the scope of VAT system entirely',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(106,'1837be2b-894a-4b4b-bf3e-eaebfcaf42a0',27,'Input VAT must be forfeited to the revenue authority',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(107,'b6ac8c90-dfa0-4570-bbf0-47e359ef140e',28,'Deducted directly from salary income in the current year',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(108,'01fd02a4-9c8c-4bfd-b2fd-257b135d6965',28,'Set against chargeable gains of the same year and carried forward against future capital gains',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(109,'605f91e5-0bf5-4478-b82e-bf0351f6944f',28,'Claimed as a cash refund immediately from the tax commissioner',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(110,'71c5537b-1678-4796-a9de-7162392f5fe0',28,'Written off permanently if not utilized within 30 days',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(111,'9df89241-9e59-4cc8-9509-0fb4aa7b472f',29,'Capital allowances pooling',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(112,'5500c767-b44d-4c97-a135-feefa3600b5a',29,'Arm\'s length transfer pricing regulations',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(113,'e78cba28-2e85-4b40-bdc0-475b71495993',29,'Pay-As-You-Earn (PAYE) deductions',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(114,'c9054dca-f383-492d-b65a-10db43c6a554',29,'Turnover stamp duties',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(115,'2e779697-c360-40cb-b390-616f559f9116',30,'Reimbursement of exact substantiated business travel expenses',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(116,'69c4feb0-6865-480e-9823-37c4313d4d66',30,'Base salary, annual cash performance bonuses, and private vehicle perks',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(117,'8f77c39c-09cf-426c-8b23-574e76895e1d',30,'Exempt occupational pension scheme contributions made by the employer',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(118,'824da715-091e-4006-99fe-07fd1fd4ee1e',30,'Free staff cafeteria meals provided to all employees equally',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(119,'e53f4d95-d318-438a-ab67-08ecb5e0451a',31,'Staff occupational training and certifications',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(120,'30f51bd6-3f3b-4cb0-a818-ccefc5d6f94c',31,'Client entertaining and lavish hospitality costs',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(121,'15ee0334-f115-4db1-a085-c90054f4f425',31,'Statutory audit and annual filing compliance costs',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(122,'4a73c146-fd90-4111-aadd-dfba715e2d07',31,'Office electricity and broadband utilities',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(123,'70dabb9f-24a5-4bb1-a9a3-602dfb6b6f4d',32,'Output VAT is 0%, and the business CAN reclaim related input VAT',1,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(124,'3db8f43b-f2db-4309-933c-122c12c3c413',32,'Output VAT is 0%, and the business CANNOT reclaim related input VAT',0,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(125,'def18ed0-894b-4d1e-aa63-3a1aca078682',32,'The supply is treated outside the scope of VAT system entirely',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(126,'f35b8944-bdf3-4c49-a619-388a5ba37dd3',32,'Input VAT must be forfeited to the revenue authority',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(127,'e3a229d5-e6f2-4c2d-baa2-154deee78ec8',33,'Deducted directly from salary income in the current year',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(128,'1bc4cea1-072c-4728-a461-1f3b1a41d0c1',33,'Set against chargeable gains of the same year and carried forward against future capital gains',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(129,'18ba177a-7c23-4f38-b1ed-d348a64cc2aa',33,'Claimed as a cash refund immediately from the tax commissioner',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(130,'b6ebc1c9-c381-4815-be6d-b9b747082876',33,'Written off permanently if not utilized within 30 days',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(131,'5a0a6388-f5cb-44fc-b3f3-42f94dc8cb1b',34,'Capital allowances pooling',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(132,'08255a2f-52af-4c7f-b13a-0630965d0a82',34,'Arm\'s length transfer pricing regulations',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(133,'743dbaa3-44d6-419b-9eb3-ef81288f13f6',34,'Pay-As-You-Earn (PAYE) deductions',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(134,'c6ecafd3-0053-4398-bf79-320c44690c34',34,'Turnover stamp duties',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(135,'700de3ed-deca-413a-94a4-86914af1a5a3',35,'Reimbursement of exact substantiated business travel expenses',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(136,'e1fab20a-9e67-49eb-a6ce-b56a06ea33f1',35,'Base salary, annual cash performance bonuses, and private vehicle perks',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(137,'82aceb31-8893-46d1-bc2c-9d8f2ac6a50f',35,'Exempt occupational pension scheme contributions made by the employer',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(138,'2f9fac45-e193-48e6-8f73-d3be848822c7',35,'Free staff cafeteria meals provided to all employees equally',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(139,'3ab6df36-8453-4d59-9c68-024bb07bb588',36,'Staff occupational training and certifications',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(140,'4a0cfb30-f299-492f-b94f-dd3ccfc72527',36,'Client entertaining and lavish hospitality costs',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(141,'2d4fc7c6-f682-4e96-b9d3-980dad5fcb80',36,'Statutory audit and annual filing compliance costs',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(142,'423e847a-edbd-4ba7-a2ac-ae259e0b0e40',36,'Office electricity and broadband utilities',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(143,'a0910edf-654e-40c3-98e4-02a9a807c4ee',37,'Output VAT is 0%, and the business CAN reclaim related input VAT',1,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(144,'b2405717-0fc0-42cd-aab3-254631a30366',37,'Output VAT is 0%, and the business CANNOT reclaim related input VAT',0,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(145,'abb6215f-4e22-4711-bd77-c2366f461aed',37,'The supply is treated outside the scope of VAT system entirely',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(146,'d4681065-d49a-4a73-a780-127e52e5dab6',37,'Input VAT must be forfeited to the revenue authority',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(147,'c87f97e7-1a8b-4171-b275-4dcbfb5b3119',38,'Deducted directly from salary income in the current year',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(148,'cbe60706-6cb1-4ae5-89e8-225c4ee9dd51',38,'Set against chargeable gains of the same year and carried forward against future capital gains',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(149,'2c6da266-bee9-4393-94eb-63b301715287',38,'Claimed as a cash refund immediately from the tax commissioner',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(150,'fe40e219-07d9-45b7-b7cf-4b75b00dec7b',38,'Written off permanently if not utilized within 30 days',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(151,'d18f8a49-7b35-4814-bac7-d6bc8cfa7ee4',39,'Capital allowances pooling',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(152,'9db2bae5-a688-408d-bc2e-41ed07cd9c72',39,'Arm\'s length transfer pricing regulations',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(153,'adc387c1-b8fd-475b-bfe6-1e0eda75a35d',39,'Pay-As-You-Earn (PAYE) deductions',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(154,'1dce5649-471e-4eb0-8292-c12acdd0e724',39,'Turnover stamp duties',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(155,'b6756327-de61-4855-93f6-92228b438a67',40,'Reimbursement of exact substantiated business travel expenses',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(156,'a9c7310d-a044-49c2-931d-c1454b408cff',40,'Base salary, annual cash performance bonuses, and private vehicle perks',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(157,'1ab58b56-f9d1-4f50-a636-3b2a9412f3fb',40,'Exempt occupational pension scheme contributions made by the employer',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(158,'56b59397-dab2-473f-a8be-e2837a36bdb0',40,'Free staff cafeteria meals provided to all employees equally',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(159,'b179713c-1b15-4168-ba66-2a6872fd5a0f',41,'Staff occupational training and certifications',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(160,'1d44d008-3a8a-40df-b489-8db4966691d3',41,'Client entertaining and lavish hospitality costs',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(161,'f004ea0f-43ce-4234-9a0f-664ad6783311',41,'Statutory audit and annual filing compliance costs',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(162,'56065a1f-4530-40c1-9dac-e820be0f3389',41,'Office electricity and broadband utilities',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(163,'9b010b9e-0835-4e94-9869-11dd96a74ef9',42,'Output VAT is 0%, and the business CAN reclaim related input VAT',1,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(164,'f18e628a-3fa0-4dc5-a2bf-a05f98acb4f6',42,'Output VAT is 0%, and the business CANNOT reclaim related input VAT',0,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(165,'11962545-3706-4f25-b259-4644b424015d',42,'The supply is treated outside the scope of VAT system entirely',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(166,'50f83344-2606-4fd5-a067-44d5e303c2e1',42,'Input VAT must be forfeited to the revenue authority',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(167,'500318fb-8752-420b-8390-8bdedfb3092f',43,'Deducted directly from salary income in the current year',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(168,'dab399af-b429-4558-b765-7f67dd10d522',43,'Set against chargeable gains of the same year and carried forward against future capital gains',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(169,'a6b10261-a189-4109-8902-6f786780569f',43,'Claimed as a cash refund immediately from the tax commissioner',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(170,'710ae271-aa82-4611-9011-0f41cbce62b6',43,'Written off permanently if not utilized within 30 days',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(171,'352070d8-9e9c-401a-b217-636916d43790',44,'Capital allowances pooling',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(172,'cedf83f5-b102-43b6-9ca4-ce451c1c2ce7',44,'Arm\'s length transfer pricing regulations',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(173,'77dad75e-e1a2-42e1-a684-0032d03756be',44,'Pay-As-You-Earn (PAYE) deductions',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(174,'ab1fabd6-c9c7-40f2-9f54-16598a1ace67',44,'Turnover stamp duties',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(175,'b9286f1f-047f-4819-921e-9d132ffee93f',45,'Comparability and Verifiability',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(176,'14d8abc2-6fa5-4b14-b06a-21bf62f98885',45,'Relevance and Faithful Representation',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(177,'2f3d65a2-b3e9-4ed7-9db5-16f37fab452b',45,'Prudence and Timeliness',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(178,'33cb640d-55e3-4f5e-b49a-53e5f5a9c063',45,'Understandability and Materiality',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(179,'fdf36261-8176-40bd-bb72-6762ac4f326d',46,'Simple payback period',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(180,'29984fbd-5bf9-4625-987b-4172dc5b7598',46,'Net Present Value (NPV)',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(181,'14e2769a-0ec5-441a-9cfa-f64eb5091851',46,'Accounting Rate of Return (ARR)',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(182,'38b32360-999a-43b8-b01a-e9998386aa64',46,'Gross profit margin',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(183,'64769471-6a6d-423c-baa6-3ee44827bdf8',47,'Site preparation and foundation costs',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(184,'9a5043c2-f1db-4232-b5e4-ede92347a6e3',47,'General administrative overheads and staff operating training costs',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(185,'4a33523f-79d9-43a8-9350-6d58da0fe23f',47,'Import duties and non-refundable purchase taxes',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(186,'5afe2b47-b0ea-47a8-bce1-15dfe0fbc966',47,'Initial professional installation fees',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(187,'8953e50c-7353-49a9-913e-2c025f8d6822',48,'The time between inventory purchase and cash realization from sales',1,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(188,'748d8e7e-36d4-4b73-be22-004a84a9824c',48,'The tenure of outstanding bank loans',0,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(189,'77b3e81b-ff48-4b51-84ba-2f2756b39d36',48,'The depreciation lifespan of non-current machinery',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(190,'7ebd093d-497b-4360-82a4-6f9864887dbf',48,'The time between annual shareholder meetings',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(191,'ccbc13f1-24ee-414d-80a5-8ed9586731cc',49,'The coupon interest rate on bank mortgages only',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(192,'f23403d1-d64c-40f0-a414-a2a652df06a3',49,'The average return required by equity and debt providers weighted by market values',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(193,'30494ce2-057c-415f-9b66-68af5bc18bdf',49,'The inflation rate plus central bank benchmark rate',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(194,'26a8f666-ca93-4bc1-8982-a2aba108ea48',49,'The dividend yield on preferred shares',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(195,'734b149a-9bc6-4e30-8978-ada7a7ac84d5',50,'Comparability and Verifiability',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(196,'a134ebd8-2081-4fd9-91a0-8275512389a5',50,'Relevance and Faithful Representation',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(197,'3cab5075-7167-4f3d-8111-4a12029a7f2e',50,'Prudence and Timeliness',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(198,'a66296a3-7732-400a-8989-54227659b651',50,'Understandability and Materiality',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(199,'e6912fed-a2be-4d52-9896-45694cae828f',51,'Simple payback period',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(200,'68667cdd-4ade-40c0-84c6-8856077d3df4',51,'Net Present Value (NPV)',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(201,'7bcfe119-c1de-4a22-8666-958905b1f8ce',51,'Accounting Rate of Return (ARR)',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(202,'6d86cc1d-6797-466d-b907-d3f908ab57f6',51,'Gross profit margin',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(203,'4e01222f-77d7-4611-807e-fbc16eb910d9',52,'Site preparation and foundation costs',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(204,'afd30d70-e0c3-44cd-8c60-23498ebc7b0b',52,'General administrative overheads and staff operating training costs',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(205,'faf3ed2c-55b8-401b-89f6-0ec3c970cb8e',52,'Import duties and non-refundable purchase taxes',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(206,'08a3a02d-91d8-4c1d-88e4-5615ad968724',52,'Initial professional installation fees',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(207,'d30957a9-77a9-47ef-9188-fe5e03e5302f',53,'The time between inventory purchase and cash realization from sales',1,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(208,'59825ba2-1109-4f10-aa9c-3a350bb99375',53,'The tenure of outstanding bank loans',0,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(209,'11963ec4-6089-418d-8108-bfebf6ee94dd',53,'The depreciation lifespan of non-current machinery',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(210,'8fdd2037-6ee9-4093-894e-73235f6d2bee',53,'The time between annual shareholder meetings',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(211,'a97f0821-4084-4e25-89bf-9ad2450c63e0',54,'The coupon interest rate on bank mortgages only',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(212,'5d44958c-78b9-4b41-9942-58186f8850c3',54,'The average return required by equity and debt providers weighted by market values',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(213,'0d80aa1e-ed56-4c88-bb9c-2902a10d6ebc',54,'The inflation rate plus central bank benchmark rate',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(214,'465014a2-a48f-42c9-bb83-fdba9aa4134c',54,'The dividend yield on preferred shares',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(215,'fc53eac9-bbf8-4e35-b7a9-fd05012e025c',55,'Comparability and Verifiability',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(216,'40b789d8-af12-45ac-9064-38e1af37f03e',55,'Relevance and Faithful Representation',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(217,'369ae4bc-4702-4190-a8de-59b1bf507aa3',55,'Prudence and Timeliness',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(218,'77591c69-b90a-44cc-98dc-0ed29274358b',55,'Understandability and Materiality',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(219,'d5f9fb57-a195-46e7-aa90-96080d617a89',56,'Simple payback period',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(220,'38f724fd-0bc4-4dff-9d6e-8e4de0c2fdb7',56,'Net Present Value (NPV)',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(221,'018fce61-d561-447a-9d90-0e663c640266',56,'Accounting Rate of Return (ARR)',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(222,'5c6ab5f2-f4d3-47c5-98a9-186c1b6dddb5',56,'Gross profit margin',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(223,'274d7b51-b567-47aa-b7b0-98eafd23ba5f',57,'Site preparation and foundation costs',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(224,'988d98f9-cf66-4d48-9f17-fac508c223f0',57,'General administrative overheads and staff operating training costs',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(225,'b744b3b8-ef30-4a8b-bb84-7c8187566b31',57,'Import duties and non-refundable purchase taxes',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(226,'96751ea0-59fb-4e81-9f94-4be2ae354732',57,'Initial professional installation fees',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(227,'ef083bb9-1626-4d4f-ade4-d0a15f81fc10',58,'The time between inventory purchase and cash realization from sales',1,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(228,'bbfc5e98-f1fc-4140-a217-626d89ce7745',58,'The tenure of outstanding bank loans',0,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(229,'7fa1691f-fcf5-4d67-b9d3-a780c714766d',58,'The depreciation lifespan of non-current machinery',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(230,'538c0bdd-8aeb-471d-aa4a-693b8415ebe4',58,'The time between annual shareholder meetings',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(231,'77686b92-c9fd-43fb-b01f-cb418cd921ff',59,'The coupon interest rate on bank mortgages only',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(232,'b69e851a-ec71-4225-8509-8ebcc405fec6',59,'The average return required by equity and debt providers weighted by market values',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(233,'07d1b7f6-4822-49a1-9157-e16c7c9e7723',59,'The inflation rate plus central bank benchmark rate',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(234,'87f58698-396c-46ba-853a-f93b27d86fd2',59,'The dividend yield on preferred shares',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(235,'c8a6718e-0041-47e7-ab80-5658903335a0',60,'Comparability and Verifiability',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(236,'2d76b39a-551e-452d-a9df-9c8d53d6dc79',60,'Relevance and Faithful Representation',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(237,'d71cd393-b11e-4482-896d-47c54b2f2daf',60,'Prudence and Timeliness',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(238,'dd5607f3-a5c8-4ec8-9bfe-762677e96319',60,'Understandability and Materiality',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(239,'07adb7a3-4c2d-46fd-b800-83430e10c711',61,'Simple payback period',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(240,'0d38a202-2295-4747-9c3e-c23c7ff1dc54',61,'Net Present Value (NPV)',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(241,'6008afd9-fb89-4977-a127-bc687c26c912',61,'Accounting Rate of Return (ARR)',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(242,'9d54c47b-e7f8-48a4-992a-fc5923719006',61,'Gross profit margin',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(243,'d5351106-1479-4791-afcd-e623a934a95a',62,'Site preparation and foundation costs',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(244,'3fd0b96c-2146-4d5c-88f9-23500f3b1167',62,'General administrative overheads and staff operating training costs',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(245,'a25332f8-e8bb-410b-b345-b76b14d6e293',62,'Import duties and non-refundable purchase taxes',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(246,'517a8a71-cd1f-48a0-85b1-2670738d1969',62,'Initial professional installation fees',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(247,'d931b950-b4ca-4d96-a9b7-ca98307e302a',63,'The time between inventory purchase and cash realization from sales',1,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(248,'61d07bf4-ce6e-4e72-9137-0c84e68a707c',63,'The tenure of outstanding bank loans',0,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(249,'d0a91e87-4618-4516-bdcd-7d918e77ad65',63,'The depreciation lifespan of non-current machinery',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(250,'eb1fc906-f429-43d9-a77a-a06be9ee7c63',63,'The time between annual shareholder meetings',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(251,'b9fa9ace-1763-4a1f-beea-5c409a4cd2c1',64,'The coupon interest rate on bank mortgages only',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(252,'87e76497-c805-4e1c-8b72-68706bd21817',64,'The average return required by equity and debt providers weighted by market values',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(253,'1c5f3214-d323-4951-bffc-285dd95cab50',64,'The inflation rate plus central bank benchmark rate',0,3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(254,'aee6a99f-94d2-4a63-8315-af7f20cbffbc',64,'The dividend yield on preferred shares',0,4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(255,'7e05dc30-0983-478c-9ea9-13e5afafae16',65,'Comparability and Verifiability',0,1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(256,'b533e9f3-5138-4e19-937a-a3c9b855d6d4',65,'Relevance and Faithful Representation',1,2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(257,'911482a0-0680-4595-8a3f-2753eb8fb617',65,'Prudence and Timeliness',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(258,'53cd57af-72d5-4309-a9d7-9c5ce3598e20',65,'Understandability and Materiality',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(259,'ba90e3ef-337e-4e46-bc39-c13983d8691f',66,'Simple payback period',0,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(260,'4ae7720a-77a6-4f4b-b37a-a648b3bccd0e',66,'Net Present Value (NPV)',1,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(261,'2e75b8bc-02d5-48ae-b5ea-d92a3f32e480',66,'Accounting Rate of Return (ARR)',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(262,'e2200efa-d5f8-4ee1-bb5e-b9ade18175d7',66,'Gross profit margin',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(263,'3df3ceb0-706d-4f21-aa5e-562f39438956',67,'Site preparation and foundation costs',0,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(264,'d24f25e5-7ca8-4ab7-a87d-eed34b21dd44',67,'General administrative overheads and staff operating training costs',1,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(265,'8a8bd650-6541-42ce-b4cb-57f60b42ef8f',67,'Import duties and non-refundable purchase taxes',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(266,'b87a4ff1-0b8b-499d-8e6a-7017a8c7af2e',67,'Initial professional installation fees',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(267,'dff8a74b-6ecf-491a-a3a3-1ea14ad4fac3',68,'The time between inventory purchase and cash realization from sales',1,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(268,'4ffaddaf-c243-4550-8f37-1d78730446e3',68,'The tenure of outstanding bank loans',0,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(269,'aab8d86b-2aeb-4063-8da7-adc5d69092f2',68,'The depreciation lifespan of non-current machinery',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(270,'eb785a2f-c987-457d-b01e-975ac6f4a7c1',68,'The time between annual shareholder meetings',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(271,'d3727477-dc92-410a-afe5-b9c9d11618cd',69,'The coupon interest rate on bank mortgages only',0,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(272,'3d6fc698-746a-46a1-b85e-8d5a1a391d90',69,'The average return required by equity and debt providers weighted by market values',1,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(273,'8b5abd87-b421-44e6-959e-b206c30561f6',69,'The inflation rate plus central bank benchmark rate',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(274,'c668b821-4aec-409b-9eef-db98d843d835',69,'The dividend yield on preferred shares',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(275,'3883eb1b-472d-4c4e-9d89-ef610cf810c7',70,'Comparability and Verifiability',0,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(276,'455b6f51-df7c-479a-af77-efb2de8c531c',70,'Relevance and Faithful Representation',1,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(277,'c09f7462-a567-48d3-8427-1eb0f7cadec8',70,'Prudence and Timeliness',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(278,'9e9a1e10-fb27-498c-a08c-118a7f554d8d',70,'Understandability and Materiality',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(279,'c20f2554-9132-47a6-9cc6-6b79fff86c49',71,'Simple payback period',0,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(280,'85044d48-57e0-4277-8ae5-d9502b575e20',71,'Net Present Value (NPV)',1,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(281,'01a7f3c7-e0a9-4cdd-a234-1b390cca6dfb',71,'Accounting Rate of Return (ARR)',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(282,'75111477-3c11-4825-8899-1a2b8c5507bc',71,'Gross profit margin',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(283,'aa24e538-6198-43ef-89b5-3fcda3903d9c',72,'Site preparation and foundation costs',0,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(284,'c61a8aea-b329-4fd1-98e1-00ad2bd0ef7b',72,'General administrative overheads and staff operating training costs',1,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(285,'db825671-3f1f-4047-9a27-f97774bd2dd6',72,'Import duties and non-refundable purchase taxes',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(286,'346d2af1-6c1c-4010-bc3c-0da960522ba2',72,'Initial professional installation fees',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(287,'26e426bc-d30d-43eb-9967-ea211faaf53a',73,'The time between inventory purchase and cash realization from sales',1,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(288,'e019fe64-39c9-47d6-9202-4b1164831f53',73,'The tenure of outstanding bank loans',0,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(289,'7b22ea3c-f635-4bd4-95a1-cbd6aef5fbd9',73,'The depreciation lifespan of non-current machinery',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(290,'892b20ee-a844-4c66-93f6-16905522842a',73,'The time between annual shareholder meetings',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(291,'26398d74-684c-4bc1-b0ad-ca89967f0b86',74,'The coupon interest rate on bank mortgages only',0,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(292,'dd8624b4-a5af-4b79-af90-3406698d6f5f',74,'The average return required by equity and debt providers weighted by market values',1,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(293,'ae616ac0-ddec-48fb-911d-f4e20fb332c7',74,'The inflation rate plus central bank benchmark rate',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(294,'f42e4636-816e-4d3d-ac65-9a271d0e8c21',74,'The dividend yield on preferred shares',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(295,'31b7b733-4d7b-4495-b490-8e73d0b095f7',75,'Comparability and Verifiability',0,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(296,'0e0fab3f-51b5-45fa-9eff-4666f8f4c0a3',75,'Relevance and Faithful Representation',1,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(297,'0a4e138e-47eb-402e-9e47-8fbaf4d58caa',75,'Prudence and Timeliness',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(298,'ff553cb2-4947-43c3-adfb-f5cd02ae67de',75,'Understandability and Materiality',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(299,'c975750f-45af-44a1-84ef-883bf9b6e5f6',76,'Simple payback period',0,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(300,'a4c68302-3317-4cef-9ef1-b541413c38dc',76,'Net Present Value (NPV)',1,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(301,'9266b541-478f-4564-a890-ee15ef826f09',76,'Accounting Rate of Return (ARR)',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(302,'8eb23944-1010-4963-bcc0-76ee8b568e3e',76,'Gross profit margin',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(303,'84c516d0-55a5-42ea-9019-aa0d882b2295',77,'Site preparation and foundation costs',0,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(304,'3e26d189-a989-4e3c-991f-72bfc5a617d1',77,'General administrative overheads and staff operating training costs',1,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(305,'941848b6-b433-4a9b-8949-f9ee6f344d49',77,'Import duties and non-refundable purchase taxes',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(306,'54ffdf74-d88e-4d1f-aa9b-7b2a1f36c7ce',77,'Initial professional installation fees',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(307,'08196272-fe17-454d-ad36-ef47de8f831f',78,'The time between inventory purchase and cash realization from sales',1,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(308,'76678d46-cc1b-4498-a604-0b775bf92361',78,'The tenure of outstanding bank loans',0,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(309,'da524949-dbe8-4750-820b-7828e7b07c67',78,'The depreciation lifespan of non-current machinery',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(310,'e5affeaf-cb73-4a76-9708-5d61529d1997',78,'The time between annual shareholder meetings',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(311,'2cfb0dd4-8596-420d-b55c-aff1b0a44086',79,'The coupon interest rate on bank mortgages only',0,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(312,'b293b48d-78dc-4fdf-acf7-794d397f1712',79,'The average return required by equity and debt providers weighted by market values',1,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(313,'38fbe889-76a8-481b-bf84-ed5ccddd293c',79,'The inflation rate plus central bank benchmark rate',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(314,'39391eea-729e-409b-8208-d75049f2800b',79,'The dividend yield on preferred shares',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(315,'f0a3ccfe-3f6a-42b1-a6cc-af909dd064d2',80,'Comparability and Verifiability',0,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(316,'d8b56741-514c-4ccc-9575-7fe61c7b77f3',80,'Relevance and Faithful Representation',1,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(317,'2ad026d7-0f7d-4c95-ad3e-9de8f114471e',80,'Prudence and Timeliness',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(318,'4907d609-44b2-4a9e-9199-83424963e883',80,'Understandability and Materiality',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(319,'1cbddab8-e9d5-4eaf-9285-a621cf21ed44',81,'Simple payback period',0,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(320,'fe2c0643-468e-4d66-a4a5-9dc92ed06c2b',81,'Net Present Value (NPV)',1,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(321,'1e153689-6ec9-4335-9c9f-2d07ee7f43e5',81,'Accounting Rate of Return (ARR)',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(322,'9312e9ab-485b-4298-8bfe-628cd8027efe',81,'Gross profit margin',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(323,'c658d3ec-43e3-4103-8d50-c5385b897e31',82,'Site preparation and foundation costs',0,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(324,'d98144dd-eedc-4757-afd6-d235b4f95c31',82,'General administrative overheads and staff operating training costs',1,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(325,'6180335d-244e-48de-9010-f19b4d3a80b4',82,'Import duties and non-refundable purchase taxes',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(326,'3924608d-11b3-433c-8c44-80facb246a01',82,'Initial professional installation fees',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(327,'109f6b0e-1318-4de7-8b81-e06c5c5aa011',83,'The time between inventory purchase and cash realization from sales',1,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(328,'7cbe8f3a-20a0-40f8-947c-02b5b2520ca8',83,'The tenure of outstanding bank loans',0,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(329,'da13f0a6-6b71-4833-864c-454704b07c47',83,'The depreciation lifespan of non-current machinery',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(330,'1abff963-9c78-4318-8e7f-87862c5928be',83,'The time between annual shareholder meetings',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(331,'5eec1095-8cc5-4839-bc7d-5bc3f48c90df',84,'The coupon interest rate on bank mortgages only',0,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(332,'586aec97-cc34-4832-8f5b-322987b052e2',84,'The average return required by equity and debt providers weighted by market values',1,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(333,'d50e4cb4-5835-424a-8f9b-1885d794c2e3',84,'The inflation rate plus central bank benchmark rate',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(334,'d5ee1314-ceae-44fc-9f11-7d47d2f23ec3',84,'The dividend yield on preferred shares',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(335,'aa51c75e-a7ee-4987-9345-08573500d12b',85,'Assets = Liabilities + Owner\'s Equity (Capital)',1,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(336,'a86c2c5a-7325-4638-99df-2e96b2f1af63',85,'Assets + Liabilities = Capital',0,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(337,'0310d255-7fdf-4eda-87d5-5c546d69772e',85,'Liabilities = Assets + Capital',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(338,'bd1d318d-2b77-4a05-86fb-101fee9163e6',85,'Capital = Current Assets - Profit',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(339,'f40e0fea-dd93-48d2-8f53-db775fda26ee',86,'Debit Accounts Payable, Credit Purchases',0,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(340,'e02c4644-f583-4510-b0c9-1886a52a93af',86,'Debit Purchases / Inventory, Credit Accounts Payable (Trade Creditors)',1,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(341,'ecb585d3-54c7-485d-99c4-94e675c4a655',86,'Debit Cash, Credit Accounts Payable',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(342,'2d3a9ac4-8a9c-4001-ad2e-bf51abc5d691',86,'Debit Sales, Credit Trade Receivables',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(343,'2b4fb5f1-c4e6-4c47-9e51-2284f5ebd73a',87,'An entire invoice transaction was completely omitted from daybooks',0,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(344,'e8bf32d0-8019-4464-8966-49d480503b8c',87,'A debit of $500 was correctly made to rent, but the corresponding credit entry was omitted entirely',1,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(345,'9843752e-190e-4366-b9a7-eb75f4eb5183',87,'A repair expense was debited to equipment asset account (error of principle)',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(346,'844b07d2-f075-4bbc-991f-62a444fd5506',87,'A sale to Customer A was posted to Customer B\'s ledger account (error of commission)',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(347,'4a02dfb2-ffb5-40e2-8452-416d1660fbc2',88,'Only when liquid cash is physically deposited into the bank',0,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(348,'006bd57b-1875-4137-9855-e39f48c47455',88,'In the accounting period in which they are earned or incurred, regardless of cash timing',1,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(349,'85ca17c3-2708-441b-87a3-e8d80909db7e',88,'Only at year-end when certified by the tax board',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(350,'f85ce6a2-49d8-4ebb-9628-b614edb015fe',88,'Whenever approved by board of directors',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(351,'6d6b0e3b-8496-4ee8-beb7-438359cdf5ae',89,'$56,000',1,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(352,'53457b39-0e2e-465f-b4e4-c9b096c562c0',89,'$64,000',0,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(353,'6ffe2385-213a-4a8d-a6f3-c56a863a5f2e',89,'$72,000',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(354,'2c47ed5d-1822-4d8e-a287-7cd358ae9921',89,'$48,000',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(355,'f8f31f1f-a40b-4264-a3e8-d8fd0a7a2391',90,'Assets = Liabilities + Owner\'s Equity (Capital)',1,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(356,'580e5050-4cda-48d6-97d9-a59f4264bfe3',90,'Assets + Liabilities = Capital',0,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(357,'6aca5526-34a6-44eb-9d97-6dd13a8c733d',90,'Liabilities = Assets + Capital',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(358,'5286bc86-ed83-478c-951e-50242a6efd28',90,'Capital = Current Assets - Profit',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(359,'526e20cc-c2eb-4059-972e-ff47b1a3e296',91,'Debit Accounts Payable, Credit Purchases',0,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(360,'e67bb583-a27a-4fa5-b8bc-9b82b689ed5a',91,'Debit Purchases / Inventory, Credit Accounts Payable (Trade Creditors)',1,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(361,'55853599-c27f-402f-9f4a-6b1882819795',91,'Debit Cash, Credit Accounts Payable',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(362,'36d3f3dd-370c-4283-9fe3-e9058d3ddbde',91,'Debit Sales, Credit Trade Receivables',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(363,'7910ab20-72e1-4ff2-87de-100d21804a76',92,'An entire invoice transaction was completely omitted from daybooks',0,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(364,'8c8c1b28-c1e5-48fd-baf8-68bfc2398fe6',92,'A debit of $500 was correctly made to rent, but the corresponding credit entry was omitted entirely',1,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(365,'66958a4f-70ac-4a2f-aa58-69af86335214',92,'A repair expense was debited to equipment asset account (error of principle)',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(366,'ed9f316b-1ef5-4342-8e27-a68a70f1dd37',92,'A sale to Customer A was posted to Customer B\'s ledger account (error of commission)',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(367,'dd90a86f-0051-4de9-a37c-ace0930878b4',93,'Only when liquid cash is physically deposited into the bank',0,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(368,'75b98247-776a-41fe-910d-858a710a4b40',93,'In the accounting period in which they are earned or incurred, regardless of cash timing',1,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(369,'fa613705-5d91-4845-a7ed-ff5a7c57beb1',93,'Only at year-end when certified by the tax board',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(370,'8ec4747d-afda-490a-9e20-bd0d1f955067',93,'Whenever approved by board of directors',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(371,'80a0fc3d-4893-4e68-9e4d-124d25d2f3dd',94,'$56,000',1,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(372,'58d4c3f7-f29f-41f1-8818-0f9879f51e08',94,'$64,000',0,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(373,'473c7727-6bbd-474a-8723-f93cbcc02162',94,'$72,000',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(374,'fcd1a34c-fbdc-49b3-8813-2be03cc42460',94,'$48,000',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(375,'03b31fed-6ac9-4007-a3ee-6ce1d81b48fa',95,'Assets = Liabilities + Owner\'s Equity (Capital)',1,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(376,'6da9ca10-f116-40b1-8f11-3a37768660dc',95,'Assets + Liabilities = Capital',0,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(377,'c5d96b37-7dd1-411c-8170-4098e7519e45',95,'Liabilities = Assets + Capital',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(378,'40e4ea7c-5da6-42ed-9e62-391275ea3a01',95,'Capital = Current Assets - Profit',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(379,'64889ef1-bf5e-49a4-acee-365f5097ccf7',96,'Debit Accounts Payable, Credit Purchases',0,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(380,'d0ff73c2-c2ba-49e6-a9f1-6efbd90f78f3',96,'Debit Purchases / Inventory, Credit Accounts Payable (Trade Creditors)',1,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(381,'9e9bc549-b46c-4b04-89f6-ab7abff09275',96,'Debit Cash, Credit Accounts Payable',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(382,'8cd54968-d761-439d-8bad-a5f6d24cfdfe',96,'Debit Sales, Credit Trade Receivables',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(383,'6888e23a-931f-4027-8ead-f25948dc51cb',97,'An entire invoice transaction was completely omitted from daybooks',0,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(384,'76e8df4b-9c7b-4da3-982a-4c9fb600c705',97,'A debit of $500 was correctly made to rent, but the corresponding credit entry was omitted entirely',1,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(385,'94c1acda-baf0-46da-b33b-9dbc28984016',97,'A repair expense was debited to equipment asset account (error of principle)',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(386,'e215b027-fa5c-4d01-901d-44889a35d46b',97,'A sale to Customer A was posted to Customer B\'s ledger account (error of commission)',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(387,'9a4fdce3-9263-4775-bec9-139bfaa4e1ad',98,'Only when liquid cash is physically deposited into the bank',0,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(388,'242656d5-5f1d-49bc-bbfc-3e1cc21f5222',98,'In the accounting period in which they are earned or incurred, regardless of cash timing',1,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(389,'11b05729-a4ea-498d-8669-ec551064690e',98,'Only at year-end when certified by the tax board',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(390,'69b1df07-6d90-444e-a46a-1bb8bd114511',98,'Whenever approved by board of directors',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(391,'8ce0aff1-59c0-4b94-ad22-fc4af353ffc1',99,'$56,000',1,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(392,'d754125c-3508-476e-a831-4ac8574fb72e',99,'$64,000',0,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(393,'eb9b8075-8722-4d0c-8c04-c3b9796954ef',99,'$72,000',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(394,'2cbcbb5b-6367-47d3-9238-5a4c4f88d93e',99,'$48,000',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(395,'c94c1b14-a717-4b9d-bb8f-5776bd26b19c',100,'Assets = Liabilities + Owner\'s Equity (Capital)',1,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(396,'e1f54173-2def-4f1b-9a6d-3ae3f7c2596b',100,'Assets + Liabilities = Capital',0,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(397,'9ef8f9bf-6cd2-4c67-a543-772e32812db9',100,'Liabilities = Assets + Capital',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(398,'92284c35-f081-44a8-ab79-ed6b90def0d0',100,'Capital = Current Assets - Profit',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(399,'d9bb3f91-b4b0-496d-a829-7fac21e52990',101,'Debit Accounts Payable, Credit Purchases',0,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(400,'70c17e03-b860-4bf9-8402-ccc726b5786d',101,'Debit Purchases / Inventory, Credit Accounts Payable (Trade Creditors)',1,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(401,'61d039e5-29de-4882-b9b6-72ae30c74bce',101,'Debit Cash, Credit Accounts Payable',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(402,'a43f25da-6972-4a75-a02b-957eea9d4adc',101,'Debit Sales, Credit Trade Receivables',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(403,'1d438e5b-711c-4d03-9aa0-0504589f2070',102,'An entire invoice transaction was completely omitted from daybooks',0,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(404,'e0bccb0c-c14c-44e6-871e-31ff4bdd871b',102,'A debit of $500 was correctly made to rent, but the corresponding credit entry was omitted entirely',1,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(405,'7c4ed333-887c-45b8-b0a7-7040fb9893cc',102,'A repair expense was debited to equipment asset account (error of principle)',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(406,'736698ca-172a-4146-baf5-ea1639d51e74',102,'A sale to Customer A was posted to Customer B\'s ledger account (error of commission)',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(407,'900c3ca1-2256-46da-88bd-261a4e4c16fe',103,'Only when liquid cash is physically deposited into the bank',0,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(408,'1b1ef6f0-c144-46e3-8b3f-14124e79a198',103,'In the accounting period in which they are earned or incurred, regardless of cash timing',1,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(409,'fec25726-acf5-4233-bb86-298e5bfd45e6',103,'Only at year-end when certified by the tax board',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(410,'990a28d4-a72c-4055-a8b2-d320ee3680b0',103,'Whenever approved by board of directors',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(411,'5f8d1f84-78e5-4f27-92b6-f8b6e4af959a',104,'$56,000',1,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(412,'78f4813a-bb7f-4a33-b33c-85e2ba2142ad',104,'$64,000',0,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(413,'cdd1a54f-45cb-419c-8a95-086aab74beaa',104,'$72,000',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(414,'d45e9f05-4c33-4415-9f90-ee7ff7117024',104,'$48,000',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(415,'a55c5830-acb4-405c-82b5-88e425d5c66b',105,'Assets = Liabilities + Owner\'s Equity (Capital)',1,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(416,'e7b0d242-7504-4bc9-8570-9cbfb44679ea',105,'Assets + Liabilities = Capital',0,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(417,'8ef3ffa3-1642-4e70-bbe2-7c8e09f82fb4',105,'Liabilities = Assets + Capital',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(418,'a51400d0-9b80-4104-921e-b19c7aefbecd',105,'Capital = Current Assets - Profit',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(419,'37e836f0-1e07-4bf9-a059-8a2824f018bb',106,'Debit Accounts Payable, Credit Purchases',0,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(420,'495fa13c-2d4f-45e7-9d69-2199ddf71b1a',106,'Debit Purchases / Inventory, Credit Accounts Payable (Trade Creditors)',1,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(421,'0b586752-947c-41f2-be4b-6f5b501ebf83',106,'Debit Cash, Credit Accounts Payable',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(422,'1a0bcae3-1557-4632-ae5e-89a2e30365bd',106,'Debit Sales, Credit Trade Receivables',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(423,'a1dc78ee-e468-4fae-8015-c92bc985ebb9',107,'An entire invoice transaction was completely omitted from daybooks',0,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(424,'c86e86ba-699b-4cdf-97d0-153b7dd0ad62',107,'A debit of $500 was correctly made to rent, but the corresponding credit entry was omitted entirely',1,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(425,'6c605747-366b-4469-bd99-e599abcd31a6',107,'A repair expense was debited to equipment asset account (error of principle)',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(426,'f059c74d-5fba-4ccc-a680-3dd45d99c575',107,'A sale to Customer A was posted to Customer B\'s ledger account (error of commission)',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(427,'9c41914a-69c1-4c72-b594-2e72d0dc6385',108,'Only when liquid cash is physically deposited into the bank',0,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(428,'523f5c67-4e69-4da8-961b-203691aa6dcb',108,'In the accounting period in which they are earned or incurred, regardless of cash timing',1,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(429,'55573e80-4e5c-486c-8199-e06ed6e84929',108,'Only at year-end when certified by the tax board',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(430,'4fb15aee-e570-4ef1-abfd-de66af9ddfd6',108,'Whenever approved by board of directors',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(431,'f09af52f-8b4a-4fc1-bb18-5e71b5b28f4d',109,'$56,000',1,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(432,'87da97a0-de89-4bfd-b6c4-bcfa1735ae4e',109,'$64,000',0,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(433,'6d233f9d-c5f6-4df8-9b58-37218e90edd6',109,'$72,000',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(434,'32150c84-a3a4-4e69-a2b4-4c0c55f79567',109,'$48,000',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(435,'cb671b75-16f1-4288-bc86-3276155de77d',110,'Assets = Liabilities + Owner\'s Equity (Capital)',1,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(436,'8c262e5e-fe64-4e9d-a88d-8f113192f51c',110,'Assets + Liabilities = Capital',0,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(437,'979d8006-3a50-457e-affe-0491d9490a00',110,'Liabilities = Assets + Capital',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(438,'4d6c52b8-412f-444c-ad18-d3ec9a4840a1',110,'Capital = Current Assets - Profit',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(439,'bc56fa6b-bfc7-4c12-a5b6-bbb86f4739f4',111,'Debit Accounts Payable, Credit Purchases',0,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(440,'1b49f124-2e76-43b3-bf70-075a3878479d',111,'Debit Purchases / Inventory, Credit Accounts Payable (Trade Creditors)',1,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(441,'fce6a9f2-628e-4293-95e6-9ec37bc12964',111,'Debit Cash, Credit Accounts Payable',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(442,'267ce0bd-b202-43d1-bb99-eb34f465efb4',111,'Debit Sales, Credit Trade Receivables',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(443,'a395bbee-6c45-49db-8e49-44a359c76771',112,'An entire invoice transaction was completely omitted from daybooks',0,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(444,'88247c8c-0bc0-4093-b003-fd466c861f3c',112,'A debit of $500 was correctly made to rent, but the corresponding credit entry was omitted entirely',1,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(445,'2ad44902-5984-4f15-9a8b-19b2d83e0a16',112,'A repair expense was debited to equipment asset account (error of principle)',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(446,'ff240ed8-ee17-4b50-8127-80419de586be',112,'A sale to Customer A was posted to Customer B\'s ledger account (error of commission)',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(447,'75b80bbe-64d0-427d-a7b0-36be182ef9f5',113,'Only when liquid cash is physically deposited into the bank',0,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(448,'beab3286-7658-4b54-b5b2-b3f923a370ce',113,'In the accounting period in which they are earned or incurred, regardless of cash timing',1,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(449,'a82f75f0-4864-4965-b234-dbbedf015058',113,'Only at year-end when certified by the tax board',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(450,'ab1a6946-c077-4374-a6ac-94f8a7771269',113,'Whenever approved by board of directors',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(451,'0de5a6c7-8f08-411d-ac70-dc973c4e745b',114,'$56,000',1,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(452,'a522cde4-da77-44e0-a2f6-03a5e308545c',114,'$64,000',0,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(453,'4d8f9a9a-d6fa-4bd9-aa28-5c53997397c7',114,'$72,000',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(454,'ea75270a-1d66-4408-bed3-365a393cefc8',114,'$48,000',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(455,'f683a6ce-e022-4975-946d-320c4702550d',115,'Assets = Liabilities + Owner\'s Equity (Capital)',1,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(456,'53ddbb2f-e394-432c-9f8c-49dfffb1dbd3',115,'Assets + Liabilities = Capital',0,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(457,'c1d6b862-c7ac-41cc-b682-9f8012481fa1',115,'Liabilities = Assets + Capital',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(458,'99bd55ca-e95b-4599-af35-bfb600d8ce44',115,'Capital = Current Assets - Profit',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(459,'d0503d31-910e-4541-89c6-422029206762',116,'Debit Accounts Payable, Credit Purchases',0,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(460,'525de4f8-2816-4f75-a467-dbb9533e1ab9',116,'Debit Purchases / Inventory, Credit Accounts Payable (Trade Creditors)',1,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(461,'ee8af742-f42a-4bbf-bf89-d018be713e2f',116,'Debit Cash, Credit Accounts Payable',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(462,'057d3dc9-bbc2-46ed-a3ac-e5612e48aba0',116,'Debit Sales, Credit Trade Receivables',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(463,'737b7264-2e36-4e2e-9bf9-099c7f51fdcd',117,'An entire invoice transaction was completely omitted from daybooks',0,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(464,'34747c52-f4b5-44a2-9974-b99884c01fe1',117,'A debit of $500 was correctly made to rent, but the corresponding credit entry was omitted entirely',1,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(465,'39372afb-58e9-4b75-a376-e2aac5d7b535',117,'A repair expense was debited to equipment asset account (error of principle)',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(466,'a71c4cce-73e3-4024-9040-281f4447603e',117,'A sale to Customer A was posted to Customer B\'s ledger account (error of commission)',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(467,'078aa9ff-a0f9-4929-a199-d0247cbc89ef',118,'Only when liquid cash is physically deposited into the bank',0,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(468,'842a0c4d-984e-437b-aca7-f6273568e9df',118,'In the accounting period in which they are earned or incurred, regardless of cash timing',1,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(469,'08ad1511-037c-4707-a8a5-d47c6e57b553',118,'Only at year-end when certified by the tax board',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(470,'a4701a08-540c-4ec0-820e-587e27979da7',118,'Whenever approved by board of directors',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(471,'2a7a30f4-5cde-4ced-8b01-0148adc53957',119,'$56,000',1,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(472,'e4f66837-73db-49ef-a9ab-99c660935ff7',119,'$64,000',0,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(473,'31c9b2f5-3f7e-4b7c-8c1a-a7b48ddfbd2a',119,'$72,000',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(474,'b4959840-7050-4429-9405-68c23993929e',119,'$48,000',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(475,'e7d6a77d-edce-43c4-a706-5f91ccf66f4f',120,'Assets = Liabilities + Owner\'s Equity (Capital)',1,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(476,'8af9d34a-f63e-453e-89dd-f949b3e4043b',120,'Assets + Liabilities = Capital',0,2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(477,'39081641-fb03-454b-b8a8-08803b43761b',120,'Liabilities = Assets + Capital',0,3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(478,'976d5a14-5faa-4dc2-8e2d-5ebe9ef57f2e',120,'Capital = Current Assets - Profit',0,4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(479,'3a0b1d90-cf8b-41b6-a497-702795f1c11b',121,'Debit Accounts Payable, Credit Purchases',0,1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(480,'a070b151-9d2b-439e-ac9f-4ea92bc84097',121,'Debit Purchases / Inventory, Credit Accounts Payable (Trade Creditors)',1,2,'2026-09-16 06:43:44','2026-09-16 06:43:44'),
(481,'5ce9479c-9aa5-4f99-80da-72f07b3cc1c1',121,'Debit Cash, Credit Accounts Payable',0,3,'2026-09-16 06:43:44','2026-09-16 06:43:44'),
(482,'93346430-4914-4192-aa7f-ebd6ca45c7d0',121,'Debit Sales, Credit Trade Receivables',0,4,'2026-09-16 06:43:44','2026-09-16 06:43:44'),
(483,'cb8ff190-ea3f-41ce-9ada-2d16bbb7034a',122,'An entire invoice transaction was completely omitted from daybooks',0,1,'2026-09-16 06:43:44','2026-09-16 06:43:44'),
(484,'ea9d838d-644e-4afa-914a-4b662d8a9165',122,'A debit of $500 was correctly made to rent, but the corresponding credit entry was omitted entirely',1,2,'2026-09-16 06:43:44','2026-09-16 06:43:44'),
(485,'be1cd548-954f-49a6-822a-84f0ad4243f8',122,'A repair expense was debited to equipment asset account (error of principle)',0,3,'2026-09-16 06:43:44','2026-09-16 06:43:44'),
(486,'24407678-ea64-477d-9e83-c31b02ef3b2a',122,'A sale to Customer A was posted to Customer B\'s ledger account (error of commission)',0,4,'2026-09-16 06:43:44','2026-09-16 06:43:44'),
(487,'545abf10-c412-465c-8a39-a474b06920f3',123,'Only when liquid cash is physically deposited into the bank',0,1,'2026-09-16 06:43:44','2026-09-16 06:43:44'),
(488,'ab3f798e-3955-466e-8efb-81f05bc6b92e',123,'In the accounting period in which they are earned or incurred, regardless of cash timing',1,2,'2026-09-16 06:43:44','2026-09-16 06:43:44'),
(489,'09e09aaa-9bdb-4de0-823f-30430cb32721',123,'Only at year-end when certified by the tax board',0,3,'2026-09-16 06:43:44','2026-09-16 06:43:44'),
(490,'c22bf3ab-daee-4bd6-9031-3d9239f37da0',123,'Whenever approved by board of directors',0,4,'2026-09-16 06:43:44','2026-09-16 06:43:44'),
(491,'e4d1941a-07ef-4807-b339-315046f1ce00',124,'$56,000',1,1,'2026-09-16 06:43:44','2026-09-16 06:43:44'),
(492,'25c16a1d-e162-4201-b3b2-f1f8035a03a7',124,'$64,000',0,2,'2026-09-16 06:43:44','2026-09-16 06:43:44'),
(493,'0919ad5c-fe4f-47a9-b6a4-e2f64f2e9543',124,'$72,000',0,3,'2026-09-16 06:43:44','2026-09-16 06:43:44'),
(494,'f69f5e77-905d-4c92-9dcb-b6f7e6d84fb8',124,'$48,000',0,4,'2026-09-16 06:43:44','2026-09-16 06:43:44');
/*!40000 ALTER TABLE `assessment_options` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `assessment_questions`
--

DROP TABLE IF EXISTS `assessment_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `assessment_questions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `assessment_id` bigint(20) unsigned NOT NULL,
  `question_text` longtext NOT NULL,
  `question_type` enum('Multiple Choice','Multiple Select','True/False','Short Answer','Essay','Practical/Manual Grading') NOT NULL DEFAULT 'Multiple Choice',
  `marks` decimal(5,2) NOT NULL DEFAULT 1.00,
  `explanation` text DEFAULT NULL,
  `difficulty` enum('Easy','Medium','Hard') NOT NULL DEFAULT 'Medium',
  `order` int(10) unsigned NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `assessment_questions_uuid_unique` (`uuid`),
  KEY `assessment_questions_assessment_id_order_index` (`assessment_id`,`order`),
  CONSTRAINT `assessment_questions_assessment_id_foreign` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=125 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessment_questions`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `assessment_questions` WRITE;
/*!40000 ALTER TABLE `assessment_questions` DISABLE KEYS */;
INSERT INTO `assessment_questions` VALUES
(1,'fec9603a-54c1-4e03-aa5d-9a1c2583ea4e',1,'Which OSI model layer is responsible for logical IP addressing and best path determination?','Multiple Choice',25.00,'The Network Layer (Layer 3) handles logical addressing (IPv4/IPv6) and routing.','Easy',1,'2026-09-07 17:59:10','2026-09-07 17:59:10'),
(2,'56a85180-b22b-4af0-8df1-959b28260f16',1,'What is the usable host range for the subnet 192.168.10.64/26?','Multiple Choice',25.00,'With /26, block size is 64. Subnet: 192.168.10.64, First usable: .65, Last usable: .126, Broadcast: .127.','Medium',2,'2026-09-07 17:59:10','2026-09-07 17:59:10'),
(3,'c63f18b2-cdfb-42fc-9759-2cad0f6b798a',1,'UDP (User Datagram Protocol) provides guaranteed delivery via 3-way handshakes and sequence numbers.','True/False',25.00,'False. TCP provides connection-oriented reliable delivery; UDP is connectionless and best-effort.','Easy',3,'2026-09-07 17:59:10','2026-09-07 17:59:10'),
(4,'9fa14f3e-35dc-4cc5-ba04-6105250700e8',1,'What is the default administrative distance of an internal OSPF route in Cisco IOS?','Multiple Choice',25.00,'The default administrative distance for OSPF is 110.','Medium',4,'2026-09-07 17:59:10','2026-09-07 17:59:10'),
(5,'20eeb93d-8e79-4725-8814-8019aa58f07c',5,'Under contract law, which of the following statements best describes an \'offer\'?','Multiple Choice',20.00,'An offer is an expression of willingness to contract on specified terms, made with the intention that it is to become binding once accepted.','Medium',1,'2026-09-16 06:43:41','2026-09-16 06:43:41'),
(6,'3f53b7e3-1939-45c5-af3a-bbfe543ea748',5,'In company law, what is the primary legal consequence of the landmark case Salomon v Salomon & Co Ltd (1897)?','Multiple Choice',20.00,'Salomon established the doctrine of separate corporate personality, meaning a company exists as a distinct legal entity independent of its members.','Medium',2,'2026-09-16 06:43:41','2026-09-16 06:43:41'),
(7,'902a185b-f2b2-4602-8ec9-ab22bfeb3841',5,'Which of the following is an example of an \'invitation to treat\' rather than an offer?','Multiple Choice',20.00,'Pharmaceutical Society of Great Britain v Boots Cash Chemists established that goods displayed on shop shelves with price tags are invitations to treat.','Medium',3,'2026-09-16 06:43:41','2026-09-16 06:43:41'),
(8,'6b39221f-ef8c-4e47-bf23-168c8eac4a7f',5,'What is the primary objective of compensatory damages awarded for breach of contract?','Multiple Choice',20.00,'Under Robinson v Harman, damages aim to put the innocent party into the position they would have been in had the contract been performed properly.','Medium',4,'2026-09-16 06:43:41','2026-09-16 06:43:41'),
(9,'60cda707-3621-4e88-91ca-273a5171263e',5,'Which form of consideration is generally NOT recognized as valid consideration under English contract law?','Multiple Choice',20.00,'Past consideration is no consideration (Roscorla v Thomas) because the act was performed before the promise was made.','Medium',5,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(10,'3ae08d3a-6dca-4bef-a527-d831fd0fac8c',6,'Under contract law, which of the following statements best describes an \'offer\'?','Multiple Choice',20.00,'An offer is an expression of willingness to contract on specified terms, made with the intention that it is to become binding once accepted.','Medium',1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(11,'92f35930-d702-495b-aec7-7343bde52da4',6,'In company law, what is the primary legal consequence of the landmark case Salomon v Salomon & Co Ltd (1897)?','Multiple Choice',20.00,'Salomon established the doctrine of separate corporate personality, meaning a company exists as a distinct legal entity independent of its members.','Medium',2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(12,'138ad138-5559-4b99-b81e-e6ed986f82c5',6,'Which of the following is an example of an \'invitation to treat\' rather than an offer?','Multiple Choice',20.00,'Pharmaceutical Society of Great Britain v Boots Cash Chemists established that goods displayed on shop shelves with price tags are invitations to treat.','Medium',3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(13,'7fc36f9e-557f-4945-ae15-2f757b3b8e4f',6,'What is the primary objective of compensatory damages awarded for breach of contract?','Multiple Choice',20.00,'Under Robinson v Harman, damages aim to put the innocent party into the position they would have been in had the contract been performed properly.','Medium',4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(14,'5da39d9d-c322-480c-bbd7-d3d9a0f3a641',6,'Which form of consideration is generally NOT recognized as valid consideration under English contract law?','Multiple Choice',20.00,'Past consideration is no consideration (Roscorla v Thomas) because the act was performed before the promise was made.','Medium',5,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(15,'d97e600e-abe9-4b0e-a4d5-25ce2249a2bc',7,'Under contract law, which of the following statements best describes an \'offer\'?','Multiple Choice',20.00,'An offer is an expression of willingness to contract on specified terms, made with the intention that it is to become binding once accepted.','Medium',1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(16,'dde90c14-7a92-4265-9b18-d4ccb555ae90',7,'In company law, what is the primary legal consequence of the landmark case Salomon v Salomon & Co Ltd (1897)?','Multiple Choice',20.00,'Salomon established the doctrine of separate corporate personality, meaning a company exists as a distinct legal entity independent of its members.','Medium',2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(17,'53882e84-d071-4b23-9e8e-5994e13897f0',7,'Which of the following is an example of an \'invitation to treat\' rather than an offer?','Multiple Choice',20.00,'Pharmaceutical Society of Great Britain v Boots Cash Chemists established that goods displayed on shop shelves with price tags are invitations to treat.','Medium',3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(18,'f7f43e20-ac08-4115-9554-4211bd5badec',7,'What is the primary objective of compensatory damages awarded for breach of contract?','Multiple Choice',20.00,'Under Robinson v Harman, damages aim to put the innocent party into the position they would have been in had the contract been performed properly.','Medium',4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(19,'e16a252a-1b3e-4967-85f5-c2e9bdc3629e',7,'Which form of consideration is generally NOT recognized as valid consideration under English contract law?','Multiple Choice',20.00,'Past consideration is no consideration (Roscorla v Thomas) because the act was performed before the promise was made.','Medium',5,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(20,'f2d9d8ef-9f99-45a1-941e-dc85a52dc8da',8,'Under contract law, which of the following statements best describes an \'offer\'?','Multiple Choice',20.00,'An offer is an expression of willingness to contract on specified terms, made with the intention that it is to become binding once accepted.','Medium',1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(21,'5d442474-7d55-4e95-b17a-a4c58c4aa242',8,'In company law, what is the primary legal consequence of the landmark case Salomon v Salomon & Co Ltd (1897)?','Multiple Choice',20.00,'Salomon established the doctrine of separate corporate personality, meaning a company exists as a distinct legal entity independent of its members.','Medium',2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(22,'44529d6c-0ff6-4d8f-a82e-19d616cc3a91',8,'Which of the following is an example of an \'invitation to treat\' rather than an offer?','Multiple Choice',20.00,'Pharmaceutical Society of Great Britain v Boots Cash Chemists established that goods displayed on shop shelves with price tags are invitations to treat.','Medium',3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(23,'4f5c22f5-6d82-4b7f-a61d-0d1f784bf12b',8,'What is the primary objective of compensatory damages awarded for breach of contract?','Multiple Choice',20.00,'Under Robinson v Harman, damages aim to put the innocent party into the position they would have been in had the contract been performed properly.','Medium',4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(24,'33137cb0-690b-4fbe-8ddc-a69470b5ce56',8,'Which form of consideration is generally NOT recognized as valid consideration under English contract law?','Multiple Choice',20.00,'Past consideration is no consideration (Roscorla v Thomas) because the act was performed before the promise was made.','Medium',5,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(25,'763564a7-5714-4ca5-8513-c145bda54a8f',9,'Under standard income tax principles, which of the following is treated as taxable employment income?','Multiple Choice',20.00,'Employment income includes contractual salary, cash bonuses, and taxable benefits-in-kind such as private fuel or company cars.','Medium',1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(26,'35c3fcb9-4a91-40f7-ab04-8c5b5f31459a',9,'When calculating corporation tax on trading profits, which expenditure is generally disallowable?','Multiple Choice',20.00,'Business and client entertainment expenditure is disallowable for corporate tax purposes.','Medium',2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(27,'164c63cd-7703-4c3d-9004-1a889f9da4c5',9,'What is the standard VAT treatment of zero-rated supplies?','Multiple Choice',20.00,'Zero-rated supplies attract 0% output tax, but allow the registered trader to fully reclaim input tax suffered on related purchases.','Medium',3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(28,'949c2f8f-a6c9-4be2-b9e2-c9f22d72969d',9,'For Capital Gains Tax (CGT), how are net allowable capital losses in a tax year treated?','Multiple Choice',20.00,'Capital losses are first offset against chargeable gains of the same tax year, with remaining unused losses carried forward indefinitely.','Medium',4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(29,'540a12b4-1732-4ef0-be50-9cfa048f1a79',9,'Which tax concept prevents multinational corporations from transferring profits to low-tax jurisdictions using artificial pricing?','Multiple Choice',20.00,'Transfer pricing rules require transactions between connected parties to take place on an arm\'s length basis.','Medium',5,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(30,'8920200a-fb8e-459d-b216-1fc85efee8b7',10,'Under standard income tax principles, which of the following is treated as taxable employment income?','Multiple Choice',20.00,'Employment income includes contractual salary, cash bonuses, and taxable benefits-in-kind such as private fuel or company cars.','Medium',1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(31,'9165b2c8-5c37-4991-b329-0948e7cb483a',10,'When calculating corporation tax on trading profits, which expenditure is generally disallowable?','Multiple Choice',20.00,'Business and client entertainment expenditure is disallowable for corporate tax purposes.','Medium',2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(32,'5d874555-9913-4fa6-a2f2-ef97599abdaa',10,'What is the standard VAT treatment of zero-rated supplies?','Multiple Choice',20.00,'Zero-rated supplies attract 0% output tax, but allow the registered trader to fully reclaim input tax suffered on related purchases.','Medium',3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(33,'7777bf5c-fc84-4262-ae45-09baa5cbbdff',10,'For Capital Gains Tax (CGT), how are net allowable capital losses in a tax year treated?','Multiple Choice',20.00,'Capital losses are first offset against chargeable gains of the same tax year, with remaining unused losses carried forward indefinitely.','Medium',4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(34,'ee22098b-ba21-4aa5-9d61-a3a44492e42c',10,'Which tax concept prevents multinational corporations from transferring profits to low-tax jurisdictions using artificial pricing?','Multiple Choice',20.00,'Transfer pricing rules require transactions between connected parties to take place on an arm\'s length basis.','Medium',5,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(35,'5f7c146a-e7eb-40d8-b251-8be005ec2c91',11,'Under standard income tax principles, which of the following is treated as taxable employment income?','Multiple Choice',20.00,'Employment income includes contractual salary, cash bonuses, and taxable benefits-in-kind such as private fuel or company cars.','Medium',1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(36,'6c1cfac8-e38f-46e3-9998-8e5e546f04da',11,'When calculating corporation tax on trading profits, which expenditure is generally disallowable?','Multiple Choice',20.00,'Business and client entertainment expenditure is disallowable for corporate tax purposes.','Medium',2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(37,'633fb0ec-c993-46fe-af68-123255591b71',11,'What is the standard VAT treatment of zero-rated supplies?','Multiple Choice',20.00,'Zero-rated supplies attract 0% output tax, but allow the registered trader to fully reclaim input tax suffered on related purchases.','Medium',3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(38,'9ca2f9ee-59bf-4112-887d-d73b3bf743ca',11,'For Capital Gains Tax (CGT), how are net allowable capital losses in a tax year treated?','Multiple Choice',20.00,'Capital losses are first offset against chargeable gains of the same tax year, with remaining unused losses carried forward indefinitely.','Medium',4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(39,'405fc325-662d-40cf-9fa3-fb1fe4d88b70',11,'Which tax concept prevents multinational corporations from transferring profits to low-tax jurisdictions using artificial pricing?','Multiple Choice',20.00,'Transfer pricing rules require transactions between connected parties to take place on an arm\'s length basis.','Medium',5,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(40,'aca8b73f-59aa-4792-86c0-e07538880954',12,'Under standard income tax principles, which of the following is treated as taxable employment income?','Multiple Choice',20.00,'Employment income includes contractual salary, cash bonuses, and taxable benefits-in-kind such as private fuel or company cars.','Medium',1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(41,'550b0051-10da-46f9-8f13-2b44eeabc7cd',12,'When calculating corporation tax on trading profits, which expenditure is generally disallowable?','Multiple Choice',20.00,'Business and client entertainment expenditure is disallowable for corporate tax purposes.','Medium',2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(42,'226fbff4-b496-4a18-ba4f-169d154104f7',12,'What is the standard VAT treatment of zero-rated supplies?','Multiple Choice',20.00,'Zero-rated supplies attract 0% output tax, but allow the registered trader to fully reclaim input tax suffered on related purchases.','Medium',3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(43,'e119f3af-e26d-45b2-9477-1d1e2a5aada1',12,'For Capital Gains Tax (CGT), how are net allowable capital losses in a tax year treated?','Multiple Choice',20.00,'Capital losses are first offset against chargeable gains of the same tax year, with remaining unused losses carried forward indefinitely.','Medium',4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(44,'474547e0-dbfe-4383-8acf-da1ea2dded37',12,'Which tax concept prevents multinational corporations from transferring profits to low-tax jurisdictions using artificial pricing?','Multiple Choice',20.00,'Transfer pricing rules require transactions between connected parties to take place on an arm\'s length basis.','Medium',5,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(45,'c007d00f-9402-4005-ad80-ab13d322c4a7',13,'Under the IASB Conceptual Framework, what are the two fundamental qualitative characteristics of useful financial information?','Multiple Choice',20.00,'Relevance and Faithful Representation are the two fundamental qualitative characteristics.','Medium',1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(46,'d5494711-6cf2-451b-b99e-37e8ed103f11',13,'When evaluating capital investment projects, which technique considers all cash flows and the time value of money to indicate net wealth creation?','Multiple Choice',20.00,'Net Present Value (NPV) evaluates project cash inflows discounted at the cost of capital minus initial investment.','Medium',2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(47,'9b0f6139-7e6d-42f3-9f97-9b6efe6d74cd',13,'Under IAS 16 (Property, Plant and Equipment), which of the following costs must NOT be included in an asset\'s initial carrying amount?','Multiple Choice',20.00,'General administration costs and staff training costs are expensed to profit or loss immediately.','Medium',3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(48,'87582f7e-76fb-4526-8476-8970ca6246bf',13,'What does an organization\'s Working Capital cycle (Operating Cycle) measure?','Multiple Choice',20.00,'The operating cycle measures the time taken between purchasing raw materials/inventory and collecting cash from customers.','Medium',4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(49,'1916eab9-d3e1-4f99-9244-556d8fe239b2',13,'What is the Weighted Average Cost of Capital (WACC)?','Multiple Choice',20.00,'WACC is the average rate of return a company expects to pay to finance its assets, weighted by the market proportions of equity and debt.','Medium',5,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(50,'47420756-66b9-429f-93af-0f86d370c143',14,'Under the IASB Conceptual Framework, what are the two fundamental qualitative characteristics of useful financial information?','Multiple Choice',20.00,'Relevance and Faithful Representation are the two fundamental qualitative characteristics.','Medium',1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(51,'ed4fc220-7f37-44bb-ac07-d1a1f554eb72',14,'When evaluating capital investment projects, which technique considers all cash flows and the time value of money to indicate net wealth creation?','Multiple Choice',20.00,'Net Present Value (NPV) evaluates project cash inflows discounted at the cost of capital minus initial investment.','Medium',2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(52,'33c68a5d-9052-4495-a791-177607a69b46',14,'Under IAS 16 (Property, Plant and Equipment), which of the following costs must NOT be included in an asset\'s initial carrying amount?','Multiple Choice',20.00,'General administration costs and staff training costs are expensed to profit or loss immediately.','Medium',3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(53,'82ab0fa0-ec8a-4c86-98f1-796051502092',14,'What does an organization\'s Working Capital cycle (Operating Cycle) measure?','Multiple Choice',20.00,'The operating cycle measures the time taken between purchasing raw materials/inventory and collecting cash from customers.','Medium',4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(54,'11a071b3-f850-442f-9062-0b049a241562',14,'What is the Weighted Average Cost of Capital (WACC)?','Multiple Choice',20.00,'WACC is the average rate of return a company expects to pay to finance its assets, weighted by the market proportions of equity and debt.','Medium',5,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(55,'2d2385ee-0fd2-4925-871d-6c90a5d6ff64',15,'Under the IASB Conceptual Framework, what are the two fundamental qualitative characteristics of useful financial information?','Multiple Choice',20.00,'Relevance and Faithful Representation are the two fundamental qualitative characteristics.','Medium',1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(56,'a8675a0e-67e5-453c-91f4-7a3865eeb532',15,'When evaluating capital investment projects, which technique considers all cash flows and the time value of money to indicate net wealth creation?','Multiple Choice',20.00,'Net Present Value (NPV) evaluates project cash inflows discounted at the cost of capital minus initial investment.','Medium',2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(57,'30dd5af8-6ac5-40d1-9bcb-c30e3d975582',15,'Under IAS 16 (Property, Plant and Equipment), which of the following costs must NOT be included in an asset\'s initial carrying amount?','Multiple Choice',20.00,'General administration costs and staff training costs are expensed to profit or loss immediately.','Medium',3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(58,'0f6dcfc8-2666-411e-81eb-8162657b96ed',15,'What does an organization\'s Working Capital cycle (Operating Cycle) measure?','Multiple Choice',20.00,'The operating cycle measures the time taken between purchasing raw materials/inventory and collecting cash from customers.','Medium',4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(59,'f4cc964b-b2f1-4232-afe2-75b6a93dd329',15,'What is the Weighted Average Cost of Capital (WACC)?','Multiple Choice',20.00,'WACC is the average rate of return a company expects to pay to finance its assets, weighted by the market proportions of equity and debt.','Medium',5,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(60,'82edde1c-05fe-4e11-b048-d87fb1f4f681',16,'Under the IASB Conceptual Framework, what are the two fundamental qualitative characteristics of useful financial information?','Multiple Choice',20.00,'Relevance and Faithful Representation are the two fundamental qualitative characteristics.','Medium',1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(61,'c6c64f1a-2833-418b-896f-a5d9b2d74e74',16,'When evaluating capital investment projects, which technique considers all cash flows and the time value of money to indicate net wealth creation?','Multiple Choice',20.00,'Net Present Value (NPV) evaluates project cash inflows discounted at the cost of capital minus initial investment.','Medium',2,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(62,'d0d9743b-14f7-49cb-ada2-bd69824427c2',16,'Under IAS 16 (Property, Plant and Equipment), which of the following costs must NOT be included in an asset\'s initial carrying amount?','Multiple Choice',20.00,'General administration costs and staff training costs are expensed to profit or loss immediately.','Medium',3,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(63,'a7b7a718-6b90-4281-8e01-b8058b057fb4',16,'What does an organization\'s Working Capital cycle (Operating Cycle) measure?','Multiple Choice',20.00,'The operating cycle measures the time taken between purchasing raw materials/inventory and collecting cash from customers.','Medium',4,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(64,'0b42f212-ef62-4185-bf1d-03ec3dca69b3',16,'What is the Weighted Average Cost of Capital (WACC)?','Multiple Choice',20.00,'WACC is the average rate of return a company expects to pay to finance its assets, weighted by the market proportions of equity and debt.','Medium',5,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(65,'81d52f0d-ad06-44f5-9bc5-029ba10e31b8',17,'Under the IASB Conceptual Framework, what are the two fundamental qualitative characteristics of useful financial information?','Multiple Choice',20.00,'Relevance and Faithful Representation are the two fundamental qualitative characteristics.','Medium',1,'2026-09-16 06:43:42','2026-09-16 06:43:42'),
(66,'bbfd4855-22ee-4b61-b216-faed904cdee2',17,'When evaluating capital investment projects, which technique considers all cash flows and the time value of money to indicate net wealth creation?','Multiple Choice',20.00,'Net Present Value (NPV) evaluates project cash inflows discounted at the cost of capital minus initial investment.','Medium',2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(67,'d0044998-4887-4a8c-bfe3-56433218f7b4',17,'Under IAS 16 (Property, Plant and Equipment), which of the following costs must NOT be included in an asset\'s initial carrying amount?','Multiple Choice',20.00,'General administration costs and staff training costs are expensed to profit or loss immediately.','Medium',3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(68,'152680c0-a60f-487c-9320-661632c0fe5b',17,'What does an organization\'s Working Capital cycle (Operating Cycle) measure?','Multiple Choice',20.00,'The operating cycle measures the time taken between purchasing raw materials/inventory and collecting cash from customers.','Medium',4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(69,'4186adb9-7069-4f3b-b3b9-3638ea0995b4',17,'What is the Weighted Average Cost of Capital (WACC)?','Multiple Choice',20.00,'WACC is the average rate of return a company expects to pay to finance its assets, weighted by the market proportions of equity and debt.','Medium',5,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(70,'75af1632-1878-4fa9-865b-58b561db943b',18,'Under the IASB Conceptual Framework, what are the two fundamental qualitative characteristics of useful financial information?','Multiple Choice',20.00,'Relevance and Faithful Representation are the two fundamental qualitative characteristics.','Medium',1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(71,'24d5f81d-2ba8-43b9-a4bd-64ea8dd42ef6',18,'When evaluating capital investment projects, which technique considers all cash flows and the time value of money to indicate net wealth creation?','Multiple Choice',20.00,'Net Present Value (NPV) evaluates project cash inflows discounted at the cost of capital minus initial investment.','Medium',2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(72,'63d9fc2f-b6ef-4ea3-839c-f68cdaa2117e',18,'Under IAS 16 (Property, Plant and Equipment), which of the following costs must NOT be included in an asset\'s initial carrying amount?','Multiple Choice',20.00,'General administration costs and staff training costs are expensed to profit or loss immediately.','Medium',3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(73,'83896cb1-042c-4a34-843e-7bb44b5adccb',18,'What does an organization\'s Working Capital cycle (Operating Cycle) measure?','Multiple Choice',20.00,'The operating cycle measures the time taken between purchasing raw materials/inventory and collecting cash from customers.','Medium',4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(74,'bd11030e-2ece-4232-a729-fd9b81737616',18,'What is the Weighted Average Cost of Capital (WACC)?','Multiple Choice',20.00,'WACC is the average rate of return a company expects to pay to finance its assets, weighted by the market proportions of equity and debt.','Medium',5,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(75,'33d91b4a-9fcc-4b1c-bc16-217fcbd7c4e3',19,'Under the IASB Conceptual Framework, what are the two fundamental qualitative characteristics of useful financial information?','Multiple Choice',20.00,'Relevance and Faithful Representation are the two fundamental qualitative characteristics.','Medium',1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(76,'35208a71-aa34-4e74-8dc1-b4eff9409965',19,'When evaluating capital investment projects, which technique considers all cash flows and the time value of money to indicate net wealth creation?','Multiple Choice',20.00,'Net Present Value (NPV) evaluates project cash inflows discounted at the cost of capital minus initial investment.','Medium',2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(77,'d40283c2-c0c1-46a9-a97d-bf561a0c3bc3',19,'Under IAS 16 (Property, Plant and Equipment), which of the following costs must NOT be included in an asset\'s initial carrying amount?','Multiple Choice',20.00,'General administration costs and staff training costs are expensed to profit or loss immediately.','Medium',3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(78,'eb29c240-e9da-4f03-9082-b3cc58e8bbb7',19,'What does an organization\'s Working Capital cycle (Operating Cycle) measure?','Multiple Choice',20.00,'The operating cycle measures the time taken between purchasing raw materials/inventory and collecting cash from customers.','Medium',4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(79,'0fdc2dc8-0030-45ae-a1f9-81f978e68409',19,'What is the Weighted Average Cost of Capital (WACC)?','Multiple Choice',20.00,'WACC is the average rate of return a company expects to pay to finance its assets, weighted by the market proportions of equity and debt.','Medium',5,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(80,'0cf737dd-d21d-4ca0-9c6c-43449d817b16',20,'Under the IASB Conceptual Framework, what are the two fundamental qualitative characteristics of useful financial information?','Multiple Choice',20.00,'Relevance and Faithful Representation are the two fundamental qualitative characteristics.','Medium',1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(81,'244a4023-d8bd-4362-a558-1566c7d74721',20,'When evaluating capital investment projects, which technique considers all cash flows and the time value of money to indicate net wealth creation?','Multiple Choice',20.00,'Net Present Value (NPV) evaluates project cash inflows discounted at the cost of capital minus initial investment.','Medium',2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(82,'a275fe6a-38fe-463d-8c2f-69a8a7eb5aa7',20,'Under IAS 16 (Property, Plant and Equipment), which of the following costs must NOT be included in an asset\'s initial carrying amount?','Multiple Choice',20.00,'General administration costs and staff training costs are expensed to profit or loss immediately.','Medium',3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(83,'40b4e3f6-49ec-45b1-96cc-095fee721835',20,'What does an organization\'s Working Capital cycle (Operating Cycle) measure?','Multiple Choice',20.00,'The operating cycle measures the time taken between purchasing raw materials/inventory and collecting cash from customers.','Medium',4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(84,'5ca42fe1-958b-429d-ba47-c5d6ec2dec3b',20,'What is the Weighted Average Cost of Capital (WACC)?','Multiple Choice',20.00,'WACC is the average rate of return a company expects to pay to finance its assets, weighted by the market proportions of equity and debt.','Medium',5,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(85,'18da8cbf-bed2-4df9-b316-63db69cc0957',21,'According to the core accounting equation, which formula must always balance?','Multiple Choice',20.00,'Assets = Liabilities + Equity is the foundational balance sheet equation.','Medium',1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(86,'ec21b532-ed9f-4837-bb85-24d5fc4aee23',21,'What is the double-entry posting to record the purchase of inventory on credit from a supplier?','Multiple Choice',20.00,'Purchases (or inventory) increases (Debit), and trade payables liability increases (Credit).','Medium',2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(87,'6b66bbe5-73a4-4be5-9ad6-3084f7288088',21,'Which of the following errors will directly cause an imbalance between total debits and credits in the Trial Balance?','Multiple Choice',20.00,'A single-sided entry or posting different amounts to debit and credit destroys the mathematical equality of the trial balance.','Medium',3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(88,'946a889c-b89e-4166-933b-6b77b0563a9e',21,'Under the accruals concept (matching principle), when must revenues and expenses be recognized?','Multiple Choice',20.00,'Revenues and expenses are recognized as they are earned or incurred, not as money is received or paid.','Medium',4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(89,'660eede2-f5c6-472a-8d86-a74dbf33846d',21,'Given: Opening Inventory = $12,000, Purchases = $60,000, Closing Inventory = $16,000. What is Cost of Goods Sold (COGS)?','Multiple Choice',20.00,'COGS = Opening Inventory + Purchases - Closing Inventory = 12,000 + 60,000 - 16,000 = $56,000.','Medium',5,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(90,'31d903b0-3a61-49fa-821f-aba3ba90127a',22,'According to the core accounting equation, which formula must always balance?','Multiple Choice',20.00,'Assets = Liabilities + Equity is the foundational balance sheet equation.','Medium',1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(91,'be62051d-d602-4b05-911f-4b89eaa7fc3d',22,'What is the double-entry posting to record the purchase of inventory on credit from a supplier?','Multiple Choice',20.00,'Purchases (or inventory) increases (Debit), and trade payables liability increases (Credit).','Medium',2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(92,'e808b35e-8ca1-4da1-841f-af0f15e795d6',22,'Which of the following errors will directly cause an imbalance between total debits and credits in the Trial Balance?','Multiple Choice',20.00,'A single-sided entry or posting different amounts to debit and credit destroys the mathematical equality of the trial balance.','Medium',3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(93,'477ae5c9-54b4-468d-b4c6-352fd3b531f4',22,'Under the accruals concept (matching principle), when must revenues and expenses be recognized?','Multiple Choice',20.00,'Revenues and expenses are recognized as they are earned or incurred, not as money is received or paid.','Medium',4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(94,'4cc1daa4-6dc5-429f-a0d4-7f1a752c79f8',22,'Given: Opening Inventory = $12,000, Purchases = $60,000, Closing Inventory = $16,000. What is Cost of Goods Sold (COGS)?','Multiple Choice',20.00,'COGS = Opening Inventory + Purchases - Closing Inventory = 12,000 + 60,000 - 16,000 = $56,000.','Medium',5,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(95,'0f15acce-ee11-49f9-8cf7-f879fb990f51',23,'According to the core accounting equation, which formula must always balance?','Multiple Choice',20.00,'Assets = Liabilities + Equity is the foundational balance sheet equation.','Medium',1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(96,'dd83d4af-f5d3-46ef-8c38-3ec8b377670b',23,'What is the double-entry posting to record the purchase of inventory on credit from a supplier?','Multiple Choice',20.00,'Purchases (or inventory) increases (Debit), and trade payables liability increases (Credit).','Medium',2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(97,'8347d0eb-0491-4c99-8811-f42119b50512',23,'Which of the following errors will directly cause an imbalance between total debits and credits in the Trial Balance?','Multiple Choice',20.00,'A single-sided entry or posting different amounts to debit and credit destroys the mathematical equality of the trial balance.','Medium',3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(98,'5e08dfec-9de4-4e1b-b108-ac67736c3385',23,'Under the accruals concept (matching principle), when must revenues and expenses be recognized?','Multiple Choice',20.00,'Revenues and expenses are recognized as they are earned or incurred, not as money is received or paid.','Medium',4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(99,'4254f7de-646b-469b-a275-04a18e65a584',23,'Given: Opening Inventory = $12,000, Purchases = $60,000, Closing Inventory = $16,000. What is Cost of Goods Sold (COGS)?','Multiple Choice',20.00,'COGS = Opening Inventory + Purchases - Closing Inventory = 12,000 + 60,000 - 16,000 = $56,000.','Medium',5,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(100,'af1d9d0e-a4ed-4d8a-85c5-45f4c5230585',24,'According to the core accounting equation, which formula must always balance?','Multiple Choice',20.00,'Assets = Liabilities + Equity is the foundational balance sheet equation.','Medium',1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(101,'22f51e18-4096-4339-a498-086d7166430a',24,'What is the double-entry posting to record the purchase of inventory on credit from a supplier?','Multiple Choice',20.00,'Purchases (or inventory) increases (Debit), and trade payables liability increases (Credit).','Medium',2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(102,'b85351dd-b9fa-4020-8cca-22b7aa01f7bb',24,'Which of the following errors will directly cause an imbalance between total debits and credits in the Trial Balance?','Multiple Choice',20.00,'A single-sided entry or posting different amounts to debit and credit destroys the mathematical equality of the trial balance.','Medium',3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(103,'76a89f2c-d5bf-4f97-8859-5eac6193eea5',24,'Under the accruals concept (matching principle), when must revenues and expenses be recognized?','Multiple Choice',20.00,'Revenues and expenses are recognized as they are earned or incurred, not as money is received or paid.','Medium',4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(104,'114082da-e88f-4906-89ae-b87bb32b69cd',24,'Given: Opening Inventory = $12,000, Purchases = $60,000, Closing Inventory = $16,000. What is Cost of Goods Sold (COGS)?','Multiple Choice',20.00,'COGS = Opening Inventory + Purchases - Closing Inventory = 12,000 + 60,000 - 16,000 = $56,000.','Medium',5,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(105,'32f509e1-a259-4011-9a7d-552fc6f9b5ba',25,'According to the core accounting equation, which formula must always balance?','Multiple Choice',20.00,'Assets = Liabilities + Equity is the foundational balance sheet equation.','Medium',1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(106,'502fffa5-30e1-46b9-ba85-07cb61fe0a8d',25,'What is the double-entry posting to record the purchase of inventory on credit from a supplier?','Multiple Choice',20.00,'Purchases (or inventory) increases (Debit), and trade payables liability increases (Credit).','Medium',2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(107,'80f02ab3-4cd4-4466-8d14-a32129dbb47c',25,'Which of the following errors will directly cause an imbalance between total debits and credits in the Trial Balance?','Multiple Choice',20.00,'A single-sided entry or posting different amounts to debit and credit destroys the mathematical equality of the trial balance.','Medium',3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(108,'b67bee4b-ad76-4b0c-aade-3df0dfb3c720',25,'Under the accruals concept (matching principle), when must revenues and expenses be recognized?','Multiple Choice',20.00,'Revenues and expenses are recognized as they are earned or incurred, not as money is received or paid.','Medium',4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(109,'44fe5301-56f7-4f1a-9472-9dae1366eada',25,'Given: Opening Inventory = $12,000, Purchases = $60,000, Closing Inventory = $16,000. What is Cost of Goods Sold (COGS)?','Multiple Choice',20.00,'COGS = Opening Inventory + Purchases - Closing Inventory = 12,000 + 60,000 - 16,000 = $56,000.','Medium',5,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(110,'719364a0-0e3f-4513-b3f4-9150270e8ae3',26,'According to the core accounting equation, which formula must always balance?','Multiple Choice',20.00,'Assets = Liabilities + Equity is the foundational balance sheet equation.','Medium',1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(111,'14147b41-4655-4758-9d70-59c963b10210',26,'What is the double-entry posting to record the purchase of inventory on credit from a supplier?','Multiple Choice',20.00,'Purchases (or inventory) increases (Debit), and trade payables liability increases (Credit).','Medium',2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(112,'2aaf7b92-2b3d-464b-a99f-4fb28b60abf3',26,'Which of the following errors will directly cause an imbalance between total debits and credits in the Trial Balance?','Multiple Choice',20.00,'A single-sided entry or posting different amounts to debit and credit destroys the mathematical equality of the trial balance.','Medium',3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(113,'d327c498-0c9e-430f-9ef6-d78d67b997b3',26,'Under the accruals concept (matching principle), when must revenues and expenses be recognized?','Multiple Choice',20.00,'Revenues and expenses are recognized as they are earned or incurred, not as money is received or paid.','Medium',4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(114,'6b5dc475-3a33-464f-8a28-309e1fb6c8f4',26,'Given: Opening Inventory = $12,000, Purchases = $60,000, Closing Inventory = $16,000. What is Cost of Goods Sold (COGS)?','Multiple Choice',20.00,'COGS = Opening Inventory + Purchases - Closing Inventory = 12,000 + 60,000 - 16,000 = $56,000.','Medium',5,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(115,'dc51faa5-ecd4-43ea-9ee6-294d321c4d97',27,'According to the core accounting equation, which formula must always balance?','Multiple Choice',20.00,'Assets = Liabilities + Equity is the foundational balance sheet equation.','Medium',1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(116,'c345cf05-7c94-4d9a-a235-759a85503c8a',27,'What is the double-entry posting to record the purchase of inventory on credit from a supplier?','Multiple Choice',20.00,'Purchases (or inventory) increases (Debit), and trade payables liability increases (Credit).','Medium',2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(117,'74e9d144-ebda-4a51-b545-517139acafd9',27,'Which of the following errors will directly cause an imbalance between total debits and credits in the Trial Balance?','Multiple Choice',20.00,'A single-sided entry or posting different amounts to debit and credit destroys the mathematical equality of the trial balance.','Medium',3,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(118,'045566cf-f30d-4e35-b3e9-7fb98dccbf5c',27,'Under the accruals concept (matching principle), when must revenues and expenses be recognized?','Multiple Choice',20.00,'Revenues and expenses are recognized as they are earned or incurred, not as money is received or paid.','Medium',4,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(119,'1ae3521a-5502-4543-857d-3b325dfff175',27,'Given: Opening Inventory = $12,000, Purchases = $60,000, Closing Inventory = $16,000. What is Cost of Goods Sold (COGS)?','Multiple Choice',20.00,'COGS = Opening Inventory + Purchases - Closing Inventory = 12,000 + 60,000 - 16,000 = $56,000.','Medium',5,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(120,'e7d5402d-843c-4f6b-87d2-55f95ad40444',28,'According to the core accounting equation, which formula must always balance?','Multiple Choice',20.00,'Assets = Liabilities + Equity is the foundational balance sheet equation.','Medium',1,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(121,'e9e9a7c3-c058-4463-98f7-1b7495c58fd9',28,'What is the double-entry posting to record the purchase of inventory on credit from a supplier?','Multiple Choice',20.00,'Purchases (or inventory) increases (Debit), and trade payables liability increases (Credit).','Medium',2,'2026-09-16 06:43:43','2026-09-16 06:43:43'),
(122,'9fb111fb-b61e-4f44-8e79-305febc40f44',28,'Which of the following errors will directly cause an imbalance between total debits and credits in the Trial Balance?','Multiple Choice',20.00,'A single-sided entry or posting different amounts to debit and credit destroys the mathematical equality of the trial balance.','Medium',3,'2026-09-16 06:43:44','2026-09-16 06:43:44'),
(123,'4d3c651c-cc1d-40f8-b2aa-af2f0ec18fd9',28,'Under the accruals concept (matching principle), when must revenues and expenses be recognized?','Multiple Choice',20.00,'Revenues and expenses are recognized as they are earned or incurred, not as money is received or paid.','Medium',4,'2026-09-16 06:43:44','2026-09-16 06:43:44'),
(124,'a1096219-9bf2-44da-b333-32bd735de32d',28,'Given: Opening Inventory = $12,000, Purchases = $60,000, Closing Inventory = $16,000. What is Cost of Goods Sold (COGS)?','Multiple Choice',20.00,'COGS = Opening Inventory + Purchases - Closing Inventory = 12,000 + 60,000 - 16,000 = $56,000.','Medium',5,'2026-09-16 06:43:44','2026-09-16 06:43:44');
/*!40000 ALTER TABLE `assessment_questions` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `assessments`
--

DROP TABLE IF EXISTS `assessments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `assessments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `organization_id` bigint(20) unsigned NOT NULL,
  `batch_id` bigint(20) unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `type` enum('Quiz','Assignment','CAT','Exam','Practical','Project','Final Examination') NOT NULL DEFAULT 'Quiz',
  `weight_percentage` decimal(5,2) NOT NULL DEFAULT 20.00,
  `total_marks` decimal(6,2) NOT NULL DEFAULT 100.00,
  `pass_mark` decimal(6,2) NOT NULL DEFAULT 50.00,
  `time_limit` int(10) unsigned DEFAULT NULL,
  `attempts_allowed` int(10) unsigned NOT NULL DEFAULT 1,
  `randomize_questions` tinyint(1) NOT NULL DEFAULT 0,
  `randomize_options` tinyint(1) NOT NULL DEFAULT 0,
  `show_immediate_results` tinyint(1) NOT NULL DEFAULT 1,
  `show_correct_answers` tinyint(1) NOT NULL DEFAULT 0,
  `due_date` timestamp NULL DEFAULT NULL,
  `resource_file_path` varchar(255) DEFAULT NULL,
  `status` enum('draft','published','closed') NOT NULL DEFAULT 'draft',
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `assessments_uuid_unique` (`uuid`),
  KEY `assessments_organization_id_foreign` (`organization_id`),
  KEY `assessments_created_by_foreign` (`created_by`),
  KEY `assessments_batch_id_type_index` (`batch_id`,`type`),
  KEY `assessments_status_index` (`status`),
  CONSTRAINT `assessments_batch_id_foreign` FOREIGN KEY (`batch_id`) REFERENCES `course_batches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `assessments_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `assessments_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessments`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `assessments` WRITE;
/*!40000 ALTER TABLE `assessments` DISABLE KEYS */;
INSERT INTO `assessments` VALUES
(1,'bdb28086-aba4-4365-99b5-f4ea3419591a',1,1,'CCNA Module 1 Quiz: Network Protocols & Subnetting','Timed quiz covering OSI layers, TCP vs UDP, and binary IPv4 subnetting calculations.','Quiz',20.00,100.00,60.00,30,2,1,1,1,1,'2026-09-17 17:59:10',NULL,'published',6,'2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(2,'041f44d9-0c06-4716-8483-797b4f381cd2',1,1,'CCNA Continuous Assessment Test 1 (CAT 1)','Mid-term evaluation covering Switching, VLANs, Inter-VLAN Routing, and Static Routing.','CAT',20.00,100.00,50.00,60,1,0,0,1,0,'2026-09-27 17:59:10',NULL,'published',6,'2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(3,'35e28fbc-a3c9-4de2-ac46-952623ca4610',1,1,'Enterprise Campus Network Topology Design & Packet Tracer Lab','Design a multi-branch network topology with 3 VLANs, DHCP snooping, trunking, and OSPF routing. Submit your .pkt file and design PDF.','Assignment',20.00,100.00,50.00,NULL,1,0,0,1,0,'2026-09-21 17:59:10',NULL,'published',6,'2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(4,'22b07409-0859-4907-a0cf-420f6c50c2b8',1,1,'CCNA 200-301 Comprehensive Final Examination','Official final examination assessing all Cisco CCNA curriculum competencies.','Final Examination',40.00,100.00,70.00,120,1,0,0,1,0,'2026-10-22 17:59:10',NULL,'published',6,'2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(5,'9c21ca18-315a-41d2-8b21-394e6e48dafe',1,7,'ACCA CL: Continuous Assessment Test 1 (CAT 1)','First continuous assessment test covering Contract Law, Formation, and Breach.','CAT',15.00,100.00,50.00,60,2,1,1,1,1,'2026-09-02 20:59:59',NULL,'published',6,'2026-09-16 06:04:10','2026-09-16 06:04:10',NULL),
(6,'169ee9e0-9f3c-4647-9b23-9946832295e6',1,7,'ACCA CL: Continuous Assessment Test 2 (CAT 2)','Second continuous assessment test covering Company Law, Directors, and Insolvency.','CAT',15.00,100.00,50.00,60,2,1,1,1,1,'2026-10-16 20:59:59',NULL,'published',6,'2026-09-16 06:04:10','2026-09-16 06:04:10',NULL),
(7,'cf383249-07d6-48b5-8e06-b0617e01577f',1,7,'ACCA CL: Mock Examination','Full-length mock exam simulating ACCA Computer Based Exam conditions for Corporate & Business Law.','CAT',20.00,100.00,50.00,120,2,1,1,1,1,'2026-11-05 20:59:59',NULL,'published',6,'2026-09-16 06:04:10','2026-09-16 06:04:10',NULL),
(8,'71a4bb22-407b-432c-8603-a11b2e65306d',1,7,'ACCA CL: Final Examination','Final institutional ACCA examination for Corporate and Business Law (CL).','Final Examination',50.00,100.00,50.00,120,2,1,1,1,1,'2026-11-10 20:59:59',NULL,'published',6,'2026-09-16 06:04:10','2026-09-16 06:04:10',NULL),
(9,'d1c94743-aa24-449a-81b1-4ece049c4c1a',1,7,'ACCA TX: Continuous Assessment Test 1 (CAT 1)','Income Tax computations for employed and self-employed individuals.','CAT',15.00,100.00,50.00,60,2,1,1,1,1,'2026-10-02 20:59:59',NULL,'published',6,'2026-09-16 06:04:10','2026-09-16 06:04:10',NULL),
(10,'6081cbdc-561b-42b4-95c8-785dad104c17',1,7,'ACCA TX: Continuous Assessment Test 2 (CAT 2)','Corporation Tax, Capital Gains Tax, and Value Added Tax computations.','CAT',15.00,100.00,50.00,60,2,1,1,1,1,'2026-11-06 20:59:59',NULL,'published',6,'2026-09-16 06:04:10','2026-09-16 06:04:10',NULL),
(11,'f48ec811-de1b-45d1-9a07-24cccfa3023c',1,7,'ACCA TX: Mock Examination','Timed 3-hour mock exam covering comprehensive syllabus of ACCA TX.','CAT',20.00,100.00,50.00,180,2,1,1,1,1,'2026-11-27 20:59:59',NULL,'published',6,'2026-09-16 06:04:10','2026-09-16 06:04:10',NULL),
(12,'406bb3cc-d4ad-4097-9a67-b77886d3bc37',1,7,'ACCA TX: Final Examination Window','Official ACCA Final Exam for Taxation Paper.','Final Examination',50.00,100.00,50.00,180,2,1,1,1,1,'2026-12-07 20:59:59',NULL,'published',6,'2026-09-16 06:04:10','2026-09-16 06:04:10',NULL),
(13,'af4e18ac-4f38-49ae-9303-30fb7bfda590',1,7,'ACCA FR: Continuous Assessment Test 1 (CAT 1)','Conceptual Framework, IFRS standards, and single-entity financial statements.','CAT',15.00,100.00,50.00,60,2,1,1,1,1,'2026-10-03 20:59:59',NULL,'published',6,'2026-09-16 06:04:10','2026-09-16 06:04:10',NULL),
(14,'0bda505f-04cd-4201-8c05-a444427674a5',1,7,'ACCA FR: Continuous Assessment Test 2 (CAT 2)','Consolidated financial statements and group accounts.','CAT',15.00,100.00,50.00,60,2,1,1,1,1,'2026-11-07 20:59:59',NULL,'published',6,'2026-09-16 06:04:10','2026-09-16 06:04:10',NULL),
(15,'e50f512d-7132-4023-97d0-fd6c28bf8e18',1,7,'ACCA FR: Mock Examination','Comprehensive ACCA FR Mock Exam simulating live testing environment.','CAT',20.00,100.00,50.00,180,2,1,1,1,1,'2026-11-28 20:59:59',NULL,'published',6,'2026-09-16 06:04:10','2026-09-16 06:04:10',NULL),
(16,'a42eced5-977c-434d-8bf1-e379b6fd3774',1,7,'ACCA FR: Final Examination Window','Official ACCA Final Exam for Financial Reporting (FR).','Final Examination',50.00,100.00,50.00,180,2,1,1,1,1,'2026-12-08 20:59:59',NULL,'published',6,'2026-09-16 06:04:10','2026-09-16 06:04:10',NULL),
(17,'b1e96e84-6206-453a-90d9-ea612acf976c',1,7,'ACCA FM: Continuous Assessment Test 1 (CAT 1)','Working capital management and investment appraisal (NPV, IRR).','CAT',15.00,100.00,50.00,60,2,1,1,1,1,'2026-10-03 20:59:59',NULL,'published',6,'2026-09-16 06:04:10','2026-09-16 06:04:10',NULL),
(18,'95a3462e-04ac-4fa2-a3b7-2ce510f98417',1,7,'ACCA FM: Continuous Assessment Test 2 (CAT 2)','Business finance, cost of capital, and risk management techniques.','CAT',15.00,100.00,50.00,60,2,1,1,1,1,'2026-11-07 20:59:59',NULL,'published',6,'2026-09-16 06:04:10','2026-09-16 06:04:10',NULL),
(19,'be8bb999-31a7-4e26-a1ee-fa40cbaeee24',1,7,'ACCA FM: Mock Examination','ACCA FM Mock Exam covering all syllabus areas.','CAT',20.00,100.00,50.00,180,2,1,1,1,1,'2026-11-28 20:59:59',NULL,'published',6,'2026-09-16 06:04:10','2026-09-16 06:04:10',NULL),
(20,'91fd6206-3cf4-4cc2-be34-183f67534b16',1,7,'ACCA FM: Final Examination Window','Official ACCA Final Exam for Financial Management (FM).','Final Examination',50.00,100.00,50.00,180,2,1,1,1,1,'2026-12-09 20:59:59',NULL,'published',6,'2026-09-16 06:04:10','2026-09-16 06:04:10',NULL),
(21,'2066a11c-e0ef-4443-a2d6-4bb8526cc5a1',1,5,'ACCA FIA FFA: Continuous Assessment Test 1 (CAT 1)','Principles of financial accounting, double-entry bookkeeping, and ledger balances.','CAT',15.00,100.00,50.00,60,2,1,1,1,1,'2026-10-05 20:59:59',NULL,'published',6,'2026-09-16 06:04:10','2026-09-16 06:04:10',NULL),
(22,'2e832611-5f5a-4caf-98b0-39b6dd19a5f2',1,5,'ACCA FIA FFA: Continuous Assessment Test 2 (CAT 2)','Preparation of trial balances, bank reconciliations, and accruals/prepayments.','CAT',15.00,100.00,50.00,60,2,1,1,1,1,'2026-10-26 20:59:59',NULL,'published',6,'2026-09-16 06:04:10','2026-09-16 06:04:10',NULL),
(23,'f57cce17-ce53-4193-b983-5aa346aa9c4b',1,5,'ACCA FIA FFA: Mock Examination','Mock exam simulating the 2-hour CBE format for FFA.','CAT',20.00,100.00,50.00,120,2,1,1,1,1,'2026-11-16 20:59:59',NULL,'published',6,'2026-09-16 06:04:10','2026-09-16 06:04:10',NULL),
(24,'4b45254e-6bfd-48a7-8b28-0b81e8be09da',1,5,'ACCA FIA FFA: Final Examination','Final ACCA Foundations in Accountancy (FFA) Computer Based Exam.','Final Examination',50.00,100.00,50.00,120,2,1,1,1,1,'2026-11-23 20:59:59',NULL,'published',6,'2026-09-16 06:04:10','2026-09-16 06:04:10',NULL),
(25,'b1c3f79e-9143-48f8-9e44-b6fe2dbe4e2c',1,5,'ACCA FIA FA2: Continuous Assessment Test 1 (CAT 1)','Basic accounting principles, journal entries, and corrections of errors.','CAT',15.00,100.00,50.00,60,2,1,1,1,1,'2026-10-07 20:59:59',NULL,'published',6,'2026-09-16 06:04:10','2026-09-16 06:04:10',NULL),
(26,'ff334a60-22f5-42bf-9d58-ff006d837ff2',1,5,'ACCA FIA FA2: Continuous Assessment Test 2 (CAT 2)','Control accounts, sales and purchase ledgers, and inventory valuation.','CAT',15.00,100.00,50.00,60,2,1,1,1,1,'2026-10-27 20:59:59',NULL,'published',6,'2026-09-16 06:04:10','2026-09-16 06:04:10',NULL),
(27,'d2554a3d-ee27-4318-87d3-610357f665e3',1,5,'ACCA FIA FA2: Mock Examination','Full-length FA2 Mock Examination.','CAT',20.00,100.00,50.00,120,2,1,1,1,1,'2026-11-17 20:59:59',NULL,'published',6,'2026-09-16 06:04:10','2026-09-16 06:04:10',NULL),
(28,'89239a1a-6ba0-4187-bd60-980587d500f3',1,5,'ACCA FIA FA2: Final Examination','Final ACCA Foundations in Accountancy (FA2) Computer Based Exam.','Final Examination',50.00,100.00,50.00,120,2,1,1,1,1,'2026-11-25 20:59:59',NULL,'published',6,'2026-09-16 06:04:10','2026-09-16 06:04:10',NULL);
/*!40000 ALTER TABLE `assessments` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `assignment_submissions`
--

DROP TABLE IF EXISTS `assignment_submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `assignment_submissions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `assessment_id` bigint(20) unsigned NOT NULL,
  `student_id` bigint(20) unsigned NOT NULL,
  `batch_id` bigint(20) unsigned NOT NULL,
  `submission_text` longtext DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `score` decimal(6,2) DEFAULT NULL,
  `grade` varchar(10) DEFAULT NULL,
  `feedback` text DEFAULT NULL,
  `graded_by` bigint(20) unsigned DEFAULT NULL,
  `graded_at` timestamp NULL DEFAULT NULL,
  `status` enum('submitted','graded','resubmitted') NOT NULL DEFAULT 'submitted',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_assignment_student` (`assessment_id`,`student_id`),
  UNIQUE KEY `assignment_submissions_uuid_unique` (`uuid`),
  KEY `assignment_submissions_student_id_foreign` (`student_id`),
  KEY `assignment_submissions_graded_by_foreign` (`graded_by`),
  KEY `assignment_submissions_batch_id_status_index` (`batch_id`,`status`),
  CONSTRAINT `assignment_submissions_assessment_id_foreign` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `assignment_submissions_batch_id_foreign` FOREIGN KEY (`batch_id`) REFERENCES `course_batches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `assignment_submissions_graded_by_foreign` FOREIGN KEY (`graded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `assignment_submissions_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignment_submissions`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `assignment_submissions` WRITE;
/*!40000 ALTER TABLE `assignment_submissions` DISABLE KEYS */;
INSERT INTO `assignment_submissions` VALUES
(1,'22b0ced0-7f2d-4530-b8b6-67d13c3163d4',3,13,1,'Completed Packet Tracer simulation for 3-tier campus LAN with redundant core switches and OSPF routing areas.','submissions/john_mwangi_pkt_lab.pkt',NULL,'2026-09-05 17:59:10',90.00,'A','Outstanding VLAN and STP design. Very clean configuration scripts.',6,'2026-09-06 17:59:10','graded','2026-09-07 17:59:10','2026-09-07 17:59:10'),
(2,'caceb37d-fd94-463d-bcdd-e4e928a6c594',3,14,1,'Packet tracer lab with DHCP failover configuration and access control lists.','submissions/jane_oduor_lab.pkt',NULL,'2026-09-05 17:59:10',85.00,'A','Great execution of Access Control Lists.',6,'2026-09-06 17:59:10','graded','2026-09-07 17:59:10','2026-09-07 17:59:10');
/*!40000 ALTER TABLE `assignment_submissions` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `attendance_records`
--

DROP TABLE IF EXISTS `attendance_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_records` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `attendance_session_id` bigint(20) unsigned NOT NULL,
  `student_id` bigint(20) unsigned NOT NULL,
  `status` enum('Present','Absent','Late','Excused') NOT NULL DEFAULT 'Present',
  `remarks` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `attendance_records_attendance_session_id_student_id_unique` (`attendance_session_id`,`student_id`),
  UNIQUE KEY `attendance_records_uuid_unique` (`uuid`),
  KEY `attendance_records_student_id_foreign` (`student_id`),
  CONSTRAINT `attendance_records_attendance_session_id_foreign` FOREIGN KEY (`attendance_session_id`) REFERENCES `attendance_sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `attendance_records_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_records`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `attendance_records` WRITE;
/*!40000 ALTER TABLE `attendance_records` DISABLE KEYS */;
INSERT INTO `attendance_records` VALUES
(1,'b47ec974-c8ef-4020-b82e-a42311f64a73',1,13,'Present','Active participant','2026-09-07 17:59:10','2026-09-07 17:59:10'),
(2,'27e7e702-b6c6-4216-aabf-ea3b4594b8f1',1,14,'Present','Full attendance','2026-09-07 17:59:10','2026-09-07 17:59:10'),
(3,'79c4f566-c857-4802-bd17-456d4033c4c2',2,13,'Present','Active participant','2026-09-07 17:59:10','2026-09-07 17:59:10'),
(4,'c711572e-034f-49c1-a17e-15146dbbc329',2,14,'Present','Full attendance','2026-09-07 17:59:10','2026-09-07 17:59:10'),
(5,'fdc46b85-bcb0-4698-b5fb-023ec6206f4b',3,13,'Late','Arrived 15 mins late due to transport','2026-09-07 17:59:10','2026-09-07 17:59:10'),
(6,'428d1334-e9d8-489f-8035-13cf6b7447e2',3,14,'Present','Full attendance','2026-09-07 17:59:10','2026-09-07 17:59:10'),
(7,'bee1f684-e3ef-4620-873f-18b20025cb3b',4,13,'Present','Active participant','2026-09-07 17:59:10','2026-09-07 17:59:10'),
(8,'684c838a-3a5d-4f0e-ad50-728dfe4609e9',4,14,'Present','Full attendance','2026-09-07 17:59:10','2026-09-07 17:59:10'),
(9,'edd47ac8-c8cd-47fb-aef7-50b9dd5dd7d9',5,13,'Present','Active participant','2026-09-07 17:59:10','2026-09-07 17:59:10'),
(10,'4922d81d-80f0-4ca7-a479-99cd65ed7cfa',5,14,'Present','Full attendance','2026-09-07 17:59:10','2026-09-07 17:59:10'),
(11,'163dc75c-c7c7-4a1d-a417-beafed75bf71',6,13,'Present',NULL,'2026-09-18 10:52:51','2026-09-18 10:52:51'),
(12,'b92b86c9-b8b0-4d0e-85c1-832defddaaf6',6,14,'Present',NULL,'2026-09-18 10:52:51','2026-09-18 10:52:51'),
(13,'df72bbaa-b0e8-419d-989a-572c54a2b19a',6,15,'Absent',NULL,'2026-09-18 10:52:51','2026-09-18 11:01:36'),
(14,'2c2cde3c-0879-4f52-910f-5b40c21cc1f9',6,16,'Late',NULL,'2026-09-18 10:52:51','2026-09-18 11:01:36');
/*!40000 ALTER TABLE `attendance_records` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `attendance_sessions`
--

DROP TABLE IF EXISTS `attendance_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_sessions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `class_session_id` bigint(20) unsigned NOT NULL,
  `batch_id` bigint(20) unsigned NOT NULL,
  `taken_by` bigint(20) unsigned NOT NULL,
  `session_date` date NOT NULL,
  `status` enum('open','closed') NOT NULL DEFAULT 'closed',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `attendance_sessions_uuid_unique` (`uuid`),
  UNIQUE KEY `attendance_sessions_class_session_id_unique` (`class_session_id`),
  KEY `attendance_sessions_taken_by_foreign` (`taken_by`),
  KEY `attendance_sessions_batch_id_session_date_index` (`batch_id`,`session_date`),
  CONSTRAINT `attendance_sessions_batch_id_foreign` FOREIGN KEY (`batch_id`) REFERENCES `course_batches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `attendance_sessions_class_session_id_foreign` FOREIGN KEY (`class_session_id`) REFERENCES `class_sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `attendance_sessions_taken_by_foreign` FOREIGN KEY (`taken_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_sessions`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `attendance_sessions` WRITE;
/*!40000 ALTER TABLE `attendance_sessions` DISABLE KEYS */;
INSERT INTO `attendance_sessions` VALUES
(1,'f18747d2-4853-49cc-a3b8-bb39708666d7',1,1,6,'2026-01-19','closed',NULL,'2026-09-07 17:59:10','2026-09-07 17:59:10'),
(2,'0b726f59-7fa2-4469-9c67-d308f8a104b3',2,1,6,'2026-01-26','closed',NULL,'2026-09-07 17:59:10','2026-09-07 17:59:10'),
(3,'02a6e041-f42f-4a37-93e5-1381f98647dd',3,1,6,'2026-02-02','closed',NULL,'2026-09-07 17:59:10','2026-09-07 17:59:10'),
(4,'40f69f3c-4e38-4f11-affb-9da121f23af8',4,1,6,'2026-02-09','closed',NULL,'2026-09-07 17:59:10','2026-09-07 17:59:10'),
(5,'97a10a42-52c7-4084-8ff4-d92ee855621b',5,1,6,'2026-02-16','closed',NULL,'2026-09-07 17:59:10','2026-09-07 17:59:10'),
(6,'0a6d0172-a46c-4845-8468-bcf20b3552f5',65,7,1,'2026-11-20','closed',NULL,'2026-09-18 10:52:51','2026-09-18 10:52:51');
/*!40000 ALTER TABLE `attendance_sessions` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `organization_id` bigint(20) unsigned DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(255) NOT NULL,
  `entity_id` bigint(20) unsigned NOT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `audit_logs_organization_id_foreign` (`organization_id`),
  KEY `audit_logs_entity_type_entity_id_index` (`entity_type`,`entity_id`),
  KEY `audit_logs_user_id_index` (`user_id`),
  KEY `audit_logs_action_index` (`action`),
  KEY `audit_logs_created_at_index` (`created_at`),
  CONSTRAINT `audit_logs_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `audit_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES
(93,NULL,1,'auth.login','App\\Models\\User',1,NULL,'{\"ip\":\"127.0.0.1\"}','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.137.0 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36','2026-09-18 13:28:39'),
(94,1,1,'auth.login','App\\Models\\User',1,NULL,'{\"ip\":\"127.0.0.1\"}','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.137.0 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36','2026-09-18 13:29:44'),
(95,1,1,'auth.login','App\\Models\\User',1,NULL,'{\"ip\":\"127.0.0.1\"}','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.137.0 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36','2026-09-18 13:30:53'),
(96,1,1,'class_session.create','App\\Models\\ClassSession',154,NULL,'{\"batch_id\":5,\"trainer_id\":1,\"title\":\"Fundamentals\",\"topic\":null,\"date\":\"2026-09-21T00:00:00.000000Z\",\"start_time\":\"06:00\",\"end_time\":\"08:00\",\"delivery_mode\":\"Online\",\"location\":\"teams Virtual Campus\",\"meeting_url\":\"https:\\/\\/meet.google.com\\/xyz-iat-live-mumo\",\"notes\":null,\"status\":\"scheduled\",\"uuid\":\"efe86109-2add-4a8b-96ec-4155920fc0bc\",\"updated_at\":\"2026-09-18T13:50:51.000000Z\",\"created_at\":\"2026-09-18T13:50:51.000000Z\",\"id\":154}','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64; rv:155.0) Gecko/20100101 Firefox/155.0','2026-09-18 13:50:51'),
(97,1,1,'attendance.mark','App\\Models\\AttendanceSession',6,NULL,'{\"session_id\":65,\"total_students\":4}','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64; rv:155.0) Gecko/20100101 Firefox/155.0','2026-09-18 13:52:51'),
(98,1,1,'batch.update','App\\Models\\CourseBatch',8,'{\"id\":8,\"uuid\":\"bbe688f8-4e5f-4162-baf1-0223b48fa207\",\"organization_id\":1,\"course_id\":1,\"branch_id\":1,\"name\":\"ACCA Strategic Professional September 2026 Cohort\",\"code\":\"ACCA-SP-2026-SEP-NRB\",\"start_date\":\"2026-09-14T00:00:00.000000Z\",\"end_date\":\"2027-02-05T00:00:00.000000Z\",\"capacity\":25,\"status\":\"upcoming\",\"created_at\":\"2026-09-07T20:59:10.000000Z\",\"updated_at\":\"2026-09-07T20:59:10.000000Z\",\"deleted_at\":null}','{\"id\":8,\"uuid\":\"bbe688f8-4e5f-4162-baf1-0223b48fa207\",\"organization_id\":1,\"course_id\":1,\"branch_id\":1,\"name\":\"ACCA Strategic Professional September 2026 Cohort\",\"code\":\"ACCA-SP-2026-SEP-NRB\",\"start_date\":\"2026-09-14T00:00:00.000000Z\",\"end_date\":\"2027-02-05T00:00:00.000000Z\",\"capacity\":25,\"status\":\"ongoing\",\"created_at\":\"2026-09-07T20:59:10.000000Z\",\"updated_at\":\"2026-09-18T13:57:56.000000Z\",\"deleted_at\":null}','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64; rv:155.0) Gecko/20100101 Firefox/155.0','2026-09-18 13:57:56'),
(99,1,1,'attendance.mark','App\\Models\\AttendanceSession',6,NULL,'{\"session_id\":65,\"total_students\":4}','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64; rv:155.0) Gecko/20100101 Firefox/155.0','2026-09-18 14:01:36');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `batch_trainers`
--

DROP TABLE IF EXISTS `batch_trainers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `batch_trainers` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `batch_id` bigint(20) unsigned NOT NULL,
  `trainer_id` bigint(20) unsigned NOT NULL,
  `role_type` enum('Lead Trainer','Assistant Trainer','Guest Trainer') NOT NULL DEFAULT 'Lead Trainer',
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `batch_trainers_batch_id_trainer_id_unique` (`batch_id`,`trainer_id`),
  KEY `batch_trainers_trainer_id_foreign` (`trainer_id`),
  CONSTRAINT `batch_trainers_batch_id_foreign` FOREIGN KEY (`batch_id`) REFERENCES `course_batches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `batch_trainers_trainer_id_foreign` FOREIGN KEY (`trainer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `batch_trainers`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `batch_trainers` WRITE;
/*!40000 ALTER TABLE `batch_trainers` DISABLE KEYS */;
INSERT INTO `batch_trainers` VALUES
(1,1,6,'Lead Trainer','2026-09-07 20:59:10','2026-09-07 17:59:10','2026-09-07 17:59:10'),
(2,1,8,'Assistant Trainer','2026-09-07 20:59:10','2026-09-07 17:59:10','2026-09-07 17:59:10'),
(3,2,7,'Lead Trainer','2026-09-07 20:59:10','2026-09-07 17:59:10','2026-09-07 17:59:10'),
(4,3,6,'Lead Trainer','2026-09-07 20:59:10','2026-09-07 17:59:10','2026-09-07 17:59:10'),
(5,4,6,'Lead Trainer','2026-09-07 20:59:10','2026-09-07 17:59:10','2026-09-07 17:59:10'),
(6,5,6,'Lead Trainer','2026-09-07 20:59:10','2026-09-07 17:59:10','2026-09-07 17:59:10'),
(7,6,6,'Lead Trainer','2026-09-07 20:59:10','2026-09-07 17:59:10','2026-09-08 08:49:23'),
(8,7,6,'Lead Trainer','2026-09-07 20:59:10','2026-09-07 17:59:10','2026-09-07 17:59:10'),
(9,8,6,'Lead Trainer','2026-09-07 20:59:10','2026-09-07 17:59:10','2026-09-07 17:59:10'),
(10,7,8,'Lead Trainer','2026-09-16 09:04:09','2026-09-16 06:04:09','2026-09-16 06:04:09'),
(11,5,8,'Lead Trainer','2026-09-16 09:04:09','2026-09-16 06:04:09','2026-09-16 06:04:09');
/*!40000 ALTER TABLE `batch_trainers` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `branches`
--

DROP TABLE IF EXISTS `branches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `branches` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `organization_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(50) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `manager_id` bigint(20) unsigned DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `branches_organization_id_code_unique` (`organization_id`,`code`),
  UNIQUE KEY `branches_uuid_unique` (`uuid`),
  KEY `branches_manager_id_index` (`manager_id`),
  KEY `branches_status_index` (`status`),
  CONSTRAINT `branches_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `branches`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `branches` WRITE;
/*!40000 ALTER TABLE `branches` DISABLE KEYS */;
INSERT INTO `branches` VALUES
(1,'70876662-e74d-427c-bd2b-1945b7bfe069',1,'Nairobi Main Campus','NRB','Nairobi CBD','+254 711 000100','nairobi@iat.ac.ke',3,'active','2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(2,'8c513dd5-1b20-44be-8a68-305716799920',1,'Corporate Training','CPF','Hazina Towers , 1st floor Monorovia street-Off Utalii ,Next to View Park Towers','+254 725040588','sales@iat.ac.ke',4,'active','2026-09-07 17:59:09','2026-09-08 10:09:32',NULL),
(3,'66040d42-f75c-4580-90b2-b90f7b8bd762',1,'BURUBURUCampus','BRU','Meru Town','+254 711 000300','meru@iat.ac.ke',NULL,'active','2026-09-07 17:59:09','2026-09-08 08:22:38',NULL),
(4,'905541cf-df67-4289-a650-89125011bdf1',1,'Mombasa Coastal Campus','MSA','Nyali, Mombasa','+254 711 000400','mombasa@iat.ac.ke',NULL,'active','2026-09-07 17:59:09','2026-09-07 17:59:09',NULL);
/*!40000 ALTER TABLE `branches` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` bigint(20) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
INSERT INTO `cache` VALUES
('iat-lms-cache-spatie.permission.cache','a:3:{s:5:\"alias\";a:10:{s:1:\"a\";s:2:\"id\";s:1:\"b\";s:4:\"name\";s:1:\"c\";s:10:\"guard_name\";s:1:\"d\";s:10:\"group_name\";s:1:\"e\";s:12:\"display_name\";s:1:\"f\";s:11:\"description\";s:1:\"r\";s:5:\"roles\";s:1:\"j\";s:4:\"uuid\";s:1:\"k\";s:15:\"organization_id\";s:1:\"l\";s:19:\"is_system_protected\";}s:11:\"permissions\";a:79:{i:0;a:7:{s:1:\"a\";i:1;s:1:\"b\";s:10:\"users.view\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:5:\"Users\";s:1:\"e\";s:10:\"View Users\";s:1:\"f\";s:31:\"Can view users list and details\";s:1:\"r\";a:5:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:4;i:4;i:12;}}i:1;a:7:{s:1:\"a\";i:2;s:1:\"b\";s:12:\"users.create\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:5:\"Users\";s:1:\"e\";s:12:\"Create Users\";s:1:\"f\";s:20:\"Can create new users\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:3;i:2;i:4;}}i:2;a:7:{s:1:\"a\";i:3;s:1:\"b\";s:12:\"users.update\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:5:\"Users\";s:1:\"e\";s:12:\"Update Users\";s:1:\"f\";s:35:\"Can update user profiles and status\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:3;i:2;i:4;}}i:3;a:7:{s:1:\"a\";i:4;s:1:\"b\";s:12:\"users.delete\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:5:\"Users\";s:1:\"e\";s:12:\"Delete Users\";s:1:\"f\";s:21:\"Can soft-delete users\";s:1:\"r\";a:1:{i:0;i:1;}}i:4;a:7:{s:1:\"a\";i:5;s:1:\"b\";s:18:\"users.manage-roles\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:5:\"Users\";s:1:\"e\";s:17:\"Manage User Roles\";s:1:\"f\";s:38:\"Can assign and revoke roles from users\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:3;}}i:5;a:7:{s:1:\"a\";i:6;s:1:\"b\";s:10:\"roles.view\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:19:\"Roles & Permissions\";s:1:\"e\";s:10:\"View Roles\";s:1:\"f\";s:30:\"Can view roles and permissions\";s:1:\"r\";a:4:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:12;}}i:6;a:7:{s:1:\"a\";i:7;s:1:\"b\";s:12:\"roles.create\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:19:\"Roles & Permissions\";s:1:\"e\";s:12:\"Create Roles\";s:1:\"f\";s:31:\"Can create custom dynamic roles\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:3;}}i:7;a:7:{s:1:\"a\";i:8;s:1:\"b\";s:12:\"roles.update\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:19:\"Roles & Permissions\";s:1:\"e\";s:12:\"Update Roles\";s:1:\"f\";s:27:\"Can update role permissions\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:3;}}i:8;a:7:{s:1:\"a\";i:9;s:1:\"b\";s:12:\"roles.delete\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:19:\"Roles & Permissions\";s:1:\"e\";s:12:\"Delete Roles\";s:1:\"f\";s:23:\"Can delete custom roles\";s:1:\"r\";a:1:{i:0;i:1;}}i:9;a:7:{s:1:\"a\";i:10;s:1:\"b\";s:17:\"organization.view\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:12:\"Organization\";s:1:\"e\";s:17:\"View Organization\";s:1:\"f\";s:33:\"Can view organization information\";s:1:\"r\";a:4:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:12;}}i:10;a:7:{s:1:\"a\";i:11;s:1:\"b\";s:19:\"organization.update\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:12:\"Organization\";s:1:\"e\";s:19:\"Update Organization\";s:1:\"f\";s:44:\"Can update organization profile and branding\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:11;a:7:{s:1:\"a\";i:12;s:1:\"b\";s:13:\"branches.view\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:8:\"Branches\";s:1:\"e\";s:13:\"View Branches\";s:1:\"f\";s:27:\"Can view branch information\";s:1:\"r\";a:5:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:4;i:4;i:12;}}i:12;a:7:{s:1:\"a\";i:13;s:1:\"b\";s:15:\"branches.create\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:8:\"Branches\";s:1:\"e\";s:15:\"Create Branches\";s:1:\"f\";s:23:\"Can create new branches\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:3;}}i:13;a:7:{s:1:\"a\";i:14;s:1:\"b\";s:15:\"branches.update\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:8:\"Branches\";s:1:\"e\";s:15:\"Update Branches\";s:1:\"f\";s:25:\"Can update branch details\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:3;}}i:14;a:7:{s:1:\"a\";i:15;s:1:\"b\";s:15:\"branches.delete\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:8:\"Branches\";s:1:\"e\";s:15:\"Delete Branches\";s:1:\"f\";s:19:\"Can delete branches\";s:1:\"r\";a:1:{i:0;i:1;}}i:15;a:7:{s:1:\"a\";i:16;s:1:\"b\";s:26:\"branches.view-all-branches\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:8:\"Branches\";s:1:\"e\";s:22:\"View All Branches Data\";s:1:\"f\";s:52:\"Can access multi-branch data across the organization\";s:1:\"r\";a:4:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:12;}}i:16;a:7:{s:1:\"a\";i:17;s:1:\"b\";s:16:\"departments.view\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:11:\"Departments\";s:1:\"e\";s:16:\"View Departments\";s:1:\"f\";s:20:\"Can view departments\";s:1:\"r\";a:5:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:4;i:4;i:12;}}i:17;a:7:{s:1:\"a\";i:18;s:1:\"b\";s:18:\"departments.create\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:11:\"Departments\";s:1:\"e\";s:18:\"Create Departments\";s:1:\"f\";s:22:\"Can create departments\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:3;}}i:18;a:7:{s:1:\"a\";i:19;s:1:\"b\";s:18:\"departments.update\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:11:\"Departments\";s:1:\"e\";s:18:\"Update Departments\";s:1:\"f\";s:22:\"Can update departments\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:3;}}i:19;a:7:{s:1:\"a\";i:20;s:1:\"b\";s:18:\"departments.delete\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:11:\"Departments\";s:1:\"e\";s:18:\"Delete Departments\";s:1:\"f\";s:22:\"Can delete departments\";s:1:\"r\";a:1:{i:0;i:1;}}i:20;a:7:{s:1:\"a\";i:21;s:1:\"b\";s:16:\"positions.manage\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:9:\"Positions\";s:1:\"e\";s:16:\"Manage Positions\";s:1:\"f\";s:35:\"Can manage organizational positions\";s:1:\"r\";a:4:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:12;}}i:21;a:7:{s:1:\"a\";i:22;s:1:\"b\";s:13:\"students.view\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:8:\"Students\";s:1:\"e\";s:13:\"View Students\";s:1:\"f\";s:36:\"Can view student roster and profiles\";s:1:\"r\";a:11:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:4;i:4;i:5;i:5;i:6;i:6;i:7;i:7;i:8;i:8;i:9;i:9;i:10;i:10;i:12;}}i:22;a:7:{s:1:\"a\";i:23;s:1:\"b\";s:15:\"students.create\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:8:\"Students\";s:1:\"e\";s:15:\"Create Students\";s:1:\"f\";s:22:\"Can admit new students\";s:1:\"r\";a:5:{i:0;i:1;i:1;i:3;i:2;i:4;i:3;i:7;i:4;i:9;}}i:23;a:7:{s:1:\"a\";i:24;s:1:\"b\";s:15:\"students.update\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:8:\"Students\";s:1:\"e\";s:15:\"Update Students\";s:1:\"f\";s:48:\"Can update student details and guardian contacts\";s:1:\"r\";a:5:{i:0;i:1;i:1;i:3;i:2;i:4;i:3;i:7;i:4;i:9;}}i:24;a:7:{s:1:\"a\";i:25;s:1:\"b\";s:15:\"students.delete\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:8:\"Students\";s:1:\"e\";s:15:\"Delete Students\";s:1:\"f\";s:28:\"Can archive student profiles\";s:1:\"r\";a:1:{i:0;i:1;}}i:25;a:7:{s:1:\"a\";i:26;s:1:\"b\";s:26:\"students.view-all-branches\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:8:\"Students\";s:1:\"e\";s:26:\"View All Branches Students\";s:1:\"f\";s:37:\"Can view students across all branches\";s:1:\"r\";a:4:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:12;}}i:26;a:7:{s:1:\"a\";i:27;s:1:\"b\";s:10:\"staff.view\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:5:\"Staff\";s:1:\"e\";s:10:\"View Staff\";s:1:\"f\";s:24:\"Can view staff directory\";s:1:\"r\";a:5:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:4;i:4;i:12;}}i:27;a:7:{s:1:\"a\";i:28;s:1:\"b\";s:12:\"staff.create\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:5:\"Staff\";s:1:\"e\";s:12:\"Create Staff\";s:1:\"f\";s:17:\"Can onboard staff\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:3;}}i:28;a:7:{s:1:\"a\";i:29;s:1:\"b\";s:12:\"staff.update\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:5:\"Staff\";s:1:\"e\";s:12:\"Update Staff\";s:1:\"f\";s:25:\"Can update staff profiles\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:3;}}i:29;a:7:{s:1:\"a\";i:30;s:1:\"b\";s:12:\"staff.delete\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:5:\"Staff\";s:1:\"e\";s:12:\"Delete Staff\";s:1:\"f\";s:25:\"Can archive staff records\";s:1:\"r\";a:1:{i:0;i:1;}}i:30;a:7:{s:1:\"a\";i:31;s:1:\"b\";s:24:\"course-categories.manage\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:7:\"Courses\";s:1:\"e\";s:24:\"Manage Course Categories\";s:1:\"f\";s:39:\"Can create and manage course categories\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:3;i:2;i:5;}}i:31;a:7:{s:1:\"a\";i:32;s:1:\"b\";s:12:\"courses.view\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:7:\"Courses\";s:1:\"e\";s:12:\"View Courses\";s:1:\"f\";s:25:\"Can browse course catalog\";s:1:\"r\";a:9:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:4;i:4;i:5;i:5;i:6;i:6;i:7;i:7;i:9;i:8;i:12;}}i:32;a:7:{s:1:\"a\";i:33;s:1:\"b\";s:14:\"courses.create\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:7:\"Courses\";s:1:\"e\";s:14:\"Create Courses\";s:1:\"f\";s:29:\"Can create course definitions\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:3;i:2;i:5;}}i:33;a:7:{s:1:\"a\";i:34;s:1:\"b\";s:14:\"courses.update\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:7:\"Courses\";s:1:\"e\";s:14:\"Update Courses\";s:1:\"f\";s:38:\"Can edit course curriculum and lessons\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:3;i:2;i:5;}}i:34;a:7:{s:1:\"a\";i:35;s:1:\"b\";s:14:\"courses.delete\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:7:\"Courses\";s:1:\"e\";s:14:\"Delete Courses\";s:1:\"f\";s:29:\"Can delete or archive courses\";s:1:\"r\";a:1:{i:0;i:1;}}i:35;a:7:{s:1:\"a\";i:36;s:1:\"b\";s:14:\"modules.manage\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:7:\"Courses\";s:1:\"e\";s:14:\"Manage Modules\";s:1:\"f\";s:41:\"Can manage curriculum modules and reorder\";s:1:\"r\";a:4:{i:0;i:1;i:1;i:3;i:2;i:5;i:3;i:6;}}i:36;a:7:{s:1:\"a\";i:37;s:1:\"b\";s:14:\"lessons.manage\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:7:\"Courses\";s:1:\"e\";s:14:\"Manage Lessons\";s:1:\"f\";s:51:\"Can manage curriculum lessons, resources and videos\";s:1:\"r\";a:4:{i:0;i:1;i:1;i:3;i:2;i:5;i:3;i:6;}}i:37;a:7:{s:1:\"a\";i:38;s:1:\"b\";s:12:\"batches.view\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:7:\"Batches\";s:1:\"e\";s:12:\"View Batches\";s:1:\"f\";s:23:\"Can view cohort batches\";s:1:\"r\";a:9:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:4;i:4;i:5;i:5;i:6;i:6;i:7;i:7;i:9;i:8;i:12;}}i:38;a:7:{s:1:\"a\";i:39;s:1:\"b\";s:14:\"batches.create\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:7:\"Batches\";s:1:\"e\";s:14:\"Create Batches\";s:1:\"f\";s:31:\"Can schedule new course batches\";s:1:\"r\";a:4:{i:0;i:1;i:1;i:3;i:2;i:4;i:3;i:5;}}i:39;a:7:{s:1:\"a\";i:40;s:1:\"b\";s:14:\"batches.update\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:7:\"Batches\";s:1:\"e\";s:14:\"Update Batches\";s:1:\"f\";s:41:\"Can update batch schedules and capacities\";s:1:\"r\";a:4:{i:0;i:1;i:1;i:3;i:2;i:4;i:3;i:5;}}i:40;a:7:{s:1:\"a\";i:41;s:1:\"b\";s:14:\"batches.delete\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:7:\"Batches\";s:1:\"e\";s:14:\"Delete Batches\";s:1:\"f\";s:29:\"Can cancel or archive batches\";s:1:\"r\";a:1:{i:0;i:1;}}i:41;a:7:{s:1:\"a\";i:42;s:1:\"b\";s:23:\"batches.assign-trainers\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:7:\"Batches\";s:1:\"e\";s:21:\"Assign Batch Trainers\";s:1:\"f\";s:49:\"Can assign lead and assistant trainers to cohorts\";s:1:\"r\";a:4:{i:0;i:1;i:1;i:3;i:2;i:4;i:3;i:5;}}i:42;a:7:{s:1:\"a\";i:43;s:1:\"b\";s:16:\"enrollments.view\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:11:\"Enrollments\";s:1:\"e\";s:16:\"View Enrollments\";s:1:\"f\";s:33:\"Can view batch enrollment rosters\";s:1:\"r\";a:11:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:4;i:4;i:5;i:5;i:6;i:6;i:7;i:7;i:8;i:8;i:9;i:9;i:10;i:10;i:12;}}i:43;a:7:{s:1:\"a\";i:44;s:1:\"b\";s:18:\"enrollments.create\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:11:\"Enrollments\";s:1:\"e\";s:18:\"Create Enrollments\";s:1:\"f\";s:32:\"Can enroll students into batches\";s:1:\"r\";a:5:{i:0;i:1;i:1;i:3;i:2;i:4;i:3;i:7;i:4;i:9;}}i:44;a:7:{s:1:\"a\";i:45;s:1:\"b\";s:18:\"enrollments.update\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:11:\"Enrollments\";s:1:\"e\";s:18:\"Update Enrollments\";s:1:\"f\";s:44:\"Can modify enrollment status and completions\";s:1:\"r\";a:4:{i:0;i:1;i:1;i:3;i:2;i:4;i:3;i:9;}}i:45;a:7:{s:1:\"a\";i:46;s:1:\"b\";s:18:\"enrollments.delete\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:11:\"Enrollments\";s:1:\"e\";s:18:\"Delete Enrollments\";s:1:\"f\";s:30:\"Can cancel student enrollments\";s:1:\"r\";a:1:{i:0;i:1;}}i:46;a:7:{s:1:\"a\";i:47;s:1:\"b\";s:18:\"enrollments.review\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:11:\"Enrollments\";s:1:\"e\";s:18:\"Review Enrollments\";s:1:\"f\";s:48:\"Can approve enrollment admission at branch level\";s:1:\"r\";a:5:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:4;i:4;i:9;}}i:47;a:7:{s:1:\"a\";i:48;s:1:\"b\";s:25:\"enrollments.finance-clear\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:11:\"Enrollments\";s:1:\"e\";s:24:\"Clear Enrollment Finance\";s:1:\"f\";s:44:\"Can confirm that enrollment fees are cleared\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:3;i:2;i:8;}}i:48;a:7:{s:1:\"a\";i:49;s:1:\"b\";s:20:\"enrollments.complete\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:11:\"Enrollments\";s:1:\"e\";s:20:\"Complete Enrollments\";s:1:\"f\";s:38:\"Can approve academic course completion\";s:1:\"r\";a:5:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:5;i:4;i:10;}}i:49;a:7:{s:1:\"a\";i:50;s:1:\"b\";s:33:\"enrollments.certification-approve\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:11:\"Enrollments\";s:1:\"e\";s:31:\"Approve Certification Readiness\";s:1:\"f\";s:47:\"Can approve eligible students for certification\";s:1:\"r\";a:5:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:5;i:4;i:10;}}i:50;a:7:{s:1:\"a\";i:51;s:1:\"b\";s:12:\"finance.view\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:7:\"Finance\";s:1:\"e\";s:20:\"View Finance Records\";s:1:\"f\";s:43:\"Can view fees, balances and payment history\";s:1:\"r\";a:5:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:8;i:4;i:12;}}i:51;a:7:{s:1:\"a\";i:52;s:1:\"b\";s:14:\"finance.create\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:7:\"Finance\";s:1:\"e\";s:15:\"Record Payments\";s:1:\"f\";s:37:\"Can record confirmed student payments\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:3;i:2;i:8;}}i:52;a:7:{s:1:\"a\";i:53;s:1:\"b\";s:14:\"finance.update\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:7:\"Finance\";s:1:\"e\";s:22:\"Manage Finance Records\";s:1:\"f\";s:38:\"Can manage fees and reconcile payments\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:3;i:2;i:8;}}i:53;a:7:{s:1:\"a\";i:54;s:1:\"b\";s:12:\"classes.view\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:20:\"Classes & Attendance\";s:1:\"e\";s:12:\"View Classes\";s:1:\"f\";s:24:\"Can view class timetable\";s:1:\"r\";a:8:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:4;i:4;i:5;i:5;i:6;i:6;i:7;i:7;i:12;}}i:54;a:7:{s:1:\"a\";i:55;s:1:\"b\";s:14:\"classes.manage\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:20:\"Classes & Attendance\";s:1:\"e\";s:14:\"Manage Classes\";s:1:\"f\";s:38:\"Can schedule and manage class sessions\";s:1:\"r\";a:4:{i:0;i:1;i:1;i:3;i:2;i:4;i:3;i:6;}}i:55;a:7:{s:1:\"a\";i:56;s:1:\"b\";s:15:\"attendance.view\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:20:\"Classes & Attendance\";s:1:\"e\";s:15:\"View Attendance\";s:1:\"f\";s:27:\"Can view attendance records\";s:1:\"r\";a:7:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:4;i:4;i:5;i:5;i:6;i:6;i:12;}}i:56;a:7:{s:1:\"a\";i:57;s:1:\"b\";s:17:\"attendance.create\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:20:\"Classes & Attendance\";s:1:\"e\";s:15:\"Take Attendance\";s:1:\"f\";s:30:\"Can mark and submit attendance\";s:1:\"r\";a:4:{i:0;i:1;i:1;i:3;i:2;i:4;i:3;i:6;}}i:57;a:7:{s:1:\"a\";i:58;s:1:\"b\";s:17:\"attendance.update\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:20:\"Classes & Attendance\";s:1:\"e\";s:17:\"Update Attendance\";s:1:\"f\";s:28:\"Can adjust marked attendance\";s:1:\"r\";a:4:{i:0;i:1;i:1;i:3;i:2;i:4;i:3;i:6;}}i:58;a:7:{s:1:\"a\";i:59;s:1:\"b\";s:28:\"attendance.view-all-branches\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:20:\"Classes & Attendance\";s:1:\"e\";s:24:\"View Org-wide Attendance\";s:1:\"f\";s:39:\"Can view attendance across all branches\";s:1:\"r\";a:4:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:12;}}i:59;a:7:{s:1:\"a\";i:60;s:1:\"b\";s:16:\"assessments.view\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:11:\"Assessments\";s:1:\"e\";s:16:\"View Assessments\";s:1:\"f\";s:45:\"Can view quizzes, CATs, exams and assignments\";s:1:\"r\";a:8:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:4;i:4;i:5;i:5;i:6;i:6;i:10;i:7;i:12;}}i:60;a:7:{s:1:\"a\";i:61;s:1:\"b\";s:18:\"assessments.create\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:11:\"Assessments\";s:1:\"e\";s:18:\"Create Assessments\";s:1:\"f\";s:41:\"Can create assessments and question banks\";s:1:\"r\";a:4:{i:0;i:1;i:1;i:3;i:2;i:5;i:3;i:6;}}i:61;a:7:{s:1:\"a\";i:62;s:1:\"b\";s:18:\"assessments.update\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:11:\"Assessments\";s:1:\"e\";s:18:\"Update Assessments\";s:1:\"f\";s:38:\"Can edit questions, marks and settings\";s:1:\"r\";a:4:{i:0;i:1;i:1;i:3;i:2;i:5;i:3;i:6;}}i:62;a:7:{s:1:\"a\";i:63;s:1:\"b\";s:18:\"assessments.delete\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:11:\"Assessments\";s:1:\"e\";s:18:\"Delete Assessments\";s:1:\"f\";s:22:\"Can delete assessments\";s:1:\"r\";a:1:{i:0;i:1;}}i:63;a:7:{s:1:\"a\";i:64;s:1:\"b\";s:17:\"assessments.grade\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:11:\"Assessments\";s:1:\"e\";s:17:\"Grade Assessments\";s:1:\"f\";s:38:\"Can grade submissions and enter scores\";s:1:\"r\";a:6:{i:0;i:1;i:1;i:3;i:2;i:4;i:3;i:5;i:4;i:6;i:5;i:10;}}i:64;a:7:{s:1:\"a\";i:65;s:1:\"b\";s:17:\"certificates.view\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:12:\"Certificates\";s:1:\"e\";s:17:\"View Certificates\";s:1:\"f\";s:28:\"Can view issued certificates\";s:1:\"r\";a:7:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:4;i:4;i:5;i:5;i:10;i:6;i:12;}}i:65;a:7:{s:1:\"a\";i:66;s:1:\"b\";s:28:\"certificates.create-template\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:12:\"Certificates\";s:1:\"e\";s:28:\"Manage Certificate Templates\";s:1:\"f\";s:32:\"Can design certificate templates\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:3;i:2;i:5;}}i:66;a:7:{s:1:\"a\";i:67;s:1:\"b\";s:18:\"certificates.issue\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:12:\"Certificates\";s:1:\"e\";s:18:\"Issue Certificates\";s:1:\"f\";s:43:\"Can generate and issue student certificates\";s:1:\"r\";a:6:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:4;i:4;i:5;i:5;i:10;}}i:67;a:7:{s:1:\"a\";i:68;s:1:\"b\";s:19:\"certificates.revoke\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:12:\"Certificates\";s:1:\"e\";s:19:\"Revoke Certificates\";s:1:\"f\";s:31:\"Can revoke invalid certificates\";s:1:\"r\";a:1:{i:0;i:1;}}i:68;a:7:{s:1:\"a\";i:69;s:1:\"b\";s:12:\"reports.view\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:7:\"Reports\";s:1:\"e\";s:12:\"View Reports\";s:1:\"f\";s:40:\"Can view analytics and report dashboards\";s:1:\"r\";a:8:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:4;i:4;i:5;i:5;i:8;i:6;i:10;i:7;i:12;}}i:69;a:7:{s:1:\"a\";i:70;s:1:\"b\";s:14:\"reports.export\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:7:\"Reports\";s:1:\"e\";s:14:\"Export Reports\";s:1:\"f\";s:35:\"Can export reports to CSV/Excel/PDF\";s:1:\"r\";a:6:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:4;i:4;i:5;i:5;i:8;}}i:70;a:7:{s:1:\"a\";i:71;s:1:\"b\";s:25:\"reports.view-all-branches\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:7:\"Reports\";s:1:\"e\";s:25:\"View All Branches Reports\";s:1:\"f\";s:34:\"Can view organization-wide reports\";s:1:\"r\";a:4:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:12;}}i:71;a:7:{s:1:\"a\";i:72;s:1:\"b\";s:13:\"settings.view\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:15:\"Settings & Logs\";s:1:\"e\";s:13:\"View Settings\";s:1:\"f\";s:29:\"Can view system configuration\";s:1:\"r\";a:4:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:12;}}i:72;a:7:{s:1:\"a\";i:73;s:1:\"b\";s:15:\"settings.update\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:15:\"Settings & Logs\";s:1:\"e\";s:15:\"Update Settings\";s:1:\"f\";s:26:\"Can modify system settings\";s:1:\"r\";a:1:{i:0;i:1;}}i:73;a:7:{s:1:\"a\";i:74;s:1:\"b\";s:15:\"audit_logs.view\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:15:\"Settings & Logs\";s:1:\"e\";s:15:\"View Audit Logs\";s:1:\"f\";s:29:\"Can view security audit trail\";s:1:\"r\";a:4:{i:0;i:1;i:1;i:2;i:2;i:3;i:3;i:12;}}i:74;a:7:{s:1:\"a\";i:75;s:1:\"b\";s:21:\"student-portal.access\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:14:\"Student Portal\";s:1:\"e\";s:21:\"Access Student Portal\";s:1:\"f\";s:32:\"Can log into student portal area\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:11;i:2;i:12;}}i:75;a:7:{s:1:\"a\";i:76;s:1:\"b\";s:26:\"student-portal.view-grades\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:14:\"Student Portal\";s:1:\"e\";s:15:\"View Own Grades\";s:1:\"f\";s:36:\"Can view personal academic gradebook\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:11;i:2;i:12;}}i:76;a:7:{s:1:\"a\";i:77;s:1:\"b\";s:27:\"student-portal.take-quizzes\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:14:\"Student Portal\";s:1:\"e\";s:20:\"Take Quizzes & Exams\";s:1:\"f\";s:42:\"Can attempt quizzes and submit assignments\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:11;}}i:77;a:7:{s:1:\"a\";i:78;s:1:\"b\";s:15:\"courses.approve\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:7:\"Courses\";s:1:\"e\";s:15:\"Approve Courses\";s:1:\"f\";s:57:\"Can approve completed course curricula for student access\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:3;i:2;i:5;}}i:78;a:7:{s:1:\"a\";i:79;s:1:\"b\";s:17:\"audit_logs.manage\";s:1:\"c\";s:7:\"sanctum\";s:1:\"d\";s:15:\"Settings & Logs\";s:1:\"e\";s:17:\"Manage Audit Logs\";s:1:\"f\";s:38:\"Can export and clear audit log records\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}}s:5:\"roles\";a:12:{i:0;a:8:{s:1:\"a\";i:1;s:1:\"j\";s:36:\"44c94947-f093-4d7a-93d2-caf251c7fc87\";s:1:\"k\";N;s:1:\"b\";s:11:\"Super Admin\";s:1:\"e\";s:19:\"Super Administrator\";s:1:\"c\";s:7:\"sanctum\";s:1:\"f\";s:66:\"Full unrestricted access to all organization entities and settings\";s:1:\"l\";i:1;}i:1;a:8:{s:1:\"a\";i:2;s:1:\"j\";s:36:\"78c59b19-d42a-4109-9398-b87207d9c7d5\";s:1:\"k\";N;s:1:\"b\";s:3:\"CEO\";s:1:\"e\";s:23:\"Chief Executive Officer\";s:1:\"c\";s:7:\"sanctum\";s:1:\"f\";s:72:\"Executive governance, institutional KPIs and full multi-branch oversight\";s:1:\"l\";i:1;}i:2;a:8:{s:1:\"a\";i:3;s:1:\"j\";s:36:\"c348c28a-7cff-48a4-909e-9efd070a31b3\";s:1:\"k\";N;s:1:\"b\";s:13:\"Administrator\";s:1:\"e\";s:20:\"System Administrator\";s:1:\"c\";s:7:\"sanctum\";s:1:\"f\";s:61:\"Administrative operations across all departments and branches\";s:1:\"l\";i:1;}i:3;a:8:{s:1:\"a\";i:4;s:1:\"j\";s:36:\"5c1bc80b-38c3-4dab-81c3-2aade81655d9\";s:1:\"k\";N;s:1:\"b\";s:14:\"Branch Manager\";s:1:\"e\";s:14:\"Branch Manager\";s:1:\"c\";s:7:\"sanctum\";s:1:\"f\";s:56:\"Complete operational control over assigned campus branch\";s:1:\"l\";i:0;}i:4;a:8:{s:1:\"a\";i:12;s:1:\"j\";s:36:\"d42fb733-c1be-4c5d-b73f-0cf4b6799c1d\";s:1:\"k\";N;s:1:\"b\";s:5:\"Guest\";s:1:\"e\";s:26:\"Guest (Read-Only Observer)\";s:1:\"c\";s:7:\"sanctum\";s:1:\"f\";s:105:\"Read-only testing account with global visibility across all users, branches, academics and student portal\";s:1:\"l\";i:1;}i:5;a:8:{s:1:\"a\";i:5;s:1:\"j\";s:36:\"b05ab3b0-774c-4be7-b445-acb1a7bcd533\";s:1:\"k\";N;s:1:\"b\";s:16:\"Academic Manager\";s:1:\"e\";s:16:\"Academic Manager\";s:1:\"c\";s:7:\"sanctum\";s:1:\"f\";s:63:\"Oversees curriculum standards, assessments, cohorts and grading\";s:1:\"l\";i:0;}i:6;a:8:{s:1:\"a\";i:6;s:1:\"j\";s:36:\"dc875a4b-5392-4a25-93df-a12c83dc5c52\";s:1:\"k\";N;s:1:\"b\";s:7:\"Trainer\";s:1:\"e\";s:27:\"Course Trainer / Instructor\";s:1:\"c\";s:7:\"sanctum\";s:1:\"f\";s:83:\"Manages assigned cohorts, marks attendance, delivers lessons and grades assessments\";s:1:\"l\";i:0;}i:7;a:8:{s:1:\"a\";i:7;s:1:\"j\";s:36:\"99a8e21e-c43a-465c-a68b-99de012b0a90\";s:1:\"k\";N;s:1:\"b\";s:12:\"Front Office\";s:1:\"e\";s:27:\"Front Office / Receptionist\";s:1:\"c\";s:7:\"sanctum\";s:1:\"f\";s:72:\"Handles student enquiries, registration, admissions and basic scheduling\";s:1:\"l\";i:0;}i:8;a:8:{s:1:\"a\";i:8;s:1:\"j\";s:36:\"dd21f163-79c5-43f0-89f4-0487a0bd0b4b\";s:1:\"k\";N;s:1:\"b\";s:15:\"Finance Officer\";s:1:\"e\";s:26:\"Finance Officer / Accounts\";s:1:\"c\";s:7:\"sanctum\";s:1:\"f\";s:75:\"Records student payments, reconciles balances and clears enrollment finance\";s:1:\"l\";i:0;}i:9;a:8:{s:1:\"a\";i:9;s:1:\"j\";s:36:\"78991088-fe97-4f53-91db-f68ee82e23a6\";s:1:\"k\";N;s:1:\"b\";s:18:\"Admissions Officer\";s:1:\"e\";s:18:\"Admissions Officer\";s:1:\"c\";s:7:\"sanctum\";s:1:\"f\";s:72:\"Owns student intake, document checks, branch review and cohort admission\";s:1:\"l\";i:0;}i:10;a:8:{s:1:\"a\";i:10;s:1:\"j\";s:36:\"bc9a81fa-f559-45bd-a358-d96118a3f118\";s:1:\"k\";N;s:1:\"b\";s:21:\"Certification Officer\";s:1:\"e\";s:36:\"Examinations & Certification Officer\";s:1:\"c\";s:7:\"sanctum\";s:1:\"f\";s:68:\"Verifies completion outcomes and approves students for certification\";s:1:\"l\";i:0;}i:11;a:8:{s:1:\"a\";i:11;s:1:\"j\";s:36:\"6b67ecb5-016c-46db-ade5-3d747a47f540\";s:1:\"k\";N;s:1:\"b\";s:7:\"Student\";s:1:\"e\";s:7:\"Student\";s:1:\"c\";s:7:\"sanctum\";s:1:\"f\";s:74:\"Student portal access, enrolled classes, lessons, quizzes and certificates\";s:1:\"l\";i:1;}}}',1789821755);
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` bigint(20) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `certificate_templates`
--

DROP TABLE IF EXISTS `certificate_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `certificate_templates` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `organization_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL DEFAULT 'Certificate of Completion',
  `description` text DEFAULT NULL,
  `signatory_name` varchar(255) NOT NULL,
  `signatory_title` varchar(255) NOT NULL,
  `signature_image_path` varchar(255) DEFAULT NULL,
  `background_image_path` varchar(255) DEFAULT NULL,
  `requirements_config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`requirements_config`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `certificate_templates_uuid_unique` (`uuid`),
  KEY `certificate_templates_organization_id_foreign` (`organization_id`),
  CONSTRAINT `certificate_templates_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certificate_templates`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `certificate_templates` WRITE;
/*!40000 ALTER TABLE `certificate_templates` DISABLE KEYS */;
INSERT INTO `certificate_templates` VALUES
(1,'7cf45696-d826-4993-b891-0e4f4eaf1fdf',1,'IAT Professional Certification Template','Certificate of Professional Competency','Official certificate issued by Institute of Advanced Technology Ltd upon verified completion of curriculum, attendance threshold, and practical assessments.','Dr. Catherine Wanjiku Mutua','Chief Executive Officer & Academic Director',NULL,NULL,'{\"min_course_progress\":80,\"min_attendance\":75,\"min_final_score\":50}',1,'2026-09-07 17:59:10','2026-09-07 17:59:10',NULL);
/*!40000 ALTER TABLE `certificate_templates` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `certificates`
--

DROP TABLE IF EXISTS `certificates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `certificates` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `organization_id` bigint(20) unsigned NOT NULL,
  `certificate_number` varchar(100) NOT NULL,
  `verification_code` varchar(100) NOT NULL,
  `template_id` bigint(20) unsigned NOT NULL,
  `student_id` bigint(20) unsigned NOT NULL,
  `course_id` bigint(20) unsigned NOT NULL,
  `batch_id` bigint(20) unsigned NOT NULL,
  `issue_date` date NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `final_grade` varchar(10) DEFAULT NULL,
  `final_score` decimal(5,2) DEFAULT NULL,
  `pdf_path` varchar(255) DEFAULT NULL,
  `qr_code_path` varchar(255) DEFAULT NULL,
  `status` enum('issued','revoked') NOT NULL DEFAULT 'issued',
  `revoked_reason` text DEFAULT NULL,
  `revoked_at` timestamp NULL DEFAULT NULL,
  `revoked_by` bigint(20) unsigned DEFAULT NULL,
  `issued_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `certificates_uuid_unique` (`uuid`),
  UNIQUE KEY `certificates_certificate_number_unique` (`certificate_number`),
  UNIQUE KEY `certificates_verification_code_unique` (`verification_code`),
  KEY `certificates_organization_id_foreign` (`organization_id`),
  KEY `certificates_template_id_foreign` (`template_id`),
  KEY `certificates_course_id_foreign` (`course_id`),
  KEY `certificates_batch_id_foreign` (`batch_id`),
  KEY `certificates_revoked_by_foreign` (`revoked_by`),
  KEY `certificates_issued_by_foreign` (`issued_by`),
  KEY `certificates_verification_code_index` (`verification_code`),
  KEY `certificates_certificate_number_index` (`certificate_number`),
  KEY `certificates_student_id_course_id_index` (`student_id`,`course_id`),
  CONSTRAINT `certificates_batch_id_foreign` FOREIGN KEY (`batch_id`) REFERENCES `course_batches` (`id`),
  CONSTRAINT `certificates_course_id_foreign` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  CONSTRAINT `certificates_issued_by_foreign` FOREIGN KEY (`issued_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `certificates_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `certificates_revoked_by_foreign` FOREIGN KEY (`revoked_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `certificates_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `certificates_template_id_foreign` FOREIGN KEY (`template_id`) REFERENCES `certificate_templates` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certificates`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `certificates` WRITE;
/*!40000 ALTER TABLE `certificates` DISABLE KEYS */;
INSERT INTO `certificates` VALUES
(1,'93469951-60ea-4aa5-88e6-af86b1ed2886',1,'IAT-CERT-2026-00101','IAT-CCNA-98234',1,14,5,1,'2026-02-28',NULL,'A',89.00,'certificates/IAT-CERT-2026-00101.pdf',NULL,'issued',NULL,NULL,NULL,1,'2026-09-07 17:59:10','2026-09-07 17:59:10');
/*!40000 ALTER TABLE `certificates` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `class_sessions`
--

DROP TABLE IF EXISTS `class_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `class_sessions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `batch_id` bigint(20) unsigned NOT NULL,
  `trainer_id` bigint(20) unsigned DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `topic` varchar(255) DEFAULT NULL,
  `date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `delivery_mode` enum('Physical','Online','Hybrid') NOT NULL DEFAULT 'Physical',
  `location` varchar(255) DEFAULT NULL,
  `meeting_url` varchar(500) DEFAULT NULL,
  `status` enum('scheduled','in_progress','completed','cancelled') NOT NULL DEFAULT 'scheduled',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `class_sessions_uuid_unique` (`uuid`),
  KEY `class_sessions_batch_id_date_index` (`batch_id`,`date`),
  KEY `class_sessions_trainer_id_index` (`trainer_id`),
  CONSTRAINT `class_sessions_batch_id_foreign` FOREIGN KEY (`batch_id`) REFERENCES `course_batches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `class_sessions_trainer_id_foreign` FOREIGN KEY (`trainer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=155 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_sessions`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `class_sessions` WRITE;
/*!40000 ALTER TABLE `class_sessions` DISABLE KEYS */;
INSERT INTO `class_sessions` VALUES
(1,'2f877c89-e22d-48c2-86d8-3bd5a6fce294',1,6,'CCNA Class Session 1 - Network Topologies','Practical Lab and Concept Review #1','2026-01-19','09:00:00','12:00:00','Physical','Lab 3, Nairobi Main Campus','https://meet.google.com/xyz-ccna-class','completed',NULL,'2026-09-07 17:59:10','2026-09-07 17:59:10'),
(2,'a96f91cb-6396-4464-a2a1-ef53098d61d9',1,6,'CCNA Class Session 2 - IPv4 Subnetting','Practical Lab and Concept Review #2','2026-01-26','09:00:00','12:00:00','Hybrid','Lab 3, Nairobi Main Campus','https://meet.google.com/xyz-ccna-class','completed',NULL,'2026-09-07 17:59:10','2026-09-07 17:59:10'),
(3,'023cf3f0-05d3-4267-99c8-ab924b950d2b',1,6,'CCNA Class Session 3 - Switching & VLANs','Practical Lab and Concept Review #3','2026-02-02','09:00:00','12:00:00','Physical','Lab 3, Nairobi Main Campus','https://meet.google.com/xyz-ccna-class','completed',NULL,'2026-09-07 17:59:10','2026-09-07 17:59:10'),
(4,'a390e994-d12f-480d-889e-368465edc19e',1,6,'CCNA Class Session 4 - Switching & VLANs','Practical Lab and Concept Review #4','2026-02-09','09:00:00','12:00:00','Hybrid','Lab 3, Nairobi Main Campus','https://meet.google.com/xyz-ccna-class','completed',NULL,'2026-09-07 17:59:10','2026-09-07 17:59:10'),
(5,'9146a0e7-5b53-4f4c-bd2b-058f2a4f5b2c',1,6,'CCNA Class Session 5 - Switching & VLANs','Practical Lab and Concept Review #5','2026-02-16','09:00:00','12:00:00','Physical','Lab 3, Nairobi Main Campus','https://meet.google.com/xyz-ccna-class','completed',NULL,'2026-09-07 17:59:10','2026-09-07 17:59:10'),
(6,'2552e8b7-fa8b-4b96-85e0-06ac3e247bff',1,6,'CCNA Live Hands-On Lab: Dynamic Routing & OSPF','Configuring Single-Area OSPFv2 on Cisco 2901 Routers','2026-09-07','14:00:00','17:00:00','Physical','Advanced Cisco Network Lab',NULL,'scheduled',NULL,'2026-09-07 17:59:10','2026-09-07 17:59:10'),
(7,'76d2faf9-4f01-4ce3-8233-da24084218f4',7,6,'ACCA Applied Skills: TX - Taxation (Session #1)','Taxation Core Modules & Exam Techniques','2026-09-01','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','completed','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(8,'0ddd4c81-9fa3-40cc-9391-f5ed48076612',7,6,'ACCA Applied Skills: FR - Financial Reporting (Session #2)','Financial Reporting Core Modules & Exam Techniques','2026-09-02','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','completed','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(9,'96e78d2e-e101-4f45-8c70-37155fa04179',7,6,'ACCA Applied Skills: FM - Financial Management (Session #3)','Financial Management Core Modules & Exam Techniques','2026-09-03','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','completed','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(10,'236641f0-9f77-4353-a2f7-b331f26a18df',7,6,'ACCA Applied Skills: FR - Financial Reporting (Practical & Past Papers) (Session #4)','Financial Reporting (Practical & Past Papers) Core Modules & Exam Techniques','2026-09-04','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','completed','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(11,'00cc4b72-99f1-43fc-bc34-49cc742b3906',7,6,'ACCA Applied Skills: CL - Corporate & Business Law (Session #5)','Corporate & Business Law Core Modules & Exam Techniques','2026-09-07','06:00:00','08:00:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','completed','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(12,'9ac2a537-8503-4645-89aa-3c4592196c05',7,6,'ACCA Applied Skills: TX - Taxation (Session #6)','Taxation Core Modules & Exam Techniques','2026-09-08','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','completed','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(13,'65c6cc5f-0295-488e-8e15-d73baa5c652b',7,6,'ACCA Applied Skills: FR - Financial Reporting (Session #7)','Financial Reporting Core Modules & Exam Techniques','2026-09-09','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','completed','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(14,'a6a289bc-3413-4ab2-922e-5d9c0f0c74e5',7,6,'ACCA Applied Skills: FM - Financial Management (Session #8)','Financial Management Core Modules & Exam Techniques','2026-09-10','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','completed','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(15,'7719cf21-a484-49ec-bb22-980958f59c34',7,6,'ACCA Applied Skills: FR - Financial Reporting (Practical & Past Papers) (Session #9)','Financial Reporting (Practical & Past Papers) Core Modules & Exam Techniques','2026-09-11','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','completed','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(16,'d04b7d14-8439-48fd-9b09-3e26c8d7be9e',7,6,'ACCA Applied Skills: CL - Corporate & Business Law (Session #10)','Corporate & Business Law Core Modules & Exam Techniques','2026-09-14','06:00:00','08:00:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','completed','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(17,'0ce54d92-d505-44cd-805a-323ae737be57',7,6,'ACCA Applied Skills: TX - Taxation (Session #11)','Taxation Core Modules & Exam Techniques','2026-09-15','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','completed','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(18,'5fea2f9e-bf55-4c22-86af-63e8ad6dda49',7,6,'ACCA Applied Skills: FR - Financial Reporting (Session #12)','Financial Reporting Core Modules & Exam Techniques','2026-09-16','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(19,'767ab390-e6b0-4990-b686-52126bab5b6e',7,6,'ACCA Applied Skills: FM - Financial Management (Session #13)','Financial Management Core Modules & Exam Techniques','2026-09-17','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(20,'ef60b2bc-3b1a-4e1f-ac45-90fe09b50772',7,6,'ACCA Applied Skills: FR - Financial Reporting (Practical & Past Papers) (Session #14)','Financial Reporting (Practical & Past Papers) Core Modules & Exam Techniques','2026-09-18','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(21,'9b59ea77-1aad-4fa7-958d-df07b06c47c8',7,6,'ACCA Applied Skills: CL - Corporate & Business Law (Session #15)','Corporate & Business Law Core Modules & Exam Techniques','2026-09-21','06:00:00','08:00:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(22,'f43683ac-ccb4-4e9e-89f3-cc5145aa2ea4',7,6,'ACCA Applied Skills: TX - Taxation (Session #16)','Taxation Core Modules & Exam Techniques','2026-09-22','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(23,'2623ddff-ec79-484d-8d97-468cb2cdfd56',7,6,'ACCA Applied Skills: FR - Financial Reporting (Session #17)','Financial Reporting Core Modules & Exam Techniques','2026-09-23','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(24,'2b8443a7-38d2-4cd7-a63a-e0cef26f2a7d',7,6,'ACCA Applied Skills: FM - Financial Management (Session #18)','Financial Management Core Modules & Exam Techniques','2026-09-24','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(25,'c1ac9498-88f3-4cae-babc-a48839a83511',7,6,'ACCA Applied Skills: FR - Financial Reporting (Practical & Past Papers) (Session #19)','Financial Reporting (Practical & Past Papers) Core Modules & Exam Techniques','2026-09-25','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(26,'0f9b2546-c1a8-4311-b9af-d985a938f995',7,6,'ACCA Applied Skills: CL - Corporate & Business Law (Session #20)','Corporate & Business Law Core Modules & Exam Techniques','2026-09-28','06:00:00','08:00:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(27,'3257d344-a3f6-4d0e-893a-63ffe5ce42df',7,6,'ACCA Applied Skills: TX - Taxation (Session #21)','Taxation Core Modules & Exam Techniques','2026-09-29','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(28,'a85b4192-1637-465b-935e-465d4f809ce5',7,6,'ACCA Applied Skills: FR - Financial Reporting (Session #22)','Financial Reporting Core Modules & Exam Techniques','2026-09-30','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(29,'31d4b797-2341-4af8-bbba-9689f0d2fe89',7,6,'ACCA Applied Skills: FM - Financial Management (Session #23)','Financial Management Core Modules & Exam Techniques','2026-10-01','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(30,'23051b0c-4bf0-44c3-8d7b-ce19c7e90501',7,6,'ACCA Applied Skills: FR - Financial Reporting (Practical & Past Papers) (Session #24)','Financial Reporting (Practical & Past Papers) Core Modules & Exam Techniques','2026-10-02','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(31,'e610ec07-27b7-4735-ac36-e466ef75e744',7,6,'ACCA Applied Skills: CL - Corporate & Business Law (Session #25)','Corporate & Business Law Core Modules & Exam Techniques','2026-10-05','06:00:00','08:00:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(32,'e9ffb0dd-c9f4-4be6-a7c2-85a1e63ee7e6',7,6,'ACCA Applied Skills: TX - Taxation (Session #26)','Taxation Core Modules & Exam Techniques','2026-10-06','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(33,'3d535ff3-027f-49dc-a7ec-e6ad7b19dcb5',7,6,'ACCA Applied Skills: FR - Financial Reporting (Session #27)','Financial Reporting Core Modules & Exam Techniques','2026-10-07','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(34,'c4baeb5e-7d03-4af6-8ee0-c6336f1878fd',7,6,'ACCA Applied Skills: FM - Financial Management (Session #28)','Financial Management Core Modules & Exam Techniques','2026-10-08','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(35,'f8126f7d-90b3-46da-b391-c62cf526c367',7,6,'ACCA Applied Skills: FR - Financial Reporting (Practical & Past Papers) (Session #29)','Financial Reporting (Practical & Past Papers) Core Modules & Exam Techniques','2026-10-09','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(36,'18513779-5344-4be7-8288-4abf4924cebe',7,6,'ACCA Applied Skills: CL - Corporate & Business Law (Session #30)','Corporate & Business Law Core Modules & Exam Techniques','2026-10-12','06:00:00','08:00:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(37,'b49a0f0b-7b17-4482-b5a0-2e872fbbbcef',7,6,'ACCA Applied Skills: TX - Taxation (Session #31)','Taxation Core Modules & Exam Techniques','2026-10-13','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(38,'380699e9-d601-4905-bcbc-fdea6bbd192c',7,6,'ACCA Applied Skills: FR - Financial Reporting (Session #32)','Financial Reporting Core Modules & Exam Techniques','2026-10-14','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(39,'4fe33b45-2d8c-4d09-bace-66c6ea58d7f3',7,6,'ACCA Applied Skills: FM - Financial Management (Session #33)','Financial Management Core Modules & Exam Techniques','2026-10-15','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(40,'dc9f92c2-d5c9-4c13-ab8c-484a7f0ba207',7,6,'ACCA Applied Skills: FR - Financial Reporting (Practical & Past Papers) (Session #34)','Financial Reporting (Practical & Past Papers) Core Modules & Exam Techniques','2026-10-16','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(41,'e5866046-1976-47c0-84b6-ba0e633080d1',7,6,'ACCA Applied Skills: CL - Corporate & Business Law (Session #35)','Corporate & Business Law Core Modules & Exam Techniques','2026-10-19','06:00:00','08:00:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(42,'fd7dcb0c-7309-4677-998e-27f461e6c5d6',7,6,'ACCA Applied Skills: TX - Taxation (Session #36)','Taxation Core Modules & Exam Techniques','2026-10-20','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(43,'90a4573b-052d-4a73-a150-64548a5dd40e',7,6,'ACCA Applied Skills: FR - Financial Reporting (Session #37)','Financial Reporting Core Modules & Exam Techniques','2026-10-21','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(44,'30c842a7-f4db-4b85-a0d6-72d315bfe284',7,6,'ACCA Applied Skills: FM - Financial Management (Session #38)','Financial Management Core Modules & Exam Techniques','2026-10-22','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(45,'d066add3-cbc1-4f66-96d2-690bf67ae045',7,6,'ACCA Applied Skills: FR - Financial Reporting (Practical & Past Papers) (Session #39)','Financial Reporting (Practical & Past Papers) Core Modules & Exam Techniques','2026-10-23','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(46,'abcd867b-d22c-4b53-8b57-502c27ca297f',7,6,'ACCA Applied Skills: CL - Corporate & Business Law (Session #40)','Corporate & Business Law Core Modules & Exam Techniques','2026-10-26','06:00:00','08:00:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(47,'3b101d62-6a68-4163-89a1-c3f3a326a2a2',7,6,'ACCA Applied Skills: TX - Taxation (Session #41)','Taxation Core Modules & Exam Techniques','2026-10-27','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(48,'05a01625-3441-469d-a387-fbde79738f0a',7,6,'ACCA Applied Skills: FR - Financial Reporting (Session #42)','Financial Reporting Core Modules & Exam Techniques','2026-10-28','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(49,'4efb0334-a6cc-4507-b327-ddd79698353a',7,6,'ACCA Applied Skills: FM - Financial Management (Session #43)','Financial Management Core Modules & Exam Techniques','2026-10-29','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(50,'4d3f282c-7c71-472b-a95e-b550beda997b',7,6,'ACCA Applied Skills: FR - Financial Reporting (Practical & Past Papers) (Session #44)','Financial Reporting (Practical & Past Papers) Core Modules & Exam Techniques','2026-10-30','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(51,'167e2356-d21d-4412-a73c-3f9ce4e59f7f',7,6,'ACCA Applied Skills: CL - Corporate & Business Law (Session #45)','Corporate & Business Law Core Modules & Exam Techniques','2026-11-02','06:00:00','08:00:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(52,'b503fe22-fe57-4ce0-a970-9fb73639c4b3',7,6,'ACCA Applied Skills: TX - Taxation (Session #46)','Taxation Core Modules & Exam Techniques','2026-11-03','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(53,'d13bd25d-84fd-4c86-9c4f-2c4c83b16238',7,6,'ACCA Applied Skills: FR - Financial Reporting (Session #47)','Financial Reporting Core Modules & Exam Techniques','2026-11-04','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(54,'729c9b84-bea8-4925-92ed-6b5e5d6daa25',7,6,'ACCA Applied Skills: FM - Financial Management (Session #48)','Financial Management Core Modules & Exam Techniques','2026-11-05','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(55,'a0f35511-e70e-4dee-a67f-dd86c70ed2d5',7,6,'ACCA Applied Skills: FR - Financial Reporting (Practical & Past Papers) (Session #49)','Financial Reporting (Practical & Past Papers) Core Modules & Exam Techniques','2026-11-06','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(56,'f58bda51-d6e6-472d-98dd-a97af10036ab',7,6,'ACCA Applied Skills: CL - Corporate & Business Law (Session #50)','Corporate & Business Law Core Modules & Exam Techniques','2026-11-09','06:00:00','08:00:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(57,'30bccdaf-e3b2-4b74-b230-96f8e1f614b8',7,6,'ACCA Applied Skills: TX - Taxation (Session #51)','Taxation Core Modules & Exam Techniques','2026-11-10','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(58,'2f3b4409-3dfb-4430-a3a7-676ddfe002d2',7,6,'ACCA Applied Skills: FR - Financial Reporting (Session #52)','Financial Reporting Core Modules & Exam Techniques','2026-11-11','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(59,'fa921cdc-ac8c-4880-a08b-da3ac4f1a16f',7,6,'ACCA Applied Skills: FM - Financial Management (Session #53)','Financial Management Core Modules & Exam Techniques','2026-11-12','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(60,'875614df-3bf2-411f-8e5c-29c9b3f53ec4',7,6,'ACCA Applied Skills: FR - Financial Reporting (Practical & Past Papers) (Session #54)','Financial Reporting (Practical & Past Papers) Core Modules & Exam Techniques','2026-11-13','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(61,'d0d2789b-79c2-4a9e-8aa8-957d26b213d7',7,6,'ACCA Applied Skills: CL - Corporate & Business Law (Session #55)','Corporate & Business Law Core Modules & Exam Techniques','2026-11-16','06:00:00','08:00:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(62,'76ff69a2-1d8a-4ed8-9ded-f15e83628358',7,6,'ACCA Applied Skills: TX - Taxation (Session #56)','Taxation Core Modules & Exam Techniques','2026-11-17','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(63,'1d8bfefe-814c-4d08-9496-91608b8ffa5b',7,6,'ACCA Applied Skills: FR - Financial Reporting (Session #57)','Financial Reporting Core Modules & Exam Techniques','2026-11-18','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(64,'21a721c3-a59a-4765-aec7-a6ac34a7365f',7,6,'ACCA Applied Skills: FM - Financial Management (Session #58)','Financial Management Core Modules & Exam Techniques','2026-11-19','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','scheduled','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(65,'fa850c57-2703-4e44-a8d0-aa1484f74ef4',7,6,'ACCA Applied Skills: FR - Financial Reporting (Practical & Past Papers) (Session #59)','Financial Reporting (Practical & Past Papers) Core Modules & Exam Techniques','2026-11-20','17:30:00','20:30:00','Physical','Hall A - Applied Skills Center, Nairobi Main','https://meet.google.com/acca-applied-skills','completed','Timetable synced per ACCA Applied Skills schedule.','2026-09-16 06:04:10','2026-09-18 10:52:51'),
(66,'1a81b191-f569-4fd8-b199-c20111b18680',5,6,'ACCA FIA FA2: Session 1 - Maintaining Financial Records','Maintaining Financial Records Theoretical Foundations & Drills','2026-09-15','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','completed','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(67,'864c217e-d0f6-459f-b945-d1451d1cbaa6',5,6,'ACCA FIA FA2: Session 2 - Maintaining Financial Records','Maintaining Financial Records Practical Problem Sets & Ledger Postings','2026-09-15','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','completed','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(68,'d75043d7-065b-4178-be0f-99775d1feda5',5,6,'ACCA FIA FFA: Session 1 - Financial Accounting','Financial Accounting Theoretical Foundations & Drills','2026-09-16','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(69,'b0c144a7-9b8c-47df-92ce-37746b23d09d',5,6,'ACCA FIA FFA: Session 2 - Financial Accounting','Financial Accounting Practical Problem Sets & Ledger Postings','2026-09-16','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(70,'447586f6-bac2-471f-8cba-cc4f2b9f8058',5,6,'ACCA FIA FA2: Session 1 - Maintaining Financial Records','Maintaining Financial Records Theoretical Foundations & Drills','2026-09-17','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(71,'6ffa1320-5eae-4221-812e-eda6af25eec9',5,6,'ACCA FIA FA2: Session 2 - Maintaining Financial Records','Maintaining Financial Records Practical Problem Sets & Ledger Postings','2026-09-17','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(72,'0c8caae9-ce2b-47cb-9913-cc1f55f689b7',5,6,'ACCA FIA FA2: Session 1 - Maintaining Financial Records','Maintaining Financial Records Theoretical Foundations & Drills','2026-09-18','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(73,'d483fb0d-fc82-4928-9bd7-8f7f74f73504',5,6,'ACCA FIA FA2: Session 2 - Maintaining Financial Records','Maintaining Financial Records Practical Problem Sets & Ledger Postings','2026-09-18','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(74,'f7fba917-ba52-457a-bf84-2a80c0877c47',5,6,'ACCA FIA FFA: Session 1 - Financial Accounting','Financial Accounting Theoretical Foundations & Drills','2026-09-21','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(75,'ce77dce8-2f22-4321-8e7e-096bd5e05880',5,6,'ACCA FIA FFA: Session 2 - Financial Accounting','Financial Accounting Practical Problem Sets & Ledger Postings','2026-09-21','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(76,'3b642b9a-b27c-4414-a8bc-74c8583c2169',5,6,'ACCA FIA FA2: Session 1 - Maintaining Financial Records','Maintaining Financial Records Theoretical Foundations & Drills','2026-09-22','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(77,'79bfd35e-95e4-4f17-a6ab-1b759e6f4a2b',5,6,'ACCA FIA FA2: Session 2 - Maintaining Financial Records','Maintaining Financial Records Practical Problem Sets & Ledger Postings','2026-09-22','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(78,'5a8a950d-0115-40cf-a9c0-e61b810619f2',5,6,'ACCA FIA FFA: Session 1 - Financial Accounting','Financial Accounting Theoretical Foundations & Drills','2026-09-23','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(79,'cfb1f385-83e5-4856-8e41-c6b14a651810',5,6,'ACCA FIA FFA: Session 2 - Financial Accounting','Financial Accounting Practical Problem Sets & Ledger Postings','2026-09-23','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(80,'94481183-ead4-4618-9b8e-d53a823612b9',5,6,'ACCA FIA FA2: Session 1 - Maintaining Financial Records','Maintaining Financial Records Theoretical Foundations & Drills','2026-09-24','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(81,'02e3efc3-9a50-45ca-9af5-516665bb98de',5,6,'ACCA FIA FA2: Session 2 - Maintaining Financial Records','Maintaining Financial Records Practical Problem Sets & Ledger Postings','2026-09-24','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(82,'f516d3bd-6058-46d2-9c0e-627f461cf496',5,6,'ACCA FIA FA2: Session 1 - Maintaining Financial Records','Maintaining Financial Records Theoretical Foundations & Drills','2026-09-25','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(83,'9ccd49ed-1fb6-4ef6-91da-3cfcbda03447',5,6,'ACCA FIA FA2: Session 2 - Maintaining Financial Records','Maintaining Financial Records Practical Problem Sets & Ledger Postings','2026-09-25','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(84,'603597cc-bb7f-4834-b5a3-6a6da683d986',5,6,'ACCA FIA FFA: Session 1 - Financial Accounting','Financial Accounting Theoretical Foundations & Drills','2026-09-28','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(85,'27a3f3ad-0b82-466e-9588-a64753b70ac4',5,6,'ACCA FIA FFA: Session 2 - Financial Accounting','Financial Accounting Practical Problem Sets & Ledger Postings','2026-09-28','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(86,'99cc00f8-be2c-44dd-9fae-e3b734683ed7',5,6,'ACCA FIA FA2: Session 1 - Maintaining Financial Records','Maintaining Financial Records Theoretical Foundations & Drills','2026-09-29','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(87,'0d3217a6-1bf0-402f-a1f7-8a51cd3634b3',5,6,'ACCA FIA FA2: Session 2 - Maintaining Financial Records','Maintaining Financial Records Practical Problem Sets & Ledger Postings','2026-09-29','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(88,'ec3f8b20-6ee5-4db5-aeee-9d3a89bafab5',5,6,'ACCA FIA FFA: Session 1 - Financial Accounting','Financial Accounting Theoretical Foundations & Drills','2026-09-30','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(89,'a8738dfd-7ba4-4841-83e4-8fd679646b81',5,6,'ACCA FIA FFA: Session 2 - Financial Accounting','Financial Accounting Practical Problem Sets & Ledger Postings','2026-09-30','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(90,'c233146c-0ea5-4990-ba96-fd35f8b86432',5,6,'ACCA FIA FA2: Session 1 - Maintaining Financial Records','Maintaining Financial Records Theoretical Foundations & Drills','2026-10-01','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(91,'acb37d8e-2b40-41f6-9f49-9feb10e8cece',5,6,'ACCA FIA FA2: Session 2 - Maintaining Financial Records','Maintaining Financial Records Practical Problem Sets & Ledger Postings','2026-10-01','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(92,'65e7768b-2f9b-48ee-ab21-ff8772520653',5,6,'ACCA FIA FA2: Session 1 - Maintaining Financial Records','Maintaining Financial Records Theoretical Foundations & Drills','2026-10-02','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(93,'d2ec29fc-112a-4777-99d8-03b457fbeb10',5,6,'ACCA FIA FA2: Session 2 - Maintaining Financial Records','Maintaining Financial Records Practical Problem Sets & Ledger Postings','2026-10-02','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(94,'7492d1b6-0bd7-46fb-a94f-d286f628968f',5,6,'ACCA FIA FFA: Session 1 - Financial Accounting','Financial Accounting Theoretical Foundations & Drills','2026-10-05','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(95,'6d3b412b-7e2f-4b22-8fcd-fb725126d079',5,6,'ACCA FIA FFA: Session 2 - Financial Accounting','Financial Accounting Practical Problem Sets & Ledger Postings','2026-10-05','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(96,'6921458a-c070-4a92-831b-47a62e29c38c',5,6,'ACCA FIA FA2: Session 1 - Maintaining Financial Records','Maintaining Financial Records Theoretical Foundations & Drills','2026-10-06','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(97,'e63f685c-8afd-4d36-9020-771f15f05940',5,6,'ACCA FIA FA2: Session 2 - Maintaining Financial Records','Maintaining Financial Records Practical Problem Sets & Ledger Postings','2026-10-06','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(98,'d3498cb9-a438-45e6-bf9c-910daf8b4297',5,6,'ACCA FIA FFA: Session 1 - Financial Accounting','Financial Accounting Theoretical Foundations & Drills','2026-10-07','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(99,'6d59aef6-5391-4031-b93d-0e96975bad02',5,6,'ACCA FIA FFA: Session 2 - Financial Accounting','Financial Accounting Practical Problem Sets & Ledger Postings','2026-10-07','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(100,'fa43c951-7502-47f0-bfc7-1e8314b14349',5,6,'ACCA FIA FA2: Session 1 - Maintaining Financial Records','Maintaining Financial Records Theoretical Foundations & Drills','2026-10-08','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(101,'1d2ccedc-6400-436c-be42-c03a64cbced3',5,6,'ACCA FIA FA2: Session 2 - Maintaining Financial Records','Maintaining Financial Records Practical Problem Sets & Ledger Postings','2026-10-08','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(102,'ee7df98b-08df-4ee3-9e93-bd3f3702a933',5,6,'ACCA FIA FA2: Session 1 - Maintaining Financial Records','Maintaining Financial Records Theoretical Foundations & Drills','2026-10-09','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(103,'c7556e93-85fc-47cf-aa06-e99eb1754e5d',5,6,'ACCA FIA FA2: Session 2 - Maintaining Financial Records','Maintaining Financial Records Practical Problem Sets & Ledger Postings','2026-10-09','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(104,'6ec067e5-0ae3-40a5-aede-d9a0bcd013a6',5,6,'ACCA FIA FFA: Session 1 - Financial Accounting','Financial Accounting Theoretical Foundations & Drills','2026-10-12','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(105,'d6530906-387e-410a-846a-b09122da17d7',5,6,'ACCA FIA FFA: Session 2 - Financial Accounting','Financial Accounting Practical Problem Sets & Ledger Postings','2026-10-12','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(106,'b81d653e-7b4d-4a0a-9c30-efbfea0f13c6',5,6,'ACCA FIA FA2: Session 1 - Maintaining Financial Records','Maintaining Financial Records Theoretical Foundations & Drills','2026-10-13','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(107,'6b45aa68-dca6-4ac1-93ee-0f0d7f466c5b',5,6,'ACCA FIA FA2: Session 2 - Maintaining Financial Records','Maintaining Financial Records Practical Problem Sets & Ledger Postings','2026-10-13','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(108,'5cfcc90f-67e4-42ad-95f2-9cb9a082508d',5,6,'ACCA FIA FFA: Session 1 - Financial Accounting','Financial Accounting Theoretical Foundations & Drills','2026-10-14','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(109,'d3e33d5e-04e0-49c8-ad8f-948efa8f4939',5,6,'ACCA FIA FFA: Session 2 - Financial Accounting','Financial Accounting Practical Problem Sets & Ledger Postings','2026-10-14','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(110,'85880e4a-c289-4919-9aa7-be1b98810f8b',5,6,'ACCA FIA FA2: Session 1 - Maintaining Financial Records','Maintaining Financial Records Theoretical Foundations & Drills','2026-10-15','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(111,'8f3ef287-1a1f-454f-99dd-abf3a587af89',5,6,'ACCA FIA FA2: Session 2 - Maintaining Financial Records','Maintaining Financial Records Practical Problem Sets & Ledger Postings','2026-10-15','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(112,'a8fc0275-cab8-4ecc-8763-04864a48a5a3',5,6,'ACCA FIA FA2: Session 1 - Maintaining Financial Records','Maintaining Financial Records Theoretical Foundations & Drills','2026-10-16','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(113,'91f887cf-d27a-47ef-99fd-81a4465ff00e',5,6,'ACCA FIA FA2: Session 2 - Maintaining Financial Records','Maintaining Financial Records Practical Problem Sets & Ledger Postings','2026-10-16','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(114,'a0fb13ef-36bb-44bd-9cf9-0876804b045f',5,6,'ACCA FIA FFA: Session 1 - Financial Accounting','Financial Accounting Theoretical Foundations & Drills','2026-10-19','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(115,'fa9199a9-52db-4a83-a5f9-26f64a0b670c',5,6,'ACCA FIA FFA: Session 2 - Financial Accounting','Financial Accounting Practical Problem Sets & Ledger Postings','2026-10-19','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(116,'a09e4db0-95c9-4998-9299-7a478672e96a',5,6,'ACCA FIA FA2: Session 1 - Maintaining Financial Records','Maintaining Financial Records Theoretical Foundations & Drills','2026-10-20','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(117,'c903d189-5c4e-4dca-bb6a-524b1420642f',5,6,'ACCA FIA FA2: Session 2 - Maintaining Financial Records','Maintaining Financial Records Practical Problem Sets & Ledger Postings','2026-10-20','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(118,'b6df47d3-e9dc-4fc6-aa14-48a43d3d162e',5,6,'ACCA FIA FFA: Session 1 - Financial Accounting','Financial Accounting Theoretical Foundations & Drills','2026-10-21','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(119,'1bc7458c-13e3-4332-84ca-9f50eab6ecfc',5,6,'ACCA FIA FFA: Session 2 - Financial Accounting','Financial Accounting Practical Problem Sets & Ledger Postings','2026-10-21','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(120,'9d15e1e6-da2c-47e3-9429-2596897d723f',5,6,'ACCA FIA FA2: Session 1 - Maintaining Financial Records','Maintaining Financial Records Theoretical Foundations & Drills','2026-10-22','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(121,'1376d1fb-2fb2-4cb8-b8c0-d34ea47bb219',5,6,'ACCA FIA FA2: Session 2 - Maintaining Financial Records','Maintaining Financial Records Practical Problem Sets & Ledger Postings','2026-10-22','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(122,'1ee4d007-9b56-40f5-9246-4d7c0b027978',5,6,'ACCA FIA FA2: Session 1 - Maintaining Financial Records','Maintaining Financial Records Theoretical Foundations & Drills','2026-10-23','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(123,'61ba04a5-fd20-4e52-8890-f412ba298bfd',5,6,'ACCA FIA FA2: Session 2 - Maintaining Financial Records','Maintaining Financial Records Practical Problem Sets & Ledger Postings','2026-10-23','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(124,'37de9419-1696-4ef8-96cc-48c15956aad0',5,6,'ACCA FIA FFA: Session 1 - Financial Accounting','Financial Accounting Theoretical Foundations & Drills','2026-10-26','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(125,'44185524-d673-44d0-b9cf-7fa0570cd2a2',5,6,'ACCA FIA FFA: Session 2 - Financial Accounting','Financial Accounting Practical Problem Sets & Ledger Postings','2026-10-26','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(126,'92600bd8-6049-479e-8c85-0c6a3fabe749',5,6,'ACCA FIA FA2: Session 1 - Maintaining Financial Records','Maintaining Financial Records Theoretical Foundations & Drills','2026-10-27','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(127,'013bfbf7-de9a-43fa-bff8-d688baac80fb',5,6,'ACCA FIA FA2: Session 2 - Maintaining Financial Records','Maintaining Financial Records Practical Problem Sets & Ledger Postings','2026-10-27','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(128,'08c2717b-dfe6-4615-ae38-dab7ffc59587',5,6,'ACCA FIA FFA: Session 1 - Financial Accounting','Financial Accounting Theoretical Foundations & Drills','2026-10-28','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(129,'87da26ee-2a2a-426a-8059-4b7e364489b8',5,6,'ACCA FIA FFA: Session 2 - Financial Accounting','Financial Accounting Practical Problem Sets & Ledger Postings','2026-10-28','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(130,'36908d6c-f0df-4dad-8238-a625bb854aab',5,6,'ACCA FIA FA2: Session 1 - Maintaining Financial Records','Maintaining Financial Records Theoretical Foundations & Drills','2026-10-29','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(131,'86ca98cf-5230-49ca-9319-86c35e795ce7',5,6,'ACCA FIA FA2: Session 2 - Maintaining Financial Records','Maintaining Financial Records Practical Problem Sets & Ledger Postings','2026-10-29','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(132,'672a0ed1-b271-46a3-bc17-532222f2b90f',5,6,'ACCA FIA FA2: Session 1 - Maintaining Financial Records','Maintaining Financial Records Theoretical Foundations & Drills','2026-10-30','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(133,'04b3e876-f91d-4643-adf1-e2ec1fcd71bd',5,6,'ACCA FIA FA2: Session 2 - Maintaining Financial Records','Maintaining Financial Records Practical Problem Sets & Ledger Postings','2026-10-30','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(134,'8f94f831-fb93-4160-a979-ee64162515b9',5,6,'ACCA FIA FFA: Session 1 - Financial Accounting','Financial Accounting Theoretical Foundations & Drills','2026-11-02','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(135,'81b93bbe-3c75-48b8-82a9-311d81d560f1',5,6,'ACCA FIA FFA: Session 2 - Financial Accounting','Financial Accounting Practical Problem Sets & Ledger Postings','2026-11-02','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(136,'e0f7602b-5ca4-45e6-8a9c-ab614b244bec',5,6,'ACCA FIA FA2: Session 1 - Maintaining Financial Records','Maintaining Financial Records Theoretical Foundations & Drills','2026-11-03','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(137,'82b44aef-eb7d-40ad-ba73-752552e38388',5,6,'ACCA FIA FA2: Session 2 - Maintaining Financial Records','Maintaining Financial Records Practical Problem Sets & Ledger Postings','2026-11-03','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(138,'f2d747e0-3baf-40e3-8598-60c8bf9b4e11',5,6,'ACCA FIA FFA: Session 1 - Financial Accounting','Financial Accounting Theoretical Foundations & Drills','2026-11-04','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(139,'86a62a53-0bbd-45f5-bf23-854fbd309ede',5,6,'ACCA FIA FFA: Session 2 - Financial Accounting','Financial Accounting Practical Problem Sets & Ledger Postings','2026-11-04','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(140,'483c79e2-fdc5-44cf-a239-ba4617a956f6',5,6,'ACCA FIA FA2: Session 1 - Maintaining Financial Records','Maintaining Financial Records Theoretical Foundations & Drills','2026-11-05','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(141,'d4f5ac10-7b19-4246-be15-f3ff6506056c',5,6,'ACCA FIA FA2: Session 2 - Maintaining Financial Records','Maintaining Financial Records Practical Problem Sets & Ledger Postings','2026-11-05','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(142,'a893ee2c-3ab0-4b88-863a-f3b6bd62c5f8',5,6,'ACCA FIA FA2: Session 1 - Maintaining Financial Records','Maintaining Financial Records Theoretical Foundations & Drills','2026-11-06','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(143,'8c675be3-80b5-476f-a2ee-fa834d374b86',5,6,'ACCA FIA FA2: Session 2 - Maintaining Financial Records','Maintaining Financial Records Practical Problem Sets & Ledger Postings','2026-11-06','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(144,'01545de4-232e-4bfa-ba2e-6d55706bd8b4',5,6,'ACCA FIA FFA: Session 1 - Financial Accounting','Financial Accounting Theoretical Foundations & Drills','2026-11-09','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(145,'1acde94d-45cd-4777-bd22-45fc67f110b2',5,6,'ACCA FIA FFA: Session 2 - Financial Accounting','Financial Accounting Practical Problem Sets & Ledger Postings','2026-11-09','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(146,'cb0655a6-b128-4f08-b9e2-bb9a05a21023',5,6,'ACCA FIA FA2: Session 1 - Maintaining Financial Records','Maintaining Financial Records Theoretical Foundations & Drills','2026-11-10','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(147,'c83173d4-6917-4599-8804-92352c5a6c4b',5,6,'ACCA FIA FA2: Session 2 - Maintaining Financial Records','Maintaining Financial Records Practical Problem Sets & Ledger Postings','2026-11-10','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(148,'ac22f60d-b622-482f-ba13-9d0daec082ab',5,6,'ACCA FIA FFA: Session 1 - Financial Accounting','Financial Accounting Theoretical Foundations & Drills','2026-11-11','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(149,'4cb281d6-2d11-468b-9d10-21c4778cf898',5,6,'ACCA FIA FFA: Session 2 - Financial Accounting','Financial Accounting Practical Problem Sets & Ledger Postings','2026-11-11','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(150,'5f7e044e-1c61-4c2b-9c07-3ec8adc89f59',5,6,'ACCA FIA FA2: Session 1 - Maintaining Financial Records','Maintaining Financial Records Theoretical Foundations & Drills','2026-11-12','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(151,'451d2e08-27b5-4670-b1d7-e55dca5ccbde',5,6,'ACCA FIA FA2: Session 2 - Maintaining Financial Records','Maintaining Financial Records Practical Problem Sets & Ledger Postings','2026-11-12','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(152,'a5914a06-08ef-473e-a3d5-7cc0eb4107ef',5,6,'ACCA FIA FA2: Session 1 - Maintaining Financial Records','Maintaining Financial Records Theoretical Foundations & Drills','2026-11-13','08:00:00','10:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-morning','scheduled','FIA Session 1 (8:00-10:00 AM)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(153,'16d994f0-2970-4e81-b112-3073949db2a1',5,6,'ACCA FIA FA2: Session 2 - Maintaining Financial Records','Maintaining Financial Records Practical Problem Sets & Ledger Postings','2026-11-13','10:00:00','12:00:00','Physical','Room 204 - FIA Academy, Nairobi Main','https://meet.google.com/acca-fia-noon','scheduled','FIA Session 2 (10:00AM-12:00 NOON)','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(154,'efe86109-2add-4a8b-96ec-4155920fc0bc',5,1,'Fundamentals',NULL,'2026-09-21','06:00:00','08:00:00','Online','teams Virtual Campus','https://meet.google.com/xyz-iat-live-mumo','scheduled',NULL,'2026-09-18 10:50:51','2026-09-18 10:50:51');
/*!40000 ALTER TABLE `class_sessions` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `course_batches`
--

DROP TABLE IF EXISTS `course_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_batches` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `organization_id` bigint(20) unsigned NOT NULL,
  `course_id` bigint(20) unsigned NOT NULL,
  `branch_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(50) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `capacity` int(10) unsigned NOT NULL DEFAULT 30,
  `status` enum('upcoming','ongoing','completed','cancelled') NOT NULL DEFAULT 'upcoming',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `course_batches_branch_id_code_unique` (`branch_id`,`code`),
  UNIQUE KEY `course_batches_uuid_unique` (`uuid`),
  KEY `course_batches_organization_id_foreign` (`organization_id`),
  KEY `course_batches_course_id_foreign` (`course_id`),
  KEY `course_batches_start_date_end_date_index` (`start_date`,`end_date`),
  KEY `course_batches_status_index` (`status`),
  CONSTRAINT `course_batches_branch_id_foreign` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `course_batches_course_id_foreign` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  CONSTRAINT `course_batches_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_batches`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `course_batches` WRITE;
/*!40000 ALTER TABLE `course_batches` DISABLE KEYS */;
INSERT INTO `course_batches` VALUES
(1,'0d4d25f2-6a6b-4500-9347-3d88076188ab',1,5,1,'CCNA January-April 2026 Cohort','CCNA-2026-JAN-NRB','2026-01-15','2026-04-15',25,'ongoing','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(2,'b9284ec4-157f-441a-8340-64f17022cf3d',1,5,2,'CCNA January-April 2026 Cohort (Embu)','CCNA-2026-JAN-EMB','2026-01-15','2026-04-15',20,'completed','2026-09-07 17:59:10','2026-09-08 08:52:11',NULL),
(3,'9086f317-2b34-44a4-8bbb-bfc955325d7c',1,5,1,'CCNA April-July 2026 Cohort','CCNA-2026-APR-NRB','2026-04-15','2026-07-15',30,'upcoming','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(4,'ecfcd6e3-1e60-4593-ae3c-c4a1940f6a38',1,6,1,'Cybersecurity January-April 2026 Cohort','CYBER-2026-NRB','2026-01-15','2026-04-15',20,'ongoing','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(5,'6a237bc7-52dd-4968-96d4-a141c2f052ca',1,1,1,'ACCA FIA September 2026 Cohort','ACCA-FIA-2026-SEP-NRB','2026-09-14','2027-03-05',30,'upcoming','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(6,'5208d751-4a5a-4b60-989a-a0d76c3d0ea1',1,1,1,'ACCA Applied Knowledge September 2026 Cohort','ACCA-AK-2026-SEP-NRB','2026-09-14','2027-01-29',30,'upcoming','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(7,'bbf41bc7-d539-429f-b416-5c3b50192e6d',1,1,1,'ACCA Applied Skills September 2026 Cohort','ACCA-AS-2026-SEP-NRB','2026-09-14','2027-04-02',30,'upcoming','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(8,'bbe688f8-4e5f-4162-baf1-0223b48fa207',1,1,1,'ACCA Strategic Professional September 2026 Cohort','ACCA-SP-2026-SEP-NRB','2026-09-14','2027-02-05',25,'ongoing','2026-09-07 17:59:10','2026-09-18 10:57:56',NULL),
(9,'526e657f-ae4f-4720-81bf-6c3e28db72f3',1,9,1,'Integrate Generative AI Into Your Data Workflow (Cohort 2026)','GENAI-DATA-01-COHORT-2026','2026-08-14','2026-12-14',50,'ongoing','2026-09-14 09:15:42','2026-09-14 10:07:32','2026-09-14 10:07:32'),
(10,'5b910c93-c897-4f83-9a4c-21138350a86b',1,10,1,'Deploy and Manage Generative AI Models (Cohort 2026)','GENAI-MLOPS-02-COHORT-2026','2026-08-14','2026-12-14',50,'ongoing','2026-09-14 09:16:22','2026-09-14 10:07:32','2026-09-14 10:07:32'),
(11,'60ab79c6-4082-4642-9455-88366fc47d9d',1,11,1,'Build and Modernize Applications With Generative AI (Cohort 2026)','GENAI-APPS-03-COHORT-2026','2026-08-14','2026-12-14',50,'ongoing','2026-09-14 09:16:23','2026-09-14 10:07:32','2026-09-14 10:07:32'),
(12,'fcf27f69-1bc0-45e4-86af-03e0d6b0e56b',1,12,1,'Build a Certification Study Guide: ACE Exam Prep (Cohort 2026)','ACE-STUDY-04-COHORT-2026','2026-08-14','2026-12-14',50,'ongoing','2026-09-14 09:16:23','2026-09-14 10:07:32','2026-09-14 10:07:32'),
(13,'1f17f36d-096a-410a-bf8a-f3d83a045750',1,13,1,'Google DeepMind: 01 Build Your Own Small Language Models (Cohort 2026)','DEEPMIND-SLM-05-COHORT-2026','2026-08-14','2026-12-14',50,'ongoing','2026-09-14 09:16:23','2026-09-14 10:07:32','2026-09-14 10:07:32'),
(14,'396d9e50-0e12-43db-844f-3351c542f076',1,8,1,'Google Cloud Engineering Certificate (Cohort 2026)','GCP-CORE-COHORT-2026','2026-08-14','2026-12-14',50,'ongoing','2026-09-14 09:16:23','2026-09-14 10:07:32','2026-09-14 10:07:32');
/*!40000 ALTER TABLE `course_batches` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `course_categories`
--

DROP TABLE IF EXISTS `course_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_categories` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `organization_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `course_categories_organization_id_slug_unique` (`organization_id`,`slug`),
  UNIQUE KEY `course_categories_uuid_unique` (`uuid`),
  CONSTRAINT `course_categories_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_categories`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `course_categories` WRITE;
/*!40000 ALTER TABLE `course_categories` DISABLE KEYS */;
INSERT INTO `course_categories` VALUES
(1,'697efaed-f937-4593-a502-ab8a7a8124cc',1,'Networking & Infrastructure','networking-infrastructure','Enterprise networking, Cisco systems, and network architecture','active','2026-09-07 17:59:10','2026-09-07 17:59:10'),
(2,'32ff6de5-3e7c-4a90-84c1-7ad584a0c66c',1,'Cybersecurity & Defense','cybersecurity-defense','Information security, ethical hacking, and threat mitigation','active','2026-09-07 17:59:10','2026-09-07 17:59:10'),
(3,'1a1910bb-8241-406d-af40-67d64119bedd',1,'Software Engineering & Web','software-engineering-web','Modern full-stack web applications, APIs, and cloud services','active','2026-09-07 17:59:10','2026-09-07 17:59:10'),
(4,'5e339a8b-8f56-4ea2-9430-b2baa18e6832',1,'Data Analytics & AI','data-analytics-ai','Business intelligence, Power BI, SQL analytics, and visualization','active','2026-09-07 17:59:10','2026-09-07 17:59:10'),
(5,'4b00c2be-de75-438b-bf00-b4a1ed7f3375',1,'ACCA','acca','ACCA foundation, applied knowledge, applied skills, and strategic professional pathways','active','2026-09-07 17:59:10','2026-09-07 17:59:10'),
(6,'e29b0514-75a5-487d-b6e8-fb961bdc6736',1,'Google Cloud & Generative AI','google-cloud-ai','Google Cloud certifications, generative AI foundations, and machine learning infrastructure.','active','2026-09-14 09:15:41','2026-09-14 09:15:41');
/*!40000 ALTER TABLE `course_categories` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `course_feedbacks`
--

DROP TABLE IF EXISTS `course_feedbacks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_feedbacks` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `batch_id` bigint(20) unsigned NOT NULL,
  `student_id` bigint(20) unsigned NOT NULL,
  `trainer_id` bigint(20) unsigned DEFAULT NULL,
  `lesson_id` bigint(20) unsigned DEFAULT NULL,
  `unit_code` varchar(255) DEFAULT NULL,
  `period` enum('beginning','middle','exit','lesson','general') NOT NULL DEFAULT 'general',
  `rating` tinyint(3) unsigned NOT NULL DEFAULT 5,
  `category` varchar(255) NOT NULL DEFAULT 'Course Delivery',
  `comments` text DEFAULT NULL,
  `metrics` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metrics`)),
  `status` enum('submitted','reviewed','actioned') NOT NULL DEFAULT 'submitted',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `course_feedbacks_uuid_unique` (`uuid`),
  KEY `course_feedbacks_student_id_foreign` (`student_id`),
  KEY `course_feedbacks_lesson_id_foreign` (`lesson_id`),
  KEY `course_feedbacks_batch_id_period_index` (`batch_id`,`period`),
  KEY `course_feedbacks_trainer_id_created_at_index` (`trainer_id`,`created_at`),
  CONSTRAINT `course_feedbacks_batch_id_foreign` FOREIGN KEY (`batch_id`) REFERENCES `course_batches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `course_feedbacks_lesson_id_foreign` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE SET NULL,
  CONSTRAINT `course_feedbacks_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `course_feedbacks_trainer_id_foreign` FOREIGN KEY (`trainer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_feedbacks`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `course_feedbacks` WRITE;
/*!40000 ALTER TABLE `course_feedbacks` DISABLE KEYS */;
INSERT INTO `course_feedbacks` VALUES
(1,'7f937f52-fa2e-4899-ae9b-fb097b37ab08',7,13,6,NULL,'CL','beginning',5,'Trainer Delivery','The morning CL sessions at 6:00 AM are very sharp and well-structured. The lecturer explains corporate governance and contract law cases clearly with real Kenyan and UK case examples.','{\"content_clarity\":5,\"trainer_responsiveness\":5,\"pacing\":4,\"material_relevance\":5}','submitted','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(2,'dc1259fb-b079-42ef-9c75-84812789bc2b',7,14,6,NULL,'TX','beginning',4,'Curriculum & Resources','Taxation practice questions are very comprehensive. Would appreciate a bit more time spent on withholding tax calculation exercises during the evening classes.','{\"content_clarity\":4,\"trainer_responsiveness\":5,\"pacing\":4,\"material_relevance\":5}','submitted','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(3,'548f8621-b2ba-46f8-bec4-4f5ac05bec34',5,17,6,NULL,'FFA','beginning',5,'Learning Environment','FFA double-entry lectures are excellent! Breaking down into two 2-hour morning sessions makes grasping complex ledger accounts so much easier.','{\"content_clarity\":5,\"trainer_responsiveness\":5,\"pacing\":5,\"material_relevance\":5}','submitted','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(4,'ad2fd967-4600-44a7-a8ea-a8904454f8d3',5,18,6,NULL,'FA2','beginning',5,'Overall Satisfaction','Fantastic guidance on maintaining financial records and trial balances. The interactive problem sets in session 2 give us immediate practice.','{\"content_clarity\":5,\"trainer_responsiveness\":5,\"pacing\":5,\"material_relevance\":5}','submitted','2026-09-16 06:04:10','2026-09-16 06:04:10'),
(5,'a9284eac-4280-4e89-9f5d-2a2126874735',7,14,6,NULL,'CL','beginning',5,'Trainer Delivery','The morning CL sessions at 6:00 AM are very sharp and well-structured. The lecturer explains corporate governance and contract law cases clearly with real Kenyan and UK case examples.','{\"content_clarity\":5,\"trainer_responsiveness\":5,\"pacing\":4,\"material_relevance\":5}','submitted','2026-09-16 06:19:10','2026-09-16 06:19:10'),
(6,'1f53a045-1cea-482f-ab90-c45187bdd914',7,15,6,NULL,'TX','beginning',4,'Curriculum & Resources','Taxation practice questions are very comprehensive. Would appreciate a bit more time spent on withholding tax calculation exercises during the evening classes.','{\"content_clarity\":4,\"trainer_responsiveness\":5,\"pacing\":4,\"material_relevance\":5}','submitted','2026-09-16 06:19:10','2026-09-16 06:19:10');
/*!40000 ALTER TABLE `course_feedbacks` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `course_modules`
--

DROP TABLE IF EXISTS `course_modules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_modules` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `course_id` bigint(20) unsigned NOT NULL,
  `unit_id` bigint(20) unsigned DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `order` int(10) unsigned NOT NULL DEFAULT 1,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `course_modules_uuid_unique` (`uuid`),
  KEY `course_modules_course_id_order_index` (`course_id`,`order`),
  KEY `course_modules_unit_id_order_index` (`unit_id`,`order`),
  CONSTRAINT `course_modules_course_id_foreign` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `course_modules_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `course_units` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_modules`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `course_modules` WRITE;
/*!40000 ALTER TABLE `course_modules` DISABLE KEYS */;
INSERT INTO `course_modules` VALUES
(1,'7aeb25dd-8d2b-488c-b301-df2b5e55ec46',1,NULL,'Foundation Level — Recording and Management Information','Core bookkeeping and management information papers.',1,'active','2026-09-07 17:59:10','2026-09-11 02:17:25','2026-09-11 02:17:25'),
(2,'7ead478e-3fec-491e-99ce-401062a2796d',1,NULL,'Foundation Level — Financial Records and Cost Management','Maintaining records and managing costs and finance.',2,'active','2026-09-07 17:59:10','2026-09-11 02:17:25','2026-09-11 02:17:25'),
(3,'6aa0c108-0861-4979-92fd-1f847b553d66',1,NULL,'Fundamental Level — Accounting and Business Foundations','The three papers that prepare learners for the ACCA Diploma in Accounting and Business.',3,'active','2026-09-07 17:59:10','2026-09-11 02:17:25','2026-09-11 02:17:25'),
(4,'94495a9a-63e1-444c-ab2d-55b8a3d24238',2,NULL,'Applied Knowledge — Business and Technology','How organisations operate effectively, responsibly, and ethically.',1,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(5,'ecb49762-dd29-4e8d-948b-2ce5b95eeba9',2,NULL,'Applied Knowledge — Management Accounting','Planning, costing, budgeting, and decision-making with financial information.',2,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(6,'6a4937ff-6a9f-41e6-805a-208906ed1c73',2,NULL,'Applied Knowledge — Financial Accounting','Recording transactions and preparing reliable financial statements.',3,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(7,'c3835981-511c-429c-952f-cbf94356415f',3,NULL,'Applied Skills — Corporate and Business Law','Legal frameworks governing business and finance.',1,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(8,'e0432c12-7c2c-4bc4-b9ed-286db28cdb6b',3,NULL,'Applied Skills — Performance and Taxation','Performance management and taxation principles.',2,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(9,'bfedcd1e-7cc3-473f-a2b4-c53cf6085dd3',3,NULL,'Applied Skills — Reporting and Assurance','Financial reporting and audit and assurance practice.',3,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(10,'bf3a7309-cccd-4a3d-8654-399db086ccc2',3,NULL,'Applied Skills — Financial Management','Investment analysis, financing strategies, and dividend policies.',4,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(11,'0294d40b-023e-4af9-b515-b32785776f5a',4,NULL,'Strategic Professional — Essentials','Mandatory papers focused on leadership and strategic reporting.',1,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(12,'f9608081-d88e-4078-ac06-cc286875f6dc',4,NULL,'Strategic Professional — Options','Choose two specialist papers based on your career goals.',2,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(13,'a9a92de7-252e-4f4c-9d3e-7afb5eadc552',4,NULL,'Strategic Professional — Ethics and Practical Experience','Professional ethics, technical objectives, and the practical experience pathway.',3,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(14,'ac527c2a-ac4f-40eb-874e-a20448ed64ab',5,NULL,'Module 1 — Networking Fundamentals','OSI model, TCP/IP, network topologies, IPv4/IPv6 subnetting',1,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(15,'0faaa648-91b5-410e-885e-eacb06996313',5,NULL,'Module 2 — Switching Technologies & VLANs','Ethernet switching, 802.1Q trunking, Spanning Tree Protocol (STP), EtherChannel',2,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(16,'bcc9ac8e-d597-4356-ac2a-73b00fc78287',5,NULL,'Module 3 — IP Routing and OSPFv2','Static routing, default routes, Single-Area OSPFv2 dynamic routing',3,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(17,'71354145-f362-46a5-be0d-c9c7a1bd2cc3',5,NULL,'Module 4 — Network Security & Access Control Lists','Standard & Extended ACLs, Port Security, DHCP Snooping, Dynamic ARP Inspection',4,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(18,'e03e3d49-ca48-4b29-85ac-35bd6b033df4',6,NULL,'Module 1 — Threat Landscape and Cryptography','Understanding threat vectors, encryption, digital signatures, and PKI',1,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(19,'61382cbf-2587-4f5d-8b8f-6a96af7687c4',7,NULL,'Module 1 — Data Transformation with Power Query','Connecting to diverse sources, data cleaning, and ETL transformations',1,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(20,'a58adfea-c672-4b3b-8b9a-26f3db51d57b',1,1,'RQF Level 2',NULL,1,'active','2026-09-11 02:15:56','2026-09-11 02:15:56',NULL),
(21,'5556a001-3ba5-4ab4-a49a-281a789158da',1,1,'RQF Level 3',NULL,2,'active','2026-09-11 02:15:56','2026-09-11 02:15:56',NULL),
(22,'db7062e9-3859-4681-9845-90c8a6420e29',1,1,'RQF Level 4',NULL,3,'active','2026-09-11 02:15:56','2026-09-11 02:15:56',NULL),
(23,'328c2c12-33a8-4702-b51f-fb43582cdf90',1,2,'Applied Knowledge Papers',NULL,1,'active','2026-09-11 02:15:56','2026-09-11 02:15:56',NULL),
(24,'06b1b8ba-6cbc-43da-8a0b-e05d504c02dc',1,3,'Applied Skills Papers',NULL,1,'active','2026-09-11 02:15:56','2026-09-11 02:15:56',NULL),
(25,'876287f5-85d0-4ca7-ad3b-d2529105460b',1,4,'Essentials',NULL,1,'active','2026-09-11 02:15:56','2026-09-11 02:15:56',NULL),
(26,'b81ef453-846d-497d-a1ae-50e3b11823a7',1,4,'Options — Choose 2',NULL,2,'active','2026-09-11 02:15:56','2026-09-11 02:15:56',NULL),
(27,'5d363155-99d7-47ae-a71f-c3716b9f76ff',1,1,'module 1','start',4,'active','2026-09-11 03:25:58','2026-09-11 03:45:15','2026-09-11 03:45:15'),
(28,'7591aee7-f594-4f30-91d9-a941e8e19e35',8,NULL,'Introducing Google Cloud','Cloud computing overview, resource hierarchy, and Identity & Access Management.',1,'active','2026-09-14 09:15:42','2026-09-14 10:07:32','2026-09-14 10:07:32'),
(29,'bb89aad4-929c-44d7-bf2f-17d123fc3b7f',9,NULL,'Module 1 — Foundations & Core Principles','Core concepts, architectures, and practical setup guide.',1,'active','2026-09-14 09:15:42','2026-09-14 10:07:32','2026-09-14 10:07:32'),
(30,'f331d8c1-039d-48c6-bebb-4029ca82c7b9',10,NULL,'Module 1 — Foundations & Core Principles','Core concepts, architectures, and practical setup guide.',1,'active','2026-09-14 09:16:22','2026-09-14 10:07:32','2026-09-14 10:07:32'),
(31,'b5eae92e-aae3-49dd-91b3-6b2a782b808b',11,NULL,'Module 1 — Foundations & Core Principles','Core concepts, architectures, and practical setup guide.',1,'active','2026-09-14 09:16:22','2026-09-14 10:07:32','2026-09-14 10:07:32'),
(32,'0b909ca1-e21c-4fe1-8ee0-aa414f5bb5e5',12,NULL,'Module 1 — Foundations & Core Principles','Core concepts, architectures, and practical setup guide.',1,'active','2026-09-14 09:16:23','2026-09-14 10:07:32','2026-09-14 10:07:32'),
(33,'9a75489e-cbf8-4b24-9d8e-b1903f25386f',13,NULL,'Module 1 — Foundations & Core Principles','Core concepts, architectures, and practical setup guide.',1,'active','2026-09-14 09:16:23','2026-09-14 10:07:32','2026-09-14 10:07:32');
/*!40000 ALTER TABLE `course_modules` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `course_progress`
--

DROP TABLE IF EXISTS `course_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_progress` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `course_id` bigint(20) unsigned NOT NULL,
  `batch_id` bigint(20) unsigned NOT NULL,
  `progress_percentage` decimal(5,2) NOT NULL DEFAULT 0.00,
  `completed_lessons_count` int(10) unsigned NOT NULL DEFAULT 0,
  `total_lessons_count` int(10) unsigned NOT NULL DEFAULT 0,
  `completed_modules_count` int(10) unsigned NOT NULL DEFAULT 0,
  `total_modules_count` int(10) unsigned NOT NULL DEFAULT 0,
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `last_accessed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `course_progress_user_id_course_id_batch_id_unique` (`user_id`,`course_id`,`batch_id`),
  UNIQUE KEY `course_progress_uuid_unique` (`uuid`),
  KEY `course_progress_course_id_foreign` (`course_id`),
  KEY `course_progress_batch_id_foreign` (`batch_id`),
  KEY `course_progress_progress_percentage_index` (`progress_percentage`),
  CONSTRAINT `course_progress_batch_id_foreign` FOREIGN KEY (`batch_id`) REFERENCES `course_batches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `course_progress_course_id_foreign` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `course_progress_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_progress`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `course_progress` WRITE;
/*!40000 ALTER TABLE `course_progress` DISABLE KEYS */;
INSERT INTO `course_progress` VALUES
(1,'dc7c5e42-23b8-4c9a-962e-fb5a41792da2',13,5,1,75.00,6,8,3,4,'2026-08-13 17:59:10',NULL,'2026-09-14 05:09:43','2026-09-07 17:59:10','2026-09-14 05:09:43'),
(2,'4e350d00-a355-45b2-9e27-0ccb34f01835',14,5,1,85.00,6,8,4,4,'2026-08-13 17:59:10',NULL,'2026-09-07 15:59:10','2026-09-07 17:59:10','2026-09-07 17:59:10'),
(3,'0dd0a92b-8deb-4ef5-9217-7980d7bea18f',13,9,9,18.00,1,3,0,0,'2026-09-09 09:16:22',NULL,'2026-09-14 09:16:22','2026-09-14 09:16:22','2026-09-14 09:16:22'),
(4,'646f0f6e-fe11-41e9-8ba3-d40bfe0399e7',13,10,10,63.00,1,3,0,0,'2026-09-09 09:16:22',NULL,'2026-09-14 09:16:22','2026-09-14 09:16:22','2026-09-14 09:16:22'),
(5,'e5a40127-e45b-4bf6-a108-ed93b1dc19f1',13,11,11,54.00,1,3,0,0,'2026-09-09 09:16:23',NULL,'2026-09-14 09:16:23','2026-09-14 09:16:23','2026-09-14 09:16:23'),
(6,'03a2035f-7b0b-4c0a-9bb7-ae6ece34e6c1',13,12,12,33.00,1,3,0,0,'2026-09-09 09:16:23',NULL,'2026-09-14 09:16:23','2026-09-14 09:16:23','2026-09-14 09:16:23'),
(7,'4573f5b1-fc9d-46ab-bf5f-a50b467af9aa',13,13,13,23.00,1,3,0,0,'2026-09-09 09:16:23',NULL,'2026-09-14 09:16:23','2026-09-14 09:16:23','2026-09-14 09:16:23'),
(8,'64a438d6-503b-4246-86e3-b0d6a2fae3a7',13,8,14,33.33,1,3,0,0,'2026-09-07 09:16:23',NULL,'2026-09-14 09:16:23','2026-09-14 09:16:23','2026-09-14 09:16:23'),
(9,'e7fc521a-129a-4cd7-a39c-94479cb436ab',21,5,1,45.00,3,8,0,0,'2026-09-11 17:15:59',NULL,'2026-09-16 17:15:59','2026-09-16 17:15:59','2026-09-16 17:15:59');
/*!40000 ALTER TABLE `course_progress` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `course_units`
--

DROP TABLE IF EXISTS `course_units`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_units` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `course_id` bigint(20) unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `order` int(10) unsigned NOT NULL DEFAULT 1,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `course_units_uuid_unique` (`uuid`),
  KEY `course_units_course_id_order_index` (`course_id`,`order`),
  CONSTRAINT `course_units_course_id_foreign` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_units`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `course_units` WRITE;
/*!40000 ALTER TABLE `course_units` DISABLE KEYS */;
INSERT INTO `course_units` VALUES
(1,'6c2c873b-d499-4507-8fc8-195ca5122818',1,'Foundation / FIA','Foundation in Accountancy pathways.',1,'active','2026-09-11 02:15:56','2026-09-11 02:15:56',NULL),
(2,'c1a890fe-1750-4f24-a7b3-7ce3e143d3dd',1,'Applied Knowledge','The three applied knowledge papers.',2,'active','2026-09-11 02:15:56','2026-09-11 02:15:56',NULL),
(3,'faa8ee2c-f0e9-42aa-a9ba-9b860ee1617c',1,'Applied Skills','The six applied skills papers.',3,'active','2026-09-11 02:15:56','2026-09-11 02:15:56',NULL),
(4,'608ca2bc-c612-41a7-9684-c21bdce04655',1,'Strategic Professional','Essentials are mandatory. Choose two papers from Options.',4,'active','2026-09-11 02:15:56','2026-09-11 02:15:56',NULL);
/*!40000 ALTER TABLE `course_units` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `organization_id` bigint(20) unsigned NOT NULL,
  `category_id` bigint(20) unsigned NOT NULL,
  `learning_path_id` bigint(20) unsigned DEFAULT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `short_description` varchar(500) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `program_level` varchar(100) DEFAULT NULL,
  `entry_requirements` text DEFAULT NULL,
  `paper_count` int(10) unsigned DEFAULT NULL,
  `thumbnail_path` varchar(255) DEFAULT NULL,
  `duration` int(10) unsigned NOT NULL DEFAULT 40,
  `duration_unit` enum('hours','days','weeks','months') NOT NULL DEFAULT 'hours',
  `level` enum('Beginner','Intermediate','Advanced','Professional') NOT NULL DEFAULT 'Beginner',
  `status` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `courses_organization_id_code_unique` (`organization_id`,`code`),
  UNIQUE KEY `courses_uuid_unique` (`uuid`),
  KEY `courses_category_id_foreign` (`category_id`),
  KEY `courses_created_by_foreign` (`created_by`),
  KEY `courses_status_index` (`status`),
  KEY `courses_learning_path_id_foreign` (`learning_path_id`),
  CONSTRAINT `courses_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `course_categories` (`id`),
  CONSTRAINT `courses_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `courses_learning_path_id_foreign` FOREIGN KEY (`learning_path_id`) REFERENCES `learning_paths` (`id`) ON DELETE SET NULL,
  CONSTRAINT `courses_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES
(1,'27681eb8-1795-42ad-8b66-42551fb762eb',1,5,1,'ACCA','ACCA','ACCA Foundation, Applied Knowledge, Applied Skills, and Strategic Professional pathways.','A single ACCA programme containing every level, paper, and intake.','Foundation / FIA, Applied Knowledge, Applied Skills, Strategic Professional',NULL,22,NULL,24,'weeks','Professional','active',6,'2026-09-07 17:59:10','2026-09-14 10:30:54',NULL),
(2,'0962dd6e-ea59-4ce3-b3b0-2d9be85bacb5',1,5,NULL,'ACCA-APPLIED-KNOWLEDGE','ACCA Applied Knowledge','Develop essential technical, business, and accounting knowledge through three core ACCA papers.','The Applied Knowledge module is the first step in the ACCA qualification after the foundation pathway. It develops the core knowledge required for practical finance and accounting roles.',NULL,NULL,NULL,NULL,16,'weeks','Intermediate','archived',6,'2026-09-07 17:59:10','2026-09-11 02:15:56','2026-09-11 02:15:56'),
(3,'612a444e-98a5-4c3e-9149-bc21788b3de5',1,5,NULL,'ACCA-APPLIED-SKILLS','ACCA Applied Skills','Advance your accounting capability across law, performance, tax, reporting, audit, and financial management.','The Applied Skills module builds practical finance skills for professional accounting work and prepares learners for advanced strategic study.',NULL,NULL,NULL,NULL,28,'weeks','Advanced','archived',6,'2026-09-07 17:59:10','2026-09-11 02:15:56','2026-09-11 02:15:56'),
(4,'b55839ad-92e7-4db5-9333-689b2dd85344',1,5,NULL,'ACCA-STRATEGIC-PROFESSIONAL','ACCA Strategic Professional','Prepare for senior finance and business leadership through strategic reporting, leadership, and specialist options.','The Strategic Professional module develops the technical expertise, ethical standards, and leadership skills required for senior finance and business roles. It contains two essentials papers and two option papers.',NULL,NULL,NULL,NULL,20,'weeks','Professional','archived',6,'2026-09-07 17:59:10','2026-09-11 02:15:56','2026-09-11 02:15:56'),
(5,'a23d03b1-46c1-49ec-b22c-208a2c5e6ed0',1,1,2,'CCNA-200-301','Cisco Certified Network Associate (CCNA)','Master network fundamentals, IP connectivity, IP services, security, and automation.','This comprehensive CCNA training prepares students for modern enterprise network administration. Learn hands-on packet tracing, VLAN configuration, OSPF routing, ACLs, and cloud network architectures.',NULL,NULL,NULL,NULL,80,'hours','Intermediate','active',6,'2026-09-07 17:59:10','2026-09-14 10:30:54',NULL),
(6,'846e65ed-7efd-4f1c-9952-67a4abf1ec94',1,2,3,'CYBER-101','Cybersecurity Fundamentals & Threat Defense','Learn threat modeling, network defense, incident response, and ethical defense strategies.','A hands-on introduction to cyber threats, malware analysis, firewall security architectures, and security operations center (SOC) analysis.',NULL,NULL,NULL,NULL,60,'hours','Beginner','active',6,'2026-09-07 17:59:10','2026-09-14 10:30:54',NULL),
(7,'faaf89cf-0db0-4eab-bc2a-318d09decd4b',1,4,4,'BI-300','Data Analysis and Visualization Using Power BI','Transform raw datasets into actionable business intelligence dashboards with Power Query and DAX.','Comprehensive data analytics training focusing on ETL pipelines, star schema data modeling, advanced DAX calculations, and interactive visual storytelling.',NULL,NULL,NULL,NULL,45,'hours','Intermediate','active',6,'2026-09-07 17:59:10','2026-09-14 10:30:54',NULL),
(8,'1375530d-e211-4129-8249-a7730888b984',1,6,NULL,'GCP-CORE-INFRA','Google Cloud Fundamentals: Core Infrastructure','This course introduces important concepts and terminology for working with Google Cloud. Learn about computing, storage, networking, and security services.','Gain hands-on proficiency with Google Cloud console, Compute Engine, Kubernetes Engine, Cloud Storage, BigQuery, and IAM access management.',NULL,NULL,NULL,NULL,8,'hours','Intermediate','active',6,'2026-09-14 09:15:42','2026-09-14 10:07:32','2026-09-14 10:07:32'),
(9,'482191bb-cb56-41d4-a473-b73a55140b36',1,6,NULL,'GENAI-DATA-01','Integrate Generative AI Into Your Data Workflow','This learning path is for data professionals who want to integrate generative AI into their data workflows using BigQuery ML, Vertex AI, and vector search.','This learning path is for data professionals who want to integrate generative AI into their data workflows using BigQuery ML, Vertex AI, and vector search.',NULL,NULL,NULL,NULL,12,'hours','Intermediate','active',6,'2026-09-14 09:15:42','2026-09-14 10:07:32','2026-09-14 10:07:32'),
(10,'ed08f2f8-0795-4dbc-a5b7-8e5c18001190',1,6,NULL,'GENAI-MLOPS-02','Deploy and Manage Generative AI Models','This learning path provides a comprehensive introduction to machine learning operations (MLOps) with generative AI foundation models.','This learning path provides a comprehensive introduction to machine learning operations (MLOps) with generative AI foundation models.',NULL,NULL,NULL,NULL,18,'hours','Advanced','active',6,'2026-09-14 09:16:22','2026-09-14 10:07:32','2026-09-14 10:07:32'),
(11,'a3eb7095-c55d-4bda-ae7c-11b3e2f7951e',1,6,NULL,'GENAI-APPS-03','Build and Modernize Applications With Generative AI','This learning path is for application developers who want to enhance their projects with state-of-the-art generative AI capabilities.','This learning path is for application developers who want to enhance their projects with state-of-the-art generative AI capabilities.',NULL,NULL,NULL,NULL,23,'hours','Intermediate','active',6,'2026-09-14 09:16:22','2026-09-14 10:07:32','2026-09-14 10:07:32'),
(12,'42c3a47f-18f8-44cf-afb2-a20546728a5d',1,6,NULL,'ACE-STUDY-04','Build a Certification Study Guide: ACE Exam Prep','Prepare for the Google Cloud Associate Cloud Engineer exam with structured modules, hands-on practice, and exam simulations.','Prepare for the Google Cloud Associate Cloud Engineer exam with structured modules, hands-on practice, and exam simulations.',NULL,NULL,NULL,NULL,14,'hours','Intermediate','active',6,'2026-09-14 09:16:23','2026-09-14 10:07:32','2026-09-14 10:07:32'),
(13,'eb32096c-e336-4ca1-ae36-2bc3c2f665fe',1,6,NULL,'DEEPMIND-SLM-05','Google DeepMind: 01 Build Your Own Small Language Models','Learn architectural principles, attention mechanisms, fine-tuning, and quantization for efficient Small Language Models (SLMs).','Learn architectural principles, attention mechanisms, fine-tuning, and quantization for efficient Small Language Models (SLMs).',NULL,NULL,NULL,NULL,16,'hours','Professional','active',6,'2026-09-14 09:16:23','2026-09-14 10:07:32','2026-09-14 10:07:32');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `branch_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `departments_uuid_unique` (`uuid`),
  KEY `departments_branch_id_index` (`branch_id`),
  CONSTRAINT `departments_branch_id_foreign` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES
(1,'fd9df342-31f2-45db-81cf-c40cda5e2bb2',1,'Information Technology','IT-NRB',NULL,'active','2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(2,'4f0b5fe8-0203-42cb-91f3-c82faa87c3a3',1,'Business Management','BA-NRB',NULL,'active','2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(3,'57a93ac3-7095-4a5e-acb1-879b0e61d569',1,'Information Technology','IT-EMB',NULL,'active','2026-09-07 17:59:09','2026-09-08 07:05:15',NULL),
(4,'91928cbd-c94c-4db2-8e29-2d3ae0274ac1',3,'Information Technology','IT-MRU',NULL,'active','2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(5,'c326cc93-c3a3-4a88-ae0a-94bf050c9fe1',1,'Finance and Accounts Department','001',NULL,'active','2026-09-08 10:15:40','2026-09-08 10:17:24',NULL),
(6,'cd131237-5af7-482a-b9da-4e938eb85838',1,'Academic Affairs/Registrar','002',NULL,'active','2026-09-08 10:17:08','2026-09-08 10:17:08',NULL);
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `enrollment_finances`
--

DROP TABLE IF EXISTS `enrollment_finances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `enrollment_finances` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `enrollment_id` bigint(20) unsigned NOT NULL,
  `total_fee` decimal(12,2) NOT NULL DEFAULT 0.00,
  `amount_paid` decimal(12,2) NOT NULL DEFAULT 0.00,
  `currency` varchar(3) NOT NULL DEFAULT 'KES',
  `status` enum('pending','partially_paid','cleared','waived') NOT NULL DEFAULT 'pending',
  `cleared_by` bigint(20) unsigned DEFAULT NULL,
  `cleared_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `enrollment_finances_enrollment_id_unique` (`enrollment_id`),
  KEY `enrollment_finances_cleared_by_foreign` (`cleared_by`),
  KEY `enrollment_finances_status_index` (`status`),
  CONSTRAINT `enrollment_finances_cleared_by_foreign` FOREIGN KEY (`cleared_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `enrollment_finances_enrollment_id_foreign` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enrollment_finances`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `enrollment_finances` WRITE;
/*!40000 ALTER TABLE `enrollment_finances` DISABLE KEYS */;
INSERT INTO `enrollment_finances` VALUES
(1,6,0.00,0.00,'KES','pending',NULL,NULL,'2026-09-11 13:11:17','2026-09-11 13:11:17'),
(2,7,5000.00,5000.00,'KES','cleared',NULL,NULL,'2026-09-11 14:41:34','2026-09-11 16:22:29'),
(3,8,0.00,0.00,'KES','pending',NULL,NULL,'2026-09-12 02:11:09','2026-09-12 02:11:09'),
(4,9,0.00,0.00,'KES','pending',NULL,NULL,'2026-09-12 15:17:34','2026-09-12 15:17:34'),
(5,10,48000.00,48000.00,'KES','cleared',NULL,NULL,'2026-09-14 09:16:22','2026-09-14 09:16:22'),
(6,11,48000.00,48000.00,'KES','cleared',NULL,NULL,'2026-09-14 09:16:22','2026-09-14 09:16:22'),
(7,12,48000.00,48000.00,'KES','cleared',NULL,NULL,'2026-09-14 09:16:23','2026-09-14 09:16:23'),
(8,13,48000.00,48000.00,'KES','cleared',NULL,NULL,'2026-09-14 09:16:23','2026-09-14 09:16:23'),
(9,14,48000.00,48000.00,'KES','cleared',NULL,NULL,'2026-09-14 09:16:23','2026-09-14 09:16:23'),
(10,15,53000.00,53000.00,'KES','cleared',NULL,NULL,'2026-09-14 09:16:23','2026-09-14 09:16:23');
/*!40000 ALTER TABLE `enrollment_finances` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `enrollments`
--

DROP TABLE IF EXISTS `enrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `enrollments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `student_id` bigint(20) unsigned NOT NULL,
  `batch_id` bigint(20) unsigned NOT NULL,
  `enrollment_number` varchar(100) NOT NULL,
  `enrollment_date` date NOT NULL,
  `status` enum('Pending','Active','Completed','Suspended','Withdrawn','Cancelled') NOT NULL DEFAULT 'Active',
  `workflow_stage` varchar(40) NOT NULL DEFAULT 'registered',
  `workflow_updated_by` bigint(20) unsigned DEFAULT NULL,
  `workflow_updated_at` timestamp NULL DEFAULT NULL,
  `finance_cleared_by` bigint(20) unsigned DEFAULT NULL,
  `finance_cleared_at` timestamp NULL DEFAULT NULL,
  `completion_date` date DEFAULT NULL,
  `final_grade` varchar(10) DEFAULT NULL,
  `final_score` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `enrollments_uuid_unique` (`uuid`),
  UNIQUE KEY `enrollments_enrollment_number_unique` (`enrollment_number`),
  UNIQUE KEY `uk_active_student_batch` (`student_id`,`batch_id`,`deleted_at`),
  KEY `enrollments_batch_id_foreign` (`batch_id`),
  KEY `enrollments_status_index` (`status`),
  KEY `enrollments_workflow_updated_by_foreign` (`workflow_updated_by`),
  KEY `enrollments_finance_cleared_by_foreign` (`finance_cleared_by`),
  KEY `enrollments_workflow_stage_index` (`workflow_stage`),
  CONSTRAINT `enrollments_batch_id_foreign` FOREIGN KEY (`batch_id`) REFERENCES `course_batches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `enrollments_finance_cleared_by_foreign` FOREIGN KEY (`finance_cleared_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `enrollments_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `enrollments_workflow_updated_by_foreign` FOREIGN KEY (`workflow_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enrollments`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `enrollments` WRITE;
/*!40000 ALTER TABLE `enrollments` DISABLE KEYS */;
INSERT INTO `enrollments` VALUES
(1,'9679c813-2a3b-414d-a9e9-a7a71e281a77',13,1,'ENR-2026-001','2026-01-10','Active','branch_review',1,'2026-09-08 08:53:54',NULL,NULL,NULL,'A',80.20,'2026-09-07 17:59:10','2026-09-18 10:59:53',NULL),
(2,'45f25a4e-4540-411d-93b2-a90083e73288',14,1,'ENR-2026-002','2026-01-10','Active','branch_review',1,'2026-09-08 08:53:56',NULL,NULL,NULL,'A',89.40,'2026-09-07 17:59:10','2026-09-18 10:59:53',NULL),
(3,'4c16d9d7-59b0-44a1-9c62-f219fee5be75',15,2,'ENR-2026-003','2026-01-12','Active','branch_review',1,'2026-09-08 08:54:00',NULL,NULL,NULL,NULL,NULL,'2026-09-07 17:59:10','2026-09-08 08:54:00',NULL),
(4,'3de6f418-15fc-4e82-a633-44aed43da682',16,2,'ENR-2026-004','2026-01-12','Active','branch_review',1,'2026-09-08 08:54:02',NULL,NULL,NULL,NULL,NULL,'2026-09-07 17:59:10','2026-09-08 08:54:02',NULL),
(5,'75ff4cb7-f738-48f5-aa68-25f9192c8f67',17,4,'ENR-2026-005','2026-01-13','Active','branch_review',1,'2026-09-08 08:54:03',NULL,NULL,NULL,NULL,NULL,'2026-09-07 17:59:10','2026-09-08 08:54:03',NULL),
(6,'1b5b9eb6-2832-43e9-bf1c-8c46708f3be9',13,6,'ENR-2026-0006','2026-09-11','Pending','branch_review',1,'2026-09-11 14:24:46',NULL,NULL,NULL,NULL,NULL,'2026-09-11 13:11:17','2026-09-11 14:24:46',NULL),
(7,'9a23dbaa-d7ba-4d10-85e9-b042671f23b1',18,5,'ENR-2026-0007','2026-09-11','Active','in_training',1,'2026-09-16 06:43:41',1,'2026-09-11 16:24:41','2026-09-11',NULL,NULL,'2026-09-11 14:41:34','2026-09-16 06:43:41',NULL),
(8,'16070ab5-09d4-4c1f-abdd-7deea22a8cf6',19,6,'ENR-2026-0008','2026-09-12','Pending','branch_review',11,'2026-09-12 15:18:54',NULL,NULL,NULL,NULL,NULL,'2026-09-12 02:11:09','2026-09-12 15:18:54',NULL),
(9,'0eb8004f-a2d2-4d54-8b60-eaf1f2d251f5',20,6,'ENR-2026-0009','2026-09-12','Pending','branch_review',11,'2026-09-12 15:19:05',NULL,NULL,NULL,NULL,NULL,'2026-09-12 15:17:34','2026-09-12 15:19:05',NULL),
(10,'fb7e1462-9ede-4fd7-b441-c9c935d30214',13,9,'ENR-C26F7203','2026-09-04','Active','in_training',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-14 09:15:42','2026-09-14 10:07:32','2026-09-14 10:07:32'),
(11,'dbdc6d88-78e3-4c8b-9a9c-c3b4eeed3e09',13,10,'ENR-0244DCF2','2026-09-04','Active','in_training',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-14 09:16:22','2026-09-14 10:07:32','2026-09-14 10:07:32'),
(12,'eb6a46ae-f437-4099-a2d1-c7c71794896a',13,11,'ENR-49C821EB','2026-09-04','Active','in_training',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-14 09:16:23','2026-09-14 10:07:32','2026-09-14 10:07:32'),
(13,'2b65005a-18e8-4c16-9a6e-58b4b754dc67',13,12,'ENR-D23230BE','2026-09-04','Active','in_training',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-14 09:16:23','2026-09-14 10:07:32','2026-09-14 10:07:32'),
(14,'ffe45088-a650-4dae-b8ee-69b1c1a02a06',13,13,'ENR-80227B4C','2026-09-04','Active','in_training',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-14 09:16:23','2026-09-14 10:07:32','2026-09-14 10:07:32'),
(15,'ebe2fa7f-7806-46d6-8129-8aefeba3405b',13,14,'ENR-GCP-A3BF45','2026-08-31','Active','in_training',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-09-14 09:16:23','2026-09-14 10:07:32','2026-09-14 10:07:32'),
(16,'7c5829e5-a77b-40d0-bdc0-94d913b0336b',13,7,'ENR-ACCA-0013-7','2026-09-01','Active','in_training',1,'2026-09-16 06:04:09',NULL,NULL,NULL,NULL,NULL,'2026-09-16 06:04:09','2026-09-16 06:04:09',NULL),
(17,'9234f5f4-8717-4819-9ced-737b26ac49c0',14,7,'ENR-ACCA-0014-7','2026-09-01','Active','in_training',1,'2026-09-16 06:43:41',NULL,NULL,NULL,NULL,NULL,'2026-09-16 06:04:09','2026-09-16 06:43:41',NULL),
(18,'8ee1c2c8-e936-4689-917c-5e849cb67f41',15,7,'ENR-ACCA-0015-7','2026-09-01','Active','in_training',1,'2026-09-16 06:43:41',NULL,NULL,NULL,NULL,NULL,'2026-09-16 06:04:09','2026-09-16 06:43:41',NULL),
(19,'dc68620e-87a5-46c8-baa5-545ac4258bdb',16,7,'ENR-ACCA-0016-7','2026-09-01','Active','in_training',1,'2026-09-16 06:43:41',NULL,NULL,NULL,NULL,NULL,'2026-09-16 06:04:09','2026-09-16 06:43:41',NULL),
(20,'0464fae2-cd73-4cf3-b3da-06a2d566c58a',17,5,'ENR-ACCA-0017-5','2026-09-01','Active','in_training',1,'2026-09-16 06:43:41',NULL,NULL,NULL,NULL,NULL,'2026-09-16 06:04:09','2026-09-16 06:43:41',NULL),
(21,'9ffebb8c-4edc-4995-8aae-623d1429f4cb',19,5,'ENR-ACCA-0019-5','2026-09-01','Active','in_training',1,'2026-09-16 06:43:41',NULL,NULL,NULL,NULL,NULL,'2026-09-16 06:04:10','2026-09-16 06:43:41',NULL),
(22,'5acd192c-4f89-408b-9a5d-9dc0bab3e0a9',20,5,'ENR-ACCA-0020-5','2026-09-01','Active','in_training',1,'2026-09-16 06:04:10',NULL,NULL,NULL,NULL,NULL,'2026-09-16 06:04:10','2026-09-16 06:04:10',NULL),
(23,'d1e406e7-4007-4ce7-be22-a49d9620d69d',21,1,'ENR-GST-2026-001','2026-01-15','Active','enrolled',NULL,NULL,NULL,NULL,NULL,'F',0.00,'2026-09-16 17:14:43','2026-09-18 10:59:53',NULL);
/*!40000 ALTER TABLE `enrollments` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` varchar(255) NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `finance_payments`
--

DROP TABLE IF EXISTS `finance_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `finance_payments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `enrollment_finance_id` bigint(20) unsigned NOT NULL,
  `receipt_number` varchar(100) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'KES',
  `method` enum('cash','mpesa','bank_transfer','card','other') NOT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `status` enum('confirmed','voided') NOT NULL DEFAULT 'confirmed',
  `recorded_by` bigint(20) unsigned NOT NULL,
  `paid_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `finance_payments_receipt_number_unique` (`receipt_number`),
  KEY `finance_payments_recorded_by_foreign` (`recorded_by`),
  KEY `finance_payments_enrollment_finance_id_status_index` (`enrollment_finance_id`,`status`),
  CONSTRAINT `finance_payments_enrollment_finance_id_foreign` FOREIGN KEY (`enrollment_finance_id`) REFERENCES `enrollment_finances` (`id`) ON DELETE CASCADE,
  CONSTRAINT `finance_payments_recorded_by_foreign` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finance_payments`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `finance_payments` WRITE;
/*!40000 ALTER TABLE `finance_payments` DISABLE KEYS */;
INSERT INTO `finance_payments` VALUES
(1,2,'RCT-20260911192229-948',5000.00,'KES','mpesa',NULL,'confirmed',10,'2026-09-11 16:22:29','2026-09-11 16:22:29','2026-09-11 16:22:29');
/*!40000 ALTER TABLE `finance_payments` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `grading_scale_ranges`
--

DROP TABLE IF EXISTS `grading_scale_ranges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `grading_scale_ranges` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `scheme_id` bigint(20) unsigned NOT NULL,
  `grade_letter` varchar(10) NOT NULL,
  `min_percentage` decimal(5,2) NOT NULL,
  `max_percentage` decimal(5,2) NOT NULL,
  `gpa_point` decimal(3,2) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_grade_scheme_range` (`scheme_id`,`min_percentage`,`max_percentage`),
  CONSTRAINT `grading_scale_ranges_scheme_id_foreign` FOREIGN KEY (`scheme_id`) REFERENCES `grading_schemes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grading_scale_ranges`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `grading_scale_ranges` WRITE;
/*!40000 ALTER TABLE `grading_scale_ranges` DISABLE KEYS */;
INSERT INTO `grading_scale_ranges` VALUES
(1,1,'A',80.00,100.00,4.00,'Distinction / Excellent','2026-09-07 17:59:10','2026-09-07 17:59:10'),
(2,1,'B',70.00,79.99,3.00,'Credit / Very Good','2026-09-07 17:59:10','2026-09-07 17:59:10'),
(3,1,'C',60.00,69.99,2.00,'Pass / Good','2026-09-07 17:59:10','2026-09-07 17:59:10'),
(4,1,'D',50.00,59.99,1.00,'Satisfactory','2026-09-07 17:59:10','2026-09-07 17:59:10'),
(5,1,'F',0.00,49.99,0.00,'Fail / Unsatisfactory','2026-09-07 17:59:10','2026-09-07 17:59:10');
/*!40000 ALTER TABLE `grading_scale_ranges` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `grading_schemes`
--

DROP TABLE IF EXISTS `grading_schemes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `grading_schemes` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `organization_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `grading_schemes_uuid_unique` (`uuid`),
  KEY `grading_schemes_organization_id_foreign` (`organization_id`),
  CONSTRAINT `grading_schemes_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grading_schemes`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `grading_schemes` WRITE;
/*!40000 ALTER TABLE `grading_schemes` DISABLE KEYS */;
INSERT INTO `grading_schemes` VALUES
(1,'19c7d346-228d-4a43-96f9-5d5b1e06483c',1,'Standard Academic Percentage Scheme (Kenya TVET / Higher Ed)',1,'2026-09-07 17:59:10','2026-09-07 17:59:10');
/*!40000 ALTER TABLE `grading_schemes` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `guardians`
--

DROP TABLE IF EXISTS `guardians`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `guardians` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `organization_id` bigint(20) unsigned NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) NOT NULL,
  `address` text DEFAULT NULL,
  `occupation` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `guardians_uuid_unique` (`uuid`),
  KEY `guardians_organization_id_foreign` (`organization_id`),
  CONSTRAINT `guardians_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guardians`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `guardians` WRITE;
/*!40000 ALTER TABLE `guardians` DISABLE KEYS */;
INSERT INTO `guardians` VALUES
(1,'2731a622-44c2-4348-b2a5-ece3632fc7f4',1,'Joseph','Kariuki','j.kariuki@guardian.test','+254 720 999111','Westlands, Nairobi','Business Consultant','2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(2,'c8fc9ff9-fcd3-43af-855b-a15975cfc0c4',1,'Mary','Wambui','m.wambui@guardian.test','+254 720 999222','Embu Town','Education Officer','2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(3,'81ebd84f-9049-4d13-9721-cfdef93d32e3',1,'Susan','Guardian',NULL,'+254 754671898',NULL,NULL,'2026-09-11 14:41:34','2026-09-11 14:41:34',NULL);
/*!40000 ALTER TABLE `guardians` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` smallint(5) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `learning_paths`
--

DROP TABLE IF EXISTS `learning_paths`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `learning_paths` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `organization_id` bigint(20) unsigned NOT NULL,
  `category_id` bigint(20) unsigned DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `duration` int(10) unsigned NOT NULL DEFAULT 40,
  `duration_unit` enum('hours','weeks','months') NOT NULL DEFAULT 'hours',
  `level` enum('Beginner','Intermediate','Advanced','Professional') NOT NULL DEFAULT 'Intermediate',
  `status` enum('draft','active','archived') NOT NULL DEFAULT 'active',
  `order` int(10) unsigned NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `learning_paths_uuid_unique` (`uuid`),
  UNIQUE KEY `learning_paths_slug_unique` (`slug`),
  KEY `learning_paths_organization_id_foreign` (`organization_id`),
  KEY `learning_paths_category_id_foreign` (`category_id`),
  CONSTRAINT `learning_paths_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `course_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `learning_paths_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `learning_paths`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `learning_paths` WRITE;
/*!40000 ALTER TABLE `learning_paths` DISABLE KEYS */;
INSERT INTO `learning_paths` VALUES
(1,'57ee2618-6ea7-43d0-bbf1-e605c9b0319a',1,5,'Chartered Accounting & Financial Strategy Track','chartered-accounting-financial-strategy-track','Master the complete ACCA qualification pipeline from financial accounting fundamentals to strategic business reporting, taxation, and advanced audit.',360,'hours','Professional','active',1,'2026-09-14 10:30:54','2026-09-14 10:30:54',NULL),
(2,'d8300734-1739-4b17-93ae-af56d215b684',1,1,'Enterprise Network Engineering & Infrastructure Track','enterprise-network-engineering-infrastructure-track','Comprehensive pathway covering enterprise network architecture, Cisco routing and switching protocols, VLAN management, and secure perimeter infrastructure.',120,'hours','Intermediate','active',2,'2026-09-14 10:30:54','2026-09-14 10:30:54',NULL),
(3,'4324ce2c-fc4e-450b-bfd8-02208aabc820',1,2,'Cybersecurity Operations & Threat Defense Track','cybersecurity-operations-threat-defense-track','End-to-end security operations track covering network vulnerability analysis, cryptographic safeguards, penetration testing, and defensive incident response.',80,'hours','Beginner','active',3,'2026-09-14 10:30:54','2026-09-14 10:30:54',NULL),
(4,'c41dbcdd-15cb-4305-a79c-8ac21b93ce20',1,4,'Business Intelligence & Data Analytics Track','business-intelligence-data-analytics-track','Practical pathway for data analysts and business decision-makers using Power BI, DAX modeling, automated ETL pipelines, and executive dashboards.',60,'hours','Intermediate','active',4,'2026-09-14 10:30:54','2026-09-14 10:30:54',NULL);
/*!40000 ALTER TABLE `learning_paths` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `lesson_progress`
--

DROP TABLE IF EXISTS `lesson_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `lesson_progress` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `lesson_id` bigint(20) unsigned NOT NULL,
  `batch_id` bigint(20) unsigned NOT NULL,
  `status` enum('not_started','in_progress','completed') NOT NULL DEFAULT 'not_started',
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `last_accessed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `lesson_progress_user_id_lesson_id_batch_id_unique` (`user_id`,`lesson_id`,`batch_id`),
  UNIQUE KEY `lesson_progress_uuid_unique` (`uuid`),
  KEY `lesson_progress_lesson_id_foreign` (`lesson_id`),
  KEY `lesson_progress_batch_id_foreign` (`batch_id`),
  CONSTRAINT `lesson_progress_batch_id_foreign` FOREIGN KEY (`batch_id`) REFERENCES `course_batches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lesson_progress_lesson_id_foreign` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lesson_progress_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lesson_progress`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `lesson_progress` WRITE;
/*!40000 ALTER TABLE `lesson_progress` DISABLE KEYS */;
INSERT INTO `lesson_progress` VALUES
(1,'52100128-555f-4879-9497-952017bf1af8',13,25,1,'completed','2026-08-18 17:59:10','2026-08-19 17:59:10','2026-08-19 17:59:10','2026-09-07 17:59:10','2026-09-07 17:59:10'),
(2,'2885cec4-b844-4b39-b7d6-468e783cf9dc',13,26,1,'completed','2026-08-19 17:59:10','2026-08-20 17:59:10','2026-08-20 17:59:10','2026-09-07 17:59:10','2026-09-07 17:59:10'),
(3,'0bdf7344-e663-499c-8d26-2168494cf10d',13,27,1,'completed','2026-08-20 17:59:10','2026-08-21 17:59:10','2026-08-21 17:59:10','2026-09-07 17:59:10','2026-09-07 17:59:10'),
(4,'f96d5d8f-c35d-42c2-9c42-19ef773551e4',13,28,1,'completed','2026-08-21 17:59:10','2026-08-22 17:59:10','2026-08-22 17:59:10','2026-09-07 17:59:10','2026-09-07 17:59:10'),
(5,'b5c0f4f4-5e61-460a-8661-82041f1eddd0',13,29,1,'completed','2026-08-22 17:59:10','2026-08-23 17:59:10','2026-08-23 17:59:10','2026-09-07 17:59:10','2026-09-07 17:59:10'),
(6,'e58ea8b1-94c7-40e7-aa02-766c006b3cf2',13,30,1,'completed','2026-09-14 05:09:43','2026-09-14 05:09:43','2026-09-14 05:09:43','2026-09-14 05:09:43','2026-09-14 05:09:43'),
(7,'38eb3018-f767-4e63-8634-12757ba73b26',21,25,1,'completed','2026-09-13 17:17:00','2026-09-16 17:17:00',NULL,'2026-09-16 17:17:00','2026-09-16 17:17:00'),
(8,'c0478d65-9307-4d1d-8abe-31a30fe61cf7',21,26,1,'completed','2026-09-13 17:17:00','2026-09-16 17:17:00',NULL,'2026-09-16 17:17:00','2026-09-16 17:17:00');
/*!40000 ALTER TABLE `lesson_progress` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `lesson_resources`
--

DROP TABLE IF EXISTS `lesson_resources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `lesson_resources` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `lesson_id` bigint(20) unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `file_size` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `lesson_resources_uuid_unique` (`uuid`),
  KEY `lesson_resources_lesson_id_foreign` (`lesson_id`),
  CONSTRAINT `lesson_resources_lesson_id_foreign` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lesson_resources`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `lesson_resources` WRITE;
/*!40000 ALTER TABLE `lesson_resources` DISABLE KEYS */;
/*!40000 ALTER TABLE `lesson_resources` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `lessons`
--

DROP TABLE IF EXISTS `lessons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `lessons` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `module_id` bigint(20) unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `content_type` enum('video','pdf','document','presentation','audio','external_link','text','scorm') NOT NULL DEFAULT 'text',
  `content` longtext DEFAULT NULL,
  `transcript` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`transcript`)),
  `video_url` varchar(500) DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `external_url` varchar(500) DEFAULT NULL,
  `duration` int(10) unsigned DEFAULT NULL,
  `order` int(10) unsigned NOT NULL DEFAULT 1,
  `is_preview` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `lessons_uuid_unique` (`uuid`),
  KEY `lessons_module_id_order_index` (`module_id`,`order`),
  CONSTRAINT `lessons_module_id_foreign` FOREIGN KEY (`module_id`) REFERENCES `course_modules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lessons`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `lessons` WRITE;
/*!40000 ALTER TABLE `lessons` DISABLE KEYS */;
INSERT INTO `lessons` VALUES
(1,'65548d8d-6c49-44e2-b271-38e2c894da99',1,'FA1 — Recording Financial Transactions',NULL,'text','FA1 — Recording Financial Transactions\n\nStudy the official syllabus, practise exam-style questions, and review the learning objectives for this paper.',NULL,NULL,NULL,NULL,180,1,1,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(2,'35935cbd-518b-477c-aed7-247f73abd34e',1,'MA1 — Management Information',NULL,'text','MA1 — Management Information\n\nStudy the official syllabus, practise exam-style questions, and review the learning objectives for this paper.',NULL,NULL,NULL,NULL,180,2,0,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(3,'fbe1312a-9f53-4c09-b745-422548a8683a',2,'FA2 — Maintaining Financial Records',NULL,'text','FA2 — Maintaining Financial Records\n\nStudy the official syllabus, practise exam-style questions, and review the learning objectives for this paper.',NULL,NULL,NULL,NULL,180,1,0,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(4,'31349f2e-ced3-4ee1-a043-a6b7053e3575',2,'MA2 — Managing Costs and Finance',NULL,'text','MA2 — Managing Costs and Finance\n\nStudy the official syllabus, practise exam-style questions, and review the learning objectives for this paper.',NULL,NULL,NULL,NULL,180,2,0,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(5,'37fde92a-4ef1-4a93-8b6e-6b7ade080def',3,'FBT — Business and Technology',NULL,'text','FBT — Business and Technology\n\nStudy the official syllabus, practise exam-style questions, and review the learning objectives for this paper.',NULL,NULL,NULL,NULL,180,1,0,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(6,'efa5d070-3c2f-4ae3-8047-685cebbc058a',3,'FMA — Management Accounting',NULL,'text','FMA — Management Accounting\n\nStudy the official syllabus, practise exam-style questions, and review the learning objectives for this paper.',NULL,NULL,NULL,NULL,180,2,0,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(7,'6743b82f-94fb-42c1-b583-d63a54f06771',3,'FFA — Financial Accounting',NULL,'text','FFA — Financial Accounting\n\nStudy the official syllabus, practise exam-style questions, and review the learning objectives for this paper.',NULL,NULL,NULL,NULL,180,3,0,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(8,'37316ba3-5d84-4fb0-ba3a-eb5339ca77a9',4,'BT — Business and Technology',NULL,'text','BT — Business and Technology\n\nStudy the official syllabus, practise exam-style questions, and review the learning objectives for this paper.',NULL,NULL,NULL,NULL,180,1,1,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(9,'161958b7-33f5-4282-84b6-84cd87bc88dc',5,'MA — Management Accounting',NULL,'text','MA — Management Accounting\n\nStudy the official syllabus, practise exam-style questions, and review the learning objectives for this paper.',NULL,NULL,NULL,NULL,180,1,0,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(10,'6539f1bf-badf-4e20-9f32-15ae47e89930',6,'FA — Financial Accounting',NULL,'text','FA — Financial Accounting\n\nStudy the official syllabus, practise exam-style questions, and review the learning objectives for this paper.',NULL,NULL,NULL,NULL,180,1,0,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(11,'76d3123f-89ef-4112-b074-f0259eabdce9',7,'LW — Corporate and Business Law',NULL,'text','LW — Corporate and Business Law\n\nStudy the official syllabus, practise exam-style questions, and review the learning objectives for this paper.',NULL,NULL,NULL,NULL,180,1,1,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(12,'6deaf9c8-0934-4715-a908-826b6f5256aa',8,'PM — Performance Management',NULL,'text','PM — Performance Management\n\nStudy the official syllabus, practise exam-style questions, and review the learning objectives for this paper.',NULL,NULL,NULL,NULL,180,1,0,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(13,'29ea29c1-1bd3-4931-84f2-a82885ea2a7d',8,'TX — Taxation',NULL,'text','TX — Taxation\n\nStudy the official syllabus, practise exam-style questions, and review the learning objectives for this paper.',NULL,NULL,NULL,NULL,180,2,0,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(14,'eebc2032-f6b4-47cf-bf73-7d25a468f9bd',9,'FR — Financial Reporting',NULL,'text','FR — Financial Reporting\n\nStudy the official syllabus, practise exam-style questions, and review the learning objectives for this paper.',NULL,NULL,NULL,NULL,180,1,0,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(15,'875ddbd2-3f15-4d87-8625-49c20bad0701',9,'AA — Audit and Assurance',NULL,'text','AA — Audit and Assurance\n\nStudy the official syllabus, practise exam-style questions, and review the learning objectives for this paper.',NULL,NULL,NULL,NULL,180,2,0,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(16,'08afb7ae-4898-43e3-a338-a92a37c1e383',10,'FM — Financial Management',NULL,'text','FM — Financial Management\n\nStudy the official syllabus, practise exam-style questions, and review the learning objectives for this paper.',NULL,NULL,NULL,NULL,180,1,0,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(17,'8aa043c5-bd88-433c-aee0-2fb097954e30',11,'SBL — Strategic Business Leader',NULL,'text','SBL — Strategic Business Leader\n\nStudy the official syllabus, practise exam-style questions, and review the learning objectives for this paper.',NULL,NULL,NULL,NULL,180,1,1,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(18,'a24e5a17-33b9-40fd-b21a-5d8e6c5e1213',11,'SBR — Strategic Business Reporting',NULL,'text','SBR — Strategic Business Reporting\n\nStudy the official syllabus, practise exam-style questions, and review the learning objectives for this paper.',NULL,NULL,NULL,NULL,180,2,0,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(19,'d00866d8-a4c9-4988-b135-aa5d989d7070',12,'AFM — Advanced Financial Management',NULL,'text','AFM — Advanced Financial Management\n\nStudy the official syllabus, practise exam-style questions, and review the learning objectives for this paper.',NULL,NULL,NULL,NULL,180,1,0,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(20,'078be454-2010-470a-a242-8b7ccceffd68',12,'APM — Advanced Performance Management',NULL,'text','APM — Advanced Performance Management\n\nStudy the official syllabus, practise exam-style questions, and review the learning objectives for this paper.',NULL,NULL,NULL,NULL,180,2,0,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(21,'34623df6-1518-4f03-a7ac-b7adc9e77b74',12,'ATX — Advanced Taxation',NULL,'text','ATX — Advanced Taxation\n\nStudy the official syllabus, practise exam-style questions, and review the learning objectives for this paper.',NULL,NULL,NULL,NULL,180,3,0,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(22,'2860c0db-8a7d-44db-aee4-3e5f0145031b',12,'AAA — Advanced Audit and Assurance',NULL,'text','AAA — Advanced Audit and Assurance\n\nStudy the official syllabus, practise exam-style questions, and review the learning objectives for this paper.',NULL,NULL,NULL,NULL,180,4,0,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(23,'926ca52d-400a-42d7-96bc-437abcaa6498',13,'Ethics and Professional Skills Module',NULL,'text','Ethics and Professional Skills Module\n\nStudy the official syllabus, practise exam-style questions, and review the learning objectives for this paper.',NULL,NULL,NULL,NULL,180,1,0,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(24,'b0fd8e54-aed2-4cfa-a32c-19ca4167492c',13,'Practical Experience Requirement and Membership Pathway',NULL,'text','Practical Experience Requirement and Membership Pathway\n\nStudy the official syllabus, practise exam-style questions, and review the learning objectives for this paper.',NULL,NULL,NULL,NULL,180,2,0,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(25,'04db6a42-9a06-402a-887a-f1a05b190586',14,'1.1 Introduction to Modern Computer Networks',NULL,'text','# Introduction to Computer Networks\\n\\nA network consists of two or more connected computing devices that communicate and share resources.\\n\\n### Key Concepts:\\n- **OSI 7-Layer Architecture**\\n- **TCP/IP Protocol Suite**\\n- **Packet Switching vs Circuit Switching**',NULL,NULL,NULL,NULL,45,1,1,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(26,'f4f031a2-3a19-4077-ad47-2a310981abdd',14,'1.2 IPv4 Addressing and Binary Subnetting Masterclass',NULL,'video',NULL,'[{\"time\":\"00:00\",\"seconds\":0,\"text\":\"Welcome to the IPv4 Addressing and Binary Subnetting Masterclass.\"},{\"time\":\"00:05\",\"seconds\":5,\"text\":\"Every IPv4 address consists of 32 bits divided into four 8-bit octets.\"},{\"time\":\"00:12\",\"seconds\":12,\"text\":\"To calculate subnets accurately, we first convert dotted-decimal notation to pure binary.\"},{\"time\":\"00:20\",\"seconds\":20,\"text\":\"The subnet mask identifies the boundary between network bits and host bits.\"},{\"time\":\"00:30\",\"seconds\":30,\"text\":\"In a slash 24 mask, 24 bits are dedicated to the network portion, leaving 8 bits for host addresses.\"},{\"time\":\"00:42\",\"seconds\":42,\"text\":\"The formula 2 to the power of N minus 2 gives us the usable host addresses per subnet.\"},{\"time\":\"00:55\",\"seconds\":55,\"text\":\"We subtract 2 because the network ID and the broadcast address cannot be assigned to hosts.\"},{\"time\":\"01:10\",\"seconds\":70,\"text\":\"Next, let us work through Variable Length Subnet Masking (VLSM) for multi-branch network designs.\"}]','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',NULL,NULL,60,2,0,'active','2026-09-07 17:59:10','2026-09-14 10:08:04',NULL),
(27,'fd6bf4b3-39c4-4a10-b100-809311968c55',14,'1.3 Subnetting Reference Sheet & Practice Guide',NULL,'pdf',NULL,NULL,NULL,'curriculum/ccna/ipv4_subnetting_guide.pdf',NULL,30,3,0,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(28,'8beda8d0-de85-42a4-bd12-7b181e73b241',15,'2.1 Ethernet Frames and MAC Address Tables',NULL,'text','## How Layer 2 Switches Forward Traffic\\n\\nSwitches inspect source MAC addresses to populate the CAM table, and forward based on destination MAC addresses.',NULL,NULL,NULL,NULL,40,1,0,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(29,'327cfc80-0b96-4dd7-8688-2e79df699701',15,'2.2 Configuring VLANs and 802.1Q Trunks in Cisco IOS',NULL,'video',NULL,'[{\"time\":\"00:00\",\"seconds\":0,\"text\":\"In this lab, we configure Virtual Local Area Networks (VLANs) on Cisco Catalyst switches.\"},{\"time\":\"00:06\",\"seconds\":6,\"text\":\"VLANs segment broadcast domains logically at Layer 2 without requiring physical rewiring.\"},{\"time\":\"00:15\",\"seconds\":15,\"text\":\"Use the vlan 10 command followed by the name command in global configuration mode.\"},{\"time\":\"00:25\",\"seconds\":25,\"text\":\"To carry traffic for multiple VLANs across inter-switch links, we configure 802.1Q trunk ports.\"},{\"time\":\"00:38\",\"seconds\":38,\"text\":\"Switchport mode trunk activates frame tagging, inserting a 4-byte 802.1Q tag into the Ethernet frame.\"},{\"time\":\"00:50\",\"seconds\":50,\"text\":\"Verify active trunking with show interfaces trunk and inspect allowed VLAN lists.\"}]','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',NULL,NULL,55,2,0,'active','2026-09-07 17:59:10','2026-09-14 10:08:04',NULL),
(30,'6a985cea-e0d7-4af6-9d11-6532bcf9a696',16,'3.1 Routing Concepts and Administrative Distance',NULL,'text','## Understanding IP Routing\\n\\nRouters determine the best path to remote networks using routing tables populated by static routes or dynamic protocols.',NULL,NULL,NULL,NULL,50,1,0,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(31,'3a28d089-fee0-44d8-9b21-23e740283698',16,'3.2 Multi-Area OSPF Configuration Lab',NULL,'video',NULL,'[{\"time\":\"00:00\",\"seconds\":0,\"text\":\"Open Shortest Path First (OSPF) is a link-state routing protocol using Dijkstras algorithm.\"},{\"time\":\"00:07\",\"seconds\":7,\"text\":\"Multi-area OSPF reduces SPF calculations and routing table size by segmenting into areas.\"},{\"time\":\"00:18\",\"seconds\":18,\"text\":\"Area 0 is the mandatory backbone area that all non-backbone areas must connect to.\"},{\"time\":\"00:28\",\"seconds\":28,\"text\":\"Configure router ospf 1 and advertise interfaces with the wildcard mask.\"},{\"time\":\"00:40\",\"seconds\":40,\"text\":\"Verify neighbor adjacency formation in state FULL with show ip ospf neighbor.\"}]','https://youtu.be/W-pqyjNc0VM',NULL,NULL,65,2,0,'active','2026-09-07 17:59:10','2026-09-14 10:08:04',NULL),
(32,'24a9d211-55b0-47e3-9e2d-50d121ce8b5c',17,'4.1 Implementing Standard and Extended Named ACLs',NULL,'text','## Access Control Lists (ACLs)\\n\\nACLs filter packet traffic based on IP headers, port numbers, and protocol types.',NULL,NULL,NULL,NULL,45,1,0,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(33,'9dc4b6c0-0eeb-49ca-b506-7d0d6c2444db',18,'1.1 The CIA Triad and Common Attack Vectors',NULL,'text','## Confidentiality, Integrity, and Availability\\n\\nThe cornerstone of cyber defense systems.',NULL,NULL,NULL,NULL,30,1,1,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(34,'562d140f-aded-4f60-856c-b5c283e69aad',19,'1.1 Data Ingestion & Shape Transformation',NULL,'text','## Power Query ETL Best Practices\\n\\nLearn M-code foundations and automated data preparation.',NULL,NULL,NULL,NULL,40,1,1,'active','2026-09-07 17:59:10','2026-09-07 17:59:10',NULL),
(35,'b0cfb0fe-6bf5-43db-92c2-7c712f4611a4',20,'FA1 — Recording Financial Transactions','ACCA paper syllabus and study content.','text','FA1 — Recording Financial Transactions\n\nAdd the syllabus, learning materials, and exam preparation content for this paper.',NULL,NULL,NULL,NULL,180,1,0,'active','2026-09-11 02:15:56','2026-09-11 02:15:56',NULL),
(36,'375c72b7-f5f0-4653-a768-8ee0aa329b66',20,'MA1 — Management Information','ACCA paper syllabus and study content.','text','MA1 — Management Information\n\nAdd the syllabus, learning materials, and exam preparation content for this paper.',NULL,NULL,NULL,NULL,180,2,0,'active','2026-09-11 02:15:56','2026-09-11 02:15:56',NULL),
(37,'cc71155a-c475-48e2-8b73-c7573f3bf69b',21,'FA2 — Maintaining Financial Records','ACCA paper syllabus and study content.','text','FA2 — Maintaining Financial Records\n\nAdd the syllabus, learning materials, and exam preparation content for this paper.',NULL,NULL,NULL,NULL,180,1,0,'active','2026-09-11 02:15:56','2026-09-11 02:15:56',NULL),
(38,'85b6e730-1f8f-4ba9-b344-c8dee750bc2b',21,'MA2 — Managing Costs and Finance','ACCA paper syllabus and study content.','text','MA2 — Managing Costs and Finance\n\nAdd the syllabus, learning materials, and exam preparation content for this paper.',NULL,NULL,NULL,NULL,180,2,0,'active','2026-09-11 02:15:56','2026-09-11 02:15:56',NULL),
(39,'23b44dca-c3ff-499d-9308-806e68b2642d',22,'FBT — Business & Technology','ACCA paper syllabus and study content.','text','FBT — Business & Technology\n\nAdd the syllabus, learning materials, and exam preparation content for this paper.',NULL,NULL,NULL,NULL,180,1,0,'active','2026-09-11 02:15:56','2026-09-11 02:15:56',NULL),
(40,'ef670f97-b93f-4ed9-8a81-a12486876f45',22,'FMA — Management Accounting','ACCA paper syllabus and study content.','text','FMA — Management Accounting\n\nAdd the syllabus, learning materials, and exam preparation content for this paper.',NULL,NULL,NULL,NULL,180,2,0,'active','2026-09-11 02:15:56','2026-09-11 02:15:56',NULL),
(41,'57bbfa63-ba22-4a1e-aea3-722cb6083a10',22,'FFA — Financial Accounting','ACCA paper syllabus and study content.','text','FFA — Financial Accounting\n\nAdd the syllabus, learning materials, and exam preparation content for this paper.',NULL,NULL,NULL,NULL,180,3,0,'active','2026-09-11 02:15:56','2026-09-11 02:15:56',NULL),
(42,'930763b1-a313-43a9-bdfe-909ba9ff7e7d',23,'AB/BT — Business & Technology','ACCA paper syllabus and study content.','text','AB/BT — Business & Technology\n\nAdd the syllabus, learning materials, and exam preparation content for this paper.',NULL,NULL,NULL,NULL,180,1,0,'active','2026-09-11 02:15:56','2026-09-11 02:15:56',NULL),
(43,'c512383e-c22c-4f1f-9440-75524c2d814e',23,'MA — Management Accounting','ACCA paper syllabus and study content.','text','MA — Management Accounting\n\nAdd the syllabus, learning materials, and exam preparation content for this paper.',NULL,NULL,NULL,NULL,180,2,0,'active','2026-09-11 02:15:56','2026-09-11 02:15:56',NULL),
(44,'03e8192c-5404-4103-a461-399cc84f7c70',23,'FA — Financial Accounting','ACCA paper syllabus and study content.','text','FA — Financial Accounting\n\nAdd the syllabus, learning materials, and exam preparation content for this paper.',NULL,NULL,NULL,NULL,180,3,0,'active','2026-09-11 02:15:56','2026-09-11 02:15:56',NULL),
(45,'c5ed9775-56ce-4e32-bc56-852178b76bd9',24,'CL/LW — Corporate and Business Law','ACCA paper syllabus and study content.','text','CL/LW — Corporate and Business Law\n\nAdd the syllabus, learning materials, and exam preparation content for this paper.',NULL,NULL,NULL,NULL,180,1,0,'active','2026-09-11 02:15:56','2026-09-11 02:15:56',NULL),
(46,'83799dca-2ca5-4ef1-ad81-d2b98f34392a',24,'PM — Performance Management','ACCA paper syllabus and study content.','text','PM — Performance Management\n\nAdd the syllabus, learning materials, and exam preparation content for this paper.',NULL,NULL,NULL,NULL,180,2,0,'active','2026-09-11 02:15:56','2026-09-11 02:15:56',NULL),
(47,'6bb0f7e4-8494-4b45-88ff-a8500a0fa1c9',24,'TX — Taxation','ACCA paper syllabus and study content.','text','TX — Taxation\n\nAdd the syllabus, learning materials, and exam preparation content for this paper.',NULL,NULL,NULL,NULL,180,3,0,'active','2026-09-11 02:15:56','2026-09-11 02:15:56',NULL),
(48,'b301cd26-ab09-498c-9127-1171aef37bfb',24,'FR — Financial Reporting','ACCA paper syllabus and study content.','text','FR — Financial Reporting\n\nAdd the syllabus, learning materials, and exam preparation content for this paper.',NULL,NULL,NULL,NULL,180,4,0,'active','2026-09-11 02:15:56','2026-09-11 02:15:56',NULL),
(49,'e50f1d17-63fe-4359-a4d3-6f8a79b0ef64',24,'AA — Audit & Assurance','ACCA paper syllabus and study content.','text','AA — Audit & Assurance\n\nAdd the syllabus, learning materials, and exam preparation content for this paper.',NULL,NULL,NULL,NULL,180,5,0,'active','2026-09-11 02:15:56','2026-09-11 02:15:56',NULL),
(50,'a94fe898-adad-49f4-95c4-746d16c71b47',24,'FM — Financial Management','ACCA paper syllabus and study content.','text','FM — Financial Management\n\nAdd the syllabus, learning materials, and exam preparation content for this paper.',NULL,NULL,NULL,NULL,180,6,0,'active','2026-09-11 02:15:56','2026-09-11 02:15:56',NULL),
(51,'36e5d30d-f17c-49ca-8b82-23ed7ec06ffb',25,'SBR — Strategic Business Reporting','ACCA paper syllabus and study content.','text','SBR — Strategic Business Reporting\n\nAdd the syllabus, learning materials, and exam preparation content for this paper.',NULL,NULL,NULL,NULL,180,1,0,'active','2026-09-11 02:15:56','2026-09-11 02:15:56',NULL),
(52,'72a5e5e1-e6e4-47bb-9acf-7f9c0d45723a',25,'SBL — Strategic Business Leader','ACCA paper syllabus and study content.','text','SBL — Strategic Business Leader\n\nAdd the syllabus, learning materials, and exam preparation content for this paper.',NULL,NULL,NULL,NULL,180,2,0,'active','2026-09-11 02:15:56','2026-09-11 02:15:56',NULL),
(53,'62157f2e-d335-41df-9074-7d5b411e7b0e',26,'AFM — Advanced Financial Management','ACCA paper syllabus and study content.','text','AFM — Advanced Financial Management\n\nAdd the syllabus, learning materials, and exam preparation content for this paper.',NULL,NULL,NULL,NULL,180,1,0,'active','2026-09-11 02:15:56','2026-09-11 02:15:56',NULL),
(54,'d1a8f0c0-7077-40e0-9c5d-20984da90209',26,'APM — Advanced Performance Management','ACCA paper syllabus and study content.','text','APM — Advanced Performance Management\n\nAdd the syllabus, learning materials, and exam preparation content for this paper.',NULL,NULL,NULL,NULL,180,2,0,'active','2026-09-11 02:15:56','2026-09-11 02:15:56',NULL),
(55,'91eb0632-04d0-4fce-a1c0-f1e7ebf5c03a',26,'ATX — Advanced Taxation','ACCA paper syllabus and study content.','text','ATX — Advanced Taxation\n\nAdd the syllabus, learning materials, and exam preparation content for this paper.',NULL,NULL,NULL,NULL,180,3,0,'active','2026-09-11 02:15:56','2026-09-11 02:15:56',NULL),
(56,'6ab32bba-7545-4ac2-8683-f0d36561a08d',26,'AAA — Advanced Audit & Assurance','ACCA paper syllabus and study content.','text','AAA — Advanced Audit & Assurance\n\nAdd the syllabus, learning materials, and exam preparation content for this paper.',NULL,NULL,NULL,NULL,180,4,0,'active','2026-09-11 02:15:56','2026-09-11 02:15:56',NULL),
(57,'59d1a3a7-ddb7-4e54-ae71-4511f1e538da',28,'Cloud computing overview','An introduction to the five essential characteristics of cloud computing according to NIST standards.','video','# Cloud Computing Overview\n\nCloud computing represents the on-demand delivery of compute power, database storage, applications, and other IT resources via the internet with pay-as-you-go pricing.\n\n### 5 Core Traits:\n1. On-demand self-service\n2. Broad network access\n3. Resource pooling\n4. Rapid elasticity\n5. Measured service','[{\"time\":\"00:00\",\"seconds\":0,\"text\":\"Let\'s start at the beginning with an overview of cloud computing.\"},{\"time\":\"00:04\",\"seconds\":4,\"text\":\"The cloud is a hot topic these days, but what exactly is it?\"},{\"time\":\"00:09\",\"seconds\":9,\"text\":\"The US National Institute of Standards and Technology created the term cloud computing, although there is nothing US-specific about it.\"},{\"time\":\"00:17\",\"seconds\":17,\"text\":\"Cloud computing is a way of using information technology (IT) that has these five equally important traits.\"},{\"time\":\"00:25\",\"seconds\":25,\"text\":\"First, customers get computing resources that are on-demand and self-service.\"},{\"time\":\"00:31\",\"seconds\":31,\"text\":\"Through a web interface, users get the processing power, storage, and networking they need without human intervention.\"},{\"time\":\"00:42\",\"seconds\":42,\"text\":\"Second, customers can get those resources over the internet, from anywhere they have network access.\"},{\"time\":\"00:50\",\"seconds\":50,\"text\":\"Third, the provider of those resources has a large pool of them, and allocates them to customers out of that pool.\"},{\"time\":\"01:02\",\"seconds\":62,\"text\":\"Fourth, the resources are elastic. If customers need more resources, they can get them rapidly.\"},{\"time\":\"01:15\",\"seconds\":75,\"text\":\"Fifth, customers pay only for what they use, or reserve as they go.\"}]','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',NULL,NULL,20,1,1,'active','2026-09-14 09:15:42','2026-09-14 10:07:32','2026-09-14 10:07:32'),
(58,'b7d8a0a2-3274-4589-bf92-f3d168595406',28,'Google Cloud computing architecture','Explore the global Google infrastructure, regions, zones, and Andromeda software-defined networking.','video','## Global Infrastructure Overview\\nGoogle operates high-capacity subsea fiber cables connecting data center regions worldwide.','[{\"time\":\"00:00\",\"seconds\":0,\"text\":\"Google Cloud architecture spans global regions, zones, and edge points of presence.\"},{\"time\":\"00:15\",\"seconds\":15,\"text\":\"Each region consists of independent zones connected with low-latency fiber networking.\"},{\"time\":\"00:30\",\"seconds\":30,\"text\":\"Software-defined networking powers Jupiter, Andromeda, and global VPC routing.\"}]','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',NULL,NULL,25,2,0,'active','2026-09-14 09:15:42','2026-09-14 10:07:32','2026-09-14 10:07:32'),
(59,'7c3a0dd5-85dc-499a-9863-0f6c4a7e5ac9',28,'Resource management & IAM','Organizations, folders, projects, and role-based IAM permissions in Google Cloud.','text','## Google Cloud Resource Hierarchy\n\n- Organization\n  - Folders\n    - Projects\n      - Resources (VMs, Buckets, Datasets)\n\nPolicies inherit downward through the resource tree.',NULL,NULL,NULL,NULL,30,3,0,'active','2026-09-14 09:15:42','2026-09-14 10:07:32','2026-09-14 10:07:32'),
(60,'f13b9b86-6ab3-4c17-a4b7-b3d186b5e8c2',29,'1.1 Getting Started & Architectural Overview','Comprehensive walkthrough and setup guidance.','video','# Integrate Generative AI Into Your Data Workflow\n\nWelcome to this comprehensive program. Review the syllabus and launch practical labs.','[{\"time\":\"00:00\",\"seconds\":0,\"text\":\"Welcome to Integrate Generative AI Into Your Data Workflow.\"},{\"time\":\"00:08\",\"seconds\":8,\"text\":\"In this module, you will gain hands-on intuition and industry best practices.\"},{\"time\":\"00:18\",\"seconds\":18,\"text\":\"We will build foundational components step by step.\"}]','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',NULL,NULL,45,1,1,'active','2026-09-14 09:15:42','2026-09-14 10:07:32','2026-09-14 10:07:32'),
(61,'8a5d7a85-4281-47d6-b921-2223c76ecaed',30,'1.1 Getting Started & Architectural Overview','Comprehensive walkthrough and setup guidance.','video','# Deploy and Manage Generative AI Models\n\nWelcome to this comprehensive program. Review the syllabus and launch practical labs.','[{\"time\":\"00:00\",\"seconds\":0,\"text\":\"Welcome to Deploy and Manage Generative AI Models.\"},{\"time\":\"00:08\",\"seconds\":8,\"text\":\"In this module, you will gain hands-on intuition and industry best practices.\"},{\"time\":\"00:18\",\"seconds\":18,\"text\":\"We will build foundational components step by step.\"}]','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',NULL,NULL,45,1,1,'active','2026-09-14 09:16:22','2026-09-14 10:07:32','2026-09-14 10:07:32'),
(62,'ecb44e86-3cef-40df-9cfd-a5c9ae27c065',31,'1.1 Getting Started & Architectural Overview','Comprehensive walkthrough and setup guidance.','video','# Build and Modernize Applications With Generative AI\n\nWelcome to this comprehensive program. Review the syllabus and launch practical labs.','[{\"time\":\"00:00\",\"seconds\":0,\"text\":\"Welcome to Build and Modernize Applications With Generative AI.\"},{\"time\":\"00:08\",\"seconds\":8,\"text\":\"In this module, you will gain hands-on intuition and industry best practices.\"},{\"time\":\"00:18\",\"seconds\":18,\"text\":\"We will build foundational components step by step.\"}]','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',NULL,NULL,45,1,1,'active','2026-09-14 09:16:23','2026-09-14 10:07:32','2026-09-14 10:07:32'),
(63,'903400c6-7092-4c53-ac05-80a5b0f7f766',32,'1.1 Getting Started & Architectural Overview','Comprehensive walkthrough and setup guidance.','video','# Build a Certification Study Guide: ACE Exam Prep\n\nWelcome to this comprehensive program. Review the syllabus and launch practical labs.','[{\"time\":\"00:00\",\"seconds\":0,\"text\":\"Welcome to Build a Certification Study Guide: ACE Exam Prep.\"},{\"time\":\"00:08\",\"seconds\":8,\"text\":\"In this module, you will gain hands-on intuition and industry best practices.\"},{\"time\":\"00:18\",\"seconds\":18,\"text\":\"We will build foundational components step by step.\"}]','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',NULL,NULL,45,1,1,'active','2026-09-14 09:16:23','2026-09-14 10:07:32','2026-09-14 10:07:32'),
(64,'19cffceb-128d-48f2-bf3c-5e2d75545b45',33,'1.1 Getting Started & Architectural Overview','Comprehensive walkthrough and setup guidance.','video','# Google DeepMind: 01 Build Your Own Small Language Models\n\nWelcome to this comprehensive program. Review the syllabus and launch practical labs.','[{\"time\":\"00:00\",\"seconds\":0,\"text\":\"Welcome to Google DeepMind: 01 Build Your Own Small Language Models.\"},{\"time\":\"00:08\",\"seconds\":8,\"text\":\"In this module, you will gain hands-on intuition and industry best practices.\"},{\"time\":\"00:18\",\"seconds\":18,\"text\":\"We will build foundational components step by step.\"}]','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',NULL,NULL,45,1,1,'active','2026-09-14 09:16:23','2026-09-14 10:07:32','2026-09-14 10:07:32');
/*!40000 ALTER TABLE `lessons` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES
(1,'0001_01_01_000001_create_cache_table',1),
(2,'0001_01_01_000002_create_jobs_table',1),
(3,'2026_01_01_000001_create_organizations_table',1),
(4,'2026_01_01_000002_create_branches_and_departments_and_positions_tables',1),
(5,'2026_01_01_000003_create_users_table',1),
(6,'2026_01_01_000004_create_permission_tables',1),
(7,'2026_01_01_000005_create_staff_and_student_profiles_tables',1),
(8,'2026_01_01_000006_create_courses_and_curriculum_tables',1),
(9,'2026_01_01_000007_create_batches_and_enrollments_tables',1),
(10,'2026_01_01_000008_create_class_sessions_and_attendance_tables',1),
(11,'2026_01_01_000009_create_learning_progress_tables',1),
(12,'2026_01_01_000010_create_grading_and_assessments_tables',1),
(13,'2026_01_01_000011_create_certificates_tables',1),
(14,'2026_01_01_000012_create_announcements_and_audit_logs_and_settings_tables',1),
(15,'2026_09_03_000001_add_optional_course_units',1),
(16,'2026_09_04_000001_add_workflow_to_enrollments_table',1),
(17,'2026_09_05_190722_create_enrollment_finances_table',1),
(18,'2026_09_05_190723_create_finance_payments_table',1),
(19,'2026_09_05_191018_backfill_enrollment_finances',1),
(20,'2026_09_05_192023_rename_apex_demo_email_domains',1),
(21,'2026_09_10_000001_add_acca_course_metadata',2),
(22,'2026_09_11_000001_consolidate_acca_into_one_course',3),
(23,'2026_09_11_000002_remove_legacy_acca_master_modules',4),
(24,'2026_09_14_000001_add_transcript_to_lessons_table',5),
(25,'2026_09_14_000002_create_learning_paths_table',6),
(26,'2026_09_15_000001_create_course_feedback_tables',7);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `model_has_permissions`
--

DROP TABLE IF EXISTS `model_has_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `model_has_permissions` (
  `permission_id` bigint(20) unsigned NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`),
  CONSTRAINT `model_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `model_has_permissions`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `model_has_permissions` WRITE;
/*!40000 ALTER TABLE `model_has_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `model_has_permissions` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `model_has_roles`
--

DROP TABLE IF EXISTS `model_has_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `model_has_roles` (
  `role_id` bigint(20) unsigned NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`),
  CONSTRAINT `model_has_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `model_has_roles`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `model_has_roles` WRITE;
/*!40000 ALTER TABLE `model_has_roles` DISABLE KEYS */;
INSERT INTO `model_has_roles` VALUES
(1,'App\\Models\\User',1),
(2,'App\\Models\\User',2),
(4,'App\\Models\\User',3),
(4,'App\\Models\\User',4),
(5,'App\\Models\\User',5),
(6,'App\\Models\\User',6),
(6,'App\\Models\\User',7),
(6,'App\\Models\\User',8),
(7,'App\\Models\\User',9),
(8,'App\\Models\\User',10),
(9,'App\\Models\\User',11),
(10,'App\\Models\\User',12),
(11,'App\\Models\\User',13),
(11,'App\\Models\\User',14),
(11,'App\\Models\\User',15),
(11,'App\\Models\\User',16),
(11,'App\\Models\\User',17),
(11,'App\\Models\\User',18),
(11,'App\\Models\\User',19),
(11,'App\\Models\\User',20),
(12,'App\\Models\\User',21);
/*!40000 ALTER TABLE `model_has_roles` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` char(36) NOT NULL,
  `type` varchar(255) NOT NULL,
  `notifiable_type` varchar(255) NOT NULL,
  `notifiable_id` bigint(20) unsigned NOT NULL,
  `data` text NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_notifiable_type_notifiable_id_index` (`notifiable_type`,`notifiable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES
('0402c156-1d18-42da-a0cd-d18a7bc66b0f','App\\Notifications\\FeedbackWindowOpenedNotification','App\\Models\\User',6,'{\"type\":\"feedback_window_open\",\"title\":\"Middle Feedback Window Open\",\"message\":\"The middle feedback collection for ACCA FIA September 2026 Cohort is now active (Target date: 2026-10-16). Your feedback ensures continuous academic quality.\",\"batch_id\":5,\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"period\":\"middle\",\"due_date\":\"2026-10-16\",\"action_url\":\"\\/dashboard\"}',NULL,'2026-09-16 06:04:10','2026-09-16 06:04:10'),
('09ab49cc-4596-4d02-999a-33ee7270491d','App\\Notifications\\FeedbackSubmittedNotification','App\\Models\\User',6,'{\"type\":\"feedback_submitted\",\"title\":\"New Beginning Feedback Received\",\"message\":\"Diana Chebet Koech submitted Beginning feedback (\\u2605\\u2605\\u2605\\u2605\\u2605) for ACCA FIA September 2026 Cohort: \\\"FFA double-entry lectures are excellent! Breaking down into two 2-hour...\\\"\",\"feedback_id\":3,\"feedback_uuid\":\"548f8621-b2ba-46f8-bec4-4f5ac05bec34\",\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"student_name\":\"Diana Chebet Koech\",\"period\":\"beginning\",\"rating\":5,\"action_url\":\"\\/feedback\"}',NULL,'2026-09-16 06:19:10','2026-09-16 06:19:10'),
('0cd3571b-01d9-463a-b1ae-2dd01faf2e80','App\\Notifications\\EnrollmentApprovedNotification','App\\Models\\User',16,'{\"type\":\"enrollment_approved\",\"title\":\"Accepted into ACCA\",\"message\":\"Welcome to ACCA Applied Skills September 2026 Cohort! Your enrollment has been accepted and approved. Your class schedule, materials, and assessments are now active.\",\"enrollment_number\":\"ENR-ACCA-0016-7\",\"course_name\":\"ACCA\",\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"action_url\":\"\\/dashboard\",\"batch_id\":7}',NULL,'2026-09-16 06:42:31','2026-09-16 06:42:31'),
('1302f977-7296-4701-9b53-594a91068186','App\\Notifications\\FeedbackWindowOpenedNotification','App\\Models\\User',6,'{\"type\":\"feedback_window_open\",\"title\":\"Exit Feedback Window Open\",\"message\":\"The exit feedback collection for ACCA Applied Skills September 2026 Cohort is now active (Target date: 2026-11-20). Your feedback ensures continuous academic quality.\",\"batch_id\":7,\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"period\":\"exit\",\"due_date\":\"2026-11-20\",\"action_url\":\"\\/dashboard\"}',NULL,'2026-09-16 06:04:10','2026-09-16 06:04:10'),
('18fa5f88-d747-4107-b347-408c5b597d9e','App\\Notifications\\FeedbackSubmittedNotification','App\\Models\\User',6,'{\"type\":\"feedback_submitted\",\"title\":\"New Beginning Feedback Received\",\"message\":\"John K. Mwangi submitted Beginning feedback (\\u2605\\u2605\\u2605\\u2605\\u2605) for ACCA Applied Skills September 2026 Cohort: \\\"The morning CL sessions at 6:00 AM are very sharp and well-structured....\\\"\",\"feedback_id\":1,\"feedback_uuid\":\"7f937f52-fa2e-4899-ae9b-fb097b37ab08\",\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"student_name\":\"John K. Mwangi\",\"period\":\"beginning\",\"rating\":5,\"action_url\":\"\\/feedback\"}',NULL,'2026-09-16 06:04:10','2026-09-16 06:04:10'),
('1b16d65e-94ca-47eb-8257-a9392fcde3fc','App\\Notifications\\FeedbackWindowOpenedNotification','App\\Models\\User',6,'{\"type\":\"feedback_window_open\",\"title\":\"Beginning Feedback Window Open\",\"message\":\"The beginning feedback collection for ACCA Applied Skills September 2026 Cohort is now active (Target date: 2026-09-25). Your feedback ensures continuous academic quality.\",\"batch_id\":7,\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"period\":\"beginning\",\"due_date\":\"2026-09-25\",\"action_url\":\"\\/dashboard\"}',NULL,'2026-09-16 06:19:10','2026-09-16 06:19:10'),
('1b6b95dd-91f9-4143-bb35-b1e70e44430a','App\\Notifications\\EnrollmentApprovedNotification','App\\Models\\User',14,'{\"type\":\"enrollment_approved\",\"title\":\"Accepted into ACCA\",\"message\":\"Welcome to ACCA Applied Skills September 2026 Cohort! Your enrollment has been accepted and approved. Your class schedule, materials, and assessments are now active.\",\"enrollment_number\":\"ENR-ACCA-0014-7\",\"course_name\":\"ACCA\",\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"action_url\":\"\\/dashboard\",\"batch_id\":7}',NULL,'2026-09-16 06:19:10','2026-09-16 06:19:10'),
('1dd214c9-3f81-40b8-9d7a-c7174b4f8db8','App\\Notifications\\FeedbackWindowOpenedNotification','App\\Models\\User',5,'{\"type\":\"feedback_window_open\",\"title\":\"Exit Feedback Window Open\",\"message\":\"The exit feedback collection for ACCA FIA September 2026 Cohort is now active (Target date: 2026-11-20). Your feedback ensures continuous academic quality.\",\"batch_id\":5,\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"period\":\"exit\",\"due_date\":\"2026-11-20\",\"action_url\":\"\\/dashboard\"}',NULL,'2026-09-16 06:19:10','2026-09-16 06:19:10'),
('1eaec539-2c63-4b38-b4f6-ba78deb310eb','App\\Notifications\\FeedbackWindowOpenedNotification','App\\Models\\User',5,'{\"type\":\"feedback_window_open\",\"title\":\"Beginning Feedback Window Open\",\"message\":\"The beginning feedback collection for ACCA Applied Skills September 2026 Cohort is now active (Target date: 2026-09-25). Your feedback ensures continuous academic quality.\",\"batch_id\":7,\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"period\":\"beginning\",\"due_date\":\"2026-09-25\",\"action_url\":\"\\/dashboard\"}',NULL,'2026-09-16 06:04:10','2026-09-16 06:04:10'),
('1ed640ca-c3d1-428f-b1c6-033f5a72d936','App\\Notifications\\FeedbackWindowOpenedNotification','App\\Models\\User',5,'{\"type\":\"feedback_window_open\",\"title\":\"Exit Feedback Window Open\",\"message\":\"The exit feedback collection for ACCA Applied Skills September 2026 Cohort is now active (Target date: 2026-11-20). Your feedback ensures continuous academic quality.\",\"batch_id\":7,\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"period\":\"exit\",\"due_date\":\"2026-11-20\",\"action_url\":\"\\/dashboard\"}',NULL,'2026-09-16 06:04:10','2026-09-16 06:04:10'),
('205592a5-f745-4180-ab0d-c815b427d3e1','App\\Notifications\\FeedbackSubmittedNotification','App\\Models\\User',5,'{\"type\":\"feedback_submitted\",\"title\":\"New Beginning Feedback Received\",\"message\":\"Alex Mutua Kioko submitted Beginning feedback (\\u2605\\u2605\\u2605\\u2605\\u2606) for ACCA Applied Skills September 2026 Cohort: \\\"Taxation practice questions are very comprehensive. Would appreciate a...\\\"\",\"feedback_id\":6,\"feedback_uuid\":\"1f53a045-1cea-482f-ab90-c45187bdd914\",\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"student_name\":\"Alex Mutua Kioko\",\"period\":\"beginning\",\"rating\":4,\"action_url\":\"\\/feedback\"}',NULL,'2026-09-16 06:19:10','2026-09-16 06:19:10'),
('2094c135-368b-4814-977f-58ad0ec8302e','App\\Notifications\\FeedbackWindowOpenedNotification','App\\Models\\User',6,'{\"type\":\"feedback_window_open\",\"title\":\"Middle Feedback Window Open\",\"message\":\"The middle feedback collection for ACCA FIA September 2026 Cohort is now active (Target date: 2026-10-16). Your feedback ensures continuous academic quality.\",\"batch_id\":5,\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"period\":\"middle\",\"due_date\":\"2026-10-16\",\"action_url\":\"\\/dashboard\"}',NULL,'2026-09-16 06:19:10','2026-09-16 06:19:10'),
('230dae16-8a39-48d2-b55f-f59254bcc0bb','App\\Notifications\\FeedbackWindowOpenedNotification','App\\Models\\User',5,'{\"type\":\"feedback_window_open\",\"title\":\"Beginning Feedback Window Open\",\"message\":\"The beginning feedback collection for ACCA Applied Skills September 2026 Cohort is now active (Target date: 2026-09-25). Your feedback ensures continuous academic quality.\",\"batch_id\":7,\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"period\":\"beginning\",\"due_date\":\"2026-09-25\",\"action_url\":\"\\/dashboard\"}',NULL,'2026-09-16 06:19:10','2026-09-16 06:19:10'),
('278f76ab-2b48-45c0-817c-d559d592edee','App\\Notifications\\FeedbackSubmittedNotification','App\\Models\\User',6,'{\"type\":\"feedback_submitted\",\"title\":\"New Beginning Feedback Received\",\"message\":\"Jane Akinyi Oduor submitted Beginning feedback (\\u2605\\u2605\\u2605\\u2605\\u2606) for ACCA Applied Skills September 2026 Cohort: \\\"Taxation practice questions are very comprehensive. Would appreciate a...\\\"\",\"feedback_id\":2,\"feedback_uuid\":\"dc1259fb-b079-42ef-9c75-84812789bc2b\",\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"student_name\":\"Jane Akinyi Oduor\",\"period\":\"beginning\",\"rating\":4,\"action_url\":\"\\/feedback\"}',NULL,'2026-09-16 06:04:10','2026-09-16 06:04:10'),
('288569e3-eb62-4150-ab65-a97f457ddef9','App\\Notifications\\FeedbackSubmittedNotification','App\\Models\\User',6,'{\"type\":\"feedback_submitted\",\"title\":\"New Beginning Feedback Received\",\"message\":\"Brian Susan Kariuki submitted Beginning feedback (\\u2605\\u2605\\u2605\\u2605\\u2605) for ACCA FIA September 2026 Cohort: \\\"Fantastic guidance on maintaining financial records and trial balances...\\\"\",\"feedback_id\":4,\"feedback_uuid\":\"ad2fd967-4600-44a7-a8ea-a8904454f8d3\",\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"student_name\":\"Brian Susan Kariuki\",\"period\":\"beginning\",\"rating\":5,\"action_url\":\"\\/feedback\"}',NULL,'2026-09-16 06:19:10','2026-09-16 06:19:10'),
('29a3eeda-18a3-494c-bf92-10ee6af248d4','App\\Notifications\\FeedbackWindowOpenedNotification','App\\Models\\User',6,'{\"type\":\"feedback_window_open\",\"title\":\"Beginning Feedback Window Open\",\"message\":\"The beginning feedback collection for ACCA Applied Skills September 2026 Cohort is now active (Target date: 2026-09-25). Your feedback ensures continuous academic quality.\",\"batch_id\":7,\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"period\":\"beginning\",\"due_date\":\"2026-09-25\",\"action_url\":\"\\/dashboard\"}',NULL,'2026-09-16 06:43:44','2026-09-16 06:43:44'),
('2a3ca2c9-395f-4807-8735-7887fd038d6d','App\\Notifications\\FeedbackWindowOpenedNotification','App\\Models\\User',6,'{\"type\":\"feedback_window_open\",\"title\":\"Middle Feedback Window Open\",\"message\":\"The middle feedback collection for ACCA FIA September 2026 Cohort is now active (Target date: 2026-10-16). Your feedback ensures continuous academic quality.\",\"batch_id\":5,\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"period\":\"middle\",\"due_date\":\"2026-10-16\",\"action_url\":\"\\/dashboard\"}',NULL,'2026-09-16 06:43:44','2026-09-16 06:43:44'),
('2a993a2f-5387-4ea9-a38a-7a1775461bc9','App\\Notifications\\EnrollmentApprovedNotification','App\\Models\\User',18,'{\"type\":\"enrollment_approved\",\"title\":\"Accepted into ACCA\",\"message\":\"Welcome to ACCA FIA September 2026 Cohort! Your enrollment has been accepted and approved. Your class schedule, materials, and assessments are now active.\",\"enrollment_number\":\"ENR-2026-0007\",\"course_name\":\"ACCA\",\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"action_url\":\"\\/dashboard\",\"batch_id\":5}',NULL,'2026-09-16 06:43:41','2026-09-16 06:43:41'),
('2bb38dbb-f897-4c87-a4f8-083f9b1cbb47','App\\Notifications\\EnrollmentApprovedNotification','App\\Models\\User',18,'{\"type\":\"enrollment_approved\",\"title\":\"Accepted into ACCA\",\"message\":\"Welcome to ACCA FIA September 2026 Cohort! Your enrollment has been accepted and approved. Your class schedule, materials, and assessments are now active.\",\"enrollment_number\":\"ENR-2026-0007\",\"course_name\":\"ACCA\",\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"action_url\":\"\\/dashboard\",\"batch_id\":5}',NULL,'2026-09-16 06:42:31','2026-09-16 06:42:31'),
('2c9a0040-9f57-40f7-a3f3-4be220e22ed0','App\\Notifications\\FeedbackWindowOpenedNotification','App\\Models\\User',5,'{\"type\":\"feedback_window_open\",\"title\":\"Middle Feedback Window Open\",\"message\":\"The middle feedback collection for ACCA FIA September 2026 Cohort is now active (Target date: 2026-10-16). Your feedback ensures continuous academic quality.\",\"batch_id\":5,\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"period\":\"middle\",\"due_date\":\"2026-10-16\",\"action_url\":\"\\/dashboard\"}',NULL,'2026-09-16 06:04:10','2026-09-16 06:04:10'),
('36acf08a-7b20-4df4-8a2f-f74eee82ea98','App\\Notifications\\FeedbackWindowOpenedNotification','App\\Models\\User',5,'{\"type\":\"feedback_window_open\",\"title\":\"Beginning Feedback Window Open\",\"message\":\"The beginning feedback collection for ACCA FIA September 2026 Cohort is now active (Target date: 2026-09-25). Your feedback ensures continuous academic quality.\",\"batch_id\":5,\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"period\":\"beginning\",\"due_date\":\"2026-09-25\",\"action_url\":\"\\/dashboard\"}',NULL,'2026-09-16 06:19:10','2026-09-16 06:19:10'),
('39b68ed9-247b-40ee-b193-ed1c4ef85871','App\\Notifications\\EnrollmentApprovedNotification','App\\Models\\User',15,'{\"type\":\"enrollment_approved\",\"title\":\"Accepted into ACCA\",\"message\":\"Welcome to ACCA Applied Skills September 2026 Cohort! Your enrollment has been accepted and approved. Your class schedule, materials, and assessments are now active.\",\"enrollment_number\":\"ENR-ACCA-0015-7\",\"course_name\":\"ACCA\",\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"action_url\":\"\\/dashboard\",\"batch_id\":7}',NULL,'2026-09-16 06:42:31','2026-09-16 06:42:31'),
('3a27312e-e6b0-4e4f-8600-27ca37b72383','App\\Notifications\\FeedbackSubmittedNotification','App\\Models\\User',6,'{\"type\":\"feedback_submitted\",\"title\":\"New Beginning Feedback Received\",\"message\":\"Diana Chebet Koech submitted Beginning feedback (\\u2605\\u2605\\u2605\\u2605\\u2605) for ACCA FIA September 2026 Cohort: \\\"FFA double-entry lectures are excellent! Breaking down into two 2-hour...\\\"\",\"feedback_id\":3,\"feedback_uuid\":\"548f8621-b2ba-46f8-bec4-4f5ac05bec34\",\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"student_name\":\"Diana Chebet Koech\",\"period\":\"beginning\",\"rating\":5,\"action_url\":\"\\/feedback\"}',NULL,'2026-09-16 06:43:44','2026-09-16 06:43:44'),
('3aefff09-80c7-4f25-bb5e-1c2257f55b72','App\\Notifications\\FeedbackWindowOpenedNotification','App\\Models\\User',6,'{\"type\":\"feedback_window_open\",\"title\":\"Middle Feedback Window Open\",\"message\":\"The middle feedback collection for ACCA Applied Skills September 2026 Cohort is now active (Target date: 2026-10-16). Your feedback ensures continuous academic quality.\",\"batch_id\":7,\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"period\":\"middle\",\"due_date\":\"2026-10-16\",\"action_url\":\"\\/dashboard\"}',NULL,'2026-09-16 06:19:10','2026-09-16 06:19:10'),
('3fe75e33-2e41-43a8-8696-8bf3e51c77ec','App\\Notifications\\FeedbackSubmittedNotification','App\\Models\\User',6,'{\"type\":\"feedback_submitted\",\"title\":\"New Beginning Feedback Received\",\"message\":\"Brian Susan Kariuki submitted Beginning feedback (\\u2605\\u2605\\u2605\\u2605\\u2605) for ACCA FIA September 2026 Cohort: \\\"Fantastic guidance on maintaining financial records and trial balances...\\\"\",\"feedback_id\":4,\"feedback_uuid\":\"ad2fd967-4600-44a7-a8ea-a8904454f8d3\",\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"student_name\":\"Brian Susan Kariuki\",\"period\":\"beginning\",\"rating\":5,\"action_url\":\"\\/feedback\"}',NULL,'2026-09-16 06:04:10','2026-09-16 06:04:10'),
('414e9605-f64b-4718-854e-02db796f87b7','App\\Notifications\\FeedbackWindowOpenedNotification','App\\Models\\User',5,'{\"type\":\"feedback_window_open\",\"title\":\"Middle Feedback Window Open\",\"message\":\"The middle feedback collection for ACCA Applied Skills September 2026 Cohort is now active (Target date: 2026-10-16). Your feedback ensures continuous academic quality.\",\"batch_id\":7,\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"period\":\"middle\",\"due_date\":\"2026-10-16\",\"action_url\":\"\\/dashboard\"}',NULL,'2026-09-16 06:19:10','2026-09-16 06:19:10'),
('44a09013-5efc-48a4-8f3d-5cc4de61aef1','App\\Notifications\\FeedbackWindowOpenedNotification','App\\Models\\User',5,'{\"type\":\"feedback_window_open\",\"title\":\"Beginning Feedback Window Open\",\"message\":\"The beginning feedback collection for ACCA FIA September 2026 Cohort is now active (Target date: 2026-09-25). Your feedback ensures continuous academic quality.\",\"batch_id\":5,\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"period\":\"beginning\",\"due_date\":\"2026-09-25\",\"action_url\":\"\\/dashboard\"}',NULL,'2026-09-16 06:43:44','2026-09-16 06:43:44'),
('4c91a93f-3dbf-4131-bff2-881697d7ebb3','App\\Notifications\\EnrollmentApprovedNotification','App\\Models\\User',15,'{\"type\":\"enrollment_approved\",\"title\":\"Accepted into ACCA\",\"message\":\"Welcome to ACCA Applied Skills September 2026 Cohort! Your enrollment has been accepted and approved. Your class schedule, materials, and assessments are now active.\",\"enrollment_number\":\"ENR-ACCA-0015-7\",\"course_name\":\"ACCA\",\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"action_url\":\"\\/dashboard\",\"batch_id\":7}',NULL,'2026-09-16 06:19:10','2026-09-16 06:19:10'),
('505c14bf-60c2-4f61-af40-2d12ab4ad800','App\\Notifications\\FeedbackSubmittedNotification','App\\Models\\User',6,'{\"type\":\"feedback_submitted\",\"title\":\"New Beginning Feedback Received\",\"message\":\"Brian Susan Kariuki submitted Beginning feedback (\\u2605\\u2605\\u2605\\u2605\\u2605) for ACCA FIA September 2026 Cohort: \\\"Fantastic guidance on maintaining financial records and trial balances...\\\"\",\"feedback_id\":4,\"feedback_uuid\":\"ad2fd967-4600-44a7-a8ea-a8904454f8d3\",\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"student_name\":\"Brian Susan Kariuki\",\"period\":\"beginning\",\"rating\":5,\"action_url\":\"\\/feedback\"}',NULL,'2026-09-16 06:43:44','2026-09-16 06:43:44'),
('520c74d7-ffa6-4f8d-bfb6-7c71141b5417','App\\Notifications\\FeedbackSubmittedNotification','App\\Models\\User',6,'{\"type\":\"feedback_submitted\",\"title\":\"New Beginning Feedback Received\",\"message\":\"Jane Akinyi Oduor submitted Beginning feedback (\\u2605\\u2605\\u2605\\u2605\\u2605) for ACCA Applied Skills September 2026 Cohort: \\\"The morning CL sessions at 6:00 AM are very sharp and well-structured....\\\"\",\"feedback_id\":5,\"feedback_uuid\":\"a9284eac-4280-4e89-9f5d-2a2126874735\",\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"student_name\":\"Jane Akinyi Oduor\",\"period\":\"beginning\",\"rating\":5,\"action_url\":\"\\/feedback\"}',NULL,'2026-09-16 06:43:44','2026-09-16 06:43:44'),
('52111f2e-c1e9-41b5-8b9c-6dc1ecf28932','App\\Notifications\\EnrollmentApprovedNotification','App\\Models\\User',19,'{\"type\":\"enrollment_approved\",\"title\":\"Accepted into ACCA\",\"message\":\"Welcome to ACCA FIA September 2026 Cohort! Your enrollment has been accepted and approved. Your class schedule, materials, and assessments are now active.\",\"enrollment_number\":\"ENR-ACCA-0019-5\",\"course_name\":\"ACCA\",\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"action_url\":\"\\/dashboard\",\"batch_id\":5}',NULL,'2026-09-16 06:43:41','2026-09-16 06:43:41'),
('53d739b2-e561-4ce0-be57-e583b2ad12a3','App\\Notifications\\FeedbackSubmittedNotification','App\\Models\\User',5,'{\"type\":\"feedback_submitted\",\"title\":\"New Beginning Feedback Received\",\"message\":\"Alex Mutua Kioko submitted Beginning feedback (\\u2605\\u2605\\u2605\\u2605\\u2606) for ACCA Applied Skills September 2026 Cohort: \\\"Taxation practice questions are very comprehensive. Would appreciate a...\\\"\",\"feedback_id\":6,\"feedback_uuid\":\"1f53a045-1cea-482f-ab90-c45187bdd914\",\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"student_name\":\"Alex Mutua Kioko\",\"period\":\"beginning\",\"rating\":4,\"action_url\":\"\\/feedback\"}',NULL,'2026-09-16 06:43:44','2026-09-16 06:43:44'),
('540ce401-cddc-4298-bd4e-4e3278cacd92','App\\Notifications\\EnrollmentApprovedNotification','App\\Models\\User',19,'{\"type\":\"enrollment_approved\",\"title\":\"Accepted into ACCA\",\"message\":\"Welcome to ACCA FIA September 2026 Cohort! Your enrollment has been accepted and approved. Your class schedule, materials, and assessments are now active.\",\"enrollment_number\":\"ENR-ACCA-0019-5\",\"course_name\":\"ACCA\",\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"action_url\":\"\\/dashboard\",\"batch_id\":5}',NULL,'2026-09-16 06:42:31','2026-09-16 06:42:31'),
('55d74e73-8609-4344-b5cd-9a6c3936ccf6','App\\Notifications\\FeedbackSubmittedNotification','App\\Models\\User',6,'{\"type\":\"feedback_submitted\",\"title\":\"New Beginning Feedback Received\",\"message\":\"Alex Mutua Kioko submitted Beginning feedback (\\u2605\\u2605\\u2605\\u2605\\u2606) for ACCA Applied Skills September 2026 Cohort: \\\"Taxation practice questions are very comprehensive. Would appreciate a...\\\"\",\"feedback_id\":6,\"feedback_uuid\":\"1f53a045-1cea-482f-ab90-c45187bdd914\",\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"student_name\":\"Alex Mutua Kioko\",\"period\":\"beginning\",\"rating\":4,\"action_url\":\"\\/feedback\"}',NULL,'2026-09-16 06:19:10','2026-09-16 06:19:10'),
('57501aa1-6d1b-437c-836a-f0f19520ead2','App\\Notifications\\EnrollmentApprovedNotification','App\\Models\\User',19,'{\"type\":\"enrollment_approved\",\"title\":\"Accepted into ACCA\",\"message\":\"Welcome to ACCA FIA September 2026 Cohort! Your enrollment has been accepted and approved. Your class schedule, materials, and assessments are now active.\",\"enrollment_number\":\"ENR-ACCA-0019-5\",\"course_name\":\"ACCA\",\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"action_url\":\"\\/dashboard\",\"batch_id\":5}',NULL,'2026-09-16 06:19:10','2026-09-16 06:19:10'),
('588194b6-a212-4f53-8584-d673fa0170c4','App\\Notifications\\FeedbackSubmittedNotification','App\\Models\\User',5,'{\"type\":\"feedback_submitted\",\"title\":\"New Beginning Feedback Received\",\"message\":\"Jane Akinyi Oduor submitted Beginning feedback (\\u2605\\u2605\\u2605\\u2605\\u2606) for ACCA Applied Skills September 2026 Cohort: \\\"Taxation practice questions are very comprehensive. Would appreciate a...\\\"\",\"feedback_id\":2,\"feedback_uuid\":\"dc1259fb-b079-42ef-9c75-84812789bc2b\",\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"student_name\":\"Jane Akinyi Oduor\",\"period\":\"beginning\",\"rating\":4,\"action_url\":\"\\/feedback\"}',NULL,'2026-09-16 06:04:10','2026-09-16 06:04:10'),
('5aeefc39-87c3-4260-b124-a17913c1d401','App\\Notifications\\EnrollmentApprovedNotification','App\\Models\\User',16,'{\"type\":\"enrollment_approved\",\"title\":\"Accepted into ACCA\",\"message\":\"Welcome to ACCA Applied Skills September 2026 Cohort! Your enrollment has been accepted and approved. Your class schedule, materials, and assessments are now active.\",\"enrollment_number\":\"ENR-ACCA-0016-7\",\"course_name\":\"ACCA\",\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"action_url\":\"\\/dashboard\",\"batch_id\":7}',NULL,'2026-09-16 06:04:09','2026-09-16 06:04:09'),
('5ba775bd-c5ad-44df-a212-b4a7be15dc98','App\\Notifications\\EnrollmentApprovedNotification','App\\Models\\User',17,'{\"type\":\"enrollment_approved\",\"title\":\"Accepted into ACCA\",\"message\":\"Welcome to ACCA FIA September 2026 Cohort! Your enrollment has been accepted and approved. Your class schedule, materials, and assessments are now active.\",\"enrollment_number\":\"ENR-ACCA-0017-5\",\"course_name\":\"ACCA\",\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"action_url\":\"\\/dashboard\",\"batch_id\":5}',NULL,'2026-09-16 06:42:31','2026-09-16 06:42:31'),
('611f5b84-e3f5-4f06-8508-2d86d80f7273','App\\Notifications\\FeedbackWindowOpenedNotification','App\\Models\\User',6,'{\"type\":\"feedback_window_open\",\"title\":\"Middle Feedback Window Open\",\"message\":\"The middle feedback collection for ACCA Applied Skills September 2026 Cohort is now active (Target date: 2026-10-16). Your feedback ensures continuous academic quality.\",\"batch_id\":7,\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"period\":\"middle\",\"due_date\":\"2026-10-16\",\"action_url\":\"\\/dashboard\"}',NULL,'2026-09-16 06:43:44','2026-09-16 06:43:44'),
('683db133-d879-4ff0-bd7a-82feff7e49e5','App\\Notifications\\FeedbackSubmittedNotification','App\\Models\\User',5,'{\"type\":\"feedback_submitted\",\"title\":\"New Beginning Feedback Received\",\"message\":\"Brian Susan Kariuki submitted Beginning feedback (\\u2605\\u2605\\u2605\\u2605\\u2605) for ACCA FIA September 2026 Cohort: \\\"Fantastic guidance on maintaining financial records and trial balances...\\\"\",\"feedback_id\":4,\"feedback_uuid\":\"ad2fd967-4600-44a7-a8ea-a8904454f8d3\",\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"student_name\":\"Brian Susan Kariuki\",\"period\":\"beginning\",\"rating\":5,\"action_url\":\"\\/feedback\"}',NULL,'2026-09-16 06:43:44','2026-09-16 06:43:44'),
('6956f6d6-7dc2-4de4-b70b-74f875a98171','App\\Notifications\\FeedbackWindowOpenedNotification','App\\Models\\User',5,'{\"type\":\"feedback_window_open\",\"title\":\"Middle Feedback Window Open\",\"message\":\"The middle feedback collection for ACCA Applied Skills September 2026 Cohort is now active (Target date: 2026-10-16). Your feedback ensures continuous academic quality.\",\"batch_id\":7,\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"period\":\"middle\",\"due_date\":\"2026-10-16\",\"action_url\":\"\\/dashboard\"}',NULL,'2026-09-16 06:43:44','2026-09-16 06:43:44'),
('6a8f9aa8-9fb1-4d9e-8e09-8601947b78ce','App\\Notifications\\FeedbackWindowOpenedNotification','App\\Models\\User',6,'{\"type\":\"feedback_window_open\",\"title\":\"Exit Feedback Window Open\",\"message\":\"The exit feedback collection for ACCA FIA September 2026 Cohort is now active (Target date: 2026-11-20). Your feedback ensures continuous academic quality.\",\"batch_id\":5,\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"period\":\"exit\",\"due_date\":\"2026-11-20\",\"action_url\":\"\\/dashboard\"}',NULL,'2026-09-16 06:19:10','2026-09-16 06:19:10'),
('71b68a4b-f570-4691-8014-2d7d62f9e5dd','App\\Notifications\\EnrollmentApprovedNotification','App\\Models\\User',13,'{\"type\":\"enrollment_approved\",\"title\":\"Accepted into ACCA\",\"message\":\"Welcome to ACCA Applied Skills September 2026 Cohort! Your enrollment has been accepted and approved. Your class schedule, materials, and assessments are now active.\",\"enrollment_number\":\"ENR-ACCA-0013-7\",\"course_name\":\"ACCA\",\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"action_url\":\"\\/dashboard\",\"batch_id\":7}','2026-09-16 06:25:29','2026-09-16 06:04:09','2026-09-16 06:25:29'),
('747e1e76-e132-49fc-ac55-92da92f4bd86','App\\Notifications\\EnrollmentApprovedNotification','App\\Models\\User',17,'{\"type\":\"enrollment_approved\",\"title\":\"Accepted into ACCA\",\"message\":\"Welcome to ACCA FIA September 2026 Cohort! Your enrollment has been accepted and approved. Your class schedule, materials, and assessments are now active.\",\"enrollment_number\":\"ENR-ACCA-0017-5\",\"course_name\":\"ACCA\",\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"action_url\":\"\\/dashboard\",\"batch_id\":5}',NULL,'2026-09-16 06:19:10','2026-09-16 06:19:10'),
('780db99a-24b0-4e61-b772-fa6546d7d867','App\\Notifications\\FeedbackWindowOpenedNotification','App\\Models\\User',6,'{\"type\":\"feedback_window_open\",\"title\":\"Exit Feedback Window Open\",\"message\":\"The exit feedback collection for ACCA FIA September 2026 Cohort is now active (Target date: 2026-11-20). Your feedback ensures continuous academic quality.\",\"batch_id\":5,\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"period\":\"exit\",\"due_date\":\"2026-11-20\",\"action_url\":\"\\/dashboard\"}',NULL,'2026-09-16 06:43:44','2026-09-16 06:43:44'),
('7bb564b6-c091-48ad-9220-c2dfc8396809','App\\Notifications\\FeedbackSubmittedNotification','App\\Models\\User',5,'{\"type\":\"feedback_submitted\",\"title\":\"New Beginning Feedback Received\",\"message\":\"Diana Chebet Koech submitted Beginning feedback (\\u2605\\u2605\\u2605\\u2605\\u2605) for ACCA FIA September 2026 Cohort: \\\"FFA double-entry lectures are excellent! Breaking down into two 2-hour...\\\"\",\"feedback_id\":3,\"feedback_uuid\":\"548f8621-b2ba-46f8-bec4-4f5ac05bec34\",\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"student_name\":\"Diana Chebet Koech\",\"period\":\"beginning\",\"rating\":5,\"action_url\":\"\\/feedback\"}',NULL,'2026-09-16 06:19:10','2026-09-16 06:19:10'),
('7f55793c-fbcc-4586-8a49-4ff6e1559a42','App\\Notifications\\FeedbackSubmittedNotification','App\\Models\\User',5,'{\"type\":\"feedback_submitted\",\"title\":\"New Beginning Feedback Received\",\"message\":\"Diana Chebet Koech submitted Beginning feedback (\\u2605\\u2605\\u2605\\u2605\\u2605) for ACCA FIA September 2026 Cohort: \\\"FFA double-entry lectures are excellent! Breaking down into two 2-hour...\\\"\",\"feedback_id\":3,\"feedback_uuid\":\"548f8621-b2ba-46f8-bec4-4f5ac05bec34\",\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"student_name\":\"Diana Chebet Koech\",\"period\":\"beginning\",\"rating\":5,\"action_url\":\"\\/feedback\"}',NULL,'2026-09-16 06:04:10','2026-09-16 06:04:10'),
('81abe5b8-6132-417a-b927-3d33bd8b3cd0','App\\Notifications\\FeedbackWindowOpenedNotification','App\\Models\\User',5,'{\"type\":\"feedback_window_open\",\"title\":\"Beginning Feedback Window Open\",\"message\":\"The beginning feedback collection for ACCA FIA September 2026 Cohort is now active (Target date: 2026-09-25). Your feedback ensures continuous academic quality.\",\"batch_id\":5,\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"period\":\"beginning\",\"due_date\":\"2026-09-25\",\"action_url\":\"\\/dashboard\"}',NULL,'2026-09-16 06:04:10','2026-09-16 06:04:10'),
('8d180bc7-5b86-424c-b396-b84ae3f1dcb9','App\\Notifications\\EnrollmentApprovedNotification','App\\Models\\User',20,'{\"type\":\"enrollment_approved\",\"title\":\"Accepted into ACCA\",\"message\":\"Welcome to ACCA FIA September 2026 Cohort! Your enrollment has been accepted and approved. Your class schedule, materials, and assessments are now active.\",\"enrollment_number\":\"ENR-ACCA-0020-5\",\"course_name\":\"ACCA\",\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"action_url\":\"\\/dashboard\",\"batch_id\":5}',NULL,'2026-09-16 06:04:10','2026-09-16 06:04:10'),
('8f4f6427-5a1d-4e07-b8af-e7115bd1e97b','App\\Notifications\\FeedbackWindowOpenedNotification','App\\Models\\User',5,'{\"type\":\"feedback_window_open\",\"title\":\"Beginning Feedback Window Open\",\"message\":\"The beginning feedback collection for ACCA Applied Skills September 2026 Cohort is now active (Target date: 2026-09-25). Your feedback ensures continuous academic quality.\",\"batch_id\":7,\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"period\":\"beginning\",\"due_date\":\"2026-09-25\",\"action_url\":\"\\/dashboard\"}',NULL,'2026-09-16 06:43:44','2026-09-16 06:43:44'),
('9119ce6f-316f-4b56-8813-31e5f66095e7','App\\Notifications\\FeedbackWindowOpenedNotification','App\\Models\\User',6,'{\"type\":\"feedback_window_open\",\"title\":\"Exit Feedback Window Open\",\"message\":\"The exit feedback collection for ACCA FIA September 2026 Cohort is now active (Target date: 2026-11-20). Your feedback ensures continuous academic quality.\",\"batch_id\":5,\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"period\":\"exit\",\"due_date\":\"2026-11-20\",\"action_url\":\"\\/dashboard\"}',NULL,'2026-09-16 06:04:10','2026-09-16 06:04:10'),
('919db8e4-6bd8-4ba5-a01b-ce23c5a45bf7','App\\Notifications\\EnrollmentApprovedNotification','App\\Models\\User',14,'{\"type\":\"enrollment_approved\",\"title\":\"Accepted into ACCA\",\"message\":\"Welcome to ACCA Applied Skills September 2026 Cohort! Your enrollment has been accepted and approved. Your class schedule, materials, and assessments are now active.\",\"enrollment_number\":\"ENR-ACCA-0014-7\",\"course_name\":\"ACCA\",\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"action_url\":\"\\/dashboard\",\"batch_id\":7}',NULL,'2026-09-16 06:04:09','2026-09-16 06:04:09'),
('95501f2e-5662-4e0e-a751-8a1f3f9d1818','App\\Notifications\\EnrollmentApprovedNotification','App\\Models\\User',17,'{\"type\":\"enrollment_approved\",\"title\":\"Accepted into ACCA\",\"message\":\"Welcome to ACCA FIA September 2026 Cohort! Your enrollment has been accepted and approved. Your class schedule, materials, and assessments are now active.\",\"enrollment_number\":\"ENR-ACCA-0017-5\",\"course_name\":\"ACCA\",\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"action_url\":\"\\/dashboard\",\"batch_id\":5}',NULL,'2026-09-16 06:43:41','2026-09-16 06:43:41'),
('9640300e-98de-4361-a6c5-e5e79d4b20ca','App\\Notifications\\FeedbackWindowOpenedNotification','App\\Models\\User',5,'{\"type\":\"feedback_window_open\",\"title\":\"Middle Feedback Window Open\",\"message\":\"The middle feedback collection for ACCA FIA September 2026 Cohort is now active (Target date: 2026-10-16). Your feedback ensures continuous academic quality.\",\"batch_id\":5,\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"period\":\"middle\",\"due_date\":\"2026-10-16\",\"action_url\":\"\\/dashboard\"}',NULL,'2026-09-16 06:43:44','2026-09-16 06:43:44'),
('9988d555-f59e-4211-bbd7-98d909e805f1','App\\Notifications\\FeedbackSubmittedNotification','App\\Models\\User',5,'{\"type\":\"feedback_submitted\",\"title\":\"New Beginning Feedback Received\",\"message\":\"Diana Chebet Koech submitted Beginning feedback (\\u2605\\u2605\\u2605\\u2605\\u2605) for ACCA FIA September 2026 Cohort: \\\"FFA double-entry lectures are excellent! Breaking down into two 2-hour...\\\"\",\"feedback_id\":3,\"feedback_uuid\":\"548f8621-b2ba-46f8-bec4-4f5ac05bec34\",\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"student_name\":\"Diana Chebet Koech\",\"period\":\"beginning\",\"rating\":5,\"action_url\":\"\\/feedback\"}',NULL,'2026-09-16 06:43:44','2026-09-16 06:43:44'),
('9f2e1fb0-a424-488f-9e43-44c262b717af','App\\Notifications\\FeedbackWindowOpenedNotification','App\\Models\\User',5,'{\"type\":\"feedback_window_open\",\"title\":\"Exit Feedback Window Open\",\"message\":\"The exit feedback collection for ACCA Applied Skills September 2026 Cohort is now active (Target date: 2026-11-20). Your feedback ensures continuous academic quality.\",\"batch_id\":7,\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"period\":\"exit\",\"due_date\":\"2026-11-20\",\"action_url\":\"\\/dashboard\"}',NULL,'2026-09-16 06:43:44','2026-09-16 06:43:44'),
('9f4781c9-347b-4de5-84a0-d6b19b77f310','App\\Notifications\\FeedbackSubmittedNotification','App\\Models\\User',6,'{\"type\":\"feedback_submitted\",\"title\":\"New Beginning Feedback Received\",\"message\":\"Alex Mutua Kioko submitted Beginning feedback (\\u2605\\u2605\\u2605\\u2605\\u2606) for ACCA Applied Skills September 2026 Cohort: \\\"Taxation practice questions are very comprehensive. Would appreciate a...\\\"\",\"feedback_id\":6,\"feedback_uuid\":\"1f53a045-1cea-482f-ab90-c45187bdd914\",\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"student_name\":\"Alex Mutua Kioko\",\"period\":\"beginning\",\"rating\":4,\"action_url\":\"\\/feedback\"}',NULL,'2026-09-16 06:43:44','2026-09-16 06:43:44'),
('a01ab71e-2c8d-443b-93da-c1ea0c4877fa','App\\Notifications\\FeedbackSubmittedNotification','App\\Models\\User',6,'{\"type\":\"feedback_submitted\",\"title\":\"New Beginning Feedback Received\",\"message\":\"Diana Chebet Koech submitted Beginning feedback (\\u2605\\u2605\\u2605\\u2605\\u2605) for ACCA FIA September 2026 Cohort: \\\"FFA double-entry lectures are excellent! Breaking down into two 2-hour...\\\"\",\"feedback_id\":3,\"feedback_uuid\":\"548f8621-b2ba-46f8-bec4-4f5ac05bec34\",\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"student_name\":\"Diana Chebet Koech\",\"period\":\"beginning\",\"rating\":5,\"action_url\":\"\\/feedback\"}',NULL,'2026-09-16 06:04:10','2026-09-16 06:04:10'),
('a0435d9b-6754-4ef9-b76f-702ee76b5e47','App\\Notifications\\EnrollmentApprovedNotification','App\\Models\\User',15,'{\"type\":\"enrollment_approved\",\"title\":\"Accepted into ACCA\",\"message\":\"Welcome to ACCA Applied Skills September 2026 Cohort! Your enrollment has been accepted and approved. Your class schedule, materials, and assessments are now active.\",\"enrollment_number\":\"ENR-ACCA-0015-7\",\"course_name\":\"ACCA\",\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"action_url\":\"\\/dashboard\",\"batch_id\":7}',NULL,'2026-09-16 06:04:09','2026-09-16 06:04:09'),
('a101dfda-053d-4023-86fb-f88798591f54','App\\Notifications\\FeedbackWindowOpenedNotification','App\\Models\\User',5,'{\"type\":\"feedback_window_open\",\"title\":\"Exit Feedback Window Open\",\"message\":\"The exit feedback collection for ACCA Applied Skills September 2026 Cohort is now active (Target date: 2026-11-20). Your feedback ensures continuous academic quality.\",\"batch_id\":7,\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"period\":\"exit\",\"due_date\":\"2026-11-20\",\"action_url\":\"\\/dashboard\"}',NULL,'2026-09-16 06:19:10','2026-09-16 06:19:10'),
('a19b57c1-2c05-471d-9f73-deac953cdec4','App\\Notifications\\EnrollmentApprovedNotification','App\\Models\\User',17,'{\"type\":\"enrollment_approved\",\"title\":\"Accepted into ACCA\",\"message\":\"Welcome to ACCA FIA September 2026 Cohort! Your enrollment has been accepted and approved. Your class schedule, materials, and assessments are now active.\",\"enrollment_number\":\"ENR-ACCA-0017-5\",\"course_name\":\"ACCA\",\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"action_url\":\"\\/dashboard\",\"batch_id\":5}',NULL,'2026-09-16 06:04:09','2026-09-16 06:04:09'),
('a2796cd8-25a6-4148-9f62-6d45ef68f5b5','App\\Notifications\\FeedbackSubmittedNotification','App\\Models\\User',5,'{\"type\":\"feedback_submitted\",\"title\":\"New Beginning Feedback Received\",\"message\":\"Brian Susan Kariuki submitted Beginning feedback (\\u2605\\u2605\\u2605\\u2605\\u2605) for ACCA FIA September 2026 Cohort: \\\"Fantastic guidance on maintaining financial records and trial balances...\\\"\",\"feedback_id\":4,\"feedback_uuid\":\"ad2fd967-4600-44a7-a8ea-a8904454f8d3\",\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"student_name\":\"Brian Susan Kariuki\",\"period\":\"beginning\",\"rating\":5,\"action_url\":\"\\/feedback\"}',NULL,'2026-09-16 06:19:10','2026-09-16 06:19:10'),
('a3bb8d7e-0f57-432b-8c54-55ebe184685c','App\\Notifications\\FinanceClearedNotification','App\\Models\\User',18,'{\"type\":\"finance_cleared\",\"title\":\"Enrollment approved\",\"message\":\"Your finance approval is complete. You can now prepare to begin training.\",\"enrollment_number\":\"ENR-2026-0007\",\"course_name\":\"ACCA\",\"action_url\":\"\\/dashboard\"}',NULL,'2026-09-11 16:24:41','2026-09-11 16:24:41'),
('a3ca03c6-97ea-402e-9dd9-2bdbe068aa50','App\\Notifications\\EnrollmentApprovedNotification','App\\Models\\User',14,'{\"type\":\"enrollment_approved\",\"title\":\"Accepted into ACCA\",\"message\":\"Welcome to ACCA Applied Skills September 2026 Cohort! Your enrollment has been accepted and approved. Your class schedule, materials, and assessments are now active.\",\"enrollment_number\":\"ENR-ACCA-0014-7\",\"course_name\":\"ACCA\",\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"action_url\":\"\\/dashboard\",\"batch_id\":7}',NULL,'2026-09-16 06:42:31','2026-09-16 06:42:31'),
('a7d35ffd-6446-4df3-9fdb-b60ffbd1ff14','App\\Notifications\\FeedbackWindowOpenedNotification','App\\Models\\User',6,'{\"type\":\"feedback_window_open\",\"title\":\"Beginning Feedback Window Open\",\"message\":\"The beginning feedback collection for ACCA Applied Skills September 2026 Cohort is now active (Target date: 2026-09-25). Your feedback ensures continuous academic quality.\",\"batch_id\":7,\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"period\":\"beginning\",\"due_date\":\"2026-09-25\",\"action_url\":\"\\/dashboard\"}',NULL,'2026-09-16 06:04:10','2026-09-16 06:04:10'),
('a939d806-bce6-4018-953d-7cb9a9155b98','App\\Notifications\\EnrollmentApprovedNotification','App\\Models\\User',18,'{\"type\":\"enrollment_approved\",\"title\":\"Accepted into ACCA\",\"message\":\"Welcome to ACCA FIA September 2026 Cohort! Your enrollment has been accepted and approved. Your class schedule, materials, and assessments are now active.\",\"enrollment_number\":\"ENR-2026-0007\",\"course_name\":\"ACCA\",\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"action_url\":\"\\/dashboard\",\"batch_id\":5}',NULL,'2026-09-16 06:19:10','2026-09-16 06:19:10'),
('ace37083-35e8-425b-afe3-9c6955012407','App\\Notifications\\EnrollmentApprovedNotification','App\\Models\\User',18,'{\"type\":\"enrollment_approved\",\"title\":\"Accepted into ACCA\",\"message\":\"Welcome to ACCA FIA September 2026 Cohort! Your enrollment has been accepted and approved. Your class schedule, materials, and assessments are now active.\",\"enrollment_number\":\"ENR-2026-0007\",\"course_name\":\"ACCA\",\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"action_url\":\"\\/dashboard\",\"batch_id\":5}',NULL,'2026-09-16 06:04:09','2026-09-16 06:04:09'),
('ad1c12d9-33e1-404c-8967-2518cd1e85c9','App\\Notifications\\FeedbackWindowOpenedNotification','App\\Models\\User',5,'{\"type\":\"feedback_window_open\",\"title\":\"Middle Feedback Window Open\",\"message\":\"The middle feedback collection for ACCA FIA September 2026 Cohort is now active (Target date: 2026-10-16). Your feedback ensures continuous academic quality.\",\"batch_id\":5,\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"period\":\"middle\",\"due_date\":\"2026-10-16\",\"action_url\":\"\\/dashboard\"}',NULL,'2026-09-16 06:19:10','2026-09-16 06:19:10'),
('b198c9b9-533f-4ddf-8d10-88cf75d992b9','App\\Notifications\\FeedbackSubmittedNotification','App\\Models\\User',5,'{\"type\":\"feedback_submitted\",\"title\":\"New Beginning Feedback Received\",\"message\":\"Jane Akinyi Oduor submitted Beginning feedback (\\u2605\\u2605\\u2605\\u2605\\u2605) for ACCA Applied Skills September 2026 Cohort: \\\"The morning CL sessions at 6:00 AM are very sharp and well-structured....\\\"\",\"feedback_id\":5,\"feedback_uuid\":\"a9284eac-4280-4e89-9f5d-2a2126874735\",\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"student_name\":\"Jane Akinyi Oduor\",\"period\":\"beginning\",\"rating\":5,\"action_url\":\"\\/feedback\"}',NULL,'2026-09-16 06:43:44','2026-09-16 06:43:44'),
('b5003c78-8357-479a-886a-f27d61613597','App\\Notifications\\FeedbackWindowOpenedNotification','App\\Models\\User',6,'{\"type\":\"feedback_window_open\",\"title\":\"Beginning Feedback Window Open\",\"message\":\"The beginning feedback collection for ACCA FIA September 2026 Cohort is now active (Target date: 2026-09-25). Your feedback ensures continuous academic quality.\",\"batch_id\":5,\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"period\":\"beginning\",\"due_date\":\"2026-09-25\",\"action_url\":\"\\/dashboard\"}',NULL,'2026-09-16 06:43:44','2026-09-16 06:43:44'),
('be878fcc-2cec-420a-bc11-63f6f7e3a33a','App\\Notifications\\FeedbackWindowOpenedNotification','App\\Models\\User',6,'{\"type\":\"feedback_window_open\",\"title\":\"Middle Feedback Window Open\",\"message\":\"The middle feedback collection for ACCA Applied Skills September 2026 Cohort is now active (Target date: 2026-10-16). Your feedback ensures continuous academic quality.\",\"batch_id\":7,\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"period\":\"middle\",\"due_date\":\"2026-10-16\",\"action_url\":\"\\/dashboard\"}',NULL,'2026-09-16 06:04:10','2026-09-16 06:04:10'),
('bfd0936a-72ed-44ef-9d8e-039d4e4fd7ff','App\\Notifications\\EnrollmentApprovedNotification','App\\Models\\User',14,'{\"type\":\"enrollment_approved\",\"title\":\"Accepted into ACCA\",\"message\":\"Welcome to ACCA Applied Skills September 2026 Cohort! Your enrollment has been accepted and approved. Your class schedule, materials, and assessments are now active.\",\"enrollment_number\":\"ENR-ACCA-0014-7\",\"course_name\":\"ACCA\",\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"action_url\":\"\\/dashboard\",\"batch_id\":7}',NULL,'2026-09-16 06:43:41','2026-09-16 06:43:41'),
('c4d8df31-4b36-4f37-80f3-0b7444d510ef','App\\Notifications\\EnrollmentApprovedNotification','App\\Models\\User',19,'{\"type\":\"enrollment_approved\",\"title\":\"Accepted into ACCA\",\"message\":\"Welcome to ACCA FIA September 2026 Cohort! Your enrollment has been accepted and approved. Your class schedule, materials, and assessments are now active.\",\"enrollment_number\":\"ENR-ACCA-0019-5\",\"course_name\":\"ACCA\",\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"action_url\":\"\\/dashboard\",\"batch_id\":5}',NULL,'2026-09-16 06:04:10','2026-09-16 06:04:10'),
('c7b84800-b3c7-49ea-a506-bf40b497f558','App\\Notifications\\FeedbackWindowOpenedNotification','App\\Models\\User',6,'{\"type\":\"feedback_window_open\",\"title\":\"Beginning Feedback Window Open\",\"message\":\"The beginning feedback collection for ACCA FIA September 2026 Cohort is now active (Target date: 2026-09-25). Your feedback ensures continuous academic quality.\",\"batch_id\":5,\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"period\":\"beginning\",\"due_date\":\"2026-09-25\",\"action_url\":\"\\/dashboard\"}',NULL,'2026-09-16 06:19:10','2026-09-16 06:19:10'),
('caec128f-c564-4344-af23-706c1917c08a','App\\Notifications\\FeedbackSubmittedNotification','App\\Models\\User',5,'{\"type\":\"feedback_submitted\",\"title\":\"New Beginning Feedback Received\",\"message\":\"Brian Susan Kariuki submitted Beginning feedback (\\u2605\\u2605\\u2605\\u2605\\u2605) for ACCA FIA September 2026 Cohort: \\\"Fantastic guidance on maintaining financial records and trial balances...\\\"\",\"feedback_id\":4,\"feedback_uuid\":\"ad2fd967-4600-44a7-a8ea-a8904454f8d3\",\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"student_name\":\"Brian Susan Kariuki\",\"period\":\"beginning\",\"rating\":5,\"action_url\":\"\\/feedback\"}',NULL,'2026-09-16 06:04:10','2026-09-16 06:04:10'),
('cc5937cd-4c54-4120-802c-08f21b4a47c8','App\\Notifications\\FeedbackSubmittedNotification','App\\Models\\User',5,'{\"type\":\"feedback_submitted\",\"title\":\"New Beginning Feedback Received\",\"message\":\"John K. Mwangi submitted Beginning feedback (\\u2605\\u2605\\u2605\\u2605\\u2605) for ACCA Applied Skills September 2026 Cohort: \\\"The morning CL sessions at 6:00 AM are very sharp and well-structured....\\\"\",\"feedback_id\":1,\"feedback_uuid\":\"7f937f52-fa2e-4899-ae9b-fb097b37ab08\",\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"student_name\":\"John K. Mwangi\",\"period\":\"beginning\",\"rating\":5,\"action_url\":\"\\/feedback\"}',NULL,'2026-09-16 06:04:10','2026-09-16 06:04:10'),
('cdea984f-cba3-429d-babe-470bd0e659e5','App\\Notifications\\FeedbackSubmittedNotification','App\\Models\\User',5,'{\"type\":\"feedback_submitted\",\"title\":\"New Beginning Feedback Received\",\"message\":\"Jane Akinyi Oduor submitted Beginning feedback (\\u2605\\u2605\\u2605\\u2605\\u2605) for ACCA Applied Skills September 2026 Cohort: \\\"The morning CL sessions at 6:00 AM are very sharp and well-structured....\\\"\",\"feedback_id\":5,\"feedback_uuid\":\"a9284eac-4280-4e89-9f5d-2a2126874735\",\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"student_name\":\"Jane Akinyi Oduor\",\"period\":\"beginning\",\"rating\":5,\"action_url\":\"\\/feedback\"}',NULL,'2026-09-16 06:19:10','2026-09-16 06:19:10'),
('cffc4f4e-1029-41d0-8765-b7dff5d31fe7','App\\Notifications\\EnrollmentApprovedNotification','App\\Models\\User',16,'{\"type\":\"enrollment_approved\",\"title\":\"Accepted into ACCA\",\"message\":\"Welcome to ACCA Applied Skills September 2026 Cohort! Your enrollment has been accepted and approved. Your class schedule, materials, and assessments are now active.\",\"enrollment_number\":\"ENR-ACCA-0016-7\",\"course_name\":\"ACCA\",\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"action_url\":\"\\/dashboard\",\"batch_id\":7}',NULL,'2026-09-16 06:19:10','2026-09-16 06:19:10'),
('d83e9bcb-da72-460b-8559-e5af7ac17802','App\\Notifications\\FeedbackSubmittedNotification','App\\Models\\User',6,'{\"type\":\"feedback_submitted\",\"title\":\"New Beginning Feedback Received\",\"message\":\"Jane Akinyi Oduor submitted Beginning feedback (\\u2605\\u2605\\u2605\\u2605\\u2605) for ACCA Applied Skills September 2026 Cohort: \\\"The morning CL sessions at 6:00 AM are very sharp and well-structured....\\\"\",\"feedback_id\":5,\"feedback_uuid\":\"a9284eac-4280-4e89-9f5d-2a2126874735\",\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"student_name\":\"Jane Akinyi Oduor\",\"period\":\"beginning\",\"rating\":5,\"action_url\":\"\\/feedback\"}',NULL,'2026-09-16 06:19:10','2026-09-16 06:19:10'),
('dac655e3-becd-4a67-9dc5-00db2094ff44','App\\Notifications\\FeedbackWindowOpenedNotification','App\\Models\\User',6,'{\"type\":\"feedback_window_open\",\"title\":\"Beginning Feedback Window Open\",\"message\":\"The beginning feedback collection for ACCA FIA September 2026 Cohort is now active (Target date: 2026-09-25). Your feedback ensures continuous academic quality.\",\"batch_id\":5,\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"period\":\"beginning\",\"due_date\":\"2026-09-25\",\"action_url\":\"\\/dashboard\"}',NULL,'2026-09-16 06:04:10','2026-09-16 06:04:10'),
('dce0fba8-68c9-4689-9605-76c8e7623329','App\\Notifications\\FeedbackWindowOpenedNotification','App\\Models\\User',5,'{\"type\":\"feedback_window_open\",\"title\":\"Exit Feedback Window Open\",\"message\":\"The exit feedback collection for ACCA FIA September 2026 Cohort is now active (Target date: 2026-11-20). Your feedback ensures continuous academic quality.\",\"batch_id\":5,\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"period\":\"exit\",\"due_date\":\"2026-11-20\",\"action_url\":\"\\/dashboard\"}',NULL,'2026-09-16 06:43:44','2026-09-16 06:43:44'),
('e2dcf0a3-dd47-42f4-b0ef-e04ec08aba70','App\\Notifications\\FeedbackWindowOpenedNotification','App\\Models\\User',5,'{\"type\":\"feedback_window_open\",\"title\":\"Middle Feedback Window Open\",\"message\":\"The middle feedback collection for ACCA Applied Skills September 2026 Cohort is now active (Target date: 2026-10-16). Your feedback ensures continuous academic quality.\",\"batch_id\":7,\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"period\":\"middle\",\"due_date\":\"2026-10-16\",\"action_url\":\"\\/dashboard\"}',NULL,'2026-09-16 06:04:10','2026-09-16 06:04:10'),
('ebe81dec-05fb-46b4-b488-de590d859b5d','App\\Notifications\\FeedbackWindowOpenedNotification','App\\Models\\User',6,'{\"type\":\"feedback_window_open\",\"title\":\"Exit Feedback Window Open\",\"message\":\"The exit feedback collection for ACCA Applied Skills September 2026 Cohort is now active (Target date: 2026-11-20). Your feedback ensures continuous academic quality.\",\"batch_id\":7,\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"period\":\"exit\",\"due_date\":\"2026-11-20\",\"action_url\":\"\\/dashboard\"}',NULL,'2026-09-16 06:43:44','2026-09-16 06:43:44'),
('efe904d0-714d-4beb-a8ee-0a6464179119','App\\Notifications\\EnrollmentApprovedNotification','App\\Models\\User',15,'{\"type\":\"enrollment_approved\",\"title\":\"Accepted into ACCA\",\"message\":\"Welcome to ACCA Applied Skills September 2026 Cohort! Your enrollment has been accepted and approved. Your class schedule, materials, and assessments are now active.\",\"enrollment_number\":\"ENR-ACCA-0015-7\",\"course_name\":\"ACCA\",\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"action_url\":\"\\/dashboard\",\"batch_id\":7}',NULL,'2026-09-16 06:43:41','2026-09-16 06:43:41'),
('f1e30c77-22ff-4228-baed-2f06aef66acd','App\\Notifications\\EnrollmentApprovedNotification','App\\Models\\User',16,'{\"type\":\"enrollment_approved\",\"title\":\"Accepted into ACCA\",\"message\":\"Welcome to ACCA Applied Skills September 2026 Cohort! Your enrollment has been accepted and approved. Your class schedule, materials, and assessments are now active.\",\"enrollment_number\":\"ENR-ACCA-0016-7\",\"course_name\":\"ACCA\",\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"action_url\":\"\\/dashboard\",\"batch_id\":7}',NULL,'2026-09-16 06:43:41','2026-09-16 06:43:41'),
('f76a3dad-2083-444d-887d-3f59e2c89658','App\\Notifications\\FeedbackWindowOpenedNotification','App\\Models\\User',5,'{\"type\":\"feedback_window_open\",\"title\":\"Exit Feedback Window Open\",\"message\":\"The exit feedback collection for ACCA FIA September 2026 Cohort is now active (Target date: 2026-11-20). Your feedback ensures continuous academic quality.\",\"batch_id\":5,\"batch_name\":\"ACCA FIA September 2026 Cohort\",\"period\":\"exit\",\"due_date\":\"2026-11-20\",\"action_url\":\"\\/dashboard\"}',NULL,'2026-09-16 06:04:10','2026-09-16 06:04:10'),
('fba50bf0-a239-4521-9b50-dfc8cf88a9c5','App\\Notifications\\FeedbackWindowOpenedNotification','App\\Models\\User',6,'{\"type\":\"feedback_window_open\",\"title\":\"Exit Feedback Window Open\",\"message\":\"The exit feedback collection for ACCA Applied Skills September 2026 Cohort is now active (Target date: 2026-11-20). Your feedback ensures continuous academic quality.\",\"batch_id\":7,\"batch_name\":\"ACCA Applied Skills September 2026 Cohort\",\"period\":\"exit\",\"due_date\":\"2026-11-20\",\"action_url\":\"\\/dashboard\"}',NULL,'2026-09-16 06:19:10','2026-09-16 06:19:10');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `organizations`
--

DROP TABLE IF EXISTS `organizations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `organizations` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(50) NOT NULL,
  `logo_path` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
  `settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`settings`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `organizations_uuid_unique` (`uuid`),
  UNIQUE KEY `organizations_code_unique` (`code`),
  KEY `organizations_code_index` (`code`),
  KEY `organizations_status_index` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organizations`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `organizations` WRITE;
/*!40000 ALTER TABLE `organizations` DISABLE KEYS */;
INSERT INTO `organizations` VALUES
(1,'b6d66b4c-2785-4728-bfe3-efab97a2019e','Institute of Advanced Technology Ltd','IAT',NULL,'contact@iat.ac.ke','+254 700 123456','https://www.iat.ac.ke','IAT Towers, University Way, Nairobi, Kenya','active','{\"timezone\":\"Africa\\/Nairobi\",\"currency\":\"KES\",\"date_format\":\"Y-m-d\",\"student_id_prefix\":\"IAT\",\"certificate_prefix\":\"CERT-IAT\"}','2026-09-07 17:59:09','2026-09-07 17:59:09',NULL);
/*!40000 ALTER TABLE `organizations` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL DEFAULT 'sanctum',
  `group_name` varchar(255) NOT NULL DEFAULT 'general',
  `display_name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permissions_name_guard_name_unique` (`name`,`guard_name`),
  KEY `permissions_group_name_index` (`group_name`)
) ENGINE=InnoDB AUTO_INCREMENT=80 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES
(1,'users.view','sanctum','Users','View Users','Can view users list and details','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(2,'users.create','sanctum','Users','Create Users','Can create new users','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(3,'users.update','sanctum','Users','Update Users','Can update user profiles and status','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(4,'users.delete','sanctum','Users','Delete Users','Can soft-delete users','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(5,'users.manage-roles','sanctum','Users','Manage User Roles','Can assign and revoke roles from users','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(6,'roles.view','sanctum','Roles & Permissions','View Roles','Can view roles and permissions','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(7,'roles.create','sanctum','Roles & Permissions','Create Roles','Can create custom dynamic roles','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(8,'roles.update','sanctum','Roles & Permissions','Update Roles','Can update role permissions','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(9,'roles.delete','sanctum','Roles & Permissions','Delete Roles','Can delete custom roles','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(10,'organization.view','sanctum','Organization','View Organization','Can view organization information','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(11,'organization.update','sanctum','Organization','Update Organization','Can update organization profile and branding','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(12,'branches.view','sanctum','Branches','View Branches','Can view branch information','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(13,'branches.create','sanctum','Branches','Create Branches','Can create new branches','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(14,'branches.update','sanctum','Branches','Update Branches','Can update branch details','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(15,'branches.delete','sanctum','Branches','Delete Branches','Can delete branches','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(16,'branches.view-all-branches','sanctum','Branches','View All Branches Data','Can access multi-branch data across the organization','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(17,'departments.view','sanctum','Departments','View Departments','Can view departments','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(18,'departments.create','sanctum','Departments','Create Departments','Can create departments','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(19,'departments.update','sanctum','Departments','Update Departments','Can update departments','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(20,'departments.delete','sanctum','Departments','Delete Departments','Can delete departments','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(21,'positions.manage','sanctum','Positions','Manage Positions','Can manage organizational positions','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(22,'students.view','sanctum','Students','View Students','Can view student roster and profiles','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(23,'students.create','sanctum','Students','Create Students','Can admit new students','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(24,'students.update','sanctum','Students','Update Students','Can update student details and guardian contacts','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(25,'students.delete','sanctum','Students','Delete Students','Can archive student profiles','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(26,'students.view-all-branches','sanctum','Students','View All Branches Students','Can view students across all branches','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(27,'staff.view','sanctum','Staff','View Staff','Can view staff directory','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(28,'staff.create','sanctum','Staff','Create Staff','Can onboard staff','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(29,'staff.update','sanctum','Staff','Update Staff','Can update staff profiles','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(30,'staff.delete','sanctum','Staff','Delete Staff','Can archive staff records','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(31,'course-categories.manage','sanctum','Courses','Manage Course Categories','Can create and manage course categories','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(32,'courses.view','sanctum','Courses','View Courses','Can browse course catalog','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(33,'courses.create','sanctum','Courses','Create Courses','Can create course definitions','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(34,'courses.update','sanctum','Courses','Update Courses','Can edit course curriculum and lessons','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(35,'courses.delete','sanctum','Courses','Delete Courses','Can delete or archive courses','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(36,'modules.manage','sanctum','Courses','Manage Modules','Can manage curriculum modules and reorder','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(37,'lessons.manage','sanctum','Courses','Manage Lessons','Can manage curriculum lessons, resources and videos','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(38,'batches.view','sanctum','Batches','View Batches','Can view cohort batches','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(39,'batches.create','sanctum','Batches','Create Batches','Can schedule new course batches','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(40,'batches.update','sanctum','Batches','Update Batches','Can update batch schedules and capacities','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(41,'batches.delete','sanctum','Batches','Delete Batches','Can cancel or archive batches','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(42,'batches.assign-trainers','sanctum','Batches','Assign Batch Trainers','Can assign lead and assistant trainers to cohorts','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(43,'enrollments.view','sanctum','Enrollments','View Enrollments','Can view batch enrollment rosters','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(44,'enrollments.create','sanctum','Enrollments','Create Enrollments','Can enroll students into batches','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(45,'enrollments.update','sanctum','Enrollments','Update Enrollments','Can modify enrollment status and completions','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(46,'enrollments.delete','sanctum','Enrollments','Delete Enrollments','Can cancel student enrollments','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(47,'enrollments.review','sanctum','Enrollments','Review Enrollments','Can approve enrollment admission at branch level','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(48,'enrollments.finance-clear','sanctum','Enrollments','Clear Enrollment Finance','Can confirm that enrollment fees are cleared','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(49,'enrollments.complete','sanctum','Enrollments','Complete Enrollments','Can approve academic course completion','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(50,'enrollments.certification-approve','sanctum','Enrollments','Approve Certification Readiness','Can approve eligible students for certification','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(51,'finance.view','sanctum','Finance','View Finance Records','Can view fees, balances and payment history','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(52,'finance.create','sanctum','Finance','Record Payments','Can record confirmed student payments','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(53,'finance.update','sanctum','Finance','Manage Finance Records','Can manage fees and reconcile payments','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(54,'classes.view','sanctum','Classes & Attendance','View Classes','Can view class timetable','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(55,'classes.manage','sanctum','Classes & Attendance','Manage Classes','Can schedule and manage class sessions','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(56,'attendance.view','sanctum','Classes & Attendance','View Attendance','Can view attendance records','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(57,'attendance.create','sanctum','Classes & Attendance','Take Attendance','Can mark and submit attendance','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(58,'attendance.update','sanctum','Classes & Attendance','Update Attendance','Can adjust marked attendance','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(59,'attendance.view-all-branches','sanctum','Classes & Attendance','View Org-wide Attendance','Can view attendance across all branches','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(60,'assessments.view','sanctum','Assessments','View Assessments','Can view quizzes, CATs, exams and assignments','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(61,'assessments.create','sanctum','Assessments','Create Assessments','Can create assessments and question banks','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(62,'assessments.update','sanctum','Assessments','Update Assessments','Can edit questions, marks and settings','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(63,'assessments.delete','sanctum','Assessments','Delete Assessments','Can delete assessments','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(64,'assessments.grade','sanctum','Assessments','Grade Assessments','Can grade submissions and enter scores','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(65,'certificates.view','sanctum','Certificates','View Certificates','Can view issued certificates','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(66,'certificates.create-template','sanctum','Certificates','Manage Certificate Templates','Can design certificate templates','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(67,'certificates.issue','sanctum','Certificates','Issue Certificates','Can generate and issue student certificates','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(68,'certificates.revoke','sanctum','Certificates','Revoke Certificates','Can revoke invalid certificates','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(69,'reports.view','sanctum','Reports','View Reports','Can view analytics and report dashboards','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(70,'reports.export','sanctum','Reports','Export Reports','Can export reports to CSV/Excel/PDF','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(71,'reports.view-all-branches','sanctum','Reports','View All Branches Reports','Can view organization-wide reports','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(72,'settings.view','sanctum','Settings & Logs','View Settings','Can view system configuration','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(73,'settings.update','sanctum','Settings & Logs','Update Settings','Can modify system settings','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(74,'audit_logs.view','sanctum','Settings & Logs','View Audit Logs','Can view security audit trail','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(75,'student-portal.access','sanctum','Student Portal','Access Student Portal','Can log into student portal area','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(76,'student-portal.view-grades','sanctum','Student Portal','View Own Grades','Can view personal academic gradebook','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(77,'student-portal.take-quizzes','sanctum','Student Portal','Take Quizzes & Exams','Can attempt quizzes and submit assignments','2026-09-07 17:59:08','2026-09-07 17:59:08'),
(78,'courses.approve','sanctum','Courses','Approve Courses','Can approve completed course curricula for student access','2026-09-11 14:19:24','2026-09-11 14:19:24'),
(79,'audit_logs.manage','sanctum','Settings & Logs','Manage Audit Logs','Can export and clear audit log records','2026-09-18 09:41:47','2026-09-18 09:41:47');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES
(7,'App\\Models\\User',1,'auth_token','9a5fff29b99cdb76c0ff3b0b522db2eb84c3968b58243c517552dd5160dd8bb2','[\"*\"]','2026-09-11 02:21:57',NULL,'2026-09-11 01:54:12','2026-09-11 02:21:57'),
(8,'App\\Models\\User',1,'auth_token','02d4f7dbc9c95e37c7cd34ce8d720ef6f2ad194c1659b8e291bf80f46e1cc55b','[\"*\"]','2026-09-11 13:09:57',NULL,'2026-09-11 03:25:08','2026-09-11 13:09:57'),
(37,'App\\Models\\User',13,'auth_token','f8357dbf53fa9af7a449bc5bf1b61a9a9fda1701c3dceee95e54b1b09d49ceb4','[\"*\"]','2026-09-14 05:28:55',NULL,'2026-09-14 05:15:08','2026-09-14 05:28:55'),
(38,'App\\Models\\User',13,'auth_token','6815c718fca419feff6550a36ef07c12fee863984e4d82fdf532d4a8ede38eb3','[\"*\"]','2026-09-14 10:32:13',NULL,'2026-09-14 09:42:37','2026-09-14 10:32:13'),
(39,'App\\Models\\User',13,'test','e8867f90d536b552b155675a80569e4bc0ae9eb60b3772181ec64a4651e234d2','[\"*\"]','2026-09-14 10:39:50',NULL,'2026-09-14 10:39:02','2026-09-14 10:39:50'),
(44,'App\\Models\\User',13,'auth_token','0222722be8b246c9f4a0d03ebaf0e8e091785a66836dce4cc01eef37d9805200','[\"*\"]','2026-09-16 07:35:51',NULL,'2026-09-16 06:39:15','2026-09-16 07:35:51'),
(45,'App\\Models\\User',1,'auth_token','e90e2a4c865600275030c1eaeb1a06d6bda21251e602b2ab27f92c52661d3f2e','[\"*\"]','2026-09-16 17:20:06',NULL,'2026-09-16 17:16:06','2026-09-16 17:20:06'),
(46,'App\\Models\\User',21,'auth_token','b04a9fabf223c649a8b91915d87ec869e9aab7ccf3bcdf9785a957af62d80041','[\"*\"]',NULL,NULL,'2026-09-16 17:17:35','2026-09-16 17:17:35'),
(47,'App\\Models\\User',21,'auth_token','9dc1913de3cc36245b2a193824c57d441802963e8b9e166c77391d03cd0f56f2','[\"*\"]','2026-09-16 17:18:48',NULL,'2026-09-16 17:18:48','2026-09-16 17:18:48'),
(48,'App\\Models\\User',21,'auth_token','e2d19e1f71ad362ad89cd412ca6b3f534ce0de8c10621c1a78a081208f5aa8df','[\"*\"]','2026-09-16 17:19:05',NULL,'2026-09-16 17:19:05','2026-09-16 17:19:05'),
(49,'App\\Models\\User',21,'auth_token','2236d600db398fd7ccd62a681c29e011e652495a6107e232f0c678d361b6fc1d','[\"*\"]','2026-09-16 17:22:20',NULL,'2026-09-16 17:22:20','2026-09-16 17:22:20'),
(50,'App\\Models\\User',21,'auth_token','85bd3d1b9012351c09cc2be8fae98cde184b7b153f44494b3b9a127a8917626e','[\"*\"]','2026-09-16 17:22:39',NULL,'2026-09-16 17:22:38','2026-09-16 17:22:39'),
(55,'App\\Models\\User',2,'auth_token','8dd27f1ebbc44327f7463d137922f1cd20e5e4a685b61de7008cc501d894a1f7','[\"*\"]','2026-09-18 09:36:36',NULL,'2026-09-18 09:32:36','2026-09-18 09:36:36'),
(56,'App\\Models\\User',1,'auth_token','78efe2a130037b17f10934b0e0d8bec9b23ab90909c7ff4d6a6116022a19d92a','[\"*\"]','2026-09-18 11:05:17',NULL,'2026-09-18 09:37:40','2026-09-18 11:05:17'),
(57,'App\\Models\\User',1,'auth_token','3c329c7f7f97c71ca146c79da04d653c5b201af262a03bda8c30bd921f191c0e','[\"*\"]','2026-09-18 10:29:44',NULL,'2026-09-18 10:28:39','2026-09-18 10:29:44'),
(58,'App\\Models\\User',1,'auth_token','53a0b2cdf962e365a09ceb1291e25b1bb940ebce5b9ed81b9aabe03adb414713','[\"*\"]','2026-09-18 10:30:53',NULL,'2026-09-18 10:29:44','2026-09-18 10:30:53'),
(59,'App\\Models\\User',1,'auth_token','68ab80cb985998d320b2b4cf94998b9e098ee5bf951fb301eb20e6ec3f6899cd','[\"*\"]','2026-09-18 11:04:53',NULL,'2026-09-18 10:30:53','2026-09-18 11:04:53');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `positions`
--

DROP TABLE IF EXISTS `positions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `positions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `organization_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `positions_organization_id_name_unique` (`organization_id`,`name`),
  UNIQUE KEY `positions_uuid_unique` (`uuid`),
  CONSTRAINT `positions_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `positions`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `positions` WRITE;
/*!40000 ALTER TABLE `positions` DISABLE KEYS */;
INSERT INTO `positions` VALUES
(1,'1eae8a37-2551-4b67-a2df-e47f48d83e00',1,'Chief Executive Officer','Executive Management','active','2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(2,'67f60c72-8bb8-4a44-8e96-4d2365dabc69',1,'Branch Manager','Branch Operations & Supervision','active','2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(3,'5aff4e9a-d6ee-4c21-b65d-f3e756b1591d',1,'Academic Manager','Curriculum and Training Supervision','active','2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(4,'73650f67-9fe5-4bbf-a448-5b8f2a023ede',1,'Senior Trainer','Instruction & Assessment','active','2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(5,'fef438d3-8668-4b95-b01f-7fdb8ebc4e95',1,'Assistant Trainer','Lab Assistance & Tutoring','active','2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(6,'549ae8ac-6be2-4ebc-97de-5f2efedde874',1,'Front Office Admissions','Student Intake & Registration','active','2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(7,'1a3e78c4-39ff-4d14-a69d-38ee0d3810b4',1,'Finance Officer','Fees, Receipting & Reconciliation','active','2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(8,'b20d5ae0-2c5e-4a64-b2bd-70eea1eadbae',1,'Admissions Officer','Admissions Review & Enrollment Approval','active','2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(9,'f7b840ee-6a51-404d-b9fd-9a6b56fc2082',1,'Certification Officer','Examinations & Certification Readiness','active','2026-09-07 17:59:09','2026-09-07 17:59:09',NULL);
/*!40000 ALTER TABLE `positions` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `role_has_permissions`
--

DROP TABLE IF EXISTS `role_has_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_has_permissions` (
  `permission_id` bigint(20) unsigned NOT NULL,
  `role_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`permission_id`,`role_id`),
  KEY `role_has_permissions_role_id_foreign` (`role_id`),
  CONSTRAINT `role_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_has_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_has_permissions`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `role_has_permissions` WRITE;
/*!40000 ALTER TABLE `role_has_permissions` DISABLE KEYS */;
INSERT INTO `role_has_permissions` VALUES
(1,1),
(2,1),
(3,1),
(4,1),
(5,1),
(6,1),
(7,1),
(8,1),
(9,1),
(10,1),
(11,1),
(12,1),
(13,1),
(14,1),
(15,1),
(16,1),
(17,1),
(18,1),
(19,1),
(20,1),
(21,1),
(22,1),
(23,1),
(24,1),
(25,1),
(26,1),
(27,1),
(28,1),
(29,1),
(30,1),
(31,1),
(32,1),
(33,1),
(34,1),
(35,1),
(36,1),
(37,1),
(38,1),
(39,1),
(40,1),
(41,1),
(42,1),
(43,1),
(44,1),
(45,1),
(46,1),
(47,1),
(48,1),
(49,1),
(50,1),
(51,1),
(52,1),
(53,1),
(54,1),
(55,1),
(56,1),
(57,1),
(58,1),
(59,1),
(60,1),
(61,1),
(62,1),
(63,1),
(64,1),
(65,1),
(66,1),
(67,1),
(68,1),
(69,1),
(70,1),
(71,1),
(72,1),
(73,1),
(74,1),
(75,1),
(76,1),
(77,1),
(78,1),
(79,1),
(1,2),
(6,2),
(10,2),
(11,2),
(12,2),
(16,2),
(17,2),
(21,2),
(22,2),
(26,2),
(27,2),
(32,2),
(38,2),
(43,2),
(47,2),
(49,2),
(50,2),
(51,2),
(54,2),
(56,2),
(59,2),
(60,2),
(65,2),
(67,2),
(69,2),
(70,2),
(71,2),
(72,2),
(74,2),
(79,2),
(1,3),
(2,3),
(3,3),
(5,3),
(6,3),
(7,3),
(8,3),
(10,3),
(12,3),
(13,3),
(14,3),
(16,3),
(17,3),
(18,3),
(19,3),
(21,3),
(22,3),
(23,3),
(24,3),
(26,3),
(27,3),
(28,3),
(29,3),
(31,3),
(32,3),
(33,3),
(34,3),
(36,3),
(37,3),
(38,3),
(39,3),
(40,3),
(42,3),
(43,3),
(44,3),
(45,3),
(47,3),
(48,3),
(49,3),
(50,3),
(51,3),
(52,3),
(53,3),
(54,3),
(55,3),
(56,3),
(57,3),
(58,3),
(59,3),
(60,3),
(61,3),
(62,3),
(64,3),
(65,3),
(66,3),
(67,3),
(69,3),
(70,3),
(71,3),
(72,3),
(74,3),
(78,3),
(79,3),
(1,4),
(2,4),
(3,4),
(12,4),
(17,4),
(22,4),
(23,4),
(24,4),
(27,4),
(32,4),
(38,4),
(39,4),
(40,4),
(42,4),
(43,4),
(44,4),
(45,4),
(47,4),
(54,4),
(55,4),
(56,4),
(57,4),
(58,4),
(60,4),
(64,4),
(65,4),
(67,4),
(69,4),
(70,4),
(22,5),
(31,5),
(32,5),
(33,5),
(34,5),
(36,5),
(37,5),
(38,5),
(39,5),
(40,5),
(42,5),
(43,5),
(49,5),
(50,5),
(54,5),
(56,5),
(60,5),
(61,5),
(62,5),
(64,5),
(65,5),
(66,5),
(67,5),
(69,5),
(70,5),
(78,5),
(22,6),
(32,6),
(36,6),
(37,6),
(38,6),
(43,6),
(54,6),
(55,6),
(56,6),
(57,6),
(58,6),
(60,6),
(61,6),
(62,6),
(64,6),
(22,7),
(23,7),
(24,7),
(32,7),
(38,7),
(43,7),
(44,7),
(54,7),
(22,8),
(43,8),
(48,8),
(51,8),
(52,8),
(53,8),
(69,8),
(70,8),
(22,9),
(23,9),
(24,9),
(32,9),
(38,9),
(43,9),
(44,9),
(45,9),
(47,9),
(22,10),
(43,10),
(49,10),
(50,10),
(60,10),
(64,10),
(65,10),
(67,10),
(69,10),
(75,11),
(76,11),
(77,11),
(1,12),
(6,12),
(10,12),
(12,12),
(16,12),
(17,12),
(21,12),
(22,12),
(26,12),
(27,12),
(32,12),
(38,12),
(43,12),
(51,12),
(54,12),
(56,12),
(59,12),
(60,12),
(65,12),
(69,12),
(71,12),
(72,12),
(74,12),
(75,12),
(76,12);
/*!40000 ALTER TABLE `role_has_permissions` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `organization_id` bigint(20) unsigned DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `display_name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL DEFAULT 'sanctum',
  `description` text DEFAULT NULL,
  `is_system_protected` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_uuid_unique` (`uuid`),
  UNIQUE KEY `roles_organization_id_name_guard_name_unique` (`organization_id`,`name`,`guard_name`),
  CONSTRAINT `roles_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES
(1,'44c94947-f093-4d7a-93d2-caf251c7fc87',NULL,'Super Admin','Super Administrator','sanctum','Full unrestricted access to all organization entities and settings',1,'2026-09-07 17:59:08','2026-09-07 17:59:08'),
(2,'78c59b19-d42a-4109-9398-b87207d9c7d5',NULL,'CEO','Chief Executive Officer','sanctum','Executive governance, institutional KPIs and full multi-branch oversight',1,'2026-09-07 17:59:08','2026-09-07 17:59:08'),
(3,'c348c28a-7cff-48a4-909e-9efd070a31b3',NULL,'Administrator','System Administrator','sanctum','Administrative operations across all departments and branches',1,'2026-09-07 17:59:08','2026-09-07 17:59:08'),
(4,'5c1bc80b-38c3-4dab-81c3-2aade81655d9',NULL,'Branch Manager','Branch Manager','sanctum','Complete operational control over assigned campus branch',0,'2026-09-07 17:59:08','2026-09-07 17:59:08'),
(5,'b05ab3b0-774c-4be7-b445-acb1a7bcd533',NULL,'Academic Manager','Academic Manager','sanctum','Oversees curriculum standards, assessments, cohorts and grading',0,'2026-09-07 17:59:09','2026-09-07 17:59:09'),
(6,'dc875a4b-5392-4a25-93df-a12c83dc5c52',NULL,'Trainer','Course Trainer / Instructor','sanctum','Manages assigned cohorts, marks attendance, delivers lessons and grades assessments',0,'2026-09-07 17:59:09','2026-09-07 17:59:09'),
(7,'99a8e21e-c43a-465c-a68b-99de012b0a90',NULL,'Front Office','Front Office / Receptionist','sanctum','Handles student enquiries, registration, admissions and basic scheduling',0,'2026-09-07 17:59:09','2026-09-07 17:59:09'),
(8,'dd21f163-79c5-43f0-89f4-0487a0bd0b4b',NULL,'Finance Officer','Finance Officer / Accounts','sanctum','Records student payments, reconciles balances and clears enrollment finance',0,'2026-09-07 17:59:09','2026-09-07 17:59:09'),
(9,'78991088-fe97-4f53-91db-f68ee82e23a6',NULL,'Admissions Officer','Admissions Officer','sanctum','Owns student intake, document checks, branch review and cohort admission',0,'2026-09-07 17:59:09','2026-09-07 17:59:09'),
(10,'bc9a81fa-f559-45bd-a358-d96118a3f118',NULL,'Certification Officer','Examinations & Certification Officer','sanctum','Verifies completion outcomes and approves students for certification',0,'2026-09-07 17:59:09','2026-09-07 17:59:09'),
(11,'6b67ecb5-016c-46db-ade5-3d747a47f540',NULL,'Student','Student','sanctum','Student portal access, enrolled classes, lessons, quizzes and certificates',1,'2026-09-07 17:59:09','2026-09-07 17:59:09'),
(12,'d42fb733-c1be-4c5d-b73f-0cf4b6799c1d',NULL,'Guest','Guest (Read-Only Observer)','sanctum','Read-only testing account with global visibility across all users, branches, academics and student portal',1,'2026-09-16 17:13:17','2026-09-16 17:13:17');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES
('SOd4qignW11IJbapYgPi9WojiJnlHu7HEqKZ4QDt',NULL,'127.0.0.1','Mozilla/5.0 (X11; Linux x86_64; rv:155.0) Gecko/20100101 Firefox/155.0','eyJfdG9rZW4iOiIxcFBVY2RjU2xWbW1OTEdpYUxPZEVvdzJvTWZVTGpiTE5WbFlpWjFKIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwIiwicm91dGUiOm51bGx9LCJfZmxhc2giOnsib2xkIjpbXSwibmV3IjpbXX19',1788861657),
('YpMvyEsD2u6tvLiEWhRCo5LPmNK1sIDnCRWMaRTK',NULL,'127.0.0.1','Mozilla/5.0 (X11; Linux x86_64; rv:155.0) Gecko/20100101 Firefox/155.0','eyJfdG9rZW4iOiJtZ3VRUFpTcW5wdmNQRU5CS0laR1NSQ01zR3RKdlhKVDllWnpZaXFDIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwIiwicm91dGUiOm51bGx9LCJfZmxhc2giOnsib2xkIjpbXSwibmV3IjpbXX19',1789101126);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `staff_profiles`
--

DROP TABLE IF EXISTS `staff_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_profiles` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `employee_number` varchar(100) NOT NULL,
  `employment_date` date NOT NULL,
  `employment_type` enum('full_time','part_time','contract','adjunct') NOT NULL DEFAULT 'full_time',
  `job_title` varchar(255) DEFAULT NULL,
  `national_id` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `emergency_contact_name` varchar(255) DEFAULT NULL,
  `emergency_contact_phone` varchar(50) DEFAULT NULL,
  `specialization` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `status` enum('active','on_leave','terminated','resigned') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `staff_profiles_uuid_unique` (`uuid`),
  UNIQUE KEY `staff_profiles_user_id_unique` (`user_id`),
  UNIQUE KEY `staff_profiles_employee_number_unique` (`employee_number`),
  KEY `staff_profiles_employee_number_index` (`employee_number`),
  CONSTRAINT `staff_profiles_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_profiles`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `staff_profiles` WRITE;
/*!40000 ALTER TABLE `staff_profiles` DISABLE KEYS */;
INSERT INTO `staff_profiles` VALUES
(1,'b2142736-f745-413d-a4c0-bd54b172bee1',1,'EMP-0001','2020-01-01','full_time','System Architect & Super Admin','ID-00000001','IAT Towers, Nairobi',NULL,NULL,NULL,NULL,'active','2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(2,'c70545c8-dc0f-43e8-b642-1da3e7168ffb',2,'EMP-CEO-001','2018-01-15','full_time','Chief Executive Officer & Executive Director','ID-10000000','IAT Executive Suites, Nairobi',NULL,NULL,NULL,NULL,'active','2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(3,'a35400e3-97a7-45ee-9748-6da02819bf9a',3,'EMP-0010','2021-03-01','full_time','Branch Manager - Nairobi',NULL,NULL,NULL,NULL,NULL,NULL,'active','2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(4,'da51d873-b75b-4660-b4ae-690e0e62b0b0',4,'EMP-0020','2022-01-15','full_time','Branch Manager - Embu',NULL,NULL,NULL,NULL,NULL,NULL,'active','2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(5,'9fc948c0-482d-40c7-bc54-9f21fb7ab068',5,'EMP-0030','2021-06-01','full_time','Academic Dean & Manager',NULL,NULL,NULL,NULL,NULL,NULL,'active','2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(6,'30e29472-2e29-4a3c-9a0e-a0ccede5485a',6,'EMP-0101','2022-04-01','full_time','Lead Cisco & Cyber Trainer',NULL,NULL,NULL,NULL,'CCNA, CCNP, Network Security, CyberOps',NULL,'active','2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(7,'30a990dc-e5ce-4b99-924b-deeba5d4a442',7,'EMP-0102','2023-02-01','full_time','Lead Software Engineering Trainer',NULL,NULL,NULL,NULL,'Full-Stack Web Dev, Python, Power BI',NULL,'active','2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(8,'78d4aaef-ef45-4b31-a6a8-c88d8ce34d79',8,'EMP-0103','2024-01-10','contract','Assistant Lab Trainer',NULL,NULL,NULL,NULL,NULL,NULL,'active','2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(9,'d14c8e8a-561d-4c8c-93c9-de28dc763213',9,'EMP-0201','2023-08-01','full_time','Front Desk & Admissions Specialist',NULL,NULL,NULL,NULL,NULL,NULL,'active','2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(10,'b9c8dc51-fea1-4555-831c-28ddb8de72b4',10,'EMP-0301','2026-01-05','full_time','Finance & Accounts Officer',NULL,NULL,NULL,NULL,NULL,NULL,'active','2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(11,'cc58dff9-d3c6-4cb3-947b-af7bf7bf3031',11,'EMP-0302','2026-01-05','full_time','Admissions Review Officer',NULL,NULL,NULL,NULL,NULL,NULL,'active','2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(12,'aaaad36b-b6ad-4ac0-8b94-81093318209c',12,'EMP-0303','2026-01-05','full_time','Examinations & Certification Officer',NULL,NULL,NULL,NULL,NULL,NULL,'active','2026-09-07 17:59:09','2026-09-07 17:59:09',NULL);
/*!40000 ALTER TABLE `staff_profiles` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `student_guardians`
--

DROP TABLE IF EXISTS `student_guardians`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_guardians` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `student_profile_id` bigint(20) unsigned NOT NULL,
  `guardian_id` bigint(20) unsigned NOT NULL,
  `relationship` varchar(100) NOT NULL,
  `is_emergency_contact` tinyint(1) NOT NULL DEFAULT 0,
  `is_primary_contact` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_guardians_student_profile_id_guardian_id_unique` (`student_profile_id`,`guardian_id`),
  KEY `student_guardians_guardian_id_foreign` (`guardian_id`),
  CONSTRAINT `student_guardians_guardian_id_foreign` FOREIGN KEY (`guardian_id`) REFERENCES `guardians` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_guardians_student_profile_id_foreign` FOREIGN KEY (`student_profile_id`) REFERENCES `student_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_guardians`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `student_guardians` WRITE;
/*!40000 ALTER TABLE `student_guardians` DISABLE KEYS */;
INSERT INTO `student_guardians` VALUES
(1,1,1,'Father',1,1,'2026-09-07 17:59:09','2026-09-07 17:59:09'),
(2,2,1,'Sponsor',1,1,'2026-09-07 17:59:09','2026-09-07 17:59:09'),
(3,3,2,'Mother',1,1,'2026-09-07 17:59:09','2026-09-07 17:59:09'),
(4,4,2,'Guardian',1,1,'2026-09-07 17:59:09','2026-09-07 17:59:09'),
(5,5,1,'Legal Guardian',1,1,'2026-09-07 17:59:09','2026-09-07 17:59:09'),
(6,6,3,'Mother',1,1,'2026-09-11 14:41:34','2026-09-11 14:41:34');
/*!40000 ALTER TABLE `student_guardians` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `student_profiles`
--

DROP TABLE IF EXISTS `student_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_profiles` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `student_number` varchar(100) NOT NULL,
  `admission_date` date NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `national_id` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `emergency_contact_name` varchar(255) DEFAULT NULL,
  `emergency_contact_phone` varchar(50) DEFAULT NULL,
  `status` enum('active','graduated','suspended','withdrawn','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_profiles_uuid_unique` (`uuid`),
  UNIQUE KEY `student_profiles_user_id_unique` (`user_id`),
  UNIQUE KEY `student_profiles_student_number_unique` (`student_number`),
  KEY `student_profiles_student_number_index` (`student_number`),
  CONSTRAINT `student_profiles_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_profiles`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `student_profiles` WRITE;
/*!40000 ALTER TABLE `student_profiles` DISABLE KEYS */;
INSERT INTO `student_profiles` VALUES
(1,'faf47415-cead-4779-b676-a3eda4dfecdf',13,'SOFS-2026-0001','2026-01-05','2002-05-14','male','STU-NAT-39493340',NULL,'Primary Guardian','+254 720 000999','active','2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(2,'d6a5a5f5-72ee-49d1-94c5-19eabfbefa69',14,'SOFS-2026-0002','2026-01-05','2003-08-22','female','STU-NAT-89697477',NULL,'Primary Guardian','+254 720 000999','active','2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(3,'256c534e-6b45-4158-bcf7-be24d73f5bf5',15,'SOFS-2026-0003','2026-01-05','2001-11-30','male','STU-NAT-62253736',NULL,'Primary Guardian','+254 720 000999','active','2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(4,'07846f3b-42ca-4468-b403-54d17233e4fb',16,'SOFS-2026-0004','2026-01-05','2002-02-18','male','STU-NAT-77345546',NULL,'Primary Guardian','+254 720 000999','active','2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(5,'98340783-4deb-41a1-bd44-ccf337fc316b',17,'SOFS-2026-0005','2026-01-05','2003-04-10','female','STU-NAT-45965997',NULL,'Primary Guardian','+254 720 000999','active','2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(6,'9f2cec4d-83cb-4a60-877c-3028daf3c29e',18,'IAT/NRB/2026/0003','2026-09-11','2000-09-04','male','78626282','nairobi west',NULL,NULL,'active','2026-09-11 14:41:34','2026-09-11 14:46:55',NULL),
(7,'a389738d-0e4a-4954-b650-7488816e2e25',19,'IAT/NRB/2026/0004','2026-09-12',NULL,NULL,NULL,NULL,NULL,NULL,'active','2026-09-12 02:11:09','2026-09-12 02:11:09',NULL),
(8,'95f73091-8fbc-45de-a5b3-2f5129d20894',20,'IAT/NRB/2026/0005','2026-09-12',NULL,NULL,NULL,NULL,NULL,NULL,'active','2026-09-12 15:17:34','2026-09-12 15:17:34',NULL),
(9,'b8e8a724-8c50-4087-9c36-a90bf2619f11',21,'IAT-GST-2026-0001','2026-01-01','2000-01-01','other','GST-TEST-001','IAT Testing Sandbox, Nairobi','IAT Administration','+254 723 819257','active','2026-09-16 17:14:43','2026-09-16 17:14:43',NULL);
/*!40000 ALTER TABLE `student_profiles` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `organization_id` bigint(20) unsigned NOT NULL,
  `key` varchar(100) NOT NULL,
  `value` longtext DEFAULT NULL,
  `type` enum('string','integer','boolean','json','file') NOT NULL DEFAULT 'string',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `system_settings_organization_id_key_unique` (`organization_id`,`key`),
  CONSTRAINT `system_settings_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
INSERT INTO `system_settings` VALUES
(1,1,'institution_name','Institute of Advanced Technology Ltd','string','2026-09-07 17:59:09','2026-09-07 17:59:09'),
(2,1,'student_number_format','{PREFIX}-{YEAR}-{SEQ:4}','string','2026-09-07 17:59:09','2026-09-07 17:59:09'),
(3,1,'certificate_number_format','CERT-{YEAR}-{SEQ:5}','string','2026-09-07 17:59:09','2026-09-07 17:59:09'),
(4,1,'min_attendance_certificate','75','integer','2026-09-07 17:59:09','2026-09-07 17:59:09'),
(5,1,'min_progress_certificate','80','integer','2026-09-07 17:59:09','2026-09-07 17:59:09'),
(6,1,'allow_late_submissions','1','boolean','2026-09-07 17:59:09','2026-09-07 17:59:09');
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `profile_photo_path` varchar(255) DEFAULT NULL,
  `organization_id` bigint(20) unsigned NOT NULL,
  `branch_id` bigint(20) unsigned DEFAULT NULL,
  `department_id` bigint(20) unsigned DEFAULT NULL,
  `position_id` bigint(20) unsigned DEFAULT NULL,
  `status` enum('active','inactive','suspended','archived') NOT NULL DEFAULT 'active',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `last_login_ip` varchar(45) DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_uuid_unique` (`uuid`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_branch_id_foreign` (`branch_id`),
  KEY `users_department_id_foreign` (`department_id`),
  KEY `users_position_id_foreign` (`position_id`),
  KEY `users_organization_id_branch_id_index` (`organization_id`,`branch_id`),
  KEY `users_status_index` (`status`),
  CONSTRAINT `users_branch_id_foreign` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `users_department_id_foreign` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `users_organization_id_foreign` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `users_position_id_foreign` FOREIGN KEY (`position_id`) REFERENCES `positions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'804180b8-aebd-4fe1-8b49-853716af21fc','Super','System','Administrator','superadmin@iatlms.test','+254 700 000001','$2y$12$9Z606te7rJpSiH/pebQph.F92YT/QeZU8roK4dHVYTjBgzWASwYKq',NULL,1,1,1,1,'active','2026-09-07 17:59:09','2026-09-18 10:30:53','127.0.0.1',NULL,'2026-09-07 17:59:09','2026-09-18 10:30:53',NULL),
(2,'560efe82-1381-490e-b856-3d79d181b97b','Dr. Catherine','Wanjiku','Mutua','ceo@iatlms.test','+254 700 000000','$2y$12$9Z606te7rJpSiH/pebQph.F92YT/QeZU8roK4dHVYTjBgzWASwYKq',NULL,1,1,1,1,'active','2026-09-07 17:59:09','2026-09-18 09:32:36','127.0.0.1',NULL,'2026-09-07 17:59:09','2026-09-18 09:32:36',NULL),
(3,'e548a0f1-030f-4b1b-ade2-0d0ed08321e1','Marcus','Kamau','Njoroge','bm.nairobi@iatlms.test','+254 722 100001','$2y$12$9Z606te7rJpSiH/pebQph.F92YT/QeZU8roK4dHVYTjBgzWASwYKq',NULL,1,1,1,2,'active','2026-09-07 17:59:09','2026-09-12 15:42:59','127.0.0.1',NULL,'2026-09-07 17:59:09','2026-09-12 15:42:59',NULL),
(4,'e1a93616-4625-4af8-998d-1917eaa7e2c1','John','Kariuki','Mwangi','bm.embu@iatlms.test','+254 722 200001','$2y$12$9Z606te7rJpSiH/pebQph.F92YT/QeZU8roK4dHVYTjBgzWASwYKq',NULL,1,2,3,2,'active','2026-09-07 17:59:09','2026-09-12 15:42:28','127.0.0.1',NULL,'2026-09-07 17:59:09','2026-09-12 15:42:28',NULL),
(5,'b238c2eb-edb3-4d89-b271-38a6d8e299b6','Dr. Catherine','Wanjiku','Mutua','academic.manager@iatlms.test','+254 722 300001','$2y$12$9Z606te7rJpSiH/pebQph.F92YT/QeZU8roK4dHVYTjBgzWASwYKq',NULL,1,1,1,3,'active','2026-09-07 17:59:09',NULL,NULL,NULL,'2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(6,'01b0255a-aa73-48f6-96a1-8f4c96b13c84','David','Otieno','Ochieng','trainer.nairobi@iatlms.test','+254 723 111001','$2y$12$9Z606te7rJpSiH/pebQph.F92YT/QeZU8roK4dHVYTjBgzWASwYKq',NULL,1,1,1,4,'active','2026-09-07 17:59:09',NULL,NULL,NULL,'2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(7,'294bcdcf-cd5a-4c0e-8942-df494449516f','Faith','Muthoni','Kiprono','trainer.embu@iatlms.test','+254 723 222001','$2y$12$9Z606te7rJpSiH/pebQph.F92YT/QeZU8roK4dHVYTjBgzWASwYKq',NULL,1,2,3,4,'active','2026-09-07 17:59:09',NULL,NULL,NULL,'2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(8,'80db4a41-9585-4c9e-8a55-630c816953c7','Samuel','Kipchumba','Korir','asst.trainer@iatlms.test','+254 723 333001','$2y$12$9Z606te7rJpSiH/pebQph.F92YT/QeZU8roK4dHVYTjBgzWASwYKq',NULL,1,1,1,5,'active','2026-09-07 17:59:09',NULL,NULL,NULL,'2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(9,'4ded85e0-5d82-44cb-aac3-282f44b744ff','Grace','Akinyi','Odhiambo','frontoffice@iatlms.test','+254 724 000111','$2y$12$9Z606te7rJpSiH/pebQph.F92YT/QeZU8roK4dHVYTjBgzWASwYKq',NULL,1,1,2,6,'active','2026-09-07 17:59:09',NULL,NULL,NULL,'2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(10,'214f0314-691a-4d1d-b2d4-52578aca4194','Peter','K.','Omondi','finance@iatlms.test','+254 724 000222','$2y$12$9Z606te7rJpSiH/pebQph.F92YT/QeZU8roK4dHVYTjBgzWASwYKq',NULL,1,1,2,7,'active','2026-09-07 17:59:09','2026-09-11 16:21:20','127.0.0.1',NULL,'2026-09-07 17:59:09','2026-09-11 16:21:20',NULL),
(11,'80311266-e83f-46af-a68d-37ea92acb252','Lydia','N.','Wambui','admissions@iatlms.test','+254 724 000333','$2y$12$9Z606te7rJpSiH/pebQph.F92YT/QeZU8roK4dHVYTjBgzWASwYKq',NULL,1,1,2,8,'active','2026-09-07 17:59:09','2026-09-12 15:18:34','127.0.0.1',NULL,'2026-09-07 17:59:09','2026-09-12 15:18:34',NULL),
(12,'e0235a69-04a2-427f-967d-708547204d81','Michael','T.','Kiptoo','certification@iatlms.test','+254 724 000444','$2y$12$9Z606te7rJpSiH/pebQph.F92YT/QeZU8roK4dHVYTjBgzWASwYKq',NULL,1,1,2,9,'active','2026-09-07 17:59:09',NULL,NULL,NULL,'2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(13,'b1a33c67-cf48-48b8-92e9-6414eb383acd','John','K.','Mwangi','student.john@iatlms.test','+254 712 111222','$2y$12$9Z606te7rJpSiH/pebQph.F92YT/QeZU8roK4dHVYTjBgzWASwYKq',NULL,1,1,NULL,NULL,'active','2026-09-07 17:59:09','2026-09-16 06:39:15','127.0.0.1',NULL,'2026-09-07 17:59:09','2026-09-16 06:39:15',NULL),
(14,'570d3267-2399-469f-926d-399adc8cdcea','Jane','Akinyi','Oduor','student.jane@iatlms.test','+254 712 333444','$2y$12$9Z606te7rJpSiH/pebQph.F92YT/QeZU8roK4dHVYTjBgzWASwYKq',NULL,1,1,NULL,NULL,'active','2026-09-07 17:59:09',NULL,NULL,NULL,'2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(15,'6cf335e0-d4d8-4c9b-887a-5c38da501312','Alex','Mutua','Kioko','student.alex@iatlms.test','+254 712 555666','$2y$12$9Z606te7rJpSiH/pebQph.F92YT/QeZU8roK4dHVYTjBgzWASwYKq',NULL,1,2,NULL,NULL,'active','2026-09-07 17:59:09',NULL,NULL,NULL,'2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(16,'813fdc6e-3952-493f-a2d6-59d9ce55bf4b','Brian','Kipkemboi','Ruto','student.brian@iatlms.test','+254 712 777888','$2y$12$9Z606te7rJpSiH/pebQph.F92YT/QeZU8roK4dHVYTjBgzWASwYKq',NULL,1,2,NULL,NULL,'active','2026-09-07 17:59:09',NULL,NULL,NULL,'2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(17,'18af8f6f-8600-4428-85eb-1d55562b5746','Diana','Chebet','Koech','student.diana@iatlms.test','+254 712 999000','$2y$12$9Z606te7rJpSiH/pebQph.F92YT/QeZU8roK4dHVYTjBgzWASwYKq',NULL,1,3,NULL,NULL,'active','2026-09-07 17:59:09',NULL,NULL,NULL,'2026-09-07 17:59:09','2026-09-07 17:59:09',NULL),
(18,'2a6f25be-59f0-4525-bde2-933408556b7c','Brian','Susan','Kariuki','Brian@gmail.com','254 741678890','$2y$12$1zjbHEouQlty5TwAuKC/OuKZ2qu7uyWXt3pVPXpcZ1CIvQbwOr66i',NULL,1,1,NULL,NULL,'active','2026-09-11 14:41:34',NULL,NULL,NULL,'2026-09-11 14:41:34','2026-09-11 16:33:25',NULL),
(19,'840ead2a-267a-4d07-9212-3ea36e568f74','moses',NULL,'palando','moses@gmail.com','0754676578','$2y$12$uUV2haZY5pAyWPqTDqbWQeAN2Arz7.TPqWfZzqPsD3REtTJS.IMFO',NULL,1,1,NULL,NULL,'active','2026-09-12 02:11:09',NULL,NULL,NULL,'2026-09-12 02:11:09','2026-09-12 02:11:09',NULL),
(20,'b0dc19f6-cc7e-4d8a-b411-4b944aca3e65','joseph',NULL,'lasty','josephlasy123@gmail.com',NULL,'$2y$12$nHCyLJ3iCsdukYIyDdOOI.qLHcUIkvPmpibgI4b/T.Fn6dX.kPdeq',NULL,1,1,NULL,NULL,'active','2026-09-12 15:17:34','2026-09-12 15:18:00','127.0.0.1',NULL,'2026-09-12 15:17:34','2026-09-12 15:18:00',NULL),
(21,'7e25f02f-571c-4492-af44-7d03f49d07f0','Guest','Testing','Observer','guest@iatlms.test','+254 700 999888','$2y$12$.kUIqN0P29fIfY5.QIwtuOu.LnAwdAr/zU1JAOxjm7426ZG2yhfQm',NULL,1,1,NULL,NULL,'active','2026-09-16 17:13:18','2026-09-16 17:23:31','127.0.0.1',NULL,'2026-09-16 17:13:18','2026-09-16 17:23:31',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Dumping events for database 'lms_db'
--

--
-- Dumping routines for database 'lms_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-22 22:22:08
