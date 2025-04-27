import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
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
    clearUser: (state) => {
      state.userId = null;
      state.error = null;
      state.loading = false;
    },
  },
});

export const { setUserId, setError, setLoading, clearUser } = userSlice.actions;
export default userSlice.reducer;
