// Example dashboard page with proper auth caching handling
export const dynamic = 'force-dynamic'

import { useSession } from 'next-auth/react'

export default function Dashboard() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    return <div>Please sign in to access the dashboard</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Dashboard
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Welcome, {session.user?.name}!
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900">User Information</h3>
              <p className="text-sm text-blue-800">Email: {session.user?.email}</p>
              <p className="text-sm text-blue-800">ID: {session.user?.id}</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900">Session Status</h3>
              <p className="text-sm text-green-800">Status: Authenticated</p>
              <p className="text-sm text-green-800">Provider: Google</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
