import { Calendar, CheckCircle, AlertCircle, IndianRupee, User, X } from "lucide-react"


const EventDetailsModal = ({ event, onClose, onSettleEvent }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Event Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-4">
                {event.posterImage ? (
                  <img
                    src={event.posterImage || "/placeholder.svg"}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Calendar className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold mb-2">{event.title}</h3>
              <p className="text-gray-600 mb-4">{event.location || "No location specified"}</p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                  <span>{formatDate(event.date)}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-lg mb-2">Organizer</h4>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                  {event.hostedBy?.profile_image ? (
                    <img
                      src={event.hostedBy.profile_image || "/placeholder.svg"}
                      alt={event.hostedBy.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <p className="font-medium">{event.hostedBy?.full_name}</p>
                  <p className="text-sm text-gray-500">{event.hostedBy?.email}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4">
                <h4 className="font-medium text-lg mb-2">Event Stats</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Price per Ticket</p>
                    <p className="text-lg font-semibold">₹{event.pricePerTicket}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Tickets Sold</p>
                    <p className="text-lg font-semibold">
                      {event.ticketsSold} / {event.ticketLimit}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-lg mb-2">Settlement Status</h4>
                {event.is_settled_to_organizer ? (
                  <div className="bg-green-50 text-green-800 p-3 rounded-lg flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span>Settled to organizer</span>
                  </div>
                ) : (
                  <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <span>Not settled yet</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <h4 className="font-medium text-lg mb-2">Description</h4>
            <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
          </div>

          {!event.is_settled_to_organizer && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={onSettleEvent}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
              >
                <IndianRupee className="h-5 w-5 mr-2" />
                Settle Event
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EventDetailsModal