import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { managerAPI } from '../services/manager/managerService';
import './ManagerVolunteers.css';
import {
  FaUsers,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaFilter,
  FaEnvelope,
  FaInfoCircle,
  FaUserFriends,
} from 'react-icons/fa';

const ManagerVolunteers = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [volunteersLoading, setVolunteersLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await managerAPI.getManagerEvents({
        page: 0,
        size: 100, // Get all events for dropdown
        sortBy: 'id',
        sortDir: 'desc',
      });

      if (response.success && response.data) {
        const eventsList = response.data.content || [];
        setEvents(eventsList);
        // Auto-select first event if available
        if (eventsList.length > 0 && !selectedEventId) {
          setSelectedEventId(eventsList[0].id);
        }
      } else {
        setError('Failed to load events');
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchVolunteers = useCallback(async () => {
    if (!selectedEventId) return;

    try {
      setVolunteersLoading(true);
      const response = await managerAPI.getEventRegistrations(selectedEventId, {
        pageNumber: page,
        pageSize: 10,
      });

      if (response.success && response.data) {
        setVolunteers(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
      }
    } catch (err) {
      console.error('Error fetching volunteers:', err);
    } finally {
      setVolunteersLoading(false);
    }
  }, [selectedEventId, page]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (selectedEventId) {
      setPage(0);
      fetchVolunteers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEventId]);

  useEffect(() => {
    if (selectedEventId) {
      fetchVolunteers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="volunteer-status-badge status-pending">
            <FaClock /> Pending
          </span>
        );
      case 'APPROVED':
        return (
          <span className="volunteer-status-badge status-approved">
            <FaCheckCircle /> Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="volunteer-status-badge status-rejected">
            <FaTimesCircle /> Rejected
          </span>
        );
      default:
        return <span className="volunteer-status-badge">{status}</span>;
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

  // Filter volunteers
  const filteredVolunteers = volunteers.filter((v) => {
    const matchesSearch =
      v.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Get stats for selected event
  const stats = {
    total: volunteers.length,
    approved: volunteers.filter((v) => v.status === 'APPROVED').length,
    pending: volunteers.filter((v) => v.status === 'PENDING').length,
    rejected: volunteers.filter((v) => v.status === 'REJECTED').length,
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  if (loading) {
    return (
      <DashboardLayout
        userRole="manager"
        title="Volunteers"
        breadcrumbs={['Pages', 'Volunteers']}
      >
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading volunteers...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        userRole="manager"
        title="Volunteers"
        breadcrumbs={['Pages', 'Volunteers']}
      >
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Unable to load data</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchEvents}>
            Try Again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      userRole="manager"
      title="Volunteers"
      breadcrumbs={['Pages', 'Volunteers']}
    >
      <div className="manager-volunteers">
        {/* Event Selector */}
        <div className="event-selector-card">
          <div className="event-selector-header">
            <h3>
              <FaCalendarAlt /> Select Event
            </h3>
          </div>
          <div className="event-selector-body">
            {events.length > 0 ? (
              <select
                className="event-select"
                value={selectedEventId || ''}
                onChange={(e) => setSelectedEventId(Number(e.target.value))}
              >
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title} ({formatDate(event.date)})
                  </option>
                ))}
              </select>
            ) : (
              <p className="no-events-message">No events found. Create an event first.</p>
            )}
          </div>
        </div>

        {selectedEventId && (
          <>
            {/* Stats Cards */}
            <div className="volunteer-stats">
              <div className="stat-card stat-total">
                <div className="stat-icon">
                  <FaUsers />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{stats.total}</span>
                  <span className="stat-label">Total Registrations</span>
                </div>
              </div>
              <div className="stat-card stat-approved">
                <div className="stat-icon">
                  <FaCheckCircle />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{stats.approved}</span>
                  <span className="stat-label">Approved</span>
                </div>
              </div>
              <div className="stat-card stat-pending">
                <div className="stat-icon">
                  <FaClock />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{stats.pending}</span>
                  <span className="stat-label">Pending</span>
                </div>
              </div>
              <div className="stat-card stat-rejected">
                <div className="stat-icon">
                  <FaTimesCircle />
                </div>
                <div className="stat-info">
                  <span className="stat-value">{stats.rejected}</span>
                  <span className="stat-label">Rejected</span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="volunteers-filters">
              <div className="search-box">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search volunteers by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filter-box">
                <FaFilter className="filter-icon" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Status</option>
                  <option value="APPROVED">Approved</option>
                  <option value="PENDING">Pending</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>

            {/* Volunteers List */}
            <div className="volunteers-card">
              <div className="volunteers-card-header">
                <h3>
                  <FaUserFriends /> Volunteers for "{selectedEvent?.title}"
                </h3>
                <span className="volunteers-count">
                  {filteredVolunteers.length} volunteer(s)
                </span>
              </div>

              {volunteersLoading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading volunteers...</p>
                </div>
              ) : filteredVolunteers.length > 0 ? (
                <>
                  <div className="volunteers-table-container">
                    <table className="volunteers-table">
                      <thead>
                        <tr>
                          <th>Volunteer</th>
                          <th>Email</th>
                          <th>Registered At</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredVolunteers.map((volunteer) => (
                          <tr key={volunteer.id}>
                            <td>
                              <div className="volunteer-cell">
                                <div className="volunteer-avatar">
                                  {volunteer.user?.fullName?.charAt(0) ||
                                    volunteer.user?.username?.charAt(0) ||
                                    '?'}
                                </div>
                                <div className="volunteer-info">
                                  <span className="volunteer-name">
                                    {volunteer.user?.fullName ||
                                      volunteer.user?.username ||
                                      'Unknown'}
                                  </span>
                                  <span className="volunteer-username">
                                    @{volunteer.user?.username || 'unknown'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <a
                                href={`mailto:${volunteer.user?.email}`}
                                className="email-link"
                              >
                                <FaEnvelope /> {volunteer.user?.email || 'N/A'}
                              </a>
                            </td>
                            <td>{formatDate(volunteer.registeredAt)}</td>
                            <td>{getStatusBadge(volunteer.status)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="pagination">
                      <button
                        className="pagination-btn"
                        disabled={page === 0}
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                      >
                        <FaChevronLeft /> Previous
                      </button>
                      <span className="pagination-info">
                        Page {page + 1} of {totalPages}
                      </span>
                      <button
                        className="pagination-btn"
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      >
                        Next <FaChevronRight />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <FaInfoCircle />
                  </div>
                  <h3>No Volunteers Found</h3>
                  <p>
                    {searchTerm || statusFilter !== 'ALL'
                      ? 'No volunteers match your search criteria.'
                      : 'No one has registered for this event yet.'}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManagerVolunteers;
