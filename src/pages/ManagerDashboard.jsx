import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import TimelineItem from '../components/dashboard/TimelineItem';
import { dashboardAPI } from '../services/dashboard/dashboardService';
import './ManagerDashboard.css';
import { 
  FaCalendarAlt, 
  FaUsers, 
  FaCheckCircle, 
  FaClock,
  FaUserPlus,
  FaComment,
  FaExclamationTriangle,
  FaClipboardList,
  FaPercentage,
  FaCalendarCheck,
  FaInfoCircle,
  FaSearch
} from 'react-icons/fa';

const ManagerDashboard = () => {
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
      
      const response = await dashboardAPI.getManagerDashboard();
      
      if (response.success && response.data) {
        console.log('Fetched manager dashboard data:', response.data);
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
      case 'NEW_REGISTRATION': return <FaUserPlus />;
      case 'NEW_POST': return <FaComment />;
      case 'REGISTRATION_APPROVED': return <FaCheckCircle />;
      case 'REGISTRATION_REJECTED': return <FaExclamationTriangle />;
      default: return <FaClock />;
    }
  };

  const getActivityColor = (activityType) => {
    switch (activityType) {
      case 'NEW_REGISTRATION': return 'info';
      case 'NEW_POST': return 'primary';
      case 'REGISTRATION_APPROVED': return 'success';
      case 'REGISTRATION_REJECTED': return 'warning';
      default: return 'dark';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds

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

  if (loading) {
    return (
      <DashboardLayout 
        userRole="manager" 
        title="Dashboard" 
        breadcrumbs={['Pages', 'Dashboard']}
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
        userRole="manager" 
        title="Dashboard" 
        breadcrumbs={['Pages', 'Dashboard']}
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
        userRole="manager" 
        title="Dashboard" 
        breadcrumbs={['Pages', 'Dashboard']}
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

  const { registrationStatistics } = dashboardData;

  return (
    <DashboardLayout 
      userRole="manager" 
      title="Dashboard" 
      breadcrumbs={['Pages', 'Dashboard']}
    >
      <div className="manager-dashboard">
        {/* Stats Overview */}
        <div className="dashboard-stats">
          <div className="stat-col">
            <StatCard
              icon={<FaCalendarAlt />}
              title="Total Managed Events"
              value={dashboardData.totalManagedEvents || 0}
              gradient="primary"
            />
          </div>
          
          <div className="stat-col">
            <StatCard
              icon={<FaClock />}
              title="Active Events"
              value={dashboardData.activeEvents || 0}
              gradient="info"
            />
          </div>
          
          <div className="stat-col">
            <StatCard
              icon={<FaCalendarCheck />}
              title="Upcoming Events"
              value={dashboardData.upcomingEvents || 0}
              gradient="warning"
            />
          </div>
          
          <div className="stat-col">
            <StatCard
              icon={<FaCheckCircle />}
              title="Completed Events"
              value={dashboardData.completedEvents || 0}
              gradient="success"
            />
          </div>
        </div>

        {/* Registration Statistics */}
        <div className="dashboard-row">
          <div className="dashboard-col-12">
            <div className="dashboard-card">
              <div className="card-header">
                <h6 className="card-title">Registration Statistics</h6>
                <p className="card-subtitle">Overview of volunteer registrations</p>
              </div>
              
              <div className="registration-stats-grid">
                <div className="registration-stat-item">
                  <div className="stat-icon stat-icon-total">
                    <FaUsers />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{registrationStatistics?.totalRegistrations || 0}</span>
                    <span className="stat-label">Total Registrations</span>
                  </div>
                </div>
                
                <div className="registration-stat-item">
                  <div className="stat-icon stat-icon-pending">
                    <FaClock />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{registrationStatistics?.pendingRegistrations || 0}</span>
                    <span className="stat-label">Pending</span>
                  </div>
                </div>
                
                <div className="registration-stat-item">
                  <div className="stat-icon stat-icon-approved">
                    <FaCheckCircle />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{registrationStatistics?.approvedRegistrations || 0}</span>
                    <span className="stat-label">Approved</span>
                  </div>
                </div>
                
                <div className="registration-stat-item">
                  <div className="stat-icon stat-icon-rejected">
                    <FaExclamationTriangle />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{registrationStatistics?.rejectedRegistrations || 0}</span>
                    <span className="stat-label">Rejected</span>
                  </div>
                </div>
                
                <div className="registration-stat-item">
                  <div className="stat-icon stat-icon-rate">
                    <FaPercentage />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{registrationStatistics?.approvalRate?.toFixed(1) || 0}%</span>
                    <span className="stat-label">Approval Rate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Events Needing Approval & Recent Activities */}
        <div className="dashboard-row">
          <div className="dashboard-col-8">
            <div className="dashboard-card">
              <div className="card-header">
                <h6 className="card-title">Events Needing Approval</h6>
                <p className="card-subtitle">
                  {dashboardData.eventsNeedingApproval?.length || 0} events with pending registrations
                </p>
              </div>
              
              <div className="events-list">
                {dashboardData.eventsNeedingApproval && dashboardData.eventsNeedingApproval.length > 0 ? (
                  dashboardData.eventsNeedingApproval.map(event => (
                    <div key={event.eventId} className="event-item">
                      <div className="event-info">
                        <h6 className="event-title">{event.eventTitle}</h6>
                        <div className="event-meta">
                          <span className="event-date">
                            <FaCalendarAlt /> {formatDate(event.eventDate)}
                          </span>
                          <span className="event-pending-badge">
                            <FaClock /> {event.pendingCount} pending
                          </span>
                          {event.isFull && (
                            <span className="event-full-badge">Full</span>
                          )}
                        </div>
                      </div>
                      <div className="event-progress">
                        <div className="progress-info">
                          <span>{event.approvedCount}/{event.maxParticipants} approved</span>
                          <span>{Math.round((event.approvedCount / event.maxParticipants) * 100)}%</span>
                        </div>
                        <div className="progress-bar-container">
                          <div 
                            className="progress-bar progress-bar-info"
                            style={{ width: `${(event.approvedCount / event.maxParticipants) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <FaClipboardList />
                    </div>
                    <h3 className="empty-state-title">No Pending Approvals</h3>
                    <p>All registrations have been processed.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="dashboard-col-4">
            <div className="dashboard-card">
              <div className="card-header">
                <h6 className="card-title">Recent Activities</h6>
                <p className="card-subtitle">Latest event activities</p>
              </div>
              
              <div className="activities-timeline">
                {dashboardData.recentActivities && dashboardData.recentActivities.length > 0 ? (
                  dashboardData.recentActivities.slice(0, 10).map((activity, index) => (
                    <TimelineItem
                      key={index}
                      icon={getActivityIcon(activity.activityType)}
                      title={activity.eventTitle}
                      description={`${activity.userName || 'A user'} ${activity.activityDescription}`}
                      timestamp={formatTimestamp(activity.activityTime)}
                      color={getActivityColor(activity.activityType)}
                    />
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <FaInfoCircle />
                    </div>
                    <h3 className="empty-state-title">No Recent Activities</h3>
                    <p>Activities will appear here once there are interactions with your events.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Events Needing Preparation */}
        {dashboardData.upcomingEventsNeedPreparation && dashboardData.upcomingEventsNeedPreparation.length > 0 && (
          <div className="dashboard-row">
            <div className="dashboard-col-12">
              <div className="dashboard-card">
                <div className="card-header">
                  <h6 className="card-title">Events Needing Preparation</h6>
                  <p className="card-subtitle">Upcoming events that require attention</p>
                </div>
                
                <div className="events-list">
                  {dashboardData.upcomingEventsNeedPreparation.map(event => (
                    <div key={event.eventId} className="event-item">
                      <div className="event-info">
                        <h6 className="event-title">{event.eventTitle || event.title}</h6>
                        <div className="event-meta">
                          <span className="event-date">
                            <FaCalendarAlt /> {formatDate(event.eventDate || event.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Reports */}
        {dashboardData.attendanceReports && dashboardData.attendanceReports.length > 0 && (
          <div className="dashboard-row">
            <div className="dashboard-col-12">
              <div className="dashboard-card">
                <div className="card-header">
                  <h6 className="card-title">Attendance Reports</h6>
                  <p className="card-subtitle">Event attendance overview</p>
                </div>
                
                <div className="attendance-list">
                  {dashboardData.attendanceReports.map((report, index) => (
                    <div key={index} className="attendance-item">
                      <h6>{report.eventTitle}</h6>
                      <p>Attendance: {report.attendedCount}/{report.totalRegistered}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
