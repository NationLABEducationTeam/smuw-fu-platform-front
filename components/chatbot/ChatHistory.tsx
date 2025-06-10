'use client'

import { Button } from '@/components/ui/button'
import { Plus, MessageSquare, Clock, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface ChatHistoryItem {
  id: number
  title: string
  lastMessage: string
  timestamp: string
  model: string
}

interface ChatHistoryProps {
  history: ChatHistoryItem[]
  onSelectChat: (chat: ChatHistoryItem) => void
  onDeleteChat: (chat: ChatHistoryItem) => void
  onNewChat: () => void
  selectedChatId?: number
}

export function ChatHistory({ 
  history, 
  onSelectChat, 
  onDeleteChat, 
  onNewChat,
  selectedChatId
}: ChatHistoryProps) {
  return (
    <div className="flex flex-col h-full">
      {/* 새 대화 버튼 */}
      <div className="p-4 sticky top-0 z-10 bg-[#0a1929]/90 backdrop-blur-md border-b border-white/10">
        <Button 
          className="w-full bg-gradient-to-r from-[#00a1c9] to-[#0088a9] hover:from-[#0088a9] hover:to-[#006d8a] text-white font-medium shadow-md hover:shadow-lg transition-all duration-300"
          onClick={onNewChat}
        >
          <Plus className="w-4 h-4 mr-2" />
          <span>새 대화 시작하기</span>
        </Button>
      </div>

      {/* 대화 목록 */}
      <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar">
        {history.length === 0 ? (
          <div className="text-center py-8 text-white/60 italic">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>대화 기록이 없습니다</p>
            <p className="text-xs mt-2">새 대화를 시작해보세요</p>
          </div>
        ) : (
          <ul className="space-y-2 py-2">
            {history.map((item) => (
              <motion.li 
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div 
                  className={`
                    p-3 rounded-lg cursor-pointer transition-all duration-200
                    ${selectedChatId === item.id 
                      ? 'bg-[#00a1c9]/20 border border-[#00a1c9]/30 shadow-md' 
                      : 'hover:bg-white/5 border border-transparent hover:border-white/10'}
                  `}
                  onClick={() => onSelectChat(item)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center">
                      <MessageSquare className="w-3.5 h-3.5 mr-2 text-[#00a1c9]" />
                      <h3 className="font-medium text-sm truncate max-w-[160px]">{item.title}</h3>
                    </div>
                    <button 
                      className="text-white/40 hover:text-red-400 transition-colors p-1 rounded-full hover:bg-red-500/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(item);
                      }}
                      aria-label="대화 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-white/60 truncate pl-5.5 mb-1">{item.lastMessage}</p>
                  <div className="flex items-center justify-between text-[10px] text-white/40 pl-5.5">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{item.timestamp}</span>
                    </div>
                    <span className="bg-[#00a1c9]/20 px-1.5 py-0.5 rounded text-[8px] text-[#00a1c9]">
                      {item.model}
                    </span>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
} 