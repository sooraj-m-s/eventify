import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Instagram, Facebook, Linkedin, Menu } from 'lucide-react';
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { logout } from "../../../store/slices/authSlice";
import axiosInstance from "../../../utils/axiosInstance";


const AdminHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate()
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/users/logout/")
      dispatch(logout());
      toast.success("Logged out successfully");
      navigate('/')
    }  catch (error) {
      console.error("Error during logout:", error)
      dispatch(logout())
      navigate('/')
    }
  };

  return (
    <header className="bg-[#f5f0e8] py-4 px-6 flex justify-between items-center fixed top-0 left-0 right-0 z-50 shadow-md">
      {/* Social Media Icons */}
      <div className="flex space-x-4">
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <Instagram className="h-5 w-5 text-black" />
        </a>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
          <Facebook className="h-5 w-5 text-black" />
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
          <Linkedin className="h-5 w-5 text-black" />
        </a>
      </div>

      {/* Logo */}
      <div className="text-center">
        <Link to="/admin/dashboard" className="text-xl font-semibold tracking-widest">
          EVENTIFY
        </Link>
      </div>

      {/* Options Menu */}
      <div className="relative">
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)} 
          className="focus:outline-none hover:text-black cursor-pointer"
          aria-label="Menu"
        >
          <Menu className="h-6 w-6 text-black" />
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
            <Link
              to="/admin/dashboard"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;