-- Add missing columns to Notification table
ALTER TABLE Notification ADD COLUMN Title VARCHAR(255) DEFAULT NULL;
ALTER TABLE Notification ADD COLUMN Type VARCHAR(50) DEFAULT 'general';
ALTER TABLE Notification MODIFY COLUMN DateSent DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Insert some sample notifications for testing
INSERT INTO Notification (CustomerID, Title, Message, Type, DateSent, isRead) VALUES
(NULL, 'Low Stock Alert', 'EAORON Toner is running low in stock (0 items remaining).', 'alert', NOW(), 0),
(NULL, 'System Test', 'This is a test notification to verify the system is working.', 'general', NOW(), 0);