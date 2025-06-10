'use client'

import { FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Wifi, WifiOff } from 'lucide-react'

interface ChatInputProps {
  input: string
  setInput: (value: string) => void
  handleSubmit: (e: FormEvent) => void
  isLoading: boolean
  connectionError: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  handleReconnect: () => void
}

export function ChatInput({
  input,
  setInput,
  handleSubmit,
  isLoading,
  connectionError,
  connectionStatus,
  handleReconnect
}: ChatInputProps) {
  return (
    <div className="p-4 border-t border-white/10 bg-[#0a1929]/50 backdrop-blur-md">
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="메시지를 입력하세요"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-full border-2 border-[#00a1c9]/30 focus:border-[#00a1c9] bg-white/10 text-white placeholder:text-white/60 transition-all duration-200 pr-10"
            disabled={isLoading || connectionError}
          />
          {connectionStatus !== 'connected' && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {connectionStatus === 'connecting' ? (
                <div className="animate-pulse">
                  <Wifi className="h-4 w-4 text-yellow-500" />
                </div>
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
            </div>
          )}
        </div>
        <Button 
          type="submit" 
          size="icon" 
          className="rounded-full bg-gradient-to-r from-[#00a1c9] to-[#0088a9] hover:from-[#0088a9] hover:to-[#006d8a] transition-all duration-200 shadow-lg hover:shadow-[#00a1c9]/20"
          disabled={isLoading || !input.trim() || connectionError}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
      <div className="flex items-center mt-2 justify-between">
        <div className="flex items-center">
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
            <p className="text-xs text-gray-400">서버 연결 끊김</p>
          )}
          {connectionStatus === 'error' && (
            <p className="text-xs text-red-500">서버 연결 오류</p>
          )}
        </div>
        
        {(connectionStatus === 'disconnected' || connectionStatus === 'error') && (
          <button 
            onClick={handleReconnect}
            className="text-xs bg-[#00a1c9]/20 hover:bg-[#00a1c9]/30 text-[#00a1c9] px-2 py-1 rounded transition-colors duration-200"
          >
            재연결
          </button>
        )}
      </div>
    </div>
  )
} 