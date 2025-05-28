import { useState, useEffect, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import axiosInstance from "../../utils/axiosInstance"
import { Search, Filter, ChevronLeft, ChevronRight, Loader, Calendar, MapPin, Users } from "lucide-react"


const AdvancedSearchEvents = () => {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [organizers, setOrganizers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalEvents, setTotalEvents] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrganizer, setSelectedOrganizer] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const searchTimeoutRef = useRef(null)

  const fetchEvents = useCallback(
    async (page = 1, search = searchTerm, organizer = selectedOrganizer) => {
      try {
        setLoading(true)

        const params = new URLSearchParams()
        params.append("page", page)

        if (search) {
          params.append("search", search)
        }
        if (organizer) {
          params.append("organizer", organizer)
        }

        const response = await axiosInstance.get(`/events/?${params.toString()}`)

        if (response.data) {
          setEvents(response.data.events || [])
          setOrganizers(response.data.organizers || [])
          setTotalEvents(response.data.count || 0)

          const pageSize = 10
          setTotalPages(Math.ceil((response.data.count || 0) / pageSize))

          setError(null)
        }
      } catch (err) {
        console.error("Error fetching events:", err)
        setError("Failed to load events. Please try again later.")
        setEvents([])
      } finally {
        setLoading(false)
      }
    },
    [searchTerm, selectedOrganizer],
  )

  useEffect(() => {
    fetchEvents(1)
  }, [])

  const handleSearch = (value) => {
    setSearchTerm(value)
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1)
      fetchEvents(1, value, selectedOrganizer)
    }, 3000)
  }

  const handleOrganizerChange = (organizerId) => {
    setSelectedOrganizer(organizerId)
    setCurrentPage(1)
    fetchEvents(1, searchTerm, organizerId)
  }
  const handlePageChange = (page) => {
    setCurrentPage(page)
    fetchEvents(page, searchTerm, selectedOrganizer)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  const handleEventClick = (eventId) => {
    navigate(`/event_detial/${eventId}`)
  }
  const clearFilters = () => {
    setSearchTerm("")
    setSelectedOrganizer("")
    setCurrentPage(1)
    fetchEvents(1, "", "")
  }

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Discover Events</h1>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search events..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Filter size={18} />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>

          {/* Clear Filters Button */}
          {(searchTerm || selectedOrganizer) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by Organizer</h3>
            <div className="flex flex-wrap gap-2">
              {organizers.map((organizer) => (
                <button
                  key={organizer.user_id}
                  onClick={() => handleOrganizerChange(organizer.user_id)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    selectedOrganizer === organizer.user_id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {organizer.full_name}
                </button>
              ))}
              {organizers.length === 0 && <p className="text-sm text-gray-500">No organizers available</p>}
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="h-8 w-8 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-600">Loading events...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 mb-4">{error}</p>
          <button
            onClick={() => fetchEvents(currentPage)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* No Results */}
      {!loading && !error && events.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No events found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedOrganizer
              ? "Try adjusting your filters to find more events"
              : "There are no upcoming events at the moment"}
          </p>
          {(searchTerm || selectedOrganizer) && (
            <button onClick={clearFilters} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Events Grid */}
      {!loading && !error && events.length > 0 && (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Showing {events.length} of {totalEvents} events
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {events.map((event) => (
              <div
                key={event.eventId}
                onClick={() => handleEventClick(event.eventId)}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={event.posterImage || `/placeholder.svg?height=200&width=300&query=event`}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <p className="text-white text-sm font-medium">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">{event.title}</h3>

                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin size={16} className="mr-1 flex-shrink-0" />
                    <span className="truncate">{event.location || "Online"}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <Users size={16} className="mr-1 flex-shrink-0" />
                    <span className="truncate">{event.organizer_name}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-bold text-blue-600">₹{event.pricePerTicket}</span>
                    <span className="text-sm text-gray-500">{event.tickets_available} tickets left</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Logic to show 5 page numbers with current page in the middle when possible
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 flex items-center justify-center rounded-md ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="px-1">...</span>
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 hover:bg-gray-100"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AdvancedSearchEvents