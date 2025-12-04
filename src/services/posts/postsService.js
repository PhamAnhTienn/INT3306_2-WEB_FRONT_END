import api from '../../api/client';

/**
 * Posts Service
 * Handles all post-related API calls
 */
export const postsAPI = {
  /**
   * Create a new post in an event
   * @param {number} eventId - Event ID
   * @param {Object} postData - Post data
   * @param {string} postData.content - Post content
   * @param {File[]} files - Optional array of image files
   * @returns {Promise} API response with created post
   */
  createPost: async (eventId, postData, files = []) => {
    try {
      const createPostDTO = {
        content: postData.content || '',
      };

      // Spring Boot với @RequestBody và @RequestParam:
      // - @RequestBody expects JSON in body
      // - @RequestParam expects files as query params or form-data parts
      // We'll send JSON body and files as form-data parts
      if (files && files.length > 0) {
        // For multipart, we need to send JSON as a string in form-data
        // and files as separate parts
        const formData = new FormData();
        
        // Send DTO as JSON string in a form field
        formData.append('createPostDTO', JSON.stringify(createPostDTO));
        
        // Append files
        files.forEach((file) => {
          formData.append('files', file);
        });

        // Note: Spring Boot may need special handling for this
        // If this doesn't work, backend may need to use @ModelAttribute instead
        const response = await api.post(`/posts/events/${eventId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } else {
        // No files - send JSON normally
        const response = await api.post(`/posts/events/${eventId}`, createPostDTO, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        return response.data;
      }
    } catch (error) {
      console.error(`Error creating post for event ${eventId}:`, error);
      throw error;
    }
  },

  /**
   * Get all posts for an event
   * @param {number} eventId - Event ID
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.size - Page size
   * @param {string} params.sortBy - Sort field
   * @param {string} params.sortDir - Sort direction
   * @returns {Promise} API response with posts
   */
  getEventPosts: async (eventId, params = {}) => {
    try {
      const {
        page = 0,
        size = 10,
        sortBy = 'id',
        sortDir = 'desc',
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDir,
      });

      const response = await api.get(`/posts/events/${eventId}?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching posts for event ${eventId}:`, error);
      throw error;
    }
  },
};

export default postsAPI;

