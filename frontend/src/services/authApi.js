import apiClient from "./apiClient";

export const signup = (data) => apiClient.post("/api/auth/signup", data);

export const login = (data) => apiClient.post("/api/auth/login", data);

