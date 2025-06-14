import { X, Calendar, IndianRupee, Users, MapPin, Tag } from "lucide-react"
import { format } from "date-fns"


const ViewEventModal = ({ event, onClose }) => {
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return format(date, "MMMM d, yyyy h:mm a")
    } catch (error) {
      return dateString
    }
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Event Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Event Header */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="w-full md:w-1/3">
              <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
                {event.posterImage ? (
                  <img
                    src={event.posterImage || "/placeholder.svg"}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300">
                    <Calendar className="h-12 w-12 text-gray-500" />
                  </div>
                )}
              </div>
            </div>

            <div className="w-full md:w-2/3">
              <h1 className="text-2xl font-bold mb-2">{event.title}</h1>

              <div className="flex items-center text-gray-600 mb-2">
                <Tag className="h-4 w-4 mr-2" />
                <span>{event.category_name || "Uncategorized"}</span>
              </div>

              <div className="flex items-center text-gray-600 mb-2">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{formatDate(`${event.date}T${event.time}`)}</span>
              </div>

              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{event.location || "N/A"}</span>
              </div>

              <div className="flex items-center text-gray-600 mb-2">
                <IndianRupee className="h-4 w-4 mr-2" />
                <span>Price: Rs.{event.pricePerTicket || "0.00"}</span>
              </div>

              <div className="flex items-center text-gray-600 mb-4">
                <Users className="h-4 w-4 mr-2" />
                <span>
                  Tickets: {event.ticketsSold || 0}/{event.ticketLimit || 0}
                </span>
              </div>

              <div className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                {event.is_completed ? "Completed" : "Upcoming"}
              </div>
            </div>
          </div>

          {/* Event Description */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="whitespace-pre-line">{event.description || "No description provided."}</p>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cancellation Policy */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Cancellation Policy</h3>
              <div className="bg-gray-50 p-4 rounded-md h-40 overflow-y-auto">
                {event.cancellationPolicy ? (
                  <p className="whitespace-pre-line">{event.cancellationPolicy}</p>
                ) : (
                  <p className="text-gray-500 italic">No cancellation policy provided.</p>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Terms and Conditions</h3>
              <div className="bg-gray-50 p-4 rounded-md h-40 overflow-y-auto">
                {event.termsAndConditions ? (
                  <p className="whitespace-pre-line">{event.termsAndConditions}</p>
                ) : (
                  <p className="text-gray-500 italic">No terms and conditions provided.</p>
                )}
              </div>
            </div>
          </div>

          {/* Event Stats */}
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">Event Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-md text-center">
                <p className="text-sm text-gray-500">Tickets Sold</p>
                <p className="text-2xl font-bold">{event.ticketsSold || 0}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md text-center">
                <p className="text-sm text-gray-500">Tickets Available</p>
                <p className="text-2xl font-bold">{(event.ticketLimit || 0) - (event.ticketsSold || 0)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md text-center">
                <p className="text-sm text-gray-500">Revenue</p>
                <p className="text-2xl font-bold">
                  Rs.{((event.ticketsSold || 0) * (event.pricePerTicket || 0)).toFixed(2)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md text-center">
                <p className="text-sm text-gray-500">Capacity Filled</p>
                <p className="text-2xl font-bold">
                  {event.ticketLimit ? Math.round(((event.ticketsSold || 0) / event.ticketLimit) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="mt-8 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewEventModal