class WebSocketService {
  static instance = null;
  callbacks = {};

  static getInstance() {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  constructor() {
    this.socketRef = null;
  }

  connect() {
    const path = 'ws://localhost:8000/ws/notifications/';
    this.socketRef = new WebSocket(path);
    
    this.socketRef.onopen = () => {
      console.log('WebSocket open');
    };
    
    this.socketRef.onmessage = e => {
      this.socketNewMessage(e.data);
    };
    
    this.socketRef.onerror = e => {
      console.log(e.message);
    };
    
    this.socketRef.onclose = () => {
      console.log("WebSocket closed, trying to reconnect...");
      setTimeout(() => {
        this.connect();
      }, 1000);
    };
  }

  socketNewMessage(data) {
    const parsedData = JSON.parse(data);
    const command = parsedData.message;
    
    if (Object.keys(this.callbacks).length === 0) {
      return;
    }
    
    Object.keys(this.callbacks).forEach(key => {
      this.callbacks[key](command);
    });
  }

  addCallbacks(newNotificationCallback) {
    this.callbacks['new-notification'] = newNotificationCallback;
  }

  removeCallbacks() {
    this.callbacks = {};
  }

  disconnect() {
    this.socketRef.close();
  }
}

const WebSocketInstance = WebSocketService.getInstance();
export default WebSocketInstance;