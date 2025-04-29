import { createSlice } from '@reduxjs/toolkit';

const organizerSlice = createSlice({
  name: 'organizer',
  initialState: {
    userId: null,
    userName: null,
    userEmail: null,
    error: null,
    loading: false,
  },
  reducers: {
    setUserId: (state, action) => {
      state.userId = action.payload;
    },
    setUserName: (state, action) => {
      state.userName = action.payload;
    },
    setUserEmail: (state, action) => {
      state.userEmail = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    clearOrganizer: (state) => {
      state.userId = null;
      state.error = null;
      state.loading = false;
    },
  },
});

export const { setUserId, setError, setLoading, clearOrganizer } = organizerSlice.actions;
export default organizerSlice.reducer;