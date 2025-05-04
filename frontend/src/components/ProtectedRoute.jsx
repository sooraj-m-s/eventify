import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Base protected route that requires authentication
export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  
  if (loading) {
    return <div>Loading...</div>; // Or your loading component
  }
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Route that requires admin role
export const AdminRoute = () => {
  const { userRole, loading } = useSelector((state) => state.auth);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return userRole === 'admin' ? <Outlet /> : <Navigate to="/unauthorized" replace />;
};

// Route that requires organizer role or admin role
export const OrganizerRoute = () => {
  const { userRole, loading } = useSelector((state) => state.auth);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return userRole === 'organizer' || userRole === 'admin' ? 
    <Outlet /> : <Navigate to="/unauthorized" replace />;
};

// Route that requires any authenticated user (user, organizer, or admin)
export const UserRoute = () => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};