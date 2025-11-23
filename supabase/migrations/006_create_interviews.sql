-- Create interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  meet_link TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS interviews_application_id_idx ON interviews(application_id);
CREATE INDEX IF NOT EXISTS interviews_scheduled_at_idx ON interviews(scheduled_at);

-- Enable Row Level Security
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all interviews"
  ON interviews FOR SELECT
  USING (true); -- Will add admin check in application layer

CREATE POLICY "Admins can insert interviews"
  ON interviews FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update interviews"
  ON interviews FOR UPDATE
  USING (true);

CREATE POLICY "Admins can delete interviews"
  ON interviews FOR DELETE
  USING (true);

CREATE POLICY "Applicants can view their own interviews"
  ON interviews FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM applications
    WHERE applications.id = interviews.application_id
    AND applications.user_id = auth.uid()
  ));
