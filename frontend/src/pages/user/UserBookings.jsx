import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Calendar, Clock, MapPin, AlertCircle, Eye, Loader, CheckCircle,
    XCircle, RefreshCw, IndianRupee, Download } from "lucide-react"
import { toast } from "sonner"
import BookingDetailsModal from "./components/UserBookingDetailsModal"
import ProfileSidebar from "./components/ProfileSidebar"
import { cancelBooking, downloadTicket, getUserBookings } from "@/api/user"


const UserBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [cancellingId, setCancellingId] = useState(null)
  const [downloadingTickets, setDownloadingTickets] = useState(new Set())
  const navigate = useNavigate()

  useEffect(() => {
    fetchUserBookings()
  }, [])

  const fetchUserBookings = async () => {
    try {
      setLoading(true)
      const response = await getUserBookings();

      if (response.data.success) {
        setBookings(response.data.bookings)
        setError(null)
      } else {
        setError("Failed to load bookings")
      }
    } catch (err) {
      console.error("Error fetching bookings:", err)
      setError("Failed to load bookings. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking)
    setShowModal(true)
  }
  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedBooking(null)
  }

  const handleCancelBooking = async (bookingId) => {
    try {
      setCancellingId(bookingId)
      const response = await cancelBooking(bookingId);

      if (response.data.success) {
        toast.success("Booking cancelled successfully")
        fetchUserBookings()
        setShowModal(false)
      } else {
        toast.error(response.data.error || "Failed to cancel booking")
      }
    } catch (err) {
      console.error("Error cancelling booking:", err)
      toast.error(err.response?.data?.error || "Failed to cancel booking. Please try again later.")
    } finally {
      setCancellingId(null)
    }
  }

  const handleQuickDownload = async (booking, event) => {
    event.stopPropagation()
    try {
      setDownloadingTickets((prev) => new Set(prev).add(booking.booking_id))
      const response = await downloadTicket(booking.booking_id);

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      const contentDisposition = response.headers["content-disposition"]
      let filename = `ticket_${booking.booking_id}.pdf`

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }

      link.setAttribute("download", filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success("Ticket downloaded successfully!")
    } catch (error) {
      console.error("Error downloading ticket:", error)

      if (error.response?.status === 400) {
        toast.error("Cannot download ticket", {
          description: error.response.data?.error || "Ticket download not available",
        })
      } else {
        toast.error("Failed to download ticket", {
          description: "Please try again later",
        })
      }
    } finally {
      setDownloadingTickets((prev) => {
        const newSet = new Set(prev)
        newSet.delete(booking.booking_id)
        return newSet
      })
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }
  const formatTime = (timeStr) => {
    if (!timeStr) return ""
    const [hourStr, minute] = timeStr.split(":")
    let hour = parseInt(hourStr)
    const period = hour >= 12 ? "PM" : "AM"
    hour = hour % 12 || 12
    return `${hour}:${minute} ${period}`
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmed
          </span>
        )
      case "pending":
        return (
          <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        )
      case "cancelled":
        return (
          <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </span>
        )
      case "refunded":
        return (
          <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <RefreshCw className="w-3 h-3 mr-1" />
            Refunded
          </span>
        )
      default:
        return (
          <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        )
    }
  }

  const isBookingCancellable = (booking) => {
    if (booking.payment_status === "cancelled" || booking.is_booking_cancelled) {
      return false
    }

    const eventDate = new Date(booking.event.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return eventDate >= today
  }

  if (loading) {
    return (
      <div className="flex h-screen">
        <ProfileSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader className="h-8 w-8 animate-spin text-gray-500" />
            <p className="mt-2 text-gray-600">Loading your bookings...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen">
        <ProfileSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => fetchUserBookings()}
              className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ProfileSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">My Bookings</h1>
            <button
              onClick={() => fetchUserBookings()}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </button>
          </div>

          {bookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">No Bookings Found</h2>
              <p className="text-gray-600 mb-6">You haven't booked any events yet.</p>
              <button
                onClick={() => navigate("/events")}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                Explore Events
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {bookings.map((booking) => (
                <div key={booking.booking_id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="md:flex">
                    <div className="md:w-1/4">
                      {booking.event.posterImage ? (
                        <img
                          src={booking.event.posterImage || "/placeholder.svg"}
                          alt={booking.event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full min-h-[160px] bg-gray-200 flex items-center justify-center">
                          <Calendar className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-6 md:w-3/4">
                      <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-bold">{booking.event.title}</h2>
                        {getStatusBadge(booking.payment_status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{formatDate(booking.event.date)}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>{formatTime(booking.event.time)}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>{booking.event.location || "Online"}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <IndianRupee className="h-4 w-4 mr-2" />
                            <span>{booking.total_price}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">Booked on {formatDate(booking.booking_date)}</div>
                        <div className="flex gap-2">
                          {/* Quick Download Button */}
                          {booking.can_download_ticket && (
                            <button
                              onClick={(e) => handleQuickDownload(booking, e)}
                              disabled={downloadingTickets.has(booking.booking_id)}
                              className="flex items-center px-3 py-2 bg-green-100 text-green-800 rounded-md hover:bg-green-200 disabled:bg-green-50 disabled:text-green-400 transition-colors"
                            >
                              {downloadingTickets.has(booking.booking_id) ? (
                                <Loader className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </button>
                          )}

                          {/* View Details Button */}
                          <button
                            onClick={() => handleViewBooking(booking)}
                            className="flex items-center px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      {showModal && selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={handleCloseModal}
          onCancel={handleCancelBooking}
          cancellingId={cancellingId}
          isBookingCancellable={isBookingCancellable}
          formatDate={formatDate}
          formatTime={formatTime}
        />
      )}
    </div>
  )
}

export default UserBookings