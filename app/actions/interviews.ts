"use server"

import { createClient } from '@supabase/supabase-js'
import { sendInterviewEmail } from '@/lib/email'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function scheduleInterview(applicationId: string, scheduledAt: Date, meetLink: string) {
    try {
        // 1. Create interview record
        const { data: interview, error: interviewError } = await supabaseAdmin
            .from('interviews')
            .insert({
                application_id: applicationId,
                scheduled_at: scheduledAt.toISOString(),
                meet_link: meetLink,
                status: 'scheduled'
            })
            .select()
            .single()

        if (interviewError) {
            console.error('Error creating interview:', interviewError)
            return { success: false, error: interviewError.message }
        }

        // 2. Update application status to 'interview'
        const { error: appError } = await supabaseAdmin
            .from('applications')
            .update({ status: 'interview' })
            .eq('id', applicationId)

        if (appError) {
            console.error('Error updating application status:', appError)
            return { success: false, error: appError.message }
        }

        // 3. Fetch user details for email
        const { data: application, error: fetchError } = await supabaseAdmin
            .from('applications')
            .select(`
                personal_information!fk_personal_information_application(
                    email,
                    full_name
                )
            `)
            .eq('id', applicationId)
            .single()

        if (fetchError) {
            console.error('Error fetching application details:', fetchError)
            return { success: false, error: fetchError.message }
        }

        const email = application?.personal_information?.email
        const name = application?.personal_information?.full_name

        if (email && name) {
            // 4. Send email
            await sendInterviewEmail(email, name, scheduledAt, meetLink)
        }

        return { success: true, data: interview }
    } catch (error) {
        console.error('Error in scheduleInterview:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}

export async function getInterviewsByApplication(applicationId: string) {
    try {
        const { data, error } = await supabaseAdmin
            .from('interviews')
            .select('*')
            .eq('application_id', applicationId)
            .order('scheduled_at', { ascending: false })

        if (error) {
            console.error('Error fetching interviews:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data }
    } catch (error) {
        console.error('Error in getInterviewsByApplication:', error)
        return { success: false, error: 'An unexpected error occurred' }
    }
}
