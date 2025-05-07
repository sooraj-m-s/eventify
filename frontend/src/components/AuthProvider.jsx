import { useEffect } from "react"
import { useDispatch } from "react-redux"
import axiosInstance from "../utils/axiosInstance"
import { setUser, setLoading } from "../store/slices/authSlice"

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch()

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        dispatch(setLoading(true))

        // Call your backend endpoint to validate the token in the HTTP-only cookie
        const response = await axiosInstance.get("/users/me/")

        // If successful, update the Redux store with user data
        dispatch(
          setUser({
            id: response.data.user_id,
            name: response.data.full_name,
            email: response.data.email,
            profile_image: response.data.profile_image,
            role: response.data.role,
          }),
        )
      } catch (error) {
        console.error("Error checking authentication status:", error)
        // User is not authenticated, that's okay
      } finally {
        dispatch(setLoading(false))
      }
    }

    checkAuthStatus()
  }, [dispatch])

  return children
}

export default AuthProvider