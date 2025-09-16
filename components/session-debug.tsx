"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function SessionDebug() {
  const { data: session, status } = useSession()
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchDebugInfo = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-signin')
      const data = await response.json()
      setDebugInfo(data)
    } catch (error) {
      console.error('Failed to fetch debug info:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDebugInfo()
  }, [])

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔍 Session Debug Information
          <Button 
            onClick={fetchDebugInfo} 
            size="sm" 
            variant="outline"
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Client-side Session */}
        <div>
          <h3 className="font-semibold mb-2">Client-side Session (useSession)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Badge variant={status === "loading" ? "secondary" : status === "authenticated" ? "default" : "destructive"}>
                Status: {status}
              </Badge>
            </div>
            <div>
              {session ? (
                <div className="text-sm">
                  <p><strong>User:</strong> {session.user?.name || session.user?.email}</p>
                  <p><strong>Email:</strong> {session.user?.email}</p>
                  <p><strong>ID:</strong> {session.user?.id}</p>
                  <p><strong>Expires:</strong> {session.expires}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">No session</p>
              )}
            </div>
          </div>
        </div>

        {/* Server-side Debug Info */}
        {debugInfo && (
          <div>
            <h3 className="font-semibold mb-2">Server-side Debug Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-1">Current Session</h4>
                {debugInfo.currentSession ? (
                  <div className="text-sm">
                    <p><strong>User:</strong> {debugInfo.currentSession.user?.name || debugInfo.currentSession.user?.email}</p>
                    <p><strong>Email:</strong> {debugInfo.currentSession.user?.email}</p>
                    <p><strong>Expires:</strong> {debugInfo.currentSession.expires}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No current session detected</p>
                )}
              </div>
              <div>
                <h4 className="font-medium mb-1">Database Sessions</h4>
                <p className="text-sm">
                  <strong>Count:</strong> {debugInfo.database.sessions.length}
                </p>
                {debugInfo.database.sessions.length > 0 && (
                  <div className="text-xs mt-1">
                    {debugInfo.database.sessions.map((s: any, i: number) => (
                      <div key={i} className="border-b pb-1 mb-1">
                        <p><strong>User:</strong> {s.userEmail}</p>
                        <p><strong>Expires:</strong> {new Date(s.expires).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Auth Configuration */}
        {debugInfo && (
          <div>
            <h3 className="font-semibold mb-2">Authentication Configuration</h3>
            <div className="text-sm">
              <p><strong>Strategy:</strong> {debugInfo.authConfig.strategy}</p>
              <p><strong>Adapter:</strong> {debugInfo.authConfig.adapter ? "Enabled" : "Disabled"}</p>
              <p><strong>Providers:</strong> {debugInfo.authConfig.providers?.join(", ")}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
