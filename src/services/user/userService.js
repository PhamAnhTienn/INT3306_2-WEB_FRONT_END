import api from '../../api/client.js';

/**
 * User Service
 * Handles all user-related API calls
 */
export const userAPI = {
  /**
   * Get current user's available roles
   * @returns {Promise} API response with user roles
   */
  getMyRoles: async () => {
    try {
      const response = await api.get('/user/roles');
      return response.data;
    } catch (error) {
      console.error('Error fetching user roles:', error);
      throw error;
    }
  },

  /**
   * Switch user's active role
   * @param {string} role - Role to switch to (VOLUNTEER, EVENT_MANAGER, ADMIN)
   * @returns {Promise} API response with updated user data
   */
  switchRole: async (role) => {
    try {
      const response = await api.post('/user/switch-role', { role });
      return response.data;
    } catch (error) {
      console.error('Error switching role:', error);
      throw error;
    }
  },

  /**
   * Get current user profile
   * @returns {Promise} API response with user profile
   */
  getCurrentUser: async () => {
    try {
      const response = await api.get('/user/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },
};



