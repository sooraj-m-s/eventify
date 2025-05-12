import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import 'react-toastify/dist/ReactToastify.css';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import axiosInstance from '../../utils/axiosInstance';


const CompleteRegistration = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const userData = location.state || {};

  const [formData, setFormData] = useState({
    mobile: '',
    password: '',
    confirm_password: '',
    profile_image: userData.picture || '',
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    if (!formData.mobile) {
      newErrors.mobile = 'Mobile number is required';
      isValid = false;
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Mobile number must be 10 digits';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true)

    const formDataToSend = new FormData();
    for (const key in formData) {
      if (formData[key] !== null) {
        formDataToSend.append(key, formData[key]);
      }
    }
    formDataToSend.append('email', userData.email);
    formDataToSend.append('name', userData.name);
    formDataToSend.append('picture', userData.picture || '');

    try {
      const response = await axiosInstance.post('/users/complete_registration/',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      toast.success('Registration completed successfully!');
      setTimeout(() => navigate('/login'), 2000);
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
      setLoading(false)
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Complete Your Registration</h2>
      <div className="space-y-4">
        {/* Display Google data */}
        <div>
          <div className="flex justify-center">
            <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
            <img
              src={userData.picture}
              alt="Profile"
              className="mt-1 w-24 h-24 rounded-full border mx-auto"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 p-2 w-full border rounded-md bg-gray-100">{userData.email || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <p className="mt-1 p-2 w-full border rounded-md bg-gray-100">{userData.name || 'N/A'}</p>
          </div>
        </div>

        {/* Form to collect additional details */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className={`mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.mobile ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your mobile number"
            />
            {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center top-6"
            >
              {showPassword ? (
                <AiFillEyeInvisible className="h-5 w-5 text-gray-500" />
              ) : (
                <AiFillEye className="h-5 w-5 text-gray-500" />
              )}
            </button>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              className={`mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.confirm_password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center top-6"
            >
              {showPassword ? (
                <AiFillEyeInvisible className="h-5 w-5 text-gray-500" />
              ) : (
                <AiFillEye className="h-5 w-5 text-gray-500" />
              )}
            </button>
            {errors.confirm_password && (
              <p className="text-red-500 text-sm mt-1">{errors.confirm_password}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md transition-colors ${
              loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Completing Registration...
              </div>
            ) : (
              "Complete Registration"
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <Link to="/login" className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CompleteRegistration;