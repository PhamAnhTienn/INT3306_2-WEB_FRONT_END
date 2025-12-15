import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaChevronLeft,
  FaChevronRight,
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaClock,
  FaFileExport,
  FaFilter,
} from 'react-icons/fa';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { managerAPI } from '../services/manager/managerService';
import './ManagerEvents.css';

const EventRegistrations = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [actionLoading, setActionLoading] = useState({});
  const [statusFilter, setStatusFilter] = useState('');
  const [completedOnly, setCompletedOnly] = useState(false);

  const fetchEvent = async () => {
    try {
      const response = await managerAPI.getEventDetails(eventId);
      if (response.success && response.data) {
        setEvent(response.data);
      }
    } catch (err) {
      // ignore, event info is just for header
    }
  };

  const fetchRegistrations = async () => {
    try {
      setRegistrationsLoading(true);
      setError(null);
      console.log('Fetching registrations for event:', eventId);
      const response = await managerAPI.getEventRegistrations(eventId, {
        pageNumber: page,
        pageSize: 10,
        status: statusFilter || undefined,
        completedOnly: completedOnly || undefined,
      });

      console.log('Registrations response:', response);
      
      if (response.success && response.data) {
        const registrationsList = response.data.content || response.data || [];
        console.log('Registrations list:', registrationsList);
        setRegistrations(registrationsList);
        setTotalPages(response.data.totalPages || 0);
      } else {
        console.warn('Response structure:', response);
        setError('Failed to load registrations');
      }
    } catch (err) {
      console.error('Error fetching registrations:', err);
      setError(err.message || 'Failed to load registrations');
    } finally {
      setRegistrationsLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchEvent();
    fetchRegistrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, page, statusFilter, completedOnly]);

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

  const getRegistrationStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="me-reg-status-badge me-reg-pending">
            <FaClock /> Pending
          </span>
        );
      case 'APPROVED':
        return (
          <span className="me-reg-status-badge me-reg-approved">
            <FaUserCheck /> Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="me-reg-status-badge me-reg-rejected">
            <FaUserTimes /> Rejected
          </span>
        );
      case 'WAITING':
        return (
          <span className="me-reg-status-badge me-reg-waiting">
            <FaClock /> Waiting
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="me-reg-status-badge me-reg-cancelled">
            <FaUserTimes /> Cancelled
          </span>
        );
      default:
        return <span className="me-reg-status-badge">{status}</span>;
    }
  };

  const handleExport = async (format) => {
    try {
      const res = await managerAPI.exportEventRegistrations(eventId, format, statusFilter || undefined, completedOnly || undefined);
      const blob = new Blob([res.data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `registrations-${eventId}.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export registrations');
    }
  };

  const handleApprove = async (registrationId) => {
    setActionLoading((prev) => ({ ...prev, [registrationId]: 'approving' }));
    try {
      await managerAPI.approveRegistration(eventId, registrationId);
      await fetchRegistrations();
    } catch (err) {
      alert('Failed to approve registration');
    } finally {
      setActionLoading((prev) => ({ ...prev, [registrationId]: null }));
    }
  };

  const handleReject = async (registrationId) => {
    setActionLoading((prev) => ({ ...prev, [registrationId]: 'rejecting' }));
    try {
      await managerAPI.rejectRegistration(eventId, registrationId);
      await fetchRegistrations();
    } catch (err) {
      alert('Failed to reject registration');
    } finally {
      setActionLoading((prev) => ({ ...prev, [registrationId]: null }));
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        userRole="manager"
        title="Event Registrations"
        breadcrumbs={['Manager', 'Events', 'Registrations']}
      >
        <div className="manager-events">
          <div className="me-loading-container">
            <div className="me-loading-spinner"></div>
            <p>Loading registrations...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        userRole="manager"
        title="Event Registrations"
        breadcrumbs={['Manager', 'Events', 'Registrations']}
      >
        <div className="manager-events">
          <div className="me-error-container">
            <div className="me-error-icon">⚠️</div>
            <h3>Unable to load registrations</h3>
            <p>{error}</p>
            <button className="me-btn me-btn-primary" onClick={fetchRegistrations}>
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
      title="Event Registrations"
      breadcrumbs={['Manager', 'Events', 'Registrations']}
    >
      <div className="manager-events">
        <div className="me-header">
          <div className="me-header-left">
            <button
              className="me-btn me-btn-secondary"
              onClick={() => navigate('/manager/events')}
            >
              <FaChevronLeft />
              <span>Back to My Events</span>
            </button>
            <div className="me-events-count">
              <span>
                <FaUsers /> Registrations for "{event?.title || `Event #${eventId}`}"
              </span>
            </div>
          </div>
          <div className="me-header-right">
            <div className="me-filter-group">
              <select
                className="me-filter-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="WAITING">Waiting</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <label className="me-checkbox-label">
                <input
                  type="checkbox"
                  checked={completedOnly}
                  onChange={(e) => {
                    setCompletedOnly(e.target.checked);
                    setPage(0);
                  }}
                />
                Completed Only
              </label>
            </div>
            <div className="me-export-buttons">
              <button
                className="me-btn me-btn-export"
                onClick={() => handleExport('csv')}
                title="Export as CSV"
              >
                <FaFileExport /> CSV
              </button>
              <button
                className="me-btn me-btn-export"
                onClick={() => handleExport('json')}
                title="Export as JSON"
              >
                <FaFileExport /> JSON
              </button>
            </div>
          </div>
        </div>

        <div className="me-registrations-table-container">
          {registrationsLoading ? (
            <div className="me-loading-container">
              <div className="me-loading-spinner"></div>
              <p>Loading registrations...</p>
            </div>
          ) : error ? (
            <div className="me-error-container">
              <div className="me-error-icon">⚠️</div>
              <h3>Unable to load registrations</h3>
              <p>{error}</p>
              <button className="me-btn me-btn-primary" onClick={fetchRegistrations}>
                Try Again
              </button>
            </div>
          ) : registrations.length > 0 ? (
            <table className="me-registrations-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Registered At</th>
                  <th>Completed At</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg) => {
                  // Get user data from userResponse
                  const user = reg.userResponse || reg.user;
                  // Create fullName from firstName and lastName
                  const fullName = user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.firstName || user?.lastName || user?.username || 'Unknown';
                  const displayName = fullName;
                  const initials = fullName.charAt(0).toUpperCase();
                  
                  return (
                    <tr key={reg.id}>
                      <td>
                        <div className="me-user-cell">
                          <div className="me-user-avatar">
                            {initials}
                          </div>
                          <span>{displayName}</span>
                        </div>
                      </td>
                      <td>{user?.email || 'N/A'}</td>
                      <td>{formatDate(reg.registeredAt)}</td>
                      <td>{formatDate(reg.completedAt)}</td>
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
                      {reg.status === 'APPROVED' && (
                        <span className="me-action-info">Approved</span>
                      )}
                      {reg.status === 'REJECTED' && (
                        <span className="me-action-info">Rejected</span>
                      )}
                    </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="me-empty-state">
              <FaUsers className="me-empty-icon" />
              <h3>No Registrations Found</h3>
              <p>There are no registrations matching your filters.</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="me-pagination">
            <button
              className="me-btn me-btn-pagination"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              <FaChevronLeft /> Previous
            </button>
            <span className="me-pagination-info">
              Page {page + 1} of {totalPages}
            </span>
            <button
              className="me-btn me-btn-pagination"
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
            >
              Next <FaChevronRight />
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EventRegistrations;
