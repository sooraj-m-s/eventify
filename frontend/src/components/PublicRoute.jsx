import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';


const UserPublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth);
  
  // If user is authenticated, redirect to home page
  if (isAuthenticated) {
    return <Navigate to="/client" replace />;
  }
  
  return children;
};


const AdminPublicRoute = ({ children }) => {
  const { isAuthenticated, userRole } = useSelector((state) => state.auth)
  
  // If user is authenticated, redirect to home page
  if (isAuthenticated && userRole === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return children;
};


export { UserPublicRoute, AdminPublicRoute };