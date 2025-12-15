import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/auth/authService';
import './DashboardSidebar.css';
import { FaHome, FaCalendarAlt, FaUsers, FaChartBar, FaCog, FaSignOutAlt, FaClipboardList } from 'react-icons/fa';

const DashboardSidebar = ({ userRole, activeItem, onNavigate }) => {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const managerMenuItems = [
    { id: 'dashboard', icon: <FaHome />, label: 'Dashboard', path: '/dashboard/manager' },
    { id: 'my-events', icon: <FaClipboardList />, label: 'My Events', path: '/manager/events' },
    { id: 'settings', icon: <FaCog />, label: 'Profile', path: '/profile' },
  ];

  const volunteerMenuItems = [
    { id: 'dashboard', icon: <FaHome />, label: 'Dashboard', path: '/dashboard/volunteer' },
    { id: 'events', icon: <FaCalendarAlt />, label: 'Browse Events', path: '/events' },
    { id: 'my-events', icon: <FaUsers />, label: 'My Events', path: '/my-events' },
    { id: 'settings', icon: <FaCog />, label: 'Profile', path: '/profile' },
  ];

  const adminMenuItems = [
    { id: 'dashboard', icon: <FaHome />, label: 'Dashboard', path: '/dashboard/admin' },
    { id: 'users', icon: <FaUsers />, label: 'User Management', path: '/admin/users' },
    { id: 'settings', icon: <FaCog />, label: 'Profile', path: '/profile' },
  ];

  const menuItems = 
    userRole === 'admin' ? adminMenuItems :
    userRole === 'manager' ? managerMenuItems : 
    volunteerMenuItems;

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      // Call logout API
      await authAPI.logout();
      
      // Redirect to home page
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local storage and redirect
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      navigate('/');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src="/logo.svg" alt="Logo" />
          <span>Volunteer Platform</span>
        </div>
      </div>

      <hr className="sidebar-divider" />

      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li key={item.id} className={activeItem === item.id ? 'active' : ''}>
              <a href={item.path} onClick={(e) => {
                e.preventDefault();
                onNavigate(item.id, item.path);
              }}>
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button 
          className="logout-btn" 
          onClick={handleLogout}
          disabled={loggingOut}
        >
          <FaSignOutAlt />
          <span>{loggingOut ? 'Logging out...' : 'Logout'}</span>
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
