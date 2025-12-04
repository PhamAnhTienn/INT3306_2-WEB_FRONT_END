import { FaBell } from 'react-icons/fa';
import './NotificationItem.css';

const formatTimeAgo = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

const NotificationItem = ({ notification, onClick }) => {
  const isRead = notification.readStatus;

  return (
    <button
      className={`notification-item ${isRead ? 'read' : 'unread'}`}
      onClick={onClick}
    >
      <div className="notification-icon-wrapper">
        <FaBell className="notification-icon" />
        {!isRead && <span className="notification-dot" />}
      </div>

      <div className="notification-content">
        <div className="notification-title-row">
          <span className="notification-title">{notification.title}</span>
        </div>
        <p className="notification-message">{notification.message}</p>
        <span className="notification-time">
          {formatTimeAgo(notification.createdAt)}
        </span>
      </div>
    </button>
  );
};

export default NotificationItem;



