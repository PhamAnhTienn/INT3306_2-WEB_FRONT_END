import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import TimelineItem from '../components/dashboard/TimelineItem';
import { dashboardAPI } from '../services/dashboard/dashboardService';
import './AdminDashboard.css';
import { 
  FaUsers, 
  FaCalendarAlt, 
  FaClipboardList,
  FaUserShield,
  FaUserTie,
  FaUserCheck,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaBan,
  FaChartLine,
  FaCalendarCheck,
  FaCalendarTimes,
  FaSpinner,
  FaInfoCircle,
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaArrowUp,
  FaArrowDown,
  FaExclamationTriangle,
  FaPlay
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardAPI.getAdminDashboard();
      
      if (response.success && response.data) {
        console.log('Fetched admin dashboard data:', response.data);
        setDashboardData(response.data);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (activityType) => {
    switch (activityType) {
      case 'USER_REGISTERED': return <FaUserPlus />;
      case 'USER_UPDATED': return <FaEdit />;
      case 'USER_DELETED': return <FaTrash />;
      case 'EVENT_CREATED': return <FaCalendarAlt />;
      case 'EVENT_APPROVED': return <FaCheckCircle />;
      case 'EVENT_REJECTED': return <FaTimesCircle />;
      case 'REGISTRATION_APPROVED': return <FaUserCheck />;
      case 'REGISTRATION_REJECTED': return <FaExclamationTriangle />;
      default: return <FaClock />;
    }
  };

  const getActivityColor = (activityType) => {
    switch (activityType) {
      case 'USER_REGISTERED': return 'info';
      case 'USER_UPDATED': return 'primary';
      case 'USER_DELETED': return 'danger';
      case 'EVENT_CREATED': return 'primary';
      case 'EVENT_APPROVED': return 'success';
      case 'EVENT_REJECTED': return 'warning';
      case 'REGISTRATION_APPROVED': return 'success';
      case 'REGISTRATION_REJECTED': return 'warning';
      default: return 'dark';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
    
    return date.toLocaleDateString();
  };

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

  const renderGrowthIndicator = (rate) => {
    if (rate === null || rate === undefined) return null;
    const isPositive = rate >= 0;
    return (
      <span className={`growth-indicator ${isPositive ? 'positive' : 'negative'}`}>
        {isPositive ? <FaArrowUp /> : <FaArrowDown />}
        {Math.abs(rate).toFixed(1)}%
      </span>
    );
  };

  if (loading) {
    return (
      <DashboardLayout 
        userRole="admin" 
        title="Admin Dashboard" 
        breadcrumbs={['Admin', 'Dashboard']}
      >
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout 
        userRole="admin" 
        title="Admin Dashboard" 
        breadcrumbs={['Admin', 'Dashboard']}
      >
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Unable to load dashboard</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchDashboardData}>
            Try Again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (!dashboardData) {
    return (
      <DashboardLayout 
        userRole="admin" 
        title="Admin Dashboard" 
        breadcrumbs={['Admin', 'Dashboard']}
      >
        <div className="error-container">
          <p>No dashboard data available</p>
          <button className="btn btn-primary" onClick={fetchDashboardData}>
            Reload
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const { timeStatistics } = dashboardData;

  return (
    <DashboardLayout 
      userRole="admin" 
      title="Admin Dashboard" 
      breadcrumbs={['Admin', 'Dashboard']}
    >
      <div className="admin-dashboard">
        {/* Main Stats Overview */}
        <div className="dashboard-stats">
          <div className="stat-col">
            <StatCard
              icon={<FaUsers />}
              title="Total Users"
              value={dashboardData.totalUsers || 0}
              gradient="primary"
            />
          </div>
          
          <div className="stat-col">
            <StatCard
              icon={<FaCalendarAlt />}
              title="Total Events"
              value={dashboardData.totalEvents || 0}
              gradient="info"
            />
          </div>
          
          <div className="stat-col">
            <StatCard
              icon={<FaClipboardList />}
              title="Total Registrations"
              value={dashboardData.totalRegistrations || 0}
              gradient="success"
            />
          </div>
          
          <div className="stat-col">
            <StatCard
              icon={<FaClock />}
              title="Pending Events"
              value={dashboardData.pendingEvents?.length || 0}
              gradient="warning"
            />
          </div>
        </div>

        {/* User Statistics */}
        <div className="dashboard-row">
          <div className="dashboard-col-6">
            <div className="dashboard-card">
              <div className="card-header">
                <h6 className="card-title">User Statistics</h6>
                <p className="card-subtitle">Breakdown by role and status</p>
              </div>
              
              <div className="user-stats-grid">
                <div className="user-stat-item">
                  <div className="stat-icon stat-icon-volunteer">
                    <FaUserCheck />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{dashboardData.totalVolunteers || 0}</span>
                    <span className="stat-label">Volunteers</span>
                  </div>
                </div>
                
                <div className="user-stat-item">
                  <div className="stat-icon stat-icon-manager">
                    <FaUserTie />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{dashboardData.totalEventManagers || 0}</span>
                    <span className="stat-label">Event Managers</span>
                  </div>
                </div>
                
                <div className="user-stat-item">
                  <div className="stat-icon stat-icon-admin">
                    <FaUserShield />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{dashboardData.totalAdmins || 0}</span>
                    <span className="stat-label">Admins</span>
                  </div>
                </div>
                
                <div className="user-stat-item">
                  <div className="stat-icon stat-icon-enabled">
                    <FaCheckCircle />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{dashboardData.enabledUsers || 0}</span>
                    <span className="stat-label">Enabled Users</span>
                  </div>
                </div>
                
                <div className="user-stat-item">
                  <div className="stat-icon stat-icon-disabled">
                    <FaBan />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{dashboardData.disabledUsers || 0}</span>
                    <span className="stat-label">Disabled Users</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Event Statistics */}
          <div className="dashboard-col-6">
            <div className="dashboard-card">
              <div className="card-header">
                <h6 className="card-title">Event Statistics</h6>
                <p className="card-subtitle">Events by status</p>
              </div>
              
              <div className="event-stats-grid">
                <div className="event-stat-item">
                  <div className="stat-icon stat-icon-planned">
                    <FaCalendarAlt />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{dashboardData.plannedEvents || 0}</span>
                    <span className="stat-label">Planned</span>
                  </div>
                </div>
                
                <div className="event-stat-item">
                  <div className="stat-icon stat-icon-ongoing">
                    <FaPlay />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{dashboardData.ongoingEvents || 0}</span>
                    <span className="stat-label">Ongoing</span>
                  </div>
                </div>
                
                <div className="event-stat-item">
                  <div className="stat-icon stat-icon-completed">
                    <FaCalendarCheck />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{dashboardData.completedEvents || 0}</span>
                    <span className="stat-label">Completed</span>
                  </div>
                </div>
                
                <div className="event-stat-item">
                  <div className="stat-icon stat-icon-cancelled">
                    <FaCalendarTimes />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{dashboardData.cancelledEvents || 0}</span>
                    <span className="stat-label">Cancelled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Registration Statistics */}
        <div className="dashboard-row">
          <div className="dashboard-col-12">
            <div className="dashboard-card">
              <div className="card-header">
                <h6 className="card-title">Registration Statistics</h6>
                <p className="card-subtitle">Overview of all registrations</p>
              </div>
              
              <div className="registration-stats-grid">
                <div className="registration-stat-item">
                  <div className="stat-icon stat-icon-pending">
                    <FaClock />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{dashboardData.pendingRegistrations || 0}</span>
                    <span className="stat-label">Pending</span>
                  </div>
                </div>
                
                <div className="registration-stat-item">
                  <div className="stat-icon stat-icon-approved">
                    <FaCheckCircle />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{dashboardData.approvedRegistrations || 0}</span>
                    <span className="stat-label">Approved</span>
                  </div>
                </div>
                
                <div className="registration-stat-item">
                  <div className="stat-icon stat-icon-rejected">
                    <FaTimesCircle />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{dashboardData.rejectedRegistrations || 0}</span>
                    <span className="stat-label">Rejected</span>
                  </div>
                </div>
                
                <div className="registration-stat-item">
                  <div className="stat-icon stat-icon-cancelled">
                    <FaBan />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{dashboardData.cancelledRegistrations || 0}</span>
                    <span className="stat-label">Cancelled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Time Statistics & Growth */}
        {timeStatistics && (
          <div className="dashboard-row">
            <div className="dashboard-col-12">
              <div className="dashboard-card">
                <div className="card-header">
                  <h6 className="card-title">
                    <FaChartLine style={{ marginRight: '0.5rem' }} />
                    Growth Statistics
                  </h6>
                  <p className="card-subtitle">System growth over time</p>
                </div>
                
                <div className="time-stats-container">
                  <div className="time-stats-section">
                    <h6 className="section-title">Last 7 Days</h6>
                    <div className="time-stats-grid">
                      <div className="time-stat-item">
                        <span className="time-stat-label">New Users</span>
                        <span className="time-stat-value">{timeStatistics.newUsersLast7Days || 0}</span>
                      </div>
                      <div className="time-stat-item">
                        <span className="time-stat-label">New Events</span>
                        <span className="time-stat-value">{timeStatistics.newEventsLast7Days || 0}</span>
                      </div>
                      <div className="time-stat-item">
                        <span className="time-stat-label">New Registrations</span>
                        <span className="time-stat-value">{timeStatistics.newRegistrationsLast7Days || 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="time-stats-section">
                    <h6 className="section-title">Last 30 Days</h6>
                    <div className="time-stats-grid">
                      <div className="time-stat-item">
                        <span className="time-stat-label">New Users</span>
                        <span className="time-stat-value">{timeStatistics.newUsersLast30Days || 0}</span>
                      </div>
                      <div className="time-stat-item">
                        <span className="time-stat-label">New Events</span>
                        <span className="time-stat-value">{timeStatistics.newEventsLast30Days || 0}</span>
                      </div>
                      <div className="time-stat-item">
                        <span className="time-stat-label">New Registrations</span>
                        <span className="time-stat-value">{timeStatistics.newRegistrationsLast30Days || 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="time-stats-section">
                    <h6 className="section-title">This Month</h6>
                    <div className="time-stats-grid">
                      <div className="time-stat-item">
                        <span className="time-stat-label">Users</span>
                        <span className="time-stat-value">
                          {timeStatistics.usersThisMonth || 0}
                          {renderGrowthIndicator(timeStatistics.userGrowthRate)}
                        </span>
                      </div>
                      <div className="time-stat-item">
                        <span className="time-stat-label">Events</span>
                        <span className="time-stat-value">
                          {timeStatistics.eventsThisMonth || 0}
                          {renderGrowthIndicator(timeStatistics.eventGrowthRate)}
                        </span>
                      </div>
                      <div className="time-stat-item">
                        <span className="time-stat-label">Registrations</span>
                        <span className="time-stat-value">
                          {timeStatistics.registrationsThisMonth || 0}
                          {renderGrowthIndicator(timeStatistics.registrationGrowthRate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Events & Recent Activities */}
        <div className="dashboard-row">
          <div className="dashboard-col-8">
            <div className="dashboard-card">
              <div className="card-header">
                <h6 className="card-title">Pending Events for Approval</h6>
                <p className="card-subtitle">
                  {dashboardData.pendingEvents?.length || 0} events awaiting approval
                </p>
              </div>
              
              <div className="pending-events-list">
                {dashboardData.pendingEvents && dashboardData.pendingEvents.length > 0 ? (
                  dashboardData.pendingEvents.map(event => (
                    <div key={event.eventId} className="pending-event-item">
                      <div className="pending-event-info">
                        <h6 className="pending-event-title">{event.title}</h6>
                        <p className="pending-event-description">{event.description}</p>
                        <div className="pending-event-meta">
                          <span className="meta-item">
                            <FaCalendarAlt /> {formatDate(event.date)}
                          </span>
                          <span className="meta-item">
                            <FaUsers /> Max: {event.maxParticipants}
                          </span>
                        </div>
                        <div className="pending-event-creator">
                          <span>Created by: <strong>{event.creatorName}</strong></span>
                          <span className="creator-email">{event.creatorEmail}</span>
                        </div>
                      </div>
                      <div className="pending-event-actions">
                        <button className="btn btn-sm btn-success">
                          <FaCheckCircle /> Approve
                        </button>
                        <button className="btn btn-sm btn-danger">
                          <FaTimesCircle /> Reject
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <FaCheckCircle />
                    </div>
                    <h3 className="empty-state-title">All Caught Up!</h3>
                    <p>No events pending approval.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="dashboard-col-4">
            <div className="dashboard-card">
              <div className="card-header">
                <h6 className="card-title">Recent Activities</h6>
                <p className="card-subtitle">Latest system activities</p>
              </div>
              
              <div className="activities-timeline">
                {dashboardData.recentActivities && dashboardData.recentActivities.length > 0 ? (
                  dashboardData.recentActivities.slice(0, 10).map((activity, index) => (
                    <TimelineItem
                      key={index}
                      icon={getActivityIcon(activity.activityType)}
                      title={activity.description}
                      description={activity.userName ? `by ${activity.userName}` : ''}
                      timestamp={formatTimestamp(activity.timestamp)}
                      color={getActivityColor(activity.activityType)}
                    />
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <FaInfoCircle />
                    </div>
                    <h3 className="empty-state-title">No Recent Activities</h3>
                    <p>System activities will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Users */}
        {dashboardData.recentUsers && dashboardData.recentUsers.length > 0 && (
          <div className="dashboard-row">
            <div className="dashboard-col-12">
              <div className="dashboard-card">
                <div className="card-header">
                  <h6 className="card-title">Recent Users</h6>
                  <p className="card-subtitle">Newly registered users</p>
                </div>
                
                <div className="recent-users-table">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Roles</th>
                        <th>Status</th>
                        <th>Events Created</th>
                        <th>Registrations</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.recentUsers.map(user => (
                        <tr key={user.userId}>
                          <td>
                            <div className="user-info">
                              <span className="user-name">{user.fullName || user.username}</span>
                              <span className="user-username">@{user.username}</span>
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>
                            <div className="user-roles">
                              {user.roles?.map((role, idx) => (
                                <span key={idx} className={`role-badge role-${role.toLowerCase()}`}>
                                  {role}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge ${user.enabled ? 'status-enabled' : 'status-disabled'}`}>
                              {user.enabled ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="text-center">{user.eventsCreated || 0}</td>
                          <td className="text-center">{user.registrationsCount || 0}</td>
                          <td>{formatDate(user.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
