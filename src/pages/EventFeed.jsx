import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCalendar, FaMapMarkerAlt, FaUsers, FaHeart, FaComment, FaShare, FaImage, FaTimes, FaEllipsisV } from 'react-icons/fa';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import './EventFeed.css';

const EventFeed = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPost, setNewPost] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [userRegistrationStatus, setUserRegistrationStatus] = useState(null); // APPROVED, PENDING, REJECTED, etc.

  // Mock event data - Replace with actual API call
  useEffect(() => {
    const fetchEventAndPosts = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        // const eventResponse = await getEventById(eventId);
        // const postsResponse = await getEventPosts(eventId);
        
        // Mock data
        setEvent({
          eventId: eventId,
          title: 'Community Garden Cleanup',
          date: '2025-11-25T09:00:00',
          location: 'Central Park, Hanoi',
          status: 'ONGOING',
          maxParticipants: 50,
          description: 'Join us for a community garden cleanup event!'
        });

        // TODO: Get user's registration status for this event
        // const registrationResponse = await getUserRegistrationStatus(eventId);
        setUserRegistrationStatus('APPROVED'); // Mock - should come from API

        setPosts([
          {
            id: 1,
            author: 'Jane Smith',
            authorAvatar: null,
            content: 'So excited for this event! Can\'t wait to make a difference together! 🌱',
            timestamp: '2025-11-20T14:30:00',
            likes: 12,
            comments: 3,
            isLiked: false,
            imageUrl: null
          },
          {
            id: 2,
            author: 'John Doe',
            authorAvatar: null,
            content: 'Just finished preparing the tools. Everything is ready for Saturday!',
            timestamp: '2025-11-21T10:15:00',
            likes: 8,
            comments: 1,
            isLiked: true,
            imageUrl: null
          }
        ]);
      } catch (err) {
        setError(err.message || 'Failed to load event feed');
      } finally {
        setLoading(false);
      }
    };

    fetchEventAndPosts();
  }, [eventId]);

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

  const handleCreatePost = () => {
    if (!newPost.trim()) return;

    const post = {
      id: Date.now(),
      author: 'Current User', // Replace with actual user name
      authorAvatar: null,
      content: newPost,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
      isLiked: false,
      imageUrl: selectedImage
    };

    setPosts([post, ...posts]);
    setNewPost('');
    setSelectedImage(null);
    setShowCreatePost(false);
  };

  const handleLikePost = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
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
            <h1>{event.title}</h1>
            <div className="event-feed-meta">
              <span className="meta-item">
                <FaCalendar /> {formatDate(event.date)}
              </span>
              <span className="meta-item">
                <FaMapMarkerAlt /> {event.location}
              </span>
              <span className="meta-item">
                <FaUsers /> {event.maxParticipants} participants
              </span>
            </div>
          </div>
        </div>

        <div className="event-feed-container">
          {/* Create Post Section - Only show if registration is approved */}
          {userRegistrationStatus === 'APPROVED' ? (
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

          {/* Create Post Modal */}
          {showCreatePost && (
            <div className="modal-overlay" onClick={() => setShowCreatePost(false)}>
              <div className="create-post-modal" onClick={(e) => e.stopPropagation()}>
                <div className="create-post-modal-header">
                  <h3>Create Post</h3>
                  <button onClick={() => setShowCreatePost(false)} className="btn-close-modal">
                    <FaTimes />
                  </button>
                </div>
                <div className="create-post-modal-body">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="What's on your mind?"
                    className="create-post-textarea"
                    autoFocus
                  />
                  {selectedImage && (
                    <div className="selected-image-preview">
                      <img src={selectedImage} alt="Selected" />
                      <button onClick={() => setSelectedImage(null)} className="btn-remove-image">
                        <FaTimes />
                      </button>
                    </div>
                  )}
                  <div className="create-post-actions">
                    <label className="btn-add-image">
                      <FaImage />
                      <span>Add Photo</span>
                      <input type="file" accept="image/*" onChange={handleImageSelect} hidden />
                    </label>
                  </div>
                </div>
                <div className="create-post-modal-footer">
                  <button
                    onClick={handleCreatePost}
                    disabled={!newPost.trim()}
                    className="btn-post"
                  >
                    Post
                  </button>
                </div>
              </div>
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
                <div key={post.id} className="post-card">
                  <div className="post-header">
                    <div className="post-author">
                      <div className="author-avatar">
                        {post.authorAvatar ? (
                          <img src={post.authorAvatar} alt={post.author} />
                        ) : (
                          <FaUsers />
                        )}
                      </div>
                      <div className="author-info">
                        <h4>{post.author}</h4>
                        <span className="post-time">{getTimeAgo(post.timestamp)}</span>
                      </div>
                    </div>
                    <button className="btn-post-menu">
                      <FaEllipsisV />
                    </button>
                  </div>

                  <div className="post-content">
                    <p>{post.content}</p>
                    {post.imageUrl && (
                      <div className="post-image">
                        <img src={post.imageUrl} alt="Post content" />
                      </div>
                    )}
                  </div>

                  <div className="post-stats">
                    <span>{post.likes} likes</span>
                    <span>{post.comments} comments</span>
                  </div>

                  <div className="post-actions">
                    <button
                      className={`post-action-btn ${post.isLiked ? 'liked' : ''}`}
                      onClick={() => handleLikePost(post.id)}
                    >
                      <FaHeart />
                      <span>Like</span>
                    </button>
                    <button className="post-action-btn">
                      <FaComment />
                      <span>Comment</span>
                    </button>
                    <button className="post-action-btn">
                      <FaShare />
                      <span>Share</span>
                    </button>
                  </div>
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
