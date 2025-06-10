// utils/chat.js
import { getAuthenticatedWebSocketUrl } from './api';

class ChatService {
  constructor(url) {
    this.baseUrl = url;
    this.url = null;
    this.socket = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
    this.pingInterval = null;
    this.messageHandlers = {};
    this.openHandlers = [];
    this.closeHandlers = [];
    this.errorHandlers = [];
    this.lastPingTime = 0;
    this.sessionId = null;
  }

  async connect() {
    if (this.isConnected || this.isConnecting) {
      console.log('WebSocket is already connected or connecting');
      return;
    }

    this.isConnecting = true;

    try {
      // 인증된 WebSocket URL 가져오기
      this.url = await getAuthenticatedWebSocketUrl(this.baseUrl);
      
      console.log(`Connecting to WebSocket: ${this.url}`);
      this.socket = new WebSocket(this.url);

      this.socket.onopen = (event) => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.startPingInterval();
        this.openHandlers.forEach(handler => handler(event));
      };

      this.socket.onclose = (event) => {
        console.log('WebSocket disconnected', event);
        this.isConnected = false;
        this.isConnecting = false;
        this.stopPingInterval();
        this.closeHandlers.forEach(handler => handler(event));
        this.attemptReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.errorHandlers.forEach(handler => handler(error));
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const { type, data } = message;
          
          console.log(`Received message of type: ${type}`);
          
          if (this.messageHandlers[type]) {
            this.messageHandlers[type].forEach(handler => handler(data));
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      this.isConnecting = false;
      this.attemptReconnect();
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('최대 재연결 시도 횟수에 도달했습니다.');
      return;
    }

    this.reconnectAttempts++;
    console.log(`WebSocket 재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
    
    setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
    }
    this.isConnected = false;
    this.stopPingInterval();
    console.log('WebSocket 연결이 종료되었습니다.');
  }

  startPingInterval() {
    this.stopPingInterval();
    this.pingInterval = setInterval(() => {
      this.sendPing();
    }, 30000); // 30초마다 ping 전송
  }

  stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  sendMessage(type, data) {
    if (!this.isConnected) {
      console.error('WebSocket이 연결되어 있지 않습니다.');
      return false;
    }

    try {
      const message = JSON.stringify({ type, data });
      this.socket.send(message);
      return true;
    } catch (error) {
      console.error('메시지 전송 오류:', error);
      return false;
    }
  }

  onMessage(type, handler) {
    if (!this.messageHandlers[type]) {
      this.messageHandlers[type] = [];
    }
    
    this.messageHandlers[type].push(handler);
    
    return () => {
      const handlers = this.messageHandlers[type];
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    };
  }

  onOpen(handler) {
    this.openHandlers.push(handler);
    
    return () => {
      const index = this.openHandlers.indexOf(handler);
      if (index !== -1) {
        this.openHandlers.splice(index, 1);
      }
    };
  }

  onClose(handler) {
    this.closeHandlers.push(handler);
    
    return () => {
      const index = this.closeHandlers.indexOf(handler);
      if (index !== -1) {
        this.closeHandlers.splice(index, 1);
      }
    };
  }

  onError(handler) {
    this.errorHandlers.push(handler);
    
    return () => {
      const index = this.errorHandlers.indexOf(handler);
      if (index !== -1) {
        this.errorHandlers.splice(index, 1);
      }
    };
  }

  sendPing() {
    if (this.isConnected) {
      this.lastPingTime = Date.now();
      this.sendMessage('ping', { timestamp: this.lastPingTime });
    }
  }
  
  sendChatRequest(message, modelId, sessionId) {
    if (!sessionId) {
      sessionId = this.sessionId || `session_${Date.now()}`;
      this.sessionId = sessionId;
    }
    
    return this.sendMessage('chatRequest', {
      message,
      modelId,
      sessionId
    });
  }
}

// 싱글톤 인스턴스
let chatServiceInstance = null;

export const getChatService = (url) => {
  if (!chatServiceInstance) {
    chatServiceInstance = new ChatService(url);
  }
  
  return chatServiceInstance;
};

export const resetChatService = () => {
  if (chatServiceInstance) {
    chatServiceInstance.disconnect();
    chatServiceInstance = null;
  }
}; 