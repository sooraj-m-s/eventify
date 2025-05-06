import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Simple protected route that only checks if user exists
const ProtectedRoute = ({ children }) => {
  const { userId, loading } = useSelector((state) => state.auth);
  
  // Show loading indicator while checking authentication
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  // If user exists, render the protected content
  // If not, redirect to home page
  return userId ? children : <Navigate to="/client" replace />;
};

export default ProtectedRoute;