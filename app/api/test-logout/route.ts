import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    return NextResponse.json({
      hasSession: !!session,
      sessionData: session ? {
        user: session.user,
        expires: session.expires
      } : null,
      authConfig: {
        strategy: authOptions.session?.strategy,
        adapter: !!authOptions.adapter,
        providers: authOptions.providers?.map(p => p.id || p.name)
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
