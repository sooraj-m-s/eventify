import { AdminProtectedRoute } from '@/components/ProtectedRoute'
import { AdminPublicRoute } from '@/components/PublicRoute'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import CategoryManagement from '@/pages/admin/CategoryManagement'
import AdminHeader from '@/pages/admin/components/AdminHeader'
import EventManagement from '@/pages/admin/EventManagement'
import AdminLogin from '@/pages/admin/login'
import UserManagement from '@/pages/admin/UserManagement'
import React from 'react'
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
                <Route path="events" element={<AdminProtectedRoute><EventManagement /></AdminProtectedRoute>} />
            </Routes>
        </>
    )
}

export default AdminRoutes