import api from '../../api/client.js';

/**
 * Firebase Service
 * Handles FCM token registration and management
 */
export const firebaseAPI = {
  /**
   * Register FCM token for current user
   * @param {Object} tokenData - FCM token data
   * @param {string} tokenData.token - FCM token
   * @param {string} tokenData.deviceId - Device identifier (optional)
   * @param {string} tokenData.deviceType - Device type: 'MOBILE_WEB' or 'DESKTOP_WEB'
   * @returns {Promise} API response with registered token
   */
  registerToken: async (tokenData) => {
    try {
      const response = await api.post('/firebase/token/register', tokenData);
      return response.data;
    } catch (error) {
      console.error('Error registering FCM token:', error);
      throw error;
    }
  },
};

export default firebaseAPI;









