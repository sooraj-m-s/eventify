import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"
import ProfileSidebar from "./components/ProfileSidebar"


const UserProfile = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
  })

  const navigate = useNavigate()

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        // Get token from localStorage
        const token = localStorage.getItem("userToken")

        if (!token) {
          navigate("/client/login")
          return
        }

        const response = await axios.get("/users/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setUser(response.data)
        setFormData({
          firstName: response.data.firstName || "",
          lastName: response.data.lastName || "",
          email: response.data.email || "",
          contactNumber: response.data.contactNumber || "",
        })
      } catch (err) {
        console.error("Error fetching user data:", err)
        setError("Failed to load user profile")
        toast.error("Failed to load profile data")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [navigate])

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem("userToken")

      await axios.put("/users/profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // Update local user state
      setUser({
        ...user,
        ...formData,
      })

      setIsEditing(false)
      toast.success("Profile updated successfully")
    } catch (err) {
      console.error("Error updating profile:", err)
      toast.error("Failed to update profile")
    }
  }

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("userToken")
    localStorage.removeItem("userData")
    navigate("/client/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "C"
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-lg border-2 border-black overflow-hidden flex flex-col md:flex-row">
        {/* Use the ProfileSidebar component */}
        <ProfileSidebar user={user} onLogout={handleLogout} />

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-[#333] rounded-full flex items-center justify-center text-white text-xl font-semibold mr-4">
                {getInitial(user?.firstName)}
              </div>
              <div>
                <h2 className="text-lg font-semibold uppercase">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-sm text-gray-600 lowercase">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-6 py-2 bg-black text-white rounded font-medium"
            >
              {isEditing ? "Cancel" : "Edit"}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
              <div>
                <label className="block mb-2 font-medium">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full p-3 border border-gray-300 rounded bg-white"
                  placeholder="First Name"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full p-3 border border-gray-300 rounded bg-white"
                  placeholder="Last Name"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full p-3 border border-gray-300 rounded bg-white"
                  placeholder="sample@example.com"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Contact Number</label>
                <input
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full p-3 border border-gray-300 rounded bg-white"
                  placeholder="(123) 456789"
                />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => navigate("/client/reset-password")}
                className="text-sm text-gray-700 hover:underline"
              >
                Reset Password
              </button>
            </div>

            {isEditing && (
              <div className="flex justify-center mt-6">
                <button type="submit" className="px-8 py-2 bg-green-600 text-white rounded font-medium">
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default UserProfile