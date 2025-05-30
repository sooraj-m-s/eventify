import { createContext, useState, useEffect, useContext } from "react"
import { toast } from "sonner"
import { useSelector } from "react-redux"
import WebSocketInstance from "./websocketService"


const STORAGE_KEY = "user_notifications"
const MAX_NOTIFICATIONS = 4
const NotificationContext = createContext()

export const useNotifications = () => useContext(NotificationContext)
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { isAuthenticated, userId } = useSelector((state) => state.auth)

  useEffect(() => {
    const storedNotifications = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
    setNotifications(storedNotifications)
    setUnreadCount(storedNotifications.filter((n) => !n.read).length)
  }, [])

  useEffect(() => {
    if (isAuthenticated && userId) {
      console.log("User is authenticated, connecting to WebSocket")
      WebSocketInstance.connect(userId)
      WebSocketInstance.addCallbacks(handleNewNotification)
    } else {
      console.log("User is not authenticated, not connecting to WebSocket")
      WebSocketInstance.disconnect()
    }
    return () => {
      WebSocketInstance.removeCallbacks()
    }
  }, [isAuthenticated, userId])

  const handleNewNotification = (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      ...notification,
      timestamp: new Date().toISOString(),
      read: false,
    }

    setNotifications((prev) => {
      const updatedNotifications = [newNotification, ...prev]
      return updatedNotifications
    })

    const storedNotifications = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
    const updatedStoredNotifications = [newNotification, ...storedNotifications]

    if (updatedStoredNotifications.length > MAX_NOTIFICATIONS) {
      updatedStoredNotifications.splice(MAX_NOTIFICATIONS)
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStoredNotifications))
    setUnreadCount((prev) => prev + 1)

    toast(notification.message, {
      onClick: () => {
        if (notification.type === "new_event") {
          window.location.href = `/event_detail/${notification.event_id}`
        }
      },
    })
  }

  const markAsRead = (notificationId) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))

    const storedNotifications = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
    const updatedStoredNotifications = storedNotifications.filter((n) => n.id !== notificationId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStoredNotifications))

    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    setUnreadCount(0)
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}