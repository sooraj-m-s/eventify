import axiosInstance from "@/utils/axiosInstance"
import { useState, useEffect } from "react"
import { toast } from "sonner"


const CreateCouponModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    code: "",
    organizer: "",
    discount_amount: "",
    minimum_purchase_amt: "",
    valid_from: "",
    valid_to: "",
    is_active: true,
  })
  const [organizers, setOrganizers] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      fetchOrganizers()
      setFormData({
        code: "",
        organizer: "",
        discount_amount: "",
        minimum_purchase_amt: "",
        valid_from: "",
        valid_to: "",
        is_active: true,
      })
      setErrors({})
    }
  }, [isOpen])

  const fetchOrganizers = async () => {
    try {
      const response = await axiosInstance.get("/users/organizers/")
      const usersArray = response.data.map(item => item.user);
      setOrganizers(usersArray || response.data)
    } catch (error) {
      console.error("Error fetching organizers:", error)
      toast.error("Failed to fetch organizers")
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.code.trim()) {
      newErrors.code = "Coupon code is required"
    } else if (formData.code.length > 20) {
      newErrors.code = "Coupon code must be 20 characters or less"
    }

    if (!formData.organizer) {
      newErrors.organizer = "Organizer is required"
    }

    if (!formData.discount_amount) {
      newErrors.discount_amount = "Discount amount is required"
    } else if (isNaN(formData.discount_amount) || Number.parseInt(formData.discount_amount) <= 0) {
      newErrors.discount_amount = "Discount amount must be a positive number"
    }

    if(!formData.minimum_purchase_amt) {
      newErrors.minimum_purchase_amt = "Minimum purchase amount is required"
    } else if (isNaN(formData.minimum_purchase_amt) || Number.parseInt(formData.minimum_purchase_amt) <= 0) {
      newErrors.minimum_purchase_amt = "Minimum purchase amount must be a positive number"
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
      const today = new Date()

      if (fromDate < today) {
        newErrors.valid_from = "Valid from date must be a future date"
      }
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
      await axiosInstance.post("/coupon/coupons/", {
        ...formData,
        discount_amount: Number.parseInt(formData.discount_amount),
      })

      onSuccess()
    } catch (error) {
      toast.error(error.response.data.code || "Failed to create coupon")
      console.error("Error creating coupon:", error)
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Create New Coupon</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Coupon Code *
            </label>
            <input
              id="code"
              type="text"
              value={formData.code}
              onChange={(e) => handleInputChange("code", e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                errors.code ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.code && <p className="text-sm text-red-500 mt-1">{errors.code}</p>}
          </div>

          <div>
            <label htmlFor="organizer" className="block text-sm font-medium text-gray-700 mb-1">
              Organizer *
            </label>
            <select
              id="organizer"
              value={formData.organizer}
              onChange={(e) => handleInputChange("organizer", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                errors.organizer ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select organizer</option>
              {organizers.map((organizer) => (
                <option key={organizer.user_id} value={organizer.user_id}>
                  {organizer.full_name} ({organizer.email})
                </option>
              ))}
            </select>
            {errors.organizer && <p className="text-sm text-red-500 mt-1">{errors.organizer}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="discount_amount" className="block text-sm font-medium text-gray-700 mb-1">
                Discount Amount *
              </label>
              <input
                id="discount_amount"
                type="number"
                value={formData.discount_amount}
                onChange={(e) => handleInputChange("discount_amount", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.discount_amount ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.discount_amount && <p className="text-sm text-red-500 mt-1">{errors.discount_amount}</p>}
            </div>

            <div>
              <label htmlFor="minimum_purchase_amt" className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Purchase Amount *
              </label>
              <input
                id="minimum_purchase_amt"
                type="number"
                value={formData.minimum_purchase_amt}
                onChange={(e) => handleInputChange("minimum_purchase_amt", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.minimum_purchase_amt ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.minimum_purchase_amt && <p className="text-sm text-red-500 mt-1">{errors.minimum_purchase_amt}</p>}
            </div>
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
              {loading ? "Creating..." : "Create Coupon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateCouponModal