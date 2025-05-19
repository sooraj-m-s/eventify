import { AdminProtectedRoute } from '@/components/ProtectedRoute'
import { AdminPublicRoute } from '@/components/PublicRoute'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminEventManagement from '@/pages/admin/AdminEventManagement'
import CategoryManagement from '@/pages/admin/CategoryManagement'
import AdminHeader from '@/pages/admin/components/AdminHeader'
import AdminLogin from '@/pages/admin/login'
import UserManagement from '@/pages/admin/UserManagement'
import NotFound from '@/pages/NotFound'
import { Route, Routes } from 'react-router-dom'


const AdminRoutes = () => {
    return (
        <>
            <AdminHeader />
            <Routes>
                <Route path="login" element={<AdminPublicRoute><AdminLogin /></AdminPublicRoute>} />
                <Route path="dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
                <Route path="users" element={<AdminProtectedRoute><UserManagement /></AdminProtectedRoute>} />
                <Route path="categories" element={<AdminProtectedRoute><CategoryManagement /></AdminProtectedRoute>} />
                <Route path="events" element={<AdminProtectedRoute><AdminEventManagement /></AdminProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    )
}

export default AdminRoutes