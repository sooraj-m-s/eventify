import { Route, Routes } from "react-router-dom"
import Footer from "@/components/Footer"
import Header from "@/components/Header"
import { OrganizerProtectedRoute } from "@/components/ProtectedRoute"
import OrganizerEventManagement from "@/pages/organizer/OrganizerEventManagement"
import OrganizerProfile from "@/pages/organizer/OrganizerProfile"
import OrganizerBookings from "@/pages/organizer/OrganizerBookings"


const OrganizerRoutes = () => {
    return (
        <>
            <Header />
            <div className='pt-16'>
                <Routes>
                    <Route path="profile" element={<OrganizerProtectedRoute><OrganizerProfile /></OrganizerProtectedRoute>} />
                    <Route path="events" element={<OrganizerProtectedRoute><OrganizerEventManagement /></OrganizerProtectedRoute>} />
                    <Route path="bookings" element={<OrganizerProtectedRoute><OrganizerBookings /></OrganizerProtectedRoute>} />
                </Routes>
            </div>
            <Footer />

        </>
    )
}

export default OrganizerRoutes