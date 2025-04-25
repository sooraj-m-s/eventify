import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    mobile: '',
    profile_image: null
  });
  const [errors, setErrors] = useState({});

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

    const formDataToSend = new FormData();
    for (const key in formData) {
      if (formData[key] !== null) {
        formDataToSend.append(key, formData[key]);
      }
    }

    try {
      const response = await axios.post('http://localhost:8000/users/register/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      console.log('Backend error:', error.response?.data); // Debug
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
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <ToastContainer />
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
            type="email"
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
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium mb-1">Confirm Password</label>
          <input
            type="password"
            name="confirm_password"
            value={formData.confirm_password}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${errors.confirm_password ? 'border-red-500' : 'border-gray-300'}`}
          />
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
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;