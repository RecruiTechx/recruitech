import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * POST /api/auth/sign-out
 * Clears the user session cookies
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    // Clear authentication cookies
    cookieStore.delete('supabase-auth-token');
    cookieStore.delete('supabase-refresh-token');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sign out error:', error);
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    );
  }
}
