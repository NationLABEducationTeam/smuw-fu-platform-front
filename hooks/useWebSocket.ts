import { useState, useEffect, useCallback, useRef } from 'react';

interface WebSocketMessage {
  type: string;
  data: any;
}

interface UseWebSocketOptions {
  onOpen?: () => void;
  onClose?: () => void;
  onMessage?: (data: any) => void;
  onError?: (error: Event) => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  autoConnect?: boolean;
}

export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [reconnectCount, setReconnectCount] = useState(0);
  const webSocketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasErrorRef = useRef(false); // 에러 발생 여부를 추적하는 ref
  const maxReconnectReachedRef = useRef(false); // 최대 재연결 시도 도달 여부
  const connectionAttemptTimeRef = useRef<number | null>(null); // 연결 시도 시간을 추적하는 ref

  const {
    onOpen,
    onClose,
    onMessage,
    onError,
    reconnectAttempts = 3,
    reconnectInterval = 5000,
    autoConnect = true,
  } = options;

  // WebSocket 상태 코드에 따른 설명을 반환하는 함수
  const getWebSocketStateDescription = (readyState: number | undefined): string => {
    if (readyState === undefined) return 'UNDEFINED';
    switch (readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING (0)';
      case WebSocket.OPEN: return 'OPEN (1)';
      case WebSocket.CLOSING: return 'CLOSING (2)';
      case WebSocket.CLOSED: return 'CLOSED (3)';
      default: return `UNKNOWN (${readyState})`;
    }
  };

  const connect = useCallback(() => {
    // 이미 연결되어 있거나 최대 재연결 시도 횟수에 도달한 경우 재연결 시도하지 않음
    if (webSocketRef.current?.readyState === WebSocket.OPEN) {
      // console.log('WebSocket 이미 연결되어 있음');
      return;
    }

    if (maxReconnectReachedRef.current) {
      // console.log('최대 재연결 시도 횟수에 도달함. 수동 재연결이 필요합니다.');
      return;
    }

    // 연결 중인 경우 중복 연결 방지
    if (webSocketRef.current?.readyState === WebSocket.CONNECTING) {
      // console.log('WebSocket 연결 중... 중복 연결 시도 방지');
      return;
    }

    // 기존 연결 정리
    if (webSocketRef.current) {
      // console.log(`기존 WebSocket 연결 종료 (상태: ${getWebSocketStateDescription(webSocketRef.current.readyState)})`);
      webSocketRef.current.close();
      webSocketRef.current = null;
    }

    try {
      // 연결 시도 시간 기록
      connectionAttemptTimeRef.current = Date.now();
      
      // console.log(`WebSocket 연결 시도 (${reconnectCount + 1}/${reconnectAttempts}): ${url}`);
      const ws = new WebSocket(url);
      webSocketRef.current = ws;

      // 연결 타임아웃 설정 (10초)
      const connectionTimeoutId = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          // console.log('WebSocket 연결 타임아웃 (10초)');
          ws.close();
          
          // 재연결 로직 트리거
          if (reconnectCount < reconnectAttempts - 1) {
            // console.log(`연결 타임아웃으로 인한 재연결 시도 ${reconnectCount + 1}/${reconnectAttempts}`);
            setReconnectCount(prev => prev + 1);
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, reconnectInterval);
          } else {
            // console.log('최대 재연결 시도 횟수 초과 (타임아웃)');
            maxReconnectReachedRef.current = true;
          }
        }
      }, 10000);

      ws.onopen = () => {
        // 타임아웃 제거
        clearTimeout(connectionTimeoutId);
        
        // 연결 시간 계산
        const connectionTime = connectionAttemptTimeRef.current 
          ? Date.now() - connectionAttemptTimeRef.current 
          : 'unknown';
        
        // console.log(`WebSocket 연결 성공 (소요 시간: ${connectionTime}ms)`);
        setIsConnected(true);
        setReconnectCount(0);
        hasErrorRef.current = false;
        maxReconnectReachedRef.current = false;
        onOpen?.();
      };

      ws.onclose = (event) => {
        // 타임아웃 제거
        clearTimeout(connectionTimeoutId);
        
        // console.log(`WebSocket 연결 종료: 코드=${event.code}, 이유=${event.reason || '없음'}`);
        setIsConnected(false);
        onClose?.();

        // 정상 종료인 경우 (코드 1000 또는 1001)
        const isNormalClosure = event.code === 1000 || event.code === 1001;
        
        // 에러가 발생하지 않았고, 정상 종료가 아니며, 재연결 시도 횟수가 제한 이내인 경우에만 재연결 시도
        if (!hasErrorRef.current && !isNormalClosure && reconnectCount < reconnectAttempts - 1) {
          // console.log(`재연결 시도 ${reconnectCount + 1}/${reconnectAttempts} (${reconnectInterval}ms 후)`);
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectCount(prev => prev + 1);
            connect();
          }, reconnectInterval);
        } else if (reconnectCount >= reconnectAttempts - 1) {
          // console.log('최대 재연결 시도 횟수 초과. 더 이상 재연결을 시도하지 않습니다.');
          maxReconnectReachedRef.current = true;
        } else if (isNormalClosure) {
          // console.log('정상적인 연결 종료로 재연결을 시도하지 않습니다.');
        }
      };

      ws.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data);
          setLastMessage(parsedData);
          onMessage?.(parsedData);
        } catch (error) {
          console.error('WebSocket 메시지 파싱 오류:', error);
          // console.log('원본 메시지:', event.data);
          setLastMessage(event.data);
          onMessage?.(event.data);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket 오류:', error);
        hasErrorRef.current = true;
        
        // 브라우저 콘솔에 더 자세한 정보 출력
        // console.log('WebSocket 상태:', getWebSocketStateDescription(ws.readyState));
        // console.log('WebSocket URL:', url);
        
        // 에러 발생 시 재연결 시도 횟수를 증가시키고, 최대 시도 횟수에 도달했는지 확인
        if (reconnectCount >= reconnectAttempts - 1) {
          // console.log('에러 발생 후 최대 재연결 시도 횟수 초과');
          maxReconnectReachedRef.current = true;
        }
        
        onError?.(error);
      };
    } catch (error) {
      console.error('WebSocket 연결 시도 중 오류:', error);
      hasErrorRef.current = true;
      
      // 에러 발생 시 재연결 시도 횟수를 증가시키고, 최대 시도 횟수에 도달했는지 확인
      if (reconnectCount >= reconnectAttempts - 1) {
        // console.log('연결 시도 중 에러 발생 후 최대 재연결 시도 횟수 초과');
        maxReconnectReachedRef.current = true;
      } else {
        // 재연결 시도
        // console.log(`연결 오류로 인한 재연결 시도 ${reconnectCount + 1}/${reconnectAttempts} (${reconnectInterval}ms 후)`);
        reconnectTimeoutRef.current = setTimeout(() => {
          setReconnectCount(prev => prev + 1);
          connect();
        }, reconnectInterval);
      }
    }
  }, [url, onOpen, onClose, onMessage, onError, reconnectAttempts, reconnectInterval, reconnectCount]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (webSocketRef.current) {
      // console.log(`WebSocket 연결 종료 요청 (상태: ${getWebSocketStateDescription(webSocketRef.current.readyState)})`);
      webSocketRef.current.close();
      webSocketRef.current = null;
    }
    
    // 연결 종료 시 상태 초기화
    setReconnectCount(0);
    hasErrorRef.current = false;
    maxReconnectReachedRef.current = false;
    connectionAttemptTimeRef.current = null;
  }, []);

  // 수동으로 재연결을 시도하는 함수 추가
  const resetAndConnect = useCallback(() => {
    // console.log('WebSocket 연결 수동 재설정 및 재연결 시도');
    disconnect();
    setReconnectCount(0);
    hasErrorRef.current = false;
    maxReconnectReachedRef.current = false;
    connectionAttemptTimeRef.current = null;
    
    // 약간의 지연 후 재연결 시도
    setTimeout(() => {
      connect();
    }, 1000);
  }, [connect, disconnect]);

  const sendMessage = useCallback((message: WebSocketMessage | string) => {
    if (webSocketRef.current?.readyState === WebSocket.OPEN) {
      const data = typeof message === 'string' ? message : JSON.stringify(message);
      webSocketRef.current.send(data);
      return true;
    } else {
      console.warn(`WebSocket 메시지 전송 실패: 연결 상태가 OPEN이 아님 (현재 상태: ${getWebSocketStateDescription(webSocketRef.current?.readyState)})`);
      return false;
    }
  }, []);

  // 자동 연결
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // 네트워크 상태 변경 감지
  useEffect(() => {
    const handleOnline = () => {
      // console.log('네트워크 연결됨. WebSocket 재연결 시도...');
      if (!isConnected && !maxReconnectReachedRef.current) {
        resetAndConnect();
      }
    };

    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [isConnected, resetAndConnect]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
    resetAndConnect,
    reconnectCount,
    maxReconnectAttempts: reconnectAttempts,
  };
} 