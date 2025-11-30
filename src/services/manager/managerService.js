import api from '../../api/client';

/**
 * Manager Service
 * Handles all manager-related API calls for events and registrations management
 */

/**
 * Get manager's events (events created by the manager)
 * @param {Object} params - Query parameters
 * @returns {Promise} API response with manager's events
 */
export const getManagerEvents = async (params = {}) => {
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

    const response = await api.get(`/events/me?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching manager events:', error);
    throw error;
  }
};

/**
 * Get all registrations for a specific event
 * @param {number} eventId - Event ID
 * @param {Object} params - Query parameters
 * @returns {Promise} API response with registrations
 */
export const getEventRegistrations = async (eventId, params = {}) => {
  try {
    const {
      pageNumber = 0,
      pageSize = 10,
      sortBy = 'id',
      sortDir = 'asc',
    } = params;

    const queryParams = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
      sortBy,
      sortDir,
    });

    const response = await api.get(`/registrations/events/${eventId}?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching registrations for event ${eventId}:`, error);
    throw error;
  }
};

/**
 * Approve a registration
 * @param {number} eventId - Event ID
 * @param {number} registrationId - Registration ID
 * @returns {Promise} API response
 */
export const approveRegistration = async (eventId, registrationId) => {
  try {
    const response = await api.post(`/registrations/events/${eventId}/${registrationId}/approved`);
    return response.data;
  } catch (error) {
    console.error(`Error approving registration ${registrationId}:`, error);
    throw error;
  }
};

/**
 * Reject a registration
 * @param {number} eventId - Event ID
 * @param {number} registrationId - Registration ID
 * @returns {Promise} API response
 */
export const rejectRegistration = async (eventId, registrationId) => {
  try {
    const response = await api.post(`/registrations/events/${eventId}/${registrationId}/rejected`);
    return response.data;
  } catch (error) {
    console.error(`Error rejecting registration ${registrationId}:`, error);
    throw error;
  }
};

/**
 * Get count of registrations by status for an event
 * @param {number} eventId - Event ID
 * @param {string} status - Registration status (PENDING, APPROVED, REJECTED)
 * @returns {Promise} API response with count
 */
export const getRegistrationCount = async (eventId, status) => {
  try {
    const response = await api.get(`/events/${eventId}/registrations/${status}/count`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching registration count for event ${eventId}:`, error);
    throw error;
  }
};

/**
 * Get event details
 * @param {number} eventId - Event ID
 * @returns {Promise} API response with event details
 */
export const getEventDetails = async (eventId) => {
  try {
    const response = await api.get(`/events/${eventId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching event ${eventId}:`, error);
    throw error;
  }
};

// Export as object for convenience
export const managerAPI = {
  getManagerEvents,
  getEventRegistrations,
  approveRegistration,
  rejectRegistration,
  getRegistrationCount,
  getEventDetails,
};

export default managerAPI;
