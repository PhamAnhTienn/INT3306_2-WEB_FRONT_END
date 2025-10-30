import React from 'react';
import './EventCard.css';
import { FaCalendar, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';

const EventCard = ({ event, type = 'default' }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Support both API response formats
  const eventTitle = event.eventTitle || event.title;
  const eventDate = event.date || event.startTime;
  const eventDescription = event.description;
  const eventLocation = event.location;
  const eventStatus = event.status;
  const maxParticipants = event.maxParticipants || event.maxVolunteers;

  return (
    <div className={`event-card event-card-${type}`}>
      {event.imageUrl && (
        <div className="event-card-image">
          <img src={event.imageUrl} alt={eventTitle} />
        </div>
      )}
      
      <div className="event-card-body">
        <h6 className="event-card-title">{eventTitle}</h6>
        
        {eventDescription && (
          <p className="event-card-description">{eventDescription}</p>
        )}

        <div className="event-card-details">
          {eventDate && (
            <div className="event-detail-item">
              <FaCalendar className="event-detail-icon" />
              <span>{formatDate(eventDate)}</span>
            </div>
          )}
          
          {eventLocation && (
            <div className="event-detail-item">
              <FaMapMarkerAlt className="event-detail-icon" />
              <span>{eventLocation}</span>
            </div>
          )}
          
          {maxParticipants && (
            <div className="event-detail-item">
              <FaUsers className="event-detail-icon" />
              <span>{maxParticipants} max participants</span>
            </div>
          )}
        </div>

        {eventStatus && (
          <div className="event-card-footer">
            <span className={`event-status event-status-${eventStatus.toLowerCase()}`}>
              {eventStatus}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;
