/**
 * Authentication Debug Utilities
 * Use these in browser console to debug auth issues
 */

export const authDebug = {
  /**
   * Check if user is logged in
   */
  checkAuth: () => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    
    console.log('=== Auth Status ===');
    console.log('Token exists:', !!token);
    console.log('Token:', token ? token.substring(0, 50) + '...' : 'null');
    console.log('User:', user ? JSON.parse(user) : 'null');
    
    if (token) {
      try {
        // Decode JWT (basic decode, not verification)
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload);
        console.log('Token expires:', new Date(payload.exp * 1000));
        console.log('Token expired:', Date.now() > payload.exp * 1000);
      } catch (e) {
        console.error('Failed to decode token:', e);
      }
    }
  },

  /**
   * Clear all auth data and reload
   */
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    console.log('Cleared auth data. Reloading...');
    window.location.href = '/login';
  },

  /**
   * Test API call
   */
  testAPI: async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/posts/events/22', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      console.log('API Response:', response.status, response.statusText);
      const data = await response.json();
      console.log('Data:', data);
    } catch (e) {
      console.error('API Error:', e);
    }
  },
};

// Make it available globally in dev mode
if (import.meta.env.DEV) {
  window.authDebug = authDebug;
}

export default authDebug;

