import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCalendar, FaMapMarkerAlt, FaUsers, FaEdit, FaTrash } from 'react-icons/fa';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { getEventById } from '../services/events/eventsService';
import { managerAPI } from '../services/manager/managerService';
import './EventDetail.css';

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await managerAPI.getEventDetails(eventId);
      
      if (response.success && response.data) {
        setEvent(response.data);
      } else {
        setError('Failed to load event details');
      }
    } catch (error) {
      setError(error.message || 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const statusClass = status?.toLowerCase() || 'default';
    return (
      <span className={`status-badge status-${statusClass}`}>
        {status || 'UNKNOWN'}
      </span>
    );
  };

  if (loading) {
    return (
      <DashboardLayout
        userRole="manager"
        title="Event Details"
        breadcrumbs={['Manager', 'Events', 'Details']}
      >
        <div className="event-detail-loading">
          <div className="spinner"></div>
          <p>Loading event details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !event) {
    return (
      <DashboardLayout
        userRole="manager"
        title="Event Details"
        breadcrumbs={['Manager', 'Events', 'Details']}
      >
        <div className="event-detail-error">
          <p>⚠️ {error || 'Event not found'}</p>
          <button onClick={() => navigate('/manager/events')} className="btn-back">
            Go Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      userRole="manager"
      title="Event Details"
      breadcrumbs={['Manager', 'Events', 'Details']}
    >
      <div className="event-detail-page">
        <div className="event-detail-header">
          <button
            className="btn-back"
            onClick={() => navigate('/manager/events')}
          >
            <FaArrowLeft />
            <span>Back to Events</span>
          </button>
          
          <div className="event-detail-title-section">
            <div className="title-row">
              <h1>{event.title || event.eventTitle}</h1>
              {getStatusBadge(event.status)}
            </div>
            <div className="event-actions">
              {/* Edit button - can be added when edit API is available */}
              {/* <button className="btn-action btn-edit">
                <FaEdit />
                <span>Edit</span>
              </button> */}
            </div>
          </div>
        </div>

        <div className="event-detail-content">
          <div className="event-detail-main">
            <div className="event-detail-card">
              <h3>Event Information</h3>
              
              <div className="event-info-grid">
                <div className="info-item">
                  <FaCalendar className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Date & Time</span>
                    <span className="info-value">{formatDate(event.date || event.startTime)}</span>
                  </div>
                </div>

                <div className="info-item">
                  <FaMapMarkerAlt className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Location</span>
                    <span className="info-value">{event.location || 'N/A'}</span>
                  </div>
                </div>

                <div className="info-item">
                  <FaUsers className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Participants</span>
                    <span className="info-value">
                      {event.currentParticipants || 0} / {event.maxParticipants || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="event-description">
                <h4>Description</h4>
                <p>{event.description || 'No description provided.'}</p>
              </div>

              {event.tags && event.tags.length > 0 && (
                <div className="event-tags">
                  <h4>Tags</h4>
                  <div className="tags-list">
                    {event.tags.map((tag, index) => (
                      <span key={index} className="tag-badge">
                        {tag.name || tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="event-detail-sidebar">
            <div className="event-detail-card">
              <h3>Quick Actions</h3>
              <div className="quick-actions">
                <button
                  className="btn-quick-action"
                  onClick={() => navigate(`/manager/volunteers?eventId=${eventId}`)}
                >
                  <FaUsers />
                  <span>View Registrations</span>
                </button>
              </div>
            </div>

            <div className="event-detail-card">
              <h3>Event Statistics</h3>
              <div className="event-stats">
                <div className="stat-item">
                  <span className="stat-label">Status</span>
                  {getStatusBadge(event.status)}
                </div>
                <div className="stat-item">
                  <span className="stat-label">Created</span>
                  <span className="stat-value">
                    {event.createdAt 
                      ? new Date(event.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EventDetail;












