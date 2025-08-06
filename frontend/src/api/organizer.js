import axiosInstance from "@/utils/axiosInstance";


export const fetchOrganizerBookings = async (url) => {
  return await axiosInstance.get(url);
};

export const startChatWithUser = async (userId) => {
  return await axiosInstance.post("/chat/start/", {user_id: userId});
};

export const fetchOrganizerEvents = (page, filterCompleted) => {
  let url = `/organizer/organizer-events/?page=${page}`;
  if (filterCompleted !== null && filterCompleted !== undefined) {
    url += `&is_completed=${filterCompleted}`;
  }

  return axiosInstance.get(url);
};

export const fetchOrganizerProfile = () => {
  return axiosInstance.get("/organizer/profile/");
};

export const fetchOrganizerWalletData = (page) => {
  return axiosInstance.get(`/wallet/organizer/transactions/?page=${page}`);
};

export const withdrawAllMoney = () => {
  return axiosInstance.post("/wallet/withdraw_money/", {confirm_withdrawal: true});
};

