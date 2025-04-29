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


function App() {

  return (
    <>
      {/* Client Routes */}
      <Routes>
        <Route path="client/*"
          element={
            <>
              <Header />
              <div className="pt-16">
                <Routes>
                  <Route path="register" element={<Register />} />
                  <Route path="register/complete" element={<CompleteRegistration />} />
                  <Route path="login" element={<Login />} />
                  <Route path="home" element={<Home />} />
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
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="events" element={<EventManagement />} />
              </Routes>
            </>
          }
        />
      </Routes>
      
      <ToastContainer autoClose={2000}/>
    </>
  )
}

export default App

