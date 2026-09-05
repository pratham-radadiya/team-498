import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
    const message =
      error.response?.data?.error ||
      error.message ||
      "Something went wrong. Please try again.";
    return Promise.reject(new ApiError(message, status, error.response?.data));
  }
);

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export default apiClient;
