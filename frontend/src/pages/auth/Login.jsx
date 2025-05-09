import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { toast } from "react-toastify"
import { Eye, EyeOff } from "lucide-react"
import { useDispatch } from "react-redux"
import axiosInstance from "../../utils/axiosInstance"
import { setUser } from "../../store/slices/authSlice"
import ImageSlider from "../../components/ImageSlider"
import image_1 from "../../assets/login/img-1.jpg"
import CustomGoogleButton from "../../components/CustomGoogleButton"


const Login = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // replace these with actual image URLs
  const sliderImages = [image_1]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // Validate form and show toast for errors
  const validateForm = () => {
    let isValid = true
    const newErrors = {}

    // Email validation
    if (!formData.email.trim()) {
      toast.error("Email is required")
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Email address is invalid")
      isValid = false
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
      toast.error("Password is required")
      isValid = false
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
      toast.error("Password must be at least 6 characters")
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form and show toast errors
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await axiosInstance.post("/users/login/", formData)
      dispatch(setUser({
        id: response.data.user_id,
        name: response.data.full_name,
        email: response.data.email,
        profile_image: response.data.profile_image,
        role: response.data.role
      }))
      toast.success("Login successful! Redirecting to home...")
      navigate("/client")
    } catch (error) {
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          error.response.data.detail.forEach(message => toast.error(message))
        } else {
          toast.error(error.response.data.detail)
        }
      } else {
        toast.error("Login failed")
      }
      console.error("Error:", error.response ? error.response.data : error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Image Slider - Left Side */}
      <div className="hidden md:block md:w-1/2 h-screen">
        <ImageSlider images={sliderImages} />
      </div>

      {/* Login Form - Right Side */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Slider (only visible on mobile) */}
          <div className="md:hidden h-48 mb-8 rounded-lg overflow-hidden">
            <ImageSlider images={sliderImages} />
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to continue to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center"></div>
              <div className="text-sm">
                <Link to="/client/forgot_password" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              } transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {loading ? "Logging in..." : "Sign in"}
            </button>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link to="/client/register" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign up
                </Link>
              </p>
            </div>
            <CustomGoogleButton />
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login