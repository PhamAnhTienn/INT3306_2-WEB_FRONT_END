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
        window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    },


    handleOAuth2Success: async () => {
        try {
            // Call your backend endpoint to get the JWT tokens
            const response = await api.get('/auth/oauth2/token');
            const result = response.data;
            const authData = result.data;

            if (authData?.accessToken) {
                localStorage.setItem('accessToken', authData.accessToken);
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

  /**
   * Send forgot password request
   * @param {string} email
   * @returns {Promise}
   */
    forgotPassword: async (email) => {
        try {
            // Backend expects email as @RequestParam, so send it as query param
            const response = await api.post('/auth/password/forgot', null, {
                params: { email },
            });
            return response.data;
        } catch (error) {
            console.error('Error sending forgot password request:', error);
            throw error;
        }
    },

  /**
   * Validate reset password token
   * @param {string} token
   * @returns {Promise}
   */
    validateResetToken: async (token) => {
        try {
            const response = await api.get('/auth/password/validate', {
                params: { token },
            });
            return response.data;
        } catch (error) {
            console.error('Error validating reset token:', error);
            throw error;
        }
    },

  /**
   * Reset password with token
   * @param {string} token
   * @param {string} newPassword
   * @returns {Promise}
   */
    resetPassword: async (token, newPassword) => {
        try {
            const response = await api.post('/auth/reset-password', {
                token,
                password: newPassword,
            });
            return response.data;
        } catch (error) {
            console.error('Error resetting password:', error);
            throw error;
        }
    },
};