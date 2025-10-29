import React from 'react';
import './TimelineItem.css';

const TimelineItem = ({ icon, title, description, timestamp, color = 'primary' }) => {
  return (
    <div className="timeline-item">
      <div className={`timeline-icon timeline-icon-${color}`}>
        {icon}
      </div>
      <div className="timeline-content">
        <h6 className="timeline-title">{title}</h6>
        <p className="timeline-description">{description}</p>
        <p className="timeline-timestamp">{timestamp}</p>
      </div>
    </div>
  );
};

export default TimelineItem;
