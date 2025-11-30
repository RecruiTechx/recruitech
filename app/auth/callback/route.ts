import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { checkIsAdmin } from '@/app/actions/positions'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  console.log('[CALLBACK] Auth callback triggered')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data } = await supabase.auth.exchangeCodeForSession(code)
    
    console.log('[CALLBACK] User authenticated:', data.user?.email)
    
    // Check if user is admin and redirect accordingly
    if (data.user?.email) {
      console.log('[CALLBACK] Checking admin status for:', data.user.email)
      const adminCheck = await checkIsAdmin(data.user.email)
      console.log('[CALLBACK] Admin check result:', adminCheck)
      
      if (adminCheck.isAdmin) {
        console.log('[CALLBACK] User is admin, redirecting to /admin')
        return NextResponse.redirect(`${origin}/admin`)
      }
    }
  }

  // Redirect to dashboard after successful authentication
  console.log('[CALLBACK] Redirecting to /dashboard')
  return NextResponse.redirect(`${origin}/dashboard`)
}
