import api from '../../api/client';

/**
 * Likes Service
 * Handles all like-related API calls
 */
export const likesAPI = {
  /**
   * Like or unlike a post
   * @param {number} postId - Post ID
   * @returns {Promise} API response
   */
  togglePostLike: async (postId) => {
    try {
      const response = await api.post(`/likes/posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error(`Error toggling like for post ${postId}:`, error);
      throw error;
    }
  },

  /**
   * Like or unlike a comment
   * @param {number} commentId - Comment ID
   * @returns {Promise} API response
   */
  toggleCommentLike: async (commentId) => {
    try {
      const response = await api.post(`/likes/comments/${commentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error toggling like for comment ${commentId}:`, error);
      throw error;
    }
  },

  /**
   * Get like count for a post
   * @param {number} postId - Post ID
   * @returns {Promise} API response with like count
   */
  getPostLikeCount: async (postId) => {
    try {
      const response = await api.get(`/likes/posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching like count for post ${postId}:`, error);
      throw error;
    }
  },

  /**
   * Get like count for a comment
   * @param {number} commentId - Comment ID
   * @returns {Promise} API response with like count
   */
  getCommentLikeCount: async (commentId) => {
    try {
      const response = await api.get(`/likes/comments/${commentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching like count for comment ${commentId}:`, error);
      throw error;
    }
  },
};

export default likesAPI;












