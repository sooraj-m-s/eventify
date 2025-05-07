import { useState, useEffect, useRef } from "react"
import { Pencil, Upload, X } from "lucide-react"
import ProfileSidebar from "./components/ProfileSidebar"
import axiosInstance from "../../utils/axiosInstance"
import uploadToCloudinary from "../../utils/cloudinaryUpload"
import { toast } from "react-toastify"


const UserProfile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    profile_image: "",
  })
  const fileInputRef = useRef(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const response = await axiosInstance.get("/users/profile/")
        setProfile(response.data)
        setFormData({
          full_name: response.data.full_name || "",
          email: response.data.email || "",
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

  const handleImageClick = () => {
    fileInputRef.current.click()
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setImageUploading(true)
      const imageUrl = await uploadToCloudinary(file)
      setFormData((prev) => ({
        ...prev,
        profile_image: imageUrl,
      }))
      toast.success("Image uploaded successfully")
    } catch (error) {
      console.error("Error uploading image:", error)
    } finally {
      setImageUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      profile_image: "",
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await axiosInstance.patch("/users/profile/", formData)
      setProfile(response.data)
      setIsEditing(false)
      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error)
      setError("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

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
    </div>
  )

  const ProfileEdit = () => (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* Profile Image Upload */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          {formData.profile_image ? (
            <>
              <img
                src={formData.profile_image || "/placeholder.svg"}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                title="Remove image"
              >
                <X size={16} />
              </button>
            </>
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-xl font-medium">
                {formData.full_name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={handleImageClick}
            disabled={imageUploading}
            className="absolute bottom-0 right-0 bg-white text-gray-700 rounded-full p-2 shadow-md hover:bg-gray-100"
          >
            {imageUploading ? (
              <div className="w-5 h-5 border-2 border-t-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Upload size={16} />
            )}
          </button>

          <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
        </div>
        <p className="text-sm text-gray-500 mt-2">Click to change profile picture</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name - Editable */}
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        {/* Email - Disabled */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="text"
            id="email"
            name="email"
            value={profile?.email || ""}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Phone - Disabled */}
        <div>
          <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="mobile"
            name="mobile"
            value={profile?.mobile || ""}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Role - Disabled */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <input
            type="text"
            id="role"
            name="role"
            value={profile?.role || ""}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
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
        <button
          type="submit"
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400"
          disabled={loading || imageUploading}
        >
          {loading ? "Saving..." : "Save Changes"}
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