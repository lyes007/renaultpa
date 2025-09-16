import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Get all cookies
    const cookies = request.cookies.getAll()
    
    // Look for NextAuth cookies
    const nextAuthCookies = cookies.filter(cookie => 
      cookie.name.startsWith('next-auth') || 
      cookie.name.startsWith('__Secure-next-auth') ||
      cookie.name.startsWith('__Host-next-auth')
    )
    
    return NextResponse.json({
      session: session ? {
        user: session.user,
        expires: session.expires
      } : null,
      cookies: {
        all: cookies.map(c => ({ name: c.name, value: c.value.substring(0, 50) + '...' })),
        nextAuth: nextAuthCookies.map(c => ({ name: c.name, value: c.value.substring(0, 50) + '...' }))
      },
      headers: {
        userAgent: request.headers.get('user-agent'),
        host: request.headers.get('host'),
        origin: request.headers.get('origin'),
        referer: request.headers.get('referer')
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check cookies',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
