import axios from "axios";
import { toast } from "sonner";


const uploadToCloudinary = async (file) => {
    if (!file.type.match('image.*')) {
        toast.error("Please select an image file");
        throw new Error("Invalid file type");
    }

    if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        throw new Error("File too large");
    }

    const supportedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
    if (!supportedFormats.includes(file.type)) {
        toast.error("Unsupported image format. Please use JPEG, PNG, GIF, WebP, or BMP");
        throw new Error("Unsupported format");
    }

    try {
        const formData = new FormData();
        formData.append("image", file);
        const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/users/`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true,
            }
        );

        return response.data.url;
    } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Failed to upload image. Please try again.");
        throw error;
    }
};

export default uploadToCloudinary;