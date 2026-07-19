import axios from "axios";
import { useAuthStore } from "@/store/authStore";

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ??
    "https://job-board-assignment-bahp.onrender.com",
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    const message =
      error.response?.data?.errors?.[0]?.message ??
      error.response?.data?.message ??
      error.message ??
      "Something went wrong";
    return Promise.reject(new Error(message));
  },
);
