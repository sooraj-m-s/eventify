import AdminHeader from "./components/AdminHeader"
import Sidebar from "./components/Sidebar"

const AdminDashboard = () => {

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <AdminHeader />

      <div className="flex flex-1 pt-16">
        <Sidebar />

        <div className="flex-1 p-6">
          <h1>Loading...</h1>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard