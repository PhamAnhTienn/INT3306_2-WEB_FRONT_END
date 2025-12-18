import React, { useRef, useState } from 'react';
import { FaCloudUploadAlt, FaTimes, FaCheckCircle } from 'react-icons/fa';
import './FileUpload.css';

/**
 * Reusable file upload component (UI only)
 *
 * Props:
 * - label?: string
 * - accept?: string                  // input accept attribute
 * - multiple?: boolean
 * - onFilesSelected?: (FileList|File[]) => void
 * - onClear?: () => void
 */
const FileUpload = ({
  label = 'Upload files',
  accept = 'image/*',
  multiple = false,
  onFilesSelected,
  onClear,
}) => {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleChange = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles(selected);
    if (onFilesSelected) {
      onFilesSelected(multiple ? selected : selected[0] || null);
    }
  };

  const handleClear = () => {
    setFiles([]);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    if (onClear) {
      onClear();
    }
  };

  return (
    <div className="file-upload">
      <label className="file-upload-label">{label}</label>

      <div className="file-upload-dropzone" onClick={handleClick}>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="file-upload-input"
        />
        <FaCloudUploadAlt className="file-upload-icon" />
        <p className="file-upload-text">
          Click to choose file{multiple ? 's' : ''} or drop them here
        </p>
        <p className="file-upload-hint">
          {multiple ? 'You can select multiple files' : 'Only one file allowed'}
        </p>
      </div>

      {files.length > 0 && (
        <div className="file-upload-list">
          <div className="file-upload-list-header">
            <span>
              <FaCheckCircle /> {files.length} file{files.length > 1 ? 's' : ''} selected
            </span>
            <button type="button" className="file-upload-clear" onClick={handleClear}>
              <FaTimes />
              Clear
            </button>
          </div>
          <ul>
            {files.map((file) => (
              <li key={file.name + file.size}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUpload;













