import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Calendar, Plus, Edit, Eye, ChevronLeft, ChevronRight, Filter, Loader } from "lucide-react"
import OrganizerSidebar from "./components/OrganizerSidebar"
import AddEventModal from "./components/AddEventModal"
import EditEventModal from "./components/EditEventModal"
import ViewEventModal from "./components/ViewEventModal"
import { format } from "date-fns"
import { fetchOrganizerEvents } from "@/api/organizer"


const OrganizerEventManagement = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalEvents, setTotalEvents] = useState(0)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [filterCompleted, setFilterCompleted] = useState(null)

  useEffect(() => {
    fetchEvents()
  }, [currentPage, filterCompleted])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const response = await fetchOrganizerEvents(currentPage, filterCompleted);
      let eventsData = []

      if (response.data.results && response.data.results.events) {
        eventsData = response.data.results.events
        setEvents(eventsData)
        setTotalEvents(response.data.results.count || eventsData.length)

        const pageSize = 10
        setTotalPages(Math.ceil(eventsData.length / pageSize))
      } else {
        throw new Error("Failed to fetch events: No data returned")
      }
    } catch (error) {
      console.error("Error fetching events:", error)
      setError(error.response?.data?.message || error.message || "Failed to fetch events")
      toast.error(error.response.data['detail'])
    } finally {
      setLoading(false)
    }
  }

  const handleAddEvent = () => {
    setShowAddModal(true)
  }

  const handleEditEvent = (event) => {
    setSelectedEvent(event)
    setShowEditModal(true)
  }

  const handleViewEvent = (event) => {
    setSelectedEvent(event)
    setShowViewModal(true)
  }

  const handleEventAdded = () => {
    setShowAddModal(false)
    fetchEvents()
    toast.success("Event added successfully")
  }

  const handleEventUpdated = () => {
    setShowEditModal(false)
    fetchEvents()
    toast.success("Event updated successfully")
  }

  const handleFilterChange = (value) => {
    setFilterCompleted(value)
    setCurrentPage(1)
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return format(date, "MMMM d, yyyy h:mm a")
    } catch (error) {
      return dateString
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <OrganizerSidebar />

      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">My Events</h1>
            <button
              onClick={handleAddEvent}
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
            >
              <Plus size={18} />
              Add Event
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter size={16} />
                <span className="font-medium">Filter:</span>
              </div>
              <button
                onClick={() => handleFilterChange(null)}
                className={`px-3 py-1 rounded-md ${
                  filterCompleted === null ? "bg-black text-white" : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleFilterChange(false)}
                className={`px-3 py-1 rounded-md ${
                  filterCompleted === false ? "bg-black text-white" : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => handleFilterChange(true)}
                className={`px-3 py-1 rounded-md ${
                  filterCompleted === true ? "bg-black text-white" : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          {/* Events List */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader className="animate-spin h-8 w-8 text-gray-400" />
                <span className="ml-2 text-gray-500">Loading events...</span>
              </div>
            ) : error ? (
              <div className="p-6 text-center text-red-500">
                <p>{error}</p>
                <button
                  onClick={fetchEvents}
                  className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                >
                  Try Again
                </button>
              </div>
            ) : events.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-medium mb-2">No Events Found</h3>
                <p className="text-gray-500 mb-6">
                  {filterCompleted !== null
                    ? `You don't have any ${filterCompleted ? "completed" : "upcoming"} events.`
                    : "You haven't created any events yet."}
                </p>
                <button onClick={handleAddEvent} className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
                  Create Your First Event
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tickets
                        </th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {events.map((event) => (
                        <tr key={event.eventId} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="h-12 w-12 flex-shrink-0 rounded-md bg-gray-200 overflow-hidden">
                                {event.posterImage ? (
                                  <img
                                    src={event.posterImage || "/placeholder.svg"}
                                    alt={event.title}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center bg-gray-300">
                                    <Calendar className="h-6 w-6 text-gray-500" />
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{event.title}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(event.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {event.location || "Online"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Rs.{event.pricePerTicket || "0.00"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {event.ticketsSold || 0}/{event.ticketLimit || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                event.is_completed ? "bg-gray-100 text-gray-800" : "bg-green-100 text-green-800"
                              }`}
                            >
                              {event.is_completed ? "Completed" : "Upcoming"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => handleViewEvent(event)}
                                className="text-blue-600 hover:text-blue-900"
                                title="View Details"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => handleEditEvent(event)}
                                className="text-gray-600 hover:text-gray-900"
                                title="Edit Event"
                              >
                                <Edit size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Showing {events.length} of {totalEvents} events
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-md border disabled:opacity-50"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      {Array.from({ length: totalPages }).map((_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => setCurrentPage(index + 1)}
                          className={`w-8 h-8 rounded-md ${
                            currentPage === index + 1 ? "bg-black text-white" : "border hover:bg-gray-50"
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-md border disabled:opacity-50"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && <AddEventModal onClose={() => setShowAddModal(false)} onEventAdded={handleEventAdded} />}

      {/* Edit Event Modal */}
      {showEditModal && selectedEvent && (
        <EditEventModal
          event={selectedEvent}
          onClose={() => setShowEditModal(false)}
          onEventUpdated={handleEventUpdated}
        />
      )}

      {/* View Event Modal */}
      {showViewModal && selectedEvent && (<ViewEventModal event={selectedEvent} onClose={() => setShowViewModal(false)} />)}
    </div>
  )
}

export default OrganizerEventManagement