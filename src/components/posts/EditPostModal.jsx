import { useState, useEffect } from 'react';
import { FaTimes, FaCloudUploadAlt, FaSpinner } from 'react-icons/fa';
import { postsAPI } from '../../services/posts/postsService';
import './EditPostModal.css';

const EditPostModal = ({ post, onClose, onUpdated }) => {
  const [content, setContent] = useState(post?.content || '');
  const [existingFiles, setExistingFiles] = useState([]);
  const [removedIds, setRemovedIds] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const media = post?.files || post?.fileRecords || [];
    setExistingFiles(media);
  }, [post]);

  const handleRemoveExisting = (id) => {
    setRemovedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setExistingFiles((prev) => prev.filter((f) => (f.id || f.fileId) !== id));
  };

  const handleAddFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setNewFiles((prev) => [...prev, ...files]);
    const previews = files.map((file) => URL.createObjectURL(file));
    setNewPreviews((prev) => [...prev, ...previews]);
  };

  const handleRemoveNew = (idx) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    const hasContentChange = content !== undefined;
    const hasNewFiles = newFiles.length > 0;
    const hasRemovals = removedIds.length > 0;
    if (!hasContentChange && !hasNewFiles && !hasRemovals) {
      onClose();
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const resp = await postsAPI.updatePostWithFiles(
        post.id || post.postId,
        { content },
        newFiles,
        removedIds
      );
      if (resp.success) {
        onUpdated && onUpdated(resp.data);
        onClose();
      } else {
        setError(resp.message || 'Failed to update post');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update post');
    } finally {
      setSubmitting(false);
    }
  };

  if (!post) return null;

  return (
    <div className="edit-post-modal-backdrop" onClick={onClose}>
      <div className="edit-post-modal" onClick={(e) => e.stopPropagation()}>
        <div className="edit-post-modal-header">
          <h3>Edit Post</h3>
          <button className="edit-post-close" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>

        <div className="edit-post-body">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            maxLength={5000}
            disabled={submitting}
            placeholder="Update your post..."
          />

          {error && <div className="edit-post-error">{error}</div>}

          {existingFiles.length > 0 && (
            <div className="edit-post-media">
              {existingFiles.map((file, idx) => {
                const src = file.url || file.fileUrl;
                const isVideo =
                  file.fileType?.startsWith('video') ||
                  file.resourceType === 'video' ||
                  (file.type || '').startsWith('video');
                return (
                  <div key={idx} className="edit-post-media-item">
                    {isVideo ? (
                      <video src={src} controls />
                    ) : (
                      <img src={src} alt={`Media ${idx + 1}`} />
                    )}
                    <button
                      type="button"
                      className="edit-post-remove"
                      onClick={() => handleRemoveExisting(file.id || file.fileId)}
                      disabled={submitting}
                    >
                      <FaTimes />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {newPreviews.length > 0 && (
            <div className="edit-post-media new-media">
              {newPreviews.map((url, idx) => (
                <div key={idx} className="edit-post-media-item">
                  {url.includes('video') ? (
                    <video src={url} controls />
                  ) : (
                    <img src={url} alt={`New media ${idx + 1}`} />
                  )}
                  <button
                    type="button"
                    className="edit-post-remove"
                    onClick={() => handleRemoveNew(idx)}
                    disabled={submitting}
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className="edit-post-upload">
            <FaCloudUploadAlt />
            <span>Add photos/videos</span>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleAddFiles}
              disabled={submitting}
              hidden
            />
          </label>
        </div>

        <div className="edit-post-footer">
          <button className="btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <FaSpinner className="spinning" /> Saving...
              </>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPostModal;

