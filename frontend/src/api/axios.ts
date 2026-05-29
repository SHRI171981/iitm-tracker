import axios, { InternalAxiosRequestConfig } from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8000/api",
  // headers: {
  //   "Content-Type": "application/json",
  // },
});

// Attach authentication token to all outgoing requests
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

export default apiClient;