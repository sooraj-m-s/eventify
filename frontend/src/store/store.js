import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import adminReducer from './slices/adminSlice';
import organizerReducer from './slices/organizerSlice';


const store = configureStore({
  reducer: {
    user: userReducer,
    admin: adminReducer,
    organizer: organizerReducer,
  },
});

export default store;
