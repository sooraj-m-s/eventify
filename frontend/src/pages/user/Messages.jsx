import { useState, useEffect, useCallback, useRef } from "react"
import { Search, MessageSquare, CheckCheck, Check, Loader } from "lucide-react"
import { useSelector } from "react-redux"
import { useNavigate, useSearchParams } from "react-router-dom"
import axiosInstance from "@/utils/axiosInstance"
import ProfileSidebar from "./components/ProfileSidebar"
import ChatModal from "@/components/ChatModal"


const Messages = () => {
  const [chatRooms, setChatRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchLoading, setSearchLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const userData = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [currentPage, setCurrentPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const scrollContainerRef = useRef(null)
  const [showChatModal, setShowChatModal] = useState(false)
  const [selectedRoomId, setSelectedRoomId] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const searchTimeoutRef = useRef(null)

  useEffect(() => {
    fetchChatRooms(1, true)
  }, [])

  useEffect(() => {
    const roomId = searchParams.get("room")
    if (roomId && chatRooms.length > 0) {
      const room = chatRooms.find((r) => r.room_id === roomId)
      if (room) {
        setSelectedRoomId(roomId)
        setSelectedUser(room.other_participant)
        setShowChatModal(true)
        navigate("/messages", { replace: true })
      }
    }
  }, [searchParams, chatRooms, navigate])

  const fetchChatRooms = async (page = 1, reset = false, searchTerm = "") => {
    try {
      if (page === 1) {
        if (searchTerm) {
          setSearchLoading(true)
        } else {
          setLoading(true)
        }
      } else {
        setLoadingMore(true)
      }

      let url = `/chat/rooms/?page=${page}`
      if (searchTerm.trim()) {
        url += `&search=${encodeURIComponent(searchTerm.trim())}`
      }

      const response = await axiosInstance.get(url)
      const newChatRooms = response.data.results?.chat_rooms || []

      if (reset || page === 1) {
        setChatRooms(newChatRooms)
      } else {
        setChatRooms((prev) => [...prev, ...newChatRooms])
      }

      setHasNextPage(!!response.data.next)
      setCurrentPage(page)
    } catch (error) {
      console.error("Error fetching chat rooms:", error)
      if (reset || page === 1) {
        setChatRooms([])
      }
    } finally {
      setLoading(false)
      setSearchLoading(false)
      setLoadingMore(false)
    }
  }

  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    setIsSearching(query.trim().length > 0)

    if (!query.trim()) {
      setIsSearching(false)
      fetchChatRooms(1, true, "")
      return
    }
    searchTimeoutRef.current = setTimeout(() => {
      fetchChatRooms(1, true, query)
    }, 3000)
  }

  const loadMoreChatRooms = useCallback(() => {
    if (!loadingMore && hasNextPage && !isSearching) {
      fetchChatRooms(currentPage + 1, false, "")
    }
  }, [currentPage, hasNextPage, loadingMore, isSearching])

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return
    const { scrollTop, scrollHeight, clientHeight } = container

    if (scrollHeight - scrollTop <= clientHeight + 100) {
      loadMoreChatRooms()
    }
  }, [loadMoreChatRooms])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("scroll", handleScroll)
      return () => container.removeEventListener("scroll", handleScroll)
    }
  }, [handleScroll])

  const handleChatNavigation = (roomId) => {
    const room = chatRooms.find((r) => r.room_id === roomId)
    if (room) {
      setSelectedRoomId(roomId)
      setSelectedUser(room.other_participant)
      setShowChatModal(true)
    }
  }

  const handleChatModalClose = () => {
    setShowChatModal(false)
    setSelectedRoomId(null)
    setSelectedUser(null)
    if (isSearching) {
      fetchChatRooms(1, true, searchQuery)
    } else {
      fetchChatRooms(1, true, "")
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

  return (
    <>
      <div className="flex min-h-screen bg-gray-50">
        <ProfileSidebar />

        <div className="flex-1 bg-gray-50 flex flex-col">
          {/* Header */}
          <div className="bg-white shadow-sm border-b px-6 py-4 flex-shrink-0">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600 mt-1">
                Stay connected with event organizers and attendees
              </p>
            </div>
          </div>

          {/* Scrollable content area */}
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto" style={{ height: "calc(100vh - 120px)" }}>
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
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                  {/* Search loading indicator */}
                  {searchLoading && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <Loader className="animate-spin h-4 w-4 text-blue-500" />
                    </div>
                  )}
                </div>

                {/* Search status */}
                {isSearching && (
                  <div className="mt-2 text-sm text-gray-600">
                    {searchLoading
                      ? "Searching..."
                      : `Found ${chatRooms.length} result${chatRooms.length !== 1 ? "s" : ""} for "${searchQuery}"`}
                  </div>
                )}
              </div>

              {/* Chat Rooms List */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {loading && !isSearching ? (
                  <div className="flex items-center justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading conversations...</span>
                  </div>
                ) : chatRooms.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="bg-gray-100 p-4 rounded-full mb-4">
                      <MessageSquare className="h-8 w-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {isSearching ? "No conversations found" : "No messages yet"}
                    </h3>
                    <p className="text-gray-500 max-w-sm">
                      {isSearching
                        ? "Try adjusting your search terms or check spelling"
                        : "Start a conversation by messaging an event organizer or attendee"}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="divide-y divide-gray-200">
                      {chatRooms.map((room) => {
                        const otherUser = room.other_participant
                        const lastMessage = room.last_message
                        const unreadCount = room.unread_count
                        const onlineStatus = room.other_participant_online_status

                        return (
                          <div
                            key={room.room_id}
                            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                            onClick={() => handleChatNavigation(room.room_id)}
                          >
                            <div className="flex items-center space-x-4">
                              {/* Avatar with online status */}
                              <div className="relative flex-shrink-0">
                                <img
                                  src={otherUser?.profile_image || "/placeholder.svg"}
                                  alt={otherUser?.full_name || "User"}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                                <div
                                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                                    onlineStatus?.is_online ? "bg-green-500" : "bg-gray-400"
                                  }`}
                                />
                              </div>

                              {/* Chat Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                                    {otherUser?.full_name || "Unknown User"}
                                  </h3>
                                  <div className="flex items-center space-x-2">
                                    {lastMessage && (
                                      <>
                                        {getMessageStatus(lastMessage)}
                                        <span className="text-xs text-gray-500">
                                          {formatTime(lastMessage.created_at)}
                                        </span>
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
                                        {lastMessage.message_type === "image" ? (
                                          <span className="italic">📷 Image</span>
                                        ) : lastMessage.message_type === "document" ? (
                                          <span className="italic">📄 Document</span>
                                        ) : (
                                          truncateMessage(lastMessage.content)
                                        )}
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

                                {/* User Role Badge with Online Status */}
                                <div className="mt-1 flex items-center space-x-2">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                    {otherUser?.role === "organizer"
                                      ? "Event Organizer"
                                      : otherUser?.role === "admin"
                                        ? "Admin"
                                        : "Attendee"}
                                  </span>
                                  {onlineStatus && (
                                    <span
                                      className={`text-xs ${
                                        onlineStatus.is_online ? "text-green-600" : "text-gray-500"
                                      }`}
                                    >
                                      {onlineStatus.is_online ? "Online" : onlineStatus.status_text}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Load more only for non-search results */}
                    {!isSearching && loadingMore && (
                      <div className="flex items-center justify-center p-4 border-t">
                        <Loader className="animate-spin h-5 w-5 text-blue-600 mr-2" />
                        <span className="text-sm text-gray-600">Loading more conversations...</span>
                      </div>
                    )}

                    {!isSearching && !hasNextPage && chatRooms.length > 0 && (
                      <div className="text-center p-4 border-t bg-gray-50">
                        <span className="text-sm text-gray-500">You've reached the end of your conversations</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showChatModal && selectedRoomId && selectedUser && (
        <ChatModal
          isOpen={showChatModal}
          onClose={handleChatModalClose}
          roomId={selectedRoomId}
          otherUser={selectedUser}
        />
      )}
    </>
  )
}

export default Messages