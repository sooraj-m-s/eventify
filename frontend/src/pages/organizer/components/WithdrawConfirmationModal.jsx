import { Download, Clock, X } from "lucide-react"


const WithdrawConfirmationModal = ({ isOpen, onClose, walletBalance, onConfirm, isLoading }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm bg-black/30" onClick={onClose}></div>

      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Confirm Withdrawal</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-6">You are about to withdraw all available funds from your wallet.</p>

        <div className="space-y-4 mb-6">
          {/* Withdrawal Amount */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Withdrawal Amount</div>
            <div className="text-2xl font-bold text-gray-900">₹{walletBalance?.toLocaleString()}</div>
          </div>

          {/* Processing Time Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-blue-900 mb-1">Processing Time</div>
                <div className="text-sm text-blue-700">
                  The withdrawal will be credited to your registered bank account within{" "}
                  <span className="font-semibold">5-7 working days</span>.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Confirm Withdrawal
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default WithdrawConfirmationModal