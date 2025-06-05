import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { X } from 'lucide-react'
import { setError, setLoading, setUser, setUserId } from '../store/slices/authSlice';
import axiosInstance from '../utils/axiosInstance';


const OtpModal = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const tempUserId = useSelector((state) => state.auth.userId)
  const loading = useSelector((state) => state.auth.loading)
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [resendDisabled, setResendDisabled] = useState(false)
  const [countdown, setCountdown] = useState(120)
  const [resendCountdown, setResendCountdown] = useState(0)
  const inputRefs = useRef([])
  const timerRef = useRef(null)
  const resendTimerRef = useRef(null)

  useEffect(() => {
    if (tempUserId) {
      inputRefs.current[0].focus();
      setCountdown(120)
    }
  }, [tempUserId]);

  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
    } else if (countdown === 0) {
      toast.error("OTP has expired. Please request a new one.")
      if (timerRef.current) clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [countdown])

  useEffect(() => {
    if (resendCountdown > 0) {
      resendTimerRef.current = setInterval(() => {
        setResendCountdown((prev) => prev - 1)
      }, 1000)
    } else if (resendCountdown === 0) {
      setResendDisabled(false)
      if (resendTimerRef.current) clearInterval(resendTimerRef.current)
    }

    return () => {
      if (resendTimerRef.current) clearInterval(resendTimerRef.current)
    }
  }, [resendCountdown])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (resendTimerRef.current) clearInterval(resendTimerRef.current)
    }
  }, [])

  // Enable resend button after 30 seconds
  useEffect(() => {
    if (tempUserId) {
      setResendCountdown(30)
    }
  }, [tempUserId])

  const handleClose = () => {
    setOtp(["", "", "", "", "", ""])
    dispatch(setUserId(null))
    if (timerRef.current) clearInterval(timerRef.current)
    if (resendTimerRef.current) clearInterval(resendTimerRef.current)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

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
    if (countdown === 0) {
      toast.error("OTP has expired. Please request a new one.")
      return
    }

    try {
      const response = await axiosInstance.post('/users/verify_otp/', {
        temp_user_id: tempUserId,
        otp: otpValue,
      });
      toast.success('Registration completed successfully and redirecting to home!');
      dispatch(setUser({
        id: response.data.user_id,
        name: response.data.full_name,
        email: response.data.email,
        profile_image: response.data.profile_image,
        role: response.data.role
      }))
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'OTP verification failed';
      dispatch(setError(errorMsg));
      toast.error(errorMsg);
    } finally {
        dispatch(setLoading(false));
      }
  };

  const handleResendOtp = async () => {
    if (resendDisabled) return

    dispatch(setLoading(true))
    setResendDisabled(true)

    try {
      const response = await axiosInstance.post("/users/resend_otp/", {
        temp_user_id: tempUserId,
      })

      toast.success("New OTP sent to your email")

      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0].focus()

      setCountdown(120)
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Failed to resend OTP"
      dispatch(setError(errorMsg))
      toast.error(errorMsg)
      setResendDisabled(false)
    } finally {
      dispatch(setLoading(false))
    }
  }
  if (!tempUserId) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-[9999]">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-center flex-1">Enter OTP</h2>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <p className="text-center mb-6">Check your email for the 6-digit code.</p>

        {/* OTP Expiration Timer */}
        <div className="text-center mb-4">
          <span className={`font-medium ${countdown < 30 ? "text-red-500" : "text-gray-600"}`}>
            OTP expires in: {formatTime(countdown)}
          </span>
        </div>

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
              disabled={loading || countdown === 0}
            />
          ))}
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading || countdown === 0}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed mb-3"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <div className="text-center mt-4">
          <button
            onClick={handleResendOtp}
            disabled={resendDisabled || loading}
            className="text-blue-600 hover:text-blue-800 transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {resendDisabled ? `Resend OTP in ${countdown}s` : loading ? "Sending..." : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpModal;
