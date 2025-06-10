'use client'

import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface StreamingMessageProps {
  content: string
}

export function StreamingMessage({ content }: StreamingMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start mb-4"
    >
      <div className="flex items-start max-w-[85%]">
        <Avatar className="w-8 h-8 mr-2 border-2 border-white/20">
          <AvatarFallback>A</AvatarFallback>
          <AvatarImage src="/bedrock-logo.png" />
        </Avatar>
        <motion.div 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="p-3 rounded-lg shadow-lg bg-white/10 backdrop-blur-md text-white border border-white/10"
        >
          <div className="whitespace-pre-wrap break-words">
            {content}
            <span className="inline-block w-1.5 h-4 ml-1 bg-white/70 animate-pulse"></span>
          </div>
          <div className="text-[10px] mt-1 text-right text-white/40 flex items-center justify-end">
            <span className="inline-block w-2 h-2 bg-[#00a1c9] rounded-full mr-1 animate-pulse"></span>
            <span>응답 생성 중...</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
} 