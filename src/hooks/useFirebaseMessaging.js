import { useEffect, useState } from 'react';
import { requestPermission, onMessageListener, getMessagingInstance } from '../config/firebase';
import { getToken } from 'firebase/messaging';

/**
 * Hook để sử dụng Firebase Cloud Messaging
 * @returns {Object} { fcmToken, notification, requestToken, permissionStatus }
 */
export const useFirebaseMessaging = () => {
  const [fcmToken, setFcmToken] = useState(null);
  const [notification, setNotification] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('default');

  // Function để lấy token (không request permission)
  const getTokenOnly = async () => {
    try {
      const messaging = await getMessagingInstance();
      if (!messaging) return null;
      
      const vapidKey = "BJ-nvxaLLW82M9_eLdRAIA1aB-0vONY8WJ18petZrIadiyuJKvrVhcQ5cxU-QCV4dgrtZZaxON5Z1bwzx_JubU0";
      const token = await getToken(messaging, { vapidKey });
      if (token) {
        setFcmToken(token);
        return token;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
    }
    return null;
  };

  // Kiểm tra permission status khi component mount
  useEffect(() => {
    if ('Notification' in window) {
      const currentPermission = Notification.permission;
      setPermissionStatus(currentPermission);
      
      // Chỉ tự động lấy token nếu permission đã được granted
      if (currentPermission === 'granted') {
        getTokenOnly();
      }
    }
  }, []);

  // Request permission và lấy token
  const requestToken = async () => {
    const result = await requestPermission();
    if (result.token) {
      setFcmToken(result.token);
      setPermissionStatus('granted');
      return result.token;
    } else {
      // Cập nhật permission status
      if ('Notification' in window) {
        setPermissionStatus(Notification.permission);
      }
      // Throw error với thông tin chi tiết
      throw new Error(result.error || 'permission_denied', {
        cause: {
          error: result.error,
          isBlocked: result.isBlocked || false,
          details: result.details
        }
      });
    }
  };

  // Lắng nghe foreground messages
  useEffect(() => {
    let unsubscribe = () => {};

    // Setup message listener với callback
    const setupListener = async () => {
      unsubscribe = await onMessageListener((payload) => {
        if (payload) {
          setNotification(payload);
          // Hiển thị notification thủ công khi app đang foreground
          if (payload.notification && 'Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(payload.notification.title, {
              body: payload.notification.body,
              icon: payload.notification.icon || '/vite.svg',
              badge: '/vite.svg',
              tag: payload.data?.tag || 'default',
              data: payload.data || {},
            });
            
            // Handle notification click
            notification.onclick = function(event) {
              event.preventDefault();
              window.focus();
              
              // Navigate dựa trên notification data
              const data = payload.data || {};
              if (data.type === 'REGISTRATION_APPROVED' || data.type === 'REGISTRATION_REJECTED') {
                if (data.eventId) {
                  window.location.href = `/volunteer/events/${data.eventId}/feed`;
                } else {
                  window.location.href = '/volunteer/events';
                }
              } else if (data.type === 'EVENT_APPROVED') {
                if (data.eventId) {
                  window.location.href = `/manager/events/${data.eventId}`;
                } else {
                  window.location.href = '/manager/events';
                }
              } else if (data.url) {
                window.location.href = data.url;
              }
              
              notification.close();
            };
          }
        }
      });
    };

    setupListener();

    // Lắng nghe message từ service worker (khi click notification từ background)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
          const { url } = event.data;
          if (url) {
            window.location.href = url;
          }
        }
      });
    }

    // Cleanup khi component unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return {
    fcmToken,
    notification,
    requestToken,
    permissionStatus,
  };
};

