import api from '../../api/client';

/**
 * Notifications Service
 * Handles all notification-related API calls
 */
export const notificationsAPI = {
  /**
   * Get current user's notifications (cursor-based pagination)
   * @param {Object} params
   * @param {string|null} params.cursor
   * @param {number} params.limit
   */
  getMyNotifications: async ({ cursor = null, limit = 10 } = {}) => {
    const queryParams = new URLSearchParams();
    if (cursor) queryParams.append('cursor', cursor);
    queryParams.append('limit', String(limit));

    const response = await api.get(
      `/notifications/me?${queryParams.toString()}`
    );
    return response.data; // ApiResponse<NotificationCursorPageResponse>
  },

  /** Mark a notification as read */
  markAsRead: async (notificationId) => {
    const response = await api.put(`/notifications/me/${notificationId}/read`);
    return response.data;
  },

  /** Mark all notifications as read */
  markAllAsRead: async () => {
    const response = await api.put('/notifications/me/read-all');
    return response.data;
  },

  /** Get redirect info for a notification */
  getRedirectInfo: async (notificationId) => {
    const response = await api.get(
      `/notifications/me/${notificationId}/redirect`
    );
    return response.data; // ApiResponse<Map<String, Object>>
  },
};

export default notificationsAPI;



