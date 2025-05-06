import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { logout, setError, setLoading } from '../store/slices/authSlice';

const OtpModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const tempUserId = useSelector((state) => state.auth.userId);
  const loading = useSelector((state) => state.auth.loading);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (tempUserId) {
      inputRefs.current[0].focus();
    }
  }, [tempUserId]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      toast.error('Please enter a 6-digit OTP');
      return;
    }
    dispatch(setLoading(true));

    try {
      const response = await axios.post('http://localhost:8000/users/verify_otp/', {
        temp_user_id: tempUserId,
        otp: otpValue,
      });
      toast.success('OTP verified successfully! Redirecting to login...');
      dispatch(logout());
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'OTP verification failed';
      dispatch(setError(errorMsg));
      toast.error(errorMsg);
    } finally {
        dispatch(setLoading(false));
      }
  };

  if (!tempUserId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Enter OTP</h2>
        <p className="text-center mb-6">Check your email for the 6-digit code.</p>
        <div className="flex justify-center space-x-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              ref={(el) => (inputRefs.current[index] = el)}
              className="w-12 h-12 text-center text-2xl border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            />
          ))}
        </div>
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Verify OTP
        </button>
      </div>
    </div>
  );
};

export default OtpModal;