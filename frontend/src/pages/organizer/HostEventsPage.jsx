import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import { Plus, Calendar, MapPin, Users } from "lucide-react"


const HostEventsPage = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // First check if user is authorized to access this page
        const userResponse = await axios.get("/api/users/me", {
          withCredentials: true,
        })

        if (userResponse.data.role !== "organizer") {
          // Redirect non-organizers
          navigate("/unauthorized")
          return
        }

        setUserRole(userResponse.data.role)

        // Fetch hosted events
        const eventsResponse = await axios.get("/api/events/hosted", {
          withCredentials: true,
        })

        setEvents(eventsResponse.data)
      } catch (err) {
        console.error("Error:", err)
        setError("Failed to load events")

        // Redirect to login if unauthorized
        if (err.response?.status === 401) {
          navigate("/login")
        }
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [navigate])

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Hosted Events</h1>
            <button
              onClick={() => navigate("/host-events/create")}
              className="flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            >
              <Plus className="h-5 w-5 mr-1" />
              <span>Create Event</span>
            </button>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-64 bg-gray-200 rounded w-full"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-500 p-4 rounded-md">{error}</div>
          ) : events.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <h3 className="text-lg font-medium mb-2">No events yet</h3>
              <p className="text-gray-500 mb-6">
                You haven't created any events yet. Get started by creating your first event.
              </p>
              <button
                onClick={() => navigate("/host-events/create")}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                Create Your First Event
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/host-events/${event.id}`)}
                >
                  <div className="h-48 bg-gray-200 relative">
                    {event.image ? (
                      <img
                        src={event.image || "/placeholder.svg"}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300">
                        <Calendar className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-medium">
                      {event.status}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-lg mb-2">{event.title}</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        <span>
                          {event.attendees}/{event.max_capacity} attendees
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HostEventsPage