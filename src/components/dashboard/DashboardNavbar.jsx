import React from 'react';
import './DashboardNavbar.css';
import { FaSearch, FaBell, FaCog } from 'react-icons/fa';

const DashboardNavbar = ({ title, breadcrumbs }) => {
  return (
    <nav className="dashboard-navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <div className="breadcrumb-container">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                {breadcrumbs?.map((crumb, index) => (
                  <li key={index} className={`breadcrumb-item ${index === breadcrumbs.length - 1 ? 'active' : ''}`}>
                    {index === breadcrumbs.length - 1 ? crumb : <a href="#">{crumb}</a>}
                  </li>
                ))}
              </ol>
            </nav>
            <h6 className="navbar-title">{title}</h6>
          </div>
        </div>

        <div className="navbar-right">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input type="text" placeholder="Type here..." />
          </div>

          <div className="navbar-actions">
            <button className="navbar-action-btn">
              <FaBell />
            </button>
            <button className="navbar-action-btn">
              <FaCog />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
