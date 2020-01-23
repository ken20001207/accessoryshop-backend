-- --------------------------------------------------------
-- 主機:                           127.0.0.1
-- 伺服器版本:                        8.0.19 - MySQL Community Server - GPL
-- 伺服器作業系統:                      Win64
-- HeidiSQL 版本:                  10.3.0.5771
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- 傾印 accessoryshop 的資料庫結構
CREATE DATABASE IF NOT EXISTS `accessoryshop` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `accessoryshop`;

-- 傾印  資料表 accessoryshop.classes 結構
CREATE TABLE IF NOT EXISTS `classes` (
  `id` int DEFAULT NULL,
  `name` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 正在傾印表格  accessoryshop.classes 的資料：~0 rows (近似值)
/*!40000 ALTER TABLE `classes` DISABLE KEYS */;
INSERT INTO `classes` (`id`, `name`) VALUES
	(1, '商品類別1'),
	(2, '商品類別2'),
	(3, '商品類別3'),
	(4, '商品類別4');
/*!40000 ALTER TABLE `classes` ENABLE KEYS */;

-- 傾印  資料表 accessoryshop.data 結構
CREATE TABLE IF NOT EXISTS `data` (
  `flagclass` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 正在傾印表格  accessoryshop.data 的資料：~0 rows (近似值)
/*!40000 ALTER TABLE `data` DISABLE KEYS */;
INSERT INTO `data` (`flagclass`) VALUES
	(1);
/*!40000 ALTER TABLE `data` ENABLE KEYS */;

-- 傾印  資料表 accessoryshop.items 結構
CREATE TABLE IF NOT EXISTS `items` (
  `id` int DEFAULT NULL,
  `description` text,
  `name` text,
  `options` text,
  `class` int DEFAULT NULL,
  `price` int DEFAULT NULL,
  `imgcount` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 正在傾印表格  accessoryshop.items 的資料：~0 rows (近似值)
/*!40000 ALTER TABLE `items` DISABLE KEYS */;
INSERT INTO `items` (`id`, `description`, `name`, `options`, `class`, `price`, `imgcount`) VALUES
	(1, '商品說明', '範例商品1', '["選項1", "選項2","選項3"]', 1, 1250, 3),
	(2, '商品說明', '範例商品2', '["選項1", "選項2","選項3"]', 1, 1780, 4),
	(3, '商品說明', '範例商品3', '["選項1", "選項2","選項3"]', 1, 850, 3),
	(4, '商品說明', '範例商品4', '["選項1", "選項2","選項3"]', 1, 740, 4),
	(5, '商品說明', '範例商品5', '["選項1", "選項2","選項3"]', 2, 1160, 3),
	(6, '商品說明', '範例商品6', '["選項1", "選項2","選項3"]', 2, 1480, 2),
	(7, '商品說明', '範例商品7', '["選項1", "選項2","選項3"]', 2, 1600, 3),
	(8, '商品說明', '範例商品8', '["選項1", "選項2","選項3"]', 2, 1680, 2);
/*!40000 ALTER TABLE `items` ENABLE KEYS */;

-- 傾印  資料表 accessoryshop.orders 結構
CREATE TABLE IF NOT EXISTS `orders` (
  `id` text,
  `statusCode` int DEFAULT NULL,
  `data` text,
  `sumprice` int DEFAULT NULL,
  `payresult` int DEFAULT NULL,
  `delivery` text,
  `delivery_info` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 正在傾印表格  accessoryshop.orders 的資料：~0 rows (近似值)
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` (`id`, `statusCode`, `data`, `sumprice`, `payresult`, `delivery`, `delivery_info`) VALUES
	('123', 1, '[{"id":7,"option":"選項3","name":"範例商品7","num":6,"price":1600,"sumprice":6400},{"id":1,"option":"選項1","name":"範例商品1","num":3,"price":1250,"sumprice":1250},{"id":2,"option":"選項3","name":"範例商品2","num":3,"price":1780,"sumprice":5340}]', 18690, NULL, '統一超商取貨 60元', '奉化店'),
	('175091291', NULL, '[{"id":7,"option":"選項3","name":"範例商品7","num":6,"price":1600,"sumprice":6400},{"id":1,"option":"選項1","name":"範例商品1","num":3,"price":1250,"sumprice":1250},{"id":2,"option":"選項3","name":"範例商品2","num":3,"price":1780,"sumprice":5340}]', 18690, NULL, NULL, NULL),
	('43406078615', NULL, '[{"id":7,"option":"選項3","name":"範例商品7","num":6,"price":1600,"sumprice":6400},{"id":1,"option":"選項1","name":"範例商品1","num":3,"price":1250,"sumprice":1250},{"id":2,"option":"選項3","name":"範例商品2","num":3,"price":1780,"sumprice":5340}]', 18690, NULL, NULL, NULL),
	('16376528844', NULL, '[{"id":7,"option":"選項3","name":"範例商品7","num":6,"price":1600,"sumprice":6400},{"id":1,"option":"選項1","name":"範例商品1","num":3,"price":1250,"sumprice":1250},{"id":2,"option":"選項3","name":"範例商品2","num":3,"price":1780,"sumprice":5340}]', 18690, NULL, NULL, NULL),
	('69456076360', NULL, '[{"id":7,"option":"選項3","name":"範例商品7","num":6,"price":1600,"sumprice":6400},{"id":1,"option":"選項1","name":"範例商品1","num":3,"price":1250,"sumprice":1250},{"id":2,"option":"選項3","name":"範例商品2","num":3,"price":1780,"sumprice":5340}]', 18690, NULL, NULL, NULL),
	('60642224264', NULL, '[{"id":7,"option":"選項3","name":"範例商品7","num":6,"price":1600,"sumprice":6400},{"id":1,"option":"選項1","name":"範例商品1","num":3,"price":1250,"sumprice":1250},{"id":2,"option":"選項3","name":"範例商品2","num":3,"price":1780,"sumprice":5340}]', 18690, NULL, NULL, NULL),
	('79664271881', NULL, '[{"id":7,"option":"選項3","name":"範例商品7","num":6,"price":1600,"sumprice":6400},{"id":1,"option":"選項1","name":"範例商品1","num":3,"price":1250,"sumprice":1250},{"id":2,"option":"選項3","name":"範例商品2","num":3,"price":1780,"sumprice":5340}]', 18690, NULL, NULL, NULL),
	('21972341385', NULL, '[{"id":7,"option":"選項3","name":"範例商品7","num":6,"price":1600,"sumprice":6400},{"id":1,"option":"選項1","name":"範例商品1","num":3,"price":1250,"sumprice":1250},{"id":2,"option":"選項3","name":"範例商品2","num":3,"price":1780,"sumprice":5340}]', 18690, NULL, NULL, NULL),
	('45674380352', NULL, '[{"id":7,"option":"選項3","name":"範例商品7","num":6,"price":1600,"sumprice":6400},{"id":1,"option":"選項1","name":"範例商品1","num":3,"price":1250,"sumprice":1250},{"id":2,"option":"選項3","name":"範例商品2","num":3,"price":1780,"sumprice":5340}]', 18690, NULL, NULL, NULL),
	('383140926', NULL, '[{"id":7,"option":"選項3","name":"範例商品7","num":6,"price":1600,"sumprice":6400},{"id":1,"option":"選項1","name":"範例商品1","num":3,"price":1250,"sumprice":1250},{"id":2,"option":"選項3","name":"範例商品2","num":3,"price":1780,"sumprice":5340}]', 18690, NULL, NULL, NULL),
	('54908690164', NULL, '[{"id":7,"option":"選項3","name":"範例商品7","num":6,"price":1600,"sumprice":6400},{"id":1,"option":"選項1","name":"範例商品1","num":3,"price":1250,"sumprice":1250},{"id":2,"option":"選項3","name":"範例商品2","num":3,"price":1780,"sumprice":5340}]', 18690, NULL, NULL, NULL),
	('16756475404', NULL, '[{"id":7,"option":"選項3","name":"範例商品7","num":6,"price":1600,"sumprice":6400},{"id":1,"option":"選項1","name":"範例商品1","num":3,"price":1250,"sumprice":1250},{"id":2,"option":"選項3","name":"範例商品2","num":3,"price":1780,"sumprice":5340}]', 18690, NULL, NULL, NULL),
	('54868425895', NULL, '[{"id":2,"option":"選項3","name":"範例商品2","num":1,"price":1780,"sumprice":5340}]', 1780, NULL, NULL, NULL),
	('62053313491', NULL, '[{"id":2,"option":"選項3","name":"範例商品2","num":1,"price":1780,"sumprice":5340}]', 1780, NULL, NULL, NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
