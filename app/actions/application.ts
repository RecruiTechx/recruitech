"use server"

import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/types/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create a Supabase client with service role for server actions
const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey)

export interface PersonalInfoFormData {
  fullName: string
  npm: string
  department: string
  major: string
  force: string
  email: string
  phoneNumber: string
  idLine: string
  otherContacts: string
}

export interface DocumentUploadData {
  cvFile?: File | null
  motivationLetterFile?: File | null
  followProofFile?: File | null
  twibbonFile?: File | null
}

/**
 * Save personal information for an application
 */
export async function savePersonalInformation(
  applicationId: string,
  formData: PersonalInfoFormData
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('personal_information')
      .upsert({
        application_id: applicationId,
        full_name: formData.fullName,
        npm: formData.npm,
        department: formData.department,
        major: formData.major,
        force: formData.force,
        email: formData.email,
        phone_number: formData.phoneNumber,
        id_line: formData.idLine,
        other_contacts: formData.otherContacts,
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving personal information:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in savePersonalInformation:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Note: File uploads are handled via the /api/upload route
 * to avoid Next.js server action body size limits
 */

/**
 * Save document URLs for an application
 */
export async function saveDocuments(
  applicationId: string,
  documents: {
    cvUrl?: string
    motivationLetterUrl?: string
    followProofUrl?: string
    twibbonUrl?: string
  }
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('documents')
      .upsert({
        application_id: applicationId,
        cv_url: documents.cvUrl || null,
        motivation_letter_url: documents.motivationLetterUrl || null,
        follow_proof_url: documents.followProofUrl || null,
        twibbon_url: documents.twibbonUrl || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving documents:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in saveDocuments:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Create a new application
 */
export async function createApplication(userId: string, position: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('applications')
      .insert({
        user_id: userId,
        position,
        status: 'draft',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating application:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in createApplication:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Get application by ID
 */
export async function getApplication(applicationId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('applications')
      .select(`
        *,
        personal_information (*),
        documents (*)
      `)
      .eq('id', applicationId)
      .single()

    if (error) {
      console.error('Error getting application:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in getApplication:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Update application status
 */
export async function updateApplicationStatus(
  applicationId: string,
  status: Database['public']['Tables']['applications']['Row']['status']
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('applications')
      .update({ status })
      .eq('id', applicationId)
      .select()
      .single()

    if (error) {
      console.error('Error updating application status:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in updateApplicationStatus:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Submit complete application (personal info + documents)
 */
export async function submitApplication(applicationId: string) {
  try {
    // Update status to submitted
    const result = await updateApplicationStatus(applicationId, 'submitted')
    
    if (!result.success) {
      return result
    }

    return { success: true, message: 'Application submitted successfully' }
  } catch (error) {
    console.error('Error in submitApplication:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
