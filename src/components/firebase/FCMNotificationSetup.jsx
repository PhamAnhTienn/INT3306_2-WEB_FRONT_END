import { useEffect, useState } from 'react';
import { useFirebaseMessaging } from '../../hooks/useFirebaseMessaging';
import { useAuth } from '../../hooks/useAuth';
import { firebaseAPI } from '../../services/firebase/firebaseService';
import NotificationPermissionBanner from './NotificationPermissionBanner';
import './FCMNotificationSetup.css';

/**
 * Component để setup và hiển thị trạng thái Firebase Cloud Messaging
 * Sử dụng component này trong App.jsx hoặc DashboardLayout để enable notifications
 */
const FCMNotificationSetup = () => {
  const { fcmToken, notification, permissionStatus } = useFirebaseMessaging();
  const { user } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState(null);

  // Detect device type
  const getDeviceType = () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    return isMobile ? 'MOBILE_WEB' : 'DESKTOP_WEB';
  };

  // Generate device ID (simple implementation)
  const getDeviceId = () => {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  };

  // Gửi token lên backend khi có token và user đã đăng nhập
  useEffect(() => {
    if (fcmToken && user && !isRegistering) {
      const registerToken = async () => {
        setIsRegistering(true);
        setRegistrationError(null);
        
        try {
          const tokenData = {
            token: fcmToken,
            deviceType: getDeviceType(),
            deviceId: getDeviceId(),
          };

          const response = await firebaseAPI.registerToken(tokenData);
          
          if (response.success) {
            console.log('✅ FCM token registered successfully:', response.data);
            // Clear any previous errors
            setRegistrationError(null);
          } else {
            throw new Error(response.message || 'Failed to register token');
          }
        } catch (error) {
          console.error('❌ Error registering FCM token:', error);
          setRegistrationError(error.response?.data?.message || error.message || 'Failed to register token');
        } finally {
          setIsRegistering(false);
        }
      };

      registerToken();
    }
  }, [fcmToken, user]);

  useEffect(() => {
    if (notification) {
      console.log('📬 New notification received:', notification);
      // Xử lý notification ở đây nếu cần
      // Có thể hiển thị toast notification, update UI, etc.
    }
  }, [notification]);

  return (
    <>
      {/* Banner để request notification permission */}
      <NotificationPermissionBanner />
      
      {/* Debug info (chỉ hiện trong development) */}
      {import.meta.env.DEV && fcmToken && (
        <div style={{ 
          position: 'fixed', 
          bottom: '10px', 
          left: '10px', 
          background: '#f0f0f0', 
          padding: '10px', 
          borderRadius: '5px',
          fontSize: '12px',
          zIndex: 9999,
          maxWidth: '300px'
        }}>
          <div>✅ FCM Token: {fcmToken.substring(0, 20)}...</div>
          {isRegistering && <div>⏳ Registering...</div>}
          {registrationError && <div style={{ color: 'red' }}>❌ {registrationError}</div>}
          {!isRegistering && !registrationError && user && <div>✅ Token registered</div>}
        </div>
      )}
    </>
  );
};

export default FCMNotificationSetup;

