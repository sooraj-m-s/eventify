"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { LogOut, User, Briefcase, Calendar, Star, Wallet, BarChart2, MessageSquare } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "react-toastify"
import axiosInstance from "@/utils/axiosInstance"

const OrganizerSidebar = () => {
  const location = useLocation()
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get("/organizer/profile/")
        setProfile(response.data)
      } catch (error) {
        console.error("Error fetching organizer profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleLogout = () => {
    dispatch(logout())
    toast.success("Logged out successfully")
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const menuItems = [
    {
      name: "My Profile",
      icon: <User size={20} />,
      path: "/organizer/profile",
    },
    {
      name: "Events",
      icon: <Briefcase size={20} />,
      path: "/organizer/events",
    },
    {
      name: "Bookings",
      icon: <Calendar size={20} />,
      path: "/organizer/bookings",
    },
    {
      name: "Reviews",
      icon: <Star size={20} />,
      path: "/organizer/reviews",
    },
    {
      name: "Wallet",
      icon: <Wallet size={20} />,
      path: "/organizer/wallet",
    },
    {
      name: "Transactions",
      icon: <BarChart2 size={20} />,
      path: "/organizer/transactions",
    },
    {
      name: "Messages",
      icon: <MessageSquare size={20} />,
      path: "/organizer/messages",
    },
  ]

  return (
    <div className="w-64 bg-white min-h-screen p-6 flex flex-col border-r border-gray-200">
      {/* Profile Avatar */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-xl font-semibold mb-4 overflow-hidden">
          {loading ? (
            <div className="animate-pulse">...</div>
          ) : user?.profile_image ? (
            <img
              src={user.profile_image || "/placeholder.svg"}
              alt={user?.userName || "Profile"}
              className="w-full h-full object-cover"
            />
          ) : (
            getInitials(user?.userName || "")
          )}
        </div>
        <h2 className="text-lg font-semibold text-center">{loading ? "Loading..." : user?.userName || "Organizer"}</h2>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path) ? "bg-gray-100 font-medium" : "text-gray-700 hover:bg-gray-50 hover:text-black"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export default OrganizerSidebar
