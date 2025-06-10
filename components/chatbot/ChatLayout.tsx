'use client'

import { useState, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react'

interface ChatLayoutProps {
  sidebarContent: ReactNode
  mainContent: ReactNode
}

export function ChatLayout({ sidebarContent, mainContent }: ChatLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const sidebarWidth = 280

  return (
    <div className="flex h-full bg-gradient-to-b from-[#051b2c] to-[#0a2540] text-white overflow-hidden">
      {/* 좌측 사이드바 (채팅 히스토리) */}
      <motion.div 
        className="h-full bg-[#0a1929]/80 backdrop-blur-md border-r border-white/10 z-20 relative overflow-hidden"
        initial={{ width: sidebarWidth }}
        animate={{ 
          width: isSidebarOpen ? sidebarWidth : 0,
          opacity: isSidebarOpen ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
      >
        {isSidebarOpen && (
          <div className="h-full w-full flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-[#00a1c9]" />
              <h2 className="text-lg font-medium">대화 기록</h2>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {sidebarContent}
            </div>
          </div>
        )}
      </motion.div>

      {/* 사이드바 토글 버튼 */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute z-30 bg-[#0a1929] hover:bg-[#0a2540] text-white p-1 rounded-r-md border border-white/10 border-l-0 transition-all duration-300"
        style={{ 
          left: isSidebarOpen ? `${sidebarWidth}px` : '0px',
          top: '50%',
          transform: 'translateY(-50%)'
        }}
      >
        {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* 메인 채팅 영역 */}
      <div className="flex-1 h-full flex flex-col overflow-hidden">
        {mainContent}
      </div>
    </div>
  )
} 