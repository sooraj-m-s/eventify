import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"
import AdminHeader from "./components/AdminHeader"
import Sidebar from "./components/Sidebar"
import { Loader2, Search, UserPlus, AlertTriangle } from "lucide-react"
import OrganizerRequestModal from "./components/OrganizerRequestModal"
import { fetchUserList, getPendingOrganizerProfiles, updateUserBlockStatus } from "@/api/admin"


// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, user, action, loading }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 backdrop-blur-sm bg-black/30 bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-6 w-6 text-yellow-500 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">
            Confirm {action}
          </h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          Are you sure you want to {action.toLowerCase()} <strong>{user?.full_name}</strong>?
          {action === "Block" && " This will prevent them from accessing the platform."}
          {action === "Unblock" && " This will restore their access to the platform."}
        </p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-white rounded-md flex items-center disabled:opacity-50 ${
              action === "Block" 
                ? "bg-red-600 hover:bg-red-700" 
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              action
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState("clients")
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [inputValue, setInputValue] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [updatingUserId, setUpdatingUserId] = useState(null)
  const [showOrganizerModal, setShowOrganizerModal] = useState(false)
  const [pendingOrganizerCount, setPendingOrganizerCount] = useState(0)
  const searchTimeoutRef = useRef(null)

  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    user: null,
    action: null
  })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const role = activeTab === "clients" ? "user" : "organizer"
        const response = await fetchUserList(role, currentPage, searchTerm);

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

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  const fetchPendingOrganizerCount = async () => {
    try {
      const response = await getPendingOrganizerProfiles();
      const pendingCount = response.data.profiles.filter(profile => !profile.is_approved && !profile.is_rejected).length;
      setPendingOrganizerCount(pendingCount);
    } catch (err) {
      console.error("Error fetching pending organizer count:", err)
    }
  }

  // Open confirmation modal
  const handleStatusChangeClick = (user) => {
    const action = user.is_blocked ? "Unblock" : "Block"
    setConfirmationModal({
      isOpen: true,
      user: user,
      action: action
    })
  }

  // Handle confirmed status change
  const handleConfirmedStatusChange = async () => {
    const { user } = confirmationModal
    setUpdatingUserId(user.user_id)
    
    try {
      const newStatus = !user.is_blocked
      await updateUserBlockStatus(user.user_id, newStatus);

      setUsers(users.map((u) => (u.user_id === user.user_id ? { ...u, is_blocked: newStatus } : u)))
      toast.success(`User ${newStatus ? "blocked" : "unblocked"} successfully`)
      
      // Close modal
      setConfirmationModal({ isOpen: false, user: null, action: null })
    } catch (err) {
      console.error("Error updating user status:", err)
      toast.error("Failed to update user status")
    } finally {
      setUpdatingUserId(null)
    }
  }

  // Close confirmation modal
  const closeConfirmationModal = () => {
    if (updatingUserId) return // Prevent closing while updating
    setConfirmationModal({ isOpen: false, user: null, action: null })
  }

  const handleSearchChange = (value) => {
    setInputValue(value)
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(value)
      setCurrentPage(1)
    }, 3000)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    setSearchTerm(inputValue)
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
                  value={inputValue}
                  onChange={(e) => handleSearchChange(e.target.value)}
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
                            onClick={() => handleStatusChangeClick(user)}
                            disabled={updatingUserId === user.user_id}
                            className={`px-4 py-1 text-xs font-medium rounded disabled:opacity-50 ${
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={handleConfirmedStatusChange}
        user={confirmationModal.user}
        action={confirmationModal.action}
        loading={updatingUserId !== null}
      />
    </div>
  )
}

export default UserManagement