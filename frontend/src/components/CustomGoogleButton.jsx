import { GoogleLogin } from "@react-oauth/google"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { setUser } from "../store/slices/authSlice"
import axiosInstance from "../utils/axiosInstance"


const CustomGoogleButton = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleGoogleResponse = async (tokenResponse) => {
    try {
      const response = await axiosInstance.post("/users/auth/google/", {
        id_token: tokenResponse.credential,
      })

      if (response.data.status === "exists") {
        dispatch(setUser({
                id: response.data.user_id,
                name: response.data.full_name,
                email: response.data.email,
                profile_image: response.data.profile_image,
                role: response.data.role
              }))
        toast.success("Login successful! Redirecting...")
        setTimeout(() => navigate("/client"), 2000)
      } else if (response.data.status === "new") {
        toast.success("New user registered! Redirecting to complete registration...")
        setTimeout(() => navigate("/client/register/complete", { state: response.data.user_data }), 2000)
      }
    } catch (error) {
      console.error("Google auth error:", error)
      toast.error("Google authentication failed")
    }
  }

  return (
        <GoogleLogin
          onSuccess={handleGoogleResponse}
          onError={() => toast.error('Google login failed')}
          useOneTap={false}
        />
  )
}

export default CustomGoogleButton