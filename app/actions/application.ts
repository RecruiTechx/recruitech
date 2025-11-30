"use server"

import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/types/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create a Supabase client with service role for server actions
function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables')
    throw new Error('Missing Supabase environment variables')
  }
  return createClient<Database>(supabaseUrl, supabaseServiceKey)
}

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
    const { data, error } = await getSupabaseAdmin()
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
    const { data, error } = await getSupabaseAdmin()
      .from('documents')
      .upsert({
        application_id: applicationId,
        cv_url: documents.cvUrl || null,
        motivation_letter_url: documents.motivationLetterUrl || null,
        follow_proof_url: documents.followProofUrl || null,
        twibbon_url: documents.twibbonUrl || null,
      }, {
        onConflict: 'application_id'
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
    const { data, error } = await getSupabaseAdmin()
      .from('applications')
      .insert({
        user_id: userId,
        position,
        status: 'draft',
      })
      .select()
    if (fetchError) {
      console.error('Error fetching existing application after duplicate error:', fetchError)
      return { success: false, error: fetchError.message }
    }

    return { success: true, data: existingApp }
  }

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
    const { data, error } = await getSupabaseAdmin()
      .from('applications')
      .select(`
        *,
        personal_information!fk_personal_information_application(*),
        documents!fk_documents_application(*)
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
 * Get user's application (for authenticated users)
 */
export async function getUserApplication(userId: string) {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('applications')
      .select(`
        *,
        personal_information!fk_personal_information_application(*),
        documents!fk_documents_application(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - user has no application
        return { success: true, data: null }
      }
      console.error('Error getting user application:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in getUserApplication:', error)
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
    const { data, error } = await getSupabaseAdmin()
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

/**
 * Get all applications with related data (ADMIN ONLY)
 * 
 * @returns All applications with personal info and documents
 */
export async function getAllApplications() {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('applications')
      .select(`
        *,
        personal_information!fk_personal_information_application(*),
        documents!fk_documents_application(*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching all applications:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in getAllApplications:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Get applications by status (ADMIN ONLY)
 */
export async function getApplicationsByStatus(status: string) {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('applications')
      .select(`
        *,
        personal_information!fk_personal_information_application(*),
        documents!fk_documents_application(*)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching applications by status:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in getApplicationsByStatus:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Get applications by position (ADMIN ONLY)
 */
export async function getApplicationsByPosition(position: string) {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('applications')
      .select(`
        *,
        personal_information!fk_personal_information_application(*),
        documents!fk_documents_application(*)
      `)
      .eq('position', position)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching applications by position:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in getApplicationsByPosition:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Search applications by name or NPM (ADMIN ONLY)
 */
export async function searchApplications(query: string) {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('applications')
      .select(`
        *,
        personal_information!fk_personal_information_application(*),
        documents!fk_documents_application(*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error searching applications:', error)
      return { success: false, error: error.message }
    }

    // Filter on client side for name/npm search
    const filtered = data?.filter(app => {
      const personalInfo = app.personal_information
      if (!personalInfo) return false

      const searchLower = query.toLowerCase()
      return (
        personalInfo.full_name?.toLowerCase().includes(searchLower) ||
        personalInfo.npm?.toLowerCase().includes(searchLower)
      )
    })

    return { success: true, data: filtered }
  } catch (error) {
    console.error('Error in searchApplications:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Bulk update application statuses (ADMIN ONLY)
 */
export async function bulkUpdateApplicationStatus(
  applicationIds: string[],
  status: Database['public']['Tables']['applications']['Row']['status']
) {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('applications')
      .update({ status })
      .in('id', applicationIds)
      .select()

    if (error) {
      console.error('Error bulk updating application status:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in bulkUpdateApplicationStatus:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Delete an application (ADMIN ONLY)
 */
export async function deleteApplication(applicationId: string) {
  try {
    // Explicitly delete related records first to handle cases where cascade delete is not set up

    // 1. Delete documents
    const { error: docError } = await getSupabaseAdmin()
      .from('documents')
      .delete()
      .eq('application_id', applicationId)

    if (docError) {
      console.error('Error deleting related documents:', docError)
      // Continue anyway, as they might not exist or might be handled by cascade
    }

    // 2. Delete personal information
    const { error: infoError } = await getSupabaseAdmin()
      .from('personal_information')
      .delete()
      .eq('application_id', applicationId)

    if (infoError) {
      console.error('Error deleting related personal information:', infoError)
      // Continue anyway
    }

    // 3. Delete interviews
    const { error: interviewError } = await getSupabaseAdmin()
      .from('interviews')
      .delete()
      .eq('application_id', applicationId)

    if (interviewError) {
      console.error('Error deleting related interviews:', interviewError)
      // Continue anyway
    }

    // 4. Delete test attempts
    const { error: testError } = await getSupabaseAdmin()
      .from('test_attempts')
      .delete()
      .eq('application_id', applicationId)

    if (testError) {
      console.error('Error deleting related test attempts:', testError)
      // Continue anyway
    }

    // 5. Delete application
    const { error } = await getSupabaseAdmin()
      .from('applications')
      .delete()
      .eq('id', applicationId)

    if (error) {
      console.error('Error deleting application:', error)
      return { success: false, error: error.message }
    }

    return { success: true, message: 'Application deleted successfully' }
  } catch (error) {
    console.error('Error in deleteApplication:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Bulk delete applications (ADMIN ONLY)
 */
export async function bulkDeleteApplications(applicationIds: string[]) {
  try {
    // Explicitly delete related records first

    // 1. Delete documents
    const { error: docError } = await getSupabaseAdmin()
      .from('documents')
      .delete()
      .in('application_id', applicationIds)

    if (docError) {
      console.error('Error bulk deleting related documents:', docError)
    }

    // 2. Delete personal information
    const { error: infoError } = await getSupabaseAdmin()
      .from('personal_information')
      .delete()
      .in('application_id', applicationIds)

    if (infoError) {
      console.error('Error bulk deleting related personal information:', infoError)
    }

    // 3. Delete interviews
    const { error: interviewError } = await getSupabaseAdmin()
      .from('interviews')
      .delete()
      .in('application_id', applicationIds)

    if (interviewError) {
      console.error('Error bulk deleting related interviews:', interviewError)
    }

    // 4. Delete test attempts
    const { error: testError } = await getSupabaseAdmin()
      .from('test_attempts')
      .delete()
      .in('application_id', applicationIds)

    if (testError) {
      console.error('Error bulk deleting related test attempts:', testError)
    }

    // 5. Delete applications
    const { error } = await getSupabaseAdmin()
      .from('applications')
      .delete()
      .in('id', applicationIds)

    if (error) {
      console.error('Error bulk deleting applications:', error)
      return { success: false, error: error.message }
    }

    return { success: true, message: `${applicationIds.length} applications deleted successfully` }
  } catch (error) {
    console.error('Error in bulkDeleteApplications:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
