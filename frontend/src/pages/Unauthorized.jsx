import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import Header from "@/components/Header"

const Unauthorized = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Header />
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-red-600 mb-2">403</h1>
        <div className="w-16 h-1 bg-red-600 mx-auto mb-6"></div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-8">You don't have permission to access this page.</p>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors mx-auto"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Go Back</span>
        </button>
      </div>
    </div>
  )
}

export default Unauthorized