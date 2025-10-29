import React from 'react';
import './StatCard.css';

const StatCard = ({ icon, title, value, percentage, trend, gradient }) => {
  return (
    <div className={`stat-card ${gradient ? `gradient-${gradient}` : ''}`}>
      <div className="stat-card-content">
        <div className="stat-icon">
          {icon}
        </div>
        <div className="stat-info">
          <p className="stat-title">{title}</p>
          <h4 className="stat-value">{value}</h4>
        </div>
      </div>
      {percentage && (
        <div className="stat-footer">
          <span className={`percentage ${trend === 'up' ? 'positive' : 'negative'}`}>
            {percentage}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
