-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  position TEXT NOT NULL CHECK (position IN ('ui-ux', 'software-engineer', 'project-manager')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'document_screening', 'interview', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create personal_information table
CREATE TABLE IF NOT EXISTS personal_information (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT NOT NULL,
  npm TEXT NOT NULL,
  department TEXT NOT NULL,
  major TEXT NOT NULL,
  force TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  id_line TEXT NOT NULL,
  other_contacts TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE UNIQUE,
  cv_url TEXT,
  motivation_letter_url TEXT,
  follow_proof_url TEXT,
  twibbon_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS applications_user_id_idx ON applications(user_id);
CREATE INDEX IF NOT EXISTS applications_status_idx ON applications(status);
CREATE INDEX IF NOT EXISTS personal_information_application_id_idx ON personal_information(application_id);
CREATE INDEX IF NOT EXISTS documents_application_id_idx ON documents(application_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personal_information_updated_at
  BEFORE UPDATE ON personal_information
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for applications
CREATE POLICY "Users can view their own applications"
  ON applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own applications"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications"
  ON applications FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for personal_information
CREATE POLICY "Users can view their own personal information"
  ON personal_information FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM applications
    WHERE applications.id = personal_information.application_id
    AND applications.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own personal information"
  ON personal_information FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM applications
    WHERE applications.id = personal_information.application_id
    AND applications.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own personal information"
  ON personal_information FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM applications
    WHERE applications.id = personal_information.application_id
    AND applications.user_id = auth.uid()
  ));

-- RLS Policies for documents
CREATE POLICY "Users can view their own documents"
  ON documents FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM applications
    WHERE applications.id = documents.application_id
    AND applications.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own documents"
  ON documents FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM applications
    WHERE applications.id = documents.application_id
    AND applications.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own documents"
  ON documents FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM applications
    WHERE applications.id = documents.application_id
    AND applications.user_id = auth.uid()
  ));

-- Create storage bucket for application documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('application-documents', 'application-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload their own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'application-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'application-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Public can view application documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'application-documents');
