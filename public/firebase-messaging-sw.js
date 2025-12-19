// Import Firebase scripts từ CDN (Service Worker không thể dùng ES6 imports)
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

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
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages
const messaging = firebase.messaging();

// Nhận notification khi web đang background
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'Background Message Title';
  const notificationOptions = {
    body: payload.notification?.body || 'Background Message body.',
    icon: payload.notification?.icon || '/vite.svg',
    badge: '/vite.svg',
    image: payload.notification?.image,
    data: payload.data || {},
    tag: payload.data?.tag || 'default',
    requireInteraction: false,
    silent: false
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  console.log('[firebase-messaging-sw.js] Notification click received.', event.notification.data);
  
  event.notification.close();
  
  // Xác định URL để navigate dựa trên notification data
  let urlToOpen = '/';
  const data = event.notification.data || {};
  
  // Navigate dựa trên type của notification
  if (data.type === 'REGISTRATION_APPROVED' || data.type === 'REGISTRATION_REJECTED') {
    // Navigate đến trang My Events hoặc event detail
    if (data.eventId) {
      urlToOpen = `/volunteer/events/${data.eventId}/feed`;
    } else {
      urlToOpen = '/volunteer/events';
    }
  } else if (data.type === 'EVENT_APPROVED') {
    // Navigate đến event detail
    if (data.eventId) {
      urlToOpen = `/manager/events/${data.eventId}`;
    } else {
      urlToOpen = '/manager/events';
    }
  } else if (data.url) {
    // Sử dụng URL từ data nếu có
    urlToOpen = data.url;
  }
  
  // Mở hoặc focus vào app khi click notification
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Tìm window đang mở với cùng origin
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        // Kiểm tra nếu client đang ở cùng origin
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          // Focus vào window hiện tại
          // App sẽ tự động navigate dựa trên notification data khi được focus
          client.focus();
          // Gửi message để app navigate
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            data: data,
            url: urlToOpen
          });
          return;
        }
      }
      // Nếu chưa có window mở, mở window mới với URL
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});


