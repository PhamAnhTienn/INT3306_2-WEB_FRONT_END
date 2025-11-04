import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import DashboardNavbar from './DashboardNavbar';
import './DashboardLayout.css';

const DashboardLayout = ({ children, userRole, title, breadcrumbs }) => {
  const [activeItem, setActiveItem] = useState('dashboard');
  const navigate = useNavigate(); 

  const handleNavigate = (itemId, path) => {
    setActiveItem(itemId);
    navigate(path);
    // Handle navigation here (use React Router navigate)
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
