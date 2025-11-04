import { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaMapMarkerAlt, FaCalendar, FaUser, FaUsers, FaClock } from 'react-icons/fa';
import { getAllEvents } from '../services/events/eventsService';
import './Events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

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
      const response = await getAllEvents({
        page: currentPage,
        size: 9,
        sortBy: 'date',
        sortDirection: 'desc',
        status: selectedStatus,
        search: searchQuery,
      });

      if (response.success) {
        setEvents(response.data.content);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
      } else {
        setError('Failed to fetch events');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedStatus, searchQuery]);

  // Fetch events on component mount and when filters change
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Handle search - removed separate useEffect since fetchEvents is already called via its dependencies
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0); // Reset to first page
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

  return (
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
                  <p className="event-description">
                    {event.description.length > 100
                      ? `${event.description.substring(0, 100)}...`
                      : event.description}
                  </p>

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

                  <button className="event-view-button">
                    <FaClock />
                    View Details
                  </button>
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
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`pagination-page ${currentPage === i ? 'active' : ''}`}
                  onClick={() => handlePageChange(i)}
                >
                  {i + 1}
                </button>
              ))}
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
      </div>
    </div>
  );
};

export default Events;
