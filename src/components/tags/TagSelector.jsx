import React, { useState, useMemo } from 'react';
import { FaTag, FaSpinner, FaSearch } from 'react-icons/fa';
import './TagSelector.css';

/**
 * TagSelector
 * Reusable tag selector with chip-style UI and search functionality
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
  const [searchTerm, setSearchTerm] = useState('');

  // Filter tags based on search term
  const filteredTags = useMemo(() => {
    if (!searchTerm.trim()) {
      return availableTags;
    }
    const searchLower = searchTerm.toLowerCase().trim();
    return availableTags.filter((tag) => {
      const name = (tag.name || tag).toLowerCase();
      return name.includes(searchLower);
    });
  }, [availableTags, searchTerm]);

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
        <>
          {/* Search Input */}
          {availableTags.length > 0 && (
            <div className="tag-selector-search">
              <FaSearch className="tag-selector-search-icon" />
              <input
                type="text"
                className="tag-selector-search-input"
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="tag-selector-search-clear"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          )}

          {/* Tags Container */}
          <div className="tag-selector-container">
            {filteredTags.length === 0 ? (
              <p className="tag-selector-empty">
                {searchTerm ? `No tags found matching "${searchTerm}"` : 'No tags available'}
              </p>
            ) : (
              filteredTags.map((tag) => {
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

          {/* Show count if searching */}
          {searchTerm && filteredTags.length > 0 && (
            <div className="tag-selector-count">
              Showing {filteredTags.length} of {availableTags.length} tags
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TagSelector;














