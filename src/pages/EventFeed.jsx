import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCalendar, FaMapMarkerAlt, FaUsers, FaEllipsisV, FaComment } from 'react-icons/fa';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import CreatePost from '../components/posts/CreatePost';
import LikeButton from '../components/posts/LikeButton';
import LikeCount from '../components/posts/LikeCount';
import CommentsList from '../components/comments/CommentsList';
import { postsAPI } from '../services/posts/postsService';
import { getEventById } from '../services/events/eventsService';
import './EventFeed.css';

const EventFeed = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [userRegistrationStatus, setUserRegistrationStatus] = useState(null); // APPROVED, PENDING, REJECTED, etc.
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchEventAndPosts = async () => {
      setLoading(true);
      try {
        // Fetch event details
        const eventResponse = await getEventById(eventId);
        if (eventResponse.success && eventResponse.data) {
          setEvent(eventResponse.data);
        }

        // TODO: Get user's registration status for this event
        // const registrationResponse = await getUserRegistrationStatus(eventId);
        setUserRegistrationStatus('APPROVED'); // Mock - should come from API

        // Fetch posts
        await fetchPosts(0, true);
      } catch (err) {
        setError(err.message || 'Failed to load event feed');
      } finally {
        setLoading(false);
      }
    };

    fetchEventAndPosts();
  }, [eventId]);

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

  if (loading) {
    return (
      <DashboardLayout userRole="volunteer">
        <div className="event-feed-loading">
          <div className="spinner"></div>
          <p>Loading event feed...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !event) {
    return (
      <DashboardLayout userRole="volunteer">
        <div className="event-feed-error">
          <p>⚠️ {error || 'Event not found'}</p>
          <button onClick={() => navigate('/volunteer/events')} className="btn-back">
            Go Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="volunteer">
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
          {/* Create Post Section - Only show if registration is approved */}
          {userRegistrationStatus === 'APPROVED' ? (
            <>
              {!showCreatePost ? (
                <div className="create-post-card">
                  <div className="create-post-header" onClick={() => setShowCreatePost(true)}>
                    <div className="user-avatar">
                      <FaUsers />
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
              posts.map((post) => (
                <div key={post.id || post.postId} className="post-card">
                  <div className="post-header">
                    <div className="post-author">
                      <div className="author-avatar">
                        {post.user?.avatarUrl ? (
                          <img src={post.user.avatarUrl} alt={post.user.username} />
                        ) : (
                          <FaUsers />
                        )}
                      </div>
                      <div className="author-info">
                        <h4>{post.user?.fullName || post.user?.username || 'Anonymous'}</h4>
                        <span className="post-time">
                          {getTimeAgo(post.createdAt || post.created_at || post.timestamp)}
                        </span>
                      </div>
                    </div>
                    <button className="btn-post-menu">
                      <FaEllipsisV />
                    </button>
                  </div>

                  <div className="post-content">
                    <p>{post.content}</p>
                    {post.fileRecords && post.fileRecords.length > 0 && (
                      <div className="post-images">
                        {post.fileRecords.map((file, index) => (
                          <div key={index} className="post-image">
                            <img src={file.url || file.fileUrl} alt={`Post content ${index + 1}`} />
                          </div>
                        ))}
                      </div>
                    )}
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
                    <button className="post-action-btn">
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
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EventFeed;
