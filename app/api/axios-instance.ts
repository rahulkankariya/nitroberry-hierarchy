import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: { 
    "Content-Type": "application/json",
    "x-api-key": process.env.NEXT_PUBLIC_API_KEY 
  },
});

// 1. Request Interceptor: Attach Token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 2. Response Interceptor: Flatten Data & Handle 401
api.interceptors.response.use(
  (response) => {
    // This removes the need to write .data.data in your services
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.location.href = "/login"; 
      }
    }
    return Promise.reject(error);
  }
);

export default api;