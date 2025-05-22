import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';


const UserProtectedRoute = ({ children }) => {
  const { userRole, loading } = useSelector((state) => state.auth)
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  if (!userRole) {
    if (location.pathname !== '/') {
      toast.error("You're not authorized to access this page. Please log in.");
    }
    return <Navigate to="/" replace />
  }

  return children
};


const OrganizerProtectedRoute = ({ children }) => {
  const { userRole, loading } = useSelector((state) => state.auth)
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  if (userRole !== 'organizer') {
    if (location.pathname !== '/') {
      toast.error("You're not authorized to access this page. Organizer privileges required.")
    }
    return <Navigate to="/" replace />
  }

  return children
};


const AdminProtectedRoute = ({ children }) => {
  const { userRole, loading } = useSelector((state) => state.auth)
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  if (userRole !== 'admin') {
    if (location.pathname !== '/') {
      toast.error("You're not authorized to access this page. Admin privileges required.")
    }
    return <Navigate to="/" replace />
  }

  return children
};

export { UserProtectedRoute, OrganizerProtectedRoute, AdminProtectedRoute };