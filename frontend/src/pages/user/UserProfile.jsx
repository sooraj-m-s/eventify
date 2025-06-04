import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Pencil } from "lucide-react";
import ProfileSidebar from "./components/ProfileSidebar";
import axiosInstance from "../../utils/axiosInstance";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ChangePasswordModal from "./components/ChangePasswordModal";
import { updateUser } from "@/store/slices/authSlice";
import ProfileEdit from "./components/ProfileEdit";


const UserProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const role = useSelector((state) => state.auth.userRole);
  const [profile, setProfile] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/users/profile/");
        setProfile(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const initialFormData = useMemo(
    () => ({
      full_name: profile?.full_name || "",
      mobile: profile?.mobile || "",
      profile_image: profile?.profile_image || "",
    }),
    [profile]
  );

  const handleSubmit = useCallback(
    async (formData) => {
      try {
        setLoading(true);
        const response = await axiosInstance.patch("/users/profile/", formData);
        setProfile(response.data);
        dispatch(
          updateUser({
            name: response.data.full_name,
            profile_image: response.data.profile_image,
          })
        );
        setIsEditing(false);
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [dispatch]
  );

  const ProfileView = ({ isVisible }) => {
    if (!isVisible || loading) return null;
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium">{profile?.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Mobile</p>
              <p className="font-medium">{profile?.mobile || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Joined</p>
              <p className="font-medium">{profile?.created_at}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{profile?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium">{profile?.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{profile?.location || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <ProfileSidebar />
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b">
            <h1 className="text-2xl font-semibold">Profile</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center text-gray-700 hover:text-gray-900"
              >
                <Pencil className="h-5 w-5 mr-1" />
                <span>Edit</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ) : error ? (
            <div className="p-6 text-red-500">{error}</div>
          ) : (
            <>
              <ProfileEdit
                key="profile-edit"
                isVisible={isEditing}
                initialFormData={initialFormData}
                profile={profile}
                onSubmit={handleSubmit}
                setIsPasswordModalOpen={setIsPasswordModalOpen}
                setIsEditing={setIsEditing}
              />
              <ProfileView key="profile-view" isVisible={!isEditing} />
            </>
          )}

          <div className="p-6 border-t text-center">
            {role !== "organizer" && (
              <div className="mt-4">
                <p className="mb-2 text-gray-700">Want to become an organizer? Click here.</p>
                <button
                  onClick={() => navigate("/become_organizer")}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                >
                  Become an Organizer
                </button>
              </div>
            )}
            {role === "organizer" && (
              <div className="mt-4">
                <button
                  onClick={() => navigate("/organizer/profile")}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                >
                  Go to Organizer Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};

export default UserProfile;