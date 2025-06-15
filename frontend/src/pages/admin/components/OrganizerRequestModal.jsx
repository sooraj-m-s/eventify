import { useState, useEffect } from "react"
import { X, CheckCircle, XCircle, Loader2, AlertCircle, Eye } from "lucide-react"
import axiosInstance from "../../../utils/axiosInstance"
import { toast } from "sonner"


const OrganizerRequestModal = ({ isOpen, onClose, refreshData }) => {
  const [activeTab, setActiveTab] = useState("pending")
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processingId, setProcessingId] = useState(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    if (isOpen) {
      fetchProfiles()
    }
  }, [isOpen, activeTab])

  const fetchProfiles = async () => {
    setLoading(true)
    setError(null)
    try {
      const status = activeTab === "pending" ? "pending" : "rejected"
      const response = await axiosInstance.get("/admin/pending_organizers/", {
        params: { status },
      })
      if (activeTab === "pending") {
            setProfiles((response.data.profiles || []).filter((profile) => !profile.is_rejected))
        } else {
            setProfiles((response.data.profiles || []).filter((profile) => profile.is_rejected))
        }
    } catch (err) {
      console.error("Error fetching organizer profiles:", err)
      setError("Failed to load organizer profiles")
      toast.error("Failed to load organizer profiles")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (profileId) => {
    setProcessingId(profileId)
    try {
      await axiosInstance.post("/admin/pending_organizers/", {
        profile_id: profileId,
        action: "approve",
      })

      setProfiles(profiles.filter((profile) => profile.id !== profileId))
      toast.success("Organizer profile approved successfully")
      setShowDetailModal(false)

      if (refreshData) refreshData()
    } catch (err) {
      console.error("Error approving profile:", err)
      toast.error("Failed to approve organizer profile")
    } finally {
      setProcessingId(null)
    }
  }

  const openRejectForm = (profile) => {
    setSelectedProfile(profile)
    setRejectionReason("")
    setShowRejectForm(true)
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection")
      return
    }

    setProcessingId(selectedProfile.id)
    try {
      await axiosInstance.post("/admin/pending_organizers/", {
        profile_id: selectedProfile.id,
        action: "reject",
        reason: rejectionReason,
      })

      if (activeTab === "pending") {
        setProfiles(profiles.filter((profile) => profile.id !== selectedProfile.id))
      } else {
        setProfiles(
          profiles.map((profile) =>
            profile.id === selectedProfile.id ? { ...profile, rejected_reason: rejectionReason } : profile,
          ),
        )
      }

      toast.success("Organizer profile rejected")
      setShowRejectForm(false)
      setShowDetailModal(false)

      if (refreshData) refreshData()
    } catch (err) {
      console.error("Error rejecting profile:", err)
      toast.error("Failed to reject organizer profile")
    } finally {
      setProcessingId(null)
    }
  }

  const openDetailModal = (profile) => {
    setSelectedProfile(profile)
    setShowDetailModal(true)
  }

  const openImageModal = (imageUrl, e) => {
    e.stopPropagation()
    setSelectedImage(imageUrl)
    setShowImageModal(true)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Organizer Requests</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`px-4 py-2 ${activeTab === "pending" ? "border-b-2 border-black font-medium" : "text-gray-500"}`}
            onClick={() => setActiveTab("pending")}
          >
            Pending Requests
          </button>
          <button
            className={`px-4 py-2 ${activeTab === "rejected" ? "border-b-2 border-black font-medium" : "text-gray-500"}`}
            onClick={() => setActiveTab("rejected")}
          >
            Rejected Requests
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-4">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              {error}
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center text-gray-500 p-8">No {activeTab} organizer requests found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      User
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Place
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {profiles.map((profile) => (
                    <tr key={profile.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {profile.user?.profile_image ? (
                              <img
                                src={profile.user.profile_image || "/placeholder.svg"}
                                alt=""
                                className="h-10 w-10 object-cover"
                              />
                            ) : (
                              <span className="text-gray-500 text-sm">{profile.user?.full_name?.charAt(0) || "U"}</span>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {profile.user?.full_name || "Unknown User"}
                            </div>
                            <div className="text-sm text-gray-500">{profile.user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{profile.place}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openDetailModal(profile)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-full"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedProfile && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Organizer Request Details</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {selectedProfile.user?.profile_image ? (
                    <img
                      src={selectedProfile.user.profile_image || "/placeholder.svg"}
                      alt=""
                      className="h-12 w-12 object-cover"
                    />
                  ) : (
                    <span className="text-gray-500 text-lg">{selectedProfile.user?.full_name?.charAt(0) || "U"}</span>
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-medium">{selectedProfile.user?.full_name || "Unknown User"}</h4>
                  <p className="text-gray-500">{selectedProfile.user?.email}</p>
                </div>
              </div>

              {/* Place */}
              <div>
                <h5 className="text-sm font-medium text-gray-500 mb-1">Place</h5>
                <p className="text-gray-900">{selectedProfile.place}</p>
              </div>

              {/* About */}
              <div>
                <h5 className="text-sm font-medium text-gray-500 mb-1">About</h5>
                <p className="text-gray-900">{selectedProfile.about}</p>
              </div>

              {/* ID Proof */}
              {selectedProfile.id_proof && (
                <div>
                  <h5 className="text-sm font-medium text-gray-500 mb-1">ID Proof</h5>
                  <div className="border border-gray-200 rounded-md p-2 flex justify-center">
                    <img
                      src={selectedProfile.id_proof || "/placeholder.svg"}
                      alt="ID Proof"
                      className="max-w-full max-h-[200px] object-contain rounded cursor-pointer"
                      onClick={(e) => openImageModal(selectedProfile.id_proof, e)}
                    />
                  </div>
                </div>
              )}

              {/* Rejection Reason (for rejected tab) */}
              {activeTab === "rejected" && selectedProfile.rejected_reason && (
                <div className="bg-red-50 p-3 rounded-md">
                  <h5 className="text-sm font-medium text-red-800 mb-1">Reason for Rejection:</h5>
                  <p className="text-red-700">{selectedProfile.rejected_reason}</p>
                </div>
              )}

              {/* Action Buttons */}
              {activeTab === "pending" && (
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => handleApprove(selectedProfile.id)}
                    disabled={processingId === selectedProfile.id}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400 flex items-center"
                  >
                    {processingId === selectedProfile.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => openRejectForm(selectedProfile)}
                    disabled={processingId === selectedProfile.id}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400 flex items-center"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rejection Form Modal */}
      {showRejectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-medium mb-4">Reject Organizer Request</h3>
            <p className="mb-4 text-gray-600">
              Please provide a reason for rejecting this organizer request. This will be visible to the user.
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black mb-4"
              rows={4}
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRejectForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processingId === selectedProfile?.id}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400"
              >
                {processingId === selectedProfile?.id ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Rejecting...
                  </span>
                ) : (
                  "Reject Request"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-3xl max-h-[90vh] p-2 bg-white rounded-lg">
            <button
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
              onClick={(e) => {
                e.stopPropagation()
                setShowImageModal(false)
              }}
            >
              <X className="h-5 w-5" />
            </button>
            <img src={selectedImage || "/placeholder.svg"} alt="ID Proof" className="max-h-[85vh] object-contain" />
          </div>
        </div>
      )}
    </div>
  )
}

export default OrganizerRequestModal