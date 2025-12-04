import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import DashboardNavbar from './DashboardNavbar';
import './DashboardLayout.css';

const DashboardLayout = ({ children, userRole, title, breadcrumbs }) => {
  const [activeItem, setActiveItem] = useState('dashboard');
  const navigate = useNavigate();
  const location = useLocation();

  // Update active item based on current route
  useEffect(() => {
    const path = location.pathname;
    
    // Map routes to menu item IDs
    if (path.includes('/admin/users')) {
      setActiveItem('users');
    } else if (path.includes('/volunteer/events') || path.includes('/events')) {
      setActiveItem('events');
    } else if (path.includes('/my-events')) {
      setActiveItem('my-events');
    } else if (path.includes('/settings') || path.includes('/profile')) {
      setActiveItem('settings');
    } else if (path.includes('/dashboard')) {
      setActiveItem('dashboard');
    } else if (path.includes('/volunteers')) {
      setActiveItem('volunteers');
    } else if (path.includes('/analytics')) {
      setActiveItem('analytics');
    }
  }, [location.pathname]);

  const handleNavigate = (itemId, path) => {
    setActiveItem(itemId);
    navigate(path);
  };

  return (
    <div className="dashboard-layout">
      <DashboardSidebar 
        userRole={userRole} 
        activeItem={activeItem} 
        onNavigate={handleNavigate} 
      />
      
      <main className="dashboard-main">
        <DashboardNavbar title={title} breadcrumbs={breadcrumbs} />
        
        <div className="dashboard-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
