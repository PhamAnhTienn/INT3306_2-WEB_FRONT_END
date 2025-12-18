import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaInfoCircle } from 'react-icons/fa';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { getEventById } from '../services/events/eventsService';
import './EventDetail.css';

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getEventById(eventId);
        if (res.success && res.data) {
          setEvent(res.data);
        } else {
          setError(res.message || 'Failed to load event');
        }
      } catch (err) {
        const message = err.response?.data?.message || err.message || 'Failed to load event';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [eventId]);

  const getStatusBadge = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'PLANNED':
        return <span className="status-badge status-planned">Planned</span>;
      case 'ONGOING':
        return <span className="status-badge status-ongoing">Ongoing</span>;
      case 'COMPLETED':
        return <span className="status-badge status-completed">Completed</span>;
      case 'CANCELLED':
        return <span className="status-badge status-cancelled">Cancelled</span>;
      default:
        return <span className="status-badge">{status}</span>;
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

  if (loading) {
    return (
      <DashboardLayout
        userRole="manager"
        title="Event Detail"
        breadcrumbs={['Manager', 'My Events', 'Detail']}
      >
        <div className="event-detail-page">
          <div className="event-detail-loading">
            <div className="spinner"></div>
            <p>Loading event details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        userRole="manager"
        title="Event Detail"
        breadcrumbs={['Manager', 'My Events', 'Detail']}
      >
        <div className="event-detail-page">
          <div className="event-detail-error">
            <FaInfoCircle style={{ fontSize: '3rem', color: '#ef4444', marginBottom: '1rem' }} />
            <h3>Failed to Load Event</h3>
            <p>{error}</p>
            <button className="btn-action" onClick={() => navigate(-1)}>
              <FaArrowLeft /> Go Back
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!event) {
    return (
      <DashboardLayout
        userRole="manager"
        title="Event Detail"
        breadcrumbs={['Manager', 'My Events', 'Detail']}
      >
        <div className="event-detail-page">
          <div className="event-detail-error">
            <FaInfoCircle style={{ fontSize: '3rem', color: '#6b7280', marginBottom: '1rem' }} />
            <h3>Event Not Found</h3>
            <p>The event you're looking for doesn't exist or has been removed.</p>
            <button className="btn-action" onClick={() => navigate(-1)}>
              <FaArrowLeft /> Go Back
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      userRole="manager"
      title="Event Detail"
      breadcrumbs={['Manager', 'My Events', 'Detail']}
    >
      <div className="event-detail-page">
        {/* Header */}
        <div className="event-detail-header">
          <button className="btn-back" onClick={() => navigate(-1)}>
            <FaArrowLeft /> Back to My Events
          </button>

          <div className="event-detail-title-section">
            <div className="title-row">
              <h1>{event.title}</h1>
              {getStatusBadge(event.status)}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="event-detail-content">
          {/* Main Content */}
          <div className="event-detail-main">
            {/* Basic Information Card */}
            <div className="event-detail-card">
              <h3>Event Information</h3>
              <div className="event-info-grid">
                <div className="info-item">
                  <FaCalendarAlt className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Date & Time</span>
                    <span className="info-value">{formatDate(event.date)}</span>
                  </div>
                </div>

                <div className="info-item">
                  <FaMapMarkerAlt className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Location</span>
                    <span className="info-value">{event.location || 'Not specified'}</span>
                  </div>
                </div>

                <div className="info-item">
                  <FaUsers className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Max Participants</span>
                    <span className="info-value">{event.maxParticipants || 'N/A'}</span>
                  </div>
                </div>

                <div className="info-item">
                  <FaUsers className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Current Participants</span>
                    <span className="info-value">{event.currentParticipants || 0}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {event.description && (
                <div className="event-description">
                  <h4>Description</h4>
                  <p>{event.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="event-detail-sidebar">
            {/* Quick Actions */}
            <div className="event-detail-card">
              <h3>Quick Actions</h3>
              <div className="quick-actions">
                <button
                  className="btn-quick-action"
                  onClick={() => navigate(`/manager/events/${eventId}/registrations`)}
                >
                  <FaUsers />
                  View Registrations
                </button>
                <button
                  className="btn-quick-action"
                  onClick={() => navigate(`/manager/events/${eventId}/feed`)}
                >
                  <FaInfoCircle />
                  View Event Feed
                </button>
              </div>
            </div>

            {/* Event Stats */}
            <div className="event-detail-card">
              <h3>Event Statistics</h3>
              <div className="event-stats">
                <div className="stat-item">
                  <span className="stat-label">Status</span>
                  <span className="stat-value">{event.status}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Registered</span>
                  <span className="stat-value">
                    {event.currentParticipants || 0} / {event.maxParticipants || 0}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Creator</span>
                  <span className="stat-value">{event.creatorUsername || 'N/A'}</span>
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
