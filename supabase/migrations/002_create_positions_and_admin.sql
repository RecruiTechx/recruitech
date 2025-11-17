-- Create positions table for admin management
CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  total_quota INTEGER NOT NULL DEFAULT 14,
  filled_quota INTEGER NOT NULL DEFAULT 2,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default positions
INSERT INTO positions (name, slug, description, total_quota, filled_quota, is_active) VALUES
  ('UI/UX Designer', 'ui-ux', 'Be a part of the team that designs intuitive, user-centered interfaces which enhance digital experience. Collaborate with cross-functional teams to translate ideas into meaningful visuals and smooth user journeys across platforms.', 14, 2, true),
  ('Software Engineer', 'software-engineer', 'Be a part of the team that designs intuitive, user-centered interfaces which enhance digital experience. Collaborate with cross-functional teams to translate ideas into meaningful visuals and smooth user journeys across platforms.', 14, 2, true),
  ('Project Manager', 'project-manager', 'Be a part of the team that designs intuitive, user-centered interfaces which enhance digital experience. Collaborate with cross-functional teams to translate ideas into meaningful visuals and smooth user journeys across platforms.', 14, 2, true)
ON CONFLICT (slug) DO NOTHING;

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert admin user
INSERT INTO admin_users (email) VALUES ('ryanadi0100@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS positions_slug_idx ON positions(slug);
CREATE INDEX IF NOT EXISTS positions_is_active_idx ON positions(is_active);
CREATE INDEX IF NOT EXISTS admin_users_email_idx ON admin_users(email);

-- Create updated_at trigger for positions
CREATE TRIGGER update_positions_updated_at
  BEFORE UPDATE ON positions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for positions (public read, admin write)
CREATE POLICY "Anyone can view active positions"
  ON positions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all positions"
  ON positions FOR SELECT
  USING (
    auth.uid() IN (SELECT user_id FROM admin_users WHERE user_id IS NOT NULL)
  );

CREATE POLICY "Admins can insert positions"
  ON positions FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM admin_users WHERE user_id IS NOT NULL)
  );

CREATE POLICY "Admins can update positions"
  ON positions FOR UPDATE
  USING (
    auth.uid() IN (SELECT user_id FROM admin_users WHERE user_id IS NOT NULL)
  );

CREATE POLICY "Admins can delete positions"
  ON positions FOR DELETE
  USING (
    auth.uid() IN (SELECT user_id FROM admin_users WHERE user_id IS NOT NULL)
  );

-- RLS Policies for admin_users
CREATE POLICY "Admins can view admin_users"
  ON admin_users FOR SELECT
  USING (
    auth.uid() IN (SELECT user_id FROM admin_users WHERE user_id IS NOT NULL)
  );

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE email = user_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update filled quota when application is submitted
CREATE OR REPLACE FUNCTION increment_position_quota()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'submitted' AND OLD.status != 'submitted' THEN
    UPDATE positions
    SET filled_quota = filled_quota + 1
    WHERE slug = NEW.position;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update quota
CREATE TRIGGER update_position_quota_on_submission
  AFTER UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION increment_position_quota();
