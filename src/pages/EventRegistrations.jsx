import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaUsers, FaFileDownload, FaCheckCircle, FaTimesCircle, FaTrash } from 'react-icons/fa';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { getEventById } from '../services/events/eventsService';
import {
  getEventRegistrations,
  approveRegistration,
  rejectRegistration,
  deleteRegistration,
  exportEventRegistrations,
} from '../services/manager/managerService';
import './EventRegistrations.css';

const EventRegistrations = () => {
  const { eventId } = useParams();

  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [completedOnly, setCompletedOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadEvent = async () => {
    try {
      const res = await getEventById(eventId);
      if (res.success) {
        setEvent(res.data);
      }
    } catch (err) {
      // ignore, not critical
    }
  };

  const loadRegistrations = async (pageIndex = 0) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getEventRegistrations(eventId, {
        page: pageIndex,
        size,
        status: statusFilter,
        completedOnly,
      });
      if (res.success) {
        setRegistrations(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setPage(pageIndex);
      } else {
        setError(res.message || 'Failed to load registrations');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to load registrations';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  useEffect(() => {
    loadRegistrations(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, completedOnly, eventId]);

  const handleApprove = async (registrationId) => {
    try {
      await approveRegistration(eventId, registrationId);
      await loadRegistrations(page);
    } catch (err) {
      alert(
        err.response?.data?.message || err.message || 'Failed to approve registration. Please try again.',
      );
    }
  };

  const handleReject = async (registrationId) => {
    try {
      await rejectRegistration(eventId, registrationId);
      await loadRegistrations(page);
    } catch (err) {
      alert(
        err.response?.data?.message || err.message || 'Failed to reject registration. Please try again.',
      );
    }
  };

  const handleDelete = async (registrationId, volunteerName) => {
    if (!window.confirm(`Are you sure you want to remove ${volunteerName} from this event?`)) {
      return;
    }
    
    try {
      await deleteRegistration(registrationId);
      await loadRegistrations(page);
    } catch (err) {
      alert(
        err.response?.data?.message || err.message || 'Failed to remove registration. Please try again.',
      );
    }
  };

  const handleExport = async (format) => {
    try {
      const blob = await exportEventRegistrations(eventId, format, statusFilter, completedOnly);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      a.download = `registrations_event_${eventId}_${timestamp}.${format === 'json' ? 'json' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(
        err.response?.data?.message ||
          err.message ||
          'Failed to export registrations. Please check your permissions.',
      );
    }
  };

  const getStatusBadgeClass = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'APPROVED':
        return 'reg-status-badge reg-status-approved';
      case 'PENDING':
        return 'reg-status-badge reg-status-pending';
      case 'REJECTED':
        return 'reg-status-badge reg-status-rejected';
      case 'CANCELLED':
        return 'reg-status-badge reg-status-cancelled';
      case 'WAITING':
        return 'reg-status-badge reg-status-waiting';
      default:
        return 'reg-status-badge';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <DashboardLayout
      userRole="manager"
      title="Event Registrations"
      breadcrumbs={['Manager', 'My Events', 'Registrations']}
    >
      <div className="event-registrations-page">
        {/* Header */}
        <div className="registrations-header">
          <h1>
            Event Registrations
            {event && <span style={{ fontWeight: 400, color: '#6b7280' }}> — {event.title}</span>}
          </h1>
          {event && (
            <p className="registrations-subtitle">
              {event.location} • {formatDate(event.date)}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="registrations-controls">
          <div className="filter-group">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="WAITING">Waiting</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <label className="filter-checkbox-group">
              <input
                type="checkbox"
                className="filter-checkbox"
                checked={completedOnly}
                onChange={(e) => setCompletedOnly(e.target.checked)}
              />
              <span className="filter-checkbox-label">Completed only</span>
            </label>
          </div>

          <div className="export-group">
            <button type="button" onClick={() => handleExport('csv')} className="btn-export">
              <FaFileDownload />
              Export CSV
            </button>
            <button type="button" onClick={() => handleExport('json')} className="btn-export">
              <FaFileDownload />
              Export JSON
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="registrations-table-container">
          {loading ? (
            <div className="registrations-loading">Loading registrations...</div>
          ) : error ? (
            <div className="registrations-error">{error}</div>
          ) : registrations.length === 0 ? (
            <div className="registrations-empty">
              <div className="registrations-empty-icon">
                <FaUsers />
              </div>
              <h3>No Registrations Found</h3>
              <p>No registrations match your current filter criteria.</p>
            </div>
          ) : (
            <table className="registrations-table">
              <thead>
                <tr>
                  <th>Volunteer</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Registered At</th>
                  <th>Completed</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg) => (
                  <tr key={reg.id}>
                    <td>
                      <div className="volunteer-info">
                        <span className="volunteer-name">
                          {reg.userResponse?.firstName} {reg.userResponse?.lastName}
                        </span>
                        <span className="volunteer-username">
                          @{reg.userResponse?.username || 'unknown'}
                        </span>
                      </div>
                    </td>
                    <td>{reg.userResponse?.email || '—'}</td>
                    <td>
                      <span className={getStatusBadgeClass(reg.status)}>{reg.status}</span>
                    </td>
                    <td>{formatDate(reg.registeredAt)}</td>
                    <td>
                      {reg.eventCompleted ? (
                        <span className="completed-badge completed-yes">Yes</span>
                      ) : (
                        <span className="completed-badge completed-no">No</span>
                      )}
                    </td>
                    <td>
                      <div className="actions-group">
                        {reg.status === 'PENDING' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApprove(reg.id)}
                              className="btn-action-approve"
                              title="Approve registration"
                            >
                              <FaCheckCircle style={{ marginRight: '0.25rem' }} />
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(reg.id)}
                              className="btn-action-reject"
                              title="Reject registration"
                            >
                              <FaTimesCircle style={{ marginRight: '0.25rem' }} />
                              Reject
                            </button>
                          </>
                        )}
                        {reg.status !== 'CANCELLED' && (
                          <button
                            type="button"
                            onClick={() => handleDelete(reg.id, `${reg.userResponse?.firstName} ${reg.userResponse?.lastName}`)}
                            className="btn-action-delete"
                            title="Remove user from event"
                          >
                            <FaTrash style={{ marginRight: '0.25rem' }} />
                            Remove
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="registrations-pagination">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => loadRegistrations(page - 1)}
              className="btn-pagination"
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {page + 1} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page + 1 >= totalPages}
              onClick={() => loadRegistrations(page + 1)}
              className="btn-pagination"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EventRegistrations;
