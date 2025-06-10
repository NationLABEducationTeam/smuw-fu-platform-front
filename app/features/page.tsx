'use client'

import dynamic from 'next/dynamic'
import { ThemeToggle } from '@/components/3d-features/ThemeToggle'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

// 동적 임포트로 FeatureShowcase 컴포넌트 로드
const FeatureShowcase = dynamic(() => import('@/components/features/FeatureShowcase'), {
  ssr: false,
  loading: () => <LoadingScreen />
})

// 로딩 화면 컴포넌트
const LoadingScreen = () => {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-[#051b2c] dark:to-[#0a2540]">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <div className="absolute inset-0 rounded-full h-16 w-16 border-t-2 border-blue-500 animate-ping opacity-20"></div>
      </div>
      <p className="mt-4 text-blue-600 dark:text-blue-400 font-['Geist Mono'] animate-pulse">
        로딩 중...
      </p>
    </div>
  )
}

export default function FeaturesPage() {
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    
    // 페이지 로딩 상태 관리
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    
    return () => {
      clearTimeout(timer)
    }
  }, [])

  if (!mounted) return null

  return (
    <motion.main 
      className="min-h-screen bg-white dark:bg-[#051b2c] text-gray-900 dark:text-white overflow-hidden w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ThemeToggle />
      <FeatureShowcase />
    </motion.main>
  )
} 