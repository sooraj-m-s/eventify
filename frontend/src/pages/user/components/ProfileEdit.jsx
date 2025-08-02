import React, { useState, useRef, useCallback } from "react";
import { Upload, X, Lock } from "lucide-react";
import { toast } from "sonner";
import uploadToCloudinary from "@/utils/cloudinaryUpload";


const ProfileEdit = React.memo(({ isVisible, initialFormData, profile, onSubmit, setIsPasswordModalOpen, setIsEditing }) => {
    const [formData, setFormData] = useState(initialFormData);
    const [imageUploading, setImageUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    const handleImageClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleImageChange = useCallback(async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setImageUploading(true);
            const imageUrl = await uploadToCloudinary(file);
            setFormData((prev) => ({
                ...prev,
                profile_image: imageUrl,
            }));
            toast.success("Image uploaded successfully");
        } catch (error) {
            console.error("Error uploading image:", error);
            toast.error(error.response.data['error'] || "Failed to upload image");
        } finally {
            setImageUploading(false);
        }
    }, []);

    const handleRemoveImage = useCallback(() => {
        setFormData((prev) => ({
            ...prev,
            profile_image: "",
        }));
    }, []);

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            setLoading(true);
            try {
                await onSubmit(formData);
                toast.success("Profile updated successfully");
            } catch (error) {
                console.error("Error updating profile:", error.response);
                toast.error(error?.response?.data?.['error'] || "Failed to update profile");
            } finally {
                setLoading(false);
            }
        },
        [formData, onSubmit]
    );

    if (!isVisible || loading) return null;

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Profile Image Upload */}
            <div className="flex flex-col items-center vadisabled:bg-gray-400mb-6">
                <div className="relative">
                    {formData.profile_image ? (
                        <>
                            <img
                                src={formData.profile_image || "/placeholder.svg"}
                                alt="Profile"
                                className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
                            />
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                title="Remove image"
                            >
                                <X size={16} />
                            </button>
                        </>
                    ) : (
                        <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-xl font-medium">
                                {formData.full_name?.charAt(0)?.toUpperCase() || "U"}
                            </span>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleImageClick}
                        disabled={imageUploading}
                        className="absolute bottom-0 right-0 bg-white text-gray-700 rounded-full p-2 shadow-md hover:bg-gray-100"
                    >
                        {imageUploading ? (
                            <div className="w-5 h-5 border-2 border-t-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <Upload size={16} />
                        )}
                    </button>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                    />
                </div>
                <p className="text-sm text-gray-500 mt-2">Click to change profile picture</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                    </label>
                    <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <input
                        type="text"
                        id="email"
                        name="email"
                        value={profile?.email || ""}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                    />
                </div>

                <div>
                    <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        id="mobile"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                    />
                </div>

                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                    </label>
                    <input
                        type="text"
                        id="role"
                        name="role"
                        value={profile?.location || "N/A"}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                    />
                </div>
            </div>

            <div className="flex justify-between space-x-4 pt-4 border-t">
                <button
                    type="button"
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 flex items-center"
                >
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                </button>
                <div className="flex space-x-4">
                    <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400"
                        disabled={loading || imageUploading}
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </form>
    );
});

export default ProfileEdit;