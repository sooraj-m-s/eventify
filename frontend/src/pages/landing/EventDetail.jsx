import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Calendar, Clock, MapPin, User, Loader, IndianRupee } from "lucide-react"
import { useSelector } from "react-redux"
import BookingModal from "@/components/home/BookingModal"
import { getEventDetails } from "@/api/user"


const EventDetail = () => {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [host, setHost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const user = useSelector((state) => state.auth.user)

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true)
        const response = await getEventDetails(eventId)
        
        setHost(response.data.host)
        setEvent(response.data.data)
        setError(null)
      } catch (err) {
        console.error("Error fetching event details:", err)
        setError("Failed to load event details. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (eventId) {
      fetchEventDetails()
    }
  }, [eventId])

  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast.info("Please login to book tickets")
      navigate("/login", { state: { from: `/events/event_detail/${eventId}` } })
      return
    }
    setShowBookingModal(true)
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return format(date, "MMMM d, yyyy h:mm a")
    } catch (error) {
      return dateString
    }
  }
  const formatTime = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getGoogleMapUrl = (location) => {
    if (!location || location.includes("Online") || location.includes("Zoom")) {
      return null
    }
    const encodedLocation = encodeURIComponent(location)
    return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodedLocation}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader className="h-8 w-8 animate-spin text-gray-500" />
          <p className="mt-2 text-gray-600">Loading event details...</p>
        </div>
      </div>
    )
  }

  if (error) {
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

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Event Not Found</h2>
          <p className="text-gray-600">The event you're looking for doesn't exist or has been removed.</p>
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

  const ticketsAvailable = (event.ticketLimit || 500) - (event.ticketsSold || 0)
  const location = event.location || "N/A"
  const pricePerTicket = event.pricePerTicket || 50
  const mapUrl = getGoogleMapUrl(location)
  const isOnlineEvent = !mapUrl

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6 md:px-12 lg:px-24 max-w-7xl">
        <h1 className="text-3xl font-bold mb-8">Event Details</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Event Image */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {event.posterImage ? (
                <img
                  src={event.posterImage || "/placeholder.svg"}
                  alt={event.title}
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                  <Calendar className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Middle Column - Event Details */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-1">{event.title || "N/A"}</h2>

              <div className="space-y-4 mb-6">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-500 mr-3" />
                  <span>{formatDate(event.date) || "September 10, 2025"}</span>
                </div>

                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-500 mr-3" />
                  <span>
                    {formatTime(`${event.date}T${event.time}`)}
                  </span>
                </div>

                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-500 mr-3" />
                  <span>{location}</span>
                </div>

                <div className="flex items-center">
                  <IndianRupee className="h-5 w-5 text-gray-500 mr-3" />
                  <span>
                    {pricePerTicket} per ticket ({ticketsAvailable} tickets available)
                  </span>
                </div>

                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-500 mr-3" />
                  <span>Hosted by {host.full_name || "Event Organizer"}</span>
                </div>
              </div>

              <button
                onClick={handleBookNow}
                disabled={ticketsAvailable <= 0}
                className="w-full py-3 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {ticketsAvailable <= 0 ? "Sold Out" : "Book Now"}
              </button>
            </div>
          </div>
        </div>

        {/* About The Event */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold mb-4">About The Event</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 text-sm">Registration Fee</p>
                  <p className="font-medium">₹{pricePerTicket}</p>
                </div>

                <div>
                  <p className="text-gray-600 text-sm">Date</p>
                  <p className="font-medium">
                    {formatDate(event.date) || "September 10, 2025"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600 text-sm">Venue</p>
                  <p className="font-medium">{location}</p>
                </div>

                <div>
                  <p className="text-gray-600 text-sm">Contact</p>
                  <p className="font-medium flex items-center">
                    <span className="mr-2">{host.phone_number}</span>
                  </p>
                  <p className="text-sm text-gray-500">{host.email}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h3 className="text-xl font-bold mb-4">Host Information</h3>
              <p className="text-gray-700">
                {host.full_name || "The organizer"} is organizing this event. For any queries, please
                contact them directly.
              </p>
            </div>
          </div>

          <div className="md:col-span-2">
            {/* Map */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden h-80">
              {isOnlineEvent ? (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <div className="text-center p-6">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700">Online Event</h3>
                    <p className="text-gray-500 mt-2">This is a virtual event hosted on Zoom.</p>
                    <p className="text-gray-500 mt-1">Meeting details will be shared after registration.</p>
                  </div>
                </div>
              ) : (
                <iframe
                  title="Event Location"
                  className="w-full h-full border-0"
                  src={mapUrl}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              )}
            </div>

            {/* Book Tickets Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h3 className="text-xl font-bold mb-4">Book Your Tickets</h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-600">Total Price</p>
                  <p className="text-xl font-bold">₹{pricePerTicket}</p>
                </div>
                <button
                  onClick={handleBookNow}
                  disabled={ticketsAvailable <= 0}
                  className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Proceed With Booking
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Organizer Info */}
        <div className="mt-8 bg-gray-900 text-white rounded-lg p-6">
          <h3 className="text-xl font-bold mb-2">
            Organized by {host.full_name || "Event Organizer"}
          </h3>
          <p className="text-gray-300">
            For any queries regarding this event, please contact the organizer at {host.email || 'N/A'} or {host.phone_number || 'N/A'}.
          </p>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && <BookingModal event={event} onClose={() => setShowBookingModal(false)} user={user} />}
    </div>
  )
}

export default EventDetail