import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: 'No active session found' })
    }
    
    // Manually delete the session from database
    const deletedSession = await prisma.session.deleteMany({
      where: {
        userId: session.user.id
      }
    })
    
    console.log(`Deleted ${deletedSession.count} sessions for user ${session.user.email}`)
    
    return NextResponse.json({ 
      message: 'Session deleted successfully',
      deletedCount: deletedSession.count,
      userEmail: session.user.email
    })
  } catch (error) {
    console.error('Manual logout error:', error)
    return NextResponse.json({
      error: 'Failed to logout',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
