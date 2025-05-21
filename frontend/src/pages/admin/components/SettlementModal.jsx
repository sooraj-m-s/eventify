import { useState } from "react"
import { IndianRupee, XCircle } from "lucide-react"
import axiosInstance from "@/utils/axiosInstance"


const SettlementModal = ({ event, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const confirmSettlement = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axiosInstance.post("/admin/events/settle/", {
        event_id: event.eventId,
      })

      onSuccess()
    } catch (error) {
      console.error("Settlement error:", error)
      setError(error.response?.data?.error || "An error occurred during settlement")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Confirm Settlement</h2>
        </div>

        <div className="p-6">
          <p className="mb-4">
            Are you sure you want to settle the event <span className="font-semibold">{event.title}</span>?
          </p>

          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium text-blue-800 mb-2">Settlement Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Event Date:</span>
                <span className="font-medium">{formatDate(event.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tickets Sold:</span>
                <span className="font-medium">{event.ticketsSold}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price per Ticket:</span>
                <span className="font-medium">₹{event.pricePerTicket}</span>
              </div>
              <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
                <span className="text-gray-600">Total Revenue:</span>
                <span className="font-medium">₹{event.ticketsSold * event.pricePerTicket}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Fee (10%):</span>
                <span className="font-medium">₹{Math.round(event.ticketsSold * event.pricePerTicket * 0.1)}</span>
              </div>
              <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
                <span className="text-gray-600">Organizer Share (90%):</span>
                <span className="font-medium">₹{Math.round(event.ticketsSold * event.pricePerTicket * 0.9)}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-4">
              <div className="flex">
                <XCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p>{error}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={confirmSettlement}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <IndianRupee className="h-5 w-5 mr-2" />
                  Confirm Settlement
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettlementModal