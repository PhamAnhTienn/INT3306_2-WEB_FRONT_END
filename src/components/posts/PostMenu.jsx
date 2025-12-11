import { useState, useRef, useEffect } from 'react';
import { FaEllipsisV, FaEdit, FaTrash } from 'react-icons/fa';
import './PostMenu.css';

const PostMenu = ({ post, onEdit, onDelete, isOwner }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!isOwner) return null;

  return (
    <div className="post-menu" ref={menuRef}>
      <button className="post-menu-toggle" onClick={toggleMenu} aria-label="Post options">
        <FaEllipsisV />
      </button>
      {isOpen && (
        <div className="post-menu-dropdown">
          <button onClick={() => { onEdit(post); setIsOpen(false); }}>
            <FaEdit /> Edit
          </button>
          <button onClick={() => { onDelete(post.id || post.postId); setIsOpen(false); }}>
            <FaTrash /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default PostMenu;

