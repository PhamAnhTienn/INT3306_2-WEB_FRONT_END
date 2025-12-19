import api from '../../api/client';

/**
 * Events Service
 * Handles all event-related API calls
 */

/**
 * Fetch all events with pagination and filtering
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
      from = '',
      to = '',
      category = '',
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort: `${sortBy},${sortDirection}`,
    });

    if (status) queryParams.append('status', status);
    if (search) queryParams.append('search', search);
    if (from) queryParams.append('from', from);
    if (to) queryParams.append('to', to);
    if (category) queryParams.append('category', category);

    const response = await api.get(`/events?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

/**
 * Fetch a single event by ID
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
 * Get registration status for current user in a given event
 */
export const getRegistrationStatus = async (eventId) => {
  try {
    const response = await api.get(`/registrations/events/${eventId}/status`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching registration status for event ${eventId}:`, error);
    throw error;
  }
};

/**
 * Register for an event with pending status
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
 * Cancel registration (unregister from an event)
 */
export const cancelRegistration = async (eventId) => {
  try {
    const response = await api.delete(`/registrations/events/${eventId}`);
    return response.data;
  } catch (error) {
    console.error(`Error canceling registration for event ${eventId}:`, error);
    throw error;
  }
};

/**
 * Unregister from an event (deprecated - use cancelRegistration instead)
 */
export const unregisterFromEvent = async (eventId) => {
  return cancelRegistration(eventId);
};

/**
 * Get user's registered events (supports status filter & pagination)
 */
export const getMyEvents = async ({
  status = '',
  page = 0,
  size = 10,
  sortBy = 'registeredAt',
  sortDirection = 'desc',
} = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDirection,
    });
    if (status) queryParams.append('status', status);

    // Backend endpoint is `/api/v1/registrations/my`
    const response = await api.get(`/registrations/my?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching my events:', error);
    throw error;
  }
};

/**
 * Get user's registrations with full details (including status)
 * Used to show registration status badges in Events list
 */
export const getMyRegistrations = async (page = 0, size = 100) => {
  try {
    const queryParams = new URLSearchParams({
      pageNumber: page.toString(),
      pageSize: size.toString(),
    });

    const response = await api.get(`/registrations/my-registrations?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching my registrations:', error);
    throw error;
  }
};

/**
 * Create a new event (manager)
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

/**
 * Get QR code URL for an event (manager only)
 */
export const getEventQRCode = async (eventId) => {
  try {
    const response = await api.get(`/events/${eventId}/qr-code`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching QR code for event ${eventId}:`, error);
    throw error;
  }
};

/**
 * Upload QR code image and complete registration (volunteer only)
 * Only available when event status is ONGOING and registration is APPROVED
 */
export const uploadEventQRCode = async (eventId, qrCodeFile) => {
  try {
    const formData = new FormData();
    formData.append('qrCode', qrCodeFile);
    
    const response = await api.post(`/registrations/events/${eventId}/upload-qr`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error uploading QR code for event ${eventId}:`, error);
    throw error;
  }
};
