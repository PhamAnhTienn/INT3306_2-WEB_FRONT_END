import { useState, useEffect } from 'react';
import NotificationToast from './NotificationToast';
import './NotificationToastContainer.css';

const NotificationToastContainer = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { ...notification, toastId: id }]);
  };

  const removeNotification = (toastId) => {
    setNotifications((prev) => prev.filter((n) => n.toastId !== toastId));
  };

  const handleNotificationRead = () => {
    // This can be used to update unread count if needed
  };

  // Expose addNotification globally so it can be called from anywhere
  useEffect(() => {
    window.showNotificationToast = addNotification;
    return () => {
      delete window.showNotificationToast;
    };
  }, []);

  return (
    <div className="notification-toast-container">
      {notifications.map((notification, index) => (
        <div
          key={notification.toastId}
          className="toast-wrapper"
          style={{
            bottom: `${20 + index * 90}px`,
          }}
        >
          <NotificationToast
            notification={notification}
            onClose={() => removeNotification(notification.toastId)}
            onRead={handleNotificationRead}
          />
        </div>
      ))}
    </div>
  );
};

export default NotificationToastContainer;

