import { useState, useEffect } from 'react';
import { useFirebaseMessaging } from '../../hooks/useFirebaseMessaging';
import { FaBell, FaTimes, FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import './NotificationPermissionBanner.css';

/**
 * Banner để yêu cầu user enable notification permission
 * Chỉ hiển thị khi permission bị denied hoặc default
 */
const NotificationPermissionBanner = () => {
  const { permissionStatus, requestToken, fcmToken } = useFirebaseMessaging();
  const [isVisible, setIsVisible] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Chỉ hiển thị banner nếu permission chưa được granted
    // Và chưa có token
    if (permissionStatus !== 'granted' && !fcmToken) {
      // Kiểm tra xem đã ẩn banner chưa (localStorage)
      const bannerDismissed = localStorage.getItem('fcm-banner-dismissed');
      if (!bannerDismissed) {
        setIsVisible(true);
        // Kiểm tra nếu permission đã bị denied (có thể bị block)
        if (permissionStatus === 'denied') {
          setIsBlocked(true);
        }
      }
    } else {
      setIsVisible(false);
    }
  }, [permissionStatus, fcmToken]);

  const handleEnableNotifications = async () => {
    setIsRequesting(true);
    setErrorMessage('');
    try {
      const token = await requestToken();
      if (token) {
        setIsVisible(false);
        setIsBlocked(false);
        // Lưu vào localStorage để không hiện lại
        localStorage.setItem('fcm-banner-dismissed', 'true');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      const errorCause = error.cause || {};
      
      // Kiểm tra nếu bị block vĩnh viễn
      if (errorCause.isBlocked || errorCause.error === 'permission_blocked' || 
          errorCause.error === 'permission_denied') {
        setIsBlocked(true);
        setErrorMessage('Notifications have been blocked. Please reset in browser settings.');
      } else {
        setErrorMessage('Failed to enable notifications. Please try again.');
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Lưu vào localStorage để không hiện lại trong session này
    localStorage.setItem('fcm-banner-dismissed', 'true');
  };

  const getBrowserInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('chrome')) {
      return 'Click the lock icon (🔒) or info icon (ℹ️) in the address bar → Site settings → Notifications → Allow';
    } else if (userAgent.includes('firefox')) {
      return 'Click the lock icon (🔒) in the address bar → Permissions → Notifications → Allow';
    } else if (userAgent.includes('edge')) {
      return 'Click the lock icon (🔒) in the address bar → Permissions → Notifications → Allow';
    } else if (userAgent.includes('safari')) {
      return 'Safari → Preferences → Websites → Notifications → Find this site → Allow';
    }
    return 'Go to browser settings → Site permissions → Notifications → Allow for this site';
  };

  if (!isVisible) return null;

  return (
    <div className={`notification-permission-banner ${isBlocked ? 'blocked' : ''}`}>
      <div className="notification-permission-content">
        <div className={`notification-permission-icon ${isBlocked ? 'blocked-icon' : ''}`}>
          {isBlocked ? <FaExclamationTriangle /> : <FaBell />}
        </div>
        <div className="notification-permission-text">
          <h4>
            {isBlocked ? 'Notifications Blocked' : 'Enable Notifications'}
          </h4>
          {isBlocked ? (
            <div className="blocked-message">
              <p>
                Notifications have been blocked. To enable them, you need to reset the permission in your browser settings.
              </p>
              <div className="browser-instructions">
                <FaInfoCircle className="info-icon" />
                <span>{getBrowserInstructions()}</span>
              </div>
              {errorMessage && (
                <div className="error-message">
                  {errorMessage}
                </div>
              )}
            </div>
          ) : (
            <p>
              Get instant updates about events, registrations, and important announcements.
            </p>
          )}
        </div>
        <div className="notification-permission-actions">
          {!isBlocked && (
            <button
              className="notification-permission-enable"
              onClick={handleEnableNotifications}
              disabled={isRequesting}
            >
              {isRequesting ? (
                <>
                  <span className="spinner"></span>
                  Enabling...
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  Enable
                </>
              )}
            </button>
          )}
          <button
            className="notification-permission-dismiss"
            onClick={handleDismiss}
            aria-label="Dismiss"
          >
            <FaTimes />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPermissionBanner;

