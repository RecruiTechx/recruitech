-- Create test_attempts table to track applicant test submissions
CREATE TABLE IF NOT EXISTS test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answers JSONB NOT NULL, -- Store all answers as {"question_id": "answer"}
  score INTEGER NOT NULL, -- Points earned
  total_points INTEGER NOT NULL, -- Total possible points
  percentage INTEGER NOT NULL, -- Score percentage
  passed BOOLEAN NOT NULL, -- Whether the applicant passed
  time_taken_seconds INTEGER, -- Time spent on test
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS test_attempts_test_id_idx ON test_attempts(test_id);
CREATE INDEX IF NOT EXISTS test_attempts_application_id_idx ON test_attempts(application_id);
CREATE INDEX IF NOT EXISTS test_attempts_user_id_idx ON test_attempts(user_id);

-- Enable Row Level Security
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own test attempts"
  ON test_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own test attempts"
  ON test_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all test attempts"
  ON test_attempts FOR SELECT
  USING (true); -- Will add admin check in application layer

-- Prevent multiple attempts for same test
CREATE UNIQUE INDEX test_attempts_unique_idx ON test_attempts(test_id, application_id);
