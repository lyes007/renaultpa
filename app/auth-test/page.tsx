import AuthExample from "@/components/auth-example"

export default function AuthTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Authentication Test Page
          </h1>
          <p className="text-lg text-gray-600">
            This page demonstrates the Auth.js integration with your Next.js app
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Authentication Status
            </h2>
            <AuthExample />
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Features Implemented
            </h2>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Google OAuth Provider
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Database Sessions with Prisma
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                User ID in Session Object
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                TypeScript Support
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                SessionProvider Wrapper
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Loading States
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Next Steps
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>Configure your Google OAuth credentials in the environment variables</li>
            <li>Set up your NEXTAUTH_SECRET and NEXTAUTH_URL</li>
            <li>Test the authentication flow by clicking "Sign in with Google"</li>
            <li>Integrate authentication into your existing components</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
