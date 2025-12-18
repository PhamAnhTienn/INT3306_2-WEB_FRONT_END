import React from 'react';
import { useNavigate } from 'react-router-dom';
import './EventCard.css';
import { FaCalendar, FaMapMarkerAlt, FaUsers, FaSignInAlt } from 'react-icons/fa';

const EventCard = ({ event, type = 'default' }) => {
  const navigate = useNavigate();
  
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
  const currentParticipants = event.currentParticipants || 0;
  const eventId = event.eventId || event.id;

  const handleEnterEvent = () => {
    navigate(`/volunteer/events/${eventId}/feed`);
  };

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
              <span>{currentParticipants} / {maxParticipants} participants</span>
            </div>
          )}
        </div>

        {/* Participants Progress Bar */}
        {maxParticipants && (
          <div className="event-card-participants-progress">
            <div className="participants-progress-bar">
              <div 
                className={`participants-progress-fill ${
                  (currentParticipants / maxParticipants) >= 1 ? 'full' :
                  (currentParticipants / maxParticipants) >= 0.8 ? 'almost-full' :
                  (currentParticipants / maxParticipants) >= 0.5 ? 'filling' : 'available'
                }`}
                style={{ width: `${Math.min((currentParticipants / maxParticipants) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        {eventStatus && (
          <div className="event-card-footer">
            <span className={`event-status event-status-${eventStatus.toLowerCase()}`}>
              {eventStatus}
            </span>
            <button className="btn-enter-event" onClick={handleEnterEvent}>
              <FaSignInAlt />
              Enter Event
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;
