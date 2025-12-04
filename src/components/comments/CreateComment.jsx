import { useState } from 'react';
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';
import { commentsAPI } from '../../services/comments/commentsService';
import './CreateComment.css';

const CreateComment = ({ 
  postId, 
  parentCommentId = null, 
  onCommentCreated, 
  onCancel,
  placeholder = "Write a comment...",
  autoFocus = false
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Please enter a comment');
      return;
    }

    if (content.length > 1000) {
      setError('Comment must not exceed 1000 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const commentData = {
        postId: postId,
        content: content.trim(),
        parentCommentId: parentCommentId,
      };

      const response = await commentsAPI.createComment(postId, commentData);

      if (response.success) {
        setContent('');
        if (onCommentCreated) {
          onCommentCreated(response.data);
        }
      } else {
        setError(response.message || 'Failed to create comment');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to create comment. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContent('');
    setError(null);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <form className="create-comment" onSubmit={handleSubmit}>
      <div className="create-comment-input-wrapper">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className="create-comment-input"
          rows={parentCommentId ? 2 : 3}
          maxLength={1000}
          disabled={isSubmitting}
          autoFocus={autoFocus}
        />
        <div className="create-comment-actions">
          <div className="char-count">
            {content.length}/1000
          </div>
          {error && (
            <div className="create-comment-error">
              {error}
            </div>
          )}
          <div className="create-comment-buttons">
            {onCancel && (
              <button
                type="button"
                className="btn-cancel-comment"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="btn-submit-comment"
              disabled={isSubmitting || !content.trim()}
            >
              {isSubmitting ? (
                <FaSpinner className="spinning" />
              ) : (
                <FaPaperPlane />
              )}
              <span>{parentCommentId ? 'Reply' : 'Comment'}</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CreateComment;



