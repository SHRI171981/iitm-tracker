import axios, { type InternalAxiosRequestConfig, AxiosError } from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8000/api",
  // headers: {
  //   "Content-Type": "application/json",
  // },
});

// Intercept outgoing requests to attach the Bearer token
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Intercept incoming responses to handle global authentication errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
