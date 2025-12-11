import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaCalendar,
  FaMapMarkerAlt,
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
} from 'react-icons/fa';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { adminAPI } from '../services/admin/adminService';
import './AdminEventDetail.css';

const AdminEventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getEventDetail(eventId);

      if (response.success && response.data) {
        setEvent(response.data);
      } else {
        setError('Failed to load event details');
      }
    } catch (err) {
      setError(err.message || 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this event?')) return;

    try {
      setActionLoading('approving');
      await adminAPI.approveEvent(eventId);
      alert('Event approved successfully');
      fetchEventDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve event');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    if (!confirm('Are you sure you want to reject this event?')) return;

    try {
      setActionLoading('rejecting');
      await adminAPI.rejectEvent(eventId, rejectReason.trim());
      alert('Event rejected successfully');
      setShowRejectModal(false);
      setRejectReason('');
      fetchEventDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject event');
    } finally {
      setActionLoading(null);
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
        userRole="admin"
        title="Event Details"
        breadcrumbs={['Admin', 'Events', 'Details']}
      >
        <div className="admin-event-detail-loading">
          <FaSpinner className="spinning" />
          <p>Loading event details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !event) {
    return (
      <DashboardLayout
        userRole="admin"
        title="Event Details"
        breadcrumbs={['Admin', 'Events', 'Details']}
      >
        <div className="admin-event-detail-error">
          <p>⚠️ {error || 'Event not found'}</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/dashboard/admin')}
          >
            Go Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const canApprove = event.status === 'PENDING';
  const canReject = event.status === 'PENDING';

  return (
    <DashboardLayout
      userRole="admin"
      title="Event Details"
      breadcrumbs={['Admin', 'Events', 'Details']}
    >
      <div className="admin-event-detail-page">
        <div className="admin-event-detail-header">
          <button
            className="btn-back"
            onClick={() => navigate('/dashboard/admin')}
          >
            <FaArrowLeft />
            <span>Back to Dashboard</span>
          </button>

          <div className="admin-event-detail-title-section">
            <div className="title-row">
              <h1>{event.title || event.eventTitle}</h1>
              {getStatusBadge(event.status)}
            </div>
            {(canApprove || canReject) && (
              <div className="event-actions">
                {canApprove && (
                  <button
                    className="btn-action btn-approve"
                    onClick={handleApprove}
                    disabled={actionLoading === 'approving'}
                  >
                    {actionLoading === 'approving' ? (
                      <>
                        <FaSpinner className="spinning" /> Approving...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle /> Approve Event
                      </>
                    )}
                  </button>
                )}
                {canReject && (
                  <button
                    className="btn-action btn-reject"
                    onClick={() => setShowRejectModal(true)}
                    disabled={actionLoading}
                  >
                    <FaTimesCircle /> Reject Event
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="admin-event-detail-content">
          <div className="admin-event-detail-main">
            <div className="admin-event-detail-card">
              <h3>Event Information</h3>

              <div className="event-info-grid">
                <div className="info-item">
                  <FaCalendar className="info-icon" />
                  <div className="info-content">
                    <span className="info-label">Date & Time</span>
                    <span className="info-value">
                      {formatDate(event.date || event.startTime)}
                    </span>
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

              {event.creatorName && (
                <div className="event-creator">
                  <h4>Created By</h4>
                  <p>
                    <strong>{event.creatorName}</strong>
                    {event.creatorEmail && (
                      <span className="creator-email"> ({event.creatorEmail})</span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="admin-event-detail-sidebar">
            <div className="admin-event-detail-card">
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

        {/* Reject Modal */}
        {showRejectModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowRejectModal(false)}
          >
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Reject Event</h3>
                <button
                  className="modal-close"
                  onClick={() => setShowRejectModal(false)}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <p>
                  <strong>Event:</strong> {event.title || event.eventTitle}
                </p>
                <div className="form-group">
                  <label>Reason for rejection:</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter reason for rejecting this event..."
                    rows="4"
                    className="form-control"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleReject}
                  disabled={actionLoading === 'rejecting' || !rejectReason.trim()}
                >
                  {actionLoading === 'rejecting' ? (
                    <>
                      <FaSpinner className="spinning" /> Rejecting...
                    </>
                  ) : (
                    'Reject Event'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminEventDetail;









