import { useState, useEffect } from 'react';
import { FaHeart } from 'react-icons/fa';
import { likesAPI } from '../../services/likes/likesService';
import './LikeButton.css';

const LikeButton = ({ 
  postId, 
  commentId, 
  initialLiked = false, 
  onLikeChange,
  className = '' 
}) => {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [isLoading, setIsLoading] = useState(false);

  // Determine a unique storage key based on post or comment
  const storageKey = postId
    ? `like:post:${postId}`
    : commentId
    ? `like:comment:${commentId}`
    : null;

  // Initialize liked state from localStorage (if available), otherwise from backend
  useEffect(() => {
    if (!storageKey) {
      setIsLiked(initialLiked);
      return;
    }

    try {
      const storedValue = localStorage.getItem(storageKey);
      if (storedValue !== null) {
        setIsLiked(storedValue === 'true');
      } else {
        setIsLiked(initialLiked);
      }
    } catch (e) {
      // If localStorage is not available, fall back to backend state
      setIsLiked(initialLiked);
    }
  }, [storageKey, initialLiked]);

  const handleToggleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;

    try {
      setIsLoading(true);
      const previousLiked = isLiked;

      // Optimistically update UI
      setIsLiked(!previousLiked);
      
      // Call API
      if (postId) {
        await likesAPI.togglePostLike(postId);
      } else if (commentId) {
        await likesAPI.toggleCommentLike(commentId);
      }

      // Persist like state locally so it survives reloads
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, String(!previousLiked));
        } catch (e) {
          // ignore storage errors
        }
      }
      
      // Notify parent component
      if (onLikeChange) {
        onLikeChange(!previousLiked);
      }
    } catch (error) {
      // Revert on error
      setIsLiked(prev => prev); // keep current visual state
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to toggle like';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className={`like-button ${isLiked ? 'liked' : ''} ${isLoading ? 'loading' : ''} ${className}`}
      onClick={handleToggleLike}
      disabled={isLoading}
      title={isLiked ? 'Unlike' : 'Like'}
    >
      <FaHeart className={isLiked ? 'filled' : ''} />
      <span>{isLiked ? 'Liked' : 'Like'}</span>
    </button>
  );
};

export default LikeButton;


