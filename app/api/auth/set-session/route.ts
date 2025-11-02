import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * POST /api/auth/set-session
 * Sets the user session in httpOnly cookies
 */
export async function POST(request: NextRequest) {
  try {
    const { session } = await request.json();

    if (!session) {
      return NextResponse.json(
        { error: 'No session provided' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();

    // Set access token
    cookieStore.set('supabase-auth-token', session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: session.expires_in,
    });

    // Set refresh token
    if (session.refresh_token) {
      cookieStore.set('supabase-refresh-token', session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Set session error:', error);
    return NextResponse.json(
      { error: 'Failed to set session' },
      { status: 500 }
    );
  }
}
