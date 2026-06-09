import apiClient from "./apiClient";

// Get user profile
export const getUserProfile = async () => {
  const response = await apiClient.get("/users/profile");
  return response.data;
};

// Update user profile
export const updateUserProfile = async (data) => {
  const response = await apiClient.put("/users/profile", data);
  return response.data;
};

// Change password
export const changePassword = async (data) => {
  const response = await apiClient.put("/users/change-password", data);
  return response.data;
};

// Delete account
export const deleteAccount = async (password) => {
  const response = await apiClient.delete("/users/account", {
    data: { password }
  });
  return response.data;
};

// Get user statistics
export const getUserStats = async () => {
  const response = await apiClient.get("/users/stats");
  return response.data;
};

