import { useState, useEffect } from "react"
import axiosInstance from "../../utils/axiosInstance"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { useNavigate } from "react-router-dom"


const Events = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const response = await axiosInstance.get("/events/")
        let eventsData = []

        if (response.data) {
          if (Array.isArray(response.data)) {
            eventsData = response.data
          } else if (response.data.events && Array.isArray(response.data.events)) {
            eventsData = response.data.events
          } else {
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

  const handleEventClick = (eventId) => {
    navigate(`/event_detail/${eventId}`)
  }

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
  const displayEvents = Array.isArray(events) && events.length > 0 ? events : []

  const handleViewAllClick = () => {
    navigate("/events")
  }

  return (
    <div className="my-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">You might like</h2>
        <button
          onClick={handleViewAllClick}
          className="text-sm text-black-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
        >
          View all ({displayEvents.length >= 5 ? "5+" : displayEvents.length})
        </button>
      </div>

      <Carousel
        opts={{
          align: "center",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {displayEvents.map((event) => (
            <CarouselItem key={event.eventId} className="sm:basis-1/2 md:basis-1/3 lg:basis-1/5">
              <div className="cursor-pointer group p-1" onClick={() => handleEventClick(event.eventId)}>
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
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
    </div>
  )
}

export default Events