'use client'

import { Button } from '@/components/ui/button'
import { Settings, ChevronDown, Sparkles } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MODEL_OPTIONS, ModelId } from '@/types/bedrock'

interface ChatHeaderProps {
  selectedModel: ModelId
  onSelectModel: (model: ModelId) => void
}

export function ChatHeader({ 
  selectedModel, 
  onSelectModel
}: ChatHeaderProps) {
  return (
    <div className="flex justify-between items-center p-4 border-b border-white/10 bg-[#0a1929]/80 backdrop-blur-md">
      <h1 className="text-xl font-semibold text-white flex items-center">
        <Sparkles className="w-5 h-5 mr-2 text-[#00a1c9]" />
        AI 챗봇
      </h1>
      
      <div className="flex items-center space-x-3">
        {/* 모델 선택 드롭다운 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md transition-all duration-200"
            >
              <Settings className="w-4 h-4 mr-2" />
              <span>Model: {
                Object.entries(MODEL_OPTIONS).find(([_, id]) => id === selectedModel)?.[0]
              }</span>
              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-[250px] bg-black/90 backdrop-blur-xl border-white/10"
          >
            {Object.entries(MODEL_OPTIONS)
              .map(([name, id]) => (
                <DropdownMenuItem
                  key={id}
                  onClick={() => onSelectModel(id as ModelId)}
                  className={`
                    ${selectedModel === id 
                      ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white' 
                      : 'text-white/80 hover:bg-white/5'
                    } transition-all duration-200
                  `}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {name}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
} 