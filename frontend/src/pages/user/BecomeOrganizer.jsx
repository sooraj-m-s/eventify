import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Upload, Loader2, AlertCircle, CheckCircle, XCircle, X } from "lucide-react"
import uploadToCloudinary from "../../utils/cloudinaryUpload"
import ProfileSidebar from "./components/ProfileSidebar"
import { fetchOrganizerProfile } from "@/api/organizer"
import { submitOrganizerProfile } from "@/api/user"


const BecomeOrganizer = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [status, setStatus] = useState("loading")
  const [profileData, setProfileData] = useState(null)
  const [showFullAbout, setShowFullAbout] = useState(false)
  const [formData, setFormData] = useState({
    place: "",
    about: "",
    id_proof: "",
  })
  const [errors, setErrors] = useState({})
  const [previewImage, setPreviewImage] = useState(null)

  useEffect(() => {
    checkOrganizerStatus()
  }, [])

  const checkOrganizerStatus = async () => {
    try {
      setLoading(true)
      const response = await fetchOrganizerProfile();

      setProfileData(response.data)
      if (response.data.is_approved) {
        setStatus("approved")
      } else if (response.data.is_rejected) {
        setStatus("rejected")
      } else {
        setStatus("pending")
      }
    } catch (error) {
      console.error("Error fetching organizer status:", error)

      if (error.response?.status === 404) {
        setStatus("not_applied")
      } else {
        toast.error("Failed to check organizer status")
      }
    } finally {
      setLoading(false)
    }
  }

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

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setUploadingImage(true)

      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)
      }
      reader.readAsDataURL(file)
      const imageUrl = await uploadToCloudinary(file)

      setFormData({
        ...formData,
        id_proof: imageUrl,
      })
      if (errors.id_proof) {
        setErrors({
          ...errors,
          id_proof: "",
        })
      }

    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Failed to upload ID proof")
      setPreviewImage(null)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleClearImage = () => {
    setPreviewImage(null)
    setFormData({
      ...formData,
      id_proof: "",
    })

    const fileInput = document.getElementById("id-proof")
    if (fileInput) {
      fileInput.value = ""
    }

    if (errors.id_proof) {
      setErrors({
        ...errors,
        id_proof: "",
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.place.trim()) {
      newErrors.place = "Place is required"
    }

    if (!formData.about.trim()) {
      newErrors.about = "About information is required"
    } else if (formData.about.trim().length < 20) {
      newErrors.about = "About section should be at least 20 characters"
    }

    if (!formData.id_proof) {
      newErrors.id_proof = "ID proof is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }

    try {
      setSubmitting(true)

      const response = await submitOrganizerProfile(formData);
      setProfileData(response.data?.profile || { ...formData })
      toast.success("Organizer request submitted successfully")
      setStatus("pending")
    } catch (error) {
      console.error("Error submitting organizer request:", error)
      toast.error(error.response?.data?.error || "Failed to submit organizer request")
    } finally {
      setSubmitting(false)
    }
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Checking status...</span>
        </div>
      )
    }

    if (status === "approved") {
      return (
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="flex items-start">
            <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-green-800">You're already an organizer!</h3>
              <p className="text-green-700 mt-2">
                Your organizer account has been approved. You can now host events and manage them from your organizer
                dashboard.
              </p>
              <button
                onClick={() => navigate("/organizer/events")}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Go to Organizer Dashboard
              </button>
            </div>
          </div>
        </div>
      )
    }

    if (status === "pending") {
      return (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-blue-500 mr-3 mt-0.5" />
            <div>
              <h3 className="text-lg text-center font-semibold text-blue-800">Your request is pending</h3>
              <p className="text-blue-700 mt-2">
                Your request to become an organizer is currently under review by our admin team. We'll notify you once a
                decision has been made.
              </p>
              <div className="mt-4 bg-white p-4 rounded-md border border-blue-100">
                <div className="mt-2 space-y-4">
                  <p>
                    <span className="font-medium">Place:</span> {profileData && profileData.place}
                  </p>

                  <div>
                    <span className="font-medium">About:</span>{" "}
                    {profileData && profileData.about && (
                      <>
                        {showFullAbout ? (
                          profileData.about
                        ) : (
                          <>
                            {profileData.about.split(" ").slice(0, 50).join(" ")}
                            {profileData.about.split(" ").length > 50 && "..."}
                          </>
                        )}
                        {profileData.about.split(" ").length > 50 && (
                          <button
                            onClick={() => setShowFullAbout(!showFullAbout)}
                            className="ml-2 text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer"
                          >
                            {showFullAbout ? "Show less" : "Read more"}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                  
                  {/* ID Proof Image */}
                  {profileData && profileData.id_proof && (
                    <div>
                      <span className="font-medium block mb-2">ID Proof:</span>
                      <div className="mt-2 border border-gray-200 rounded-md p-2 flex justify-center items-center">
                        <img
                          src={profileData.id_proof || "/placeholder.svg"}
                          alt="ID Proof"
                          className="w-full h-auto object-contain rounded"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (status === "rejected") {
      return (
        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <div className="flex items-start">
            <XCircle className="w-6 h-6 text-red-500 mr-3 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Your request was not approved</h3>
              <p className="text-red-700 mt-2">
                Unfortunately, your request to become an organizer was not approved. Please contact our admin team for
                more information.
              </p>
              <div className="mt-4 bg-white p-4 rounded-md border border-red-100">
                <h4 className="font-medium text-gray-700">Reason for rejection:</h4>
                <p className="mt-1 text-gray-600">{profileData.rejected_reason || "No specific reason provided."}</p>
              </div>
              <button
                onClick={() => navigate("/contact")}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Contact Admin
              </button>
            </div>
          </div>
        </div>
      )
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Important notice</h3>
              <div className="mt-1 text-sm text-yellow-700">
                <p>
                  Once submitted, these details <strong>cannot be changed</strong>. Please carefully review all
                  information before submitting your application.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="place" className="block text-sm font-medium text-gray-700 mb-1">
            Place/Location <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="place"
            name="place"
            value={formData.place}
            onChange={handleChange}
            className={`w-full px-3 py-2 border ${
              errors.place ? "border-red-300" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-1 focus:ring-black`}
            placeholder="Enter your city or location"
          />
          {errors.place && <p className="mt-1 text-sm text-red-500">{errors.place}</p>}
        </div>

        <div>
          <label htmlFor="about" className="block text-sm font-medium text-gray-700 mb-1">
            About <span className="text-red-500">*</span>
          </label>
          <textarea
            id="about"
            name="about"
            value={formData.about}
            onChange={handleChange}
            rows={5}
            className={`w-full px-3 py-2 border ${
              errors.about ? "border-red-300" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-1 focus:ring-black`}
            placeholder="Tell us about yourself and why you want to become an organizer (minimum 50 characters)"
          />
          {errors.about && <p className="mt-1 text-sm text-red-500">{errors.about}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID Proof <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {previewImage ? (
                <div className="relative">
                  <img
                    src={previewImage || "/placeholder.svg"}
                    alt="ID Proof Preview"
                    className="mx-auto h-32 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    title="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <p className="mt-2 text-sm text-gray-500">{uploadingImage ? "Loading..." : "ID proof uploaded"}</p>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="id-proof"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-black hover:text-gray-700 focus-within:outline-none"
                    >
                      <span>Upload a file</span>
                      <input
                        id="id-proof"
                        name="id-proof"
                        type="file"
                        className="sr-only"
                        onChange={handleImageChange}
                        disabled={uploadingImage}
                        accept="image/*"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                </>
              )}
            </div>
          </div>
          {errors.id_proof && <p className="mt-1 text-sm text-red-500">{errors.id_proof}</p>}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={submitting || uploadingImage}
            className="w-full px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Submitting...
              </span>
            ) : (
              "Submit Request"
            )}
          </button>
        </div>
      </form>
    )
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* ProfileSidebar */}
      <ProfileSidebar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-semibold">Become an Organizer</h1>
            <p className="text-gray-600 mt-1">
              Submit your request to become an event organizer and start hosting your own events.
            </p>
          </div>

          <div className="p-6">{renderContent()}</div>
        </div>
      </div>
    </div>
  )
}

export default BecomeOrganizer