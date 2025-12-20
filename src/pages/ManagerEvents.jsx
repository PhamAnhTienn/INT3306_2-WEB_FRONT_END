import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { managerAPI } from '../services/manager/managerService';
import './ManagerEvents.css';
import {
  FaCalendarAlt,
  FaUsers,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaUserCheck,
  FaUserTimes,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaPlus,
} from 'react-icons/fa';

const ManagerEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await managerAPI.getManagerEvents({
        page,
        size: 10,
        sortBy: 'id',
        sortDir: 'desc',
      });

      if (response.success && response.data) {
        setEvents(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
      } else {
        setError('Failed to load events');
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PLANNED':
        return <span className="me-status-badge me-status-planned">Planned</span>;
      case 'ONGOING':
        return <span className="me-status-badge me-status-ongoing">Ongoing</span>;
      case 'COMPLETED':
        return <span className="me-status-badge me-status-completed">Completed</span>;
      case 'CANCELLED':
        return <span className="me-status-badge me-status-cancelled">Cancelled</span>;
      default:
        return <span className="me-status-badge">{status}</span>;
    }
  };

  const getRegistrationStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="me-reg-status-badge me-reg-pending"><FaClock /> Pending</span>;
      case 'APPROVED':
        return <span className="me-reg-status-badge me-reg-approved"><FaCheckCircle /> Approved</span>;
      case 'REJECTED':
        return <span className="me-reg-status-badge me-reg-rejected"><FaTimesCircle /> Rejected</span>;
      default:
        return <span className="me-reg-status-badge">{status}</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredEvents = events.filter((event) =>
    event.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && events.length === 0) {
    return (
      <DashboardLayout
        userRole="manager"
        title="My Events"
        breadcrumbs={['Pages', 'My Events']}
      >
        <div className="manager-events">
          <div className="me-loading-container">
            <div className="me-loading-spinner"></div>
            <p>Loading events...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        userRole="manager"
        title="My Events"
        breadcrumbs={['Pages', 'My Events']}
      >
        <div className="manager-events">
          <div className="me-error-container">
            <div className="me-error-icon">⚠️</div>
            <h3>Unable to load events</h3>
            <p>{error}</p>
            <button className="me-btn me-btn-primary" onClick={fetchEvents}>
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      userRole="manager"
      title="My Events"
      breadcrumbs={['Pages', 'My Events']}
    >
      <div className="manager-events">
        {/* Search & Filter Header */}
        <div className="me-header">
          <div className="me-search-box">
            <FaSearch className="me-search-icon" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="me-header-actions">
            <div className="me-events-count">
              <span>{filteredEvents.length} events found</span>
            </div>
            <button
              className="me-btn me-btn-create"
              onClick={() => navigate('/manager/events/create')}
            >
              <FaPlus />
              <span>Create Event</span>
            </button>
          </div>
        </div>

        {/* Events Grid */}
        <div className="me-events-grid">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <div key={event.id} className="me-event-card">
                <div className="me-event-card-header">
                  <h3 className="me-event-card-title">{event.title}</h3>
                  {getStatusBadge(event.status)}
                </div>

                <div className="me-event-card-body">
                  <div className="me-event-detail">
                    <FaCalendarAlt />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="me-event-detail">
                    <FaMapMarkerAlt />
                    <span>{event.location || 'No location'}</span>
                  </div>
                  <div className="me-event-detail">
                    <FaUsers />
                    <span>
                      {event.currentParticipants || 0}/{event.maxParticipants || 0} Participants
                    </span>
                  </div>
                </div>

                <div className="me-event-card-footer">
                  <button
                    className="me-btn me-btn-view"
                    onClick={() => navigate(`/manager/events/${event.id || event.eventId}`)}
                  >
                    <FaEye /> View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="me-empty-state">
              <div className="me-empty-state-icon">
                <FaInfoCircle />
              </div>
              <h3>No Events Found</h3>
              <p>You haven't created any events yet or no events match your search.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="me-pagination">
            <button
              className="me-pagination-btn"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <FaChevronLeft /> Previous
            </button>
            <span className="me-pagination-info">
              Page {page + 1} of {totalPages}
            </span>
            <button
              className="me-pagination-btn"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            >
              Next <FaChevronRight />
            </button>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default ManagerEvents;
