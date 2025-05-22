import { AlertTriangle, X } from "lucide-react"


const CancellationConfirmationModal = ({ booking, onConfirm, onCancel, isLoading }) => {
  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-red-600 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Confirm Cancellation
          </h2>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="mb-4">
            Are you sure you want to cancel your booking for{" "}
            <span className="font-semibold">{booking.event.title}</span>?
          </p>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              No, Keep Booking
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400"
              disabled={isLoading}
            >
              {isLoading ? "Cancelling..." : "Yes, Cancel Booking"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CancellationConfirmationModal