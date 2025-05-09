import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import { Eye, EyeOff } from "lucide-react"
import axiosInstance from "../../utils/axiosInstance"


const ResetPassword = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { tempUserId, email } = location.state || {}

//   useEffect(() => {
//     if (!tempUserId || !email) {
//       toast.error("Missing information. Please restart the password reset process.")
//       navigate("/client/forgot_password")
//     }
//   }, [tempUserId, email, navigate])

  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const inputRefs = useRef([])
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resendingOtp, setResendingOtp] = useState(false)
  const [resettingPassword, setResettingPassword] = useState(false)
  const [otpExpireTime, setOtpExpireTime] = useState(120)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (otpExpireTime > 0) {
      const timer = setTimeout(() => setOtpExpireTime(otpExpireTime - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [otpExpireTime])

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text")
    if (/^\d+$/.test(pastedData) && pastedData.length <= 6) {
      const digits = pastedData.split("").slice(0, 6)
      const newOtp = [...otp]

      digits.forEach((digit, index) => {
        if (index < 6) {
          newOtp[index] = digit
        }
      })

      setOtp(newOtp)

      const nextEmptyIndex = newOtp.findIndex((digit) => !digit)
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex].focus()
      } else {
        inputRefs.current[5].focus()
      }
    }
  }

  const resendOtp = async () => {
    if (resendCooldown > 0) return

    setResendingOtp(true)

    try {
      await axiosInstance.post("/users/resend_otp/", {
        temp_user_id: tempUserId,
      })
      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0].focus()
      setOtpExpireTime(120)
      setResendCooldown(120)
      toast.success("New verification code sent to your email")
    } catch (error) {
      console.error("Error resending OTP:", error)
      toast.error(error.response?.data?.error || "Failed to resend verification code")
    } finally {
      setResendingOtp(false)
    }
  }

  const validatePassword = () => {
    if (password.trim().length < 8) {
      toast.error("Password must be at least 8 characters long")
      return false
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return false
    }

    return true
  }

  // Reset password
  const resetPassword = async (e) => {
    e.preventDefault()
    const otpValue = otp.join("")
    if (otpValue.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP")
      return
    }
    if (otpExpireTime <= 0) {
      toast.error("OTP has expired. Please request a new one.")
      return
    }
    if (!validatePassword()) {
      return
    }

    setResettingPassword(true)

    try {
      await axiosInstance.post("/users/change_password/", {
        temp_user_id: tempUserId,
        otp: otpValue,
        new_password: password,
      })
      toast.success("Password reset successfully!")
      setTimeout(() => {navigate("/client/login")}, 2000)
    } catch (error) {
      console.error("Error resetting password:", error)

      // Check for specific error messages
      if (error.response?.data?.error === "Invalid OTP") {
        toast.error("Invalid verification code. Please check and try again.")
      } else if (error.response?.data?.error === "OTP expired") {
        toast.error("Verification code has expired. Please request a new one.")
        setOtpExpireTime(0)
      } else {
        toast.error(error.response?.data?.error || "Failed to reset password")
      }
    } finally {
      setResettingPassword(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-xl overflow-hidden w-full max-w-md"
      >
        <div className="p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Reset Password</h1>
            <p className="text-gray-600 mt-2">
              Enter the verification code sent to <span className="font-medium">{email}</span> and create a new password
            </p>
          </div>

          <form onSubmit={resetPassword} className="space-y-6">
            {/* OTP Section */}
            <div className="space-y-4">
              <div className="text-center mb-2">
                <span className={`text-sm font-medium ${otpExpireTime < 30 ? "text-red-500" : "text-gray-600"}`}>
                  Code expires in: {formatTime(otpExpireTime)}
                </span>
              </div>

              <div className="flex justify-center space-x-2 mb-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-14 text-center text-xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    disabled={resettingPassword || otpExpireTime <= 0}
                  />
                ))}
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={resendOtp}
                  disabled={resendCooldown > 0 || resendingOtp || resettingPassword}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {resendCooldown > 0
                    ? `Resend code in ${formatTime(resendCooldown)}`
                    : resendingOtp
                      ? "Sending..."
                      : "Resend verification code"}
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">New Password</span>
              </div>
            </div>

            {/* Password Section */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Create new password"
                  disabled={resettingPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Confirm new password"
                  disabled={resettingPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={resettingPassword || otpExpireTime <= 0}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {resettingPassword ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Resetting Password...
                </div>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        </div>

        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            Remember your password?{" "}
            <Link to="/client/login" className="text-blue-600 hover:text-blue-700">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default ResetPassword