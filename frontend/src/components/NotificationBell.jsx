import { useState, useRef, useEffect } from "react"
import { Bell } from "lucide-react"
import { useNotifications } from "@/services/NotificationContext"


const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id)

    if (notification.type === "new_event") {
      window.location.href = `/event_detail/${notification.event_id}`
    }
    setIsOpen(false)
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " " + date.toLocaleDateString()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white hover:text-gray-200 focus:outline-none transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-xl overflow-hidden z-50">
          <div className="py-2">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto">
              {notifications?.length === 0 ? (
                <div className="px-4 py-10 text-center text-gray-500">No notifications yet</div>
              ) : (
                notifications?.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors ${
                      !notification.read ? "bg-blue-50" : ""
                    }`}
                  >
                    <p className="text-sm text-gray-800 mb-1">{notification.message}</p>
                    <p className="text-xs text-gray-500">{formatTime(notification.timestamp)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell