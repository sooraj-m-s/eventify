import { useState } from "react"
import { X, Calendar, Clock, MapPin, Loader } from "lucide-react"
import { toast } from "sonner"
import axiosInstance from "@/utils/axiosInstance"
import { useNavigate } from "react-router-dom"


const BookingModal = ({ event, onClose, user }) => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [bookingName, setBookingName] = useState("")
  const [notes, setNotes] = useState("")

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  function handleBooking() {
    try {
      setLoading(true)
      axiosInstance
        .post("/booking/book/", {
          event_id: event.eventId,
          booking_name: bookingName.trim() || null,
          notes: notes,
        })
        .then((response) => {
          const bookingId = response.data.booking.booking_id
          toast.success("Booking created! Redirecting to payment...")
          navigate(`/payment/${bookingId}`)
        })
        .catch((error) => {
          console.error("Booking error:", error)
          toast.error(error.response?.data?.error || "Failed to book tickets. Please try again.")
          setLoading(false)
        })
    } catch (error) {
      console.error("Booking error:", error)
      toast.error("Failed to book tickets. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Book Tickets</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event Details */}
            <div>
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-20 h-20 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                  {event.posterImage ? (
                    <img
                      src={event.posterImage || "/placeholder.svg"}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Calendar className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{event.title}</h3>
                  <p className="text-gray-600">{event.category_name}</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-500 mr-3" />
                  <span>{formatDate(event.date)}</span>
                </div>

                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-500 mr-3" />
                  <span>
                    {formatTime(event.date)} - {event.endTime || "1:00 PM"}
                  </span>
                </div>

                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-500 mr-3" />
                  <span>{event.location || "Online"}</span>
                </div>
              </div>

              <div className="mt-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="bookingName" className="block text-sm font-medium text-gray-700 mb-1">
                      Booking Name
                    </label>
                    <input
                      id="bookingName"
                      type="text"
                      onChange={(e) => setBookingName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                      placeholder={user?.full_name || "Enter booking name"}
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty to use your account name</p>
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                      Special Requests or Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                      placeholder="Any special requests or notes for the organizer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-6">Order Summary</h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span>1 ticket × ₹{event.pricePerTicket}</span>
                    <span>₹{1 * event.pricePerTicket}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Fee</span>
                    <span>₹0</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between font-bold">
                    <span>Total</span>
                    <span>₹{event.pricePerTicket}</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 space-y-1 mb-6">
                  <p>* All prices are inclusive of taxes</p>
                  <p>* {event.termsAndConditions}</p>
                  <p>* Cancellation: {event.cancellationAvailable ? "Available" : "Not Available"}</p>
                </div>

                <h4 className="text-lg font-bold mb-4">Complete Your Payment</h4>

                <button
                  onClick={handleBooking}
                  disabled={loading}
                  className="w-full py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>Proceed to Payment</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingModal