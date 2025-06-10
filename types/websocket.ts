import { ModelId } from './bedrock';

// WebSocket 메시지 타입
export enum WebSocketMessageType {
  CONNECT = 'connect',
  CHAT_REQUEST = 'chatRequest',
  CHAT_RESPONSE = 'chatResponse',
  CHAT_STREAM = 'chatStream',
  CHAT_STREAM_END = 'chatStreamEnd',
  ERROR = 'error',
  PING = 'ping',
  PONG = 'pong',
}

// 채팅 메시지 역할
export type ChatRole = 'user' | 'assistant' | 'system';

// 채팅 메시지 인터페이스
export interface ChatMessage {
  role: ChatRole;
  content: string;
}

// 채팅 요청 인터페이스
export interface ChatRequest {
  message: string;
  modelId: ModelId;
  sessionId?: string;
}

// 채팅 응답 인터페이스
export interface ChatResponse {
  message: string;
  modelId: ModelId;
  sessionId?: string;
  isComplete: boolean;
}

// 에러 응답 인터페이스
export interface ErrorResponse {
  code: string;
  message: string;
}

// WebSocket 메시지 인터페이스
export interface WebSocketMessage<T = any> {
  type: WebSocketMessageType;
  data: T;
}

// WebSocket 연결 설정
export const WEBSOCKET_CONFIG = {
  // AWS API Gateway WebSocket URL
  // 실제 배포 시 환경 변수로 관리하는 것이 좋습니다
  URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'wss://dzamj9uv1g.execute-api.ap-northeast-2.amazonaws.com/production',
  RECONNECT_ATTEMPTS: 5,
  RECONNECT_INTERVAL: 3000,
  PING_INTERVAL: 30000, // 30초마다 ping 메시지 전송
}; 