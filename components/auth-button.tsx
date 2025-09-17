"use client"

import { useSession, signIn, signOut } from "next-auth/react"

export default function AuthButton() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {session.user?.image && (
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm text-gray-700">
            {session.user?.name || session.user?.email}
          </span>
        </div>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
    >
      Sign In with Google
    </button>
  )
}
