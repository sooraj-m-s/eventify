import { Link, useLocation } from "react-router-dom"
import { User, BookOpen, Wallet, MessageSquare } from "lucide-react"
import { useSelector } from "react-redux"


const ProfileSidebar = () => {
  const userData = useSelector((state) => state.auth)
  const location = useLocation()

  const navItems = [
    { name: "Profile", path: "/profile", icon: <User className="h-5 w-5" /> },
    { name: "Bookings", path: "/bookings", icon: <BookOpen className="h-5 w-5" /> },
    { name: "Wallet", path: "/wallet", icon: <Wallet className="h-5 w-5" /> },
    { name: "Messages", path: "/messages", icon: <MessageSquare className="h-5 w-5" /> },
  ]

  return (
    <div className="w-64 bg-white shadow-md flex flex-col h-screen">
      {/* User Info */}
      <div className="p-6 border-b">
        <div className="flex items-center">
          <img
            src={userData.profile_image || "https://res.cloudinary.com/dogt3mael/image/upload/v1754460252/blue-circle-with-white-user_78370-4707_sqk7qc.avif"}
            alt={userData.userName}
            className="w-12 h-12 rounded-full object-cover"
            onError={e => {
              e.target.onerror = null;
              e.target.src = "https://res.cloudinary.com/dogt3mael/image/upload/v1754460252/blue-circle-with-white-user_78370-4707_sqk7qc.avif";
            }}
          />
          <div className="ml-3">
            <h3 className="font-semibold text-gray-900">{userData?.userName}</h3>
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