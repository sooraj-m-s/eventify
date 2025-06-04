import { useState, useEffect } from "react"
import { toast } from "sonner"
import axiosInstance from "@/utils/axiosInstance"


const EditCouponModal = ({ isOpen, onClose, coupon, onSuccess }) => {
  const [formData, setFormData] = useState({
    discount_amount: "",
    valid_from: "",
    valid_to: "",
    is_active: true,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen && coupon) {
      setFormData({
        discount_amount: coupon.discount_amount.toString(),
        valid_from: coupon.valid_from,
        valid_to: coupon.valid_to,
        is_active: coupon.is_active,
      })
      setErrors({})
    }
  }, [isOpen, coupon])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.discount_amount) {
      newErrors.discount_amount = "Discount amount is required"
    } else if (isNaN(formData.discount_amount) || Number.parseInt(formData.discount_amount) <= 0) {
      newErrors.discount_amount = "Discount amount must be a positive number"
    }

    if (!formData.valid_from) {
      newErrors.valid_from = "Valid from date is required"
    }

    if (!formData.valid_to) {
      newErrors.valid_to = "Valid to date is required"
    }

    if (formData.valid_from && formData.valid_to) {
      const fromDate = new Date(formData.valid_from)
      const toDate = new Date(formData.valid_to)

      if (fromDate >= toDate) {
        newErrors.valid_to = "Valid to date must be after valid from date"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      Object.values(errors).forEach((error) => toast.error(error))
      return
    }

    setLoading(true)
    try {
      await axiosInstance.patch(`/coupon/coupons/${coupon.couponId}/`, {
        discount_amount: Number.parseInt(formData.discount_amount),
        valid_from: formData.valid_from,
        valid_to: formData.valid_to,
        is_active: formData.is_active,
      })

      onSuccess()
    } catch (error) {
      toast.error("Failed to update coupon")
      console.error("Error updating coupon:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  if (!isOpen || !coupon) return null

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Edit Coupon</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Coupon Code
            </label>
            <input
              id="code"
              type="text"
              value={coupon.code}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
            />
            <p className="text-sm text-gray-500 mt-1">Coupon code cannot be edited</p>
          </div>

          <div>
            <label htmlFor="organizer" className="block text-sm font-medium text-gray-700 mb-1">
              Organizer
            </label>
            <input
              id="organizer"
              type="text"
              value={coupon.organizer_name || "N/A"}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
            />
            <p className="text-sm text-gray-500 mt-1">Organizer cannot be changed</p>
          </div>

          <div>
            <label htmlFor="discount_amount" className="block text-sm font-medium text-gray-700 mb-1">
              Discount Amount *
            </label>
            <input
              id="discount_amount"
              type="number"
              value={formData.discount_amount}
              onChange={(e) => handleInputChange("discount_amount", e.target.value)}
              placeholder="Enter discount amount"
              min="1"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                errors.discount_amount ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.discount_amount && <p className="text-sm text-red-500 mt-1">{errors.discount_amount}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="valid_from" className="block text-sm font-medium text-gray-700 mb-1">
                Valid From *
              </label>
              <input
                id="valid_from"
                type="date"
                value={formData.valid_from}
                onChange={(e) => handleInputChange("valid_from", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.valid_from ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.valid_from && <p className="text-sm text-red-500 mt-1">{errors.valid_from}</p>}
            </div>

            <div>
              <label htmlFor="valid_to" className="block text-sm font-medium text-gray-700 mb-1">
                Valid To *
              </label>
              <input
                id="valid_to"
                type="date"
                value={formData.valid_to}
                onChange={(e) => handleInputChange("valid_to", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.valid_to ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.valid_to && <p className="text-sm text-red-500 mt-1">{errors.valid_to}</p>}
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="is_active"
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => handleInputChange("is_active", e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
              Active
            </label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Coupon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditCouponModal