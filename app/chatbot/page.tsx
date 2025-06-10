'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { MODEL_OPTIONS, ModelId } from '@/types/bedrock'
import { getChatService, resetChatService } from '@/utils/chat'
import { 
  WebSocketMessageType, 
  WEBSOCKET_CONFIG
} from '@/types/websocket'
import { v4 as uuidv4 } from 'uuid'
import { ChatLayout } from '@/components/chatbot/ChatLayout'
import { ChatHistory } from '@/components/chatbot/ChatHistory'
import { ChatMain } from '@/components/chatbot/ChatMain'
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { TooltipProvider } from "@/components/ui/tooltip"
import { fetchChatSessions, fetchSessionMessages } from '@/utils/api'
import { useAuth } from '@/contexts/AuthContext'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatHistoryItem {
  id: number
  title: string
  lastMessage: string
  timestamp: string
  model: string
}

export default function Page() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isInitial, setIsInitial] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState<ModelId>(MODEL_OPTIONS["Claude 3.5 Sonnet"])
  const [sessionId, setSessionId] = useState(`session-${Date.now()}`)
  const [streamingMessage, setStreamingMessage] = useState<string | null>(null)
  const [connectionError, setConnectionError] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([])
  const [selectedChatId, setSelectedChatId] = useState<number | undefined>(undefined)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatServiceRef = useRef(null)
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // 스크롤을 맨 아래로 이동하는 함수
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // 채팅 응답 처리 함수들을 정의
  const handleChatResponse = useCallback((data: any) => {
    console.log('채팅 응답 수신:', data)
    setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
    setIsLoading(false)
    scrollToBottom()
  }, [scrollToBottom])

  const handleChatStream = useCallback((data: any) => {
    console.log('스트리밍 메시지 수신:', data)
    setStreamingMessage(prevMessage => {
      // 이전 메시지가 없으면 새 메시지를 그대로 반환
      if (prevMessage === null) return data.message;
      // 이전 메시지에 새 메시지를 추가하여 반환
      return prevMessage + data.message;
    })
  }, [])

  const handleChatStreamEnd = useCallback((data: any) => {
    console.log('스트리밍 종료 메시지 수신:', data)
    setMessages(prev => {
      const updatedMessages = [...prev, { role: 'assistant' as const, content: data.message }]
      
      // 첫 번째 사용자 메시지가 있고, 이전에 대화 기록에 저장되지 않았다면 자동으로 저장
      if (prev.length === 1 && prev[0].role === 'user') {
        const firstUserMessage = prev[0].content
        
        // 새 대화 항목 생성
        const newHistoryItem: ChatHistoryItem = {
          id: Date.now(),
          title: firstUserMessage.slice(0, 50) + (firstUserMessage.length > 50 ? '...' : ''),
          lastMessage: data.message.slice(0, 100) + (data.message.length > 100 ? '...' : ''),
          timestamp: new Date().toLocaleString(),
          model: Object.entries(MODEL_OPTIONS).find(([_, id]) => id === selectedModel)?.[0] || 'Unknown'
        }
        
        // 대화 기록에 추가
        setChatHistory(prev => [newHistoryItem, ...prev])
        setSelectedChatId(newHistoryItem.id)
        
        // 로컬 스토리지에 저장
        try {
          localStorage.setItem('chatHistory', JSON.stringify([newHistoryItem, ...chatHistory]))
        } catch (error) {
          console.error('채팅 기록 저장 중 오류 발생:', error)
        }
      }
      
      return updatedMessages
    })
    setStreamingMessage(null)
    setIsLoading(false)
    scrollToBottom()
  }, [scrollToBottom, chatHistory, selectedModel])

  const handleErrorResponse = useCallback((error: any) => {
    console.error('오류 메시지 수신:', error)
    setIsLoading(false)
    
    // 오류 메시지를 사용자에게 표시
    setMessages(prev => [
      ...prev,
      { role: 'assistant', content: `오류가 발생했습니다: ${error.message}` }
    ])
    scrollToBottom()
  }, [scrollToBottom])

  // WebSocket 초기화 함수
  const initializeWebSocket = useCallback(() => {
    console.log('WebSocket 초기화 시작')
    setConnectionStatus('connecting')
    
    const chatService = getChatService(WEBSOCKET_CONFIG.URL)
    chatServiceRef.current = chatService
    
    // 이벤트 핸들러 등록
    chatService.onOpen(() => {
      console.log('WebSocket 연결됨')
      setConnectionError(false)
      setConnectionStatus('connected')
      
      // 연결 후 ping 메시지 주기적 전송 시작
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current)
      }
      
      // 30초마다 ping 메시지 전송
      pingIntervalRef.current = setInterval(() => {
        console.log('Ping 메시지 전송')
        chatService.sendPing()
      }, 30000) // 30초 간격
    })
    
    chatService.onClose(() => {
      console.log('WebSocket 연결 종료됨')
      setConnectionStatus('disconnected')
      
      // ping 메시지 전송 중지
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current)
        pingIntervalRef.current = null
      }
    })
    
    chatService.onError(() => {
      console.error('WebSocket 오류 발생')
      setConnectionStatus('error')
      setConnectionError(true)
      
      // ping 메시지 전송 중지
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current)
        pingIntervalRef.current = null
      }
    })
    
    // 메시지 핸들러 등록
    chatService.onMessage(WebSocketMessageType.CHAT_RESPONSE, handleChatResponse)
    chatService.onMessage(WebSocketMessageType.CHAT_STREAM, handleChatStream)
    chatService.onMessage(WebSocketMessageType.CHAT_STREAM_END, handleChatStreamEnd)
    chatService.onMessage(WebSocketMessageType.ERROR, handleErrorResponse)
    chatService.onMessage(WebSocketMessageType.PONG, () => {
      console.log('Pong 메시지 수신')
    })
    
    // 연결 시작
    chatService.connect()
  }, [handleChatResponse, handleChatStream, handleChatStreamEnd, handleErrorResponse])

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    // 로컬 스토리지에서 채팅 기록 불러오기
    try {
      const savedHistory = localStorage.getItem('chatHistory');
      if (savedHistory) {
        setChatHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('채팅 기록 불러오기 실패:', error);
    }
    
    // 서버에서 대화 목록 가져오기
    const fetchChatSessionsFromServer = async () => {
      try {
        const sessions = await fetchChatSessions();
        if (sessions && sessions.length > 0) {
          // DynamoDB 형식을 프론트엔드 형식으로 변환
          const formattedSessions = sessions.map(session => ({
            id: session.request_id,
            title: session.title || '제목 없음',
            lastMessage: session.last_message || '',
            timestamp: new Date(session.request_time).toLocaleString(),
            model: session.model_id || 'Unknown'
          }));
          
          // 로컬 스토리지와 서버 데이터 병합
          setChatHistory(prev => {
            const combinedHistory = [...formattedSessions];
            // 중복 제거
            const existingIds = new Set(formattedSessions.map(s => s.id));
            prev.forEach(item => {
              if (!existingIds.has(item.id)) {
                combinedHistory.push(item);
              }
            });
            return combinedHistory;
          });
        }
      } catch (error) {
        console.error('서버에서 대화 목록 가져오기 실패:', error);
      }
    };
    
    fetchChatSessionsFromServer();
    
    // WebSocket 연결 초기화
    initializeWebSocket();
    
    // 컴포넌트 언마운트 시
    return () => {
      if (chatServiceRef.current) {
        resetChatService();
      }
      
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
    };
  }, []); // 의존성 배열을 비워서 마운트 시에만 실행되도록 함

  // 메시지 전송 처리
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim() || isLoading) return
    
    // 사용자 메시지 추가
    const userMessage = input.trim()
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setInput('')
    setIsLoading(true)
    setIsInitial(false)
    
    // 스크롤 아래로 이동
    scrollToBottom()
    
    // WebSocket 연결 확인
    if (!chatServiceRef.current) {
      console.log('WebSocket 연결 시작')
      initializeWebSocket()
    }
    
    // 메시지 전송
    const chatService = chatServiceRef.current as any
    if (chatService) {
      console.log('메시지 전송:', userMessage)
      
      const request = {
        message: userMessage,
        modelId: selectedModel,
        sessionId: sessionId
      }
      
      chatService.sendChatRequest(request.message, request.modelId, request.sessionId)
    } else {
      console.error('WebSocket 연결이 없습니다')
      setConnectionError(true)
      setIsLoading(false)
    }
  }

  // 연결 재시도 함수
  const handleReconnect = useCallback(() => {
    console.log('WebSocket 연결 재시도 중...')
    
    // 이미 연결 중이면 무시
    if (connectionStatus === 'connecting') {
      console.log('이미 연결 중입니다.')
      return
    }
    
    setConnectionStatus('connecting')
    setConnectionError(false)
    
    // 기존 연결 정리
    if (chatServiceRef.current) {
      resetChatService()
      chatServiceRef.current = null
    }
    
    // 새 연결 시작
    setTimeout(() => {
      initializeWebSocket()
    }, 1000) // 1초 후에 재연결 시도
  }, [connectionStatus, initializeWebSocket])

  // 새 대화 시작
  const startNewChat = () => {
    setIsInitial(true)
    setMessages([])
    setStreamingMessage(null)
    setInput('')
    setSessionId(`session-${Date.now()}`)
    setSelectedChatId(undefined)
  }

  // 대화 기록에서 항목 삭제
  const handleDeleteChat = (historyItem: ChatHistoryItem) => {
    // 현재 선택된 대화인 경우 새 대화 시작
    if (selectedChatId === historyItem.id) {
      startNewChat()
    }
    
    // 기록에서 제거
    const updatedHistory = chatHistory.filter(item => item.id !== historyItem.id)
    setChatHistory(updatedHistory)
    
    // 로컬 스토리지 업데이트
    try {
      localStorage.setItem('chatHistory', JSON.stringify(updatedHistory))
    } catch (error) {
      console.error('채팅 기록 삭제 중 오류 발생:', error)
    }
  }

  // 대화 기록에서 대화 불러오기
  const loadChatFromHistory = async (historyItem: ChatHistoryItem) => {
    // 이미 선택된 대화인 경우 무시
    if (selectedChatId === historyItem.id) return;
    
    // 새 대화 시작
    setIsInitial(false);
    setMessages([]);
    setStreamingMessage(null);
    setInput('');
    
    // 세션 ID 설정
    const sessionId = `session-${historyItem.id}`;
    setSessionId(sessionId);
    setSelectedChatId(historyItem.id);
    
    try {
      // 서버에서 대화 내용 가져오기
      const messages = await fetchSessionMessages(sessionId);
      if (messages.length > 0) {
        setMessages(messages.map(msg => ({
          role: msg.userMessage ? 'user' : 'assistant',
          content: msg.userMessage || msg.aiResponse
        })));
      } else {
        // 메시지를 가져오지 못한 경우 기본값 표시
        setMessages([
          { role: 'user', content: historyItem.title },
          { role: 'assistant', content: historyItem.lastMessage }
        ]);
      }
    } catch (error) {
      console.error('대화 내용 로딩 실패:', error);
      // 에러 시 기본값 표시
      setMessages([
        { role: 'user', content: historyItem.title },
        { role: 'assistant', content: historyItem.lastMessage }
      ]);
    }
  }

  return (
    <ProtectedRoute>
      <TooltipProvider>
        <div className="flex-1 flex flex-col w-full h-[calc(100vh-64px)] pl-[320px] overflow-hidden">
          <ChatLayout
            sidebarContent={
              <ChatHistory
                history={chatHistory}
                onSelectChat={loadChatFromHistory}
                onDeleteChat={handleDeleteChat}
                onNewChat={startNewChat}
                selectedChatId={selectedChatId}
              />
            }
            mainContent={
              <ChatMain
                messages={messages}
                input={input}
                setInput={setInput}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
                streamingMessage={streamingMessage}
                connectionError={connectionError}
                connectionStatus={connectionStatus}
                handleReconnect={handleReconnect}
                selectedModel={selectedModel}
                onSelectModel={setSelectedModel}
                isInitial={isInitial}
              />
            }
          />
        </div>
      </TooltipProvider>
    </ProtectedRoute>
  )
}
