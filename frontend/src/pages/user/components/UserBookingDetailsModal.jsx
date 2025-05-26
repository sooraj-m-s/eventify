import { X, Calendar, Clock, MapPin, FileText, Loader, MessageSquare } from "lucide-react"
import { useState } from "react"
import CancellationConfirmationModal from "./CancellationConfirmationModal"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import axiosInstance from "@/utils/axiosInstance"


const UserBookingDetailsModal = ({
  booking,
  onClose,
  onCancel,
  cancellingId,
  isBookingCancellable,
  formatDate,
  formatTime,
}) => {
  const [showCancellationModal, setShowCancellationModal] = useState(false)
  const [startingChat, setStartingChat] = useState(false)
  const navigate = useNavigate()

  const handleCancelClick = () => {
    setShowCancellationModal(true)
  }
  const handleConfirmCancel = () => {
    onCancel(booking.booking_id)
    setShowCancellationModal(false)
  }
  const handleCancelModal = () => {
    setShowCancellationModal(false)
  }

  const handleChatWithOrganizer = async () => {
    try {
      setStartingChat(true)

      const response = await axiosInstance.post("/chat/start/", {
        user_id: booking.event.hostedBy,
      })

      if (response.data) {
        onClose()
        navigate(`/messages?room=${response.data.room.room_id}`)
      }
    } catch (error) {
      console.error("Error starting chat:", error)
      toast.error("Failed to start chat", {
        description: "Please try again later",
      })
    } finally {
      setStartingChat(false)
    }
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Booking Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Event Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Event Information</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div className="flex items-center">
                  {booking.event.posterImage ? (
                    <img
                      src={booking.event.posterImage || "/placeholder.svg"}
                      alt={booking.event.title}
                      className="w-16 h-16 object-cover rounded-md mr-4"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center mr-4">
                      <Calendar className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium">{booking.event.title}</h4>
                    <p className="text-sm text-gray-600">{booking.event.category_name}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                    <span>{formatDate(booking.event.date)}</span>
                  </div>

                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-500 mr-2" />
                    <span>Event Time: {formatTime(booking.event.date)}</span>
                  </div>

                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                    <span>{booking.event.location || "Online"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium mb-3">Event Organizer</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                    </div>
                    
                    {/* Chat Button */}
                    <button
                      onClick={handleChatWithOrganizer}
                      disabled={startingChat}
                      className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {startingChat ? (
                        <>
                          <Loader className="animate-spin h-4 w-4 mr-2" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Chat
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {booking.event.description && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Event Description</h4>
                  <p className="text-sm text-gray-700">{booking.event.description}</p>
                </div>
              )}
            </div>

            {/* Booking Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Booking Information</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking ID:</span>
                  <span className="font-medium">{booking.booking_id}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Name:</span>
                  <span className="font-medium">{booking.booking_name}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Date:</span>
                  <span className="font-medium">{formatDate(booking.booking_date)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Time:</span>
                  <span className="font-medium">{formatTime(booking.booking_date)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Total Price:</span>
                  <span className="font-medium">₹{booking.total_price}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <span
                    className={`font-medium ${
                      booking.payment_status === "confirmed"
                        ? "text-green-600"
                        : booking.payment_status === "cancelled"
                          ? "text-red-600"
                          : booking.payment_status === "pending"
                            ? "text-yellow-600"
                            : "text-blue-600"
                    }`}
                  >
                    {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                  </span>
                </div>

                {booking.payment_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment ID:</span>
                    <span className="font-medium">{booking.payment_id}</span>
                  </div>
                )}

                {booking.notes && (
                  <div className="pt-2 border-t">
                    <div className="flex items-start">
                      <FileText className="h-4 w-4 text-gray-500 mr-2 mt-1" />
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Notes:</p>
                        <p className="text-sm">{booking.notes}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-6 space-y-4">
                {isBookingCancellable(booking) ? (
                  <button
                    onClick={handleCancelClick}
                    disabled={cancellingId === booking.booking_id}
                    className="w-full py-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300 flex items-center justify-center"
                  >
                    {cancellingId === booking.booking_id ? (
                      <>
                        <Loader className="animate-spin h-4 w-4 mr-2" />
                        Cancelling...
                      </>
                    ) : (
                      "Cancel Booking"
                    )}
                  </button>
                ) : (
                  booking.payment_status === "cancelled" && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 text-center text-red-800">
                      This booking has been cancelled
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Cancellation Confirmation Modal */}
      {showCancellationModal && (
        <CancellationConfirmationModal
          booking={booking}
          onConfirm={handleConfirmCancel}
          onCancel={handleCancelModal}
          isLoading={cancellingId === booking.booking_id}
        />
      )}
    </div>
  )
}

export default UserBookingDetailsModal