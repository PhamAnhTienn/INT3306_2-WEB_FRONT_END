import React from 'react';
import './EventCard.css';
import { FaCalendar, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';

const EventCard = ({ event, type = 'default' }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className={`event-card event-card-${type}`}>
      {event.imageUrl && (
        <div className="event-card-image">
          <img src={event.imageUrl} alt={event.title} />
        </div>
      )}
      
      <div className="event-card-body">
        <h6 className="event-card-title">{event.title}</h6>
        
        {event.description && (
          <p className="event-card-description">{event.description}</p>
        )}

        <div className="event-card-details">
          {event.startTime && (
            <div className="event-detail-item">
              <FaCalendar className="event-detail-icon" />
              <span>{formatDate(event.startTime)}</span>
            </div>
          )}
          
          {event.location && (
            <div className="event-detail-item">
              <FaMapMarkerAlt className="event-detail-icon" />
              <span>{event.location}</span>
            </div>
          )}
          
          {event.currentVolunteers !== undefined && event.maxVolunteers && (
            <div className="event-detail-item">
              <FaUsers className="event-detail-icon" />
              <span>{event.currentVolunteers}/{event.maxVolunteers} volunteers</span>
            </div>
          )}
        </div>

        {event.status && (
          <div className="event-card-footer">
            <span className={`event-status event-status-${event.status.toLowerCase()}`}>
              {event.status}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;
