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
   * @param {File[]} files - Optional array of image/video files
   * @returns {Promise} API response with created comment
   */
  createComment: async (postId, commentData, files = []) => {
    try {
      // Always use multipart to avoid content-type mismatch
      const formData = new FormData();
      formData.append('createCommentDTO', JSON.stringify(commentData));
      if (files && files.length > 0) {
        files.forEach((file) => formData.append('files', file));
      }
      // Override default JSON header
      const response = await api.post(`/comments/posts/${postId}/with-files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error(`Error creating comment on post ${postId}:`, error);
      throw error;
    }
  },

  /**
   * Update a comment
   * @param {number} commentId - Comment ID
   * @param {Object} updateData - Update data
   * @param {string} updateData.content - Updated content
   * @returns {Promise} API response with updated comment
   */
  updateComment: async (commentId, updateData) => {
    try {
      const response = await api.put(`/comments/${commentId}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Error updating comment ${commentId}:`, error);
      throw error;
    }
  },

  updateCommentWithFiles: async (commentId, updateData, files = []) => {
    try {
      const formData = new FormData();
      if (updateData?.content !== undefined) {
        formData.append('content', updateData.content);
      }
      if (files && files.length > 0) {
        files.forEach((file) => formData.append('files', file));
      }
      const response = await api.put(`/comments/${commentId}/with-files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating comment ${commentId} with files:`, error);
      throw error;
    }
  },

  /**
   * Delete a comment
   * @param {number} commentId - Comment ID
   * @returns {Promise} API response
   */
  deleteComment: async (commentId) => {
    try {
      const response = await api.delete(`/comments/${commentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting comment ${commentId}:`, error);
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
   * Get all replies flattened (all nested replies at same level)
   * @param {number} commentId - Comment ID
   * @param {Object} params - Query parameters
   * @param {string} params.cursor - Cursor for pagination
   * @param {number} params.limit - Number of replies to fetch
   * @returns {Promise} API response with all replies flattened
   */
  getAllRepliesFlattened: async (commentId, params = {}) => {
    try {
      const {
        cursor = null,
        limit = 10,
      } = params;

      const queryParams = new URLSearchParams();
      if (cursor) queryParams.append('cursor', cursor);
      queryParams.append('limit', limit.toString());

      const response = await api.get(`/comments/${commentId}/replies/flattened?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching flattened replies for comment ${commentId}:`, error);
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









