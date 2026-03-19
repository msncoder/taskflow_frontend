import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api/proxy', // We will route API calls through Next.js to handle httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept responses to handle 401s (token expiration)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token via our Next.js API route
        // This route will handle reading the secure httpOnly refresh token,
        // sending it to FastAPI, and securely setting the new tokens.
        await axios.post('/api/auth/refresh');
        
        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, user needs to login again
        // Here we could emit an event, or redirect to /login
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
