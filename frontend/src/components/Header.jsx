import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { Navigate, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from "react"
import { toast } from 'react-toastify';
import axiosInstance from '../utils/axiosInstance';


const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const { userId, userName, userEmail, profile_image } = useSelector((state) => state.auth)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  console.log("profile_image", profile_image);
  

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/users/logout/")
      dispatch(logout());
      toast.success("Logged out successfully");
      Navigate("/client/login")
    }  catch (error) {
      console.error("Error during logout:", error)
      dispatch(logout())
    }
  };

  const getInitials = (name) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <header className="bg-black text-white p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-50 shadow-md">
      <div className="text-xl font-bold">Eventify</div>
      <nav className="flex space-x-6">
        <a href="/client" className="hover:text-gray-300">Home</a>
        <a href="/venue" className="hover:text-gray-300">Venue</a>
        <a href="/organizers" className="hover:text-gray-300">Organizers</a>
        <a href="/about" className="hover:text-gray-300">About</a>
        <a href="/contact" className="hover:text-gray-300">Contact Us</a>
      </nav>
      <div className="flex items-center space-x-4">
        {userId ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center focus:outline-none"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <div className="relative w-10 h-10 overflow-hidden bg-gray-200 rounded-full cursor-pointer group">
                {profile_image ? (
                  <img
                    src={profile_image || "/placeholder.svg"}
                    alt={userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-800 font-medium">
                    {getInitials(userName)}
                  </div>
                )}
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50 text-gray-800">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                </div>

                <button
                  onClick={() => {
                    navigate("/client/profile")
                    setDropdownOpen(false)
                  }}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Profile
                </button>

                <button
                  onClick={() => {
                    navigate("/client/settings")
                    setDropdownOpen(false)
                  }}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Settings
                </button>

                <button
                  onClick={() => {
                    navigate("/client/new-team")
                    setDropdownOpen(false)
                  }}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  About
                </button>

                <div className="border-t border-gray-100 my-1"></div>

                <button
                  onClick={() => {
                    handleLogout()
                    setDropdownOpen(false)
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <button
              onClick={() => navigate("/client/login")}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/client/register")}
              className="bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300"
            >
              Signup
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;