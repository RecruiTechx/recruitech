-- Add unique constraint to ensure one application per user
-- This migration adds a constraint to prevent users from creating multiple applications

-- First, remove any duplicate applications (keep only the most recent one per user)
DELETE FROM applications a
USING (
  SELECT user_id, MAX(created_at) as max_created_at
  FROM applications
  GROUP BY user_id
  HAVING COUNT(*) > 1
) b
WHERE a.user_id = b.user_id 
AND a.created_at < b.max_created_at;

-- Add unique constraint on user_id
ALTER TABLE applications 
ADD CONSTRAINT applications_user_id_unique UNIQUE (user_id);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS applications_user_id_lookup_idx ON applications(user_id);
