import { useState, useEffect, useRef } from "react"
import { Calendar, Clock, AlertCircle, Loader, CheckCircle, XCircle, RefreshCw, Search, ChevronLeft,
        ChevronRight, User, Eye, X, Mail, Phone, MapPin, CalendarIcon, IndianRupee, MessageSquare } from "lucide-react"
import OrganizerSidebar from "./components/OrganizerSidebar"
import ChatModal from "@/components/ChatModal"
import { toast } from "sonner"
import { fetchOrganizerBookings, startChatWithUser } from "@/api/organizer"


const OrganizerBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const searchTimeoutRef = useRef(null)
  const [startingChat, setStartingChat] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)
  const [chatRoomId, setChatRoomId] = useState(null)

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 3000)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  useEffect(() => {
    fetchBookings()
  }, [page, selectedEvent, selectedStatus, debouncedSearchQuery])

  const fetchBookings = async () => {
    try {
      setLoading(true)

      let url = `/organizer/organizer-bookings/?page=${page}`
      if (selectedEvent) url += `&event_id=${selectedEvent}`
      if (selectedStatus) url += `&status=${selectedStatus}`
      if (debouncedSearchQuery) url += `&search=${debouncedSearchQuery}`

      const response = await fetchOrganizerBookings(url);

      if (response.data.success) {
        setBookings(response.data.bookings)
        setTotalPages(Math.ceil(response.data.count / 10))
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

  const handleChatWithClient = async (clientUserId) => {
    try {
      setStartingChat(true)
      const response = await startChatWithUser(clientUserId);

      if (response.data) {
        setChatRoomId(response.data.room.room_id)
        setShowChatModal(true)
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

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
  }

  const handleReset = () => {
    setSelectedEvent("")
    setSelectedStatus("")
    setSearchQuery("")
    setDebouncedSearchQuery("")
    setPage(1)
  }

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedBooking(null)
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

  const formatTime = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
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

  if (loading && page === 1) {
    return (
      <div className="flex min-h-screen">
        <OrganizerSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader className="h-8 w-8 animate-spin text-gray-500" />
            <p className="mt-2 text-gray-600">Loading bookings...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && bookings.length === 0) {
    return (
      <div className="flex min-h-screen">
        <OrganizerSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => fetchBookings()}
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
      <OrganizerSidebar />
      <div className="flex-1">
        <div className="p-8 pb-16">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Client Bookings</h1>
              <button
                onClick={() => fetchBookings()}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                    Search Client
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="search"
                      placeholder="Search by name or email"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black pl-10"
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div className="flex items-end space-x-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>

            {/* Results Summary */}

            {loading && (
              <div className="flex justify-center my-4">
                <Loader className="h-6 w-6 animate-spin text-gray-500" />
              </div>
            )}

            {bookings.length === 0 && !loading ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">No Bookings Found</h2>
                <p className="text-gray-600 mb-6">No bookings match your current filters.</p>
                <button onClick={handleReset} className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Client
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Event
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Booking Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Amount
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.map((booking) => (
                      <tr key={booking.booking_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <img
                                src={booking.user.profile_image || "https://res.cloudinary.com/dogt3mael/image/upload/v1754460252/blue-circle-with-white-user_78370-4707_sqk7qc.avif"}
                                alt={booking.user.full_name}
                                className="h-10 w-10 rounded-full object-cover"
                                onError={e => {
                                  e.target.onerror = null;
                                  e.target.src = "https://res.cloudinary.com/dogt3mael/image/upload/v1754460252/blue-circle-with-white-user_78370-4707_sqk7qc.avif";
                                }}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{booking.user.full_name}</div>
                              <div className="text-sm text-gray-500">{booking.user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{booking.event.title}</div>
                          <div className="text-sm text-gray-500">{formatDate(booking.event.date)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(booking.booking_date)}</div>
                          <div className="text-sm text-gray-500">{formatTime(booking.booking_date)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">₹{booking.total_price}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(booking.payment_status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleViewBooking(booking)}
                            className="text-gray-600 hover:text-gray-900"
                            title="View Details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Bottom Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage(1)}
                    disabled={page === 1 || loading}
                    className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm disabled:opacity-50"
                  >
                    First
                  </button>
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1 || loading}
                    className="p-2 rounded-md bg-white border border-gray-300 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show pages around current page
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (page <= 3) {
                      pageNum = i + 1
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = page - 2 + i
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        disabled={loading}
                        className={`px-3 py-1 rounded-md text-sm ${
                          page === pageNum
                            ? "bg-black text-white"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}

                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages || loading}
                    className="p-2 rounded-md bg-white border border-gray-300 disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages || loading}
                    className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm disabled:opacity-50"
                  >
                    Last
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Client Details Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-xl font-bold">Booking Details</h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Client Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 border-b pb-2">Client Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                        <img
                            src={selectedBooking.user.profile_image || "https://res.cloudinary.com/dogt3mael/image/upload/v1754460252/blue-circle-with-white-user_78370-4707_sqk7qc.avif"}
                            alt={selectedBooking.user.full_name}
                            className="h-16 w-16 rounded-full object-cover"
                            onError={e => {
                              e.target.onerror = null;
                              e.target.src = "https://res.cloudinary.com/dogt3mael/image/upload/v1754460252/blue-circle-with-white-user_78370-4707_sqk7qc.avif";
                            }}
                        />
                      </div>
                      <div>
                        <h4 className="text-lg font-medium">{selectedBooking.user.full_name}</h4>
                        <button
                          onClick={() => handleChatWithClient(selectedBooking.user.user_id)}
                          disabled={startingChat}
                          className="mt-2 inline-flex items-center px-3 py-1.5 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {startingChat ? (
                            <>
                              <Loader className="animate-spin h-4 w-4 mr-2" />
                              Starting...
                            </>
                          ) : (
                            <>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Chat with Client
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start">
                        <Mail className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p>{selectedBooking.user.email}</p>
                        </div>
                      </div>

                      {
                        <div className="flex items-start">
                          <Phone className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Mobile</p>
                            <p>{selectedBooking.user.mobile}</p>
                          </div>
                        </div>
                      }

                      <div className="flex items-start">
                        <CalendarIcon className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Member Since</p>
                          <p>{formatDate(selectedBooking.user.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Booking Information */}
                  <h3 className="text-lg font-semibold mt-8 mb-4 border-b pb-2">Booking Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="bg-gray-100 p-2 rounded-md mr-3">
                        <CalendarIcon className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Booking Date</p>
                        <p>
                          {formatDate(selectedBooking.booking_date)} at {formatTime(selectedBooking.booking_date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="bg-gray-100 p-2 rounded-md mr-3">
                        <IndianRupee className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="font-medium">₹{selectedBooking.total_price}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="bg-gray-100 p-2 rounded-md mr-3">
                        <Clock className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <div className="mt-1">{getStatusBadge(selectedBooking.payment_status)}</div>
                      </div>
                    </div>

                    {selectedBooking.payment_id && (
                      <div className="flex items-start">
                        <div className="bg-gray-100 p-2 rounded-md mr-3">
                          <IndianRupee className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Payment ID</p>
                          <p className="font-mono text-sm">{selectedBooking.payment_id}</p>
                        </div>
                      </div>
                    )}

                    {selectedBooking.notes && (
                      <div className="flex items-start">
                        <div className="bg-gray-100 p-2 rounded-md mr-3 mt-0.5">
                          <AlertCircle className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Notes</p>
                          <p className="text-sm">{selectedBooking.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Event Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 border-b pb-2">Event Information</h3>
                  <div className="space-y-4">
                    <img
                      src={selectedBooking.event.posterImage || "https://res.cloudinary.com/dogt3mael/image/upload/v1754464574/digital-transformation-technology-strategy-digitization-and-digitalization-of-business-processes-and-data-optimize-and-automate-operations-customer-service-management-internet-and-cloud-computing-free-photo_fhn8cc.jpg"}
                      alt={selectedBooking.event.title}
                      className="w-full h-48 object-cover rounded-md mb-4"
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src = "https://res.cloudinary.com/dogt3mael/image/upload/v1754464574/digital-transformation-technology-strategy-digitization-and-digitalization-of-business-processes-and-data-optimize-and-automate-operations-customer-service-management-internet-and-cloud-computing-free-photo_fhn8cc.jpg";
                      }}
                    />

                    <h4 className="text-xl font-bold">{selectedBooking.event.title}</h4>

                    <div className="space-y-3">
                      <div className="flex items-center">
                        <CalendarIcon className="h-5 w-5 text-gray-500 mr-3" />
                        <span>{formatDate(selectedBooking.event.date)}</span>
                      </div>

                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-gray-500 mr-3" />
                        <span>{selectedBooking.event.location || "Online"}</span>
                      </div>

                      <div className="flex items-center">
                        <IndianRupee className="h-5 w-5 text-gray-500 mr-3" />
                        <span>₹{selectedBooking.event.pricePerTicket} per ticket</span>
                      </div>

                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-gray-500 mr-3 mt-1" />
                        <div>
                          <p className="font-medium">Description</p>
                          <p className="text-sm text-gray-700 mt-1">
                            {selectedBooking.event.description.length > 200
                              ? `${selectedBooking.event.description.substring(0, 200)}...`
                              : selectedBooking.event.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
      {showChatModal && (
        <ChatModal
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          roomId={chatRoomId}
          otherUser={selectedBooking?.user}
        />
      )}
    </div>
  )
}

export default OrganizerBookings