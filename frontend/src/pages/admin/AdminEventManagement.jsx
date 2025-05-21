import { useState, useEffect, useRef } from "react"
import { Calendar, Clock, AlertCircle, Loader, CheckCircle, XCircle, Search,
        ChevronLeft, ChevronRight, Eye, User } from "lucide-react"
import axiosInstance from "@/utils/axiosInstance"
import AdminEventDetailsModal from "./components/AdminEventDetailsModal"
import Sidebar from "./components/Sidebar"


const AdminEventManagement = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedOrganizer, setSelectedOrganizer] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalEvents, setTotalEvents] = useState(0)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const searchInputRef = useRef(null)
  const searchTimeoutRef = useRef(null)

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  useEffect(() => {
    fetchEvents()
  }, [page, selectedOrganizer, selectedStatus, debouncedSearchQuery])

  const fetchEvents = async () => {
    try {
      setLoading(true)

      let url = `/admin/events/?page=${page}`
      if (selectedOrganizer) url += `&organizer_id=${selectedOrganizer}`
      if (selectedStatus) url += `&status=${selectedStatus}`
      if (debouncedSearchQuery) url += `&search=${debouncedSearchQuery}`

      const response = await axiosInstance.get(url)
      
      if (response.data.success) {
        setEvents(response.data.events || [])
        setTotalEvents(response.data.count || 0)
        setTotalPages(Math.ceil((response.data.count || 0) / 10))
        setError(null)
      } else {
        setError("Failed to load events")
      }
    } catch (err) {
      console.error("Error fetching events:", err)
      setError("Failed to load events. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
  }

  const handleReset = () => {
    setSelectedOrganizer("")
    setSelectedStatus("")
    setSearchQuery("")
    setPage(1)
  }

  const handleViewEvent = (event) => {
    setSelectedEvent(event)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedEvent(null)
  }

  const handleEventUpdated = (updatedEvent) => {
    setEvents(events.map((event) => (event.eventId === updatedEvent.eventId ? updatedEvent : event)))
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

  const getStatusBadge = (event) => {
    if (event.on_hold) {
      return (
        <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          On Hold
        </span>
      )
    } else if (event.is_completed) {
      return (
        <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </span>
      )
    } else {
      const eventDate = new Date(event.date)
      const today = new Date()

      if (eventDate < today) {
        return (
          <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <XCircle className="w-3 h-3 mr-1" />
            Expired
          </span>
        )
      } else {
        return (
          <span className="flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </span>
        )
      }
    }
  }

  if (loading && page === 1) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader className="h-8 w-8 animate-spin text-gray-500" />
            <p className="mt-2 text-gray-600">Loading events...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && events.length === 0) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => fetchEvents()}
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
      <Sidebar />
      <div className="flex-1">
        <div className="p-8 pb-16">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Event Management</h1>
              <button
                onClick={() => fetchEvents()}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <Clock className="h-4 w-4 mr-1" />
                Refresh
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    <option value="active">Active</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                    Search Event
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="search"
                      placeholder="Search by title or location"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      ref={searchInputRef}
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
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">
                Showing {events.length} of {totalEvents} events
              </p>

              {/* Pagination */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1 || loading}
                  className="p-2 rounded-md bg-white border border-gray-300 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm">
                  Page {page} of {totalPages || 1}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages || loading}
                  className="p-2 rounded-md bg-white border border-gray-300 disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {loading && (
              <div className="flex justify-center my-4">
                <Loader className="h-6 w-6 animate-spin text-gray-500" />
              </div>
            )}

            {events.length === 0 && !loading ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">No Events Found</h2>
                <p className="text-gray-600 mb-6">No events match your current filters.</p>
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
                        Event
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Organizer
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Tickets
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
                    {events.map((event) => (
                      <tr key={event.eventId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md overflow-hidden">
                              {event.posterImage ? (
                                <img
                                  src={event.posterImage || "/placeholder.svg"}
                                  alt={event.title}
                                  className="h-10 w-10 object-cover"
                                />
                              ) : (
                                <Calendar className="h-5 w-5 m-2.5 text-gray-500" />
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{event.title}</div>
                              <div className="text-sm text-gray-500">{event.location || "Online"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                              {event.hostedBy.profile_image ? (
                                <img
                                  src={event.hostedBy.profile_image || "/placeholder.svg"}
                                  alt={event.hostedBy.full_name}
                                  className="h-8 w-8 rounded-full object-cover"
                                />
                              ) : (
                                <User className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{event.hostedBy.full_name}</div>
                              <div className="text-sm text-gray-500">{event.hostedBy.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(event.date)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {event.ticketsSold} / {event.ticketLimit}
                          </div>
                          <div className="text-sm text-gray-500">₹{event.pricePerTicket} per ticket</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(event)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleViewEvent(event)}
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

      {/* Event Details Modal */}
      {showModal && selectedEvent && (
        <AdminEventDetailsModal event={selectedEvent} onClose={handleCloseModal} onEventUpdated={handleEventUpdated} />
      )}
    </div>
  )
}

export default AdminEventManagement