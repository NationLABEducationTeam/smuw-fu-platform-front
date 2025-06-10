'use client'

import React from 'react'
import { useSidebar } from '@/components/common/layout/sidebar/nav-sidebar'

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen } = useSidebar();

  return (
    <div className={`
      flex-1 flex flex-col w-full
      transition-all duration-300 ease-in-out
      ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}
    `}>
      <main className="flex-1 overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );
} 