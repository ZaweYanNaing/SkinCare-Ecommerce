-- Migration to update Admin table with proper role-based access control
-- This script updates the Admin Type column to use ENUM values and adds role descriptions

-- Update the Type column to use ENUM with specific roles
ALTER TABLE `Admin` 
MODIFY COLUMN `Type` ENUM('Super Admin', 'Manager', 'Staff', 'Expert') NOT NULL DEFAULT 'Staff'
COMMENT 'Admin role: Super Admin=full access, Manager=no admin creation, Staff=no account/product mgmt, Expert=specialized access';

-- Add a description column for role clarity (optional)
ALTER TABLE `Admin` 
ADD COLUMN `RoleDescription` TEXT NULL 
COMMENT 'Description of admin role and permissions'
AFTER `Type`;

-- Update existing admin to Super Admin if needed (adjust email as needed)
UPDATE `Admin` SET `Type` = 'Super Admin' WHERE `Email` = 'owner' OR `AdminID` = 1;

-- Add created_at and updated_at timestamps for better tracking
ALTER TABLE `Admin` 
ADD COLUMN `CreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN `UpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Verify the changes
DESCRIBE `Admin`;