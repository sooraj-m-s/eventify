import { useState } from 'react';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, setUserId } from '../../store/slices/authSlice';
import OtpModal from '../../components/OTPModal';
import image from "../../assets/login/img-2.jpg"
import ImageSlider from '../../components/ImageSlider';
import CustomGoogleButton from '../../components/CustomGoogleButton';
import axiosInstance from '../../utils/axiosInstance';
import uploadToCloudinary from '../../utils/cloudinaryUpload';
import { Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';


const Register = () => {
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const loading = useSelector((state) => state.auth.loading)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    mobile: '',
    profile_image: null
  });
  const [errors, setErrors] = useState({});
  const sliderImages = [image]

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
      isValid = false;
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.trim().length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
      isValid = false;
    }

    if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Mobile number must be 10 digits';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    dispatch(setLoading(true));
    let profileImageUrl = null

    try {
      if (formData.profile_image) {
        profileImageUrl = await uploadToCloudinary(formData.profile_image)
      }
      
      const userData = {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirm_password,
        mobile: formData.mobile,
        profile_image: profileImageUrl,
      }
      
      const response = await axiosInstance.post('/users/register/', userData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const tempUserId = response.data.temp_user_id;
      dispatch(setUserId(tempUserId));
    } catch (error) {
      console.log('Backend error:', error.response?.data);
      if (error.response?.data) {
        const newErrors = {};
        for (const field in formData) {
          if (error.response.data[field]) {
            newErrors[field] = Array.isArray(error.response.data[field])
              ? error.response.data[field][0]
              : error.response.data[field];
          }
        }
        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) {
          toast.error(error.response.data.detail || 'Registration failed');
        } else {
          toast.error('Please fix the errors in the form');
        }
      } else {
        toast.error('An error occurred. Please try again.');
      }
    } finally {
      dispatch(setLoading(false));
  }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Form - Left Side */}
      <div className="w-full max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.full_name ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-500" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.confirm_password ? 'border-red-500' : 'border-gray-300'}`}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-500" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
            {errors.confirm_password && <p className="text-red-500 text-sm mt-1">{errors.confirm_password}</p>}
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-sm font-medium mb-1">Mobile</label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.mobile ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
          </div>

          {/* Profile Image */}
          <div>
            <label className="block text-sm font-medium mb-1">Profile Image</label>
            <input
              type="file"
              name="profile_image"
              onChange={handleChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              accept="image/*"
            />
            {errors.profile_image && <p className="text-red-500 text-sm mt-1">{errors.profile_image}</p>}
          </div>

          <button
            type="submit"
            className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? (
              <span>
                <svg
                  className="animate-spin h-5 w-5 mr-2 inline"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading...
              </span>
            ) : (
              'Register'
            )}
          </button>
          <CustomGoogleButton />

          <div className="text-center mt-4">
            <Link to="/login" className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
              Back to Login
            </Link>
          </div>
        </form>
        <OtpModal />
      </div>

      {/* Image Slider - Right Side */}
      <div className="hidden md:block md:w-1/2 h-screen">
        <ImageSlider images={sliderImages} />
      </div>
    </div>
  );
};

export default Register;