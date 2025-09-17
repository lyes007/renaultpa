"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useState } from "react"

export default function LoginButtonCompact() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn("google")
    } catch (error) {
      console.error("Sign in error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut()
    } catch (error) {
      console.error("Sign out error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle loading state
  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center space-x-1">
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
        <span className="text-xs text-gray-600">Loading...</span>
      </div>
    )
  }

  // Handle authenticated state
  if (status === "authenticated" && session?.user) {
    return (
      <div className="flex items-center space-x-2">
        {/* User avatar */}
        {session.user.image && (
          <img
            src={session.user.image}
            alt={session.user.name || "User avatar"}
            className="w-6 h-6 rounded-full border border-gray-200"
          />
        )}
        
        {/* User name (truncated) */}
        <span className="text-xs font-medium text-gray-700 max-w-20 truncate">
          {session.user.name || session.user.email}
        </span>
        
        {/* Sign out button */}
        <button
          onClick={handleSignOut}
          disabled={isLoading}
          className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Out
        </button>
      </div>
    )
  }

  // Handle unauthenticated state
  return (
    <button
      onClick={handleSignIn}
      disabled={isLoading}
      className="flex items-center space-x-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <svg className="w-3 h-3" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      <span>Sign in</span>
    </button>
  )
}
