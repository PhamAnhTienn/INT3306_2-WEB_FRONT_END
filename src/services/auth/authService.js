import api from '../../api/client.js';

// Auth API endpoints
export const authAPI = {
  /**
   * Login user with username and password
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.username - Username
   * @param {string} credentials.password - Password
   * @returns {Promise} Response with JWT token and user data
   */
    login: async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials);
            const result = response.data; 
            const authData = result.data;

            if (authData?.accessToken) {
            localStorage.setItem('accessToken', authData.accessToken);
            localStorage.setItem('refreshToken', authData.refreshToken);
            localStorage.setItem('user', JSON.stringify(authData.userResponse));
            }

            return authData;
        } catch (error) {
            console.error('Error logging in:', error);
            throw error;
        }
    },

  /**
   * Initiate Google OAuth2 sign-in
   * Redirects to backend OAuth2 endpoint which handles Google authentication
   */
    initiateGoogleSignIn: () => {
        // Redirect to your backend's OAuth2 Google authorization endpoint
        // Spring Security will handle the OAuth2 flow
        window.location.href = `${api.defaults.baseURL}/oauth2/authorization/google`;
    },

  /**
   * Handle OAuth2 callback and exchange for tokens
   * This is called after user is redirected back from Google
   * @returns {Promise} Response with JWT token and user data
   */
    handleOAuth2Callback: async () => {
        try {
            // Call your backend endpoint to get the JWT tokens
            const response = await api.get('/auth/oauth2/token');
            const result = response.data;
            const authData = result.data;

            if (authData?.accessToken) {
                localStorage.setItem('accessToken', authData.accessToken);
                localStorage.setItem('refreshToken', authData.refreshToken);
                localStorage.setItem('user', JSON.stringify(authData.userResponse));
            }

            return authData;
        } catch (error) {
            console.error('Error handling OAuth2 callback:', error);
            throw error;
        }
    },

  /**
   * Register new user
   * @param {Object} userData - Registration data
   * @param {string} userData.fullName - Full name
   * @param {string} userData.email - Email address
   * @param {string} userData.username - Username
   * @param {string} userData.password - Password
   * @param {string} userData.mobile - Mobile number
   * @returns {Promise} Response with JWT token and user data
   */
    register: async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            
            // Store access token and user data in localStorage after successful registration
            if (response.data.data?.accessToken) {
                localStorage.setItem('accessToken', response.data.data.accessToken);
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
            }
            
            return response.data;
        } catch (error) {
            console.error('Error registering:', error);
            throw error;
        }
    },

  /**
   * Logout user and clear tokens
   * Calls backend to invalidate refresh token
   * @returns {Promise}
   */
    logout: async () => {
        try {
            // Call backend logout endpoint to invalidate refresh token
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Error during logout:', error);
            // Continue with local cleanup even if backend call fails
        } finally {
            // Clear local storage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
        }
    },

  /**
   * Refresh access token using refresh token cookie
   * @returns {Promise} Response with new JWT token
   */
    refreshToken: async () => {
        try {
            const response = await api.post('/auth/refresh');
            
            // Update access token in localStorage
            if (response.data.data?.accessToken) {
                localStorage.setItem('accessToken', response.data.data.accessToken);
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
            }
            
            return response.data;
        } catch (error) {
            console.error('Error refreshing token:', error);
            // Clear tokens if refresh fails
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            throw error;
        }
    },

  /**
   * Get current user from localStorage
   * @returns {Object|null} User object or null
   */
    getCurrentUser: () => {
        try {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    },

  /**
   * Get access token from localStorage
   * @returns {string|null} Access token or null
   */
    getAccessToken: () => {
        return localStorage.getItem('accessToken');
    },

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user has valid token
   */
    isAuthenticated: () => {
        return !!localStorage.getItem('accessToken');
    },
};