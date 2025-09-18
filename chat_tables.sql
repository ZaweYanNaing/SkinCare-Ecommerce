-- Chat system tables for skincare consultation

-- Experts table
CREATE TABLE `Expert` (
  `ExpertID` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) NOT NULL,
  `Email` varchar(100) NOT NULL UNIQUE,
  `Password` varchar(100) NOT NULL,
  `Specialization` varchar(100) DEFAULT NULL,
  `Bio` text,
  `Avatar` varchar(255) DEFAULT NULL,
  `Status` enum('active', 'offline', 'busy') DEFAULT 'offline',
  `CreatedAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ExpertID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Chat conversations table
CREATE TABLE `Conversation` (
  `ConversationID` int NOT NULL AUTO_INCREMENT,
  `CustomerID` int NOT NULL,
  `ExpertID` int DEFAULT NULL,
  `Status` enum('waiting', 'active', 'closed') DEFAULT 'waiting',
  `CreatedAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ConversationID`),
  KEY `CustomerID` (`CustomerID`),
  KEY `ExpertID` (`ExpertID`),
  CONSTRAINT `fk_conversation_customer` FOREIGN KEY (`CustomerID`) REFERENCES `Customer` (`CID`) ON DELETE CASCADE,
  CONSTRAINT `fk_conversation_expert` FOREIGN KEY (`ExpertID`) REFERENCES `Expert` (`ExpertID`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Messages table
CREATE TABLE `Message` (
  `MessageID` int NOT NULL AUTO_INCREMENT,
  `ConversationID` int NOT NULL,
  `SenderType` enum('customer', 'expert') NOT NULL,
  `SenderID` int NOT NULL,
  `MessageText` text NOT NULL,
  `MessageType` enum('text', 'image') DEFAULT 'text',
  `ImagePath` varchar(255) DEFAULT NULL,
  `IsRead` tinyint(1) DEFAULT 0,
  `SentAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`MessageID`),
  KEY `ConversationID` (`ConversationID`),
  CONSTRAINT `fk_message_conversation` FOREIGN KEY (`ConversationID`) REFERENCES `Conversation` (`ConversationID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert sample experts
INSERT INTO `Expert` (`Name`, `Email`, `Password`, `Specialization`, `Bio`, `Status`) VALUES
('Dr. Sarah Johnson', 'sarah@skincare.com', '$2y$12$dhS2R9PU86EAX3IXRup7EOmJrbagq4u4hIglRylSYUlfM76O8ag7a', 'Acne & Oily Skin', 'Dermatologist with 10+ years experience in treating acne and oily skin conditions.', 'active'),
('Dr. Emily Chen', 'emily@skincare.com', '$2y$12$dhS2R9PU86EAX3IXRup7EOmJrbagq4u4hIglRylSYUlfM76O8ag7a', 'Anti-Aging & Dry Skin', 'Skincare specialist focusing on anti-aging treatments and dry skin care.', 'active'),
('Dr. Michael Kim', 'michael@skincare.com', '$2y$12$dhS2R9PU86EAX3IXRup7EOmJrbagq4u4hIglRylSYUlfM76O8ag7a', 'Sensitive Skin', 'Expert in treating sensitive skin conditions and allergic reactions.', 'offline');