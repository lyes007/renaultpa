import GoogleSignInButton from "@/components/google-signin-button"

export default function GoogleButtonDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Google Sign-in Button Demo
          </h1>
          <p className="text-lg text-gray-600">
            Experience the fancy Google sign-in button with animated hover effects
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2">
          {/* Desktop Version */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Desktop Version
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Full-size button with complete Google branding and animations
            </p>
            <div className="flex justify-center">
              <GoogleSignInButton />
            </div>
          </div>
          
          {/* Mobile Version */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Mobile Version
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Compact version optimized for mobile devices
            </p>
            <div className="flex justify-center">
              <div className="w-64">
                <GoogleSignInButton />
              </div>
            </div>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Button Features
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Visual Effects</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Animated Google logo with color transitions
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Wave animation on hover
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                  Smooth color transitions
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                  Text color animation
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Functionality</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Auth.js integration
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Loading states
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                  Error handling
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                  Responsive design
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Animation Details */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            Animation Sequence
          </h3>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span><strong>0.1s:</strong> Red wave starts expanding</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span><strong>0.3s:</strong> Yellow wave begins</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span><strong>0.7s:</strong> Green wave takes over</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span><strong>1.1s:</strong> Blue wave completes the sequence</span>
            </div>
          </div>
        </div>
        
        {/* Usage Instructions */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            How to Use
          </h3>
          <div className="space-y-3 text-sm text-gray-700">
            <p>1. <strong>Hover over the button</strong> to see the animated Google logo effect</p>
            <p>2. <strong>Click to sign in</strong> with your Google account</p>
            <p>3. <strong>Watch the loading state</strong> during authentication</p>
            <p>4. <strong>See your profile</strong> once authenticated</p>
          </div>
        </div>
      </div>
    </div>
  )
}
