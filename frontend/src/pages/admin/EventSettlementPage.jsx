import { useState, useEffect } from "react"
import { Search, Eye, CheckCircle, Calendar, IndianRupee, ChevronLeft, ChevronRight } from "lucide-react"
import axiosInstance from "@/utils/axiosInstance"
import Sidebar from "./components/Sidebar"
import EventDetailsModal from "./components/EventDetailsModal"
import SettlementModal from "./components/SettlementModal"


const EventSettlementPage = () => {
  const [activeTab, setActiveTab] = useState("ready") // "settled", "unsettled", or "ready"
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [events, setEvents] = useState([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    next: null,
    previous: null,
  })
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showSettlementModal, setShowSettlementModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    fetchEvents(1)
  }, [activeTab])

  useEffect(() => {
    if (searchQuery) {
      fetchEvents(1)
    }
  }, [searchQuery])

  const fetchEvents = async (page) => {
    try {
      setLoading(true)
      let settlementStatus = ""

      switch (activeTab) {
        case "settled":
          settlementStatus = "settled"
          break
        case "unsettled":
          settlementStatus = "unsettled"
          break
        case "ready":
          settlementStatus = "available_for_settlement"
          break
      }

      const response = await axiosInstance.get(
        `/admin/events/?settlement_status=${settlementStatus}&page=${page}&search=${searchQuery}`,
      )

      if (response.data.success) {
        setEvents(response.data.events)
        setPagination({
          currentPage: page,
          totalPages: Math.ceil(response.data.count / 10),
          next: response.data.next,
          previous: response.data.previous,
        })
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab} events:`, error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchEvents(newPage)
    }
  }

  const handleViewEvent = (event) => {
    setSelectedEvent(event)
    setShowDetailsModal(true)
  }

  const handleSettleEvent = (event) => {
    setSelectedEvent(event)
    setShowSettlementModal(true)
  }

  const handleSettlementSuccess = () => {
    setShowSettlementModal(false)
    setSelectedEvent(null)
    fetchEvents(pagination.currentPage)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getTabHeader = () => {
    switch (activeTab) {
      case "settled":
        return (
          <div className="p-4 bg-green-50 border-b border-green-100">
            <h2 className="text-lg font-semibold text-green-800 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Settled Events
            </h2>
          </div>
        )
      case "unsettled":
        return (
          <div className="p-4 bg-yellow-50 border-b border-yellow-100">
            <h2 className="text-lg font-semibold text-yellow-800 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Unsettled Events
            </h2>
          </div>
        )
      case "ready":
        return (
          <div className="p-4 bg-blue-50 border-b border-blue-100">
            <h2 className="text-lg font-semibold text-blue-800 flex items-center">
              <IndianRupee className="h-5 w-5 mr-2" />
              Ready to Settle
            </h2>
          </div>
        )
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Event Settlements</h1>

        {/* Filter Buttons */}
        <div className="mb-6 flex space-x-4">
          <button
            onClick={() => setActiveTab("ready")}
            className={`px-4 py-2 rounded-md font-medium ${
              activeTab === "ready"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Ready to Settle
          </button>
          <button
            onClick={() => setActiveTab("settled")}
            className={`px-4 py-2 rounded-md font-medium ${
              activeTab === "settled"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Settled
          </button>
          <button
            onClick={() => setActiveTab("unsettled")}
            className={`px-4 py-2 rounded-md font-medium ${
              activeTab === "unsettled"
                ? "bg-yellow-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Unsettled
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {getTabHeader()}

          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No events found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
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
                        Date
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
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
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
                            <div className="h-10 w-10 flex-shrink-0 rounded bg-gray-200 overflow-hidden">
                              {event.posterImage ? (
                                <img
                                  src={event.posterImage || "/placeholder.svg"}
                                  alt={event.title}
                                  className="h-10 w-10 object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 flex items-center justify-center bg-gray-200">
                                  <Calendar className="h-6 w-6 text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{event.title}</div>
                              <div className="text-sm text-gray-500">{event.location || "No location"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(event.date)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{event.hostedBy?.full_name}</div>
                          <div className="text-sm text-gray-500">{event.hostedBy?.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {event.is_settled_to_organizer ? (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Settled
                            </span>
                          ) : event.date < new Date().toISOString().split("T")[0] ? (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              Ready to Settle
                            </span>
                          ) : (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Unsettled
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleViewEvent(event)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          {!event.is_settled_to_organizer && event.date < new Date().toISOString().split("T")[0] && (
                            <button
                              onClick={() => handleSettleEvent(event)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <IndianRupee className="h-5 w-5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {events.length > 0 && (
                <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.previous}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.next}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Page <span className="font-medium">{pagination.currentPage}</span> of{" "}
                        <span className="font-medium">{pagination.totalPages}</span>
                      </p>
                    </div>
                    <div>
                      <nav
                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                        aria-label="Pagination"
                      >
                        <button
                          onClick={() => handlePageChange(pagination.currentPage - 1)}
                          disabled={!pagination.previous}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Previous</span>
                          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </button>
                        {/* Page numbers */}
                        {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                          let pageNumber
                          if (pagination.totalPages <= 5) {
                            pageNumber = i + 1
                          } else if (pagination.currentPage <= 3) {
                            pageNumber = i + 1
                          } else if (pagination.currentPage >= pagination.totalPages - 2) {
                            pageNumber = pagination.totalPages - 4 + i
                          } else {
                            pageNumber = pagination.currentPage - 2 + i
                          }

                          return (
                            <button
                              key={pageNumber}
                              onClick={() => handlePageChange(pageNumber)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                pagination.currentPage === pageNumber
                                  ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                                  : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              {pageNumber}
                            </button>
                          )
                        })}
                        <button
                          onClick={() => handlePageChange(pagination.currentPage + 1)}
                          disabled={!pagination.next}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Next</span>
                          <ChevronRight className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modals */}
        {selectedEvent && showDetailsModal && (
          <EventDetailsModal
            event={selectedEvent}
            onClose={() => {
              setSelectedEvent(null)
              setShowDetailsModal(false)
            }}
            onSettleEvent={() => {
              setShowDetailsModal(false)
              setShowSettlementModal(true)
            }}
          />
        )}

        {selectedEvent && showSettlementModal && (
          <SettlementModal
            event={selectedEvent}
            onClose={() => {
              setSelectedEvent(null)
              setShowSettlementModal(false)
            }}
            onSuccess={handleSettlementSuccess}
          />
        )}
      </div>
    </div>
  )
}

export default EventSettlementPage