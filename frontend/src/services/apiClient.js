import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8080/api",
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    const isAuthRoute =
      config.url.includes("/auth/login") ||
      config.url.includes("/auth/signup");

    if (token && !isAuthRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default apiClient;

