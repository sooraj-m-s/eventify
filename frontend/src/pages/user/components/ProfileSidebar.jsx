import { Link, useLocation } from "react-router-dom"

const ProfileSidebar = ({ user, onLogout }) => {
  const location = useLocation()

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "C"
  }

  return (
    <div className="w-full md:w-80 border-r-2 border-black">
      <div className="flex flex-col items-center py-8">
        <div className="w-24 h-24 bg-[#333] rounded-full flex items-center justify-center text-white text-3xl font-semibold mb-4">
          {getInitial(user?.firstName)}
        </div>
        <h2 className="text-lg font-semibold text-center">
          {user?.firstName} {user?.lastName}
        </h2>
      </div>

      <div className="px-6 space-y-3 mb-6">
        <Link
          to="/client/profile"
          className={`block w-full py-3 text-white text-center font-medium rounded ${
            location.pathname === "/client/profile" ? "bg-[#4a4a4a]" : "bg-black"
          }`}
        >
          My Profile
        </Link>
        <Link
          to="/client/bookings"
          className={`block w-full py-3 text-white text-center font-medium rounded ${
            location.pathname === "/client/bookings" ? "bg-[#4a4a4a]" : "bg-black"
          }`}
        >
          Bookings
        </Link>
        <Link
          to="/client/wallet"
          className={`block w-full py-3 text-white text-center font-medium rounded ${
            location.pathname === "/client/wallet" ? "bg-[#4a4a4a]" : "bg-black"
          }`}
        >
          Wallet
        </Link>
        <Link
          to="/client/hosted-events"
          className={`block w-full py-3 text-white text-center font-medium rounded ${
            location.pathname === "/client/hosted-events" ? "bg-[#4a4a4a]" : "bg-[#8a8a8a]"
          }`}
        >
          Hosted Events
        </Link>
      </div>

      <div className="px-6 mt-auto pt-8 pb-6">
        <button onClick={onLogout} className="w-full py-3 bg-[#d9d9d9] text-black text-center font-medium rounded">
          Logout
        </button>
      </div>
    </div>
  )
}

export default ProfileSidebar