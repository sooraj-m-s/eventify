import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import AdminHeader from "./components/AdminHeader"
import Sidebar from "./components/Sidebar"
import { Search } from "lucide-react"

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState("clients")
  const [users, setUsers] = useState([])
  const [organizers, setOrganizers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        if (activeTab === "clients") {
          const response = await axios.get("/users/clients", {
            params: { page: currentPage, search: searchTerm },
          })
          setUsers(response.data.results || [])
          setTotalPages(response.data.total_pages || 1)
        } else {
          const response = await axios.get("/users/organizers", {
            params: { page: currentPage, search: searchTerm },
          })
          setOrganizers(response.data.results || [])
          setTotalPages(response.data.total_pages || 1)
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load data. Please try again.")
        toast.error("Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [activeTab, currentPage, searchTerm])

  // Handle user status change (block/unblock)
  const handleStatusChange = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === "BLOCK" ? "UNBLOCK" : "BLOCK"
      await axios.patch(`/users/${userId}/status`, {
        status: newStatus === "BLOCK" ? false : true,
      })

      // Update local state
      if (activeTab === "clients") {
        setUsers(
          users.map((user) => (user.id === userId ? { ...user, status: newStatus === "BLOCK" ? false : true } : user)),
        )
      } else {
        setOrganizers(
          organizers.map((organizer) =>
            organizer.id === userId ? { ...organizer, status: newStatus === "BLOCK" ? false : true } : organizer,
          ),
        )
      }

      toast.success(`User ${newStatus.toLowerCase()}ed successfully`)
    } catch (err) {
      console.error("Error updating user status:", err)
      toast.error("Failed to update user status")
    }
  }

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1) // Reset to first page on new search
  }

  // Get data based on active tab
  const getData = () => {
    return activeTab === "clients" ? users : organizers
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <AdminHeader />

      <div className="flex flex-1 pt-16">
        <Sidebar />

        <div className="flex-1 p-6">
          <h1 className="text-2xl font-semibold mb-6">User Management</h1>

          <div className="bg-white rounded-md shadow-sm">
            {/* Tabs and Search */}
            <div className="flex justify-between items-center p-4 border-b">
              <div className="flex space-x-1">
                <button
                  className={`px-6 py-2 rounded-md ${
                    activeTab === "clients" ? "bg-gray-200 font-medium" : "hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab("clients")}
                >
                  Clients
                </button>
                <button
                  className={`px-6 py-2 rounded-md ${
                    activeTab === "organizers" ? "bg-gray-200 font-medium" : "hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab("organizers")}
                >
                  Organizers
                </button>
              </div>

              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder={`Search ${activeTab}`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 w-64"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </form>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left bg-gray-50">
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Profile</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-red-500">
                        {error}
                      </td>
                    </tr>
                  ) : getData().length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        No {activeTab} found
                      </td>
                    </tr>
                  ) : (
                    getData().map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.name || user.full_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {user.profile_image ? (
                              <img
                                src={user.profile_image || "/placeholder.svg"}
                                alt={user.name || user.full_name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-gray-500 text-xs">No Image</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleStatusChange(user.id, user.is_active ? "BLOCK" : "UNBLOCK")}
                            className={`px-4 py-1 text-xs font-medium rounded ${
                              user.is_active
                                ? "bg-red-200 text-red-800 hover:bg-red-300"
                                : "bg-green-200 text-green-800 hover:bg-green-300"
                            }`}
                          >
                            {user.is_active ? "BLOCK" : "UNBLOCK"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && !error && getData().length > 0 && (
              <div className="flex justify-center items-center space-x-2 p-4 border-t">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md border disabled:opacity-50"
                >
                  &lt;
                </button>

                {[...Array(totalPages).keys()].map((page) => (
                  <button
                    key={page + 1}
                    onClick={() => setCurrentPage(page + 1)}
                    className={`w-8 h-8 rounded-md ${
                      currentPage === page + 1 ? "bg-gray-800 text-white" : "border hover:bg-gray-100"
                    }`}
                  >
                    {page + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-md border disabled:opacity-50"
                >
                  &gt;
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserManagement