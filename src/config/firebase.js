// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBVQDGUhvco5b4dHkvMgWxs-xCLnHhzgqU",
  authDomain: "volunteer-web-push.firebaseapp.com",
  projectId: "volunteer-web-push",
  storageBucket: "volunteer-web-push.firebasestorage.app",
  messagingSenderId: "597790395249",
  appId: "1:597790395249:web:1e35e4b8a47bc7597bc4d0",
  measurementId: "G-BNLKBHGDSV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (chỉ chạy trên browser)
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Initialize Firebase Cloud Messaging and get a reference to the service
let messaging = null;
let messagingInitialized = false;

// Function to initialize messaging after service worker is ready
const initializeMessaging = async () => {
  if (messagingInitialized || !('serviceWorker' in navigator)) {
    return messaging;
  }

  try {
    // Đợi service worker sẵn sàng
    const registration = await navigator.serviceWorker.ready;
    
    if (registration && !messaging) {
      // Khởi tạo messaging với service worker registration
      messaging = getMessaging(app, {
        serviceWorkerRegistration: registration
      });
      messagingInitialized = true;
      console.log('Firebase Messaging initialized successfully');
    }
  } catch (error) {
    console.error('Firebase messaging initialization error:', error);
  }
  
  return messaging;
};

// Tự động khởi tạo khi service worker sẵn sàng
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  // Đợi service worker đăng ký xong
  navigator.serviceWorker.ready.then(() => {
    initializeMessaging();
  }).catch((error) => {
    console.error('Service Worker not ready:', error);
  });
}

// Request permission và lấy FCM token
export const requestPermission = async () => {
  // Đảm bảo messaging đã được khởi tạo
  const messagingInstance = await initializeMessaging();
  
  if (!messagingInstance) {
    console.warn('Firebase messaging is not available');
    return { token: null, error: 'messaging_unavailable' };
  }

  // Kiểm tra xem browser có hỗ trợ Notification API không
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return { token: null, error: 'not_supported' };
  }

  try {
    // Kiểm tra permission hiện tại
    const currentPermission = Notification.permission;
    
    // Nếu đã bị denied, có thể là blocked vĩnh viễn
    if (currentPermission === 'denied') {
      console.warn('Notification permission is denied. User may need to reset in browser settings.');
      return { token: null, error: 'permission_denied', isBlocked: true };
    }

    // Request permission (chỉ hoạt động nếu permission là 'default')
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      
      // Lấy token với VAPID key
      const vapidKey = "BJ-nvxaLLW82M9_eLdRAIA1aB-0vONY8WJ18petZrIadiyuJKvrVhcQ5cxU-QCV4dgrtZZaxON5Z1bwzx_JubU0";
      
      try {
        const token = await getToken(messagingInstance, { vapidKey });
        if (token) {
          // Token lấy thành công, không log ra console để tránh lộ
          return { token, error: null };
        } else {
          console.log('No registration token available.');
          return { token: null, error: 'no_token' };
        }
      } catch (tokenError) {
        console.error('Error getting FCM token:', tokenError);
        return { token: null, error: 'token_error', details: tokenError.message };
      }
    } else if (permission === 'denied') {
      console.warn('Notification permission denied by user.');
      return { token: null, error: 'permission_denied', isBlocked: true };
    } else {
      console.log('Notification permission dismissed.');
      return { token: null, error: 'permission_dismissed' };
    }
  } catch (error) {
    // Nếu error message chứa "permanently" hoặc "blocked", có nghĩa là bị block vĩnh viễn
    const errorMessage = error.message?.toLowerCase() || '';
    const isPermanentlyBlocked = errorMessage.includes('permanently') || 
                                 errorMessage.includes('blocked') ||
                                 errorMessage.includes('ignored');
    
    console.error('An error occurred while requesting permission:', error);
    return { 
      token: null, 
      error: isPermanentlyBlocked ? 'permission_blocked' : 'request_error',
      isBlocked: isPermanentlyBlocked,
      details: error.message 
    };
  }
};

// Lắng nghe foreground messages (khi app đang mở)
// onMessage trả về một unsubscribe function
export const onMessageListener = async (callback) => {
  const messagingInstance = await initializeMessaging();
  
  if (!messagingInstance) {
    console.warn('Firebase messaging is not available');
    return () => {}; // Return empty unsubscribe function
  }
  
  // onMessage tự động setup listener và trả về unsubscribe function
  return onMessage(messagingInstance, (payload) => {
    console.log('Message received in foreground:', payload);
    if (callback) {
      callback(payload);
    }
  });
};

// Export messaging getter function
export const getMessagingInstance = async () => {
  return await initializeMessaging();
};

export { app, analytics };
export default app;

