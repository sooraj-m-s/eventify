import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';


const UserProtectedRoute = ({ children }) => {
  const { userRole, loading } = useSelector((state) => state.auth)
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!userRole) {
    return <Navigate to="/client/unauthorized" replace />
  }

  return children
};


const OrganizerProtectedRoute = ({ children }) => {
  const { userRole, loading } = useSelector((state) => state.auth)
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (userRole !== 'organizer') {
    return <Navigate to="/client" replace />
  }

  return children
};


const AdminProtectedRoute = ({ children }) => {
  const { userRole, loading } = useSelector((state) => state.auth)
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (userRole !== 'admin') {
    return <Navigate to="/client" replace />
  }

  return children
};

export { UserProtectedRoute, OrganizerProtectedRoute, AdminProtectedRoute };