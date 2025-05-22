import { useState, useEffect } from "react"
import { X, Upload, Loader2 } from "lucide-react"
import { toast } from "sonner"
import uploadToCloudinary from "@/utils/cloudinaryUpload"
import axiosInstance from "@/utils/axiosInstance"


const EditCategoryModal = ({ isOpen, onClose, category, onSuccess }) => {
  const [formData, setFormData] = useState({
    categoryName: "",
    is_listed: true,
  })
  const [image, setImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)

  useEffect(() => {
    if (category) {
      setFormData({
        categoryName: category.categoryName || "",
        is_listed: category.is_listed !== undefined ? category.is_listed : true,
      })

      if (category.image) {
        setPreviewUrl(category.image)
      } else {
        setPreviewUrl(null)
      }
    }
  }, [category])

  if (!isOpen || !category) return null

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const removeImage = () => {
    setImage(null)
    if (previewUrl === category.image) {
      setPreviewUrl(null)
    } else {
      setPreviewUrl(category.image || null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.categoryName.trim()) {
      toast.error("Category name is required")
      return
    }
    setLoading(true)

    try {
      let imageUrl = category.image
      if (image) {
        setImageUploading(true)
        imageUrl = await uploadToCloudinary(image)
        setImageUploading(false)
      }

      if (!previewUrl && category.image) {
        imageUrl = null
      }

      const response = await axiosInstance.patch(`/categories/update/${category.categoryId}/`, {
        categoryName: formData.categoryName,
        image: imageUrl,
        is_listed: formData.is_listed,
      })

      toast.success("Category updated successfully")

      if (onSuccess) onSuccess(response.data)
    } catch (error) {
      console.error("Error updating category:", error)
      toast.error(error.response?.data?.message || "Failed to update category")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Edit Category</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            {/* Category ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category ID</label>
              <input
                type="text"
                value={category.categoryId}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                disabled
              />
            </div>

            {/* Category Name */}
            <div>
              <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                id="categoryName"
                name="categoryName"
                value={formData.categoryName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter category name"
              />
            </div>

            {/* Category Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category Image (Optional)</label>

              {previewUrl ? (
                <div className="relative w-full h-48 border rounded-md overflow-hidden">
                  <img
                    src={previewUrl || "/placeholder.svg"}
                    alt="Category preview"
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
                    id="image"
                    name="image"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <label htmlFor="image" className="flex flex-col items-center justify-center cursor-pointer">
                    <Upload size={24} className="text-gray-400 mb-2" />
                    <span className="text-sm font-medium">Choose File</span>
                    <span className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</span>
                  </label>
                </div>
              )}
            </div>

            {/* Is Listed */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_listed"
                name="is_listed"
                checked={formData.is_listed}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_listed" className="ml-2 block text-sm text-gray-700">
                Published
              </label>
            </div>

            {/* Created At */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
              <input
                type="text"
                value={new Date(category.created_at).toLocaleString()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                disabled
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || imageUploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center"
            >
              {loading || imageUploading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  {imageUploading ? "Uploading Image..." : "Updating..."}
                </>
              ) : (
                "Update Category"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditCategoryModal