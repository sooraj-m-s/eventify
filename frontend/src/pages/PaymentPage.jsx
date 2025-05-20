import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { toast } from "sonner"
import PaymentWrapper from "../components/PaymentWrapper"
import { getPaymentStatus } from "../services/paymentService"
import axiosInstance from "../utils/axiosInstance"
import { Loader } from "lucide-react"
import PaymentConfirmationModal from "./PaymentConfirmationPage"


const PaymentPage = () => {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [bookingDetails, setBookingDetails] = useState(null)
  const [error, setError] = useState(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState("processing")
  const searchParams = new URLSearchParams(location.search)
  const paymentIntent = searchParams.get("payment_intent")
  const redirectStatus = searchParams.get("redirect_status")

  useEffect(() => {
    if (paymentIntent && redirectStatus) {
      setShowConfirmation(true)

      if (redirectStatus === "succeeded") {
        setPaymentStatus("success")
      } else if (redirectStatus === "failed") {
        setPaymentStatus("failed")
      } else {
        checkPaymentStatusFromAPI(paymentIntent)
      }
    }
  }, [paymentIntent, redirectStatus])

  const checkPaymentStatusFromAPI = async (paymentIntentId) => {
    try {
      const response = await axiosInstance.get(`/payments/check_status/?payment_intent=${paymentIntentId}`)

      if (response.data.status === "completed" || response.data.status === "succeeded") {
        setPaymentStatus("success")
      } else if (response.data.status === "failed") {
        setPaymentStatus("failed")
      } else {
        setTimeout(() => checkPaymentStatusFromAPI(paymentIntentId), 2000)
      }
    } catch (error) {
      console.error("Error checking payment status:", error)
      setPaymentStatus("failed")
    }
  }

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true)
        const paymentStatus = await getPaymentStatus(bookingId)

        if (paymentStatus.status === "completed") {
          toast.success("Payment already completed for this booking")
          setPaymentStatus("success")
          setShowConfirmation(true)
          return
        }

        const response = await axiosInstance.get(`/booking/detail/${bookingId}/`)
        const data = response.data

        if (!data) {
          throw new Error("Booking not found")
        }

        setBookingDetails(data)
      } catch (err) {
        console.error("Error fetching booking details:", err)
        setError(err.message || "Failed to load booking details")
      } finally {
        setLoading(false)
      }
    }

    if (bookingId) {
      fetchBookingDetails()
    }
  }, [bookingId])

  const handlePaymentSuccess = (paymentIntent) => {
    toast.success("Payment successful!")
    setPaymentStatus("success")
    setShowConfirmation(true)
  }

  const handlePaymentError = (error) => {
    toast.error(error.message || "Payment failed. Please try again.")
    setPaymentStatus("failed")
    setShowConfirmation(true)
  }

  const handleViewBookingDetails = () => {
    navigate("/bookings")
  }

  const handleReturnHome = () => {
    navigate("/")
  }

  const handleTryAgain = () => {
    setShowConfirmation(false)
    window.location.reload()
  }

  if (loading && !showConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader className="h-8 w-8 animate-spin text-gray-500" />
          <p className="mt-2 text-gray-600">Loading payment details...</p>
        </div>
      </div>
    )
  }

  if (error && !showConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!bookingDetails && !showConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Booking Not Found</h2>
          <p className="text-gray-600">The booking you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {showConfirmation && (
        <PaymentConfirmationModal
          status={paymentStatus}
          bookingId={bookingId}
          onViewBookingDetails={handleViewBookingDetails}
          onReturnHome={handleReturnHome}
          onTryAgain={handleTryAgain}
        />
      )}

      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Complete Your Payment</h1>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Booking Summary */}
          {bookingDetails && (
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Event:</span>
                  <span className="font-medium">{bookingDetails.event.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{new Date(bookingDetails.event.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{new Date(bookingDetails.event.date).toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Venue:</span>
                  <span className="font-medium">{bookingDetails.event.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">₹{bookingDetails.total_price}</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Form */}
          <div className="p-6">
            <PaymentWrapper
              bookingId={bookingId}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Your payment is processed securely by Stripe. We do not store your card details.</p>
        </div>
      </div>
    </div>
  )
}

export default PaymentPage