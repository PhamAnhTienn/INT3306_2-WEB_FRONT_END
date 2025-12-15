import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaCalendar, FaMapMarkerAlt, FaUsers, FaEllipsisV, FaComment, FaLock, FaClock, FaUserTimes, FaUserCheck, FaExclamationTriangle } from 'react-icons/fa';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import CreatePost from '../components/posts/CreatePost';
import LikeButton from '../components/posts/LikeButton';
import LikeCount from '../components/posts/LikeCount';
import CommentsList from '../components/comments/CommentsList';
import PostMenu from '../components/posts/PostMenu';
import EditPostModal from '../components/posts/EditPostModal';
import { postsAPI } from '../services/posts/postsService';
import { getEventById, getRegistrationStatus, registerForEvent } from '../services/events/eventsService';
import { useAuth } from '../hooks/useAuth';
import './EventFeed.css';

const EventFeed = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [userRegistrationStatus, setUserRegistrationStatus] = useState(null); // APPROVED, PENDING, REJECTED, WAITING, null (not registered)
  const [registrationData, setRegistrationData] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [lightbox, setLightbox] = useState({ open: false, items: [], index: 0 });
  const [editingPost, setEditingPost] = useState(null);

  // Determine user role from URL path or user context
  const getUserRole = () => {
    // Check URL path first
    if (location.pathname.includes('/manager/')) {
      return 'manager';
    } else if (location.pathname.includes('/volunteer/')) {
      return 'volunteer';
    }
    
    // Fallback to user context
    if (user) {
      const normalizeRole = (role) => {
        if (!role) return '';
        const str = String(role).replace(/^ROLE_/, '').toUpperCase().trim();
        return str;
      };
      
      const userRole = normalizeRole(user.role || user.activeRole);
      if (userRole === 'ADMIN') return 'admin';
      if (userRole === 'EVENT_MANAGER') return 'manager';
    }
    
    return 'volunteer';
  };

  const userRole = getUserRole();
  const isManager = userRole === 'manager' || userRole === 'admin';

  // Reset state when eventId changes
  useEffect(() => {
    setUserRegistrationStatus(null);
    setRegistrationData(null);
    setEvent(null);
    setPosts([]);
    setPage(0);
    setHasMore(true);
    setError(null);
    setShowCreatePost(false);
    setEditingPost(null);
  }, [eventId]);

  useEffect(() => {
    const fetchEventAndPosts = async () => {
      setLoading(true);
      try {
        // Clear any previous errors
        setError(null);
        
        // Fetch event details
        const eventResponse = await getEventById(eventId);
        if (eventResponse.success && eventResponse.data) {
          const eventData = eventResponse.data;
          console.log('Event data received:', eventData);
          console.log('Event status:', eventData.status, 'Type:', typeof eventData.status);
          setEvent(eventData);
          
          // Check if event is PLANNED - feed is not available
          // Check both string and enum comparison
          const eventStatusStr = String(eventData.status).toUpperCase();
          if (eventStatusStr === 'PLANNED') {
            console.log('Event is PLANNED, blocking feed access');
            setError('Event feed is not available for events with PLANNED status. Please wait until the event is approved.');
            setLoading(false);
            return;
          } else {
            console.log('Event status is NOT PLANNED:', eventStatusStr, '- Allowing feed access');
          }

          let registrationStatus = null;
          let registrationInfo = null;
          let isEventCreator = false;

          // Check if user is the event creator
          if (eventData && user && eventData.creatorId && user.id) {
            isEventCreator = eventData.creatorId === user.id;
          }

          // Event creator (manager) can always access feed
          if (isManager && isEventCreator) {
            registrationStatus = 'APPROVED';
            console.log('User is event creator, allowing access');
          } else if (isManager && !isEventCreator) {
            // Manager but not creator - need registration
            // Get user's registration status for this event
            try {
              const registrationResponse = await getRegistrationStatus(eventId);
              console.log('Manager registration status response for event', eventId, ':', registrationResponse);
              if (registrationResponse && registrationResponse.success) {
                if (registrationResponse.data && registrationResponse.data.status) {
                  registrationStatus = registrationResponse.data.status;
                  registrationInfo = registrationResponse.data;
                  console.log('Manager registration status:', registrationStatus, registrationInfo);
                } else {
                  registrationStatus = null;
                  registrationInfo = null;
                  console.log('Manager not registered for this event');
                }
              }
            } catch (regErr) {
              console.error('Error checking registration status:', regErr);
              registrationStatus = null;
            }
          } else {
            // Get user's registration status for this event
            try {
              const registrationResponse = await getRegistrationStatus(eventId);
              console.log('Volunteer registration status response for event', eventId, ':', registrationResponse);
              if (registrationResponse && registrationResponse.success) {
                if (registrationResponse.data && registrationResponse.data.status) {
                  registrationStatus = registrationResponse.data.status;
                  registrationInfo = registrationResponse.data;
                  console.log('User registration status:', registrationStatus, registrationInfo);
                } else {
                  // Not registered (data is null or no status)
                  registrationStatus = null;
                  registrationInfo = null;
                  console.log('User not registered for this event (data:', registrationResponse.data, ')');
                }
              } else {
                // API returned success=false or invalid response
                registrationStatus = null;
                registrationInfo = null;
                console.log('Registration check failed:', registrationResponse?.message || 'Invalid response');
              }
            } catch (regErr) {
              // If error, assume not registered
              console.error('Error checking registration status:', regErr);
              registrationStatus = null;
            }
          }

          setUserRegistrationStatus(registrationStatus);
          setRegistrationData(registrationInfo);

          // Only fetch posts if user has access (APPROVED or manager)
          if (isManager || registrationStatus === 'APPROVED') {
            await fetchPosts(0, true);
          }
        }
      } catch (err) {
        console.error('Error fetching event and posts:', err);
        console.error('Error details:', err.response?.data || err.message);
        // Only set error if it's not about PLANNED status (that's handled above)
        if (!err.message?.includes('PLANNED')) {
          setError(err.message || 'Failed to load event feed');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEventAndPosts();
  }, [eventId, isManager, user]);

  const fetchPosts = async (pageNum = 0, reset = false) => {
    try {
      const response = await postsAPI.getEventPosts(eventId, {
        page: pageNum,
        size: 10,
        sortBy: 'id',
        sortDir: 'desc',
      });

      if (response.success && response.data) {
        const newPosts = response.data.content || [];
        
        if (reset) {
          setPosts(newPosts);
        } else {
          setPosts(prev => [...prev, ...newPosts]);
        }

        setHasMore(!response.data.last);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

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

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return formatDate(dateString);
  };

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
    setShowCreatePost(false);
  };

  const openLightbox = (items, index = 0) => {
    if (!items || items.length === 0) return;
    setLightbox({ open: true, items, index });
  };

  const closeLightbox = () => setLightbox({ open: false, items: [], index: 0 });

  const nextLightbox = () => {
    setLightbox(prev => ({
      ...prev,
      index: (prev.index + 1) % prev.items.length,
    }));
  };

  const prevLightbox = () => {
    setLightbox(prev => ({
      ...prev,
      index: (prev.index - 1 + prev.items.length) % prev.items.length,
    }));
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const response = await postsAPI.deletePost(postId);
        if (response.success) {
          setPosts(prev => prev.filter(p => (p.id || p.postId) !== postId));
        }
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post');
      }
    }
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(prev => prev.map(p =>
      (p.id || p.postId) === (updatedPost.id || updatedPost.postId)
        ? { ...p, ...updatedPost }
        : p
    ));
  };

  const handleRegister = async () => {
    try {
      setRegistering(true);
      const response = await registerForEvent(eventId);
      console.log('Register response:', response);
      if (response && response.success) {
        // Refresh registration status
        try {
          const registrationResponse = await getRegistrationStatus(eventId);
          console.log('Registration status after register:', registrationResponse);
          if (registrationResponse && registrationResponse.success && registrationResponse.data) {
            setUserRegistrationStatus(registrationResponse.data.status);
            setRegistrationData(registrationResponse.data);
          } else if (response.data) {
            // Use registration data from register response if available
            setUserRegistrationStatus(response.data.status);
            setRegistrationData(response.data);
          }
        } catch (statusErr) {
          console.error('Error fetching registration status after register:', statusErr);
          // Fallback: use response data if available
          if (response.data) {
            setUserRegistrationStatus(response.data.status);
            setRegistrationData(response.data);
          }
        }
      }
    } catch (err) {
      console.error('Register error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to register for event';
      // Check if user already registered
      if (errorMessage.toLowerCase().includes('already registered')) {
        // Refresh registration status to update UI
        try {
          const registrationResponse = await getRegistrationStatus(eventId);
          console.log('Registration status after already registered error:', registrationResponse);
          if (registrationResponse && registrationResponse.success && registrationResponse.data) {
            setUserRegistrationStatus(registrationResponse.data.status);
            setRegistrationData(registrationResponse.data);
          }
        } catch (statusErr) {
          console.error('Error fetching registration status:', statusErr);
        }
        alert('You have already registered for this event.');
      } else {
        alert(errorMessage);
      }
    } finally {
      setRegistering(false);
    }
  };

  // Check if user is event creator
  const isEventCreator = event && user && event.creatorId && user.id 
    ? event.creatorId === user.id 
    : false;

  // Check if user can access feed
  // Event creator (manager) can always access, or APPROVED volunteers
  const canAccessFeed = (isManager && isEventCreator) || userRegistrationStatus === 'APPROVED';
  const canViewPosts = canAccessFeed; // Can view but not post if not approved
  
  // Check if user can post
  // Only event creator (manager) or APPROVED volunteers can post
  const canPost = (isManager && isEventCreator) || userRegistrationStatus === 'APPROVED';

  if (loading) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="event-feed-loading">
          <div className="spinner"></div>
          <p>Loading event feed...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !event) {
    console.log('Error or no event - Error:', error, 'Event:', event);
    return (
      <DashboardLayout userRole={userRole}>
        <div className="event-feed-error">
          <p>⚠️ {error || 'Event not found'}</p>
          {event && <p>Event Status: {event.status}</p>}
          <button 
            onClick={() => navigate(isManager ? '/manager/events' : '/volunteer/events')} 
            className="btn-back"
          >
            Go Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Show access restriction screen for users who don't have access
  // Check if event is PLANNED
  const eventStatus = event?.status;
  const eventStatusStr = eventStatus ? String(eventStatus).toUpperCase() : '';
  const isPlanned = eventStatusStr === 'PLANNED';
  
  console.log('Render check - Event status:', eventStatus, 'String:', eventStatusStr, 'Is PLANNED:', isPlanned);
  
  if (event && isPlanned) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="event-feed-page">
          <div className="event-feed-header">
            <div className="event-feed-title">
              <h1>{event.title || event.eventTitle}</h1>
            </div>
          </div>
          <div className="access-restriction-container">
            <div className="access-restriction-card">
              <div className="restriction-icon not-registered">
                <FaClock />
              </div>
              <h2>Event Feed Not Available</h2>
              <p>Event feed is not available for events with PLANNED status. Please wait until the event is approved.</p>
              <button 
                className="btn-back-to-events"
                onClick={() => navigate('/manager/events')}
              >
                <FaArrowLeft /> Back to My Events
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!canAccessFeed) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="event-feed-page">
          {/* Header */}
          <div className="event-feed-header">
            <button className="btn-back-icon" onClick={() => navigate(-1)}>
              <FaLock />
            </button>
            <div className="event-feed-header-content">
              <h1>{event.title || event.eventTitle}</h1>
              <div className="event-feed-meta">
                <span className="meta-item">
                  <FaCalendar /> {formatDate(event.date || event.startTime)}
                </span>
                <span className="meta-item">
                  <FaMapMarkerAlt /> {event.location}
                </span>
                <span className="meta-item">
                  <FaUsers /> {event.maxParticipants || event.maxVolunteers} participants
                </span>
              </div>
            </div>
          </div>

          {/* Access Restriction Card */}
          <div className="access-restriction-container">
            <div className="access-restriction-card">
              {userRegistrationStatus === null ? (
                // Not registered
                <>
                  <div className="restriction-icon not-registered">
                    <FaExclamationTriangle />
                  </div>
                  <h2>Registration Required</h2>
                  <p>You need to register for this event to access the feed and participate in discussions.</p>
                  <button 
                    className="btn-register-event"
                    onClick={handleRegister}
                    disabled={registering}
                  >
                    {registering ? 'Registering...' : 'Register for Event'}
                  </button>
                </>
              ) : userRegistrationStatus === 'PENDING' ? (
                // Pending approval
                <>
                  <div className="restriction-icon pending">
                    <FaClock />
                  </div>
                  <h2>Registration Pending Approval</h2>
                  <p>Your registration is currently being reviewed by the event manager. You'll be able to access the feed once your registration is approved.</p>
                  <div className="registration-info">
                    <p className="info-text">
                      <strong>Status:</strong> Pending Approval
                    </p>
                    {registrationData?.registeredAt && (
                      <p className="info-text">
                        <strong>Registered:</strong> {formatDate(registrationData.registeredAt)}
                      </p>
                    )}
                  </div>
                  <button 
                    className="btn-back-to-events"
                    onClick={() => navigate('/volunteer/events')}
                  >
                    Back to My Events
                  </button>
                </>
              ) : userRegistrationStatus === 'REJECTED' ? (
                // Rejected
                <>
                  <div className="restriction-icon rejected">
                    <FaUserTimes />
                  </div>
                  <h2>Registration Not Approved</h2>
                  <p>Unfortunately, your registration for this event was not approved. You cannot access the event feed.</p>
                  <div className="registration-info">
                    <p className="info-text">
                      <strong>Status:</strong> Rejected
                    </p>
                    {registrationData?.registeredAt && (
                      <p className="info-text">
                        <strong>Registered:</strong> {formatDate(registrationData.registeredAt)}
                      </p>
                    )}
                  </div>
                  <button 
                    className="btn-back-to-events"
                    onClick={() => navigate('/volunteer/events')}
                  >
                    Back to My Events
                  </button>
                </>
              ) : userRegistrationStatus === 'WAITING' ? (
                // Waiting list
                <>
                  <div className="restriction-icon waiting">
                    <FaClock />
                  </div>
                  <h2>On Waiting List</h2>
                  <p>You're currently on the waiting list for this event. You'll be notified if a spot becomes available.</p>
                  <div className="registration-info">
                    <p className="info-text">
                      <strong>Status:</strong> Waiting List
                    </p>
                    {registrationData?.registeredAt && (
                      <p className="info-text">
                        <strong>Registered:</strong> {formatDate(registrationData.registeredAt)}
                      </p>
                    )}
                  </div>
                  <button 
                    className="btn-back-to-events"
                    onClick={() => navigate('/volunteer/events')}
                  >
                    Back to My Events
                  </button>
                </>
              ) : (
                // Other status
                <>
                  <div className="restriction-icon default">
                    <FaLock />
                  </div>
                  <h2>Access Restricted</h2>
                  <p>You don't have permission to access this event feed.</p>
                  <button 
                    className="btn-back-to-events"
                    onClick={() => navigate('/volunteer/events')}
                  >
                    Back to My Events
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={userRole}>
      <div className="event-feed-page">
        {/* Header */}
        <div className="event-feed-header">
          <button className="btn-back-icon" onClick={() => navigate(-1)}>
            <FaArrowLeft />
          </button>
          <div className="event-feed-header-content">
            <h1>{event.title || event.eventTitle}</h1>
            <div className="event-feed-meta">
              <span className="meta-item">
                <FaCalendar /> {formatDate(event.date || event.startTime)}
              </span>
              <span className="meta-item">
                <FaMapMarkerAlt /> {event.location}
              </span>
              <span className="meta-item">
                <FaUsers /> {event.maxParticipants || event.maxVolunteers} participants
              </span>
            </div>
          </div>
        </div>

        <div className="event-feed-container">
          <div className="event-feed-layout">
            <div className="feed-main">
              {/* Create Post Section - Only show if user can post (event creator or APPROVED) */}
              {canPost ? (
                <>
                  {!showCreatePost ? (
                    <div className="create-post-card">
                      <div className="create-post-header" onClick={() => setShowCreatePost(true)}>
                        <div className="user-avatar">
                          {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.username} />
                          ) : (
                            <span>{(user?.fullName || user?.username || 'U')[0].toUpperCase()}</span>
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder="Share something about this event..."
                          readOnly
                          className="create-post-input-placeholder"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="create-post-wrapper">
                      <CreatePost
                        eventId={eventId}
                        onPostCreated={handlePostCreated}
                        onCancel={() => setShowCreatePost(false)}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="registration-notice">
                  <p>
                    {userRegistrationStatus === 'PENDING' 
                      ? '⏳ Your registration is pending approval. You can post once approved.'
                      : userRegistrationStatus === 'REJECTED'
                      ? '❌ Your registration was not approved.'
                      : '⚠️ You must be registered and approved to post in this event.'}
                  </p>
                </div>
              )}

              {/* Posts Feed */}
              <div className="posts-feed">
                {posts.length === 0 ? (
                  <div className="no-posts">
                    <FaComment className="no-posts-icon" />
                    <h3>No posts yet</h3>
                    <p>Be the first to share something about this event!</p>
                  </div>
                ) : (
                  posts.map((post, index) => (
                    <div 
                      key={post.id || post.postId} 
                      className="post-card"
                    >
                      <div className="post-header">
                        <div className="post-author">
                          <div className="author-avatar">
                            {post.userAvatarUrl ? (
                              <img src={post.userAvatarUrl} alt={post.username || post.user?.username} />
                            ) : post.user?.avatarUrl ? (
                              <img src={post.user.avatarUrl} alt={post.user.username} />
                            ) : (
                              <span>{(post.userFullName || post.user?.fullName || post.username || post.user?.username || 'A')[0].toUpperCase()}</span>
                            )}
                          </div>
                          <div className="author-info">
                            <h4>{post.userFullName || post.user?.fullName || post.username || post.user?.username || 'Anonymous'}</h4>
                            <span className="post-time">
                              {getTimeAgo(post.createdAt || post.created_at || post.timestamp)}
                            </span>
                          </div>
                        </div>
                        <PostMenu
                          post={post}
                          onEdit={handleEditPost}
                          onDelete={handleDeletePost}
                          isOwner={post.user?.id === user?.id || post.userId === user?.id}
                        />
                      </div>

                      <div className="post-content">
                        {post.content && <p>{post.content}</p>}
                        {/* fileRecords (backend) or files (DTO) */}
                        {(() => {
                          const mediaFiles = post.fileRecords || post.files || [];
                          if (!mediaFiles.length) return null;
                          const count = mediaFiles.length;
                          const gridClass =
                            count >= 4 ? 'post-images images-grid-4'
                            : count === 3 ? 'post-images images-grid-3'
                            : count === 2 ? 'post-images images-grid-2'
                            : 'post-images images-grid-1';
                          const displayed = mediaFiles.slice(0, 4);
                          return (
                            <div className={gridClass}>
                              {displayed.map((file, index) => {
                                const src = file.url || file.fileUrl;
                                const isVideo =
                                  file.resourceType === 'video' ||
                                  (file.type || '').startsWith('video') ||
                                  (file.fileType || '').startsWith('video');
                                const isLast = count > 4 && index === 3;
                                const originalIndex = index; // corresponds to same index in 'displayed'
                                return (
                                  <div
                                    key={index}
                                    className="post-image"
                                    onClick={() => openLightbox(mediaFiles, originalIndex)}
                                  >
                                    {isVideo ? (
                                      <video src={src} controls preload="metadata" />
                                    ) : (
                                      <img src={src} alt={`Post media ${index + 1}`} loading="lazy" />
                                    )}
                                    {isLast && (
                                      <div className="more-overlay">+{count - 4}</div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>

                      <div className="post-stats">
                        <LikeCount
                          postId={post.id || post.postId}
                          initialCount={post.likeCount || post.like_count || 0}
                        />
                        <span>{post.commentCount || post.comment_count || 0} comments</span>
                      </div>

                      <div className="post-actions">
                        <LikeButton
                          postId={post.id || post.postId}
                          initialLiked={post.isLikedByCurrentUser || false}
                        />
                        <button className="post-action-btn" title="Comment on this post">
                          <FaComment />
                          <span>Comment</span>
                        </button>
                      </div>

                      {/* Comments Section */}
                      <CommentsList
                        postId={post.id || post.postId}
                      />
                    </div>
                  ))
                )}

                {/* Load More Button */}
                {hasMore && posts.length > 0 && (
                  <div className="load-more-wrapper">
                    <button
                      className="btn-load-more"
                      onClick={() => fetchPosts(page + 1, false)}
                    >
                      Load More Posts
                    </button>
                  </div>
                )}
              </div>
            </div>

            <aside className="feed-sidebar">
              <div className="sidebar-card">
                <h4>Event Summary</h4>
                <ul>
                  <li><strong>Date:</strong> {formatDate(event.date || event.startTime)}</li>
                  <li><strong>Location:</strong> {event.location}</li>
                  <li><strong>Capacity:</strong> {event.maxParticipants || event.maxVolunteers}</li>
                  <li><strong>Status:</strong> {userRegistrationStatus || 'N/A'}</li>
                </ul>
              </div>
              <div className="sidebar-card">
                <h4>Tips</h4>
                <ul>
                  <li>Keep it concise and clear.</li>
                  <li>Add photos/videos to illustrate.</li>
                  <li>Be respectful to other participants.</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>
      {lightbox.open && lightbox.items.length > 0 && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox} aria-label="Close">&times;</button>
            <button className="lightbox-prev" onClick={prevLightbox} aria-label="Previous">&#10094;</button>
            <button className="lightbox-next" onClick={nextLightbox} aria-label="Next">&#10095;</button>
            {(() => {
              const current = lightbox.items[lightbox.index];
              const src = current?.url || current?.fileUrl;
              const isVideo =
                current?.resourceType === 'video' ||
                (current?.type || '').startsWith('video') ||
                (current?.fileType || '').startsWith('video');
              return (
                <div className="lightbox-media">
                  {isVideo ? (
                    <video src={src} controls autoPlay />
                  ) : (
                    <img src={src} alt={`Media ${lightbox.index + 1}`} />
                  )}
                </div>
              );
            })()}
            <div className="lightbox-counter">
              {lightbox.index + 1} / {lightbox.items.length}
            </div>
          </div>
        </div>
      )}
      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onUpdated={handlePostUpdated}
        />
      )}
    </DashboardLayout>
  );
};

export default EventFeed;
