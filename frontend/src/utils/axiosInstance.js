import axios from 'axios';
import store from '../store/store';
import { logout } from '../store/slices/authSlice';
import { toast } from 'sonner';


const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;
    const detail = error?.response?.data?.detail;

    if (status === 401 || status === 403) {
      if (detail === "User is blocked.") {
        toast.error("Your account has been blocked.");
        store.dispatch(logout());
      } else if (detail === "Token has been blacklisted.") {
        toast.warning("Session expired. Please log in again.");
        store.dispatch(logout());
      } else if (detail === "Authentication credentials were not provided.") {
        toast.warning("Something went wrong. Please log in again.");
        store.dispatch(logout());
      } else {
        toast.error("Authentication failed.");
        store.dispatch(logout());
      }
    }
    
    if (
      (originalRequest.url === "/users/refresh_token/" && error.response?.status === 401) || originalRequest._retry
    ) {
      return Promise.reject(error)
    }
    if (error.response?.status !== 401) {
      return Promise.reject(error)
    }
    originalRequest._retry = true;
    
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => {
          return axiosInstance(originalRequest);
        })
        .catch(err => {
          return Promise.reject(err);
        });
    }
    isRefreshing = true;
    
    try {
      await axiosInstance.post('/users/refresh_token/');
      processQueue(null);
      isRefreshing = false;
      
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      isRefreshing = false;
      store.dispatch(logout());
      return Promise.reject(refreshError);
    }
  }
);

export default axiosInstance;