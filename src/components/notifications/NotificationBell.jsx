import { useState, useEffect, useRef } from 'react';
import { FaBell } from 'react-icons/fa';
import { notificationsAPI } from '../../services/notifications/notificationsService';
import NotificationDropdown from './NotificationDropdown';
import './NotificationBell.css';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef(null);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsAPI.getMyNotifications({
        cursor: null,
        limit: 20,
      });
      if (response.success && response.data) {
        const page = response.data;
        const items = page.notificationDTOS || page.notifications || [];
        const unread = items.filter((n) => !n.readStatus).length;
        setUnreadCount(unread);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        bellRef.current &&
        !bellRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleDropdownClose = () => {
    setIsOpen(false);
    fetchUnreadCount();
  };

  return (
    <div className="notification-bell-wrapper" ref={bellRef}>
      <button
        className="navbar-action-btn notification-bell-btn"
        onClick={handleToggle}
        title="Notifications"
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationDropdown
        isOpen={isOpen}
        onClose={handleDropdownClose}
      />
    </div>
  );
};

export default NotificationBell;



