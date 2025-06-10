'use client'

import { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed right-4 bottom-4 z-50">
      {isOpen ? (
        <div className="relative w-[400px] h-[600px] mb-4">
          <iframe
            src="https://aichatbot.sendbird.com/playground/index.html?app_id=DA62481E-3071-4E71-A061-CCAFB5B8471D&bot_id=i-5XYt8P2nnNMan7n3lEv&region=ap-2"
            width="100%"
            height="100%"
            style={{
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
            }}
          />
        </div>
      ) : null}
      <Button
        size="icon"
        className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>
    </div>
  )
}