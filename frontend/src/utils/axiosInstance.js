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
  failedQueue.forEach(prom => {
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
    
    // If the error is not 401 or the request has already been retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }
    
    // If the failed request is the refresh token request itself, logout
    if (originalRequest.url === '/users/refresh_token/') {
      store.dispatch(logout());
      return Promise.reject(error);
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
      
      // Optionally set an error message
      store.dispatch(setError('Session expired. Please login again.'));
      
      // Redirect to login page
      window.location.href = '/client/login';
      
      return Promise.reject(refreshError);
    }
  }
);

export default axiosInstance;