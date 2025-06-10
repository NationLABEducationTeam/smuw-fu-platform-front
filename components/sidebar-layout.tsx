'use client'

import React from 'react'
import { useSidebar } from '@/components/common/layout/sidebar/nav-sidebar'
import { usePathname } from 'next/navigation'

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen } = useSidebar();
  const pathname = usePathname();
  const isChatbotPage = pathname === '/chatbot';

  return (
    <div className={`
      flex-1 flex flex-col w-full
      transition-all duration-300 ease-in-out
      ${isChatbotPage 
        ? '' // chatbot 페이지는 자체적으로 전체 화면 관리
        : isSidebarOpen ? 'lg:ml-[320px]' : 'ml-0'
      }
    `}>
      <main className={`flex-1 overflow-y-auto w-full ${isChatbotPage ? 'overflow-hidden' : ''}`}>
        {children}
      </main>
    </div>
  );
} 