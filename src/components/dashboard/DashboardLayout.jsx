import React, { useState } from 'react';
import DashboardSidebar from './DashboardSidebar';
import DashboardNavbar from './DashboardNavbar';
import './DashboardLayout.css';

const DashboardLayout = ({ children, userRole, title, breadcrumbs }) => {
  const [activeItem, setActiveItem] = useState('dashboard');

  const handleNavigate = (itemId) => {
    setActiveItem(itemId);
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
