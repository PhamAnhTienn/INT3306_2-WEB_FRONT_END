import { useState, useRef, useEffect } from 'react';
import { FaEllipsisV, FaEdit, FaTrash } from 'react-icons/fa';
import './CommentMenu.css';

const CommentMenu = ({ onEdit, onDelete, disabled = false }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleEdit = () => {
    setShowMenu(false);
    if (onEdit) onEdit();
  };

  const handleDelete = () => {
    setShowMenu(false);
    if (onDelete) onDelete();
  };

  return (
    <div className="comment-menu" ref={menuRef}>
      <button
        className="btn-comment-menu"
        onClick={() => setShowMenu(!showMenu)}
        disabled={disabled}
        title="More options"
      >
        <FaEllipsisV />
      </button>

      {showMenu && (
        <div className="comment-menu-dropdown">
          <button className="comment-menu-item" onClick={handleEdit}>
            <FaEdit />
            <span>Edit</span>
          </button>
          <button className="comment-menu-item comment-menu-item-danger" onClick={handleDelete}>
            <FaTrash />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentMenu;

