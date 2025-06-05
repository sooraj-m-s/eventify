import axiosInstance from "@/utils/axiosInstance";


export const adminLogin = async (email, password) => {
  const response = await axiosInstance.post("/admin/login/", {email, password});
  return response;
};

export const fetchUserList = async (role, page, search) => {
  const response = await axiosInstance.get("/admin/user_list/", {params: {role, page, search}});
  return response;
};

export const getPendingOrganizerProfiles = async () => {
  const response = await axiosInstance.get("/admin/pending_organizers/", {
    params: { status: "pending", count_only: true },
  });
  return response;
};

export const updateUserBlockStatus = async (userId, isBlocked) => {
  const response = await axiosInstance.patch(`/admin/users_status/${userId}/`, {is_blocked: isBlocked});
  return response;
};

export const fetchAdminEvent = async (settlementStatus, page, searchQuery) => {
  const response = await axiosInstance.get("/admin/events/", {
    params: {settlement_status: settlementStatus, page, search: searchQuery}
  });
  return response;
};

export const fetchCategoryList = async () => {
  const response = await axiosInstance.get("/categories/");
  return response;
};

export const updateCategoryStatus = async (categoryId, isListed) => {
  const response = await axiosInstance.patch(`/categories/update/${categoryId}/`, {
    is_listed: isListed,
  });
  return response;
};

export const fetchAdminWalletData = async (query) => {
  const response = await axiosInstance.get(`/admin/wallet/?${query}`);
  return response;
};

export const fetchAdminEvents = async (url) => {
  return await axiosInstance.get(url);
};

