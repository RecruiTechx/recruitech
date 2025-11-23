-- SQL Script to Reset All Applications
-- WARNING: This will permanently delete all application data!
-- Run this in Supabase SQL Editor

-- Delete all applications (this will cascade delete personal_information and documents)
TRUNCATE TABLE applications CASCADE;

-- Optional: Reset the positions filled_quota back to 0
UPDATE positions SET filled_quota = 0;

-- Verify deletion
SELECT 
  (SELECT COUNT(*) FROM applications) as applications_count,
  (SELECT COUNT(*) FROM personal_information) as personal_info_count,
  (SELECT COUNT(*) FROM documents) as documents_count,
  (SELECT SUM(filled_quota) FROM positions) as total_filled_quota;
