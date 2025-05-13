import { Link, useLocation } from "react-router-dom"
import { User, Briefcase, Calendar, Star, Wallet, BarChart2, MessageSquare } from "lucide-react"
import { useSelector } from "react-redux"


const OrganizerSidebar = () => {
  const location = useLocation()
  const user = useSelector((state) => state.auth)

  const isActive = (path) => {
    return location.pathname === path
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
          <img src={user.profile_image || "/placeholder.svg"} alt={user?.userName || "Profile"} className="w-full h-full object-cover" />
        </div>
        <h2 className="text-lg font-semibold text-center">{user?.userName || "Organizer"}</h2>
        <p>Organizer</p>
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