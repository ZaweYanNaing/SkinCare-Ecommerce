-- Migration script to add Status column to Customer table
-- This script adds customer account status tracking functionality

-- Add Status column to Customer table
ALTER TABLE `Customer` 
ADD COLUMN `Status` ENUM('active', 'warned', 'banned') NOT NULL DEFAULT 'active' 
AFTER `SkinType`;

-- Add index for better query performance on status filtering
ALTER TABLE `Customer` 
ADD INDEX `idx_customer_status` (`Status`);

-- Update existing customers to have 'active' status (already set by DEFAULT)
-- This is just for documentation - the DEFAULT clause handles this automatically

-- Optional: Add a comment to the Status column for documentation
ALTER TABLE `Customer` 
MODIFY COLUMN `Status` ENUM('active', 'warned', 'banned') NOT NULL DEFAULT 'active' 
COMMENT 'Customer account status: active=normal, warned=has warnings, banned=cannot order';

-- Verify the changes
DESCRIBE `Customer`;