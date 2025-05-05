import axios from 'axios';
import store from '../store/store';
import { logout, setError } from '../store/slices/authSlice';


const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
});

// Track if we're currently refreshing the token
let isRefreshing = false;
// Store pending requests that should be retried after token refresh
let failedQueue = [];

// Process the queue of failed requests
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

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Don't attempt to refresh token for these specific cases
    if (
      // If it's a 401 from /users/me/ endpoint (normal when not logged in)
      (originalRequest.url === "/users/me/" && error.response?.status === 401) ||
      // If it's a 401 from refresh token endpoint (token is invalid/expired)
      (originalRequest.url === "/users/refresh_token/" && error.response?.status === 401) ||
      // If this request has already been retried once
      originalRequest._retry
    ) {
      return Promise.reject(error)
    }

    // Only attempt token refresh for 401 errors
    if (error.response?.status !== 401) {
      return Promise.reject(error)
    }
    
    // Mark this request as retried to avoid infinite loops
    originalRequest._retry = true;
    
    if (isRefreshing) {
      // If we're already refreshing, add this request to the queue
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => {
          // Retry the request when token refresh is complete
          return axiosInstance(originalRequest);
        })
        .catch(err => {
          return Promise.reject(err);
        });
    }
    
    isRefreshing = true;
    
    try {
      // Call the refresh token endpoint
      await axiosInstance.post('/users/refresh_token/');
      
      // Token refresh successful, process the queue and retry the original request
      processQueue(null);
      isRefreshing = false;
      
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      // Token refresh failed, process the queue with error
      processQueue(refreshError);
      isRefreshing = false;
      
      // Dispatch logout action to clear auth state
      store.dispatch(logout());
      
      return Promise.reject(refreshError);
    }
  }
);

export default axiosInstance;