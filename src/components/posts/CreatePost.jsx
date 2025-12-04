import { useState } from 'react';
import { FaImage, FaTimes, FaSpinner } from 'react-icons/fa';
import { postsAPI } from '../../services/posts/postsService';
import './CreatePost.css';

const CreatePost = ({ eventId, onPostCreated, onCancel }) => {
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Limit to 5 files
    const filesToAdd = files.slice(0, 5 - selectedFiles.length);
    
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
      setError('Please enter content or add an image');
      return;
    }

    if (content.length > 5000) {
      setError('Content must not exceed 5000 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await postsAPI.createPost(
        eventId,
        { content: content.trim() },
        selectedFiles
      );

      if (response.success) {
        // Reset form
        setContent('');
        setSelectedFiles([]);
        setPreviewUrls([]);
        
        // Notify parent
        if (onPostCreated) {
          onPostCreated(response.data);
        }
      } else {
        setError(response.message || 'Failed to create post');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to create post. Please try again.';
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
    <div className="create-post">
      <form onSubmit={handleSubmit}>
        <div className="create-post-header">
          <h3>Create Post</h3>
          {onCancel && (
            <button
              type="button"
              className="btn-close"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              <FaTimes />
            </button>
          )}
        </div>

        <div className="create-post-body">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="create-post-textarea"
            rows={4}
            maxLength={5000}
            disabled={isSubmitting}
          />
          
          <div className="char-count">
            {content.length}/5000
          </div>

          {error && (
            <div className="create-post-error">
              {error}
            </div>
          )}

          {/* Image Previews */}
          {previewUrls.length > 0 && (
            <div className="image-previews">
              {previewUrls.map((url, index) => (
                <div key={index} className="image-preview-item">
                  <img src={url} alt={`Preview ${index + 1}`} />
                  <button
                    type="button"
                    className="btn-remove-preview"
                    onClick={() => handleRemoveFile(index)}
                    disabled={isSubmitting}
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="create-post-actions">
            <label className="btn-add-files" disabled={isSubmitting}>
              <FaImage />
              <span>Add Photos</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                disabled={isSubmitting || selectedFiles.length >= 5}
                hidden
              />
            </label>
            {selectedFiles.length > 0 && (
              <span className="files-count">
                {selectedFiles.length}/5 images
              </span>
            )}
          </div>
        </div>

        <div className="create-post-footer">
          <button
            type="button"
            className="btn-cancel"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-submit"
            disabled={isSubmitting || (!content.trim() && selectedFiles.length === 0)}
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="spinning" />
                <span>Posting...</span>
              </>
            ) : (
              'Post'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;



