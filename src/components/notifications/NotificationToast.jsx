import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaComment, FaHeart, FaUserPlus, FaCheckCircle, FaTimesCircle, FaBell, FaFileAlt } from 'react-icons/fa';
import { notificationsAPI } from '../../services/notifications/notificationsService';
import './NotificationToast.css';

const NotificationToast = ({ notification, onClose, onRead }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 10);
    
    // Auto close after 5 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose?.();
    }, 300); // Match CSS transition duration
  };

  const handleClick = async () => {
    if (!notification || !notification.id) return;

    try {
      // Mark as read
      await notificationsAPI.markAsRead(notification.id);
      onRead?.();

      // Navigate to the related content
      const redirectRes = await notificationsAPI.getRedirectInfo(notification.id);
      if (redirectRes.success && redirectRes.data) {
        const redirectInfo = redirectRes.data;
        const type = redirectInfo.relatedType;
        const eventId = redirectInfo.eventId || redirectInfo.relatedId;

        let path = '/';
        switch (type) {
          case 'POST':
          case 'COMMENT':
          case 'LIKE':
            if (eventId) {
              path = `/volunteer/events/${eventId}/feed`;
            }
            break;
          case 'EVENT':
            if (eventId) {
              path = `/manager/events/${eventId}`;
            }
            break;
          case 'REGISTRATION':
            if (eventId) {
              path = `/manager/events/${eventId}`;
            }
            break;
          default:
            path = redirectInfo.redirectPath || redirectInfo.path || '/';
        }

        navigate(path);
      }
    } catch (err) {
      console.error('Error handling notification click:', err);
    }

    handleClose();
  };

  if (!notification) return null;

  const getIcon = () => {
    const title = notification.title?.toLowerCase() || '';
    const message = notification.message?.toLowerCase() || '';

    if (title.includes('comment') || message.includes('comment')) {
      return <FaComment className="toast-icon" />;
    }
    if (title.includes('like') || message.includes('like')) {
      return <FaHeart className="toast-icon" />;
    }
    if (title.includes('registration') || message.includes('registration')) {
      if (title.includes('approved') || message.includes('approved')) {
        return <FaCheckCircle className="toast-icon" />;
      }
      if (title.includes('rejected') || message.includes('rejected')) {
        return <FaTimesCircle className="toast-icon" />;
      }
      return <FaUserPlus className="toast-icon" />;
    }
    if (title.includes('post') || message.includes('post')) {
      return <FaFileAlt className="toast-icon" />;
    }
    return <FaBell className="toast-icon" />;
  };

  const getTypeClass = () => {
    const title = notification.title?.toLowerCase() || '';
    if (title.includes('approved')) return 'toast-success';
    if (title.includes('rejected')) return 'toast-error';
    return 'toast-info';
  };

  return (
    <div
      className={`notification-toast ${isVisible && !isExiting ? 'toast-visible' : 'toast-hidden'} ${getTypeClass()}`}
      onClick={handleClick}
    >
      <div className="toast-content">
        <div className="toast-icon-wrapper">
          {getIcon()}
        </div>
        <div className="toast-text">
          <div className="toast-title">{notification.title || 'Notification'}</div>
          <div className="toast-message">{notification.message || ''}</div>
        </div>
        <button
          className="toast-close-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          aria-label="Close notification"
        >
          <FaTimes />
        </button>
      </div>
      <div className="toast-progress-bar" />
    </div>
  );
};

export default NotificationToast;








