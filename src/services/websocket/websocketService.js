import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

class WebSocketService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.subscriptions = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
  }

  /**
   * Connect to WebSocket server
   * @param {string} token - JWT token for authentication
   * @param {Function} onConnect - Callback when connected
   * @param {Function} onError - Callback when error occurs
   */
  connect(token, onConnect, onError) {
    if (this.isConnected) {
      console.log('WebSocket already connected, calling onConnect callback');
      if (onConnect) {
        onConnect();
      }
      return;
    }

    // Create SockJS connection
    const socket = new SockJS(WS_URL);
    
    // Prepare connect headers with authorization token
    const connectHeaders = {};
    if (token) {
      connectHeaders.Authorization = `Bearer ${token}`;
    }
    
    // Create STOMP client
    this.client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: connectHeaders,
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        if (import.meta.env.DEV) {
          console.log('STOMP:', str);
        }
      },
      onConnect: (frame) => {
        console.log('WebSocket connected:', frame);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        if (onConnect) {
          onConnect();
        }
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        this.isConnected = false;
        if (onError) {
          onError(frame);
        }
      },
      onWebSocketClose: () => {
        console.log('WebSocket closed');
        this.isConnected = false;
        this.subscriptions.clear();
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.subscriptions.clear();
      },
    });

    // Start connection
    this.client.activate();
  }

  /**
   * Subscribe to a destination
   * @param {string} destination - Destination path (e.g., '/user/queue/notifications')
   * @param {Function} callback - Callback function to handle messages
   * @returns {Function} Unsubscribe function
   */
  subscribe(destination, callback) {
    if (!this.client || !this.isConnected) {
      console.warn('WebSocket not connected. Cannot subscribe to:', destination);
      return () => {};
    }

    // Check if already subscribed
    if (this.subscriptions.has(destination)) {
      console.warn('Already subscribed to:', destination);
      return this.subscriptions.get(destination).unsubscribe;
    }

    const subscription = this.client.subscribe(destination, (message) => {
      try {
        console.log('Raw WebSocket message received:', message.body);
        const data = JSON.parse(message.body);
        console.log('Parsed WebSocket message:', data);
        
        // Handle both direct DTO and wrapped in ApiResponse format
        let commentData = data;
        if (data.data) {
          commentData = data.data;
        } else if (data.success && data.data) {
          commentData = data.data;
        }
        
        if (callback) {
          callback(commentData);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error, message.body);
      }
    });

    const unsubscribe = () => {
      if (subscription) {
        subscription.unsubscribe();
        this.subscriptions.delete(destination);
      }
    };

    this.subscriptions.set(destination, { subscription, unsubscribe });
    console.log('Subscribed to:', destination);

    return unsubscribe;
  }

  /**
   * Unsubscribe from a destination
   * @param {string} destination - Destination path
   */
  unsubscribe(destination) {
    const sub = this.subscriptions.get(destination);
    if (sub) {
      sub.unsubscribe();
      this.subscriptions.delete(destination);
      console.log('Unsubscribed from:', destination);
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.client) {
      // Unsubscribe from all destinations
      this.subscriptions.forEach((sub) => {
        sub.unsubscribe();
      });
      this.subscriptions.clear();

      // Deactivate client
      this.client.deactivate();
      this.isConnected = false;
      console.log('WebSocket disconnected');
    }
  }

  /**
   * Send message to a destination
   * @param {string} destination - Destination path
   * @param {Object} body - Message body
   */
  send(destination, body) {
    if (!this.client || !this.isConnected) {
      console.warn('WebSocket not connected. Cannot send message');
      return;
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  /**
   * Check if WebSocket is connected
   * @returns {boolean}
   */
  getConnected() {
    return this.isConnected;
  }
}

// Export singleton instance
const websocketService = new WebSocketService();
export default websocketService;

