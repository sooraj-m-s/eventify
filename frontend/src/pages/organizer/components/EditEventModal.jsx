import { useState, useEffect } from "react"
import { X, Calendar, IndianRupee, Users, MapPin, Upload, Loader } from "lucide-react"
import { toast } from "sonner"
import axiosInstance from "../../../utils/axiosInstance"
import uploadToCloudinary from "../../../utils/cloudinaryUpload"


const EditEventModal = ({ event, onClose, onEventUpdated }) => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    pricePerTicket: "",
    ticketLimit: "",
    location: "",
    category: "",
    posterImage: null,
    cancellationAvailable: false,
    termsAndConditions: "",
    is_completed: false,
  })
  const [previewImage, setPreviewImage] = useState(null)

  useEffect(() => {
    if (event) {
      let formattedDate = ""
      if (event.date) {
        const date = new Date(event.date)
        formattedDate = date.toISOString().split("T")[0]
      }

      setFormData({
        title: event.title || "",
        description: event.description || "",
        date: formattedDate,
        pricePerTicket: event.pricePerTicket || "",
        ticketLimit: event.ticketLimit || "",
        location: event.location || "",
        category: event.category || "",
        posterImage: event.posterImage || null,
        cancellationAvailable: event.cancellationAvailable || false,
        termsAndConditions: event.termsAndConditions || "",
        is_completed: event.is_completed || false,
      })

      if (event.posterImage) {
        setPreviewImage(event.posterImage)
      }
    }
  }, [event])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/categories/")
        setCategories(response.data.categories || [])
      } catch (error) {
        console.error("Error fetching categories:", error)
        toast.error("Failed to load categories")
      }
    }

    fetchCategories()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (e.target.type === "checkbox") {
      setFormData({
        ...formData,
        [name]: e.target.checked,
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      try {
        setImageUploading(true)
        const imageUrl = await uploadToCloudinary(file)
        setFormData({
          ...formData,
          posterImage: imageUrl,
        })
        setPreviewImage(imageUrl)
        setImageUploading(false)
      } catch (error) {
        console.error("Error uploading image:", error)
        setImageUploading(false)
      }
    }
  }

  const removeImage = () => {
    setFormData({
      ...formData,
      posterImage: null,
    })
    setPreviewImage(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title || !formData.description || !formData.date || !formData.category) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)

    try {
      const eventDate = formData.date
      if (formData.startTime) {
      }

      const eventData = {
        title: formData.title,
        description: formData.description,
        date: eventDate,
        pricePerTicket: formData.pricePerTicket || 0,
        ticketLimit: formData.ticketLimit || 100,
        location: formData.location,
        category: formData.category,
        posterImage: formData.posterImage,
        cancellationAvailable: formData.cancellationAvailable,
        termsAndConditions: formData.termsAndConditions,
        is_completed: formData.is_completed,
      }

      await axiosInstance.patch(`/organizer/${event.eventId}/`, eventData)

      if (onEventUpdated) {
        onEventUpdated()
      }
    } catch (error) {
      console.error("Error updating event:", error)
      toast.error(error.response?.data?.errors || "Failed to update event")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Edit Event</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Event ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event ID</label>
            <input
              type="text"
              value={event.eventId}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              disabled
            />
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="Enter event title"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="Enter event description"
            />
          </div>

          {/* Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  disabled
                  className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-md bg-gray-50"
                  placeholder="Enter location"
                />
                <MapPin className="absolute left-3 top-2.5 text-gray-400" size={18} />
              </div>
            </div>
          </div>

          {/* Date and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
                <Calendar className="absolute right-3 top-2.5 text-gray-400" size={18} />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_completed"
                name="is_completed"
                checked={formData.is_completed}
                onChange={handleChange}
                className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
              />
              <label htmlFor="is_completed" className="ml-2 block text-sm text-gray-700">
                Mark as completed
              </label>
            </div>
          </div>

          {/* Price and Ticket Limit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pricePerTicket" className="block text-sm font-medium text-gray-700 mb-1">
                Price per ticket
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="pricePerTicket"
                  name="pricePerTicket"
                  value={formData.pricePerTicket}
                  disabled
                  step="0.01"
                  className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-md bg-gray-50"
                  placeholder="0.00"
                />
                <IndianRupee className="absolute left-3 top-2.5 text-gray-400" size={18} />
              </div>
            </div>

            <div>
              <label htmlFor="ticketLimit" className="block text-sm font-medium text-gray-700 mb-1">
                Ticket limit
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="ticketLimit"
                  name="ticketLimit"
                  value={formData.ticketLimit}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="100"
                />
                <Users className="absolute right-3 top-2.5 text-gray-400" size={18} />
              </div>
            </div>
          </div>

          {/* Poster Image */}
          <div>
            <label htmlFor="posterImage" className="block text-sm font-medium text-gray-700 mb-1">
              Poster image
            </label>
            {imageUploading ? (
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                <Loader className="h-8 w-8 mx-auto animate-spin text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Uploading image...</p>
              </div>
            ) : previewImage ? (
              <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden">
                <img
                  src={previewImage || "/placeholder.svg"}
                  alt="Event poster preview"
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                <input
                  type="file"
                  id="posterImage"
                  name="posterImage"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <label htmlFor="posterImage" className="flex flex-col items-center justify-center cursor-pointer">
                  <Upload size={24} className="text-gray-400 mb-2" />
                  <span className="text-sm font-medium">Choose File</span>
                  <span className="text-xs text-gray-500 mt-1">Recommended size: 1200 x 630 pixels</span>
                </label>
              </div>
            )}
          </div>

          {/* Cancellation Policy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="cancellationAvailable"
                  name="cancellationAvailable"
                  checked={formData.cancellationAvailable}
                  disabled
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                />
                <label htmlFor="cancellationAvailable" className="ml-2 block text-sm font-medium text-gray-700">
                  Allow cancellation for this event
                </label>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                If enabled, attendees will be able to cancel their bookings according to platform's cancellation policy.
              </p>
            </div>

            <div>
              <label htmlFor="termsAndConditions" className="block text-sm font-medium text-gray-700 mb-1">
                Terms and Conditions (Optional)
              </label>
              <textarea
                id="termsAndConditions"
                name="termsAndConditions"
                value={formData.termsAndConditions}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="Enter terms and conditions"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || imageUploading}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 flex items-center"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                  Updating Event...
                </>
              ) : (
                "Update Event"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditEventModal