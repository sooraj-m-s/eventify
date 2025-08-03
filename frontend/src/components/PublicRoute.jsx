import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';


const UserPublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth);
  
  // If user is authenticated, redirect to home page
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};


const AdminPublicRoute = ({ children }) => {
  const { isAuthenticated, userRole } = useSelector((state) => state.auth)
  
  // If authenticated and is admin, redirect to admin dashboard
  if (isAuthenticated && userRole === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  // If authenticated but not admin, redirect to home page
  if (isAuthenticated && userRole !== "admin") {
    return <Navigate to="/" replace />;
  }
  
  return children;
};


export { UserPublicRoute, AdminPublicRoute };