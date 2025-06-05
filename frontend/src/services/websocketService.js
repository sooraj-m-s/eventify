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
    this.socketRef = null
    this.isConnecting = false
    this.userId = null
  }

  connect(userId) {
    const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL;
    if (
      this.isConnecting ||
      (this.socketRef && this.socketRef.readyState === WebSocket.OPEN && this.userId === userId)
    ) {
      return
    }
    if (!userId) {
      console.log("Cannot connect WebSocket: No user ID provided")
      return
    }

    this.userId = userId
    this.isConnecting = true
    const path = `${WS_BASE_URL}?user_id=${userId}`;

    if (this.socketRef) {
      this.socketRef.close()
    }

    this.socketRef = new WebSocket(path)
    this.socketRef.onopen = () => {
      console.log("WebSocket open")
      this.isConnecting = false
    }
    this.socketRef.onmessage = (e) => {
      this.socketNewMessage(e.data)
    }
    this.socketRef.onerror = (e) => {
      console.log(e.message)
      this.isConnecting = false
    }
    this.socketRef.onclose = () => {
      console.log("WebSocket closed")
      this.isConnecting = false

      if (this.userId) {
        console.log("Trying to reconnect...")
        setTimeout(() => {
          this.connect(this.userId)
        }, 1000)
      }
    }
  }

  socketNewMessage(data) {
    const parsedData = JSON.parse(data)
    const command = parsedData.message

    if (Object.keys(this.callbacks).length === 0) {
      return
    }
    Object.keys(this.callbacks).forEach((key) => {
      this.callbacks[key](command)
    })
  }

  addCallbacks(newNotificationCallback) {
    this.callbacks["new-notification"] = newNotificationCallback
  }

  removeCallbacks() {
    this.callbacks = {}
  }

  disconnect() {
    this.userId = null

    if (this.socketRef) {
      this.socketRef.close()
      this.socketRef = null
    }
    console.log("WebSocket disconnected")
  }
}

const WebSocketInstance = WebSocketService.getInstance();
export default WebSocketInstance;