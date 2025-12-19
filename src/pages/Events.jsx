import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaCalendar, FaUser, FaUsers, FaClock, FaTimes, FaFileAlt, FaSignInAlt, FaCheckCircle, FaHourglassHalf, FaSpinner } from 'react-icons/fa';
import { getAllEvents, registerForEvent, getMyRegistrations, cancelRegistration } from '../services/events/eventsService';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import './Events.css';

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const searchTimeoutRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registering, setRegistering] = useState(new Set()); // Track which eventIds are being registered
  const [registerSuccess, setRegisterSuccess] = useState(null);
  const [registerError, setRegisterError] = useState(null);
  const [cancelling, setCancelling] = useState(null); // Track which event is being cancelled

  const statusFilters = [
    { label: 'All', value: '' },
    { label: 'Planned', value: 'PLANNED' },
    { label: 'Ongoing', value: 'ONGOING' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  // Fetch events from API
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch both all events and user's registrations (with status)
      const [eventsResponse, myRegistrationsResponse] = await Promise.all([
        getAllEvents({
          page: currentPage,
          size: 12, // Show 12 events per page
          sortBy: 'date',
          sortDirection: 'desc',
          status: selectedStatus,
          search: debouncedSearchQuery,
        }),
        getMyRegistrations()
      ]);

      if (eventsResponse.success) {
        let allEvents = eventsResponse.data.content;
        
        // Client-side filtering by status as a fallback (in case backend doesn't filter)
        if (selectedStatus) {
          allEvents = allEvents.filter(event => event.status === selectedStatus);
        }
        
        // Map registrations to events with status
        if (myRegistrationsResponse.success && myRegistrationsResponse.data.content) {
          const registrationsMap = new Map();
          console.log('=== MAPPING REGISTRATIONS TO EVENTS ===');
          console.log('Total registrations:', myRegistrationsResponse.data.content.length);
          console.log('Registrations data:', myRegistrationsResponse.data.content.map(r => ({ 
            id: r.id, 
            eventId: r.eventId, 
            eventIdType: typeof r.eventId,
            status: r.status 
          })));
          
          myRegistrationsResponse.data.content.forEach(reg => {
            // Convert eventId to number to ensure consistent comparison
            const regEventId = Number(reg.eventId);
            if (!isNaN(regEventId) && regEventId > 0) {
              // Check if there's already a registration for this eventId
              if (registrationsMap.has(regEventId)) {
                console.warn('⚠️ Duplicate registration found for eventId:', regEventId, 'Keeping first one');
              } else {
                registrationsMap.set(regEventId, reg.status);
                console.log('✓ Mapped registration: eventId', regEventId, '(type:', typeof regEventId, ') -> status', reg.status);
              }
            } else {
              console.warn('⚠️ Invalid registration eventId:', reg.eventId, '(type:', typeof reg.eventId, ')');
            }
          });
          
          console.log('Registration map contents:', Array.from(registrationsMap.entries()).map(([k, v]) => ({ eventId: k, status: v })));
          console.log('Total events to map:', allEvents.length);
          console.log('Events data:', allEvents.map(e => ({ 
            eventId: e.eventId, 
            eventIdType: typeof e.eventId,
            title: e.title 
          })));
          
          // Add registration status to each event
          allEvents = allEvents.map((event, index) => {
            // Convert eventId to number for consistent comparison
            const eventIdNum = Number(event.eventId);
            
            // Validate eventId
            if (isNaN(eventIdNum) || eventIdNum <= 0) {
              console.warn('⚠️ Invalid event eventId:', event.eventId, 'for event:', event.title);
              return {
                ...event,
                registrationStatus: null
              };
            }
            
            // Get registration status ONLY if eventId matches exactly
            const registrationStatus = registrationsMap.get(eventIdNum) || null;
            
            // Log every mapping to debug (limit to first 5 to avoid spam)
            if (index < 5) {
              if (registrationStatus) {
                console.log(`✓ Event[${index}] eventId=${eventIdNum} (${typeof eventIdNum}) "${event.title?.substring(0, 20)}" matched with registration status: ${registrationStatus}`);
              } else {
                console.log(`✗ Event[${index}] eventId=${eventIdNum} (${typeof eventIdNum}) "${event.title?.substring(0, 20)}" has NO registration status`);
              }
            }
            
            // Create new object to avoid reference issues
            return {
              ...event,
              registrationStatus: registrationStatus // Explicitly set, not using || null to avoid issues
            };
          });
          
          console.log('=== FINAL EVENTS WITH REGISTRATION STATUS ===');
          const eventsWithStatus = allEvents.filter(e => e.registrationStatus);
          const eventsWithoutStatus = allEvents.filter(e => !e.registrationStatus);
          console.log(`Events WITH registration status (${eventsWithStatus.length}):`, 
            eventsWithStatus.map(e => ({ 
              eventId: e.eventId, 
              title: e.title?.substring(0, 30), 
              status: e.registrationStatus 
            }))
          );
          console.log(`Events WITHOUT registration status (${eventsWithoutStatus.length}):`, 
            eventsWithoutStatus.slice(0, 5).map(e => ({ 
              eventId: e.eventId, 
              title: e.title?.substring(0, 30)
            }))
          );
        }
        
        setEvents(allEvents);
        setTotalPages(eventsResponse.data.totalPages);
        setTotalElements(selectedStatus ? allEvents.length : eventsResponse.data.totalElements);
      } else {
        setError('Failed to fetch events');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedStatus, debouncedSearchQuery]);

  // Debounce search query
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms debounce delay

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Fetch events on component mount and when filters change
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Handle search - updates the searchQuery which triggers debounce
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    // Reset to first page when search changes (will take effect with debounced query)
    if (currentPage !== 0) {
      setCurrentPage(0);
    }
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'PLANNED':
        return 'status-planned';
      case 'ONGOING':
        return 'status-ongoing';
      case 'COMPLETED':
        return 'status-completed';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Open modal with event details
  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setRegisterSuccess(null);
    setRegisterError(null);
    document.body.style.overflow = 'auto'; // Restore scrolling
  };

  // Handle event registration
  const handleRegisterEvent = async (eventId) => {
    // Validate and normalize eventId
    const eventIdNum = Number(eventId);
    if (!eventId || isNaN(eventIdNum)) {
      console.error('Invalid eventId:', eventId);
      alert('❌ Invalid event ID. Please try again.');
      return;
    }

    // Prevent multiple simultaneous registrations for the same event
    if (registering.has(eventIdNum)) {
      console.log('Already registering for event:', eventIdNum);
      return;
    }

    // Find the event to check capacity - compare as numbers
    const event = events.find(e => Number(e.eventId) === eventIdNum);
    if (!event) {
      console.error('Event not found:', eventIdNum);
      alert('❌ Event not found. Please refresh the page.');
      return;
    }

    // Check if already registered
    if (event.registrationStatus) {
      alert('You have already registered for this event.');
      return;
    }

    const current = event.currentParticipants || 0;
    const max = event.maxParticipants;
    
    // Show warning if event is full or almost full
    if (current >= max) {
      const confirmMsg = `This event is currently full (${current}/${max} participants).\n\nYou will be added to the WAITING LIST and will be notified if a spot becomes available.\n\nDo you want to continue?`;
      if (!window.confirm(confirmMsg)) {
        return;
      }
    } else if (current >= max * 0.9) {
      const confirmMsg = `This event is almost full (${current}/${max} participants).\n\nOnly ${max - current} spot(s) remaining!\n\nDo you want to register now?`;
      if (!window.confirm(confirmMsg)) {
        return;
      }
    }
    
    // Add eventId to registering set
    setRegistering(prev => new Set(prev).add(eventIdNum));
    setRegisterError(null);
    setRegisterSuccess(null);
    
    try {
      console.log('Registering for event:', eventIdNum);
      const response = await registerForEvent(eventIdNum);
      console.log('Registration response for event', eventIdNum, ':', response);
      
      if (response.success) {
        // Get the registration status from response (PENDING or WAITING)
        const regStatus = response.data?.status || 'PENDING';
        const responseEventId = Number(response.data?.eventId || eventIdNum);
        
        console.log('Registration successful. EventId:', responseEventId, 'Status:', regStatus);
        
        // Refresh events from server to ensure data consistency
        // This prevents issues where state might be out of sync
        await fetchEvents();
        
        // Show appropriate message based on status
        const message = regStatus === 'WAITING' 
          ? '✅ You have been added to the waiting list!\n\nYou will be notified if a spot becomes available.'
          : '✅ Registration successful!\n\nYour registration is pending manager approval. You will be notified once approved.';
        alert(message);
      } else {
        setRegisterError(response.message || 'Failed to register for the event');
        alert('❌ ' + (response.message || 'Failed to register for the event'));
      }
    } catch (error) {
      console.error('Error registering for event', eventId, ':', error);
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred while registering';
      setRegisterError(errorMessage);
      alert('❌ ' + errorMessage);
    } finally {
      // Remove eventId from registering set
      setRegistering(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventIdNum);
        return newSet;
      });
    }
  };

  const handleCancelRegistration = async (eventId) => {
    // Normalize eventId to number
    const eventIdNum = Number(eventId);
    if (!eventId || isNaN(eventIdNum)) {
      console.error('Invalid eventId:', eventId);
      alert('❌ Invalid event ID. Please try again.');
      return;
    }

    if (!confirm('Are you sure you want to cancel your registration for this event?')) {
      return;
    }

    try {
      setCancelling(eventIdNum);
      await cancelRegistration(eventIdNum);
      
      // Update the events list to remove registration status
      // Use strict number comparison to ensure we only update the correct event
      setEvents(prevEvents => prevEvents.map(evt => {
        const evtIdNum = Number(evt.eventId);
        if (evtIdNum === eventIdNum) {
          return {
            ...evt,
            registrationStatus: null,
            currentParticipants: evt.registrationStatus === 'PENDING' || evt.registrationStatus === 'APPROVED'
              ? Math.max(0, (evt.currentParticipants || 0) - 1)
              : evt.currentParticipants
          };
        }
        return evt;
      }));
      
      // Update selected event if modal is open
      if (selectedEvent && Number(selectedEvent.eventId) === eventIdNum) {
        setSelectedEvent(prev => ({
          ...prev,
          registrationStatus: null,
          currentParticipants: prev.registrationStatus === 'PENDING' || prev.registrationStatus === 'APPROVED'
            ? Math.max(0, (prev.currentParticipants || 0) - 1)
            : prev.currentParticipants
        }));
      }
      
      alert('✅ Registration cancelled successfully');
      
      // Refresh events to get updated data from server
      await fetchEvents();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to cancel registration';
      alert('❌ ' + errorMessage);
    } finally {
      setCancelling(null);
    }
  };

  // Generate smart pagination with ellipses
  const generatePaginationItems = () => {
    const items = [];
    const maxVisible = 5; // Maximum number of page buttons to show

    if (totalPages <= maxVisible + 2) {
      // Show all pages if total is small
      for (let i = 0; i < totalPages; i++) {
        items.push(i);
      }
    } else {
      // Always show first page
      items.push(0);

      if (currentPage <= 2) {
        // Near the beginning: 1 2 3 4 ... 10
        for (let i = 1; i <= 3; i++) {
          items.push(i);
        }
        items.push('ellipsis-end');
        items.push(totalPages - 1);
      } else if (currentPage >= totalPages - 3) {
        // Near the end: 1 ... 7 8 9 10
        items.push('ellipsis-start');
        for (let i = totalPages - 4; i < totalPages - 1; i++) {
          items.push(i);
        }
        items.push(totalPages - 1);
      } else {
        // In the middle: 1 ... 4 5 6 ... 10
        items.push('ellipsis-start');
        items.push(currentPage - 1);
        items.push(currentPage);
        items.push(currentPage + 1);
        items.push('ellipsis-end');
        items.push(totalPages - 1);
      }
    }

    return items;
  };

  return (
    <DashboardLayout 
      userRole="volunteer"
    >
      <div className="events-page">
        <div className="events-container">
          {/* Header Section */}
          <div className="events-header">
            <h1 className="events-title">Browse Events</h1>
            <p className="events-subtitle">
              Discover meaningful volunteer opportunities and make a difference
            </p>
          </div>

        {/* Search Bar */}
        <div className="events-search">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search events by title or description..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="events-filters">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              className={`filter-button ${selectedStatus === filter.value ? 'active' : ''}`}
              data-status={filter.value}
              onClick={() => {
                setSelectedStatus(filter.value);
                setCurrentPage(0);
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="events-results-count">
            Showing {events.length} of {totalElements} events
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="events-loading">
            <div className="spinner"></div>
            <p>Loading events...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="events-error">
            <p>⚠️ {error}</p>
          </div>
        )}

        {/* Events Grid */}
        {!loading && !error && events.length > 0 && (
          <div className="events-grid">
            {events.map((event) => (
              <div key={event.eventId} className="event-card-item">
                {/* Event Image Placeholder */}
                <div className="event-image">
                  <div className="image-placeholder">
                    <FaCalendar className="placeholder-icon" />
                  </div>
                  <span className={`event-status-badge ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>

                {/* Event Content */}
                <div className="event-content">
                  <h3 className="event-title">{event.title}</h3>

                  <div className="event-details">
                    <div className="event-detail-item">
                      <FaCalendar className="detail-icon" />
                      <span>{formatDate(event.date)}</span>
                    </div>

                    <div className="event-detail-item">
                      <FaMapMarkerAlt className="detail-icon" />
                      <span>{event.location}</span>
                    </div>

                    <div className="event-detail-item">
                      <FaUser className="detail-icon" />
                      <span>By {event.creatorUsername}</span>
                    </div>
                  </div>

                  {/* Participants Progress */}
                  <div className="event-participants">
                    <div className="participants-header">
                      <FaUsers className="participants-icon" />
                      <span className="participants-text">
                        {event.currentParticipants || 0} / {event.maxParticipants} Participants
                      </span>
                      {(() => {
                        const current = event.currentParticipants || 0;
                        const max = event.maxParticipants;
                        const percentage = (current / max) * 100;
                        
                        if (current >= max) {
                          return <span className="availability-badge badge-full">Full</span>;
                        } else if (percentage >= 80) {
                          return <span className="availability-badge badge-almost-full">Almost Full</span>;
                        } else if (percentage >= 50) {
                          return <span className="availability-badge badge-filling">Filling Up</span>;
                        }
                        return <span className="availability-badge badge-available">Available</span>;
                      })()}
                    </div>
                    <div className="participants-progress-bar">
                      <div 
                        className={`participants-progress-fill ${
                          ((event.currentParticipants || 0) / event.maxParticipants) >= 1 ? 'full' :
                          ((event.currentParticipants || 0) / event.maxParticipants) >= 0.8 ? 'almost-full' :
                          ((event.currentParticipants || 0) / event.maxParticipants) >= 0.5 ? 'filling' : 'available'
                        }`}
                        style={{ width: `${Math.min(((event.currentParticipants || 0) / event.maxParticipants) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="event-card-actions">
                    <button 
                      className="event-view-button"
                      onClick={() => handleViewDetails(event)}
                    >
                      <FaClock />
                      View Details
                    </button>
                    {event.status === 'ONGOING' && (
                      event.registrationStatus ? (
                        // User has registered - show status badge and cancel button
                        <>
                          {event.registrationStatus === 'APPROVED' && (
                            <>
                              <button className="event-registered-button" disabled>
                                <FaCheckCircle />
                                Registered
                              </button>
                              <button 
                                className="event-cancel-button"
                                onClick={() => handleCancelRegistration(Number(event.eventId))}
                                disabled={cancelling === Number(event.eventId)}
                              >
                                {cancelling === Number(event.eventId) ? (
                                  <>
                                    <FaSpinner className="spinning" />
                                    Cancelling...
                                  </>
                                ) : (
                                  <>
                                    <FaTimes />
                                    Cancel Registration
                                  </>
                                )}
                              </button>
                            </>
                          )}
                          {event.registrationStatus === 'PENDING' && (
                            <>
                              <button className="event-pending-button" disabled>
                                <FaClock />
                                Pending Approval
                              </button>
                              <button 
                                className="event-cancel-button"
                                onClick={() => handleCancelRegistration(Number(event.eventId))}
                                disabled={cancelling === Number(event.eventId)}
                              >
                                {cancelling === Number(event.eventId) ? (
                                  <>
                                    <FaSpinner className="spinning" />
                                    Cancelling...
                                  </>
                                ) : (
                                  <>
                                    <FaTimes />
                                    Cancel Registration
                                  </>
                                )}
                              </button>
                            </>
                          )}
                          {event.registrationStatus === 'WAITING' && (
                            <>
                              <button className="event-waiting-button" disabled>
                                <FaHourglassHalf />
                                Waiting List
                              </button>
                              <button 
                                className="event-cancel-button"
                                onClick={() => handleCancelRegistration(Number(event.eventId))}
                                disabled={cancelling === Number(event.eventId)}
                              >
                                {cancelling === Number(event.eventId) ? (
                                  <>
                                    <FaSpinner className="spinning" />
                                    Cancelling...
                                  </>
                                ) : (
                                  <>
                                    <FaTimes />
                                    Cancel Registration
                                  </>
                                )}
                              </button>
                            </>
                          )}
                          {event.registrationStatus === 'REJECTED' && (
                            <button className="event-rejected-button" disabled>
                              <FaTimes />
                              Rejected
                            </button>
                          )}
                        </>
                      ) : (
                        // User hasn't registered yet
                        <button 
                          className="event-register-button"
                          onClick={() => {
                            const evtIdNum = Number(event.eventId);
                            console.log('Register button clicked for event:', evtIdNum, 'Event object:', event);
                            handleRegisterEvent(evtIdNum);
                          }}
                          disabled={registering.has(Number(event.eventId))}
                        >
                          {registering.has(event.eventId) ? (
                            <>
                              <FaSpinner className="spinning" />
                              Registering...
                            </>
                          ) : (
                            <>
                              <FaSignInAlt />
                              Register
                            </>
                          )}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && events.length === 0 && (
          <div className="events-empty">
            <FaSearch className="empty-icon" />
            <h3>No events found</h3>
            <p>
              {searchQuery || selectedStatus
                ? 'Try adjusting your search or filters'
                : 'There are no events available at the moment'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="events-pagination">
            <button
              className="pagination-button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              Previous
            </button>

            <div className="pagination-pages">
              {generatePaginationItems().map((item) => {
                if (typeof item === 'string' && item.startsWith('ellipsis')) {
                  return (
                    <span key={item} className="pagination-ellipsis">
                      ...
                    </span>
                  );
                }
                return (
                  <button
                    key={item}
                    className={`pagination-page ${currentPage === item ? 'active' : ''}`}
                    onClick={() => handlePageChange(item)}
                  >
                    {item + 1}
                  </button>
                );
              })}
            </div>

            <button
              className="pagination-button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
            >
              Next
            </button>
          </div>
        )}

        {/* Event Detail Modal */}
        {isModalOpen && selectedEvent && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="modal-header">
                <FaCalendar className="modal-header-icon" />
                <span className={`modal-status-badge ${getStatusColor(selectedEvent.status)}`}>
                  {selectedEvent.status}
                </span>
                <button className="modal-close-button" onClick={handleCloseModal}>
                  <FaTimes />
                </button>
              </div>

              {/* Modal Body */}
              <div className="modal-body">
                <h2 className="modal-title">{selectedEvent.title}</h2>

                {/* Details Grid */}
                <div className="modal-details-grid">
                  <div className="modal-detail-item">
                    <FaCalendar className="modal-detail-icon" />
                    <div className="modal-detail-content">
                      <div className="modal-detail-label">Date & Time</div>
                      <div className="modal-detail-value">{formatDate(selectedEvent.date)}</div>
                    </div>
                  </div>

                  <div className="modal-detail-item">
                    <FaMapMarkerAlt className="modal-detail-icon" />
                    <div className="modal-detail-content">
                      <div className="modal-detail-label">Location</div>
                      <div className="modal-detail-value">{selectedEvent.location}</div>
                    </div>
                  </div>

                  <div className="modal-detail-item">
                    <FaUsers className="modal-detail-icon" />
                    <div className="modal-detail-content">
                      <div className="modal-detail-label">Participants</div>
                      <div className="modal-detail-value">
                        {selectedEvent.currentParticipants || 0} / {selectedEvent.maxParticipants} registered
                        {(() => {
                          const current = selectedEvent.currentParticipants || 0;
                          const max = selectedEvent.maxParticipants;
                          if (current >= max) {
                            return <span className="modal-availability-badge badge-full">Full</span>;
                          } else if ((current / max) >= 0.8) {
                            return <span className="modal-availability-badge badge-almost-full">Almost Full</span>;
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="modal-detail-item">
                    <FaUser className="modal-detail-icon" />
                    <div className="modal-detail-content">
                      <div className="modal-detail-label">Organized By</div>
                      <div className="modal-detail-value">{selectedEvent.creatorUsername}</div>
                    </div>
                  </div>
                </div>

                {/* Participants Progress in Modal */}
                <div className="modal-participants-progress">
                  <div className="participants-progress-bar">
                    <div 
                      className={`participants-progress-fill ${
                        ((selectedEvent.currentParticipants || 0) / selectedEvent.maxParticipants) >= 1 ? 'full' :
                        ((selectedEvent.currentParticipants || 0) / selectedEvent.maxParticipants) >= 0.8 ? 'almost-full' :
                        ((selectedEvent.currentParticipants || 0) / selectedEvent.maxParticipants) >= 0.5 ? 'filling' : 'available'
                      }`}
                      style={{ width: `${Math.min(((selectedEvent.currentParticipants || 0) / selectedEvent.maxParticipants) * 100, 100)}%` }}
                    ></div>
                  </div>
                  {(() => {
                    const current = selectedEvent.currentParticipants || 0;
                    const max = selectedEvent.maxParticipants;
                    const remaining = max - current;
                    if (current >= max) {
                      return <p className="availability-message warning">⚠️ This event is full. You will be added to the waiting list.</p>;
                    } else if (remaining <= 3) {
                      return <p className="availability-message warning">⚠️ Only {remaining} spot(s) remaining! Register now.</p>;
                    } else if ((current / max) >= 0.8) {
                      return <p className="availability-message info">ℹ️ This event is filling up fast. {remaining} spots available.</p>;
                    }
                    return <p className="availability-message success">✅ {remaining} spots available</p>;
                  })()}
                </div>

                {/* Description Section */}
                <div className="modal-section">
                  <h3 className="modal-section-title">
                    <FaFileAlt className="modal-section-icon" />
                    Event Description
                  </h3>
                  <div className="modal-description">
                    {selectedEvent.description}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer">
                <button className="modal-action-button secondary" onClick={handleCloseModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </DashboardLayout>
  );
};

export default Events;
