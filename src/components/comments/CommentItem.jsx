import { useState } from 'react';
import { FaReply, FaUser } from 'react-icons/fa';
import LikeButton from '../posts/LikeButton';
import LikeCount from '../posts/LikeCount';
import CreateComment from './CreateComment';
import CommentReplies from './CommentReplies';
import './CommentItem.css';

const CommentItem = ({ comment, postId, onReplyCreated }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return past.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: past.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const handleReplyCreated = (reply) => {
    setShowReplyForm(false);
    if (onReplyCreated) {
      onReplyCreated(reply);
    }
  };

  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  return (
    <div className="comment-item">
      <div className="comment-header">
        <div className="comment-author">
          <div className="comment-avatar">
            {comment.user?.avatarUrl ? (
              <img src={comment.user.avatarUrl} alt={comment.user.username} />
            ) : (
              <FaUser />
            )}
          </div>
          <div className="comment-author-info">
            <span className="comment-author-name">
              {comment.user?.fullName || comment.user?.username || 'Anonymous'}
            </span>
            <span className="comment-time">
              {getTimeAgo(comment.createdAt || comment.created_at)}
            </span>
          </div>
        </div>
      </div>

      <div className="comment-content">
        <p>{comment.content}</p>
      </div>

      <div className="comment-actions">
        <LikeButton
          commentId={comment.id || comment.commentId}
          initialLiked={comment.isLikedByCurrentUser || false}
        />
        <LikeCount
          commentId={comment.id || comment.commentId}
          initialCount={comment.likeCount || comment.like_count || 0}
        />
        <button
          className="btn-reply"
          onClick={() => setShowReplyForm(!showReplyForm)}
        >
          <FaReply />
          <span>Reply</span>
        </button>
        {comment.replyCount > 0 && (
          <button
            className="btn-view-replies"
            onClick={toggleReplies}
          >
            {showReplies ? 'Hide' : 'View'} {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
          </button>
        )}
      </div>

      {showReplyForm && (
        <div className="comment-reply-form">
          <CreateComment
            postId={postId}
            parentCommentId={comment.id || comment.commentId}
            onCommentCreated={handleReplyCreated}
            onCancel={() => setShowReplyForm(false)}
            placeholder="Write a reply..."
            autoFocus={true}
          />
        </div>
      )}

      {showReplies && (comment.id || comment.commentId) && (
        <CommentReplies
          commentId={comment.id || comment.commentId}
          postId={postId}
          onReplyCreated={handleReplyCreated}
        />
      )}
    </div>
  );
};

export default CommentItem;


