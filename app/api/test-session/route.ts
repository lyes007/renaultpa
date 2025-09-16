import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check database connection
    let dbStatus = "unknown"
    try {
      await prisma.$queryRaw`SELECT 1`
      dbStatus = "connected"
    } catch (error) {
      dbStatus = "error: " + (error instanceof Error ? error.message : 'Unknown error')
    }
    
    // Check if there are any sessions in the database
    let sessionCount = 0
    try {
      const sessions = await prisma.session.findMany()
      sessionCount = sessions.length
    } catch (error) {
      console.error("Error fetching sessions:", error)
    }
    
    return NextResponse.json({
      hasSession: !!session,
      sessionData: session ? {
        user: session.user,
        expires: session.expires
      } : null,
      database: {
        status: dbStatus,
        sessionCount
      },
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
