import { useState, useEffect, useRef } from 'react';
import { FaBell } from 'react-icons/fa';
import { notificationsAPI } from '../../services/notifications/notificationsService';
import websocketService from '../../services/websocket/websocketService';
import { useAuth } from '../../hooks/useAuth';
import NotificationDropdown from './NotificationDropdown';
import './NotificationBell.css';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showBadge, setShowBadge] = useState(true); // Badge visibility (hidden when clicked)
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef(null);
  const { user } = useAuth();

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
        // Always show badge if there are unread notifications (ignore showBadge state when fetching from server)
        setShowBadge(unread > 0);
      }
    } catch {
      // ignore
    }
  };

  // Initialize WebSocket connection and subscribe to notifications
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    let unsubscribeNotifications = null;
    let unsubscribeNotification = null;

    // Fetch initial unread count first
    fetchUnreadCount();

    // Connect to WebSocket
    websocketService.connect(
      token,
      () => {
        console.log('WebSocket connected for notifications');
        
        // Subscribe to notifications
        unsubscribeNotifications = websocketService.subscribe(
          '/user/queue/notifications',
          (notification) => {
            console.log('New notification received:', notification);
            // Immediately increment unread count
            setUnreadCount((prev) => {
              const newCount = prev + 1;
              // Always show badge when new notification arrives
              setShowBadge(true);
              return newCount;
            });
            // Show toast notification
            if (window.showNotificationToast && notification) {
              window.showNotificationToast(notification);
            }
          }
        );

        // Also subscribe to /user/queue/notification (singular) for backward compatibility
        unsubscribeNotification = websocketService.subscribe(
          '/user/queue/notification',
          (notification) => {
            console.log('New notification received (singular):', notification);
            // Immediately increment unread count
            setUnreadCount((prev) => {
              const newCount = prev + 1;
              // Always show badge when new notification arrives
              setShowBadge(true);
              return newCount;
            });
            // Show toast notification
            if (window.showNotificationToast && notification) {
              window.showNotificationToast(notification);
            }
          }
        );
      },
      (error) => {
        console.error('WebSocket connection error:', error);
      }
    );

    // Cleanup on unmount
    return () => {
      if (unsubscribeNotifications) {
        unsubscribeNotifications();
      }
      if (unsubscribeNotification) {
        unsubscribeNotification();
      }
    };
  }, [user]);

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
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    // Hide badge temporarily when opening dropdown (but keep unreadCount)
    // Badge will reappear if new notifications arrive or on reload
    if (newIsOpen) {
      setShowBadge(false);
    }
  };

  const handleDropdownClose = () => {
    setIsOpen(false);
    // Always refetch unread count when closing dropdown to ensure accuracy
    fetchUnreadCount();
  };

  const handleNotificationRead = () => {
    // Update unread count when notification is marked as read
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  // Refetch unread count when dropdown closes to ensure accuracy
  useEffect(() => {
    if (!isOpen) {
      // Small delay to ensure backend has processed the read status
      const timer = setTimeout(() => {
        fetchUnreadCount();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <div className="notification-bell-wrapper" ref={bellRef}>
      <button
        className="navbar-action-btn notification-bell-btn"
        onClick={handleToggle}
        title="Notifications"
      >
        <FaBell />
        {unreadCount > 0 && showBadge && (
          <span className="notification-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationDropdown
        isOpen={isOpen}
        onClose={handleDropdownClose}
        onNotificationRead={handleNotificationRead}
        onNewNotification={(notification) => {
          // Handle new notification from WebSocket
          setUnreadCount((prev) => prev + 1);
          setShowBadge(true);
        }}
      />
    </div>
  );
};

export default NotificationBell;









