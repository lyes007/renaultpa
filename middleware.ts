import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Handle auth-related routes with no caching
  if (request.nextUrl.pathname.startsWith('/api/auth') || 
      request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/profile') ||
      request.nextUrl.pathname.startsWith('/admin')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  }
  // Add compression headers for other API routes
  else if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Content-Encoding', 'gzip')
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300')
  }

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
