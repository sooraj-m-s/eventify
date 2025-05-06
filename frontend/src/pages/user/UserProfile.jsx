import { useState, useEffect } from "react"
import { Pencil } from "lucide-react"
import ProfileSidebar from "./components/ProfileSidebar"
import axiosInstance from "../../utils/axiosInstance"


const UserProfile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    location: "",
    additional_info: "",
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const response = await axiosInstance.get("/users/profile/")
        setProfile(response.data)
        setFormData({
          full_name: response.data.full_name || "",
          email: response.data.email || "",
          phone: response.data.mobile || "",
          location: response.data.location || "",
          additional_info: response.data.additional_info || "",
        })
      } catch (error) {
        console.error("Error fetching profile:", error)
        setError("Failed to load profile data")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await axiosInstance.patch("/users/profile/", formData, {
        withCredentials: true,
      })
      setProfile(response.data)
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
      setError("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  // Profile View Component
  const ProfileView = () => (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Full Name</p>
            <p className="font-medium">{profile?.full_name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Mobile</p>
            <p className="font-medium">{profile?.mobile || "N/A"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Joined</p>
            <p className="font-medium">{profile?.created_at}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{profile?.email}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-medium">{profile?.status}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p className="font-medium">{profile?.location || "N/A"}</p>
          </div>
        </div>
      </div>

      {profile?.additional_info && (
        <div className="pt-4 border-t">
          <h3 className="text-lg font-medium mb-2">Additional Info</h3>
          <p className="text-gray-700">{profile.additional_info}</p>
        </div>
      )}
    </div>
  )

  // Profile Edit Component
  const ProfileEdit = () => (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.full_name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="text"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.mobile}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        {/* Location */}
        <div className="md:col-span-2">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        {/* Additional Info */}
        <div className="md:col-span-2">
          <label htmlFor="additional_info" className="block text-sm font-medium text-gray-700 mb-1">
            Additional Info
          </label>
          <textarea
            id="additional_info"
            name="additional_info"
            rows={4}
            value={formData.additional_info}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-4 border-t">
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
          Save Changes
        </button>
      </div>
    </form>
  )

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* ProfileSidebar */}
      <ProfileSidebar />
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b">
            <h1 className="text-2xl font-semibold">Profile</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center text-gray-700 hover:text-gray-900"
              >
                <Pencil className="h-5 w-5 mr-1" />
                <span>Edit</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ) : error ? (
            <div className="p-6 text-red-500">{error}</div>
          ) : isEditing ? (
            <ProfileEdit />
          ) : (
            <ProfileView />
          )}
        </div>
      </div>
    </div>
  )
}

export default UserProfile