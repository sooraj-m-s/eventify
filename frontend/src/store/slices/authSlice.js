import { createSlice } from '@reduxjs/toolkit';
import WebSocketInstance from '@/services/websocketService';


const getStoredAuth = () => {
  try {
    const storedAuth = localStorage.getItem('auth');
    return storedAuth ? JSON.parse(storedAuth) : null;
  } catch (error) {
    console.error('Error parsing stored auth:', error);
    return null;
  }
};
const storedAuth = getStoredAuth();

const authSlice = createSlice({
  name: 'auth',
  initialState: storedAuth || {
    userId: null,
    userName: null,
    userEmail: null,
    profile_image: null,
    userRole: null,
    error: null,
    loading: false,
    isAuthenticated: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.userId = action.payload.id;
      state.userName = action.payload.name;
      state.userEmail = action.payload.email;
      state.profile_image = action.payload.profile_image;
      state.userRole = action.payload.role;
      state.isAuthenticated = true;

      localStorage.setItem('auth', JSON.stringify({
        userId: action.payload.id,
        userName: action.payload.name,
        userEmail: action.payload.email,
        profile_image: action.payload.profile_image,
        userRole: action.payload.role,
        isAuthenticated: true,
      }));
    },
    setUserId: (state, action) => {
      state.userId = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    logout: (state) => {
      WebSocketInstance.disconnect()

      state.userId = null;
      state.userName = null;
      state.userEmail = null;
      state.userRole = null;
      state.error = null;
      state.loading = false;
      state.isAuthenticated = false;

      localStorage.removeItem('auth');
    },
  },
});

export const { setUser, setUserId, setError, setLoading, logout } = authSlice.actions;
export default authSlice.reducer;