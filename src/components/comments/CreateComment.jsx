import { useState } from 'react';
import { FaPaperPlane, FaSpinner, FaImage, FaTimes } from 'react-icons/fa';
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
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const isUploading = isSubmitting && selectedFiles.length > 0;

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Limit to 3 files for comments
    const filesToAdd = files.slice(0, 3 - selectedFiles.length);
    
    setSelectedFiles(prev => [...prev, ...filesToAdd]);
    
    // Create preview URLs
    filesToAdd.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() && selectedFiles.length === 0) {
      setError('Please enter a comment or add a file');
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

      const response = await commentsAPI.createComment(postId, commentData, selectedFiles);

      if (response.success) {
        setContent('');
        setSelectedFiles([]);
        setPreviewUrls([]);
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
    setSelectedFiles([]);
    setPreviewUrls([]);
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
        
        {/* Image / Video Previews */}
        {previewUrls.length > 0 && (
          <div className="comment-image-previews">
            {previewUrls.map((url, index) => (
              <div key={index} className="comment-image-preview-item">
                {url.startsWith('data:video') ? (
                  <video src={url} controls />
                ) : (
                  <img src={url} alt={`Preview ${index + 1}`} />
                )}
                <button
                  type="button"
                  className="btn-remove-comment-preview"
                  onClick={() => handleRemoveFile(index)}
                  disabled={isSubmitting}
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="create-comment-actions">
          <div className="comment-action-left">
            <label className="btn-add-comment-files" style={{ opacity: isSubmitting || selectedFiles.length >= 3 ? 0.5 : 1 }}>
              <FaImage />
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileSelect}
                disabled={isSubmitting || selectedFiles.length >= 3}
                hidden
              />
            </label>
            <div className="char-count">
              {content.length}/1000
            </div>
          </div>
          {error && (
            <div className="create-comment-error">
              {error}
            </div>
          )}
          {isUploading && (
            <div className="create-comment-uploading">
              <FaSpinner className="spinning" />
              <span>Uploading media...</span>
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
              disabled={isSubmitting || (!content.trim() && selectedFiles.length === 0)}
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










