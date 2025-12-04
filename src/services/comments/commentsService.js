import api from '../../api/client';

/**
 * Comments Service
 * Handles all comment-related API calls
 */
export const commentsAPI = {
  /**
   * Create a comment on a post
   * @param {number} postId - Post ID
   * @param {Object} commentData - Comment data
   * @param {string} commentData.content - Comment content
   * @param {number} commentData.parentId - Optional parent comment ID for replies
   * @returns {Promise} API response with created comment
   */
  createComment: async (postId, commentData) => {
    try {
      const response = await api.post(`/comments/posts/${postId}`, commentData);
      return response.data;
    } catch (error) {
      console.error(`Error creating comment on post ${postId}:`, error);
      throw error;
    }
  },

  /**
   * Get latest comments for a post
   * @param {number} postId - Post ID
   * @param {Object} params - Query parameters
   * @param {string} params.cursor - Cursor for pagination
   * @param {number} params.limit - Number of comments to fetch
   * @returns {Promise} API response with comments
   */
  getPostComments: async (postId, params = {}) => {
    try {
      const {
        cursor = null,
        limit = 10,
      } = params;

      const queryParams = new URLSearchParams();
      if (cursor) queryParams.append('cursor', cursor);
      queryParams.append('limit', limit.toString());

      const response = await api.get(`/comments/posts/${postId}/latest?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching comments for post ${postId}:`, error);
      throw error;
    }
  },

  /**
   * Get replies for a comment
   * @param {number} commentId - Comment ID
   * @param {Object} params - Query parameters
   * @param {string} params.cursor - Cursor for pagination
   * @param {number} params.limit - Number of replies to fetch
   * @returns {Promise} API response with replies
   */
  getCommentReplies: async (commentId, params = {}) => {
    try {
      const {
        cursor = null,
        limit = 10,
      } = params;

      const queryParams = new URLSearchParams();
      if (cursor) queryParams.append('cursor', cursor);
      queryParams.append('limit', limit.toString());

      const response = await api.get(`/comments/${commentId}/replies?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching replies for comment ${commentId}:`, error);
      throw error;
    }
  },

  /**
   * Get a single comment by ID
   * @param {number} commentId - Comment ID
   * @returns {Promise} API response with comment
   */
  getCommentById: async (commentId) => {
    try {
      const response = await api.get(`/comments/${commentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching comment ${commentId}:`, error);
      throw error;
    }
  },
};

export default commentsAPI;



