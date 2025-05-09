import { Routes, Route } from 'react-router-dom';
import Register from './pages/auth/Register';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CompleteRegistration from './pages/auth/CompleteRegistration';
import Login from './pages/auth/Login';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/landing/home';
import AdminLogin from './pages/admin/login';
import AdminHeader from './pages/admin/components/AdminHeader';
import UserManagement from './pages/admin/UserManagement';
import AdminDashboard from './pages/admin/AdminDashboard';
import EventManagement from './pages/admin/EventManagement';
import UserProfile from './pages/user/UserProfile';
import { UserProtectedRoute, OrganizerProtectedRoute, AdminProtectedRoute } from './components/ProtectedRoute';
import NotFound from './pages/NotFound';
import { UserPublicRoute, AdminPublicRoute } from './components/PublicRoute';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';


function App() {

  return (
    <>
      <Routes>
        {/* Client Routes */}
        <Route path="client/*"
          element={
            <>
              <Header />
              <div className="pt-16">
                <Routes>
                  <Route path="register" element={<UserPublicRoute><Register /></UserPublicRoute>} />
                  <Route path="register/complete" element={<UserPublicRoute><CompleteRegistration /></UserPublicRoute>} />
                  <Route path="login" element={<UserPublicRoute><Login /></UserPublicRoute>} />
                  <Route path="forgot_password" element={<UserPublicRoute><ForgotPassword /></UserPublicRoute>} />
                  <Route path="reset_password/" element={<UserPublicRoute><ResetPassword /></UserPublicRoute>} />
                  <Route path="" element={<Home />} />
                  <Route path="profile" element={<UserProtectedRoute><UserProfile /></UserProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              <Footer />
            </>
          }
        />

        {/* Admin Routes */}
        <Route path="admin/*"
          element={
            <>
              <AdminHeader />
              <Routes>
                <Route path="login" element={<AdminPublicRoute><AdminLogin /></AdminPublicRoute>} />
                <Route path="dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
                <Route path="users" element={<AdminProtectedRoute><UserManagement /></AdminProtectedRoute>} />
                <Route path="events" element={<AdminProtectedRoute><EventManagement /></AdminProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      <ToastContainer autoClose={2000}/>
    </>
  )
}

export default App