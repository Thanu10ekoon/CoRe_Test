-- Photo Upload Feature - Database Migration
-- Run this SQL script to add photo_url column to complaints table

-- Add photo_url column to store image file paths
ALTER TABLE CoReMScomplaints 
ADD COLUMN photo_url VARCHAR(255) NULL 
COMMENT 'Relative path to uploaded photo file';

-- Verify the column was added
DESCRIBE CoReMScomplaints;

-- Optional: Add index for faster queries if needed
-- CREATE INDEX idx_photo_url ON CoReMScomplaints(photo_url);
