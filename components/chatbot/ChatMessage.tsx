'use client'

import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  index: number
}

export function ChatMessage({ role, content, index }: ChatMessageProps) {
  const isUser = role === 'user'
  
  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex items-start max-w-[85%] ${isUser ? 'flex-row-reverse' : ''}`}>
        <Avatar className={`w-8 h-8 ${isUser ? 'ml-2' : 'mr-2'} border-2 ${isUser ? 'border-[#00a1c9]' : 'border-white/20'}`}>
          <AvatarFallback>{isUser ? 'U' : 'A'}</AvatarFallback>
          <AvatarImage src={isUser ? '/usericon.png' : '/bedrock-logo.png'} />
        </Avatar>
        <motion.div 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className={`p-3 rounded-lg shadow-lg ${
            isUser 
              ? 'bg-gradient-to-r from-[#00a1c9] to-[#0088a9] text-white' 
              : 'bg-white/10 backdrop-blur-md text-white border border-white/10'
          }`}
        >
          <div className="whitespace-pre-wrap break-words">
            {content}
          </div>
          <div className={`text-[10px] mt-1 text-right ${isUser ? 'text-white/70' : 'text-white/40'}`}>
            {isUser ? '사용자' : 'Claude 3.5 Sonnet'}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
} 