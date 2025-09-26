-- Add LastActivity column to experts table if it doesn't exist
-- Run this SQL command in your database (Bio column already exists)

ALTER TABLE experts 
ADD COLUMN IF NOT EXISTS LastActivity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Update existing experts to have a LastActivity timestamp
UPDATE experts 
SET LastActivity = NOW() 
WHERE LastActivity IS NULL;