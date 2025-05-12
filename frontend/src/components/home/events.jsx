import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import axiosInstance from "../../utils/axiosInstance"


const Events = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 4

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const response = await axiosInstance.get("/events/")
        let eventsData = []

        if (response.data) {
          if (Array.isArray(response.data)) {
            eventsData = response.data
          }
          else if (response.data.events && Array.isArray(response.data.events)) {
            eventsData = response.data.events
          }
          else {
            console.log("Unexpected API response structure:", response.data)
          }
        }

        setEvents(eventsData)
        setError(null)
      } catch (err) {
        console.error("Error fetching events:", err)
        setError("Failed to load events. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  if (loading) {
    return (
      <div className="my-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">You might like</h2>
          <span>Loading events...</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 animate-pulse h-48 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="my-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">You might like</h2>
        </div>
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  const displayEvents = Array.isArray(events) && events

  const totalPages = Math.ceil(displayEvents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentEvents = displayEvents.slice(startIndex, startIndex + itemsPerPage)

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  return (
    <div className="my-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">You might like</h2>
        <div className="text-sm">View all ({displayEvents.length})</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {currentEvents.map((event) => (
          <div key={event.eventId} className="cursor-pointer group">
            <div className="overflow-hidden rounded-lg">
              <img
                src={event.posterImage || `/placeholder.svg?height=200&width=300`}
                alt={event.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <h3 className="mt-2 font-medium">{event.title}</h3>
            <p className="text-sm text-gray-600">{event.location}</p>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className={`w-8 h-8 flex items-center justify-center rounded-full border ${
              currentPage === 1 ? "text-gray-400 border-gray-200" : "text-black border-gray-300 hover:bg-gray-100"
            }`}
          >
            <ChevronLeft size={16} />
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-8 h-8 flex items-center justify-center rounded-full ${
                currentPage === i + 1 ? "bg-black text-white" : "border border-gray-300 hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className={`w-8 h-8 flex items-center justify-center rounded-full border ${
              currentPage === totalPages
                ? "text-gray-400 border-gray-200"
                : "text-black border-gray-300 hover:bg-gray-100"
            }`}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

export default Events