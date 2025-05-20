import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { createPaymentIntent } from "../services/paymentService"
import StripePaymentForm from "./StripePaymentForm"
import { Loader } from "lucide-react"


let stripePromise = null

const PaymentWrapper = ({ bookingId, onPaymentSuccess, onPaymentError }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [paymentData, setPaymentData] = useState(null)
  const [customerName, setCustomerName] = useState("")

  useEffect(() => {
    const initializePayment = async () => {
      try {
        setLoading(true)
        const data = await createPaymentIntent(bookingId, customerName)

        if (!stripePromise) {
          stripePromise = loadStripe(data.publishableKey)
        }

        setPaymentData(data)
        setError(null)
      } catch (err) {
        console.error("Failed to initialize payment:", err)
        setError(err.response?.data?.error || "Failed to initialize payment. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (bookingId) {
      initializePayment()
    }
  }, [bookingId])

  const handleNameChange = (name) => {
    setCustomerName(name)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader className="h-8 w-8 animate-spin text-gray-500" />
        <p className="mt-2 text-gray-600">Initializing payment...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
        <p className="font-medium">Payment Error</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    )
  }

  if (!paymentData || !paymentData.clientSecret) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700">
        <p>Unable to initialize payment. Please try again later.</p>
      </div>
    )
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret: paymentData.clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#0070f3",
            colorBackground: "#ffffff",
            colorText: "#1f2937",
            colorDanger: "#ef4444",
            fontFamily: "system-ui, sans-serif",
            borderRadius: "6px",
          },
        },
      }}
    >
      <StripePaymentForm
        clientSecret={paymentData.clientSecret}
        amount={paymentData.amount}
        currency={paymentData.currency}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
        customerName={customerName}
        onNameChange={handleNameChange}
        bookingId={bookingId}
      />
    </Elements>
  )
}

export default PaymentWrapper