'use client';

import { useEffect, useState, useRef } from 'react';
import { getChatService, resetChatService } from '../../utils/chat';
import Link from 'next/link';
import { MODEL_OPTIONS, ModelId } from '@/types/bedrock';

interface Message {
  type: 'system' | 'send' | 'receive' | 'error';
  content: string;
}

export default function WebSocketTest() {
  const [status, setStatus] = useState('연결 안됨');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [wsUrl, setWsUrl] = useState('');
  const [selectedModel, setSelectedModel] = useState<ModelId>(MODEL_OPTIONS["Claude 3.5 Sonnet"]);
  const chatServiceRef = useRef<any>(null);
  
  useEffect(() => {
    // 브라우저 환경에서만 실행
    if (typeof window === 'undefined') return;
    
    const url = process.env.NEXT_PUBLIC_WEBSOCKET_URL || '';
    setWsUrl(url);
    
    return () => {
      resetChatService();
    };
  }, []);
  
  const connectWebSocket = () => {
    // 기존 연결 초기화
    resetChatService();
    
    // 새 연결 생성
    const chatService = getChatService(wsUrl);
    chatServiceRef.current = chatService;
    
    // 이벤트 핸들러 등록
    chatService.onOpen(() => {
      console.log('WebSocket 연결됨');
      setStatus('연결됨');
      setMessages(prev => [...prev, { type: 'system', content: '서버에 연결되었습니다.' }]);
    });
    
    chatService.onClose((event: any) => {
      console.log(`WebSocket 연결 종료: 코드=${event.code}`);
      setStatus('연결 종료됨');
      setMessages(prev => [...prev, { type: 'system', content: `연결이 종료되었습니다. 코드: ${event.code}` }]);
    });
    
    chatService.onError((error: any) => {
      console.error('WebSocket 오류:', error);
      setStatus('오류 발생');
      setMessages(prev => [...prev, { type: 'error', content: '연결 중 오류가 발생했습니다.' }]);
    });
    
    // 메시지 핸들러 등록
    chatService.onMessage('ping', (data: any) => {
      setMessages(prev => [...prev, { type: 'receive', content: `Ping 응답: ${JSON.stringify(data)}` }]);
    });
    
    chatService.onMessage('pong', (data: any) => {
      setMessages(prev => [...prev, { type: 'receive', content: `Pong 응답: ${JSON.stringify(data)}` }]);
    });
    
    chatService.onMessage('chatResponse', (data: any) => {
      setMessages(prev => [...prev, { type: 'receive', content: `채팅 응답: ${data.message}` }]);
    });
    
    chatService.onMessage('chatStream', (data: any) => {
      setMessages(prev => [...prev, { type: 'receive', content: `채팅 스트림: ${data.message}` }]);
    });
    
    chatService.onMessage('chatStreamEnd', (data: any) => {
      setMessages(prev => [...prev, { type: 'receive', content: `채팅 스트림 종료: ${data.message}` }]);
    });
    
    chatService.onMessage('error', (data: any) => {
      setMessages(prev => [...prev, { type: 'error', content: `오류: ${data.message}` }]);
    });
    
    // 연결 시작
    chatService.connect();
  };
  
  const disconnectWebSocket = () => {
    if (chatServiceRef.current) {
      chatServiceRef.current.disconnect();
      setStatus('연결 해제됨');
      setMessages(prev => [...prev, { type: 'system', content: '연결을 해제했습니다.' }]);
    }
  };
  
  const sendPing = () => {
    if (!chatServiceRef.current) {
      setMessages(prev => [...prev, { type: 'error', content: '서비스가 초기화되지 않았습니다.' }]);
      return;
    }
    
    const success = chatServiceRef.current.sendPing();
    
    if (success) {
      setMessages(prev => [...prev, { type: 'send', content: 'Ping 메시지를 전송했습니다.' }]);
    } else {
      setMessages(prev => [...prev, { type: 'error', content: 'Ping 메시지 전송에 실패했습니다.' }]);
    }
  };
  
  const sendChatRequest = () => {
    if (!chatServiceRef.current) {
      setMessages(prev => [...prev, { type: 'error', content: '서비스가 초기화되지 않았습니다.' }]);
      return;
    }
    
    if (!input.trim()) {
      setMessages(prev => [...prev, { type: 'error', content: '메시지를 입력해주세요.' }]);
      return;
    }
    
    const success = chatServiceRef.current.sendChatRequest(
      input,
      selectedModel,
      `test-session-${Date.now()}`
    );
    
    if (success) {
      setMessages(prev => [...prev, { type: 'send', content: `채팅 요청: ${input}` }]);
      setInput('');
    } else {
      setMessages(prev => [...prev, { type: 'error', content: '채팅 요청 전송에 실패했습니다.' }]);
    }
  };
  
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWsUrl(e.target.value);
  };
  
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const modelKey = e.target.value as keyof typeof MODEL_OPTIONS;
    setSelectedModel(MODEL_OPTIONS[modelKey]);
  };
  
  const getMessageStyle = (type: string) => {
    switch (type) {
      case 'system':
        return 'bg-gray-100 text-gray-800';
      case 'send':
        return 'bg-blue-100 text-blue-800';
      case 'receive':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100';
    }
  };
  
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">WebSocket 테스트</h1>
        <Link href="/" className="text-blue-500 hover:underline">
          홈으로 돌아가기
        </Link>
      </div>
      
      <div className="mb-4 p-4 border rounded">
        <div className="mb-2">
          <span className="font-bold">상태:</span> 
          <span className={`ml-2 px-2 py-1 rounded ${
            status === '연결됨' ? 'bg-green-100 text-green-800' : 
            status === '연결 안됨' ? 'bg-gray-100 text-gray-800' : 
            'bg-red-100 text-red-800'
          }`}>
            {status}
          </span>
        </div>
        
        <div className="mb-4">
          <label className="block mb-1">WebSocket URL:</label>
          <div className="flex">
            <input
              type="text"
              value={wsUrl}
              onChange={handleUrlChange}
              className="border p-2 flex-grow"
              placeholder="wss://..."
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            기본값: {process.env.NEXT_PUBLIC_WEBSOCKET_URL || '(설정되지 않음)'}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={connectWebSocket}
            className="bg-green-500 text-white px-4 py-2 rounded"
            disabled={!wsUrl}
          >
            연결
          </button>
          <button
            onClick={disconnectWebSocket}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            연결 해제
          </button>
        </div>
      </div>
      
      <div className="mb-4 p-4 border rounded">
        <div className="mb-4">
          <label className="block mb-1">모델 선택:</label>
          <select 
            className="border p-2 w-full"
            onChange={handleModelChange}
            disabled={status !== '연결됨'}
          >
            {Object.entries(MODEL_OPTIONS).map(([key, value]) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex mb-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="border p-2 flex-grow mr-2"
            placeholder="메시지 입력..."
          />
          <button
            onClick={sendChatRequest}
            className="bg-blue-500 text-white px-4 py-2 rounded"
            disabled={status !== '연결됨'}
          >
            채팅 요청
          </button>
        </div>
        
        <button
          onClick={sendPing}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
          disabled={status !== '연결됨'}
        >
          Ping 전송
        </button>
      </div>
      
      <div className="border rounded p-4 h-96 overflow-y-auto bg-white">
        <h2 className="text-lg font-bold mb-2">메시지 로그</h2>
        {messages.length === 0 ? (
          <p className="text-gray-500 italic">메시지가 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`p-2 rounded ${getMessageStyle(msg.type)}`}
              >
                <pre className="whitespace-pre-wrap font-mono text-sm">{msg.content}</pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 