import { type NextRequest, NextResponse } from 'next/server';

/**
 * Middleware for handling authentication and route protection
 * Simplified to just pass through - dashboard will handle auth checks
 */
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/open/:path*',
    '/test/:path*',
  ],
};
