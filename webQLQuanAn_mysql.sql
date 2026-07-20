-- ============================================
-- MySQL-compatible export of webQLQuanAn database
-- Source: SQL Server on 192.168.192.86
-- Generated: 2026-06-06 11:21:37
-- For phpMyAdmin import
-- ============================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';

CREATE DATABASE IF NOT EXISTS webQLQuanAn DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE webQLQuanAn;

-- =============================================
-- Table: Bill (SQL Server name: [Bill])
-- =============================================
DROP TABLE IF EXISTS `Bill`;
CREATE TABLE `Bill` (
  `BillID` CHAR(10) NOT NULL,
  `Total` DECIMAL(18,2) NULL,
  `Discount` DECIMAL(18,2) NULL,
  `TotalFinal` DECIMAL(18,2) NULL,
  `Payment` VARCHAR(50) NULL,
  `CreatedTime` DATETIME NULL,
  `OrderID` CHAR(10) NULL,
  `UserID` CHAR(10) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('486yrdza31', 40000.00, 0.00, 40000.00, 'Chưa thanh toán', '2025-10-27 15:57:31', 'ORD8419448', '4         ');
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('4jnueoi5aa', 70000.00, 0.00, 70000.00, 'Chưa thanh toán', '2025-10-27 16:22:13', 'ORD3602796', '4         ');
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('63fb378e3c', 189000.00, 28350.00, 160650.00, 'Tiền mặt', '2025-07-11 10:28:13', 'HD390A7803', '4         ');
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('8oackj81yq', 556000.00, 0.00, 556000.00, 'Tiền mặt', '2025-10-27 16:28:13', 'ORD2409640', '4         ');
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('92cdc4ac6a', 225000.00, 45000.00, 180000.00, 'Tiền mặt', '2025-07-14 19:09:43', 'HD25071152', '4         ');
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('BILL3F3F6 ', 230000.00, 0.00, 230000.00, 'Ti?n m?t', '2025-07-18 02:01:25', 'HD25071832', '1         ');
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('BILL4CC0F ', 210000.00, 0.00, 210000.00, 'Ti?n m?t', '2025-07-18 03:27:08', 'HD25071827', '1         ');
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('BILL7BE08 ', 124000.00, 0.00, 124000.00, 'Ti?n m?t', '2025-07-17 05:09:52', 'HD2124CD24', '1         ');
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('BILL919EB ', 120000.00, 0.00, 120000.00, 'Ti?n m?t', '2025-07-18 03:37:15', 'HDC76BC306', '1         ');
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('BILLB2C7D ', 205000.00, 0.00, 205000.00, 'Ti?n m?t', '2025-07-18 03:27:46', 'HD25071834', '1         ');
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('BILLBEF2D ', 124000.00, 0.00, 124000.00, NULL, '2025-07-17 11:51:47', 'HD2124CD24', '1         ');
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('BL00233488', 42000.00, 0.00, 42000.00, 'Ti?n m?t', '2026-04-11 07:23:37', 'OB00233488', '4         ');
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('e2765001l8', 171000.00, 10000.00, 161000.00, 'Tiền mặt', '2025-11-25 08:52:18', 'ORD0534065', '4         ');
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('e7r2ug4xve', 100.00, 0.00, 100.00, 'Cash', '2025-10-19 10:14:30', 'HD390A7803', NULL);
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('gqametnip5', 75000.00, 0.00, 75000.00, 'Chuyển khoản', '2026-02-24 12:41:40', 'HDAF3E40F4', '4         ');
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('gwwug4p9yd', 98000.00, 0.00, 98000.00, 'Chưa thanh toán', '2025-10-27 16:09:43', 'ORD6291569', '4         ');
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('HD12D62804', 882005.00, 0.00, 882005.00, 'Chưa thanh toán', '2025-07-11 07:09:49', 'HD12D62804', NULL);
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('HD17FB09B4', 136000.00, 0.00, 136000.00, 'Tiền mặt', '2025-07-07 20:10:49', 'HD17FB09B4', NULL);
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('HD19396206', 75000.00, 0.00, 75000.00, 'Thẻ tín dụng', '2025-07-07 19:46:34', 'HD19396206', NULL);
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('HD1F10A55C', 72000.00, 0.00, 72000.00, 'Chưa thanh toán', '2025-07-11 08:43:54', 'HD1F10A55C', NULL);
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('HD25071119', 137000.00, 1370.00, 135630.00, 'Thẻ tín dụng', '2025-07-18 08:18:28', NULL, '4         ');
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('HD28EE4775', 80000.00, 400.00, 79600.00, 'Chuyển khoản', '2025-07-17 23:22:58', 'HD28EE4775', '4         ');
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('HD29929A9C', 60000.00, 60.00, 59940.00, 'Chuyển khoản', '2025-07-17 22:15:06', 'HD29929A9C', '4         ');
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('HD372189DB', 135000.00, 1065.00, 133935.00, 'Ví điện tử', '2025-07-17 23:26:17', NULL, '4         ');
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('HD390A7803', 324000.00, 0.00, 324000.00, 'Chưa thanh toán', '2025-07-11 10:03:10', NULL, NULL);
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('HD46ADFD1E', 45000.00, 5400.00, 39600.00, 'Thẻ tín dụng', '2025-07-18 13:58:01', 'HD46ADFD1E', '4         ');
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('HD5F1626B4', 148000.00, 0.00, 148000.00, 'Chuyển khoản', '2025-07-07 19:48:48', 'HD5F1626B4', NULL);
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('HD5F8F8437', 264000.00, 0.00, 264000.00, 'Chưa thanh toán', '2025-07-11 08:43:19', 'HD5F8F8437', NULL);
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('HD82388BE5', 109000.00, 0.00, 109000.00, 'Tiền mặt', '2025-07-06 23:32:12', 'HD82388BE5', NULL);
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('HD88FA4AB7', 126000.00, 25200.00, 100800.00, 'Tiền mặt', '2025-07-14 19:08:07', 'HD88FA4AB7', '4         ');
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('HD8BF2B3B7', 45000.00, 0.00, 45000.00, 'Tiền mặt', '2025-07-09 19:39:26', 'HD8BF2B3B7', '4         ');
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('HDB05E9439', 150000.00, 0.00, 150000.00, 'Tiền mặt', '2025-07-11 09:06:23', 'HDB05E9439', NULL);
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('HDB3553614', 80000.00, 0.00, 80000.00, 'Tiền mặt', '2025-07-14 19:03:26', 'HDB3553614', NULL);
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('HDCE569E80', 260000.00, 0.00, 260000.00, 'Tiền mặt', '2025-07-14 19:05:48', NULL, NULL);
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('HDD14A2C79', 8000.00, 1600.00, 6400.00, 'Chuyển khoản', '2025-07-09 19:05:34', 'HDD14A2C79', NULL);
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('HDD73F033D', 45000.00, 0.00, 45000.00, 'Ví điện tử', '2025-07-07 19:47:39', 'HDD73F033D', NULL);
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('HDD9C1FD6C', 45000.00, 0.00, 45000.00, 'Chuyển khoản', '2025-07-07 19:46:17', 'HDD9C1FD6C', NULL);
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('HDDA9DAA18', 169000.00, 0.00, 169000.00, 'Tiền mặt', '2025-07-11 09:10:19', 'HDDA9DAA18', NULL);
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('HDEE21A988', 75000.00, 0.00, 75000.00, 'Thẻ tín dụng', '2025-07-08 09:49:04', 'HDEE21A988', NULL);
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('HDFE195FF7', 30000.00, 9000.00, 21000.00, 'Tiền mặt', '2025-07-09 19:41:00', 'HDFE195FF7', '4         ');
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('k0yh4t5er1', 176000.00, 0.00, 176000.00, 'Tiền mặt', '2025-11-17 16:48:11', 'ORD7299476', '4         ');
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('nihyi04cl6', 556000.00, 0.00, 556000.00, 'Tiền mặt', '2025-10-29 02:53:01', 'ORD6262358', '4         ');
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('sznii1se0i', 135000.00, 0.00, 135000.00, 'Chưa thanh toán', '2025-10-27 16:11:32', 'ORD5853608', '4         ');
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('test123456', 40000.00, 5000.00, 35000.00, 'Chuyển khoản', '2025-10-27 16:00:00', 'ORD8419448', '4         ');
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('test123457', 40000.00, 0.00, 40000.00, 'Tiền mặt', '2025-10-27 16:08:54', 'ORD8419448', '4         ');
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('uu4mnr5nlc', 146000.00, 0.00, 146000.00, 'Tiền mặt', '2025-11-18 09:13:08', 'ORD5776333', '3292731962');
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('vleaopbuck', 73000.00, 0.00, 73000.00, 'Chưa thanh toán', '2025-10-27 16:24:19', 'ORD3143692', '4         ');
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('wzohlx365e', 136000.00, 0.00, 136000.00, 'Chuyển khoản', '2025-11-18 09:13:08', 'ORD7105079', '3292731962');
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('x5kvemkiuf', 187000.00, 0.00, 187000.00, 'Tiền mặt', '2025-10-27 16:24:53', 'ORD3110537', '4         ');
INSERT INTO `Bill` (`BillID`, `Total`, `Discount`, `TotalFinal`, `Payment`, `CreatedTime`, `OrderID`, `UserID`) VALUES ('xhjm9ei66o', 100.00, 0.00, 100.00, 'Cash', '2025-10-19 10:19:47', 'HD390A7803', NULL);
-- 50 rows inserted

-- =============================================
-- Table: Bill_Detail (SQL Server name: [Bill_Detail])
-- =============================================
DROP TABLE IF EXISTS `Bill_Detail`;
CREATE TABLE `Bill_Detail` (
  `BillID` CHAR(10) NOT NULL,
  `OrderID` CHAR(10) NOT NULL,
  `Quantity` INT NULL,
  `UnitPrice` DECIMAL(18,2) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `Bill_Detail` (`BillID`, `OrderID`, `Quantity`, `UnitPrice`) VALUES ('HD12D62804', 'HD12D62804', 1, 882005.00);
INSERT INTO `Bill_Detail` (`BillID`, `OrderID`, `Quantity`, `UnitPrice`) VALUES ('HD17FB09B4', 'HD17FB09B4', 3, 136000.00);
INSERT INTO `Bill_Detail` (`BillID`, `OrderID`, `Quantity`, `UnitPrice`) VALUES ('HD19396206', 'HD19396206', 2, 75000.00);
INSERT INTO `Bill_Detail` (`BillID`, `OrderID`, `Quantity`, `UnitPrice`) VALUES ('HD1F10A55C', 'HD1F10A55C', 2, 37000.00);
INSERT INTO `Bill_Detail` (`BillID`, `OrderID`, `Quantity`, `UnitPrice`) VALUES ('BILL7BE08 ', 'HD2124CD24', 2, 124000.00);
INSERT INTO `Bill_Detail` (`BillID`, `OrderID`, `Quantity`, `UnitPrice`) VALUES ('HD372189DB', 'HD25071100', 2, 105000.00);
INSERT INTO `Bill_Detail` (`BillID`, `OrderID`, `Quantity`, `UnitPrice`) VALUES ('HD25071119', 'HD25071119', 2, 47000.00);
INSERT INTO `Bill_Detail` (`BillID`, `OrderID`, `Quantity`, `UnitPrice`) VALUES ('92cdc4ac6a', 'HD25071152', 3, 225000.00);
INSERT INTO `Bill_Detail` (`BillID`, `OrderID`, `Quantity`, `UnitPrice`) VALUES ('HDCE569E80', 'HD25071152', 3, 225000.00);
INSERT INTO `Bill_Detail` (`BillID`, `OrderID`, `Quantity`, `UnitPrice`) VALUES ('HD25071119', 'HD25071158', 2, 90000.00);
INSERT INTO `Bill_Detail` (`BillID`, `OrderID`, `Quantity`, `UnitPrice`) VALUES ('BILL4CC0F ', 'HD25071827', 3, 210000.00);
INSERT INTO `Bill_Detail` (`BillID`, `OrderID`, `Quantity`, `UnitPrice`) VALUES ('BILL3F3F6 ', 'HD25071832', 3, 230000.00);
INSERT INTO `Bill_Detail` (`BillID`, `OrderID`, `Quantity`, `UnitPrice`) VALUES ('BILLB2C7D ', 'HD25071834', 3, 205000.00);
INSERT INTO `Bill_Detail` (`BillID`, `OrderID`, `Quantity`, `UnitPrice`) VALUES ('HD28EE4775', 'HD28EE4775', 2, 80000.00);
INSERT INTO `Bill_Detail` (`BillID`, `OrderID`, `Quantity`, `UnitPrice`) VALUES ('HD29929A9C', 'HD29929A9C', 2, 60000.00);
INSERT INTO `Bill_Detail` (`BillID`, `OrderID`, `Quantity`, `UnitPrice`) VALUES ('HD372189DB', 'HD372189DB', 1, 30000.00);
INSERT INTO `Bill_Detail` (`BillID`, `OrderID`, `Quantity`, `UnitPrice`) VALUES ('63fb378e3c', 'HD390A7803', 4, 189000.00);
INSERT INTO `Bill_Detail` (`BillID`, `OrderID`, `Quantity`, `UnitPrice`) VALUES ('HD390A7803', 'HD390A7803', 4, 189000.00);
INSERT INTO `Bill_Detail` (`BillID`, `OrderID`, `Quantity`, `UnitPrice`) VALUES ('HD5F8F8437', 'HD43A41BC7', 4, 194000.00);
INSERT INTO `Bill_Detail` (`BillID`, `OrderID`, `Quantity`, `UnitPrice`) VALUES ('HD46ADFD1E', 'HD46ADFD1E', 1, 45000.00);
INSERT INTO `Bill_Detail` (`BillID`, `OrderID`, `Quantity`, `UnitPrice`) VALUES ('HD5F1626B4', 'HD5F1626B4', 3, 148000.00);
INSERT INTO `Bill_Detail` (`BillID`, `OrderID`, `Quantity`, `UnitPrice`) VALUES ('HD5F8F8437', 'HD5F8F8437', 1, 70000.00);
INSERT INTO `Bill_Detail` (`BillID`, `OrderID`, `Quantity`, `UnitPrice`) VALUES ('HD82388BE5', 'HD82388BE5', 2, 109000.00);
INSERT INTO `Bill_Detail` (`BillID`, `OrderID`, `Quantity`, `UnitPrice`) VALUES ('HD88FA4AB7', 'HD88FA4AB7', 3, 126000.00);
INSERT INTO `Bill_Detail` (`BillID`, `OrderID`, `Quantity`, `UnitPrice`) VALUES ('HD8BF2B3B7', 'HD8BF2B3B7', 1, 45000.00);
INSERT INTO `Bill_Detail` (`BillID`, `OrderID`, `Quantity`, `UnitPrice`) VALUES ('HD1F10A55C', 'HDA4A14596', 1, 35000.00);
INSERT INTO `Bill_Detail` (`BillID`, `OrderID`, `Quantity`, `UnitPrice`) VALUES ('HDB05E9439', 'HDAF3E40F4', 2, 75000.00);
INSERT INTO `Bill_Detail` (`BillID`, `OrderID`, `Quantity`, `UnitPrice`) VALUES ('HDB05E9439', 'HDB05E9439', 2, 75000.00);
INSERT INTO `Bill_Detail` (`BillID`, `OrderID`, `Quantity`, `UnitPrice`) VALUES ('HDB3553614', 'HDB3553614', 2, 80000.00);
INSERT INTO `Bill_Detail` (`BillID`, `OrderID`, `Quantity`, `UnitPrice`) VALUES ('HDDA9DAA18', 'HDBF57D527', 2, 129000.00);
INSERT INTO `Bill_Detail` (`BillID`, `OrderID`, `Quantity`, `UnitPrice`) VALUES ('BILL919EB ', 'HDC76BC306', 3, 120000.00);
INSERT INTO `Bill_Detail` (`BillID`, `OrderID`, `Quantity`, `UnitPrice`) VALUES ('HDCE569E80', 'HDCE569E80', 1, 35000.00);
INSERT INTO `Bill_Detail` (`BillID`, `OrderID`, `Quantity`, `UnitPrice`) VALUES ('HDD14A2C79', 'HDD14A2C79', 2, 8000.00);
INSERT INTO `Bill_Detail` (`BillID`, `OrderID`, `Quantity`, `UnitPrice`) VALUES ('HDD73F033D', 'HDD73F033D', 1, 45000.00);
INSERT INTO `Bill_Detail` (`BillID`, `OrderID`, `Quantity`, `UnitPrice`) VALUES ('HDD9C1FD6C', 'HDD9C1FD6C', 1, 45000.00);
INSERT INTO `Bill_Detail` (`BillID`, `OrderID`, `Quantity`, `UnitPrice`) VALUES ('HDDA9DAA18', 'HDDA9DAA18', 1, 40000.00);
INSERT INTO `Bill_Detail` (`BillID`, `OrderID`, `Quantity`, `UnitPrice`) VALUES ('HDEE21A988', 'HDEE21A988', 2, 75000.00);
INSERT INTO `Bill_Detail` (`BillID`, `OrderID`, `Quantity`, `UnitPrice`) VALUES ('HD390A7803', 'HDF8160B37', 2, 135000.00);
INSERT INTO `Bill_Detail` (`BillID`, `OrderID`, `Quantity`, `UnitPrice`) VALUES ('HDFE195FF7', 'HDFE195FF7', 1, 30000.00);
-- 39 rows inserted

-- =============================================
-- Table: Category (SQL Server name: [Category])
-- =============================================
DROP TABLE IF EXISTS `Category`;
CREATE TABLE `Category` (
  `CateID` CHAR(10) NOT NULL,
  `CateName` VARCHAR(50) NULL,
  `Description` VARCHAR(200) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `Category` (`CateID`, `CateName`, `Description`) VALUES ('1         ', 'Cơm', NULL);
INSERT INTO `Category` (`CateID`, `CateName`, `Description`) VALUES ('2         ', 'Canh', NULL);
INSERT INTO `Category` (`CateID`, `CateName`, `Description`) VALUES ('3         ', 'Súp', NULL);
INSERT INTO `Category` (`CateID`, `CateName`, `Description`) VALUES ('4         ', 'Mì Xào', NULL);
INSERT INTO `Category` (`CateID`, `CateName`, `Description`) VALUES ('5         ', 'Rau', NULL);
INSERT INTO `Category` (`CateID`, `CateName`, `Description`) VALUES ('6         ', 'Gà', NULL);
INSERT INTO `Category` (`CateID`, `CateName`, `Description`) VALUES ('7         ', 'Thức Uống', NULL);
INSERT INTO `Category` (`CateID`, `CateName`, `Description`) VALUES ('8         ', 'Cá', NULL);
INSERT INTO `Category` (`CateID`, `CateName`, `Description`) VALUES ('9         ', 'test', NULL);
INSERT INTO `Category` (`CateID`, `CateName`, `Description`) VALUES ('ZT02040516', 'AUTO_CAT_040516', 'auto integration');
INSERT INTO `Category` (`CateID`, `CateName`, `Description`) VALUES ('ZT11002730', 'AUTO_CAT_EDIT_002730', 'auto integration edited');
-- 11 rows inserted

-- =============================================
-- Table: Food_Info (SQL Server name: [Food_Info])
-- =============================================
DROP TABLE IF EXISTS `Food_Info`;
CREATE TABLE `Food_Info` (
  `FoodID` CHAR(10) NOT NULL,
  `FoodName` VARCHAR(100) NOT NULL,
  `FoodImage` TEXT NULL,
  `UnitPrice` DECIMAL(18,2) NULL,
  `Description` VARCHAR(300) NULL,
  `CateID` CHAR(10) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `Food_Info` (`FoodID`, `FoodName`, `FoodImage`, `UnitPrice`, `Description`, `CateID`) VALUES ('1         ', 'Cơm gà xối mỡ', 'https://barona.vn/storage/meo-vat/83/com-ga-xoi-mo.jpg', 56000.00, NULL, '1         ');
INSERT INTO `Food_Info` (`FoodID`, `FoodName`, `FoodImage`, `UnitPrice`, `Description`, `CateID`) VALUES ('10        ', 'Mì xào bò ', 'https://maisonmando.com/wp-content/uploads/2022/04/cach-lam-mi-xao-bo-1-1.jpg', 40000.00, NULL, '4         ');
INSERT INTO `Food_Info` (`FoodID`, `FoodName`, `FoodImage`, `UnitPrice`, `Description`, `CateID`) VALUES ('11        ', 'Mì xào hải sản', 'https://cdn.tgdd.vn/2022/05/CookRecipe/GalleryStep/thanh-pham-16.jpg', 50000.00, NULL, '4         ');
INSERT INTO `Food_Info` (`FoodID`, `FoodName`, `FoodImage`, `UnitPrice`, `Description`, `CateID`) VALUES ('12        ', 'Rau muống xào tỏi', 'https://cdn.tgdd.vn/2021/04/CookRecipe/GalleryStep/thanh-pham-1347.jpg', 30000.00, NULL, '5         ');
INSERT INTO `Food_Info` (`FoodID`, `FoodName`, `FoodImage`, `UnitPrice`, `Description`, `CateID`) VALUES ('13        ', 'Xà lách trộn dầu giấm', 'https://cdn.tgdd.vn/2021/06/CookProduct/Saladtrondaugiam1200-1200x676.jpg', 35000.00, NULL, '5         ');
INSERT INTO `Food_Info` (`FoodID`, `FoodName`, `FoodImage`, `UnitPrice`, `Description`, `CateID`) VALUES ('14        ', 'Xà lách trộn bò', 'https://cdn.tgdd.vn/2020/11/CookProduct/Screenshotter--YouTube-6ThaiDinnersYouCanMakeAtHomeQuarantineCookingStayHomeWithMeMarionsKitchen-5%E2%80%9911%E2%80%9D-1200x676.jpg', 70000.00, NULL, '5         ');
INSERT INTO `Food_Info` (`FoodID`, `FoodName`, `FoodImage`, `UnitPrice`, `Description`, `CateID`) VALUES ('15        ', 'Gà quay', 'https://cdn.tgdd.vn/2021/03/CookRecipe/GalleryStep/thanh-pham-287.jpg', 120000.00, NULL, '6         ');
INSERT INTO `Food_Info` (`FoodID`, `FoodName`, `FoodImage`, `UnitPrice`, `Description`, `CateID`) VALUES ('16        ', 'Gà chiên mắm', 'https://www.vinmec.com/static/uploads/20210602_020034_162242_cach_lam_thit_ga_ch_max_1800x1800_jpg_a2edd266e4.jpg', 130000.00, NULL, '6         ');
INSERT INTO `Food_Info` (`FoodID`, `FoodName`, `FoodImage`, `UnitPrice`, `Description`, `CateID`) VALUES ('17        ', 'Nước suối', 'https://bizweb.dktcdn.net/100/333/628/files/nuoc-sach-giau-khoang.jpg?v=1601260428010', 7000.00, NULL, '7         ');
INSERT INTO `Food_Info` (`FoodID`, `FoodName`, `FoodImage`, `UnitPrice`, `Description`, `CateID`) VALUES ('18        ', 'Nước ngọt Cocacola', 'https://japana.vn/uploads/detail/2021/01/images/combo-24-lon-nuoc-ngot-coca-cola-nhat-24-lon-x-500ml%20(2).jpg', 15000.00, NULL, '7         ');
INSERT INTO `Food_Info` (`FoodID`, `FoodName`, `FoodImage`, `UnitPrice`, `Description`, `CateID`) VALUES ('19        ', 'Canh Bí Đỏ', 'https://beptruong.edu.vn/wp-content/uploads/2020/07/cach-nau-canh-bi-do-don-gian.jpg', 55000.00, NULL, '2         ');
INSERT INTO `Food_Info` (`FoodID`, `FoodName`, `FoodImage`, `UnitPrice`, `Description`, `CateID`) VALUES ('2         ', 'Cơm sườn', 'https://i.ytimg.com/vi/h__kLq8NG2I/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDqn7vasJHB1JVJB8uobiB67rxztw', 450000.00, NULL, '1         ');
INSERT INTO `Food_Info` (`FoodID`, `FoodName`, `FoodImage`, `UnitPrice`, `Description`, `CateID`) VALUES ('3         ', 'Cơm bò', 'https://fujifoods.vn/wp-content/uploads/2021/07/com-bo-gyudon-3-2.jpg', 50000.00, NULL, '1         ');
INSERT INTO `Food_Info` (`FoodID`, `FoodName`, `FoodImage`, `UnitPrice`, `Description`, `CateID`) VALUES ('4         ', 'Canh cải nấu tôm/thịt', 'https://cdn.tgdd.vn/Files/2021/02/26/1330784/7-cach-lam-canh-cai-nau-tom-de-lam-giai-nhiet-hang-ngay-202102261354138651.jpg', 35000.00, NULL, '2         ');
INSERT INTO `Food_Info` (`FoodID`, `FoodName`, `FoodImage`, `UnitPrice`, `Description`, `CateID`) VALUES ('5         ', 'Canh khổ qua', 'https://i-giadinh.vnecdn.net/2022/01/27/Thanh-pham-1-1572-1643216934.jpg', 50000.00, NULL, '2         ');
INSERT INTO `Food_Info` (`FoodID`, `FoodName`, `FoodImage`, `UnitPrice`, `Description`, `CateID`) VALUES ('6         ', 'Canh rong biển', 'https://cdn.tgdd.vn/2023/11/CookDish/canh-rong-bien-nau-voi-gi-ngon-tong-hop-cac-mon-canh-tu-rong-avt-1200x676.jpg', 40000.00, NULL, '2         ');
INSERT INTO `Food_Info` (`FoodID`, `FoodName`, `FoodImage`, `UnitPrice`, `Description`, `CateID`) VALUES ('7         ', 'Canh bò trứng', 'https://cdn.tgdd.vn/Files/2018/09/05/1115250/3-cach-nau-canh-ca-chua-trung-bo-duong-cho-bua-com-gia-dinh-202205231518387644.jpg', 55000.00, NULL, '2         ');
INSERT INTO `Food_Info` (`FoodID`, `FoodName`, `FoodImage`, `UnitPrice`, `Description`, `CateID`) VALUES ('8         ', 'Súp gà', 'https://cdn.tgdd.vn/2021/10/CookRecipe/GalleryStep/thanh-pham-1640.jpg', 30000.00, NULL, '3         ');
INSERT INTO `Food_Info` (`FoodID`, `FoodName`, `FoodImage`, `UnitPrice`, `Description`, `CateID`) VALUES ('9         ', 'Súp cua', 'https://cdn.tgdd.vn/2021/03/CookRecipe/GalleryStep/thanh-pham-353.jpg', 35000.00, NULL, '3         ');
INSERT INTO `Food_Info` (`FoodID`, `FoodName`, `FoodImage`, `UnitPrice`, `Description`, `CateID`) VALUES ('FD2FDC9982', 'Cá lóc nướng chui', 'https://toplistcantho.com/wp-content/uploads/2020/07/quan-ca-loc-nuong-ngon-o-can-tho-11.jpg', 120000.00, NULL, '8         ');
INSERT INTO `Food_Info` (`FoodID`, `FoodName`, `FoodImage`, `UnitPrice`, `Description`, `CateID`) VALUES ('FD6842110A', 'Trà Đé', 'https://media-cdn-v2.laodong.vn/Storage/NewsPortal/2019/7/25/746291/Tra-Da.jpg', 4000.00, NULL, '7         ');
INSERT INTO `Food_Info` (`FoodID`, `FoodName`, `FoodImage`, `UnitPrice`, `Description`, `CateID`) VALUES ('FDA6342E37', 'Cơm cháy kho quẹt', '/Content/img/com-chay-kho-quet.jpg', 50000.00, NULL, '1         ');
INSERT INTO `Food_Info` (`FoodID`, `FoodName`, `FoodImage`, `UnitPrice`, `Description`, `CateID`) VALUES ('FDD76BE992', 'Cơm thịt xá xíu ', 'https://photo.znews.vn/w660/Uploaded/tmuitg/2021_05_02/123.jpg', 45000.00, NULL, '1         ');
INSERT INTO `Food_Info` (`FoodID`, `FoodName`, `FoodImage`, `UnitPrice`, `Description`, `CateID`) VALUES ('FDEC57C336', 'Trà Vải', 'https://poseidon-web.s3.zsoft.solutions/app/media/Nau-an/04.2023/2342024-cach-lam-tra-vai-nhiet-doi-buffet-poseidon-1.jpg', 882005.00, NULL, '7         ');
INSERT INTO `Food_Info` (`FoodID`, `FoodName`, `FoodImage`, `UnitPrice`, `Description`, `CateID`) VALUES ('OF00233488', 'AUTO_ORDER_FOOD_00233488', 'https://example.com/order-food.png', 42000.00, 'auto qlorder integration', '1         ');
INSERT INTO `Food_Info` (`FoodID`, `FoodName`, `FoodImage`, `UnitPrice`, `Description`, `CateID`) VALUES ('ZF02042937', 'AUTO_FOOD_042937', 'https://example.com/f.png', 42000.00, 'auto', '1         ');
INSERT INTO `Food_Info` (`FoodID`, `FoodName`, `FoodImage`, `UnitPrice`, `Description`, `CateID`) VALUES ('ZF02043000', 'AUTO_FOOD_043000', 'https://example.com/f.png', 42000.00, 'auto', '1         ');
INSERT INTO `Food_Info` (`FoodID`, `FoodName`, `FoodImage`, `UnitPrice`, `Description`, `CateID`) VALUES ('ZF11002730', 'AUTO_FOOD_EDIT_002730', 'https://example.com/food2.png', 42000.00, 'auto integration edited', '1         ');
-- 28 rows inserted

-- =============================================
-- Table: Ingredient (SQL Server name: [Ingredient])
-- =============================================
DROP TABLE IF EXISTS `Ingredient`;
CREATE TABLE `Ingredient` (
  `IngreID` CHAR(10) NOT NULL,
  `IngreName` VARCHAR(100) NOT NULL,
  `Stock` BIGINT NULL,
  `UnitMeasurement` VARCHAR(50) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `Ingredient` (`IngreID`, `IngreName`, `Stock`, `UnitMeasurement`) VALUES ('1         ', 'Gạo', 30, 'kg');
INSERT INTO `Ingredient` (`IngreID`, `IngreName`, `Stock`, `UnitMeasurement`) VALUES ('2         ', 'Gà', 10, 'con');
INSERT INTO `Ingredient` (`IngreID`, `IngreName`, `Stock`, `UnitMeasurement`) VALUES ('3         ', 'Cà rốt', 100, 'củ');
INSERT INTO `Ingredient` (`IngreID`, `IngreName`, `Stock`, `UnitMeasurement`) VALUES ('4         ', 'Hành tây', 1000, 'củ');
INSERT INTO `Ingredient` (`IngreID`, `IngreName`, `Stock`, `UnitMeasurement`) VALUES ('5         ', 'Nghệ', 1000, 'củ');
INSERT INTO `Ingredient` (`IngreID`, `IngreName`, `Stock`, `UnitMeasurement`) VALUES ('6         ', 'Gừng', 1000, 'củ');
INSERT INTO `Ingredient` (`IngreID`, `IngreName`, `Stock`, `UnitMeasurement`) VALUES ('7         ', 'Tỏi', 1000, 'củ');
INSERT INTO `Ingredient` (`IngreID`, `IngreName`, `Stock`, `UnitMeasurement`) VALUES ('8         ', 'Sườn', 10, 'kg');
INSERT INTO `Ingredient` (`IngreID`, `IngreName`, `Stock`, `UnitMeasurement`) VALUES ('9         ', 'test delete', 4, 'kg');
-- 9 rows inserted

-- =============================================
-- Table: Order (SQL Server name: [Order])
-- =============================================
DROP TABLE IF EXISTS `Order`;
CREATE TABLE `Order` (
  `OrderID` CHAR(10) NOT NULL,
  `CreatedTime` DATETIME NULL,
  `Status` VARCHAR(20) NULL,
  `Total` DECIMAL(18,2) NULL,
  `Note` VARCHAR(200) NULL,
  `Discount` DECIMAL(18,2) NULL,
  `TableID` CHAR(10) NULL,
  `ReservationID` CHAR(10) NULL,
  `UserID` CHAR(10) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HD12D62804', '2025-07-05 18:42:05', 'Đã tạo bill', 882005.00, NULL, 0.00, '2         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HD16D450CE', '2025-06-25 19:06:28', 'Chưa làm', 95000.00, NULL, 0.00, '1         ', NULL, '1         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HD17FB09B4', '2025-07-05 19:38:54', 'Đã thanh toán', 136000.00, NULL, 0.00, '2         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HD19396206', '2025-07-06 21:12:50', 'Đã thanh toán', 75000.00, NULL, 0.00, '2         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HD1F10A55C', '2025-06-25 18:58:08', 'Đã tạo bill', 37000.00, NULL, 0.00, '2         ', NULL, '1         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HD2124CD24', '2025-07-11 10:11:47', 'Đã thanh toán', 124000.00, NULL, 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HD25071100', '2025-07-11 10:16:14', 'Đã thanh toán', 105000.00, NULL, 735.00, '1         ', NULL, '1         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HD25071111', '2025-07-11 10:10:04', 'Đã thanh toán', 325000.00, NULL, 3250.00, '1         ', NULL, '1         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HD25071119', '2025-07-11 14:30:12', 'Đã thanh toán', 47000.00, NULL, 470.00, '1         ', NULL, '1         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HD25071152', '2025-07-11 10:13:08', 'Đã thanh toán', 225000.00, NULL, 45000.00, '1         ', NULL, '1         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HD25071158', '2025-07-11 14:29:27', 'Đã thanh toán', 90000.00, NULL, 900.00, '1         ', NULL, '1         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HD25071164', '2025-07-11 09:12:34', 'Đã thanh toán', 331000.00, NULL, 0.00, '1         ', NULL, '1         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HD25071166', '2025-07-11 11:49:19', 'Đã tính tiền', 120000.00, NULL, 0.00, '1         ', NULL, '1         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HD25071174', '2025-07-11 09:47:36', 'Đã thanh toán', 300000.00, NULL, 0.00, '1         ', NULL, '1         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HD25071187', '2025-07-11 14:27:47', 'Chưa làm', 225000.00, NULL, 0.00, '1         ', NULL, '1         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HD25071827', '2025-07-18 09:17:31', 'Đã thanh toán', 210000.00, NULL, 0.00, '1         ', NULL, '1         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HD25071832', '2025-07-18 09:00:28', 'Đã thanh toán', 230000.00, NULL, 0.00, '1         ', NULL, '1         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HD25071834', '2025-07-18 08:48:45', 'Đã thanh toán', 205000.00, NULL, 0.00, '1         ', NULL, '1         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HD25071876', '2025-07-18 10:34:28', 'Chưa làm', 205000.00, NULL, 0.00, '1         ', NULL, '1         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HD28EE4775', '2025-07-06 21:19:51', 'Đã thanh toán', 80000.00, NULL, 400.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HD29929A9C', '2025-07-17 22:01:51', 'Đã thanh toán', 60000.00, NULL, 60.00, '6         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HD2D81F0EC', '2025-07-18 07:01:27', 'Chưa làm', 56000.00, NULL, 0.00, '4         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HD36C20061', '2025-07-17 22:58:56', 'Đã tạo bill', 4000.00, NULL, 0.00, '6         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HD372189DB', '2025-07-17 22:46:14', 'Đã thanh toán', 30000.00, NULL, 210.00, '6         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HD390A7803', '2025-07-06 20:12:28', 'Đã thanh toán', 189000.00, NULL, 28350.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HD43A41BC7', '2025-07-06 20:11:44', 'Đã tạo bill', 194000.00, NULL, 0.00, '2         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HD46ADFD1E', '2025-07-18 13:55:54', 'Đã thanh toán', 45000.00, NULL, 5400.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HD5F1626B4', '2025-07-06 21:14:13', 'Đã thanh toán', 148000.00, NULL, 0.00, '2         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HD5F8F8437', '2025-07-05 18:27:53', 'Đã tạo bill', 70000.00, NULL, 0.00, '2         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HD82388BE5', '2025-07-06 23:31:24', 'Đã thanh toán', 109000.00, NULL, 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HD88FA4AB7', '2025-07-14 19:04:21', 'Đã thanh toán', 126000.00, NULL, 25200.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HD8BF2B3B7', '2025-07-06 21:10:23', 'Đã thanh toán', 45000.00, NULL, 0.00, '2         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HDA4A14596', '2025-07-04 07:22:23', 'Đã thanh toán', 35000.00, NULL, 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HDAF3E40F4', '2025-07-06 21:13:09', 'Đã tạo bill', 75000.00, NULL, 0.00, '2         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HDB05E9439', '2025-07-06 20:54:59', 'Đã tạo bill', 75000.00, NULL, 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HDB3553614', '2025-07-11 10:39:53', 'Đã tạo bill', 80000.00, NULL, 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HDBF57D527', '2025-07-05 19:38:42', 'Đã thanh toán', 129000.00, NULL, 0.00, '2         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HDC76BC306', '2025-07-18 08:12:19', 'Đã thanh toán', 120000.00, NULL, 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HDCE569E80', '2025-07-11 10:13:32', 'Đã tạo bill', 35000.00, NULL, 0.00, '2         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HDD14A2C79', '2025-07-09 11:43:40', 'Đã thanh toán', 8000.00, NULL, 1600.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HDD73F033D', '2025-07-05 19:34:53', 'Đã thanh toán', 45000.00, NULL, 0.00, '2         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HDD9C1FD6C', '2025-07-06 21:21:28', 'Đã thanh toán', 45000.00, NULL, 0.00, '2         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HDDA9DAA18', '2025-07-05 17:27:49', 'Đã tạo bill', 40000.00, NULL, 0.00, '2         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HDE136A95C', '2025-06-26 21:09:02', 'Đã tạo bill', 80000.00, NULL, 0.00, '1         ', NULL, '1         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HDEE21A988', '2025-06-25 19:06:58', 'Đã thanh toán', 75000.00, NULL, 0.00, '1         ', NULL, '1         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HDF8160B37', '2025-06-27 07:28:57', 'Đã thanh toán', 135000.00, NULL, 0.00, '1         ', NULL, '1         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('HDFE195FF7', '2025-07-06 21:00:15', 'Hoàn tất', 30000.00, NULL, 9000.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('OB00233488', '2026-04-11 07:23:37', 'Đã tạo bill', 42000.00, 'billing scenario', 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('OC00233488', '2026-04-11 07:23:36', 'Ho?n t?t', 42000.00, 'auto delete completed order', 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('OC11002419', '2026-04-11 07:24:39', 'Hoàn tất', 42000.00, 'auto delete completed order', 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('OG00233488', '2026-04-11 07:23:36', 'Chưa làm', 42000.00, 'status change scenario', 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('OO00233488', '2026-04-11 07:23:35', 'Chưa làm', 42000.00, 'auto qlorder test', 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD0034866', '2025-11-17 17:20:34', 'Chưa làm', 266000.00, '=== ĐẶT BÀN ===\nKhách hàng: ngocngoc\nSĐT: 5685847\nBàn: A7\nNgày: 27/11/2025\nGiờ: 05:20\nThanh toán: Tiền mặt', 0.00, '7         ', '7         ', '3292731962');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD0239017', '2025-10-19 07:50:46', 'Hoàn tất', 15000.00, 'Order for A1 by khang', 0.00, '1         ', NULL, '3         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD0258299', '2025-11-17 14:37:46', 'Chưa làm', 626000.00, 'Order for A5 by VAnh', 0.00, '5         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD0348080', '2025-10-19 07:52:35', 'Chưa làm', 75000.00, 'Order for A3 by khang', 0.00, '3         ', NULL, '3         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD0502646', '2025-10-15 04:30:46', 'pending', 100.00, NULL, 0.00, '1         ', NULL, '1         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD0502927', '2025-10-15 04:35:27', 'pending', 50000.00, 'Test', 0.00, '1         ', NULL, '1         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD0503234', '2025-10-15 04:40:34', 'pending', 25000.00, 'Test order from app', 0.00, '1         ', NULL, '1         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD0503247', '2025-10-15 04:40:47', 'Chưa làm', 25000.00, 'Test order from app', 0.00, '1         ', NULL, '1         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD0534065', '2025-11-25 08:49:10', 'Đã tạo bill', 150000.00, 'Order for A8 by VAnh', 0.00, 'T008      ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD0780626', '2025-11-19 02:53:00', 'Chưa làm', 146000.00, '=== ĐẶT BÀN ===\nKhách hàng: ngocngoc\nSĐT: 6748888\nBàn: A7\nNgày: 28/11/2025\nGiờ: 05:52', 0.00, '7         ', '7         ', '3292731962');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD0908807', '2025-10-19 08:01:49', 'Chưa làm', 55000.00, 'Order for A1 by khang', 0.00, '1         ', NULL, '3         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD0E5896B', '2026-03-23 15:30:42', 'Chưa làm', 0.00, 'E2E seeded order 2026-03-23T08:30:42.7980932Z', 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD1296126', '2025-11-04 07:28:31', 'Chưa làm', 63000.00, 'Order for A2 by VAnh', 0.00, '2         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD1534806', '2025-10-19 08:12:19', 'Hoàn tất', 40000.00, 'Order for A2 by khang', 0.00, '2         ', NULL, '3         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD1609224', '2025-11-25 09:06:49', 'Chưa làm', 146000.00, '=== ĐẶT BÀN ===\nKhách hàng: ngocngoc\nSĐT: 09374819\nBàn: A8\nNgày: 30/11/2025\nGiờ: 05:06\nThanh toán: Thẻ tín dụng', 0.00, 'T008      ', 'T008      ', '3292731962');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD16263A0', '2026-03-23 14:57:26', 'chưa làm', 0.00, 'E2E seeded order 2026-03-23T07:57:26.6143379Z', 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD18D4E3E', '2026-03-23 15:30:09', 'Chưa làm', 0.00, 'E2E seeded order 2026-03-23T08:30:09.9570772Z', 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD1902158', '2025-10-19 08:18:23', 'Chưa làm', 130000.00, 'Order for A3 by khang', 0.00, '3         ', NULL, '3         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD220228C', '2026-03-23 14:52:54', 'chưa làm', 0.00, 'E2E seeded order 2026-03-23T07:52:54.0125926Z', 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD2409640', '2025-10-27 16:26:54', 'Hoàn tất', 556000.00, 'Order for A5 by VAnh', 0.00, '5         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD2757518', '2025-10-19 08:32:42', 'Hoàn tất', 35000.00, 'Order for A1 by khang', 0.00, '1         ', NULL, '3         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD2888116', '2026-03-23 14:48:45', 'Chưa làm', 0.00, 'E2E seeded order 2026-03-23T07:48:45.3740252Z', 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD3110537', '2025-10-19 08:38:38', 'Đã tạo bill', 187000.00, 'Order for A2 by khang', 0.00, '2         ', NULL, '3         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD3143692', '2025-10-19 08:39:05', 'Đã tạo bill', 50000.00, 'Order for A1 by khang', 0.00, '1         ', NULL, '3         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD3394930', '2025-11-17 15:55:30', 'Pending', 166000.00, '=== ĐƠN HÀNG ONLINE ===\nKhách hàng: ngocngoc\nSĐT: 0934103951\nĐịa chỉ: 449/89/8\nGhi chú: gzdgbbgcx', 0.00, '8         ', NULL, '3292731962');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD3602796', '2025-10-19 08:46:44', 'Hoàn tất', 40000.00, 'Order for A2 by khang', 0.00, '2         ', NULL, '3         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD40BEC33', '2026-03-23 14:09:57', 'Chưa làm', 0.00, 'E2E seeded order 2026-03-23T07:09:57.8294974Z', 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD426267F', '2026-03-23 14:09:27', 'Chưa làm', 0.00, 'E2E seeded order 2026-03-23T07:09:27.4644211Z', 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD51FD99D', '2026-03-23 14:00:23', 'Chưa làm', 0.00, 'E2E seeded order 2026-03-23T07:00:23.7842101Z', 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD5253763', '2025-11-17 16:00:53', 'Chưa làm', 146000.00, '=== ĐƠN HÀNG ONLINE ===\nKhách hàng: ngocngoc\nSĐT: 0934103951\nĐịa chỉ: rgfdzcvc\nGhi chú: tsgf cgfc', 0.00, '8         ', NULL, '3292731962');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD5554829', '2025-11-17 16:05:54', 'Hoàn tất', 146000.00, '=== ĐƠN HÀNG ONLINE ===\nKhách hàng: ngocngoc\nSĐT: 586448850\nĐịa chỉ: gdythsd\nGhi chú: tsgccgbh', 0.00, '8         ', NULL, '3292731962');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD5697531', '2025-11-26 05:41:38', 'Chưa làm', 146000.00, '=== ĐẶT BÀN ===\nKhách hàng: ngocngoc\nSĐT: 568802556\nBàn: A6\nNgày: 30/11/2025\nGiờ: 05:41\nThanh toán: Tiền mặt', 0.00, '6         ', '6         ', '3292731962');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD570EFDD', '2026-03-23 14:49:16', 'Chưa làm', 0.00, 'E2E seeded order 2026-03-23T07:49:16.7304958Z', 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD5776333', '2025-11-18 08:49:36', 'Đã tạo bill', 146000.00, '=== ĐẶT BÀN ===\nKhách hàng: ngocngoc\nSĐT: 0852844\nBàn: A7\nNgày: 18/11/2025\nGiờ: 06:49\nThanh toán: Tiền mặt', 0.00, '7         ', '7         ', '3292731962');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD5853608', '2025-10-19 09:24:25', 'Hoàn tất', 128000.00, 'Order for A1 by abc', 0.00, '1         ', NULL, '1         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD5876117', '2025-10-19 14:58:08', 'Chưa làm', 56000.00, 'Order for A7 by VAnh', 0.00, '7         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD6262358', '2025-10-29 02:51:23', 'Đã tạo bill', 556000.00, 'Order for A2 by VAnh', 0.00, '2         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD6274013', '2025-11-18 08:57:54', 'Chưa làm', 141000.00, '=== ĐẶT BÀN ===\nKhách hàng: ngocngoc\nSĐT: 5795888888\nBàn: A7\nNgày: 28/11/2025\nGiờ: 06:57\nThanh toán: Tiền mặt', 0.00, '7         ', '7         ', '3292731962');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD6291569', '2025-10-27 14:45:03', 'Hoàn tất', 90000.00, 'Order for A5 by VAnh', 0.00, '5         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD6294137', '2026-03-23 15:26:04', 'chưa làm', 0.00, 'E2E seeded order 2026-03-23T08:26:04.6367103Z', 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD6985643', '2025-11-17 16:29:45', 'Hoàn tất', 146000.00, '=== ĐẶT BÀN ===\nKhách hàng: ngocngoc\nSĐT: 586587486\nBàn: A6\nNgày: 21/11/2025\nGiờ: 07:29', 0.00, '6         ', '6         ', '3292731962');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD6A27F32', '2026-03-23 15:28:36', 'Chưa làm', 0.00, 'E2E seeded order 2026-03-23T08:28:36.4084790Z', 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD7105079', '2025-11-18 09:11:45', 'Đã tạo bill', 136000.00, '=== ĐẶT BÀN ===\nKhách hàng: ngocngoc\nSĐT: 56845880\nBàn: A7\nNgày: 19/11/2025\nGiờ: 04:24\nThanh toán: Chuyển khoản', 0.00, '7         ', '7         ', '3292731962');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD7299476', '2025-11-17 16:34:59', 'Đã tạo bill', 176000.00, '=== ĐẶT BÀN ===\nKhách hàng: ngocngoc\nSĐT: 546 08987\nBàn: A7\nNgày: 29/11/2025\nGiờ: 06:34', 0.00, '7         ', '7         ', '3292731962');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD73CF716', '2026-03-23 14:07:57', 'Chưa làm', 0.00, 'E2E seeded order 2026-03-23T07:07:57.2137218Z', 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD79D054B', '2026-03-23 14:06:25', 'chưa làm', 0.00, 'E2E seeded order 2026-03-23T07:06:25.2057401Z', 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD8419448', '2025-10-21 06:33:55', 'Hoàn tất', 40000.00, 'Order for A5 by abc', 0.00, '5         ', NULL, '1         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD873F7D2', '2026-03-23 14:47:42', 'Chưa làm', 0.00, 'E2E seeded order 2026-03-23T07:47:42.8192290Z', 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD8AD5F41', '2026-03-23 14:54:50', 'chưa làm', 0.00, 'E2E seeded order 2026-03-23T07:54:50.3119809Z', 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD94F32B4', '2026-03-23 14:08:57', 'Chưa làm', 0.00, 'E2E seeded order 2026-03-23T07:08:57.2312084Z', 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD9787635', '2026-02-26 07:09:52', 'Chưa làm', 556000.00, 'Order for A9 by VAnh', 0.00, 'T009      ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORD9C7C7E8', '2026-03-23 15:28:05', 'Chưa làm', 0.00, 'E2E seeded order 2026-03-23T08:28:05.3038741Z', 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORDA1DD6A9', '2026-03-23 14:59:43', 'chưa làm', 0.00, 'E2E seeded order 2026-03-23T07:59:43.8928384Z', 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORDA3DC254', '2026-03-23 14:08:27', 'Chưa làm', 0.00, 'E2E seeded order 2026-03-23T07:08:27.2183781Z', 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORDA73D046', '2026-03-23 13:58:48', 'chưa làm', 0.00, 'E2E seeded order 2026-03-23T06:58:48.5223589Z', 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORDC60F8B6', '2026-03-23 14:58:28', 'chưa làm', 0.00, 'E2E seeded order 2026-03-23T07:58:28.9735846Z', 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORDC65D907', '2026-03-23 15:29:07', 'Chưa làm', 0.00, 'E2E seeded order 2026-03-23T08:29:07.0850239Z', 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORDCA102ED', '2026-03-23 14:46:05', 'chưa làm', 0.00, 'E2E seeded order 2026-03-23T07:46:05.1693218Z', 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORDD3C0871', '2026-03-23 14:01:25', 'Chưa làm', 0.00, 'E2E seeded order 2026-03-23T07:01:25.4513119Z', 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORDD7CA3CC', '2026-03-23 15:29:38', 'Chưa làm', 0.00, 'E2E seeded order 2026-03-23T08:29:38.2844272Z', 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORDDE26F9E', '2026-03-23 14:48:14', 'Chưa làm', 0.00, 'E2E seeded order 2026-03-23T07:48:14.0250287Z', 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORDE3D7D31', '2026-03-23 14:00:54', 'Chưa làm', 0.00, 'E2E seeded order 2026-03-23T07:00:54.8394556Z', 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ORDED7D010', '2026-03-23 14:49:48', 'Chưa làm', 0.00, 'E2E seeded order 2026-03-23T07:49:48.0363902Z', 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('OS00233488', '2026-04-11 07:23:36', 'Chưa làm', 42000.00, 'auto complete sync order', 0.00, '1         ', NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('QA04110711', '2026-04-11 00:11:25', 'Chưa làm', 0.00, 'invalid missing table', 0.00, NULL, NULL, '4         ');
INSERT INTO `Order` (`OrderID`, `CreatedTime`, `Status`, `Total`, `Note`, `Discount`, `TableID`, `ReservationID`, `UserID`) VALUES ('ZO02042937', '2026-04-02 04:29:13', 'Pending', 42000.00, 'auto', 0.00, '1         ', NULL, '4         ');
-- 118 rows inserted

-- =============================================
-- Table: Order_Detail (SQL Server name: [Order_Detail])
-- =============================================
DROP TABLE IF EXISTS `Order_Detail`;
CREATE TABLE `Order_Detail` (
  `FoodID` CHAR(10) NOT NULL,
  `OrderID` CHAR(10) NOT NULL,
  `UnitPrice` DECIMAL(18,2) NULL,
  `Status` VARCHAR(20) NULL,
  `Quantity` INT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'HD17FB09B4', 59000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'HD25071876', NULL, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'HD2D81F0EC', 56000.00, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'HD390A7803', 59000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'HD43A41BC7', 59000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'HD5F1626B4', 59000.00, 'Hoàn tất', 2);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'HD82388BE5', 59000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'HD88FA4AB7', 56000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'HDBF57D527', 59000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'ORD0034866', 56000.00, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'ORD0258299', NULL, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'ORD0503247', NULL, 'pending', 2);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'ORD0780626', 56000.00, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'ORD0E5896B', NULL, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'ORD1296126', NULL, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'ORD1609224', 56000.00, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'ORD18D4E3E', NULL, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'ORD2409640', 56000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'ORD2888116', NULL, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'ORD40BEC33', NULL, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'ORD426267F', NULL, 'Chưa làm', 2);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'ORD51FD99D', NULL, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'ORD5554829', 56000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'ORD5697531', 56000.00, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'ORD570EFDD', NULL, 'Chưa làm', 2);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'ORD5776333', 56000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'ORD5876117', NULL, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'ORD6262358', 56000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'ORD6274013', 56000.00, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'ORD6985643', 56000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'ORD6A27F32', NULL, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'ORD7105079', 56000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'ORD7299476', 56000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'ORD73CF716', NULL, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'ORD873F7D2', NULL, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'ORD94F32B4', NULL, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'ORD9787635', NULL, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'ORD9C7C7E8', NULL, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'ORDA3DC254', NULL, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'ORDC65D907', NULL, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'ORDD3C0871', NULL, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'ORDD7CA3CC', NULL, 'Chưa làm', 2);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'ORDDE26F9E', NULL, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'ORDE3D7D31', NULL, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('1         ', 'ORDED7D010', NULL, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('10        ', 'HD19396206', 45000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('10        ', 'HD25071119', 40000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('10        ', 'HD43A41BC7', 45000.00, 'Hoàn tất', 3);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('10        ', 'HD88FA4AB7', 40000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('10        ', 'HD8BF2B3B7', 45000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('10        ', 'HDAF3E40F4', 45000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('10        ', 'HDB05E9439', 45000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('10        ', 'HDB3553614', 40000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('10        ', 'HDC76BC306', 40000.00, 'Hoàn tất', 3);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('10        ', 'HDD14A2C79', 4000.00, 'Hoàn tất', 2);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('10        ', 'HDD73F033D', 45000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('10        ', 'HDD9C1FD6C', 45000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('10        ', 'HDDA9DAA18', 40000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('10        ', 'HDE136A95C', 40000.00, 'Hoàn tất', 2);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('10        ', 'HDEE21A988', 45000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('10        ', 'ORD0034866', 40000.00, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('10        ', 'ORD0780626', 40000.00, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('10        ', 'ORD0908807', 40000.00, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('10        ', 'ORD1609224', 40000.00, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('10        ', 'ORD18D4E3E', NULL, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('10        ', 'ORD3602796', 40000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('10        ', 'ORD40BEC33', NULL, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('10        ', 'ORD5253763', 40000.00, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('10        ', 'ORD5554829', 40000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('10        ', 'ORD5697531', 40000.00, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('10        ', 'ORD5776333', 40000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('10        ', 'ORD6985643', 40000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('10        ', 'ORD7299476', 40000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('10        ', 'ORD8419448', 40000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('10        ', 'ORDED7D010', NULL, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('11        ', 'HD16D450CE', 50000.00, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('11        ', 'HD28EE4775', 50000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('11        ', 'HD82388BE5', 50000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('11        ', 'ORD0034866', 50000.00, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('11        ', 'ORD0780626', 50000.00, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('11        ', 'ORD1609224', 50000.00, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('11        ', 'ORD5554829', 50000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('11        ', 'ORD5697531', 50000.00, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('11        ', 'ORD5776333', 50000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('11        ', 'ORD5876117', 50000.00, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('11        ', 'ORD6274013', 50000.00, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('11        ', 'ORD6985643', 50000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('11        ', 'ORD7105079', 50000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('11        ', 'ORD7299476', 50000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('12        ', 'HD19396206', 30000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('12        ', 'HD1F10A55C', 30000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('12        ', 'HD28EE4775', 30000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('12        ', 'HD372189DB', 30000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('12        ', 'HD390A7803', 30000.00, 'Hoàn tất', 2);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('12        ', 'HD5F1626B4', 30000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('12        ', 'HD88FA4AB7', 30000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('12        ', 'HDAF3E40F4', 30000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('12        ', 'HDB05E9439', 30000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('12        ', 'HDEE21A988', 30000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('12        ', 'HDFE195FF7', 30000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('12        ', 'ORD0034866', 30000.00, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('12        ', 'ORD2757518', 30000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('12        ', 'ORD3602796', 30000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('12        ', 'ORD7105079', 30000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('12        ', 'ORD7299476', 30000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('13        ', 'ORD6274013', 35000.00, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('14        ', 'HD17FB09B4', 70000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('14        ', 'HD390A7803', 70000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('14        ', 'HD5F8F8437', 70000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('14        ', 'HDBF57D527', 70000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('15        ', 'HDF8160B37', 120000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('15        ', 'ORD5853608', 120000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('16        ', 'ORD1902158', NULL, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('17        ', 'HD17FB09B4', 7000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('17        ', 'HD1F10A55C', 7000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('17        ', 'HD25071119', 7000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('17        ', 'HD25071876', NULL, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('17        ', 'ORD0534065', 7000.00, 'Hoàn tất', 3);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('17        ', 'ORD1296126', NULL, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('17        ', 'ORD1902158', 7000.00, 'Chưa làm', 3);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('17        ', 'ORD3110537', 7000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('17        ', 'ORD5853608', 7000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('17        ', 'ORD5876117', 7000.00, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('18        ', 'HD29929A9C', 15000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('18        ', 'HDF8160B37', 15000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('18        ', 'ORD0239017', 15000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('18        ', 'ORD3143692', 15000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('18        ', 'ORD5876117', 15000.00, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('19        ', 'HD25071100', 55000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('19        ', 'HD25071111', 55000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('19        ', 'HD25071152', 55000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('19        ', 'HD25071158', 55000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('19        ', 'HD25071187', 55000.00, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('19        ', 'HD25071827', 55000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('19        ', 'HD25071832', 55000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('19        ', 'ORD0908807', NULL, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('19        ', 'ORD3110537', 55000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('2         ', 'ORD0258299', NULL, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('2         ', 'ORD2409640', 450000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('2         ', 'ORD6262358', 450000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('2         ', 'ORD9787635', NULL, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('3         ', 'HD25071111', 50000.00, 'Hoàn tất', 2);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('3         ', 'HD25071876', 50000.00, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('3         ', 'ORD0258299', NULL, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('3         ', 'ORD0534065', 50000.00, 'Hoàn tất', 3);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('3         ', 'ORD2409640', 50000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('3         ', 'ORD3143692', 50000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('3         ', 'ORD6262358', 50000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('3         ', 'ORD6291569', 50000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('3         ', 'ORD9787635', NULL, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('4         ', 'HD25071158', 35000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('4         ', 'HD25071827', 35000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('4         ', 'HD25071834', 35000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('4         ', 'HD25071876', 35000.00, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('4         ', 'HDCE569E80', 35000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('4         ', 'ORD0258299', NULL, 'Chưa làm', 2);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('4         ', 'ORD3110537', 35000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('5         ', 'HD25071100', 50000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('5         ', 'HD25071111', 50000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('5         ', 'HD25071152', 50000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('5         ', 'HD25071187', 50000.00, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('5         ', 'HD25071834', 50000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('5         ', 'ORD3110537', 50000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('6         ', 'HDB3553614', 40000.00, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('6         ', 'ORD1534806', 40000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('6         ', 'ORD3110537', 40000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('6         ', 'ORD6291569', 40000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('7         ', 'HD25071832', 55000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('8         ', 'ORD0348080', NULL, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('8         ', 'ORD1534806', 30000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('9         ', 'HD2D81F0EC', 35000.00, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('9         ', 'HDA4A14596', 35000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('9         ', 'ORD2757518', 35000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('FD2FDC9982', 'HD2124CD24', 120000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('FD2FDC9982', 'HD25071111', 120000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('FD2FDC9982', 'HD25071152', 120000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('FD2FDC9982', 'HD25071187', 120000.00, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('FD2FDC9982', 'HD25071827', 120000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('FD2FDC9982', 'HD25071832', 120000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('FD2FDC9982', 'HD25071834', 120000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('FD2FDC9982', 'HD25071876', 120000.00, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('FD6842110A', 'HD2124CD24', 4000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('FD6842110A', 'HD36C20061', 4000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('FD6842110A', 'ORD3143692', 4000.00, 'Hoàn tất', 2);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('FD6842110A', 'ORD5853608', 4000.00, 'Hoàn tất', 2);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('FD6842110A', 'ORD6291569', 4000.00, 'Hoàn tất', 2);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('FDD76BE992', 'HD16D450CE', 45000.00, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('FDD76BE992', 'HD29929A9C', 45000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('FDD76BE992', 'HD46ADFD1E', 45000.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('FDD76BE992', 'ORD0348080', NULL, 'Chưa làm', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('FDEC57C336', 'HD12D62804', 882005.00, 'Hoàn tất', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('OF00233488', 'OB00233488', 42000.00, 'Ho?n t?t', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('OF00233488', 'OG00233488', 42000.00, '?ang x? l?', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('OF00233488', 'OO00233488', 42000.00, 'Ch?a l?m', 1);
INSERT INTO `Order_Detail` (`FoodID`, `OrderID`, `UnitPrice`, `Status`, `Quantity`) VALUES ('OF00233488', 'OS00233488', 42000.00, 'Ho?n t?t', 1);
-- 195 rows inserted

-- =============================================
-- Table: Recipe (SQL Server name: [Recipe])
-- =============================================
DROP TABLE IF EXISTS `Recipe`;
CREATE TABLE `Recipe` (
  `RecipeID` CHAR(10) NOT NULL,
  `RecipeDescription` VARCHAR(200) NULL,
  `FoodID` CHAR(10) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `Recipe` (`RecipeID`, `RecipeDescription`, `FoodID`) VALUES ('1         ', '1', '1         ');
INSERT INTO `Recipe` (`RecipeID`, `RecipeDescription`, `FoodID`) VALUES ('2         ', 'mì với hải sản', '11        ');
INSERT INTO `Recipe` (`RecipeID`, `RecipeDescription`, `FoodID`) VALUES ('3         ', NULL, '2         ');
INSERT INTO `Recipe` (`RecipeID`, `RecipeDescription`, `FoodID`) VALUES ('4         ', NULL, '16        ');
-- 4 rows inserted

-- =============================================
-- Table: Recipe_Detail (SQL Server name: [Recipe_Detail])
-- =============================================
DROP TABLE IF EXISTS `Recipe_Detail`;
CREATE TABLE `Recipe_Detail` (
  `RecipeID` CHAR(10) NOT NULL,
  `IngreID` CHAR(10) NOT NULL,
  `UnitMeasurement` VARCHAR(20) NULL,
  `Quantity` BIGINT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `Recipe_Detail` (`RecipeID`, `IngreID`, `UnitMeasurement`, `Quantity`) VALUES ('1         ', '1         ', NULL, NULL);
INSERT INTO `Recipe_Detail` (`RecipeID`, `IngreID`, `UnitMeasurement`, `Quantity`) VALUES ('1         ', '2         ', NULL, NULL);
INSERT INTO `Recipe_Detail` (`RecipeID`, `IngreID`, `UnitMeasurement`, `Quantity`) VALUES ('1         ', '3         ', NULL, NULL);
INSERT INTO `Recipe_Detail` (`RecipeID`, `IngreID`, `UnitMeasurement`, `Quantity`) VALUES ('1         ', '4         ', NULL, NULL);
INSERT INTO `Recipe_Detail` (`RecipeID`, `IngreID`, `UnitMeasurement`, `Quantity`) VALUES ('1         ', '5         ', NULL, NULL);
INSERT INTO `Recipe_Detail` (`RecipeID`, `IngreID`, `UnitMeasurement`, `Quantity`) VALUES ('1         ', '6         ', NULL, NULL);
INSERT INTO `Recipe_Detail` (`RecipeID`, `IngreID`, `UnitMeasurement`, `Quantity`) VALUES ('1         ', '7         ', NULL, NULL);
-- 7 rows inserted

-- =============================================
-- Table: Table (SQL Server name: [Table])
-- =============================================
DROP TABLE IF EXISTS `Table`;
CREATE TABLE `Table` (
  `TableID` CHAR(10) NOT NULL,
  `TableName` VARCHAR(20) NULL,
  `NumOfSeats` INT NULL,
  `Status` VARCHAR(20) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `Table` (`TableID`, `TableName`, `NumOfSeats`, `Status`) VALUES ('1         ', 'A1', 4, 'Available');
INSERT INTO `Table` (`TableID`, `TableName`, `NumOfSeats`, `Status`) VALUES ('2         ', 'A2', 2, 'Available');
INSERT INTO `Table` (`TableID`, `TableName`, `NumOfSeats`, `Status`) VALUES ('3         ', 'A3', 3, 'Available');
INSERT INTO `Table` (`TableID`, `TableName`, `NumOfSeats`, `Status`) VALUES ('4         ', 'A4', 1, 'Occupied');
INSERT INTO `Table` (`TableID`, `TableName`, `NumOfSeats`, `Status`) VALUES ('5         ', 'A5', 10, 'Available');
INSERT INTO `Table` (`TableID`, `TableName`, `NumOfSeats`, `Status`) VALUES ('6         ', 'A6', 7, 'Available');
INSERT INTO `Table` (`TableID`, `TableName`, `NumOfSeats`, `Status`) VALUES ('7         ', 'A7', 5, 'Available');
INSERT INTO `Table` (`TableID`, `TableName`, `NumOfSeats`, `Status`) VALUES ('8         ', 'Online', 99, 'Available');
INSERT INTO `Table` (`TableID`, `TableName`, `NumOfSeats`, `Status`) VALUES ('T008      ', 'A8', 4, 'Available');
INSERT INTO `Table` (`TableID`, `TableName`, `NumOfSeats`, `Status`) VALUES ('T009      ', 'A9', 4, 'Available');
-- 10 rows inserted

-- =============================================
-- Table: User (SQL Server name: [User])
-- =============================================
DROP TABLE IF EXISTS `User`;
CREATE TABLE `User` (
  `UserID` CHAR(10) NOT NULL,
  `UserName` VARCHAR(50) NOT NULL,
  `Password` VARCHAR(20) NOT NULL,
  `Role` VARCHAR(25) NULL,
  `Right` VARCHAR(25) NULL,
  `FullName` VARCHAR(250) NULL,
  `Phone` INT NULL,
  `Email` VARCHAR(100) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `User` (`UserID`, `UserName`, `Password`, `Role`, `Right`, `FullName`, `Phone`, `Email`) VALUES ('1         ', 'abc', 'abc1234', 'NV', NULL, 'Duong', 12345, 'duongcho@gmail.com');
INSERT INTO `User` (`UserID`, `UserName`, `Password`, `Role`, `Right`, `FullName`, `Phone`, `Email`) VALUES ('2         ', 'bao', 'bao2211', 'TN', NULL, 'Bao', 123456, NULL);
INSERT INTO `User` (`UserID`, `UserName`, `Password`, `Role`, `Right`, `FullName`, `Phone`, `Email`) VALUES ('3         ', 'khang', 'khang123', 'Bep', NULL, 'Khang', 1234567, 'jaLKSJKLJ');
INSERT INTO `User` (`UserID`, `UserName`, `Password`, `Role`, `Right`, `FullName`, `Phone`, `Email`) VALUES ('3292731962', 'ngoc', 'Ngoc123', 'Customer', 'USER', 'ngocngoc', 909090909, 'ngcc12@gmail.com');
INSERT INTO `User` (`UserID`, `UserName`, `Password`, `Role`, `Right`, `FullName`, `Phone`, `Email`) VALUES ('4         ', 'VAnh', 'VAnh123', 'Admin', NULL, 'VAnh', 12345678, 'ádasdas');
-- 5 rows inserted

-- =============================================
-- Table: OrderHistory (SQL Server name: OrderHistory)
-- =============================================
DROP TABLE IF EXISTS `OrderHistory`;
CREATE TABLE `OrderHistory` (
  `OrderHistoryId` CHAR(10) NOT NULL,
  `UserId` CHAR(10) NOT NULL,
  `OrderId` CHAR(10) NOT NULL,
  `CreatedTime` DATETIME NOT NULL,
  `Status` VARCHAR(20) NULL,
  `Total` DECIMAL(18,2) NULL,
  `Note` VARCHAR(200) NULL,
  `TableId` CHAR(10) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `OrderHistory` (`OrderHistoryId`, `UserId`, `OrderId`, `CreatedTime`, `Status`, `Total`, `Note`, `TableId`) VALUES ('1762243040', '3292731962', 'HD25071100', '2025-11-04 07:57:20', 'Đã thanh toán', 105000.00, NULL, '1         ');
-- 1 rows inserted

-- =============================================
-- Table: TableReservationHistory (SQL Server name: TableReservationHistory)
-- =============================================
DROP TABLE IF EXISTS `TableReservationHistory`;
CREATE TABLE `TableReservationHistory` (
  `ReservationHistoryId` CHAR(10) NOT NULL,
  `UserId` CHAR(10) NOT NULL,
  `TableId` CHAR(10) NOT NULL,
  `ReservationDate` DATETIME NOT NULL,
  `ReservationTime` TIME NOT NULL,
  `CreatedTime` DATETIME NOT NULL,
  `Status` VARCHAR(20) NOT NULL,
  `PartySize` INT NOT NULL,
  `Note` VARCHAR(200) NULL,
  `CancelledTime` DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `TableReservationHistory` (`ReservationHistoryId`, `UserId`, `TableId`, `ReservationDate`, `ReservationTime`, `CreatedTime`, `Status`, `PartySize`, `Note`, `CancelledTime`) VALUES ('1762242458', '3292731962', '7         ', '2026-12-15 00:00:00', '18:30:00', '2025-11-04 07:47:38', 'Pending', 4, 'Quick test reservation', NULL);
-- 1 rows inserted

-- =============================================
-- Table: UserFavorites (SQL Server name: UserFavorites)
-- =============================================
DROP TABLE IF EXISTS `UserFavorites`;
CREATE TABLE `UserFavorites` (
  `UserFavoriteId` CHAR(10) NOT NULL,
  `UserId` CHAR(10) NOT NULL,
  `FoodId` CHAR(10) NOT NULL,
  `CreatedTime` DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `UserFavorites` (`UserFavoriteId`, `UserId`, `FoodId`, `CreatedTime`) VALUES ('1762250533', '3292731962', '1         ', '2025-11-04 10:02:13');
INSERT INTO `UserFavorites` (`UserFavoriteId`, `UserId`, `FoodId`, `CreatedTime`) VALUES ('UF10754738', '3292731962', '10        ', '2025-11-18 15:49:51');
INSERT INTO `UserFavorites` (`UserFavoriteId`, `UserId`, `FoodId`, `CreatedTime`) VALUES ('UF21950223', '3292731962', '18        ', '2025-11-26 05:26:52');
-- 3 rows inserted

SET FOREIGN_KEY_CHECKS = 1;

-- End of export
