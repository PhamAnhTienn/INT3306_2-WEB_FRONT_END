import api from '../../api/client.js';

/**
 * Admin Service
 * Handles all admin-related API calls for user management
 */
export const adminAPI = {
  /**
   * Get all users with pagination
   * @param {Object} params - Pagination and sorting parameters
   * @param {number} params.page - Page number (default: 0)
   * @param {number} params.size - Page size (default: 10)
   * @param {string} params.sortBy - Sort field (default: 'id')
   * @param {string} params.sortDir - Sort direction (default: 'asc')
   * @returns {Promise} API response with paginated users
   */
  getAllUsers: async (params = {}) => {
    try {
      const { page = 0, size = 10, sortBy = 'id', sortDir = 'asc' } = params;
      const response = await api.get('/admin/users', {
        params: { page, size, sortBy, sortDir },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  /**
   * Get users filtered by enabled status
   * @param {boolean} enabled - Enabled status (true/false)
   * @param {Object} params - Pagination and sorting parameters
   * @returns {Promise} API response with paginated users
   */
  getUsersByEnabled: async (enabled, params = {}) => {
    try {
      const { page = 0, size = 10, sortBy = 'id', sortDir = 'asc' } = params;
      const response = await api.get(`/admin/users/enabled/${enabled}`, {
        params: { page, size, sortBy, sortDir },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching users by enabled status:', error);
      throw error;
    }
  },

  /**
   * Search users
   * @param {string} search - Search term
   * @param {Object} params - Pagination and sorting parameters
   * @returns {Promise} API response with paginated users
   */
  searchUsers: async (search, params = {}) => {
    try {
      const { page = 0, size = 10, sortBy = 'id', sortDir = 'asc' } = params;
      const response = await api.get('/admin/users/search', {
        params: { search, page, size, sortBy, sortDir },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  },

  /**
   * Get user detail by ID
   * @param {number} userId - User ID
   * @returns {Promise} API response with user detail
   */
  getUserDetail: async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user detail:', error);
      throw error;
    }
  },

  /**
   * Enable or disable a user
   * @param {number} userId - User ID
   * @param {boolean} enabled - Enable status
   * @returns {Promise} API response with updated user
   */
  enableOrDisableUser: async (userId, enabled) => {
    try {
      const response = await api.put('/admin/users/enable', {
        userId,
        enabled,
      });
      return response.data;
    } catch (error) {
      console.error('Error enabling/disabling user:', error);
      throw error;
    }
  },

  /**
   * Change user role
   * @param {number} userId - User ID
   * @param {string} role - New role (VOLUNTEER, EVENT_MANAGER, ADMIN)
   * @returns {Promise} API response with updated user
   */
  changeUserRole: async (userId, role) => {
    try {
      const response = await api.put('/admin/users/role', {
        userId,
        role,
      });
      return response.data;
    } catch (error) {
      console.error('Error changing user role:', error);
      throw error;
    }
  },

  /**
   * Delete a user
   * @param {number} userId - User ID
   * @param {string} reason - Optional reason for deletion
   * @returns {Promise} API response
   */
  deleteUser: async (userId, reason = null) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`, {
        data: reason ? { reason } : null,
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  /**
   * Reset user password
   * @param {number} userId - User ID
   * @param {string} newPassword - New password
   * @returns {Promise} API response
   */
  resetUserPassword: async (userId, newPassword) => {
    try {
      const response = await api.put('/admin/users/reset-password', {
        userId,
        newPassword,
      });
      return response.data;
    } catch (error) {
      console.error('Error resetting user password:', error);
      throw error;
    }
  },

  /**
   * Promote user to Event Manager
   * @param {number} userId - User ID
   * @returns {Promise} API response with updated user
   */
  promoteToEventManager: async (userId) => {
    try {
      const response = await api.post(`/admin/users/${userId}/promote`);
      return response.data;
    } catch (error) {
      console.error('Error promoting user:', error);
      throw error;
    }
  },

  /**
   * Demote user from Event Manager
   * @param {number} userId - User ID
   * @returns {Promise} API response with updated user
   */
  demoteFromEventManager: async (userId) => {
    try {
      const response = await api.post(`/admin/users/${userId}/demote`);
      return response.data;
    } catch (error) {
      console.error('Error demoting user:', error);
      throw error;
    }
  },

  /**
   * Export users to CSV
   * @param {Object} filters - Optional filters
   * @param {string} filters.role - Filter by role
   * @param {boolean} filters.enabled - Filter by enabled status
   * @returns {Promise} Blob of CSV file
   */
  exportUsersToCSV: async (filters = {}) => {
    try {
      const response = await api.get('/admin/export/users/csv', {
        params: filters,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting users to CSV:', error);
      throw error;
    }
  },

  /**
   * Export users to JSON
   * @returns {Promise} Blob of JSON file
   */
  exportUsersToJSON: async () => {
    try {
      const response = await api.get('/admin/export/users/json', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting users to JSON:', error);
      throw error;
    }
  },

  /**
   * Get event detail (admin)
   * @param {number} eventId
   */
  getEventDetail: async (eventId) => {
    try {
      const response = await api.get(`/admin/events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching admin event detail:', error);
      throw error;
    }
  },

  /**
   * Approve event
   * @param {number} eventId
   */
  approveEvent: async (eventId) => {
    try {
      const response = await api.put(`/admin/events/${eventId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving event:', error);
      throw error;
    }
  },

  /**
   * Reject event
   * @param {number} eventId
   * @param {string} reason
   */
  rejectEvent: async (eventId, reason) => {
    try {
      const response = await api.put(`/admin/events/${eventId}/reject`, {
        reason: reason || null,
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting event:', error);
      throw error;
    }
  },

  /**
   * Export events to CSV
   * @param {Object} filters
   * @param {string} filters.status
   * @param {string} filters.startDate
   * @param {string} filters.endDate
   */
  exportEventsToCSV: async (filters = {}) => {
    try {
      const response = await api.get('/admin/export/events/csv', {
        params: filters,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting events to CSV:', error);
      throw error;
    }
  },

  /**
   * Export events to JSON
   */
  exportEventsToJSON: async () => {
    try {
      const response = await api.get('/admin/export/events/json', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting events to JSON:', error);
      throw error;
    }
  },

  /**
   * Delete an event (admin)
   * @param {number} eventId
   */
  deleteEvent: async (eventId) => {
    try {
      const response = await api.delete(`/admin/events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  },
};



