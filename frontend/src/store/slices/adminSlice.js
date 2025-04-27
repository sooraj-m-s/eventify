import { createSlice } from '@reduxjs/toolkit';

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    userId: null,
    error: null,
    loading: false,
  },
  reducers: {
    setUserId: (state, action) => {
      state.userId = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    clearAdmin: (state) => {
      state.userId = null;
      state.error = null;
      state.loading = false;
    },
  },
});

export const { setUserId, setError, setLoading, clearAdmin } = adminSlice.actions;
export default adminSlice.reducer;
