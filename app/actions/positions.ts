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

export interface Position {
  id: string
  name: string
  slug: string
  description: string
  total_quota: number
  filled_quota: number
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * Check if user is admin
 */
export async function checkIsAdmin(email: string) {
  try {
    console.log('[checkIsAdmin] Checking email:', email)

    const { data, error } = await getSupabaseAdmin()
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single()

    console.log('[checkIsAdmin] Query result:', { data, error })

    if (error) {
      console.log('[checkIsAdmin] Error occurred:', error.message)
      return { isAdmin: false }
    }

    const isAdmin = !!data
    console.log('[checkIsAdmin] Final result:', isAdmin)
    return { isAdmin }
  } catch (error) {
    console.log('[checkIsAdmin] Exception caught:', error)
    return { isAdmin: false }
  }
}

/**
 * Get all positions
 */
export async function getAllPositions() {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('positions')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching positions:', error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data as Position[] }
  } catch (error) {
    console.error('Error in getAllPositions:', error)
    return { success: false, error: 'An unexpected error occurred', data: [] }
  }
}

/**
 * Get active positions (for public view)
 */
export async function getActivePositions() {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('positions')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching active positions:', error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data as Position[] }
  } catch (error) {
    console.error('Error in getActivePositions:', error)
    return { success: false, error: 'An unexpected error occurred', data: [] }
  }
}

/**
 * Update position
 */
export async function updatePosition(
  id: string,
  updates: Partial<Omit<Position, 'id' | 'created_at' | 'updated_at'>>
) {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('positions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating position:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in updatePosition:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Create new position
 */
export async function createPosition(
  position: Omit<Position, 'id' | 'created_at' | 'updated_at'>
) {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('positions')
      .insert(position)
      .select()
      .single()

    if (error) {
      console.error('Error creating position:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in createPosition:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Delete position
 */
export async function deletePosition(id: string) {
  try {
    const { error } = await getSupabaseAdmin()
      .from('positions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting position:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in deletePosition:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
