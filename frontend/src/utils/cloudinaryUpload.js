import axiosInstance from "./axiosInstance";
import { toast } from "sonner";


/**
 * Upload an image through the backend to Cloudinary.
 * @param {File} file
 * @param {"events"|"profiles"|"id_proofs"|"chat"|"categories"} folder - Cloudinary subfolder key (see backend ASSET_FOLDERS)
 * @returns {Promise<string>} the uploaded image URL
 */
const uploadToCloudinary = async (file, folder) => {
    if (!file.type.match('image.*')) {
        toast.error("Please select an image file");
        throw new Error("Invalid file type");
    }

    if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        throw new Error("File too large");
    }

    const supportedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml', 'image/x-icon'];
    if (!supportedFormats.includes(file.type)) {
        toast.error("Unsupported image format.");
        throw new Error("Unsupported format");
    }
    try {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("folder", folder);
        const response = await axiosInstance.post("/users/", formData);

        return response.data.url;
    } catch (error) {
        console.error("Upload failed:", error);
        console.error("Error response:", error.response);
        
        if (error.response?.data?.error) {
            toast.error(error.response.data.error);
        } else {
            toast.error("Upload failed");
        }
        
        throw error;
    }
};

export default uploadToCloudinary;