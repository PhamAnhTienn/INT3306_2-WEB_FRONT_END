import { useState, useEffect, useCallback, useRef } from 'react';
import { FaComment, FaSpinner } from 'react-icons/fa';
import { commentsAPI } from '../../services/comments/commentsService';
import websocketService from '../../services/websocket/websocketService';
import { useAuth } from '../../hooks/useAuth';
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
  const { user } = useAuth();
  const unsubscribeRef = useRef(null);

  const PAGE_SIZE = 5;

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
        limit: PAGE_SIZE,
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

  // Subscribe to WebSocket for real-time comments
  useEffect(() => {
    if (!postId || !user) return;

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    let isSubscribed = false;

    const subscribeToComments = () => {
      if (isSubscribed) return;
      
      // Subscribe to comments topic for this post
      const topic = `/topic/posts/${postId}/comments`;
      unsubscribeRef.current = websocketService.subscribe(
        topic,
        (newComment) => {
          console.log('New comment received via WebSocket:', newComment);
          
          // Normalize comment data (handle both direct DTO and wrapped format)
          const comment = newComment.data || newComment;
          const incomingKey = comment.id || comment.commentId;
          
          // Only add top-level comments (replies are handled by CommentReplies component)
          if (comment.parentCommentId) {
            console.log('Skipping reply comment, will be handled by CommentReplies:', comment.id);
            return;
          }
          
          // Update or add comment to the list
          setComments(prev => {
            // Only try to match existing when we have a valid id
            const existingIndex = incomingKey
              ? prev.findIndex(c =>
                  (c.id || c.commentId) === incomingKey
                )
              : -1;
            
            if (existingIndex !== -1) {
              // Comment already exists, update it with fresh data from backend
              console.log('Comment already exists, updating:', incomingKey);
              const updated = [...prev];
              updated[existingIndex] = comment; // Replace with fresh data from WebSocket
              return updated;
            }
            
            // New top-level comment, add at the beginning (latest first)
            console.log('Adding new top-level comment to list:', incomingKey, comment);
            const updated = [comment, ...prev];
            
            // Update comment count
            if (onCommentCountChange) {
              onCommentCountChange(updated.length);
            }
            
            return updated;
          });
        }
      );
      isSubscribed = true;
      console.log('Subscribed to comments topic:', topic);
    };

    // Check if already connected, subscribe immediately
    if (websocketService.getConnected()) {
      subscribeToComments();
    } else {
      // Ensure WebSocket is connected
      websocketService.connect(
        token,
        () => {
          subscribeToComments();
        },
        (error) => {
          console.error('WebSocket connection error for comments:', error);
        }
      );
    }

    // Cleanup: unsubscribe when component unmounts or postId changes
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
        isSubscribed = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, user]);

  useEffect(() => {
    fetchComments(true);
  }, [postId]);

  const handleCommentCreated = (newComment) => {
    // Don't add comment here - let WebSocket handle it
    // This prevents duplicate comments and ensures all users see comments in real-time
    // The comment will be added via WebSocket broadcast from backend
    console.log('Comment created, waiting for WebSocket broadcast:', newComment.id);
  };

  const handleCommentUpdated = (updatedComment) => {
    setComments(prev =>
      prev.map(c =>
        (c.id || c.commentId) === (updatedComment.id || updatedComment.commentId)
          ? updatedComment
          : c
      )
    );
  };

  const handleCommentDeleted = (commentId) => {
    setComments(prev => prev.filter(c => (c.id || c.commentId) !== commentId));
    if (onCommentCountChange) {
      onCommentCountChange(comments.length - 1);
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
            onCommentUpdated={handleCommentUpdated}
            onCommentDeleted={handleCommentDeleted}
            />
          ))
        )}
      </div>

      {hasNext && (
        <button
        className="btn-load-more"
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


