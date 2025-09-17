import LoginButton from "@/components/login-button"
import LoginButtonCompact from "@/components/login-button-compact"

export default function LoginDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            LoginButton Component Demo
          </h1>
          <p className="text-lg text-gray-600">
            Examples of the LoginButton component in different sizes and contexts
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2">
          {/* Standard LoginButton */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Standard LoginButton
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Full-size button with user avatar and complete text
            </p>
            <div className="flex justify-center">
              <LoginButton />
            </div>
          </div>
          
          {/* Compact LoginButton */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Compact LoginButton
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Smaller version for headers and navigation bars
            </p>
            <div className="flex justify-center">
              <LoginButtonCompact />
            </div>
          </div>
        </div>
        
        {/* Header simulation */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Header Simulation
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            How the compact version would look in a header
          </p>
          <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold text-gray-900">Renault Parts</h3>
              <nav className="hidden md:flex space-x-4">
                <a href="#" className="text-gray-600 hover:text-gray-900">Home</a>
                <a href="#" className="text-gray-600 hover:text-gray-900">Products</a>
                <a href="#" className="text-gray-600 hover:text-gray-900">About</a>
              </nav>
            </div>
            <LoginButtonCompact />
          </div>
        </div>
        
        {/* Features list */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            LoginButton Features
          </h3>
          <ul className="grid gap-2 md:grid-cols-2 text-sm text-blue-800">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Handles loading states
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Shows user avatar and name
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Proper error handling
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Google OAuth integration
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              TypeScript support
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Responsive design
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Accessible buttons
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Smooth transitions
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
