-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: db:3306
-- Generation Time: Aug 22, 2025 at 02:35 PM
-- Server version: 9.4.0
-- PHP Version: 8.2.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `skincare_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `Admin`
--

CREATE TABLE `Admin` (
  `AdminID` int NOT NULL,
  `Type` varchar(50) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `Password` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Admin`
--

INSERT INTO `Admin` (`AdminID`, `Type`, `Email`, `Password`) VALUES
(1, 'zawe', 'owner', '$2y$12$dhS2R9PU86EAX3IXRup7EOmJrbagq4u4hIglRylSYUlfM76O8ag7a');

-- --------------------------------------------------------

--
-- Table structure for table `BankPayment`
--

CREATE TABLE `BankPayment` (
  `PaymentID` int NOT NULL,
  `BankTrcID` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `CashOnDeli`
--

CREATE TABLE `CashOnDeli` (
  `CalID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Categories`
--

CREATE TABLE `Categories` (
  `CategoryID` int NOT NULL,
  `CategoryName` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Categories`
--

INSERT INTO `Categories` (`CategoryID`, `CategoryName`) VALUES
(2, 'Cream'),
(1, 'Face Wash'),
(5, 'Makeup'),
(4, 'Mask'),
(6, 'Serum'),
(3, 'Toner');

-- --------------------------------------------------------

--
-- Table structure for table `Customer`
--

CREATE TABLE `Customer` (
  `CID` int NOT NULL,
  `CName` varchar(100) DEFAULT NULL,
  `CPhone` varchar(15) DEFAULT NULL,
  `Address` text,
  `CEmail` varchar(100) DEFAULT NULL,
  `CPass` varchar(100) DEFAULT NULL,
  `Gender` tinyint(1) DEFAULT NULL,
  `SkinType` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Customer`
--

INSERT INTO `Customer` (`CID`, `CName`, `CPhone`, `Address`, `CEmail`, `CPass`, `Gender`, `SkinType`) VALUES
(1, 'Kyaw Htet', '09123456789', '123 Yangon Road, Yangon', 'Kyaw@example.com', 'securepass123', 1, 'Oily'),
(5, 'Aye', NULL, NULL, 'aa@gmail.com', '202cb962ac59075b964b07152d234b70', NULL, NULL),
(6, 'aung', NULL, NULL, 'aung@gmail.com', '202cb962ac59075b964b07152d234b70', NULL, NULL),
(7, 'zawe', NULL, NULL, 'zawe@gmail.com', '202cb962ac59075b964b07152d234b70', NULL, NULL),
(8, 'myo@', NULL, NULL, 'myo@gmail.com', '202cb962ac59075b964b07152d234b70', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `Kpay`
--

CREATE TABLE `Kpay` (
  `PaymentID` int NOT NULL,
  `TrcID` varchar(100) DEFAULT NULL,
  `TrcImg` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Notification`
--

CREATE TABLE `Notification` (
  `NotiID` int NOT NULL,
  `CustomerID` int DEFAULT NULL,
  `Message` text,
  `DateSent` date DEFAULT NULL,
  `isRead` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Order`
--

CREATE TABLE `Order` (
  `OrderID` int NOT NULL,
  `customerID` int DEFAULT NULL,
  `orderDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Order`
--

INSERT INTO `Order` (`OrderID`, `customerID`, `orderDate`, `status`) VALUES
(4, 5, '2025-08-19 09:35:35', 'confirmed'),
(5, 5, '2025-08-19 09:38:58', 'confirmed'),
(6, 5, '2025-08-19 10:12:00', 'confirmed'),
(7, 5, '2025-08-19 10:43:33', 'confirmed'),
(8, 5, '2025-08-19 10:45:00', 'confirmed'),
(9, 5, '2025-08-19 11:00:48', 'confirmed'),
(10, 5, '2025-08-19 11:02:04', 'confirmed'),
(11, 5, '2025-08-19 12:17:30', 'confirmed'),
(12, 5, '2025-08-19 13:41:59', 'confirmed'),
(13, 5, '2025-08-19 13:45:40', 'confirmed'),
(14, 5, '2025-08-19 13:57:25', 'confirmed'),
(15, 6, '2025-08-19 13:58:55', 'confirmed'),
(16, 6, '2025-08-19 14:03:31', 'confirmed'),
(17, 6, '2025-08-19 14:04:38', 'confirmed'),
(18, 6, '2025-08-19 14:07:41', 'confirmed'),
(19, 6, '2025-08-19 14:11:05', 'confirmed'),
(20, 6, '2025-08-19 14:12:56', 'confirmed'),
(21, 6, '2025-08-19 14:13:28', 'confirmed'),
(22, 6, '2025-08-19 14:14:05', 'confirmed'),
(23, 6, '2025-08-19 14:21:25', 'confirmed'),
(24, 6, '2025-08-19 14:30:56', 'confirmed'),
(25, 6, '2025-08-19 14:38:16', 'confirmed'),
(26, 8, '2025-08-22 05:53:29', 'confirmed'),
(27, 8, '2025-08-22 07:00:01', 'confirmed');

-- --------------------------------------------------------

--
-- Table structure for table `OrderItem`
--

CREATE TABLE `OrderItem` (
  `ID` int NOT NULL,
  `ProductID` int DEFAULT NULL,
  `Quantity` int DEFAULT NULL,
  `OrderID` int DEFAULT NULL,
  `unitPrice` double NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `OrderItem`
--

INSERT INTO `OrderItem` (`ID`, `ProductID`, `Quantity`, `OrderID`, `unitPrice`) VALUES
(1, 2, 1, 4, 42000),
(2, 2, 1, 5, 42000),
(3, 11, 1, 5, 36000),
(4, 12, 1, 5, 47000),
(5, 2, 1, 6, 42000),
(6, 11, 1, 6, 36000),
(7, 12, 2, 6, 47000),
(8, 12, 1, 7, 47000),
(9, 1, 1, 7, 35000),
(10, 7, 2, 8, 32000),
(11, 7, 1, 9, 32000),
(12, 7, 1, 10, 32000),
(13, 2, 1, 11, 42000),
(14, 10, 1, 11, 43000),
(15, 2, 1, 12, 42000),
(16, 13, 1, 12, 50000),
(17, 3, 1, 13, 35000),
(18, 11, 1, 13, 36000),
(19, 3, 1, 14, 35000),
(20, 2, 2, 15, 42000),
(21, 3, 1, 16, 35000),
(22, 15, 1, 17, 42000),
(23, 19, 1, 18, 46000),
(24, 19, 1, 19, 46000),
(25, 19, 1, 20, 46000),
(26, 14, 1, 21, 31000),
(27, 11, 1, 22, 36000),
(28, 16, 1, 23, 15000),
(29, 2, 1, 24, 42000),
(30, 3, 1, 24, 35000),
(31, 8, 2, 24, 51000),
(32, 5, 1, 25, 48000),
(33, 5, 2, 25, 48000),
(34, 10, 1, 25, 43000),
(35, 2, 2, 26, 42000),
(36, 6, 1, 27, 39000);

-- --------------------------------------------------------

--
-- Table structure for table `Payment`
--

CREATE TABLE `Payment` (
  `PaymentID` int NOT NULL,
  `OrderID` int DEFAULT NULL,
  `Amount` double DEFAULT NULL,
  `tranID` int NOT NULL,
  `PayDate` date DEFAULT NULL,
  `paymentMethod` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Payment`
--

INSERT INTO `Payment` (`PaymentID`, `OrderID`, `Amount`, `tranID`, `PayDate`, `paymentMethod`) VALUES
(3, 4, 47100, 345678, '2025-08-19', 'AyaPay'),
(4, 5, 131250, 579974, '2025-08-19', 'KBZ bank'),
(5, 6, 180600, 577555, '2025-08-19', 'KBZ bank'),
(6, 7, 86100, 688786, '2025-08-19', 'CB bank'),
(7, 8, 67200, 768787, '2025-08-19', 'KBZ bank'),
(8, 9, 36600, 878979, '2025-08-19', 'KPay'),
(9, 10, 36600, 435355, '2025-08-19', 'AyaPay'),
(10, 11, 89250, 234578, '2025-08-19', 'KBZ bank'),
(11, 12, 96600, 345676, '2025-08-19', 'KBZ bank'),
(12, 13, 74550, 624764, '2025-08-19', 'KBZ bank'),
(13, 14, 39750, 234566, '2025-08-19', 'AyaPay'),
(14, 15, 88200, 223455, '2025-08-19', 'AyaPay'),
(15, 16, 39750, 239000, '2025-08-19', 'KPay'),
(16, 17, 47100, 243255, '2025-08-19', 'CB bank'),
(17, 18, 51300, 234567, '2025-08-19', 'KBZ bank'),
(18, 19, 51300, 454355, '2025-08-19', 'KBZ bank'),
(19, 20, 51300, 436565, '2025-08-19', 'KBZ bank'),
(20, 21, 35550, 435678, '2025-08-19', 'KBZ bank'),
(21, 22, 40800, 235667, '2025-08-19', 'AyaPay'),
(22, 23, 18750, 435535, '2025-08-19', 'AyaPay'),
(23, 24, 187950, 454454, '2025-08-19', 'AyaPay'),
(24, 25, 196350, 375478, '2025-08-19', 'AyaPay'),
(25, 26, 88200, 234564, '2025-08-22', 'KPay'),
(26, 27, 43950, 989040, '2025-08-22', 'AyaPay');

-- --------------------------------------------------------

--
-- Table structure for table `Product`
--

CREATE TABLE `Product` (
  `ProductID` int NOT NULL,
  `Name` varchar(100) DEFAULT NULL,
  `Description` text,
  `Price` double DEFAULT NULL,
  `Stock` int DEFAULT NULL,
  `ForSkinType` varchar(50) DEFAULT NULL,
  `CategoryID` int DEFAULT NULL,
  `Image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Product`
--

INSERT INTO `Product` (`ProductID`, `Name`, `Description`, `Price`, `Stock`, `ForSkinType`, `CategoryID`, `Image`) VALUES
(1, 'Bella Face Wash', 'Morning & Night Use ', 35000, 15, 'Oily', 1, 'face-wash-1.jpg'),
(2, 'EAORON Toner', 'Night Use ', 42000, 0, 'Dry', 3, 'toner-1.jpg'),
(3, 'Nomi Face Wash', 'Night Use', 35000, 12, 'Oily', 1, 'face-wash-2.jpg'),
(4, 'Cica Toner', 'Night Use', 42000, 10, 'Dry', 3, 'toner-2.jpg'),
(5, 'Bella Moisturizer', 'Hydrating cream for daily use', 48000, 9, 'Combination', 2, 'cream-1.jpg\r\n'),
(6, 'Vaseline Sunscreen ', 'Protects against UVA/UVB rays , SPF 50', 39000, 17, 'Combination', 2, 'cream-2.jpg'),
(7, 'CeraVe Cleanser', 'Gentle daily cleanser for oily skin', 32000, 16, 'Oily', 1, 'face-wash-3.jpg'),
(8, 'JMsolution Night', 'Rejuvenating night repair cream', 51000, 6, 'Dry', 2, 'cream-3.jpg'),
(9, 'Dove Acne', 'Targeted spot treatment for acne', 29500, 14, 'Oily', 2, 'cream-4.jpg'),
(10, 'OLAY Eye Cream', 'Reduces puffiness and dark circles', 43000, 9, 'Combination', 2, 'cream-5.jpg'),
(11, 'Dove Scrub', 'Removes dead skin cells', 36000, 9, 'Combination', 4, 'mask-1.jpg'),
(12, 'Dr.Re Serum', 'Brightens and evens skin tone', 47000, 11, 'Combination', 6, 'serum-1.jpg'),
(13, 'Bella Mask', 'Deep hydration overnight mask', 50000, 8, 'Dry', 4, 'mask-2.jpg'),
(14, 'Bella Remover', 'Oil-free gentle cleansing water', 31000, 16, 'Combination', 5, 'makeup-1.jpg'),
(15, 'E`AORON Cream', 'Light coverage with SPF', 42000, 9, 'Combination', 5, 'makeup-2.jpg'),
(16, 'Vaseline Lip Balm', 'Moisturizes and repairs dry lips', 15000, 29, 'Combination', 5, 'makeup-3.jpg'),
(17, 'Nature Republic', 'Soothing and cooling gel, Mask for cool', 28000, 25, 'Sensitive', 4, 'mask-3.jpg'),
(18, 'JMsolution Clay', 'Detoxifying mask for deep cleaning', 38000, 7, 'Oily', 4, 'mask-4.jpg'),
(19, 'Garnier Cream', 'Brightens dull complexion', 46000, 3, 'Dry', 2, 'cream-6.jpg'),
(20, 'Ordinary Cleanser', 'Rich foaming action for clean skin', 34000, 13, 'Dry', 1, 'face-wash-4.jpg'),
(21, 'SK Retinol Serum', 'Anti-aging treatment', 54000, 5, 'Combination', 6, 'serum-2.jpg'),
(22, 'Misoco Toner', 'Balances oil and reduces pores, Green Tea', 39000, 9, 'Oily', 3, 'toner-3.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `Review`
--

CREATE TABLE `Review` (
  `ReviewID` int NOT NULL,
  `BeforeImg` varchar(255) DEFAULT NULL,
  `AfterImg` varchar(255) DEFAULT NULL,
  `Comment` text,
  `CID` int DEFAULT NULL,
  `Rating` int DEFAULT NULL,
  `productID` int DEFAULT NULL,
  `Date` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `Review`
--

INSERT INTO `Review` (`ReviewID`, `BeforeImg`, `AfterImg`, `Comment`, `CID`, `Rating`, `productID`, `Date`) VALUES
(10, 'can you create before image of using toner skincare product..jpg', 'can you create  image of face after using toner skincare product..jpg', 'This clay mask is a game-changer! It leaves my skin feeling incredibly clean, smooth, and refreshed. After just one use, my pores looked visibly smaller and my complexion felt more balanced. I love how it absorbs excess oil without drying out my skin. Definitely a must-have in any skincare routine!', 1, 4, 18, '2025-08-05 04:06:04'),
(11, NULL, NULL, 'Absolutely love this body scrub! The texture is just right—not too harsh, but still effective at removing dead skin. My skin feels so soft, smooth, and hydrated after every use. It also smells amazing, which makes my shower routine feel like a spa experience. Highly recommend for anyone looking to get that healthy, radiant glow!', 1, 3, 11, '2025-08-05 04:06:04'),
(12, NULL, NULL, 'it\'s greate', 1, 2, 2, '2025-08-05 04:06:04'),
(13, NULL, NULL, 'jo', 1, 1, 3, '2025-08-05 04:06:04'),
(14, NULL, NULL, 'amazing', 1, 2, 6, '2025-08-05 04:06:28'),
(15, NULL, NULL, 'No use in day', 5, 2, 2, '2025-08-06 11:03:35'),
(16, NULL, NULL, 'Good product', 5, 3, 12, '2025-08-08 03:22:08'),
(17, NULL, NULL, 'the best thing', 5, 4, 4, '2025-08-08 03:35:09'),
(18, NULL, NULL, 'Highly recommend for Morning use', 5, 3, 3, '2025-08-10 15:41:13'),
(19, NULL, NULL, 'My main skin concerns are dullness, uneven texture, and the occasional stubborn breakout. I was intrigued by this toner\'s promise of a brighter complexion, thanks to its active ingredients like Glycolic Acid (AHA).', 7, 3, 4, '2025-08-10 16:17:00'),
(20, NULL, NULL, 'I have combination skin that leans dry and can be quite sensitive, especially to new products or changing weather. I was looking for a toner that would add a layer of hydration without causing irritation, and this product delivered completely.', 7, 2, 22, '2025-08-10 16:29:06'),
(21, NULL, NULL, 'As someone with classic oily/combination skin, my main battle is a shiny T-zone by noon and enlarged pores around my nose. I\'ve tried many \"mattifying\" toners that just end up stripping my skin, leaving it tight and uncomfortable. This one is different.', 7, 5, 12, '2025-08-10 16:32:30');

-- --------------------------------------------------------

--
-- Table structure for table `WishList`
--

CREATE TABLE `WishList` (
  `wishlistID` int NOT NULL,
  `CustomerID` int DEFAULT NULL,
  `ProductID` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `WishList`
--

INSERT INTO `WishList` (`wishlistID`, `CustomerID`, `ProductID`) VALUES
(89, 1, 2),
(92, 1, 20),
(93, 1, 13),
(95, 1, 6),
(96, 1, 1),
(97, 1, 2),
(99, 1, 7),
(100, 5, 2),
(101, 5, 10),
(102, 5, 12),
(103, 5, 3),
(104, 7, 13),
(105, 7, 18),
(106, 6, 5),
(108, 6, 11),
(110, 8, 2),
(111, 8, 6);

-- --------------------------------------------------------

--
-- Table structure for table `WishListItem`
--

CREATE TABLE `WishListItem` (
  `WItemID` int NOT NULL,
  `wishlistID` int DEFAULT NULL,
  `productID` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Admin`
--
ALTER TABLE `Admin`
  ADD PRIMARY KEY (`AdminID`);

--
-- Indexes for table `BankPayment`
--
ALTER TABLE `BankPayment`
  ADD PRIMARY KEY (`PaymentID`);

--
-- Indexes for table `CashOnDeli`
--
ALTER TABLE `CashOnDeli`
  ADD PRIMARY KEY (`CalID`);

--
-- Indexes for table `Categories`
--
ALTER TABLE `Categories`
  ADD PRIMARY KEY (`CategoryID`),
  ADD UNIQUE KEY `CategoryName` (`CategoryName`);

--
-- Indexes for table `Customer`
--
ALTER TABLE `Customer`
  ADD PRIMARY KEY (`CID`),
  ADD UNIQUE KEY `CEmail` (`CEmail`);

--
-- Indexes for table `Kpay`
--
ALTER TABLE `Kpay`
  ADD PRIMARY KEY (`PaymentID`);

--
-- Indexes for table `Notification`
--
ALTER TABLE `Notification`
  ADD PRIMARY KEY (`NotiID`),
  ADD KEY `CustomerID` (`CustomerID`);

--
-- Indexes for table `Order`
--
ALTER TABLE `Order`
  ADD PRIMARY KEY (`OrderID`),
  ADD KEY `customerID` (`customerID`);

--
-- Indexes for table `OrderItem`
--
ALTER TABLE `OrderItem`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `ProductID` (`ProductID`),
  ADD KEY `OrderID` (`OrderID`);

--
-- Indexes for table `Payment`
--
ALTER TABLE `Payment`
  ADD PRIMARY KEY (`PaymentID`),
  ADD KEY `OrderID` (`OrderID`);

--
-- Indexes for table `Product`
--
ALTER TABLE `Product`
  ADD PRIMARY KEY (`ProductID`),
  ADD KEY `fk_category` (`CategoryID`);

--
-- Indexes for table `Review`
--
ALTER TABLE `Review`
  ADD PRIMARY KEY (`ReviewID`),
  ADD KEY `CID` (`CID`),
  ADD KEY `fk_review_product` (`productID`);

--
-- Indexes for table `WishList`
--
ALTER TABLE `WishList`
  ADD PRIMARY KEY (`wishlistID`),
  ADD KEY `CustomerID` (`CustomerID`),
  ADD KEY `fk_wishlist_product` (`ProductID`);

--
-- Indexes for table `WishListItem`
--
ALTER TABLE `WishListItem`
  ADD PRIMARY KEY (`WItemID`),
  ADD KEY `wishlistID` (`wishlistID`),
  ADD KEY `productID` (`productID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Admin`
--
ALTER TABLE `Admin`
  MODIFY `AdminID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `Categories`
--
ALTER TABLE `Categories`
  MODIFY `CategoryID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `Customer`
--
ALTER TABLE `Customer`
  MODIFY `CID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `Notification`
--
ALTER TABLE `Notification`
  MODIFY `NotiID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Order`
--
ALTER TABLE `Order`
  MODIFY `OrderID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `OrderItem`
--
ALTER TABLE `OrderItem`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `Payment`
--
ALTER TABLE `Payment`
  MODIFY `PaymentID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `Product`
--
ALTER TABLE `Product`
  MODIFY `ProductID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `Review`
--
ALTER TABLE `Review`
  MODIFY `ReviewID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `WishList`
--
ALTER TABLE `WishList`
  MODIFY `wishlistID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=113;

--
-- AUTO_INCREMENT for table `WishListItem`
--
ALTER TABLE `WishListItem`
  MODIFY `WItemID` int NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `BankPayment`
--
ALTER TABLE `BankPayment`
  ADD CONSTRAINT `BankPayment_ibfk_1` FOREIGN KEY (`PaymentID`) REFERENCES `Payment` (`PaymentID`);

--
-- Constraints for table `CashOnDeli`
--
ALTER TABLE `CashOnDeli`
  ADD CONSTRAINT `CashOnDeli_ibfk_1` FOREIGN KEY (`CalID`) REFERENCES `Payment` (`PaymentID`);

--
-- Constraints for table `Kpay`
--
ALTER TABLE `Kpay`
  ADD CONSTRAINT `Kpay_ibfk_1` FOREIGN KEY (`PaymentID`) REFERENCES `Payment` (`PaymentID`);

--
-- Constraints for table `Notification`
--
ALTER TABLE `Notification`
  ADD CONSTRAINT `Notification_ibfk_1` FOREIGN KEY (`CustomerID`) REFERENCES `Customer` (`CID`);

--
-- Constraints for table `Order`
--
ALTER TABLE `Order`
  ADD CONSTRAINT `Order_ibfk_1` FOREIGN KEY (`customerID`) REFERENCES `Customer` (`CID`);

--
-- Constraints for table `OrderItem`
--
ALTER TABLE `OrderItem`
  ADD CONSTRAINT `OrderItem_ibfk_1` FOREIGN KEY (`ProductID`) REFERENCES `Product` (`ProductID`),
  ADD CONSTRAINT `OrderItem_ibfk_2` FOREIGN KEY (`OrderID`) REFERENCES `Order` (`OrderID`);

--
-- Constraints for table `Payment`
--
ALTER TABLE `Payment`
  ADD CONSTRAINT `Payment_ibfk_1` FOREIGN KEY (`OrderID`) REFERENCES `Order` (`OrderID`);

--
-- Constraints for table `Product`
--
ALTER TABLE `Product`
  ADD CONSTRAINT `fk_category` FOREIGN KEY (`CategoryID`) REFERENCES `Categories` (`CategoryID`) ON DELETE SET NULL;

--
-- Constraints for table `Review`
--
ALTER TABLE `Review`
  ADD CONSTRAINT `fk_review_product` FOREIGN KEY (`productID`) REFERENCES `Product` (`ProductID`) ON DELETE CASCADE,
  ADD CONSTRAINT `Review_ibfk_1` FOREIGN KEY (`CID`) REFERENCES `Customer` (`CID`);

--
-- Constraints for table `WishList`
--
ALTER TABLE `WishList`
  ADD CONSTRAINT `fk_wishlist_product` FOREIGN KEY (`ProductID`) REFERENCES `Product` (`ProductID`) ON DELETE CASCADE,
  ADD CONSTRAINT `WishList_ibfk_1` FOREIGN KEY (`CustomerID`) REFERENCES `Customer` (`CID`);

--
-- Constraints for table `WishListItem`
--
ALTER TABLE `WishListItem`
  ADD CONSTRAINT `WishListItem_ibfk_1` FOREIGN KEY (`wishlistID`) REFERENCES `WishList` (`wishlistID`),
  ADD CONSTRAINT `WishListItem_ibfk_2` FOREIGN KEY (`productID`) REFERENCES `Product` (`ProductID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
