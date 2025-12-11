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
      // Always send multipart/form-data so files (if any) go through
      const formData = new FormData();
      formData.append('content', postData.content || '');

      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append('files', file);
        });
      }

      // Force multipart header to override default JSON header
      const response = await api.post(`/posts/events/${eventId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
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

  /**
   * Update a post
   * @param {number} postId - Post ID
   * @param {Object} updateData - Update data
   * @param {string} updateData.content - Updated content
   * @returns {Promise} API response with updated post
   */
  updatePost: async (postId, updateData) => {
    try {
      const response = await api.put(`/posts/${postId}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Error updating post ${postId}:`, error);
      throw error;
    }
  },

  updatePostWithFiles: async (postId, updateData, files = [], removeFileIds = []) => {
    try {
      const formData = new FormData();
      if (updateData?.content !== undefined) {
        formData.append('content', updateData.content);
      }
      if (files && files.length > 0) {
        files.forEach((file) => formData.append('files', file));
      }
      if (removeFileIds && removeFileIds.length > 0) {
        removeFileIds.forEach((id) => formData.append('removeFileIds', id));
      }
      const response = await api.put(`/posts/${postId}/with-files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating post ${postId} with files:`, error);
      throw error;
    }
  },

  /**
   * Delete a post
   * @param {number} postId - Post ID
   * @returns {Promise} API response
   */
  deletePost: async (postId) => {
    try {
      const response = await api.delete(`/posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting post ${postId}:`, error);
      throw error;
    }
  },
};

export default postsAPI;

