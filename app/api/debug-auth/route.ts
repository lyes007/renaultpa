import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // Only allow in development or with debug query param
  const url = new URL(request.url)
  const debug = url.searchParams.get('debug')
  
  if (process.env.NODE_ENV === 'production' && !debug) {
    return NextResponse.json({ error: 'Debug endpoint disabled in production' }, { status: 403 })
  }

  const authConfig = {
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    nodeEnv: process.env.NODE_ENV,
    // Don't expose actual secrets, just check if they exist
    googleClientIdPrefix: process.env.GOOGLE_CLIENT_ID?.substring(0, 10) + '...',
  }

  return NextResponse.json({
    message: 'Authentication configuration check',
    config: authConfig,
    recommendations: [
      !authConfig.hasGoogleClientId && 'Missing GOOGLE_CLIENT_ID environment variable',
      !authConfig.hasGoogleClientSecret && 'Missing GOOGLE_CLIENT_SECRET environment variable', 
      !authConfig.hasNextAuthSecret && 'Missing NEXTAUTH_SECRET environment variable',
      !authConfig.hasNextAuthUrl && 'Missing NEXTAUTH_URL environment variable',
      !authConfig.hasDatabaseUrl && 'Missing DATABASE_URL environment variable',
    ].filter(Boolean)
  })
}
