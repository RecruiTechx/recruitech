# Document Screening Backend Setup

This document provides instructions for setting up the backend functionality for the document screening feature using Supabase.

## Database Setup

### 1. Run the SQL Migration

Execute the SQL migration file located at `supabase/migrations/001_create_applications.sql` in your Supabase SQL Editor.

This will create:
- `applications` table - Stores application records
- `personal_information` table - Stores applicant personal information
- `documents` table - Stores document URLs
- Storage bucket `application-documents` for file uploads
- Row Level Security (RLS) policies for data access control
- Indexes for optimized queries

### 2. Environment Variables

Ensure you have the following environment variables set in your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

⚠️ **Important**: The `SUPABASE_SERVICE_ROLE_KEY` should be kept secret and never exposed to the client. It's only used in server actions.

## Features

### Personal Information Form
- Saves form data to `personal_information` table
- Validates required fields
- Auto-saves application as draft
- Real-time error handling

### Document Upload
- Supports multiple file types:
  - CV: PDF (max 10 MB)
  - Motivation Letter: PDF (max 10 MB)
  - Follow Proof: PNG/JPG (max 10 MB)
  - Twibbon: PNG/JPG (max 10 MB)
- Files are uploaded to Supabase Storage
- URLs are stored in the `documents` table
- Progress indicators during upload

### Application Workflow

1. **Create Application**: When user accesses document screening page
2. **Save Personal Info**: When user clicks "Next" on personal information tab
3. **Upload Documents**: User uploads required documents
4. **Submit**: Updates application status to "submitted"

## API Functions

All server actions are located in `app/actions/application.ts`:

- `createApplication(userId, position)` - Creates new application
- `savePersonalInformation(applicationId, formData)` - Saves personal info
- `uploadFile(file, bucket, path)` - Uploads file to storage
- `saveDocuments(applicationId, documents)` - Saves document URLs
- `submitApplication(applicationId)` - Submits complete application
- `getApplication(applicationId)` - Retrieves application with related data
- `updateApplicationStatus(applicationId, status)` - Updates application status

## Security

### Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only view/edit their own applications
- Personal information is protected
- Documents are private by default
- Admin access requires service role key

### Storage Security

- Each user has their own folder in storage (`user_id/`)
- Users can only upload to their own folder
- Public URL generation is controlled
- File type and size validation on client and server

## Database Schema

### Applications Table
```sql
id: UUID (Primary Key)
user_id: UUID (Foreign Key to auth.users)
position: TEXT ('ui-ux' | 'software-engineer' | 'project-manager')
status: TEXT ('draft' | 'submitted' | 'document_screening' | 'interview' | 'accepted' | 'rejected')
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

### Personal Information Table
```sql
id: UUID (Primary Key)
application_id: UUID (Foreign Key to applications, UNIQUE)
full_name: TEXT
npm: TEXT
department: TEXT
major: TEXT
force: TEXT
email: TEXT
phone_number: TEXT
id_line: TEXT
other_contacts: TEXT
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

### Documents Table
```sql
id: UUID (Primary Key)
application_id: UUID (Foreign Key to applications, UNIQUE)
cv_url: TEXT
motivation_letter_url: TEXT
follow_proof_url: TEXT
twibbon_url: TEXT
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

## Usage

### Creating a new application

```typescript
const result = await createApplication(userId, "ui-ux")
if (result.success) {
  console.log("Application created:", result.data.id)
}
```

### Saving personal information

```typescript
const formData = {
  fullName: "John Doe",
  npm: "2306123456",
  department: "DTE",
  major: "Teknik Elektro",
  force: "2024",
  email: "john@example.com",
  phoneNumber: "08123456789",
  idLine: "johndoe",
  otherContacts: "08987654321 - Jane Doe - Sister"
}

const result = await savePersonalInformation(applicationId, formData)
```

### Uploading and submitting documents

```typescript
// Upload files
const cvResult = await uploadFile(cvFile, "application-documents", `${userId}/cv`)

// Save document URLs
await saveDocuments(applicationId, {
  cvUrl: cvResult.url,
  motivationLetterUrl: mlUrl,
  followProofUrl: fpUrl,
  twibbonUrl: tbUrl
})

// Submit application
await submitApplication(applicationId)
```

## Troubleshooting

### TypeScript Errors

The Database type definitions may show errors if tables don't exist yet. Run the migration first, then restart your development server.

### Upload Failures

- Check storage bucket exists
- Verify RLS policies are set
- Ensure file size is under 10 MB
- Check file type is allowed

### Permission Denied

- Verify user is authenticated
- Check RLS policies match your requirements
- Ensure service role key is set for server actions

## Next Steps

1. Run the SQL migration in Supabase
2. Set up environment variables
3. Test the application flow
4. Customize validation rules as needed
5. Add email notifications (optional)
6. Implement admin dashboard for reviewing applications
