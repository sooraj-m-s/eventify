import { CheckCircle, XCircle, Loader } from "lucide-react"


const PaymentConfirmationModal = ({ status, bookingId, onViewBookingDetails, onReturnHome, onTryAgain }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === "processing" && (
          <>
            <div className="flex justify-center mb-4">
              <Loader className="h-16 w-16 text-blue-500 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Processing Your Payment</h1>
            <p className="text-gray-600 mb-6">Please wait while we confirm your payment...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">Your booking has been confirmed. Thank you for your purchase!</p>
            {bookingId && (
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <p className="text-sm text-gray-600">Booking Reference</p>
                <p className="text-lg font-medium">{bookingId}</p>
              </div>
            )}
            <div className="space-y-3">
              <button
                onClick={onViewBookingDetails}
                className="w-full py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                View Booking Details
              </button>
              <button onClick={onReturnHome} className="w-full py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                Return to Home
              </button>
            </div>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="flex justify-center mb-4">
              <XCircle className="h-16 w-16 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
            <p className="text-gray-600 mb-6">
              We couldn't process your payment. Please try again or use a different payment method.
            </p>
            <div className="space-y-3">
              <button onClick={onTryAgain} className="w-full py-2 bg-black text-white rounded-md hover:bg-gray-800">
                Try Again
              </button>
              <button onClick={onReturnHome} className="w-full py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                Return to Home
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default PaymentConfirmationModal