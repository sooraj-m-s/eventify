import { useNavigate, Link } from "react-router-dom"
import { ArrowLeft, Home } from "lucide-react"

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Text */}
        <h1 className="text-9xl font-bold text-blue-600 mb-2">404</h1>

        {/* Decorative element */}
        <div className="w-16 h-1 bg-blue-600 mx-auto mb-6"></div>

        {/* Message */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-8">Sorry, we couldn't find the page you're looking for.</p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors w-full sm:w-auto justify-center"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Go Back</span>
          </button>

          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center"
          >
            <Home className="h-5 w-5" />
            <span>Go Home</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound