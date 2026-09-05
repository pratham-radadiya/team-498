import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || '';

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response Interceptor for global auth/error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // 401 Unauthorized -> Force redirect to login
      if (status === 401 && typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }

      // Format custom error message from backend
      const customMessage = data?.error || data?.message || 'An unexpected error occurred';
      const formattedError = new Error(customMessage);
      formattedError.status = status;
      formattedError.data = data;
      return Promise.reject(formattedError);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
