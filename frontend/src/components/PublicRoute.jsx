import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const PublicRoute = ({ children }) => {
  // Get authentication state from Redux store
  const { isAuthenticated } = useSelector(state => state.auth);
  
  // If user is authenticated, redirect to home page
  if (isAuthenticated) {
    return <Navigate to="/client" replace />;
  }
  
  // Otherwise, render the children (login/register page)
  return children;
};