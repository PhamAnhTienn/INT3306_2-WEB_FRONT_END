import { useState, useEffect } from 'react';
import { likesAPI } from '../../services/likes/likesService';
import './LikeCount.css';

const LikeCount = ({ postId, commentId, initialCount = 0, className = '' }) => {
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  useEffect(() => {
    const fetchLikeCount = async () => {
      if (loading) return;
      
      try {
        setLoading(true);
        let response;
        
        if (postId) {
          response = await likesAPI.getPostLikeCount(postId);
        } else if (commentId) {
          response = await likesAPI.getCommentLikeCount(commentId);
        }
        
        if (response?.success && response?.data !== undefined) {
          setCount(response.data);
        }
      } catch (error) {
        // Silently fail - use initial count
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we don't have an initial count
    if (initialCount === 0 || initialCount === null) {
      fetchLikeCount();
    }
  }, [postId, commentId]);

  if (count === 0 && !loading) {
    return null;
  }

  return (
    <span className={`like-count ${className}`}>
      {count} {count === 1 ? 'like' : 'likes'}
    </span>
  );
};

export default LikeCount;
















