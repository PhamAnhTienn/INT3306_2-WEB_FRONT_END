import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-icons/fa';

const ManagerEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [registrationPage, setRegistrationPage] = useState(0);
  const [registrationTotalPages, setRegistrationTotalPages] = useState(0);
  const [actionLoading, setActionLoading] = useState({});
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

  const fetchRegistrations = async (eventId) => {
    try {
      setRegistrationsLoading(true);
      const response = await managerAPI.getEventRegistrations(eventId, {
        pageNumber: registrationPage,
        pageSize: 10,
      });

      if (response.success && response.data) {
        setRegistrations(response.data.content || []);
        setRegistrationTotalPages(response.data.totalPages || 0);
      }
    } catch (err) {
      console.error('Error fetching registrations:', err);
    } finally {
      setRegistrationsLoading(false);
    }
  };

  const handleViewRegistrations = async (event) => {
    setSelectedEvent(event);
    setRegistrationPage(0);
    await fetchRegistrations(event.id);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setRegistrations([]);
    setRegistrationPage(0);
  };

  const handleApprove = async (registrationId) => {
    if (!selectedEvent) return;

    setActionLoading((prev) => ({ ...prev, [registrationId]: 'approving' }));
    try {
      await managerAPI.approveRegistration(selectedEvent.id, registrationId);
      // Refresh registrations
      await fetchRegistrations(selectedEvent.id);
      // Refresh events to update counts
      await fetchEvents();
    } catch (err) {
      console.error('Error approving registration:', err);
      alert('Failed to approve registration');
    } finally {
      setActionLoading((prev) => ({ ...prev, [registrationId]: null }));
    }
  };

  const handleReject = async (registrationId) => {
    if (!selectedEvent) return;

    setActionLoading((prev) => ({ ...prev, [registrationId]: 'rejecting' }));
    try {
      await managerAPI.rejectRegistration(selectedEvent.id, registrationId);
      // Refresh registrations
      await fetchRegistrations(selectedEvent.id);
      // Refresh events to update counts
      await fetchEvents();
    } catch (err) {
      console.error('Error rejecting registration:', err);
      alert('Failed to reject registration');
    } finally {
      setActionLoading((prev) => ({ ...prev, [registrationId]: null }));
    }
  };

  useEffect(() => {
    if (selectedEvent) {
      fetchRegistrations(selectedEvent.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registrationPage]);

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
          <div className="me-events-count">
            <span>{filteredEvents.length} events found</span>
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
                    onClick={() => handleViewRegistrations(event)}
                  >
                    <FaEye /> View Registrations
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

        {/* Registrations Modal */}
        {selectedEvent && (
          <div className="me-modal-overlay" onClick={handleCloseModal}>
            <div className="me-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="me-modal-header">
                <h2>Registrations for "{selectedEvent.title}"</h2>
                <button className="me-modal-close" onClick={handleCloseModal}>
                  &times;
                </button>
              </div>

              <div className="me-modal-body">
                {registrationsLoading ? (
                  <div className="me-loading-container">
                    <div className="me-loading-spinner"></div>
                    <p>Loading registrations...</p>
                  </div>
                ) : registrations.length > 0 ? (
                  <>
                    <div className="me-registrations-table-container">
                      <table className="me-registrations-table">
                        <thead>
                          <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Registered At</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {registrations.map((reg) => (
                            <tr key={reg.id}>
                              <td>
                                <div className="me-user-cell">
                                  <div className="me-user-avatar">
                                    {reg.user?.fullName?.charAt(0) || reg.user?.username?.charAt(0) || '?'}
                                  </div>
                                  <span>{reg.user?.fullName || reg.user?.username || 'Unknown'}</span>
                                </div>
                              </td>
                              <td>{reg.user?.email || 'N/A'}</td>
                              <td>{formatDate(reg.registeredAt)}</td>
                              <td>{getRegistrationStatusBadge(reg.status)}</td>
                              <td>
                                {reg.status === 'PENDING' && (
                                  <div className="me-action-buttons">
                                    <button
                                      className="me-btn-action me-btn-approve"
                                      onClick={() => handleApprove(reg.id)}
                                      disabled={actionLoading[reg.id]}
                                    >
                                      {actionLoading[reg.id] === 'approving' ? (
                                        'Approving...'
                                      ) : (
                                        <>
                                          <FaUserCheck /> Approve
                                        </>
                                      )}
                                    </button>
                                    <button
                                      className="me-btn-action me-btn-reject"
                                      onClick={() => handleReject(reg.id)}
                                      disabled={actionLoading[reg.id]}
                                    >
                                      {actionLoading[reg.id] === 'rejecting' ? (
                                        'Rejecting...'
                                      ) : (
                                        <>
                                          <FaUserTimes /> Reject
                                        </>
                                      )}
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Registration Pagination */}
                    {registrationTotalPages > 1 && (
                      <div className="me-pagination me-modal-pagination">
                        <button
                          className="me-pagination-btn"
                          disabled={registrationPage === 0}
                          onClick={() => setRegistrationPage((p) => Math.max(0, p - 1))}
                        >
                          <FaChevronLeft />
                        </button>
                        <span className="me-pagination-info">
                          Page {registrationPage + 1} of {registrationTotalPages}
                        </span>
                        <button
                          className="me-pagination-btn"
                          disabled={registrationPage >= registrationTotalPages - 1}
                          onClick={() =>
                            setRegistrationPage((p) => Math.min(registrationTotalPages - 1, p + 1))
                          }
                        >
                          <FaChevronRight />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="me-empty-state">
                    <div className="me-empty-state-icon">
                      <FaUsers />
                    </div>
                    <h3>No Registrations</h3>
                    <p>No one has registered for this event yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManagerEvents;
