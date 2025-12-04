import { useState, useEffect, useCallback } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { commentsAPI } from '../../services/comments/commentsService';
import CommentItem from './CommentItem';
import './CommentReplies.css';

const CommentReplies = ({ commentId, postId, onReplyCreated }) => {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [error, setError] = useState(null);

  const fetchReplies = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setReplies([]);
        setCursor(null);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const response = await commentsAPI.getCommentReplies(commentId, {
        cursor: reset ? null : cursor,
        limit: 5,
      });

      if (response.success && response.data) {
        const newReplies = response.data.content || [];
        
        if (reset) {
          setReplies(newReplies);
        } else {
          setReplies(prev => [...prev, ...newReplies]);
        }

        setCursor(response.data.nextCursor);
        setHasNext(response.data.hasNext || false);
      }
    } catch (error) {
      setError(error.message || 'Failed to load replies');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [commentId, cursor]);

  useEffect(() => {
    fetchReplies(true);
  }, [commentId]);

  const handleReplyCreated = (newReply) => {
    setReplies(prev => [newReply, ...prev]);
    if (onReplyCreated) {
      onReplyCreated(newReply);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasNext) {
      fetchReplies(false);
    }
  };

  if (loading) {
    return (
      <div className="comment-replies-loading">
        <FaSpinner className="spinning" />
        <span>Loading replies...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="comment-replies-error">
        {error}
      </div>
    );
  }

  if (replies.length === 0) {
    return null;
  }

  return (
    <div className="comment-replies">
      {replies.map((reply) => (
        <CommentItem
          key={reply.id || reply.commentId}
          comment={reply}
          postId={postId}
          onReplyCreated={handleReplyCreated}
        />
      ))}

      {hasNext && (
        <button
          className="btn-load-more-replies"
          onClick={handleLoadMore}
          disabled={loadingMore}
        >
          {loadingMore ? (
            <>
              <FaSpinner className="spinning" />
              <span>Loading...</span>
            </>
          ) : (
            'Load more replies'
          )}
        </button>
      )}
    </div>
  );
};

export default CommentReplies;



