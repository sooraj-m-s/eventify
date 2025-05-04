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
import { ProtectedRoute } from './components/ProtectedRoute';
import NotFound from './pages/NotFound';
import { PublicRoute } from './components/PublicRoute';


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
                  <Route path="register" element={<PublicRoute><Register /></PublicRoute>} />
                  <Route path="register/complete" element={<PublicRoute><CompleteRegistration /></PublicRoute>} />
                  <Route path="login" element={<PublicRoute><Login /></PublicRoute>} />
                  <Route path="" element={<Home />} />
                  <Route path="userprofile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
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
                <Route path="login" element={<AdminLogin />} />
                <Route path="dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
                <Route path="users" element={<ProtectedRoute requiredRole="admin"><UserManagement /></ProtectedRoute>} />
                <Route path="events" element={<ProtectedRoute requiredRole="admin"><EventManagement /></ProtectedRoute>} />
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