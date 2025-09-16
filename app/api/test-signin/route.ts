import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Get all sessions from database
    const allSessions = await prisma.session.findMany({
      include: {
        user: true
      }
    })
    
    // Get all users
    const allUsers = await prisma.user.findMany()
    
    // Get all accounts
    const allAccounts = await prisma.account.findMany()
    
    return NextResponse.json({
      currentSession: session ? {
        user: session.user,
        expires: session.expires
      } : null,
      database: {
        sessions: allSessions.map(s => ({
          id: s.id,
          userId: s.userId,
          expires: s.expires,
          userEmail: s.user.email
        })),
        users: allUsers.map(u => ({
          id: u.id,
          email: u.email,
          name: u.name
        })),
        accounts: allAccounts.map(a => ({
          id: a.id,
          userId: a.userId,
          provider: a.provider,
          type: a.type
        }))
      },
      authConfig: {
        strategy: authOptions.session?.strategy,
        adapter: !!authOptions.adapter,
        providers: authOptions.providers?.map(p => p.id || p.name)
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check signin status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
