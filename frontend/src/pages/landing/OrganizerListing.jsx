import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Loader, Users, ChevronLeft, ChevronRight, Eye, X } from "lucide-react"
import OrganizerDetailModal from "./OrganizerDetailModal"
import { getOrganizerDetails, getOrganizers } from "@/api/user"


const OrganizerListing = () => {
  const navigate = useNavigate()
  const [organizers, setOrganizers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [inputValue, setInputValue] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedOrganizer, setSelectedOrganizer] = useState(null)
  const [selectedOrganizerRating, setSelectedOrganizerRating] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(null)
  const searchTimeoutRef = useRef(null)

  const fetchOrganizers = async (page = 1, search = searchTerm) => {
    try {
      setLoading(true)
      setError(null)

      const response = await getOrganizers(page, search)
      if (response.data) {
        const organizersData = response.data.results || response.data.organizers || []
        setOrganizers(organizersData)

        if (response.data.count !== undefined) {
          const pageSize = 12
          setTotalPages(Math.ceil(response.data.count / pageSize))
        } else {
          setTotalPages(1)
        }
      } else {
        setError("Failed to load organizers")
      }
    } catch (err) {
      console.error("Error fetching organizers:", err)
      setError("Failed to load organizers. Please try again later.")
    } finally {
      setLoading(false)
      setIsSearching(false)
    }
  }

  useEffect(() => {
    fetchOrganizers(1, "")
  }, [])

  const handleSearchChange = (value) => {
    setInputValue(value)
    setIsSearching(true)
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(value)
      setCurrentPage(1)
      fetchOrganizers(1, value)
    }, 3000)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    fetchOrganizers(page, searchTerm)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleViewDetails = async (organizer) => {
    try {
      setLoadingDetails(organizer.user_id)
      const response = await getOrganizerDetails(organizer.user_id)

      if (response.data.success) {
        setSelectedOrganizer(response.data.organizer)
        setSelectedOrganizerRating(response.data.average_rating ? response.data.average_rating : 0)
        setShowModal(true)
      } else {
        console.error("Failed to fetch organizer details")
      }
    } catch (err) {
      console.error("Error fetching organizer details:", err)
    } finally {
      setLoadingDetails(null)
    }
  }

  // Handle view events
  const handleViewEvents = (organizerId) => {
    navigate(`/events?organizer=${organizerId}`)
    setShowModal(false)
  }

  const clearSearch = () => {
    setInputValue("")
    setSearchTerm("")
    setCurrentPage(1)

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    fetchOrganizers(1, "")
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
      <h1 className="text-3xl font-bold mb-8 text-center">Event Organizers</h1>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search organizers by name..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <Loader className="h-4 w-4 animate-spin text-blue-500" />
                <span className="text-xs text-blue-500">Searching...</span>
              </div>
            )}
          </div>

          {(searchTerm || inputValue) && (
            <button
              onClick={clearSearch}
              className="flex items-center gap-2 px-4 py-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X size={18} />
              Clear Search
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="h-8 w-8 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-600">Loading organizers...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 mb-4">{error}</p>
          <button
            onClick={() => fetchOrganizers(currentPage, searchTerm)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* No Results */}
      {!loading && !error && organizers.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No organizers found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? `No organizers found matching "${searchTerm}"` : "No organizers are currently available"}
          </p>
          {searchTerm && (
            <button onClick={clearSearch} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Clear Search
            </button>
          )}
        </div>
      )}

      {/* Organizers Grid */}
      {!loading && !error && organizers.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {organizers.map((organizer) => (
              <div
                key={organizer.user_id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="p-6 text-center">
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    <img
                      src={organizer.profile_image || "https://res.cloudinary.com/dogt3mael/image/upload/v1754460252/blue-circle-with-white-user_78370-4707_sqk7qc.avif"}
                      alt={organizer.full_name}
                      className="w-full h-full object-cover rounded-full border-4 border-gray-100"
                      onError={e => {
                      e.target.onerror = null;
                      e.target.src = "https://res.cloudinary.com/dogt3mael/image/upload/v1754460252/blue-circle-with-white-user_78370-4707_sqk7qc.avif";
                    }}
                    />
                  </div>

                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{organizer.full_name}</h3>

                  <div className="flex items-center justify-center text-sm text-gray-500 mb-4">
                    <Users size={16} className="mr-1" />
                    <span>Event Organizer</span>
                  </div>

                  <button
                    onClick={() => handleViewDetails(organizer)}
                    disabled={loadingDetails === organizer.user_id}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    {loadingDetails === organizer.user_id ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Eye size={16} />
                        View Details
                      </>
                    )}
                  </button>
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
                  className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                        className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors ${
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
                      <span className="px-2 text-gray-500">...</span>
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        className="w-10 h-10 flex items-center justify-center rounded-md border border-gray-300 hover:bg-gray-100"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Organizer Detail Modal */}
      {showModal && selectedOrganizer && (
        <OrganizerDetailModal
          organizer={selectedOrganizer}
          averageRating={selectedOrganizerRating}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onViewEvents={handleViewEvents}
        />
      )}
    </div>
  )
}

export default OrganizerListing