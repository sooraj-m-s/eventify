import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { ArrowLeft, Loader2 } from "lucide-react"
import axiosInstance from "../../utils/axiosInstance"


const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error("Please enter your email address")
      return
    }

    setLoading(true)

    try {
      const response = await axiosInstance.post("/users/forgot_password/", {
        email: email,
      })

      toast.success("OTP sent to your email")
      setEmailSent(true)

      // Store the temp_user_id in localStorage for the next step
      localStorage.setItem("reset_password_email", email)

      // Navigate to OTP verification page
      navigate("/client/reset-password/verify-otp")
    } catch (error) {
      console.error("Error requesting password reset:", error)
      const errorMsg = error.response?.data?.error || "Failed to process your request"
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <Link to="/client/login" className="flex items-center text-gray-600 hover:text-gray-800 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Link>

          <h2 className="text-2xl font-bold text-center">Forgot Password</h2>
          <p className="mt-2 text-center text-gray-600">
            Enter your email address and we'll send you an OTP to reset your password.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
              placeholder="Enter your email address"
              disabled={loading || emailSent}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || emailSent}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Sending OTP...
                </>
              ) : emailSent ? (
                "OTP Sent"
              ) : (
                "Send Reset OTP"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ForgotPassword