import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import TimelineItem from '../components/dashboard/TimelineItem';
import EventCard from '../components/dashboard/EventCard';
import { dashboardAPI } from '../services/dashboard/dashboardService';
import './VolunteerDashboard.css';
import { FaCalendarCheck, FaClock, FaHistory, FaStar, FaComment, FaThumbsUp, FaCheckCircle, FaHourglassHalf } from 'react-icons/fa';

const VolunteerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch from API
      const response = await dashboardAPI.getVolunteerDashboard();
      if (response.success) {
        setDashboardData(response.data);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('Error fetching dashboard data, using mock data:', error);
    }
    
    // Fallback to mock data if API fails
    setDashboardData({
      recentActivityDTOS: [
        {
          activityType: 'APPROVED_REGISTRATION',
          eventId: 1,
          eventTitle: 'Community Clean-up Drive',
          activityDescription: 'new approved registration',
          createdAt: '2025-10-27T14:30:00'
        },
        {
          activityType: 'POST',
          eventId: 2,
          eventTitle: 'Food Bank Assistance',
          activityDescription: 'new post',
          createdAt: '2025-10-26T10:15:00'
        },
        {
          activityType: 'COMMENT',
          eventId: 1,
          eventTitle: 'Community Clean-up Drive',
          activityDescription: 'new comment',
          createdAt: '2025-10-25T16:20:00'
        },
        {
          activityType: 'LIKE_POST',
          eventId: 3,
          eventTitle: 'Tree Planting Event',
          activityDescription: 'new like on post',
          createdAt: '2025-10-25T09:10:00'
        }
      ],
      registeredEventDTOS: [
        {
          id: 1,
          title: 'Community Clean-up Drive',
          description: 'Join us for a community clean-up to make our neighborhood cleaner',
          startTime: '2025-11-05T09:00:00',
          endTime: '2025-11-05T15:00:00',
          location: 'Central Park',
          currentVolunteers: 25,
          maxVolunteers: 50,
          status: 'ONGOING'
        },
        {
          id: 2,
          title: 'Food Bank Assistance',
          description: 'Help distribute food to families in need',
          startTime: '2025-11-10T10:00:00',
          endTime: '2025-11-10T16:00:00',
          location: 'City Food Bank',
          currentVolunteers: 15,
          maxVolunteers: 30,
          status: 'ONGOING'
        }
      ],
      upcomingEventDTOS: [
        {
          id: 3,
          title: 'Tree Planting Event',
          description: 'Help plant trees to make our city greener',
          startTime: '2025-11-15T08:00:00',
          endTime: '2025-11-15T14:00:00',
          location: 'Riverside Park',
          currentVolunteers: 10,
          maxVolunteers: 40
        },
        {
          id: 4,
          title: 'Senior Care Visit',
          description: 'Visit and spend time with seniors at the care home',
          startTime: '2025-11-20T14:00:00',
          endTime: '2025-11-20T17:00:00',
          location: 'Sunny Vale Senior Care',
          currentVolunteers: 8,
          maxVolunteers: 20
        }
      ],
      eventParticipationHistoryDTOS: [
        {
          id: 5,
          title: 'Beach Cleanup',
          startTime: '2025-10-15T09:00:00',
          endTime: '2025-10-15T13:00:00',
          location: 'Ocean Beach',
          status: 'COMPLETED'
        },
        {
          id: 6,
          title: 'Charity Marathon',
          startTime: '2025-09-20T07:00:00',
          endTime: '2025-09-20T12:00:00',
          location: 'City Stadium',
          status: 'COMPLETED'
        }
        ,
        {
          id: 7,
          title: 'Charity Marathon',
          startTime: '2025-09-20T07:00:00',
          endTime: '2025-09-20T12:00:00',
          location: 'City Stadium',
          status: 'COMPLETED'
        },
        {
          id: 8,
          title: 'Charity Marathon',
          startTime: '2025-09-20T07:00:00',
          endTime: '2025-09-20T12:00:00',
          location: 'City Stadium',
          status: 'COMPLETED'
        },
        {
          id: 9,
          title: 'Charity Marathon',
          startTime: '2025-09-20T07:00:00',
          endTime: '2025-09-20T12:00:00',
          location: 'City Stadium',
          status: 'COMPLETED'
        }    
      ],
      recommendEventDTOS: [
        {
          id: 7,
          title: 'Library Reading Program',
          description: 'Read stories to children at the local library',
          startTime: '2025-11-25T15:00:00',
          endTime: '2025-11-25T17:00:00',
          location: 'Central Library',
          currentVolunteers: 5,
          maxVolunteers: 15
        }
      ]
    });
    setLoading(false);
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
    const diff = Math.floor((now - date) / 1000); // seconds

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
        {/* Stats Overview */}
        <div className="dashboard-stats">
          <div className="stat-col">
            <StatCard
              icon={<FaCalendarCheck />}
              title="Registered Events"
              value={dashboardData.registeredEventDTOS.length}
              gradient="primary"
            />
          </div>
          
          <div className="stat-col">
            <StatCard
              icon={<FaClock />}
              title="Upcoming Events"
              value={dashboardData.upcomingEventDTOS.length}
              gradient="info"
            />
          </div>
          
          <div className="stat-col">
            <StatCard
              icon={<FaHistory />}
              title="Events Completed"
              value={dashboardData.eventParticipationHistoryDTOS.length}
              gradient="success"
            />
          </div>
          
          <div className="stat-col">
            <StatCard
              icon={<FaStar />}
              title="Recommended"
              value={dashboardData.recommendEventDTOS.length}
              gradient="warning"
            />
          </div>
        </div>

        {/* Main Content Row */}
        <div className="dashboard-row">
          {/* Recent Activities */}
          <div className="dashboard-col-4">
            <div className="dashboard-card">
              <div className="card-header">
                <h6 className="card-title">Recent Activities</h6>
                <p className="card-subtitle">Your latest interactions</p>
              </div>
              
              <div className="activities-timeline">
                {dashboardData.recentActivityDTOS.map((activity, index) => (
                  <TimelineItem
                    key={index}
                    icon={getActivityIcon(activity.activityType)}
                    title={activity.eventTitle}
                    description={activity.activityDescription}
                    timestamp={formatTimestamp(activity.createdAt)}
                    color={getActivityColor(activity.activityType)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Registered Events */}
          <div className="dashboard-col-8">
            <div className="dashboard-card">
              <div className="card-header">
                <h6 className="card-title">My Registered Events</h6>
                <p className="card-subtitle">Events you're participating in</p>
              </div>
              
              <div className="events-grid">
                {dashboardData.registeredEventDTOS.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="dashboard-row">
          <div className="dashboard-col-12">
            <div className="dashboard-card">
              <div className="card-header">
                <h6 className="card-title">Upcoming Events</h6>
                <p className="card-subtitle">Events happening in the next 7 days</p>
              </div>
              
              <div className="events-grid">
                {dashboardData.upcomingEventDTOS.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Event History & Recommendations */}
        <div className="dashboard-row">
          <div className="dashboard-col-6">
            <div className="dashboard-card">
              <div className="card-header">
                <h6 className="card-title">Event Participation History</h6>
                <p className="card-subtitle">Your completed events</p>
              </div>
              
              <div className="history-list">
                {dashboardData.eventParticipationHistoryDTOS.map(event => (
                  <div key={event.id} className="history-item">
                    <div className="history-icon">
                      <FaCheckCircle />
                    </div>
                    <div className="history-info">
                      <h6 className="history-title">{event.title}</h6>
                      <p className="history-meta">
                        {new Date(event.startTime).toLocaleDateString()} • {event.location}
                      </p>
                    </div>
                    <span className="history-status">Completed</span>
                  </div>
                ))}
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
                {dashboardData.recommendEventDTOS.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VolunteerDashboard;
