'use client'

import { useState, useRef, FormEvent } from 'react'
import { Card } from "@/components/ui/card"
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { ChatContainer } from './ChatContainer'
import { ChatInput } from './ChatInput'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatInterfaceProps {
  messages: ChatMessage[]
  input: string
  setInput: (value: string) => void
  handleSubmit: (e: FormEvent) => void
  isLoading: boolean
  streamingMessage: string | null
  connectionError: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  handleReconnect: () => void
}

export function ChatInterface({
  messages,
  input,
  setInput,
  handleSubmit,
  isLoading,
  streamingMessage,
  connectionError,
  connectionStatus,
  handleReconnect
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-150px)] overflow-hidden">
      <Card className="flex-1 flex flex-col bg-white/10 backdrop-blur-md shadow-xl border-white/20 overflow-hidden">
        <ChatContainer 
          messages={messages}
          streamingMessage={streamingMessage}
          messagesEndRef={messagesEndRef}
        />
        <ChatInput 
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          connectionError={connectionError}
          connectionStatus={connectionStatus}
          handleReconnect={handleReconnect}
        />
      </Card>
      
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-black/80 backdrop-blur-md text-white px-6 py-3 rounded-full flex items-center space-x-2 shadow-lg">
            <Loader2 className="animate-spin h-4 w-4" />
            <span>응답을 생성하고 있습니다...</span>
          </div>
        </motion.div>
      )}
    </div>
  )
} 