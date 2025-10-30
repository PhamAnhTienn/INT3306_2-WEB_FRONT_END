import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: This allows cookies to be sent with requests
});

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Don't retry if the request was to the refresh endpoint itself
    if (originalRequest.url?.includes('/auth/refresh')) {
      // Clear tokens and redirect to login if refresh fails
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // If error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token
        const response = await api.post('/auth/refresh');
        const newAccessToken = response.data.data?.accessToken;

        if (newAccessToken) {
          localStorage.setItem('accessToken', newAccessToken);
          
          // Update user data if provided
          if (response.data.data?.user || response.data.data?.userResponse) {
            const userData = response.data.data?.user || response.data.data?.userResponse;
            localStorage.setItem('user', JSON.stringify(userData));
          }

          // Update the failed request's authorization header
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          
          // Process queued requests
          processQueue(null, newAccessToken);

          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        console.error('Token refresh failed:', refreshError);
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        
        // Only redirect if not already on login/register pages
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login') && 
            !currentPath.includes('/register') && 
            !currentPath.includes('/auth/')) {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For other errors, just reject
    return Promise.reject(error);
  }
);

export default api;