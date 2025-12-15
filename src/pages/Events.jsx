import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaCalendar, FaUser, FaUsers, FaClock, FaTimes, FaFileAlt, FaSignInAlt } from 'react-icons/fa';
import { getAllEvents, registerForEvent, getMyEvents } from '../services/events/eventsService';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import './Events.css';

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const searchTimeoutRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(null);
  const [registerError, setRegisterError] = useState(null);

  const statusFilters = [
    { label: 'All', value: '' },
    { label: 'Planned', value: 'PLANNED' },
    { label: 'Ongoing', value: 'ONGOING' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  // Fetch events from API
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch both all events and user's registered events
      const [eventsResponse, myEventsResponse] = await Promise.all([
        getAllEvents({
          page: currentPage,
          size: 12, // Show 12 events per page
          sortBy: 'date',
          sortDirection: 'desc',
          status: selectedStatus,
          search: debouncedSearchQuery,
        }),
        getMyEvents()
      ]);

      if (eventsResponse.success) {
        let allEvents = eventsResponse.data.content;
        
        // Client-side filtering by status as a fallback (in case backend doesn't filter)
        if (selectedStatus) {
          allEvents = allEvents.filter(event => event.status === selectedStatus);
        }
        
        // If user has registered events, mark them as registered
        if (myEventsResponse.success && myEventsResponse.data.content) {
          const registeredEventIds = new Set(
            myEventsResponse.data.content.map(event => event.eventId)
          );
          
          // Update isRegistered flag for events that user has registered for
          allEvents = allEvents.map(event => ({
            ...event,
            isRegistered: registeredEventIds.has(event.eventId)
          }));
        }
        
        setEvents(allEvents);
        setTotalPages(eventsResponse.data.totalPages);
        setTotalElements(selectedStatus ? allEvents.length : eventsResponse.data.totalElements);
      } else {
        setError('Failed to fetch events');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedStatus, debouncedSearchQuery]);

  // Debounce search query
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms debounce delay

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Fetch events on component mount and when filters change
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Handle search - updates the searchQuery which triggers debounce
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    // Reset to first page when search changes (will take effect with debounced query)
    if (currentPage !== 0) {
      setCurrentPage(0);
    }
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'PLANNED':
        return 'status-planned';
      case 'ONGOING':
        return 'status-ongoing';
      case 'COMPLETED':
        return 'status-completed';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Open modal with event details
  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setRegisterSuccess(null);
    setRegisterError(null);
    document.body.style.overflow = 'auto'; // Restore scrolling
  };

  // Handle event registration
  const handleRegisterEvent = async (eventId) => {
    setRegistering(true);
    setRegisterError(null);
    setRegisterSuccess(null);
    
    try {
      const response = await registerForEvent(eventId);
      
      if (response.success) {
        // Update the events list to mark as registered
        setEvents(prevEvents => prevEvents.map(event => 
          event.eventId === eventId ? { ...event, isRegistered: true } : event
        ));
        // Update selected event if modal is open
        if (selectedEvent && selectedEvent.eventId === eventId) {
          setSelectedEvent(prev => ({ ...prev, isRegistered: true }));
        }
        // Show success message briefly
        alert('Successfully registered for the event! Your registration is pending approval.');
      } else {
        setRegisterError(response.message || 'Failed to register for the event');
        alert(response.message || 'Failed to register for the event');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred while registering';
      setRegisterError(errorMessage);
      
      // Check if user already registered - update UI accordingly
      if (errorMessage.toLowerCase().includes('already registered')) {
        setEvents(prevEvents => prevEvents.map(event => 
          event.eventId === eventId ? { ...event, isRegistered: true } : event
        ));
        if (selectedEvent && selectedEvent.eventId === eventId) {
          setSelectedEvent(prev => ({ ...prev, isRegistered: true }));
        }
        alert('You have already registered for this event.');
      } else {
        alert(errorMessage);
      }
    } finally {
      setRegistering(false);
    }
  };

  // Generate smart pagination with ellipses
  const generatePaginationItems = () => {
    const items = [];
    const maxVisible = 5; // Maximum number of page buttons to show

    if (totalPages <= maxVisible + 2) {
      // Show all pages if total is small
      for (let i = 0; i < totalPages; i++) {
        items.push(i);
      }
    } else {
      // Always show first page
      items.push(0);

      if (currentPage <= 2) {
        // Near the beginning: 1 2 3 4 ... 10
        for (let i = 1; i <= 3; i++) {
          items.push(i);
        }
        items.push('ellipsis-end');
        items.push(totalPages - 1);
      } else if (currentPage >= totalPages - 3) {
        // Near the end: 1 ... 7 8 9 10
        items.push('ellipsis-start');
        for (let i = totalPages - 4; i < totalPages - 1; i++) {
          items.push(i);
        }
        items.push(totalPages - 1);
      } else {
        // In the middle: 1 ... 4 5 6 ... 10
        items.push('ellipsis-start');
        items.push(currentPage - 1);
        items.push(currentPage);
        items.push(currentPage + 1);
        items.push('ellipsis-end');
        items.push(totalPages - 1);
      }
    }

    return items;
  };

  return (
    <DashboardLayout 
      userRole="volunteer"
    >
      <div className="events-page">
        <div className="events-container">
          {/* Header Section */}
          <div className="events-header">
            <h1 className="events-title">Browse Events</h1>
            <p className="events-subtitle">
              Discover meaningful volunteer opportunities and make a difference
            </p>
          </div>

        {/* Search Bar */}
        <div className="events-search">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search events by title or description..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="events-filters">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              className={`filter-button ${selectedStatus === filter.value ? 'active' : ''}`}
              data-status={filter.value}
              onClick={() => {
                setSelectedStatus(filter.value);
                setCurrentPage(0);
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="events-results-count">
            Showing {events.length} of {totalElements} events
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="events-loading">
            <div className="spinner"></div>
            <p>Loading events...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="events-error">
            <p>⚠️ {error}</p>
          </div>
        )}

        {/* Events Grid */}
        {!loading && !error && events.length > 0 && (
          <div className="events-grid">
            {events.map((event) => (
              <div key={event.eventId} className="event-card-item">
                {/* Event Image Placeholder */}
                <div className="event-image">
                  <div className="image-placeholder">
                    <FaCalendar className="placeholder-icon" />
                  </div>
                  <span className={`event-status-badge ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>

                {/* Event Content */}
                <div className="event-content">
                  <h3 className="event-title">{event.title}</h3>

                  <div className="event-details">
                    <div className="event-detail-item">
                      <FaCalendar className="detail-icon" />
                      <span>{formatDate(event.date)}</span>
                    </div>

                    <div className="event-detail-item">
                      <FaMapMarkerAlt className="detail-icon" />
                      <span>{event.location}</span>
                    </div>

                    <div className="event-detail-item">
                      <FaUsers className="detail-icon" />
                      <span>Max {event.maxParticipants} participants</span>
                    </div>

                    <div className="event-detail-item">
                      <FaUser className="detail-icon" />
                      <span>By {event.creatorUsername}</span>
                    </div>
                  </div>

                  <div className="event-card-actions">
                    <button 
                      className="event-view-button"
                      onClick={() => handleViewDetails(event)}
                    >
                      <FaClock />
                      View Details
                    </button>
                    {event.status === 'ONGOING' && (
                      event.isRegistered ? (
                        <button 
                          className="event-registered-button"
                          disabled
                        >
                          <FaUsers />
                          Registered
                        </button>
                      ) : (
                        <button 
                          className="event-register-button"
                          onClick={() => handleRegisterEvent(event.eventId)}
                        >
                          <FaUsers />
                          Register
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && events.length === 0 && (
          <div className="events-empty">
            <FaSearch className="empty-icon" />
            <h3>No events found</h3>
            <p>
              {searchQuery || selectedStatus
                ? 'Try adjusting your search or filters'
                : 'There are no events available at the moment'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="events-pagination">
            <button
              className="pagination-button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              Previous
            </button>

            <div className="pagination-pages">
              {generatePaginationItems().map((item) => {
                if (typeof item === 'string' && item.startsWith('ellipsis')) {
                  return (
                    <span key={item} className="pagination-ellipsis">
                      ...
                    </span>
                  );
                }
                return (
                  <button
                    key={item}
                    className={`pagination-page ${currentPage === item ? 'active' : ''}`}
                    onClick={() => handlePageChange(item)}
                  >
                    {item + 1}
                  </button>
                );
              })}
            </div>

            <button
              className="pagination-button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
            >
              Next
            </button>
          </div>
        )}

        {/* Event Detail Modal */}
        {isModalOpen && selectedEvent && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="modal-header">
                <FaCalendar className="modal-header-icon" />
                <span className={`modal-status-badge ${getStatusColor(selectedEvent.status)}`}>
                  {selectedEvent.status}
                </span>
                <button className="modal-close-button" onClick={handleCloseModal}>
                  <FaTimes />
                </button>
              </div>

              {/* Modal Body */}
              <div className="modal-body">
                <h2 className="modal-title">{selectedEvent.title}</h2>

                {/* Details Grid */}
                <div className="modal-details-grid">
                  <div className="modal-detail-item">
                    <FaCalendar className="modal-detail-icon" />
                    <div className="modal-detail-content">
                      <div className="modal-detail-label">Date & Time</div>
                      <div className="modal-detail-value">{formatDate(selectedEvent.date)}</div>
                    </div>
                  </div>

                  <div className="modal-detail-item">
                    <FaMapMarkerAlt className="modal-detail-icon" />
                    <div className="modal-detail-content">
                      <div className="modal-detail-label">Location</div>
                      <div className="modal-detail-value">{selectedEvent.location}</div>
                    </div>
                  </div>

                  <div className="modal-detail-item">
                    <FaUsers className="modal-detail-icon" />
                    <div className="modal-detail-content">
                      <div className="modal-detail-label">Max Participants</div>
                      <div className="modal-detail-value">{selectedEvent.maxParticipants} people</div>
                    </div>
                  </div>

                  <div className="modal-detail-item">
                    <FaUser className="modal-detail-icon" />
                    <div className="modal-detail-content">
                      <div className="modal-detail-label">Organized By</div>
                      <div className="modal-detail-value">{selectedEvent.creatorUsername}</div>
                    </div>
                  </div>
                </div>

                {/* Description Section */}
                <div className="modal-section">
                  <h3 className="modal-section-title">
                    <FaFileAlt className="modal-section-icon" />
                    Event Description
                  </h3>
                  <div className="modal-description">
                    {selectedEvent.description}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer">
                <button className="modal-action-button secondary" onClick={handleCloseModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </DashboardLayout>
  );
};

export default Events;
