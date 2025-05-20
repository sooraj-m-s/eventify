import axiosInstance from "@/utils/axiosInstance"


export const createPaymentIntent = async (bookingId) => {
  try {
    const response = await axiosInstance.post("/payments/create_payment_intent/", {
      booking_id: bookingId,
    })
    return response.data
  } catch (error) {
    console.error("Error creating payment intent:", error)
    throw error
  }
}

export const getPaymentStatus = async (bookingId) => {
  try {
    const response = await axiosInstance.get(`/payments/payment_status/${bookingId}/`)
    return response.data
  } catch (error) {
    console.error("Error getting payment status:", error)
    throw error
  }
}