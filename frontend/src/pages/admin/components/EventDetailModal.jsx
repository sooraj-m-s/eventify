import { X, Calendar, MapPin, Tag, Ticket, DollarSign, Users } from "lucide-react"

const EventDetailModal = ({ event, isOpen, onClose, onStatusChange }) => {
  if (!isOpen) return null

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Event Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div>
              {/* Event poster */}
              <div className="mb-6">
                {event.posterImage ? (
                  <img
                    src={event.posterImage || "/placeholder.svg"}
                    alt={event.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">No image available</span>
                  </div>
                )}
              </div>

              {/* Event basic info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{event.title}</h3>

                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{formatDate(event.date)}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{event.location || "No location specified"}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <Tag className="h-4 w-4 mr-2" />
                  <span>{event.category?.categoryName || "Unknown category"}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <DollarSign className="h-4 w-4 mr-2" />
                  <span>${event.pricePerTicket}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <Ticket className="h-4 w-4 mr-2" />
                  <span>
                    {event.ticketsSold} / {event.ticketLimit} tickets sold
                  </span>
                </div>

                <div className="flex items-center text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Hosted by: {event.hostedBy?.full_name || "Unknown"}</span>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-gray-600">{event.description}</p>
              </div>

              {event.cancellationPolicy && (
                <div>
                  <h4 className="font-medium mb-2">Cancellation Policy</h4>
                  <p className="text-gray-600">{event.cancellationPolicy}</p>
                </div>
              )}

              {event.termsAndConditions && (
                <div>
                  <h4 className="font-medium mb-2">Terms and Conditions</h4>
                  <p className="text-gray-600">{event.termsAndConditions}</p>
                </div>
              )}

              {/* Status */}
              <div>
                <h4 className="font-medium mb-2">Status</h4>
                <div className="flex items-center">
                  {event.status ? (
                    <span
                      className={`px-3 py-1 inline-flex text-sm font-medium rounded-full ${
                        event.status === "approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {event.status === "approved" ? "Approved" : "Rejected"}
                    </span>
                  ) : (
                    <span className="px-3 py-1 inline-flex text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  )}
                </div>
              </div>

              {/* Approval/Rejection buttons */}
              {!event.status && !event.statusUpdated && (
                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={() => {
                      onStatusChange(event.id, "approved")
                      onClose()
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Approve Event
                  </button>
                  <button
                    onClick={() => {
                      onStatusChange(event.id, "rejected")
                      onClose()
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Reject Event
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetailModal