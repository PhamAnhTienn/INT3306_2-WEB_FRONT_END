import React from 'react';
import { FaTag, FaSpinner } from 'react-icons/fa';
import './TagSelector.css';

/**
 * TagSelector
 * Reusable tag selector with chip-style UI
 *
 * Props:
 * - label?: string
 * - availableTags: Array<{ id?: number|string, name: string }>
 * - selectedTags: string[]            // list of selected tag names
 * - onToggle: (tagName: string) => void
 * - loading?: boolean
 * - error?: string
 */
const TagSelector = ({
  label = 'Tags',
  availableTags = [],
  selectedTags = [],
  onToggle,
  loading = false,
  error,
}) => {
  return (
    <div className="tag-selector">
      <label className="tag-selector-label">
        <FaTag />
        {label}
      </label>

      {error && <div className="tag-selector-error">{error}</div>}

      {loading ? (
        <div className="tag-selector-loading">
          <FaSpinner className="spinning" />
          <span>Loading tags...</span>
        </div>
      ) : (
        <div className="tag-selector-container">
          {availableTags.length === 0 ? (
            <p className="tag-selector-empty">No tags available</p>
          ) : (
            availableTags.map((tag) => {
              const name = tag.name || tag;
              const isSelected = selectedTags.includes(name);
              return (
                <button
                  key={tag.id || name}
                  type="button"
                  className={`tag-chip ${isSelected ? 'selected' : ''}`}
                  onClick={() => onToggle && onToggle(name)}
                >
                  {name}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default TagSelector;













