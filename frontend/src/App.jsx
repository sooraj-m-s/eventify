import { Route, Routes } from "react-router-dom"
import UserRoutes from "./routes/UserRoutes"
import OrganizerRoutes from "./routes/OrganizerRoutes"
import AdminRoutes from "./routes/AdminRoutes"
import NotFound from "./pages/NotFound"
import { NotificationProvider } from "./services/NotificationContext"


function App() {

  return (
    <NotificationProvider>
      <Routes>
        {/* Client Routes */}
        <Route path="/*" element={<UserRoutes />} />

        {/* Organizer Routes */}
        <Route path="organizer/*" element={<OrganizerRoutes />} />

        {/* Admin Routes */}
        <Route path="admin/*" element={<AdminRoutes />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </NotificationProvider>
  )
}

export default App