import axios from "axios";
import { toast } from "react-toastify";


const uploadToCloudinary = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_UPLOAD_PRESET;

    // Check if file is an image
    if (!file.type.match('image.*')) {
        toast.error("Please select an image file");
        throw new Error("Invalid file type");
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        throw new Error("File too large");
    }

    // Check supported formats
    const supportedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
    if (!supportedFormats.includes(file.type)) {
        toast.error("Unsupported image format. Please use JPEG, PNG, GIF, WebP, or BMP");
        throw new Error("Unsupported format");
    }

    try {
      const cloudinaryData = new FormData()
      cloudinaryData.append("file", file)
      cloudinaryData.append("upload_preset", uploadPreset)
      cloudinaryData.append("cloud_name", cloudName)

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        cloudinaryData,
      )

      return response.data.secure_url
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error)
      toast.error("Failed to upload image. Please try again.")
      throw error
    }
}

export default uploadToCloudinary;