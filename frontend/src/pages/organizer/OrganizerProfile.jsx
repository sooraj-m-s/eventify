import { useState, useEffect } from "react"
import { MapPin, Mail } from "lucide-react"
import { useSelector } from "react-redux"
import OrganizerSidebar from "./components/OrganizerSidebar"
import { toast } from "sonner"
import { fetchOrganizerProfile } from "@/api/organizer"


const OrganizerProfile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const user = useSelector((state) => state.auth)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const response = await fetchOrganizerProfile();
        setProfile(response.data)
        setError(null)
      } catch (err) {
        console.error("Error fetching organizer profile:", err)
        setError("Failed to load profile. Please try again later.")
        toast.error(err.response.data['detail'])
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <OrganizerSidebar />

      <div className="flex-1">
        <div className="max-w-6xl mx-auto p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">My Profile</h1>
          </div>

          {loading ? (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="animate-pulse space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="h-20 w-20 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-48"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-24 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="text-red-500 text-center py-8">{error}</div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Profile Header */}
              <div className="bg-white border-b p-8">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-600 shadow-sm">
                    {user?.profile_image ? (
                      <img
                        src={user.profile_image || "/placeholder.svg"}
                        alt={user?.userName}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      getInitials(user?.userName || "")
                    )}
                  </div>
                  <div className="text-center md:text-left">
                    <h2 className="text-2xl font-bold">{user?.full_name}</h2>
                    <p className="text-gray-600 flex items-center justify-center md:justify-start gap-1 mt-1">
                      <Mail size={16} />
                      {user?.userEmail}
                    </p>
                    {profile?.place && (
                      <p className="text-gray-600 flex items-center justify-center md:justify-start gap-1 mt-1">
                        <MapPin size={16} />
                        {profile.place}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="p-8">

                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 border-b pb-2">About Me</h3>
                    <div className="px-4 py-3 border border-gray-200 rounded-md bg-gray-50 shadow-sm min-h-[120px]">
                      {profile?.about ? (
                        <p className="whitespace-pre-line">{profile.about}</p>
                      ) : (
                        <p className="text-gray-400 italic">No information provided</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Approval Status */}
                {profile && (
                  <div className="mt-8 pt-4 border-t">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Organizer Status</h3>
                    <div className="flex items-center gap-2">
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          profile.is_approved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {profile.is_approved ? "Approved" : "Pending Approval"}
                      </div>

                      {profile.approved_at && (
                        <span className="text-sm text-gray-500">
                          Approved on: {new Date(profile.approved_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrganizerProfile