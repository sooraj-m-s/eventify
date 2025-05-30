import { Route, Routes } from 'react-router-dom'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { UserProtectedRoute } from '@/components/ProtectedRoute'
import { UserPublicRoute } from '@/components/PublicRoute'
import CompleteRegistration from '@/pages/auth/CompleteRegistration'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import ResetPassword from '@/pages/auth/ResetPassword'
import EventDetail from '@/pages/landing/EventDetail'
import Home from '@/pages/landing/home'
import BecomeOrganizer from '@/pages/user/BecomeOrganizer'
import UserBookings from '@/pages/user/UserBookings'
import UserProfile from '@/pages/user/UserProfile'
import NotFound from '@/pages/NotFound'
import PaymentPage from '@/pages/PaymentPage'
import WalletPage from '@/pages/user/wallet'
import Messages from '@/pages/user/Messages'
import AdvancedSearchEvents from '@/pages/landing/AdvancedSearchEvents'
import OrganizerListing from '@/pages/landing/OrganizerListing'


const UserRoutes = () => {
    return (
        <>
            <Header />
            <div className="pt-16">
                <Routes>
                    {/* Public Routes */}
                    <Route path="" element={<Home />} />
                    <Route path="events" element={<AdvancedSearchEvents />} />
                    <Route path="event_detail/:eventId" element={<EventDetail />} />
                    <Route path="organizers/" element={<OrganizerListing />} />

                    {/* Auth Routes */}
                    <Route path="register" element={<UserPublicRoute><Register /></UserPublicRoute>} />
                    <Route path="register/complete" element={<UserPublicRoute><CompleteRegistration /></UserPublicRoute>} />
                    <Route path="login" element={<UserPublicRoute><Login /></UserPublicRoute>} />
                    <Route path="forgot_password" element={<UserPublicRoute><ForgotPassword /></UserPublicRoute>} />
                    <Route path="reset_password/" element={<UserPublicRoute><ResetPassword /></UserPublicRoute>} />

                    {/* Protected Routes */}
                    <Route path="profile" element={<UserProtectedRoute><UserProfile /></UserProtectedRoute>} />
                    <Route path="become_organizer" element={<UserProtectedRoute><BecomeOrganizer /></UserProtectedRoute>} />
                    <Route path="bookings" element={<UserProtectedRoute><UserBookings /></UserProtectedRoute>} />
                    <Route path="payment/:bookingId" element={<UserProtectedRoute><PaymentPage /></UserProtectedRoute>} />
                    <Route path="wallet" element={<UserProtectedRoute><WalletPage /></UserProtectedRoute>} />
                    <Route path="messages" element={<UserProtectedRoute><Messages /></UserProtectedRoute>} />

                    {/* Fallback */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </div>
            <Footer />
        </>
    )
}

export default UserRoutes