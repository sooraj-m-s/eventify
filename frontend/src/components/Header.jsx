import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';


const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const { userId, userName } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    console.log('Logged out');
  };

  return (
    <header className="bg-black text-white p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-50 shadow-md">
      <div className="text-xl font-bold">Eventify</div>
      <nav className="flex space-x-6">
        <a href="/" className="hover:text-gray-300">Home</a>
        <a href="/venue" className="hover:text-gray-300">Venue</a>
        <a href="/organizers" className="hover:text-gray-300">Organizers</a>
        <a href="/about" className="hover:text-gray-300">About</a>
        <a href="/contact" className="hover:text-gray-300">Contact Us</a>
      </nav>
      <div className="flex space-x-4">
        {userId ? (
          <>
            <span className="font-medium">{userName}</span>
            <button
              onClick={handleLogout}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button onClick={()=>navigate('/client/login')} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              Login
            </button>
            <button onClick={()=>navigate('/client/register')} className="bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300">
              Signup
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;