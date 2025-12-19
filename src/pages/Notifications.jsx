import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaSpinner, FaCheck, FaCheckDouble } from 'react-icons/fa';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { notificationsAPI } from '../services/notifications/notificationsService';
import NotificationItem from '../components/notifications/NotificationItem';
import './Notifications.css';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [markingAsRead, setMarkingAsRead] = useState(null);
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);

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
        limit: 20,
      });

      if (response.success && response.data) {
        const page = response.data;
        const items = page.notificationDTOS || page.notifications || [];

        setNotifications((prev) => (reset ? items : [...prev, ...items]));
        setCursor(page.nextCursor || null);
        setHasNext(page.hasNext || false);
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
    fetchNotifications({ reset: true });
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    if (markingAsRead === notificationId) return;

    try {
      setMarkingAsRead(notificationId);
      await notificationsAPI.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, readStatus: true } : n
        )
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
    } finally {
      setMarkingAsRead(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (markingAllAsRead) return;

    try {
      setMarkingAllAsRead(true);
      await notificationsAPI.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readStatus: true }))
      );
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    } finally {
      setMarkingAllAsRead(false);
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
        if (eventId) {
          return `/volunteer/events/${eventId}/feed`;
        }
        break;
      case 'EVENT':
        if (eventId) {
          return `/manager/events/${eventId}`;
        }
        break;
      case 'REGISTRATION':
        if (eventId) {
          return `/manager/events/${eventId}`;
        }
        break;
      default:
        break;
    }

    return (
      redirectInfo.redirectPath ||
      redirectInfo.path ||
      fallback ||
      '/'
    );
  };

  const handleItemClick = async (notification) => {
    try {
      await handleMarkAsRead(notification.id);

      const redirectRes = await notificationsAPI.getRedirectInfo(
        notification.id
      );
      if (redirectRes.success && redirectRes.data) {
        const redirectInfo = redirectRes.data;
        const appPath = buildFrontendPath(redirectInfo, '/');
        navigate(appPath);
      }
    } catch (err) {
      console.error('Failed to redirect:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.readStatus).length;

  return (
    <DashboardLayout
      userRole="volunteer"
      title="Notifications"
      breadcrumbs={['Pages', 'Notifications']}
    >
      <div className="notifications-page">
        <div className="notifications-header">
          <div className="header-left">
            <h2>
              <FaBell /> Notifications
            </h2>
            <p className="page-subtitle">
              {notifications.length > 0
                ? `${notifications.length} total, ${unreadCount} unread`
                : 'No notifications'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              className="btn btn-primary"
              onClick={handleMarkAllAsRead}
              disabled={markingAllAsRead}
            >
              {markingAllAsRead ? (
                <>
                  <FaSpinner className="spinning" /> Marking...
                </>
              ) : (
                <>
                  <FaCheckDouble /> Mark all as read
                </>
              )}
            </button>
          )}
        </div>

        {loading ? (
          <div className="notifications-loading">
            <FaSpinner className="spinning" />
            <p>Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="notifications-error">
            <p>⚠️ {error}</p>
            <button className="btn btn-primary" onClick={() => fetchNotifications({ reset: true })}>
              Retry
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="notifications-empty">
            <FaBell />
            <h3>No notifications</h3>
            <p>You don't have any notifications yet.</p>
          </div>
        ) : (
          <>
            <div className="notifications-list">
              {notifications.map((notification) => (
                <div key={notification.id} className="notification-item-wrapper">
                  <NotificationItem
                    notification={notification}
                    onClick={() => handleItemClick(notification)}
                  />
                  {!notification.readStatus && (
                    <button
                      className="mark-read-btn"
                      onClick={() => handleMarkAsRead(notification.id)}
                      disabled={markingAsRead === notification.id}
                      title="Mark as read"
                    >
                      {markingAsRead === notification.id ? (
                        <FaSpinner className="spinning" />
                      ) : (
                        <FaCheck />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {hasNext && (
              <div className="notifications-load-more">
                <button
                  className="btn btn-secondary"
                  onClick={() => fetchNotifications({ reset: false })}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <FaSpinner className="spinning" /> Loading...
                    </>
                  ) : (
                    'Load more notifications'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notifications;













