export interface Application {
  id: string
  user_id: string
  position: string
  status: 'draft' | 'submitted' | 'document_screening' | 'interview' | 'accepted' | 'rejected'
  created_at: string
  updated_at: string
}

export interface PersonalInformation {
  id: string
  application_id: string
  full_name: string
  npm: string
  department: string
  major: string
  force: string
  email: string
  phone_number: string
  id_line: string
  other_contacts: string
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  application_id: string
  cv_url: string | null
  motivation_letter_url: string | null
  follow_proof_url: string | null
  twibbon_url: string | null
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      applications: {
        Row: Application
        Insert: Omit<Application, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Application, 'id' | 'created_at' | 'updated_at'>>
      }
      personal_information: {
        Row: PersonalInformation
        Insert: Omit<PersonalInformation, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<PersonalInformation, 'id' | 'created_at' | 'updated_at'>>
      }
      documents: {
        Row: Document
        Insert: Omit<Document, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Document, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}
