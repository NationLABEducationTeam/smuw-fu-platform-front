'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Bell, Menu, Settings, MoreVertical } from 'lucide-react'
import { motion } from "framer-motion"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
}

export function AppHeader({ 
  title = "요식업/푸드테크 트렌드",
  subtitle
}: AppHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 lg:px-8 h-16">
        <h1 className="text-base sm:text-lg lg:text-xl font-semibold truncate">
          {title}
        </h1>
        <div className="flex items-center space-x-2 lg:space-x-4">
          <Button 
            variant="ghost" 
            size="icon"
            className="hidden sm:flex"
          >
            <Bell className="w-5 h-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="hidden sm:flex"
          >
            <Settings className="w-5 h-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="sm:hidden"
              >
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Bell className="w-4 h-4 mr-2" />
                알림
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                설정
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}