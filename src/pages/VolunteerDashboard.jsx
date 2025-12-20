import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import TimelineItem from '../components/dashboard/TimelineItem';
import EventCard from '../components/dashboard/EventCard';
import { dashboardAPI } from '../services/dashboard/dashboardService';
import './VolunteerDashboard.css';
import { 
  FaCalendarCheck, 
  FaClock, 
  FaHistory, 
  FaStar, 
  FaComment, 
  FaThumbsUp, 
  FaCheckCircle, 
  FaHourglassHalf,
  FaCalendarPlus,
  FaSearch,
  FaInfoCircle
} from 'react-icons/fa';

const VolunteerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardAPI.getVolunteerDashboard();
      
      if (response.success && response.data) {
        setDashboardData(response.data);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData({
        recentActivityDTOS: [],
        registeredEventDTOS: [],
        upcomingEventDTOS: [],
        eventParticipationHistoryDTOS: [],
        recommendEventDTOS: []
      });
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (activityType) => {
    switch (activityType) {
      case 'POST': return <FaComment />;
      case 'COMMENT': return <FaComment />;
      case 'LIKE_POST': return <FaThumbsUp />;
      case 'PENDING_REGISTRATION': return <FaHourglassHalf />;
      case 'APPROVED_REGISTRATION': return <FaCheckCircle />;
      default: return <FaClock />;
    }
  };

  const getActivityColor = (activityType) => {
    switch (activityType) {
      case 'POST': return 'info';
      case 'COMMENT': return 'primary';
      case 'LIKE_POST': return 'success';
      case 'PENDING_REGISTRATION': return 'warning';
      case 'APPROVED_REGISTRATION': return 'success';
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

  if (loading) {
    return (
      <DashboardLayout 
        userRole="volunteer" 
        title="Dashboard" 
        breadcrumbs={['Pages', 'Dashboard']}
      >
        <div className="loading-container">
          <p>Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      userRole="volunteer" 
      title="Dashboard" 
      breadcrumbs={['Pages', 'Dashboard']}
    >
      <div className="volunteer-dashboard">
        <div className="dashboard-stats">
          <div className="stat-col">
            <StatCard
              icon={<FaCalendarCheck />}
              title="Registered Events"
              value={dashboardData.registeredEventDTOS?.length || 0}
              gradient="primary"
            />
          </div>
          
          <div className="stat-col">
            <StatCard
              icon={<FaClock />}
              title="Upcoming Events"
              value={dashboardData.upcomingEventDTOS?.length || 0}
              gradient="info"
            />
          </div>
          
          <div className="stat-col">
            <StatCard
              icon={<FaHistory />}
              title="Events Completed"
              value={dashboardData.eventParticipationHistoryDTOS?.length || 0}
              gradient="success"
            />
          </div>
          
          <div className="stat-col">
            <StatCard
              icon={<FaStar />}
              title="Recommended"
              value={dashboardData.recommendEventDTOS?.length || 0}
              gradient="warning"
            />
          </div>
        </div>

        <div className="dashboard-row">

          <div className="dashboard-col-4">
            <div className="dashboard-card">
              <div className="card-header">
                <h6 className="card-title">Recent Activities</h6>
                <p className="card-subtitle">Your latest interactions</p>
              </div>
              
              <div className="activities-timeline">
                {dashboardData.recentActivityDTOS && dashboardData.recentActivityDTOS.length > 0 ? (
                  dashboardData.recentActivityDTOS.map((activity, index) => (
                    <TimelineItem
                      key={index}
                      icon={getActivityIcon(activity.activityType)}
                      title={activity.eventTitle}
                      description={activity.activityDescription}
                      timestamp={formatTimestamp(activity.createdAt)}
                      color={getActivityColor(activity.activityType)}
                    />
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <FaInfoCircle />
                    </div>
                    <h3 className="empty-state-title">No Recent Activities</h3>
                    <p>Your activities will appear here once you start engaging with events.</p>
                    <Link to="/volunteer/events" className="empty-state-action">
                      <FaSearch /> Browse Events
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="dashboard-col-8">
            <div className="dashboard-card">
              <div className="card-header">
                <h6 className="card-title">My Registered Events</h6>
                <p className="card-subtitle">Events you're participating in</p>
              </div>
              
              <div className="events-grid">
                {dashboardData.registeredEventDTOS && dashboardData.registeredEventDTOS.length > 0 ? (
                  dashboardData.registeredEventDTOS.map(event => (
                    <EventCard key={event.eventId} event={event} />
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <FaCalendarPlus />
                    </div>
                    <h3 className="empty-state-title">No Registered Events</h3>
                    <p>You haven't registered for any events yet. Start making a difference today!</p>
                    <Link to="/volunteer/events" className="empty-state-action">
                      <FaCalendarPlus /> Register for Events
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-row">
          <div className="dashboard-col-12">
            <div className="dashboard-card">
              <div className="card-header">
                <h6 className="card-title">Upcoming Events</h6>
                <p className="card-subtitle">Events happening soon</p>
              </div>
              
              <div className="events-grid">
                {dashboardData.upcomingEventDTOS && dashboardData.upcomingEventDTOS.length > 0 ? (
                  dashboardData.upcomingEventDTOS.map(event => (
                    <EventCard key={event.eventId} event={event} />
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <FaClock />
                    </div>
                    <h3 className="empty-state-title">No Upcoming Events</h3>
                    <p>Check back soon for new volunteer opportunities in your area.</p>
                    <Link to="/volunteer/events" className="empty-state-action">
                      <FaSearch /> Explore All Events
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-row">
          <div className="dashboard-col-6">
            <div className="dashboard-card">
              <div className="card-header">
                <h6 className="card-title">Event Participation History</h6>
                <p className="card-subtitle">Your completed events</p>
              </div>
              
              <div className="history-list">
                {dashboardData.eventParticipationHistoryDTOS && dashboardData.eventParticipationHistoryDTOS.length > 0 ? (
                  dashboardData.eventParticipationHistoryDTOS.map(event => (
                    <div key={event.eventId || event.id} className="history-item">
                      <div className="history-icon">
                        <FaCheckCircle />
                      </div>
                      <div className="history-info">
                        <h6 className="history-title">{event.eventTitle || event.title}</h6>
                        <p className="history-meta">
                          <FaClock size={12} />
                          {new Date(event.date || event.startTime).toLocaleDateString()} • {event.location}
                        </p>
                      </div>
                      <span className="history-status">Completed</span>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <FaHistory />
                    </div>
                    <h3 className="empty-state-title">No Completed Events</h3>
                    <p>Your event participation history will appear here after completing events.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="dashboard-col-6">
            <div className="dashboard-card">
              <div className="card-header">
                <h6 className="card-title">Recommended Events</h6>
                <p className="card-subtitle">Events you might be interested in</p>
              </div>
              
              <div className="events-grid">
                {dashboardData.recommendEventDTOS && dashboardData.recommendEventDTOS.length > 0 ? (
                  dashboardData.recommendEventDTOS.map(event => (
                    <EventCard key={event.eventId} event={event} />
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <FaStar />
                    </div>
                    <h3 className="empty-state-title">No Recommendations Yet</h3>
                    <p>We'll recommend events based on your interests and activity.</p>
                    <Link to="/volunteer/events" className="empty-state-action">
                      <FaSearch /> Discover Events
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VolunteerDashboard;
