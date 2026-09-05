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

      // 401 Unauthorized -> Clear session and redirect to login
      if (status === 401 && typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        apiClient.get('/api/auth/csrf').then((res) => {
          const csrf = res.data?.csrfToken;
          if (csrf) {
            apiClient.post('/api/auth/signout', new URLSearchParams({ csrfToken: csrf, json: 'true' }), {
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }).finally(() => {
              window.location.href = '/login';
            });
          } else {
            window.location.href = '/login';
          }
        }).catch(() => {
          window.location.href = '/login';
        });
      }

      // Format custom error message from backend
      let customMessage = data?.message || data?.error;

      if (data?.details) {
        if (Array.isArray(data.details)) {
          customMessage = data.details.map((d) => d.message || d.path + ': ' + d.message || JSON.stringify(d)).join('; ');
        } else if (typeof data.details === 'string') {
          customMessage = data.details;
        } else if (typeof data.details === 'object') {
          customMessage = Object.values(data.details).flat().join('; ');
        }
      }

      if (!customMessage) {
        customMessage = 'An unexpected error occurred';
      }

      const formattedError = new Error(customMessage);
      formattedError.status = status;
      formattedError.data = data;
      return Promise.reject(formattedError);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
