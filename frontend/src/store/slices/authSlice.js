import { createSlice } from '@reduxjs/toolkit';


const authSlice = createSlice({
  name: 'auth',
  initialState: {
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
      state.userId = null;
      state.userName = null;
      state.userEmail = null;
      state.userRole = null;
      state.error = null;
      state.loading = false;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, setUserId, setError, setLoading, logout } = authSlice.actions;
export default authSlice.reducer;