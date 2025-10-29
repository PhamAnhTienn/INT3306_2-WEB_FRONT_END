import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import StatCard from '../components/dashboard/StatCard';
import './ManagerDashboard.css';
import { FaCalendarAlt, FaUsers, FaCheckCircle, FaClock } from 'react-icons/fa';

const ManagerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch dashboard data from API
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use mock data instead of API
      const mockData = {
        totalEvents: 45,
        totalVolunteers: 234,
        completedEvents: 28,
        ongoingEvents: 12,
        eventStatusDistribution: {
          pending: 5,
          ongoing: 12,
          completed: 28,
          cancelled: 0
        },
        upcomingEvents: [
          {
            id: 1,
            title: 'Community Clean-up Drive',
            date: '2025-11-05',
            time: '09:00 AM',
            location: 'Central Park',
            volunteers: 25,
            maxVolunteers: 50,
            status: 'upcoming'
          },
          {
            id: 2,
            title: 'Food Bank Distribution',
            date: '2025-11-08',
            time: '10:00 AM',
            location: 'City Hall',
            volunteers: 15,
            maxVolunteers: 30,
            status: 'upcoming'
          },
          {
            id: 3,
            title: 'Tree Planting Event',
            date: '2025-11-12',
            time: '08:00 AM',
            location: 'Riverside Park',
            volunteers: 30,
            maxVolunteers: 60,
            status: 'upcoming'
          }
        ],
        recentRegistrations: [
          {
            id: 1,
            volunteerName: 'John Doe',
            eventTitle: 'Community Clean-up Drive',
            registeredAt: '2025-10-27T14:30:00',
            status: 'approved'
          },
          {
            id: 2,
            volunteerName: 'Jane Smith',
            eventTitle: 'Food Bank Distribution',
            registeredAt: '2025-10-27T10:15:00',
            status: 'pending'
          },
          {
            id: 3,
            volunteerName: 'Mike Johnson',
            eventTitle: 'Tree Planting Event',
            registeredAt: '2025-10-26T16:20:00',
            status: 'approved'
          },
          {
            id: 4,
            volunteerName: 'Sarah Williams',
            eventTitle: 'Community Clean-up Drive',
            registeredAt: '2025-10-26T09:45:00',
            status: 'approved'
          }
        ]
      };
      
      setDashboardData(mockData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
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
              title="Total Events"
              value={dashboardData.totalEvents || 0}
              percentage="+12%"
              trend="up"
              gradient="primary"
            />
          </div>
          
          <div className="stat-col">
            <StatCard
              icon={<FaClock />}
              title="Active Events"
              value={dashboardData.activeEvents || 0}
              percentage="+5%"
              trend="up"
              gradient="info"
            />
          </div>
          
          <div className="stat-col">
            <StatCard
              icon={<FaUsers />}
              title="Total Volunteers"
              value={dashboardData.totalVolunteers || 0}
              percentage="+23%"
              trend="up"
              gradient="success"
            />
          </div>
          
          <div className="stat-col">
            <StatCard
              icon={<FaCheckCircle />}
              title="Completed Events"
              value={dashboardData.completedEvents || 0}
              percentage="+8%"
              trend="up"
              gradient="warning"
            />
          </div>
        </div>

        {/* Events & Registrations */}
        <div className="dashboard-row">
          <div className="dashboard-col-8">
            <div className="dashboard-card">
              <div className="card-header">
                <h6 className="card-title">Upcoming Events</h6>
                <p className="card-subtitle">
                  {dashboardData.upcomingEvents?.length || 0} events scheduled
                </p>
              </div>
              
              <div className="events-list">
                {dashboardData.upcomingEvents && dashboardData.upcomingEvents.length > 0 ? (
                  dashboardData.upcomingEvents.map(event => (
                    <div key={event.id} className="event-item">
                      <div className="event-info">
                        <h6 className="event-title">{event.title}</h6>
                        <div className="event-meta">
                          <span className="event-date">
                            <FaCalendarAlt /> {new Date(event.startTime).toLocaleDateString()}
                          </span>
                          <span className="event-location">
                            {event.location}
                          </span>
                        </div>
                      </div>
                      <div className="event-progress">
                        <div className="progress-info">
                          <span>{event.currentVolunteers}/{event.maxVolunteers} volunteers</span>
                          <span>{Math.round((event.currentVolunteers / event.maxVolunteers) * 100)}%</span>
                        </div>
                        <div className="progress-bar-container">
                          <div 
                            className="progress-bar progress-bar-info"
                            style={{ width: `${(event.currentVolunteers / event.maxVolunteers) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>No upcoming events</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="dashboard-col-4">
            <div className="dashboard-card">
              <div className="card-header">
                <h6 className="card-title">Recent Registrations</h6>
                <p className="card-subtitle">Latest volunteer sign-ups</p>
              </div>
              
              <div className="registrations-list">
                {dashboardData.recentRegistrations && dashboardData.recentRegistrations.length > 0 ? (
                  dashboardData.recentRegistrations.map(reg => (
                    <div key={reg.id} className="registration-item">
                      <div className="registration-info">
                        <h6 className="volunteer-name">{reg.volunteerName}</h6>
                        <p className="event-name">{reg.eventTitle}</p>
                        <p className="registration-time">
                          {new Date(reg.registeredAt).toLocaleString()}
                        </p>
                      </div>
                      <span className={`registration-status status-${reg.status.toLowerCase()}`}>
                        {reg.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>No recent registrations</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Event Status Distribution */}
        <div className="dashboard-row">
          <div className="dashboard-col-12">
            <div className="dashboard-card">
              <div className="card-header">
                <h6 className="card-title">Event Status Distribution</h6>
              </div>
              
              <div className="status-distribution">
                <div className="status-item">
                  <div className="status-info">
                    <span className="status-label">Pending Events</span>
                    <span className="status-count">
                      {dashboardData.eventStatusDistribution?.pending || 0}
                    </span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar progress-bar-warning" style={{ width: '20%' }}></div>
                  </div>
                </div>
                
                <div className="status-item">
                  <div className="status-info">
                    <span className="status-label">Ongoing Events</span>
                    <span className="status-count">
                      {dashboardData.eventStatusDistribution?.ongoing || 0}
                    </span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar progress-bar-info" style={{ width: '40%' }}></div>
                  </div>
                </div>
                
                <div className="status-item">
                  <div className="status-info">
                    <span className="status-label">Completed Events</span>
                    <span className="status-count">
                      {dashboardData.eventStatusDistribution?.completed || 0}
                    </span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar progress-bar-success" style={{ width: '80%' }}></div>
                  </div>
                </div>
                
                <div className="status-item">
                  <div className="status-info">
                    <span className="status-label">Cancelled Events</span>
                    <span className="status-count">
                      {dashboardData.eventStatusDistribution?.cancelled || 0}
                    </span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar progress-bar-danger" style={{ width: '10%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
