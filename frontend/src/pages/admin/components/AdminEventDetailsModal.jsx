import { useState } from "react"
import { Calendar, AlertCircle, Loader, X, CalendarIcon, MapPin, User, Users,
        ToggleLeft, ToggleRight, Phone, IndianRupee } from "lucide-react"
import axiosInstance from "@/utils/axiosInstance"
import { toast } from "sonner"


const AdminEventDetailsModal = ({ event, onClose, onEventUpdated }) => {
  const [updatingHoldStatus, setUpdatingHoldStatus] = useState(false)
  const [currentEvent, setCurrentEvent] = useState(event)

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const toggleHoldStatus = async () => {
    if (updatingHoldStatus) return

    try {
      setUpdatingHoldStatus(true)

      const response = await axiosInstance.patch(`/admin/toggle_hold/${currentEvent.eventId}/`)

      if (response.data.success) {
        toast.success(response.data.message)

        const updatedEvent = {
          ...currentEvent,
          on_hold: !currentEvent.on_hold,
        }

        setCurrentEvent(updatedEvent)
        if (onEventUpdated) {
          onEventUpdated(updatedEvent)
        }
      } else {
        toast.error("Failed to update event status")
      }
    } catch (err) {
      console.error("Error toggling hold status:", err)
      toast.error("Failed to update event status")
    } finally {
      setUpdatingHoldStatus(false)
    }
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-bold">Event Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Event Information */}
            <div>
              <div className="mb-6">
                {currentEvent.posterImage ? (
                  <img
                    src={currentEvent.posterImage || "/placeholder.svg"}
                    alt={currentEvent.title}
                    className="w-full h-48 object-cover rounded-md"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-md">
                    <Calendar className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold mb-4">{currentEvent.title}</h3>

              <div className="space-y-4">
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-gray-500 mr-3" />
                  <span>{formatDate(currentEvent.date)}</span>
                </div>

                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-500 mr-3" />
                  <span>{currentEvent.location || "Online"}</span>
                </div>

                <div className="flex items-center">
                  <IndianRupee className="h-5 w-5 text-gray-500 mr-3" />
                  <span>₹{currentEvent.pricePerTicket} per ticket</span>
                </div>

                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-500 mr-3" />
                  <span>
                    {currentEvent.ticketsSold} / {currentEvent.ticketLimit} tickets sold
                  </span>
                </div>

                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-gray-500 mr-3 mt-1" />
                  <div>
                    <p className="font-medium">Description</p>
                    <p className="text-sm text-gray-700 mt-1">{currentEvent.description}</p>
                  </div>
                </div>

                {/* Hold Status Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md mt-4">
                  <div>
                    <p className="font-medium">Event Status</p>
                    <p className="text-sm text-gray-600">
                      {currentEvent.on_hold ? "This event is currently on hold" : "This event is currently active"}
                    </p>
                  </div>
                  <button
                    onClick={toggleHoldStatus}
                    disabled={updatingHoldStatus}
                    className="flex items-center text-gray-700 hover:text-gray-900"
                  >
                    {updatingHoldStatus ? (
                      <Loader className="h-5 w-5 animate-spin" />
                    ) : currentEvent.on_hold ? (
                      <ToggleLeft className="h-8 w-8 text-gray-400" />
                    ) : (
                      <ToggleRight className="h-8 w-8 text-green-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Organizer Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 border-b pb-2">Organizer Information</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                    {currentEvent.hostedBy.profile_image ? (
                      <img
                        src={currentEvent.hostedBy.profile_image || "/placeholder.svg"}
                        alt={currentEvent.hostedBy.full_name}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-medium">{currentEvent.hostedBy.full_name}</h4>
                    <p className="text-gray-500">{currentEvent.hostedBy.email}</p>
                  </div>
                </div>

                {currentEvent.hostedBy.mobile && (
                  <div className="flex items-start">
                    <div className="bg-gray-100 p-2 rounded-md mr-3">
                      <Phone className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p>{currentEvent.hostedBy.mobile}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start">
                  <div className="bg-gray-100 p-2 rounded-md mr-3">
                    <CalendarIcon className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p>{formatDate(currentEvent.hostedBy.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Additional Event Details */}
              {(currentEvent.cancellationPolicy || currentEvent.termsAndConditions) && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4 border-b pb-2">Additional Information</h3>

                  {currentEvent.cancellationPolicy && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Cancellation Policy</h4>
                      <p className="text-sm text-gray-700">{currentEvent.cancellationPolicy}</p>
                    </div>
                  )}

                  {currentEvent.termsAndConditions && (
                    <div>
                      <h4 className="font-medium mb-2">Terms and Conditions</h4>
                      <p className="text-sm text-gray-700">{currentEvent.termsAndConditions}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminEventDetailsModal