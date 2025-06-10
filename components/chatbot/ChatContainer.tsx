'use client'

import { useRef, useEffect } from 'react'
import { ChatMessage } from './ChatMessage'
import { StreamingMessage } from './StreamingMessage'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatContainerProps {
  messages: ChatMessage[]
  streamingMessage: string | null
  messagesEndRef: React.RefObject<HTMLDivElement>
}

export function ChatContainer({ messages, streamingMessage, messagesEndRef }: ChatContainerProps) {
  // 새 메시지가 추가될 때마다 스크롤을 아래로 이동
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingMessage, messagesEndRef]);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(100vh - 180px)' }}>
      <div className="p-4 space-y-4">
        {messages.map((message, index) => (
          <ChatMessage 
            key={index}
            role={message.role}
            content={message.content}
            index={index}
          />
        ))}
        
        {/* 스트리밍 메시지 표시 */}
        {streamingMessage && (
          <StreamingMessage content={streamingMessage} />
        )}
        
        <div ref={messagesEndRef} className="h-1" />
      </div>
    </div>
  )
} 