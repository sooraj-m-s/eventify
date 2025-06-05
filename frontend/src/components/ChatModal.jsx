import { useState, useEffect, useRef, useCallback } from "react"
import { X, Send, ImageIcon, Loader, Check, CheckCheck, Download, Eye } from "lucide-react"
import { useSelector } from "react-redux"
import { toast } from "sonner"
import uploadToCloudinary from "@/utils/cloudinaryUpload"
import axiosInstance from "@/utils/axiosInstance"


const ChatModal = ({ isOpen, onClose, roomId, otherUser }) => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [otherUserTyping, setOtherUserTyping] = useState(false)
  const [onlineStatus, setOnlineStatus] = useState({is_online: false, status_text: "offline"})
  const [imagePreview, setImagePreview] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)

  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const imageInputRef = useRef(null)
  const wsRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const lastScrollHeight = useRef(0)
  const userData = useSelector((state) => state.auth)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const initializeWebSocket = useCallback(() => {
    if (!roomId) return
    const CHAT_WS_BASE_URL = import.meta.env.VITE_CHAT_WS_BASE_URL;
    const wsUrl = `${CHAT_WS_BASE_URL}${roomId}/`;
    wsRef.current = new WebSocket(wsUrl)

    wsRef.current.onopen = () => {
      console.log("WebSocket connected")
    }

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data)

      switch (data.type) {
        case "message":
          setMessages((prev) => [data.message, ...prev])
          scrollToBottom()
          break

        case "participant_status":
          if (data.user_id !== userData.user_id) {
            setOnlineStatus({
              is_online: data.is_online,
              status_text: data.status_text || (data.is_online ? "online" : "offline"),
            })
          }
          break

        case "typing":
          if (data.user_id !== userData.user_id) {
            setOtherUserTyping(data.is_typing)
          }
          break

        case "pong":
          break
      }
    }

    wsRef.current.onclose = () => {
      console.log("WebSocket disconnected")
      setTimeout(() => {
        if (isOpen && roomId) {
          initializeWebSocket()
        }
      }, 3000)
    }

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error)
    }
  }, [roomId, isOpen, userData.user_id])

  const fetchMessages = async (page = 1, append = false) => {
    if (!roomId) return

    try {
      if (page === 1) {
        setLoading(true)
      } else {
        setLoadingOlder(true)
      }

      const response = await axiosInstance.get(`/chat/rooms/${roomId}/messages/?page=${page}`)
      const newMessages = response.data.results || []

      if (append) {
        setMessages((prev) => [...prev, ...newMessages])
      } else {
        setMessages(newMessages)
      }

      setHasNextPage(!!response.data.next)
      setCurrentPage(page)
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast.error("Failed to load messages")
    } finally {
      setLoading(false)
      setLoadingOlder(false)
    }
  }

  const loadOlderMessages = useCallback(async () => {
    if (loadingOlder || !hasNextPage) return
    const container = messagesContainerRef.current
    if (container) {
      lastScrollHeight.current = container.scrollHeight
    }

    await fetchMessages(currentPage + 1, true)

    setTimeout(() => {
      if (container) {
        const newScrollHeight = container.scrollHeight
        container.scrollTop = newScrollHeight - lastScrollHeight.current
      }
    }, 100)
  }, [currentPage, hasNextPage, loadingOlder])

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container) return

    if (container.scrollTop === 0 && hasNextPage && !loadingOlder) {
      loadOlderMessages()
    }
  }, [hasNextPage, loadingOlder, loadOlderMessages])

  const sendMessage = async (messageData) => {
    try {
      setSending(true)
      const response = await axiosInstance.post(`/chat/rooms/${roomId}/messages/`, messageData)
      return response.data
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
      throw error
    } finally {
      setSending(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!newMessage.trim() || sending) return

    const messageText = newMessage.trim()
    setNewMessage("")

    try {
      await sendMessage({
        content: messageText,
        message_type: "text",
      })
    } catch (error) {
      setNewMessage(messageText)
    }
  }

  const handleImageUpload = async (file) => {
    try {
      setUploading(true)
      setUploadProgress(0)

      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview({
          url: e.target.result,
          name: file.name,
          size: file.size,
        })
      }
      reader.readAsDataURL(file)

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const mediaUrl = await uploadToCloudinary(file)
      clearInterval(progressInterval)
      setUploadProgress(100)

      await sendMessage({
        content: "",
        message_type: "image",
        media_url: mediaUrl,
        media_filename: file.name,
      })

      toast.success("Image sent successfully")
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Failed to upload image")
    } finally {
      setUploading(false)
      setUploadProgress(0)
      setImagePreview(null)
    }
  }

  const handleTyping = () => {
    if (!wsRef.current) return
    wsRef.current.send(
      JSON.stringify({
        type: "typing",
        is_typing: true,
      }),
    )
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      wsRef.current?.send(
        JSON.stringify({
          type: "typing",
          is_typing: false,
        }),
      )
    }, 5000)
  }

  const handleFileDownload = async (url, filename) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = filename || "download"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      window.URL.revokeObjectURL(downloadUrl)
      toast.success("File downloaded successfully")
    } catch (error) {
      console.error("Download error:", error)
      toast.error("Failed to download file")
    }
  }

  const isOwnMessage = (message) => {
    const currentUserId = userData.user_id || userData.id || userData.userId
    const senderUserId = message.sender.user_id || message.sender.id || message.sender.userId
    return String(currentUserId) === String(senderUserId)
  }

  useEffect(() => {
    if (otherUser) {
      setOnlineStatus({
        is_online: otherUser.is_online || false,
        status_text: otherUser.online_status || otherUser.last_seen_display || "offline",
      })
    }
  }, [otherUser])

  const fetchRoomDetails = async () => {
    if (!roomId) return

    try {
      const response = await axiosInstance.get(`/chat/rooms/${roomId}/messages/`)

      if (response.data.room?.other_participant_online_status) {
        const status = response.data.room.other_participant_online_status
        setOnlineStatus({
          is_online: status.is_online,
          status_text: status.status_text || (status.is_online ? "online" : "offline"),
        })
      }
    } catch (error) {
      console.error("Error fetching room details:", error)
    }
  }

  useEffect(() => {
    if (isOpen && roomId) {
      setCurrentPage(1)
      setHasNextPage(false)
      setMessages([])
      fetchMessages(1, false)
      fetchRoomDetails()
      initializeWebSocket()
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [isOpen, roomId, initializeWebSocket])

  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) {
      container.addEventListener("scroll", handleScroll)
      return () => container.removeEventListener("scroll", handleScroll)
    }
  }, [handleScroll])

  useEffect(() => {
    if (messages.length > 0 && currentPage === 1) {
      scrollToBottom()
    }
  }, [messages, currentPage])

  // Format message time
  const formatMessageTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  // Get message status icon
  const getMessageStatus = (message) => {
    if (!isOwnMessage(message)) return null

    return message.is_read ? (
      <CheckCheck className="h-3 w-3 text-blue-200" />
    ) : (
      <Check className="h-3 w-3 text-blue-300" />
    )
  }

  // Render message content
  const renderMessageContent = (message) => {
    const isOwn = isOwnMessage(message)

    switch (message.message_type) {
      case "image":
        return (
          <div className="space-y-2">
            {message.media_url ? (
              <div className="relative group">
                <img
                  src={message.media_url || "/placeholder.svg"}
                  alt={message.media_filename || "Shared image"}
                  className="max-w-[300px] max-h-[250px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity object-cover"
                  onClick={() => window.open(message.media_url, "_blank")}
                  onError={(e) => {
                    console.error("Image failed to load:", message.media_url)
                    e.target.style.display = "none"
                    e.target.nextElementSibling.style.display = "flex"
                  }}
                />

                {/* Fallback for broken images */}
                <div className="max-w-[300px] bg-gray-100 rounded-lg p-4 text-center hidden">
                  <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Image failed to load</p>
                  <button
                    onClick={() => window.open(message.media_url, "_blank")}
                    className="text-xs text-blue-500 hover:underline mt-1"
                  >
                    Open in new tab
                  </button>
                </div>

                {/* Image overlay with actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(message.media_url, "_blank")
                      }}
                      className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all shadow-lg"
                      title="View full size"
                    >
                      <Eye className="h-4 w-4 text-gray-700" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleFileDownload(message.media_url, message.media_filename || "image.jpg")
                      }}
                      className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all shadow-lg"
                      title="Download image"
                    >
                      <Download className="h-4 w-4 text-gray-700" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-[300px] bg-gray-100 rounded-lg p-4 text-center">
                <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Image not available</p>
              </div>
            )}

            {message.content && message.content.trim() !== "" && (
              <p className={`text-sm mt-2 ${isOwn ? "text-blue-100" : "text-gray-700"}`}>{message.content}</p>
            )}
          </div>
        )

      default:
        return <p className={`text-sm ${isOwn ? "text-white" : "text-gray-900"}`}>{message.content}</p>
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-[90vw] h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-xl flex-shrink-0">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="relative flex-shrink-0">
              <img
                src={otherUser?.profile_image || "/placeholder.svg"}
                alt={otherUser?.full_name || "User"}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
              />
              <div
                className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${
                  onlineStatus.is_online ? "bg-green-500" : "bg-gray-400"
                }`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 text-lg truncate">{otherUser?.full_name || "Unknown User"}</h3>
              <p className="text-sm text-gray-500 truncate">
                {otherUserTyping ? (
                  <span className="text-blue-600 font-medium">Typing...</span>
                ) : (
                  onlineStatus.status_text
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 bg-gray-50"
          style={{ minHeight: 0 }}
        >
          {/* Loading older messages indicator */}
          {loadingOlder && (
            <div className="flex items-center justify-center py-4">
              <Loader className="animate-spin h-5 w-5 text-blue-500 mr-2" />
              <span className="text-sm text-gray-600">Loading older messages...</span>
            </div>
          )}

          {/* No more messages indicator */}
          {!hasNextPage && messages.length > 0 && currentPage > 1 && (
            <div className="text-center py-3">
              <span className="text-xs text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border">
                Beginning of conversation
              </span>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-3" />
                <span className="text-gray-600">Loading messages...</span>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <div className="bg-white p-6 rounded-full mb-6 mx-auto w-20 h-20 flex items-center justify-center shadow-lg">
                  <Send className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg font-medium">No messages yet</p>
                <p className="text-gray-400 mt-2">Start the conversation!</p>
              </div>
            </div>
          ) : (
            <>
              {messages
                .slice()
                .reverse()
                .map((message) => {
                  const isOwn = isOwnMessage(message)

                  return (
                    <div key={message.message_id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                      {/* Show sender avatar for received messages */}
                      {!isOwn && (
                        <img
                          src={message.sender.profile_image || "/placeholder.svg"}
                          alt={message.sender.full_name}
                          className="w-8 h-8 rounded-full object-cover mr-3 mt-1 flex-shrink-0 ring-2 ring-white shadow-sm"
                        />
                      )}

                      <div
                        className={`max-w-[70%] sm:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-sm ${
                          isOwn
                            ? "bg-blue-500 text-white rounded-br-md ml-auto"
                            : "bg-white text-gray-900 rounded-bl-md border border-gray-100"
                        }`}
                      >
                        {renderMessageContent(message)}
                        <div
                          className={`flex items-center justify-between mt-2 space-x-2 ${
                            isOwn ? "text-blue-100" : "text-gray-500"
                          }`}
                        >
                          <span className="text-xs">{formatMessageTime(message.created_at)}</span>
                          {getMessageStatus(message)}
                        </div>
                      </div>

                      {/* Add spacing for own messages */}
                      {isOwn && <div className="w-8 flex-shrink-0" />}
                    </div>
                  )
                })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Upload Progress Indicator */}
        {uploading && (
          <div className="px-4 sm:px-6 py-3 border-t bg-white">
            <div className="flex items-center space-x-3">
              {imagePreview && (
                <img
                  src={imagePreview.url || "/placeholder.svg"}
                  alt="Preview"
                  className="w-12 h-12 rounded-lg object-cover shadow-sm"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 font-medium">
                    {imagePreview ? `Uploading ${imagePreview.name}` : "Uploading image..."}
                  </span>
                  <span className="text-sm text-gray-500 font-mono">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="border-t bg-white px-4 sm:px-6 py-4 flex-shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
            {/* Image upload button */}
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={uploading}
              className="p-3 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50 disabled:opacity-50 transition-colors flex-shrink-0"
              title="Send Image"
            >
              <ImageIcon className="h-5 w-5" />
            </button>

            {/* Message input */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value)
                  handleTyping()
                }}
                placeholder="Type a message..."
                className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                disabled={sending || uploading}
              />

              {(sending || uploading) && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <Loader className="animate-spin h-4 w-4 text-blue-500" />
                </div>
              )}
            </div>

            {/* Send button */}
            <button
              type="submit"
              disabled={!newMessage.trim() || sending || uploading}
              className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex-shrink-0 shadow-sm"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>

        {/* Hidden image input */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              handleImageUpload(file)
            }
          }}
          className="hidden"
        />
      </div>
    </div>
  )
}

export default ChatModal