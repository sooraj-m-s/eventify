import axiosInstance from "@/utils/axiosInstance"


export const getEventDetails = (eventId) => {
  return axiosInstance.get(`/events/event_detail/${eventId}/`)
}

export const getOrganizers = (page, search) => {
  const params = new URLSearchParams()
  params.append("page", page)
  if (search) {
    params.append("search", search)
  }

  return axiosInstance.get(`/organizers/?${params.toString()}`)
}

export const getOrganizerDetails = (userId) => {
  return axiosInstance.get(`/organizers/${userId}/`)
}

export const registerUser = (userData) => {
  return axiosInstance.post("/users/register/", userData, {
    headers: {"Content-Type": "multipart/form-data"}})
}

export const loginUser = (formData) => {
  return axiosInstance.post("/users/login/", formData)
}

export const forgotPassword = (email) => {
  return axiosInstance.post("/users/forgot_password/", { email })
}

export const getUserProfile = () => {
  return axiosInstance.get("/users/profile/");
}

export const updateUserProfile = (formData) => {
  return axiosInstance.patch("/users/profile/", formData);
};

export const submitOrganizerProfile = (formData) => {
  return axiosInstance.post("/organizer/profile/", formData);
};

export const getUserBookings = () => {
  return axiosInstance.get("/booking/my_bookings/");
};

export const cancelBooking = (bookingId) => {
  return axiosInstance.patch(`/booking/cancel/${bookingId}/`);
};

export const getWalletTransactions = (page) => {
  return axiosInstance.get(`/wallet/transactions/?page=${page}`);
};

export const downloadTicket = async (bookingId) => {
  const response = await axiosInstance.get(`/booking/download_ticket/${bookingId}/`, {
    responseType: 'blob',
  });
  return response;
};

export const getSingleReview = async (userId, eventId) => {
  const response = await axiosInstance.get(`/reviews/single/?userId=${userId}&eventId=${eventId}`);
  return response.data;
};

export const createReview = async (reviewData) => {
  const response = await axiosInstance.post("/reviews/", reviewData);
  return response.data;
};

export const updateReview = async (reviewId, reviewData) => {
  const response = await axiosInstance.patch(`/reviews/reviews/${reviewId}/`, reviewData);
  return response.data;
};

export const startChatWithOrganizer = async (userId) => {
  const response = await axiosInstance.post("/chat/start/", {
    user_id: userId,
  });
  return response.data;
};

