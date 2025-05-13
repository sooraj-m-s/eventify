import { useState, useEffect } from "react"
import { toast } from "sonner"
import AdminHeader from "./components/AdminHeader"
import Sidebar from "./components/Sidebar"
import { Loader2, Search, UserPlus } from "lucide-react"
import axiosInstance from "../../utils/axiosInstance"
import OrganizerRequestModal from "./components/OrganizerRequestModal"


const UserManagement = () => {
  const [activeTab, setActiveTab] = useState("clients")
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [updatingUserId, setUpdatingUserId] = useState(null)
  const [showOrganizerModal, setShowOrganizerModal] = useState(false)
  const [pendingOrganizerCount, setPendingOrganizerCount] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const role = activeTab === "clients" ? "user" : "organizer"

        const response = await axiosInstance.get("/admin/user_list/", {
          params: {
            role: role,
            page: currentPage,
            search: searchTerm,
          },
        })
        console.log("Response data:", response.data)

        // Set the users data based on the active tab
        if (activeTab === "clients") {
          setUsers(response.data.results || [])
        } else {
          setUsers(response.data.results || [])
        }

        setTotalPages(Math.ceil(response.data.count / 10) || 1)
        fetchPendingOrganizerCount()
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

  const fetchPendingOrganizerCount = async () => {
    try {
      const response = await axiosInstance.get("/admin/pending_organizers/", {
        params: { status: "pending", count_only: true },
      })
      const pendingCount = response.data.profiles.filter(profile => !profile.is_approved && !profile.is_rejected).length;
      setPendingOrganizerCount(pendingCount);
    } catch (err) {
      console.error("Error fetching pending organizer count:", err)
    }
  }

  const handleStatusChange = async (userId, isBlocked) => {
    setUpdatingUserId(userId)
    try {
      const newStatus = !isBlocked

      await axiosInstance.patch(`/admin/users_status/${userId}/`, {
        is_blocked: newStatus,
      })

      // Update local state
      setUsers(users.map((user) => (user.user_id === userId ? { ...user, is_blocked: newStatus } : user)))

      toast.success(`User ${newStatus ? "blocked" : "unblocked"} successfully`)
    } catch (err) {
      console.error("Error updating user status:", err)
      toast.error("Failed to update user status")
    } finally {
      setUpdatingUserId(null)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col">
      <AdminHeader />

      <div className="flex flex-1 pt-16">
        <Sidebar />

        <div className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">User Management</h1>

            {/* Organizer Requests Button */}
            <button
              onClick={() => setShowOrganizerModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <UserPlus size={18} />
              Organizer Requests
              {pendingOrganizerCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingOrganizerCount}
                </span>
              )}
            </button>
          </div>

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
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        No {activeTab} found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.user_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.user_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.full_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.mobile}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {user.profile_image ? (
                              <img
                                src={user.profile_image || "/placeholder.svg"}
                                alt={user.full_name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-gray-500 text-xs">No Image</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleStatusChange(user.user_id, user.is_blocked)}
                            className={`px-4 py-1 text-xs font-medium rounded ${
                              user.is_blocked
                                ? "bg-red-200 text-red-800 hover:bg-red-300"
                                : "bg-green-200 text-green-800 hover:bg-green-300"
                            }`}
                          >
                            {updatingUserId === user.user_id ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Loading...
                              </>
                            ) : !user.is_blocked ? (
                              "Active"
                            ) : (
                              "Blocked"
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <OrganizerRequestModal
              isOpen={showOrganizerModal}
              onClose={() => setShowOrganizerModal(false)}
              refreshData={() => {
                fetchPendingOrganizerCount()
                if (activeTab === "organizers") {
                  setCurrentPage(1)
                }
              }}
            />

            {/* Pagination */}
            {!loading && !error && users.length > 0 && (
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