import { useState, useEffect } from "react"
import { Search, MessageSquare, Clock, CheckCheck, Check } from "lucide-react"
import { useSelector } from "react-redux"
import axiosInstance from "@/utils/axiosInstance"
import ProfileSidebar from "./components/ProfileSidebar"


const Messages = () => {
  const [chatRooms, setChatRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const userData = useSelector((state) => state.auth)

  useEffect(() => {
    fetchChatRooms()
  }, [])

  const fetchChatRooms = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get("/chat/rooms/")
      setChatRooms(response.data.chat_rooms || [])
    } catch (error) {
      console.error("Error fetching chat rooms:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    } else if (diffInHours < 168) {
      return date.toLocaleDateString("en-US", { weekday: "short" })
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    }
  }

  const getMessageStatus = (lastMessage) => {
    if (!lastMessage) return null

    if (lastMessage.sender.user_id === userData.user_id) {
      if (lastMessage.is_read) {
        return <CheckCheck className="h-4 w-4 text-blue-500" />
      } else {
        return <Check className="h-4 w-4 text-gray-400" />
      }
    }
    return null
  }

  const truncateMessage = (message, maxLength = 50) => {
    if (!message) return ""
    return message.length > maxLength ? `${message.substring(0, maxLength)}...` : message
  }

  const filteredChatRooms = chatRooms.filter((room) => {
    if (!searchQuery) return true
    const otherUser = room.other_participant
    return (
      otherUser?.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      otherUser?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.last_message?.content?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ProfileSidebar />

      <div className="flex-1 bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600 mt-1">Stay connected with event organizers and attendees</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Chat Rooms List */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading conversations...</span>
              </div>
            ) : filteredChatRooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                  <MessageSquare className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? "No conversations found" : "No messages yet"}
                </h3>
                <p className="text-gray-500 max-w-sm">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Start a conversation by messaging an event organizer or attendee"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredChatRooms.map((room) => {
                  const otherUser = room.other_participant
                  const lastMessage = room.last_message
                  const unreadCount = room.unread_count

                  return (
                    <div
                      key={room.room_id}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                      onClick={() => {
                        console.log("Navigate to room:", room.room_id)
                      }}
                    >
                      <div className="flex items-center space-x-4">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <img
                            src={otherUser?.profile_image || "/placeholder.svg"}
                            alt={otherUser?.userName || "User"}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        </div>

                        {/* Chat Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {otherUser?.userName || "Unknown User"}
                            </h3>
                            <div className="flex items-center space-x-2">
                              {lastMessage && (
                                <>
                                  {getMessageStatus(lastMessage)}
                                  <span className="text-xs text-gray-500">{formatTime(lastMessage.created_at)}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                              {lastMessage ? (
                                <p className="text-sm text-gray-600 truncate">
                                  {lastMessage.sender.user_id === userData.user_id && (
                                    <span className="text-gray-500">You: </span>
                                  )}
                                  {truncateMessage(lastMessage.content)}
                                </p>
                              ) : (
                                <p className="text-sm text-gray-500 italic">No messages yet</p>
                              )}
                            </div>

                            {/* Unread Count Badge */}
                            {unreadCount > 0 && (
                              <div className="flex-shrink-0 ml-2">
                                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full min-w-[20px]">
                                  {unreadCount > 99 ? "99+" : unreadCount}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* User Role Badge */}
                          <div className="mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {otherUser?.role === "organizer" ? "Event Organizer" : "Attendee"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          {!loading && filteredChatRooms.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
              <div className="flex space-x-3">
                <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  New Message
                </button>
                <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <Clock className="h-4 w-4 mr-2" />
                  Mark All Read
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Messages