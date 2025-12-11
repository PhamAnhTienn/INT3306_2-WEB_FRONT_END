import { useState, useEffect, useCallback, useRef } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { commentsAPI } from '../../services/comments/commentsService';
import websocketService from '../../services/websocket/websocketService';
import { useAuth } from '../../hooks/useAuth';
import CommentItem from './CommentItem';
import './CommentReplies.css';

const CommentReplies = ({ commentId, postId, onReplyCreated, parentAuthorName, initialReplies = [] }) => {
  const [replies, setReplies] = useState(initialReplies || []);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const unsubscribeRef = useRef(null);

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

      // Use flattened replies API to get all nested replies at same level
      const response = await commentsAPI.getAllRepliesFlattened(commentId, {
        cursor: reset ? null : cursor,
        limit: 20,
      });

      if (response.success && response.data) {
        // Flattened replies API returns CommentCursorPageResponse with 'comments' field
        const page = response.data;
        const newReplies = page.comments || [];
        
        setReplies(reset ? newReplies : (prev => [...prev, ...newReplies]));

        setCursor(page.nextCursor || null);
        setHasNext(page.hasNext || false);
      }
    } catch (error) {
      setError(error.message || 'Failed to load replies');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [commentId, cursor]);

  // Subscribe to WebSocket for real-time replies
  useEffect(() => {
    if (!commentId || !user) return;

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    let isSubscribed = false;

    const subscribeToReplies = () => {
      if (isSubscribed) return;
      
      // Subscribe to replies topic for this comment
      const topic = `/topic/comments/${commentId}/replies`;
      unsubscribeRef.current = websocketService.subscribe(
        topic,
        (newReply) => {
          console.log('New reply received via WebSocket:', newReply);
          
          // Normalize reply data (handle both direct DTO and wrapped format)
          const reply = newReply.data || newReply;
          const incomingKey = reply.id || reply.commentId;
          
          // Update or add reply to the list
          setReplies(prev => {
            // Check if reply already exists; only compare when id is present
            const existingIndex = incomingKey
              ? prev.findIndex(r => (r.id || r.commentId) === incomingKey)
              : -1;
            
            if (existingIndex !== -1) {
              // Reply already exists, update it with fresh data from backend
              console.log('Reply already exists, updating:', incomingKey);
              const updated = [...prev];
              updated[existingIndex] = reply; // Replace with fresh data from WebSocket
              
              // Notify parent component
              if (onReplyCreated) {
                onReplyCreated(reply);
              }
              
              return updated;
            }
            
            // New reply, add to bottom to keep chronological order
            console.log('Adding new reply to list:', incomingKey, reply);
            const updated = [...prev, reply];
            
            // Notify parent component
            if (onReplyCreated) {
              onReplyCreated(reply);
            }
            
            return updated;
          });
        }
      );
      isSubscribed = true;
      console.log('Subscribed to replies topic:', topic);
    };

    // Check if already connected, subscribe immediately
    if (websocketService.getConnected()) {
      subscribeToReplies();
    } else {
      // Ensure WebSocket is connected
      websocketService.connect(
        token,
        () => {
          subscribeToReplies();
        },
        (error) => {
          console.error('WebSocket connection error for replies:', error);
        }
      );
    }

    // Cleanup: unsubscribe when component unmounts or commentId changes
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
        isSubscribed = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentId, user]);

  useEffect(() => {
    fetchReplies(true);
  }, [commentId]);

  // Merge initialReplies (e.g., newly created) into state
  useEffect(() => {
    if (!initialReplies || initialReplies.length === 0) return;
    setReplies(prev => {
      const combined = [...prev];
      initialReplies.forEach(r => {
        const exists = combined.some(x => (x.id || x.commentId) === (r.id || r.commentId));
        if (!exists) combined.push(r);
      });
      return combined;
    });
  }, [initialReplies]);

  const handleReplyCreated = (newReply) => {
    // Don't add reply here - let WebSocket handle it
    // This prevents duplicate replies and ensures all users see replies in real-time
    // The reply will be added via WebSocket broadcast from backend
    console.log('Reply created, waiting for WebSocket broadcast:', newReply.id);
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
          comment={{ ...reply, parentAuthorName }}
          postId={postId}
          onReplyCreated={handleReplyCreated}
        />
      ))}

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
            'Load more replies'
          )}
        </button>
      )}
    </div>
  );
};

export default CommentReplies;









