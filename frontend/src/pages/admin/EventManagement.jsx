import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import AdminHeader from "./components/AdminHeader"
import Sidebar from "./components/Sidebar"
import EventDetailModal from "./components/EventDetailModal"
import { Search, Calendar, Eye } from "lucide-react"

const EventManagement = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await axios.get("http://localhost:8000/events/", {
          params: { page: currentPage, search: searchTerm },
        })
        setEvents(response.data.results || [])
        setTotalPages(response.data.total_pages || 1)
      } catch (err) {
        console.error("Error fetching events:", err)
        setError("Failed to load events. Please try again.")
        toast.error("Failed to load events")
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [currentPage, searchTerm])

  const handleStatusChange = async (eventId, status) => {
    try {
      await axios.patch(`/events/${eventId}/status`, { status })

      setEvents(events.map((event) => (event.id === eventId ? { ...event, status, statusUpdated: true } : event)))

      toast.success(`Event ${status === "approved" ? "approved" : "rejected"} successfully`)
    } catch (err) {
      console.error("Error updating event status:", err)
      toast.error("Failed to update event status")
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const openEventDetails = (event) => {
    setSelectedEvent(event)
    setIsModalOpen(true)
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <AdminHeader />

      <div className="flex flex-1 pt-16">
        <Sidebar />

        <div className="flex-1 p-6">
          <h1 className="text-2xl font-semibold mb-6">Event Management</h1>

          <div className="bg-white rounded-md shadow-sm">
            {/* Search */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-medium">Events</h2>

              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search events"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 w-64"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </form>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left bg-gray-50">
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Hosted By</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ticket Limit
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-red-500">
                        {error}
                      </td>
                    </tr>
                  ) : events.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        No events found
                      </td>
                    </tr>
                  ) : (
                    events.map((event) => (
                      <tr key={event.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {event.hostedBy?.full_name || "Unknown"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {event.category?.categoryName || "Unknown"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.ticketLimit}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(event.date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {event.status ? (
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                event.status === "approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {event.status === "approved" ? "Approved" : "Rejected"}
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEventDetails(event)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Details"
                            >
                              <Eye className="h-5 w-5" />
                            </button>

                            {!event.status && !event.statusUpdated && (
                              <>
                                <button
                                  onClick={() => handleStatusChange(event.id, "approved")}
                                  className="px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleStatusChange(event.id, "rejected")}
                                  className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && !error && events.length > 0 && (
              <div className="flex justify-center items-center space-x-2 p-4 border-t">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md border disabled:opacity-50"
                >
                  &lt;
                </button>

                {[...Array(totalPages).keys()].map((page) => (
                  <button
                    key={page + 1}
                    onClick={() => setCurrentPage(page + 1)}
                    className={`w-8 h-8 rounded-md ${
                      currentPage === page + 1 ? "bg-gray-800 text-white" : "border hover:bg-gray-100"
                    }`}
                  >
                    {page + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-md border disabled:opacity-50"
                >
                  &gt;
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  )
}

export default EventManagement