'use client'

import { useState, useRef, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Loader2 } from 'lucide-react'
import { Card } from "@/components/ui/card"
import { useTypewriter } from '@/hooks/useTypewriter'
import { ChatHeader } from './ChatHeader'
import { ChatContainer } from './ChatContainer'
import { ChatInput } from './ChatInput'
import { ModelId } from '@/types/bedrock'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatMainProps {
  messages: ChatMessage[]
  input: string
  setInput: (value: string) => void
  handleSubmit: (e: FormEvent) => void
  isLoading: boolean
  streamingMessage: string | null
  connectionError: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  handleReconnect: () => void
  selectedModel: ModelId
  onSelectModel: (model: ModelId) => void
  isInitial: boolean
}

export function ChatMain({
  messages,
  input,
  setInput,
  handleSubmit,
  isLoading,
  streamingMessage,
  connectionError,
  connectionStatus,
  handleReconnect,
  selectedModel,
  onSelectModel,
  isInitial
}: ChatMainProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { displayText, isTyping } = useTypewriter('무엇을 도와드릴까요?', 100)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ChatHeader 
        selectedModel={selectedModel}
        onSelectModel={onSelectModel}
      />

      {connectionError && (
        <div className="bg-red-500/10 border-l-4 border-red-500 text-white p-4 mx-4 mt-2 rounded backdrop-blur-md">
          <div className="flex items-center">
            <div className="py-1">
              <svg className="h-6 w-6 text-red-400 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="font-bold">서버 연결에 문제가 발생했습니다.</p>
              <p className="text-sm text-white/70">
                재연결 시도: {connectionStatus === 'connecting' ? '연결 중...' : '연결 끊김'}
              </p>
            </div>
            <button 
              onClick={handleReconnect}
              className="ml-auto bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-4 rounded transition-colors duration-200"
            >
              재연결
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {isInitial ? (
            <motion.div
              key="initial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex items-center justify-center p-4 h-[calc(100vh-180px)] overflow-hidden"
            >
              <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-md shadow-xl border-white/20 p-8">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <Bot className="w-16 h-16 text-[#00a1c9] mx-auto mb-6" />
                </motion.div>
                <h1 className="text-4xl font-bold text-center mb-8 text-white">
                  {displayText}
                  {isTyping && <span className="animate-pulse">|</span>}
                </h1>
                <form onSubmit={handleSubmit} className="w-full">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="메시지를 입력하세요"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="w-full pl-4 pr-12 py-3 text-lg rounded-full border-2 border-[#00a1c9]/30 focus:border-[#00a1c9] bg-white/10 text-white placeholder:text-white/60 transition-all duration-200"
                      disabled={isLoading || connectionError}
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-[#00a1c9] hover:bg-[#0088a9] transition-all duration-200 shadow-lg hover:shadow-[#00a1c9]/20 p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isLoading || !input.trim() || connectionError}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center mt-2">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      connectionStatus === 'connected' ? 'bg-green-500' :
                      connectionStatus === 'connecting' ? 'bg-yellow-500' :
                      connectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-500'
                    }`}></div>
                    {connectionStatus === 'connected' && (
                      <p className="text-xs text-green-500">서버에 연결됨</p>
                    )}
                    {connectionStatus === 'connecting' && (
                      <p className="text-xs text-yellow-500">서버 연결 중...</p>
                    )}
                    {connectionStatus === 'disconnected' && (
                      <p className="text-xs text-gray-400">서버 연결 끊김 
                        <button 
                          onClick={handleReconnect}
                          className="ml-2 text-blue-400 hover:underline"
                        >
                          재연결
                        </button>
                      </p>
                    )}
                    {connectionStatus === 'error' && (
                      <p className="text-xs text-red-500">서버 연결 오류
                        <button 
                          onClick={handleReconnect}
                          className="ml-2 text-blue-400 hover:underline"
                        >
                          재연결
                        </button>
                      </p>
                    )}
                  </div>
                </form>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex flex-col h-[calc(100vh-180px)] overflow-hidden"
            >
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50"
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