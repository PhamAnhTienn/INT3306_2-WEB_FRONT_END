import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaCalendar, FaUser, FaUsers, FaClock, FaTimes, FaFileAlt, FaSignInAlt } from 'react-icons/fa';
import { getMyEvents } from '../services/events/eventsService';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import './Events.css';

const MyEvents = () => {
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
      const response = await getMyEvents();

      if (response.success) {
        // Filter events based on search query and status
        let filteredEvents = response.data.content;

        // Apply search filter using debounced query
        if (debouncedSearchQuery) {
          const query = debouncedSearchQuery.toLowerCase();
          filteredEvents = filteredEvents.filter(
            (event) =>
              event.title.toLowerCase().includes(query) ||
              event.description.toLowerCase().includes(query)
          );
        }

        // Apply event status filter (using event.status, not registrationStatus)
        if (selectedStatus) {
          filteredEvents = filteredEvents.filter(
            (event) => event.status === selectedStatus
          );
        }

        // Calculate pagination for filtered results
        const pageSize = 12;
        const totalFiltered = filteredEvents.length;
        const totalPagesCalculated = Math.ceil(totalFiltered / pageSize);
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

        setEvents(paginatedEvents);
        setTotalPages(totalPagesCalculated);
        setTotalElements(totalFiltered);

        // Reset to first page if current page exceeds total pages
        if (currentPage >= totalPagesCalculated && totalPagesCalculated > 0) {
          setCurrentPage(0);
        }
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
    document.body.style.overflow = 'auto'; // Restore scrolling
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
            <h1 className="events-title">My Events</h1>
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
                      <FaUser className="detail-icon" />
                      <span>By {event.creatorUsername}</span>
                    </div>
                  </div>

                  {/* Participants Progress */}
                  <div className="event-participants">
                    <div className="participants-header">
                      <FaUsers className="participants-icon" />
                      <span className="participants-text">
                        {event.currentParticipants || 0} / {event.maxParticipants} Participants
                      </span>
                      {(() => {
                        const current = event.currentParticipants || 0;
                        const max = event.maxParticipants;
                        const percentage = (current / max) * 100;
                        
                        if (current >= max) {
                          return <span className="availability-badge badge-full">Full</span>;
                        } else if (percentage >= 80) {
                          return <span className="availability-badge badge-almost-full">Almost Full</span>;
                        } else if (percentage >= 50) {
                          return <span className="availability-badge badge-filling">Filling Up</span>;
                        }
                        return <span className="availability-badge badge-available">Available</span>;
                      })()}
                    </div>
                    <div className="participants-progress-bar">
                      <div 
                        className={`participants-progress-fill ${
                          ((event.currentParticipants || 0) / event.maxParticipants) >= 1 ? 'full' :
                          ((event.currentParticipants || 0) / event.maxParticipants) >= 0.8 ? 'almost-full' :
                          ((event.currentParticipants || 0) / event.maxParticipants) >= 0.5 ? 'filling' : 'available'
                        }`}
                        style={{ width: `${Math.min(((event.currentParticipants || 0) / event.maxParticipants) * 100, 100)}%` }}
                      ></div>
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
                    <button 
                      className="event-enter-button"
                      onClick={() => navigate(`/volunteer/events/${event.eventId}/feed`)}
                    >
                      <FaSignInAlt />
                      Enter Event
                    </button>
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
                      <div className="modal-detail-label">Participants</div>
                      <div className="modal-detail-value">
                        {selectedEvent.currentParticipants || 0} / {selectedEvent.maxParticipants} registered
                        {(() => {
                          const current = selectedEvent.currentParticipants || 0;
                          const max = selectedEvent.maxParticipants;
                          if (current >= max) {
                            return <span className="modal-availability-badge badge-full">Full</span>;
                          } else if ((current / max) >= 0.8) {
                            return <span className="modal-availability-badge badge-almost-full">Almost Full</span>;
                          }
                          return null;
                        })()}
                      </div>
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

                {/* Participants Progress in Modal */}
                <div className="modal-participants-progress">
                  <div className="participants-progress-bar">
                    <div 
                      className={`participants-progress-fill ${
                        ((selectedEvent.currentParticipants || 0) / selectedEvent.maxParticipants) >= 1 ? 'full' :
                        ((selectedEvent.currentParticipants || 0) / selectedEvent.maxParticipants) >= 0.8 ? 'almost-full' :
                        ((selectedEvent.currentParticipants || 0) / selectedEvent.maxParticipants) >= 0.5 ? 'filling' : 'available'
                      }`}
                      style={{ width: `${Math.min(((selectedEvent.currentParticipants || 0) / selectedEvent.maxParticipants) * 100, 100)}%` }}
                    ></div>
                  </div>
                  {(() => {
                    const current = selectedEvent.currentParticipants || 0;
                    const max = selectedEvent.maxParticipants;
                    const remaining = max - current;
                    if (current >= max) {
                      return <p className="availability-message warning">⚠️ This event is full.</p>;
                    } else if (remaining <= 3) {
                      return <p className="availability-message warning">⚠️ Only {remaining} spot(s) remaining!</p>;
                    } else if ((current / max) >= 0.8) {
                      return <p className="availability-message info">ℹ️ This event is filling up fast. {remaining} spots available.</p>;
                    }
                    return <p className="availability-message success">✅ {remaining} spots available</p>;
                  })()}
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

export default MyEvents;
