import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { User, Calendar, BookOpen, Wallet, BarChart3, MessageSquare } from "lucide-react"
import axiosInstance from "../../../utils/axiosInstance"


const ProfileSidebar = () => {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const response = await axiosInstance.get("/users/me/")
        setUserData(response.data)
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
  }

  if (loading) {
    return (
      <div className="w-64 bg-white shadow-md p-6 flex flex-col h-screen">
        <div className="animate-pulse flex items-center mb-8">
          <div className="w-12 h-12 rounded-full bg-gray-200"></div>
          <div className="ml-3">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="h-10 bg-gray-200 rounded mb-3 w-full"></div>
        ))}
      </div>
    )
  }

  const navItems = [
    { name: "Profile", path: "/profile", icon: <User className="h-5 w-5" /> },
    { name: "Bookings", path: "/bookings", icon: <BookOpen className="h-5 w-5" /> },
    { name: "Wallet", path: "/wallet", icon: <Wallet className="h-5 w-5" /> },
    { name: "Transactions", path: "/transactions", icon: <BarChart3 className="h-5 w-5" /> },
    { name: "Messages", path: "/messages", icon: <MessageSquare className="h-5 w-5" /> },
  ]

  return (
    <div className="w-64 bg-white shadow-md flex flex-col h-screen">
      {/* User Info */}
      <div className="p-6 border-b">
        <div className="flex items-center">
          {userData?.profile_image ? (
            <img
              src={userData.profile_image || "/placeholder.svg"}
              alt={userData.full_name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-800 text-white rounded-full flex items-center justify-center font-semibold">
              {getInitials(userData?.full_name)}
            </div>
          )}
          <div className="ml-3">
            <h3 className="font-semibold text-gray-900">{userData?.full_name}</h3>
            <p className="text-sm text-gray-500">
              {userData?.role === "organizer" ? "Event Organizer" : "Event Enthusiast"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                  location.pathname === item.path
                    ? "bg-gray-100 text-black font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export default ProfileSidebar