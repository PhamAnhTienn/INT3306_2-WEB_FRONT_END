import api from '../../api/client';

/**
 * Tags Service
 * Handles all tag-related API calls
 */
export const tagsAPI = {
  /**
   * Get all available tags
   * @returns {Promise} API response with tags list
   */
  getAllTags: async () => {
    try {
      const response = await api.get('/tags');
      return response.data;
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw error;
    }
  },
};

export default tagsAPI;












