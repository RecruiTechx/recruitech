"use server"

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables')
    throw new Error('Missing Supabase environment variables')
  }
  return createClient(supabaseUrl, supabaseServiceKey)
}

export interface DashboardStats {
  totalApplications: number
  applicationsByStatus: {
    draft: number
    submitted: number
    document_screening: number
    interview: number
    accepted: number
    rejected: number
  }
  applicationsByPosition: {
    position: string
    count: number
    quota: number
  }[]
  recentApplications: number // Last 7 days
  acceptanceRate: number
}

export interface PositionStats {
  id: string
  name: string
  slug: string
  totalQuota: number
  filledQuota: number
  applicationCount: number
  submittedCount: number
  acceptedCount: number
  rejectedCount: number
}

/**
 * Get comprehensive dashboard statistics for admin overview
 * 
 * @returns Dashboard statistics including total applications, breakdown by status and position
 */
export async function getDashboardStats(): Promise<{ success: boolean; data?: DashboardStats; error?: string }> {
  try {
    // Get total applications count
    const { count: totalApplications, error: countError } = await getSupabaseAdmin()
      .from('applications')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Error fetching total applications:', countError)
      return { success: false, error: countError.message }
    }

    // Get applications by status
    const { data: statusData, error: statusError } = await getSupabaseAdmin()
      .from('applications')
      .select('status')

    if (statusError) {
      console.error('Error fetching applications by status:', statusError)
      return { success: false, error: statusError.message }
    }

    const applicationsByStatus = {
      draft: statusData?.filter(app => app.status === 'draft').length || 0,
      submitted: statusData?.filter(app => app.status === 'submitted').length || 0,
      document_screening: statusData?.filter(app => app.status === 'document_screening').length || 0,
      interview: statusData?.filter(app => app.status === 'interview').length || 0,
      accepted: statusData?.filter(app => app.status === 'accepted').length || 0,
      rejected: statusData?.filter(app => app.status === 'rejected').length || 0,
    }

    // Get applications by position
    const { data: positionData, error: positionError } = await getSupabaseAdmin()
      .from('applications')
      .select('position')

    if (positionError) {
      console.error('Error fetching applications by position:', positionError)
      return { success: false, error: positionError.message }
    }

    // Get all positions to match with quotas
    const { data: positions, error: positionsError } = await getSupabaseAdmin()
      .from('positions')
      .select('slug, name, total_quota')

    if (positionsError) {
      console.error('Error fetching positions:', positionsError)
      return { success: false, error: positionsError.message }
    }

    const applicationsByPosition = positions?.map(pos => ({
      position: pos.name,
      count: positionData?.filter(app => app.position === pos.slug).length || 0,
      quota: pos.total_quota,
    })) || []

    // Get recent applications (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { count: recentApplications, error: recentError } = await getSupabaseAdmin()
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString())

    if (recentError) {
      console.error('Error fetching recent applications:', recentError)
    }

    // Calculate acceptance rate
    const totalProcessed = applicationsByStatus.accepted + applicationsByStatus.rejected
    const acceptanceRate = totalProcessed > 0
      ? (applicationsByStatus.accepted / totalProcessed) * 100
      : 0

    return {
      success: true,
      data: {
        totalApplications: totalApplications || 0,
        applicationsByStatus,
        applicationsByPosition,
        recentApplications: recentApplications || 0,
        acceptanceRate: Math.round(acceptanceRate * 10) / 10, // Round to 1 decimal
      },
    }
  } catch (error) {
    console.error('Error in getDashboardStats:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Get detailed statistics for each position
 * 
 * @returns Array of position statistics with application counts
 */
export async function getPositionStats(): Promise<{ success: boolean; data?: PositionStats[]; error?: string }> {
  try {
    // Get all positions
    const { data: positions, error: positionsError } = await getSupabaseAdmin()
      .from('positions')
      .select('*')
      .order('name', { ascending: true })

    if (positionsError) {
      console.error('Error fetching positions:', positionsError)
      return { success: false, error: positionsError.message }
    }

    // Get all applications
    const { data: applications, error: appsError } = await getSupabaseAdmin()
      .from('applications')
      .select('position, status')

    if (appsError) {
      console.error('Error fetching applications:', appsError)
      return { success: false, error: appsError.message }
    }

    const positionStats: PositionStats[] = positions?.map(pos => {
      const posApps = applications?.filter(app => app.position === pos.slug) || []

      return {
        id: pos.id,
        name: pos.name,
        slug: pos.slug,
        totalQuota: pos.total_quota,
        filledQuota: pos.filled_quota,
        applicationCount: posApps.length,
        submittedCount: posApps.filter(app => app.status === 'submitted').length,
        acceptedCount: posApps.filter(app => app.status === 'accepted').length,
        rejectedCount: posApps.filter(app => app.status === 'rejected').length,
      }
    }) || []

    return { success: true, data: positionStats }
  } catch (error) {
    console.error('Error in getPositionStats:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Get recent activity timeline
 * 
 * @param limit Number of recent activities to fetch
 * @returns Recent application updates
 */
export async function getRecentActivity(limit: number = 10) {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('applications')
      .select(`
        id,
        status,
        position,
        created_at,
        updated_at,
        personal_information (
          full_name,
          email
        )
      `)
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching recent activity:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in getRecentActivity:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
