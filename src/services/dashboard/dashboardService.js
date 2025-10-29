import api from '../../api/client.js';


// Dashboard API endpoints
export const dashboardAPI = {
  // Get manager dashboard data
  getManagerDashboard: async () => {
    try {
      const response = await api.get('/dashboard/manager');
      return response.data;
    } catch (error) {
      console.error('Error fetching manager dashboard:', error);
      throw error;
    }
  },

  // Get volunteer dashboard data
  getVolunteerDashboard: async () => {
    try {
      const response = await api.get('/dashboard/volunteer');
      return response.data;
    } catch (error) {
      console.error('Error fetching volunteer dashboard:', error);
      throw error;
    }
  },
};