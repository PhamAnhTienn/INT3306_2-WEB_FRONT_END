import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSpinner, FaBell } from 'react-icons/fa';
import { notificationsAPI } from '../../services/notifications/notificationsService';
import NotificationItem from './NotificationItem';
import './NotificationDropdown.css';

const NotificationDropdown = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [cursor, setCursor] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const fetchNotifications = async ({ reset = false } = {}) => {
    try {
      if (reset) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const response = await notificationsAPI.getMyNotifications({
        cursor: reset ? null : cursor,
        limit: 10,
      });

      if (response.success && response.data) {
        const page = response.data;
        const items = page.notificationDTOS || page.notifications || [];

        setNotifications((prev) =>
          reset ? items : [...prev, ...items]
        );
        setCursor(page.nextCursor || null);
        setHasNext(page.hasNext || false);

        // Update unread count using unread notifications in the entire response
        const unread = items.filter((n) => !n.readStatus).length;
        setUnreadCount((prev) => (reset ? unread : prev + unread));
      } else {
        setError(response.message || 'Failed to load notifications');
      }
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Load first page when dropdown opens
      fetchNotifications({ reset: true });
    }
  }, [isOpen]);

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readStatus: true }))
      );
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const buildFrontendPath = (redirectInfo, fallback) => {
    if (!redirectInfo) return fallback || '/';

    const type = redirectInfo.relatedType;
    const eventId = redirectInfo.eventId || redirectInfo.relatedId;

    switch (type) {
      case 'POST':
      case 'COMMENT':
      case 'LIKE':
        // Đưa volunteer đến event feed, nơi có post/comment
        if (eventId) {
          return `/volunteer/events/${eventId}/feed`;
        }
        break;
      case 'EVENT':
        // Mặc định cho manager xem chi tiết sự kiện
        if (eventId) {
          return `/manager/events/${eventId}`;
        }
        break;
      case 'REGISTRATION':
        // Đưa manager đến trang event để xem đăng ký
        if (eventId) {
          return `/manager/events/${eventId}`;
        }
        break;
      default:
        break;
    }

    // Nếu không map được, dùng redirectPath backend (nếu có) hoặc fallback
    return (
      redirectInfo.redirectPath ||
      redirectInfo.path ||
      fallback ||
      '/'
    );
  };

  const handleItemClick = async (notification) => {
    try {
      await notificationsAPI.markAsRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, readStatus: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      const redirectRes = await notificationsAPI.getRedirectInfo(
        notification.id
      );
      if (redirectRes.success && redirectRes.data) {
        const redirectInfo = redirectRes.data;
        const appPath = buildFrontendPath(redirectInfo, '/');
        navigate(appPath);
        onClose?.();
      }
    } catch (err) {
      // ignore, but keep UI responsive
    }
  };

  if (!isOpen) return null;

  return (
    <div className="notification-dropdown">
      <div className="notification-dropdown-header">
        <div className="title">
          <FaBell />
          <span>Notifications</span>
        </div>
        {unreadCount > 0 && (
          <button
            className="mark-all-btn"
            onClick={handleMarkAllAsRead}
          >
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="notification-dropdown-loading">
          <FaSpinner className="spinning" />
          <span>Loading...</span>
        </div>
      ) : error ? (
        <div className="notification-dropdown-error">{error}</div>
      ) : notifications.length === 0 ? (
        <div className="notification-dropdown-empty">
          <p>No notifications yet.</p>
        </div>
      ) : (
        <div className="notification-dropdown-list">
          {notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onClick={() => handleItemClick(n)}
            />
          ))}
        </div>
      )}

      {hasNext && !loading && (
        <button
          className="notification-load-more"
          onClick={() => fetchNotifications({ reset: false })}
          disabled={loadingMore}
        >
          {loadingMore ? (
            <>
              <FaSpinner className="spinning" /> <span>Loading...</span>
            </>
          ) : (
            'View older notifications'
          )}
        </button>
      )}
    </div>
  );
};

export default NotificationDropdown;


