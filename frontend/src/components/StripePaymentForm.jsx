import { useState } from "react"
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js"
import { Loader } from "lucide-react"


const StripePaymentForm = ({
  amount,
  currency,
  onPaymentSuccess,
  onPaymentError,
  bookingId,
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }
    setIsLoading(true)
    setErrorMessage("")

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {return_url: `${window.location.origin}/payment/${bookingId || ""}`},
        redirect: "if_required",
      })

      if (error) {
        setErrorMessage(error.message || "An error occurred during payment processing.")
        onPaymentError && onPaymentError(error)
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        onPaymentSuccess && onPaymentSuccess(paymentIntent)
      } else {
        if (paymentIntent) {
          if (paymentIntent.status === "requires_action") {
            setErrorMessage("Your payment requires additional authentication.")
          } else if (paymentIntent.status === "processing") {
            setErrorMessage("Your payment is processing.")
          }
        }
      }
    } catch (err) {
      console.error("Payment error:", err)
      setErrorMessage("An unexpected error occurred.")
      onPaymentError && onPaymentError(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Payment Details</h3>
        <p className="text-sm text-gray-600 mb-4">
          Amount: {new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount)}
        </p>
      </div>

      <div className="space-y-4">
        <PaymentElement />
      </div>

      {errorMessage && <div className="text-red-500 text-sm mt-2">{errorMessage}</div>}

      <button
        type="submit"
        disabled={isLoading || !stripe || !elements}
        className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <Loader className="animate-spin h-4 w-4 mr-2" />
            Processing...
          </>
        ) : (
          `Pay ${new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount)}`
        )}
      </button>
    </form>
  )
}

export default StripePaymentForm