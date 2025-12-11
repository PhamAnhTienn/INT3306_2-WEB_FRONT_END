import { useState } from 'react';
import { FaReply, FaUser, FaImage, FaTimes } from 'react-icons/fa';
import { commentsAPI } from '../../services/comments/commentsService';
import { useAuth } from '../../hooks/useAuth';
import LikeButton from '../posts/LikeButton';
import LikeCount from '../posts/LikeCount';
import CreateComment from './CreateComment';
import CommentReplies from './CommentReplies';
import CommentMenu from './CommentMenu';
import './CommentItem.css';

const CommentItem = ({ comment, postId, onReplyCreated, onCommentUpdated, onCommentDeleted }) => {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [pendingReplies, setPendingReplies] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [editFiles, setEditFiles] = useState([]);
  const [editPreviewUrls, setEditPreviewUrls] = useState([]);

  const isOwner = user && (user.id === comment.userId || user.id === comment.user?.id);
  const [expanded, setExpanded] = useState(false);

  const MAX_LENGTH = 240;

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
    setShowReplies(true); // ensure replies are visible immediately
    setPendingReplies(prev => {
      const exists = prev.some(r => (r.id || r.commentId) === (reply.id || reply.commentId));
      return exists ? prev : [...prev, reply];
    });
    if (onReplyCreated) {
      onReplyCreated(reply);
    }
  };

  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(comment.content || '');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content || '');
    setUpdateError(null);
  };

  const handleSaveEdit = async () => {
    const hasContent = editContent && editContent.trim().length > 0;
    if (!hasContent && editFiles.length === 0) {
      setUpdateError('Comment cannot be empty');
      return;
    }

    try {
      setIsUpdating(true);
      setUpdateError(null);

      let response;
      if (editFiles.length > 0) {
        response = await commentsAPI.updateCommentWithFiles(comment.id || comment.commentId, {
          content: hasContent ? editContent.trim() : '',
        }, editFiles);
      } else {
        response = await commentsAPI.updateComment(comment.id || comment.commentId, {
          content: hasContent ? editContent.trim() : '',
        });
      }

      if (response.success) {
        setIsEditing(false);
        setEditFiles([]);
        setEditPreviewUrls([]);
        if (onCommentUpdated) {
          onCommentUpdated(response.data);
        }
      } else {
        setUpdateError(response.message || 'Failed to update comment');
      }
    } catch (error) {
      setUpdateError(error.response?.data?.message || error.message || 'Failed to update comment');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setEditFiles(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setEditPreviewUrls(previews);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const response = await commentsAPI.deleteComment(comment.id || comment.commentId);
      if (response.success && onCommentDeleted) {
        onCommentDeleted(comment.id || comment.commentId);
      }
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'Failed to delete comment');
    }
  };

  const renderContent = () => {
    // Support media-only comments
    const hasText = comment?.content && comment.content.trim().length > 0;
    if (!hasText) return null;
    if (expanded || comment.content.length <= MAX_LENGTH) {
      return <p>{comment.content}</p>;
    }
    return (
      <>
        <p>{comment.content.slice(0, MAX_LENGTH)}...</p>
        <button className="comment-toggle" onClick={() => setExpanded(true)}>
          See more
        </button>
      </>
    );
  };

  const replyTarget =
    comment.replyToUserName ||
    comment.parentAuthorName ||
    comment.parentUsername ||
    (comment.parentCommentId ? 'the original comment' : null);

  return (
    <div className="comment-item">
      <div className="comment-header">
        <div className="comment-author">
          <div className="comment-avatar">
            {comment.user?.avatarUrl ? (
              <img src={comment.user.avatarUrl} alt={comment.user.username || comment.username} />
            ) : (
              <FaUser />
            )}
          </div>
          <div className="comment-author-info">
            <span className="comment-author-name">
              {comment.user?.fullName || comment.user?.username || comment.username || 'Anonymous'}
            </span>
            <span className="comment-time">
              {getTimeAgo(comment.createdAt || comment.created_at)}
            </span>
          </div>
        </div>
        {isOwner && !isEditing && (
          <div className="comment-menu-wrapper">
            <CommentMenu onEdit={handleEdit} onDelete={handleDelete} />
          </div>
        )}
      </div>

      <div className="comment-content">
        {replyTarget && (
          <div className="comment-reply-target">
            Replying to {replyTarget}
          </div>
        )}
        {isEditing ? (
          <div className="comment-edit-form">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="comment-edit-textarea"
              rows={3}
              maxLength={1000}
              disabled={isUpdating}
            />
            <div className="comment-edit-files">
              <label className="btn-add-comment-files" style={{ opacity: isUpdating ? 0.6 : 1 }}>
                <FaImage />
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleEditFileSelect}
                  disabled={isUpdating}
                  hidden
                />
              </label>
              {editPreviewUrls.length > 0 && (
                <div className="comment-image-previews">
                  {editPreviewUrls.map((url, idx) => (
                    <div key={idx} className="comment-image-preview-item">
                      {/* basic type detection */}
                      {url.includes('video') ? (
                        <video src={url} controls />
                      ) : (
                        <img src={url} alt={`Edit preview ${idx + 1}`} />
                      )}
                      <button
                        type="button"
                        className="btn-remove-comment-preview"
                        onClick={() => {
                          setEditFiles(prev => prev.filter((_, i) => i !== idx));
                          setEditPreviewUrls(prev => prev.filter((_, i) => i !== idx));
                        }}
                        disabled={isUpdating}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {updateError && <div className="comment-edit-error">{updateError}</div>}
            <div className="comment-edit-actions">
              <button
                className="btn-cancel-edit"
                onClick={handleCancelEdit}
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                className="btn-save-edit"
                onClick={handleSaveEdit}
                disabled={isUpdating || !editContent.trim()}
              >
                {isUpdating ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {renderContent()}
            {comment.fileRecords && comment.fileRecords.length > 0 && (
              <div className="comment-media">
                {comment.fileRecords.map((file, idx) => {
                  const src = file.url || file.fileUrl;
                  const isVideo =
                    file.fileType?.startsWith('video') ||
                    (file.resourceType === 'video') ||
                    (file.type || '').startsWith('video');
                  return (
                    <div key={idx} className="comment-media-item">
                      {isVideo ? (
                        <video src={src} controls preload="metadata" />
                      ) : (
                        <img src={src} alt={`comment media ${idx + 1}`} loading="lazy" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
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
            placeholder={`Reply to ${comment.user?.fullName || comment.user?.username || 'this comment'}`}
            autoFocus={true}
          />
        </div>
      )}

      {showReplies && (comment.id || comment.commentId) && (
        <CommentReplies
          commentId={comment.id || comment.commentId}
          postId={postId}
          onReplyCreated={handleReplyCreated}
          parentAuthorName={comment.user?.fullName || comment.user?.username}
          initialReplies={pendingReplies}
        />
      )}
    </div>
  );
};

export default CommentItem;


