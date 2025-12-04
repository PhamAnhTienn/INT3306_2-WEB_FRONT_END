import { useState, useEffect, useCallback } from 'react';
import { FaComment, FaSpinner } from 'react-icons/fa';
import { commentsAPI } from '../../services/comments/commentsService';
import CommentItem from './CommentItem';
import CreateComment from './CreateComment';
import './CommentsList.css';

const CommentsList = ({ postId, onCommentCountChange }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [error, setError] = useState(null);

  const fetchComments = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setComments([]);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const response = await commentsAPI.getPostComments(postId, {
        cursor: reset ? null : cursor,
        limit: 10,
      });

      if (response.success && response.data) {
        const page = response.data;
        const newComments = page.comments || [];
        
        if (reset) {
          setComments(newComments);
        } else {
          setComments(prev => [...prev, ...newComments]);
        }

        setCursor(page.nextCursor || null);
        setHasNext(page.hasNext || false);

        // Notify parent of comment count change
        if (onCommentCountChange) {
          const totalCount = (reset ? newComments.length : comments.length + newComments.length);
          onCommentCountChange(totalCount);
        }
      }
    } catch (error) {
      setError(error.message || 'Failed to load comments');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [postId, cursor, onCommentCountChange]);

  useEffect(() => {
    fetchComments(true);
  }, [postId]);

  const handleCommentCreated = (newComment) => {
    // Add new comment to the top of the list (optimistic update)
    setComments(prev => [newComment, ...prev]);

    // Optionally notify parent about new count
    if (onCommentCountChange) {
      onCommentCountChange(comments.length + 1);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasNext) {
      fetchComments(false);
    }
  };

  if (loading) {
    return (
      <div className="comments-list-loading">
        <FaSpinner className="spinning" />
        <p>Loading comments...</p>
      </div>
    );
  }

  return (
    <div className="comments-list">
      <div className="comments-header">
        <h4 className="comments-title">
          <FaComment />
          <span>Comments {comments.length > 0 && `(${comments.length})`}</span>
        </h4>
      </div>

      <CreateComment
        postId={postId}
        onCommentCreated={handleCommentCreated}
        placeholder="Write a comment..."
      />

      {error && (
        <div className="comments-error">
          {error}
        </div>
      )}

      <div className="comments-items">
        {comments.length === 0 ? (
          <div className="comments-empty">
            <FaComment className="empty-icon" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id || comment.commentId}
              comment={comment}
              postId={postId}
              onReplyCreated={handleCommentCreated}
            />
          ))
        )}
      </div>

      {hasNext && (
        <button
          className="btn-load-more-comments"
          onClick={handleLoadMore}
          disabled={loadingMore}
        >
          {loadingMore ? (
            <>
              <FaSpinner className="spinning" />
              <span>Loading...</span>
            </>
          ) : (
            'Load more comments'
          )}
        </button>
      )}
    </div>
  );
};

export default CommentsList;


