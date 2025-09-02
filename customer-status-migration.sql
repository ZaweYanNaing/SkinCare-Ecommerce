-- Customer Status Migration
-- Run these SQL commands in your database to add customer status functionality

-- 1. Add Status column to Customer table
ALTER TABLE `Customer` 
ADD COLUMN `Status` ENUM('active', 'warned', 'banned') NOT NULL DEFAULT 'active' 
AFTER `SkinType`;

-- 2. Add index for better query performance
ALTER TABLE `Customer` 
ADD INDEX `idx_customer_status` (`Status`);

-- 3. Add comment for documentation
ALTER TABLE `Customer` 
MODIFY COLUMN `Status` ENUM('active', 'warned', 'banned') NOT NULL DEFAULT 'active' 
COMMENT 'Customer account status: active=normal, warned=has warnings, banned=cannot order';

-- 4. Verify the changes (optional)
DESCRIBE `Customer`;

-- 5. Check current customer data (optional)
SELECT CID, CName, CEmail, Status FROM Customer LIMIT 5;