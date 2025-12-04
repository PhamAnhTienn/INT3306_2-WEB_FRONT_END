import api from '../../api/client';

/**
 * Events Service
 * Handles all event-related API calls
 */

/**
 * Fetch all events with pagination and filtering
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (0-indexed)
 * @param {number} params.size - Number of items per page
 * @param {string} params.sortBy - Field to sort by (e.g., 'date', 'createdAt')
 * @param {string} params.sortDirection - Sort direction ('asc' or 'desc')
 * @param {string} params.status - Filter by event status (PLANNED, ONGOING, COMPLETED, CANCELLED)
 * @param {string} params.search - Search query for title/description
 * @returns {Promise} API response with events data
 */
export const getAllEvents = async (params = {}) => {
  try {
    const {
      page = 0,
      size = 10,
      sortBy = 'date',
      sortDirection = 'desc',
      status = '',
      search = '',
    } = params;

    // Build query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort: `${sortBy},${sortDirection}`,
    });

    // Add optional filters
    if (status) {
      queryParams.append('status', status);
    }
    if (search) {
      queryParams.append('search', search);
    }

    const response = await api.get(`/events?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

/**
 * Fetch a single event by ID
 * @param {number} eventId - Event ID
 * @returns {Promise} API response with event details
 */
export const getEventById = async (eventId) => {
  try {
    const response = await api.get(`/events/${eventId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching event ${eventId}:`, error);
    throw error;
  }
};

/**
 * Register for an event with pending status
 * @param {number} eventId - Event ID
 * @returns {Promise} API response with registration data
 */
export const registerForEvent = async (eventId) => {
  try {
    const response = await api.post(`/registrations/events/${eventId}`);
    return response.data;
  } catch (error) {
    console.error(`Error registering for event ${eventId}:`, error);
    throw error;
  }
};

/**
 * Unregister from an event
 * @param {number} eventId - Event ID
 * @returns {Promise} API response
 */
export const unregisterFromEvent = async (eventId) => {
  try {
    const response = await api.delete(`/events/${eventId}/unregister`);
    return response.data;
  } catch (error) {
    console.error(`Error unregistering from event ${eventId}:`, error);
    throw error;
  }
};

/**
 * Get user's registered events
 * @returns {Promise} API response with user's events
 */
export const getMyEvents = async () => {
  try {
    const response = await api.get('/registrations/my');
    return response.data;
  } catch (error) {
    console.error('Error fetching my events:', error);
    throw error;
  }
};

/**
 * Create a new event
 * @param {Object} eventData - Event data
 * @param {string} eventData.title - Event title
 * @param {string} eventData.description - Event description
 * @param {string} eventData.date - Event date (ISO string)
 * @param {string} eventData.location - Event location
 * @param {number} eventData.maxParticipants - Maximum participants
 * @param {string[]} eventData.tags - Array of tag names
 * @returns {Promise} API response with created event
 */
export const createEvent = async (eventData) => {
  try {
    const response = await api.post('/events', eventData);
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};