'use client'

import dynamic from 'next/dynamic'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { NavSidebar } from '@/components/common/layout/sidebar/nav-sidebar'
import { useRef, useEffect, useState } from 'react'
import { ThemeToggle } from '@/components/3d-features/ThemeToggle'
import { useTheme } from '@/lib/theme-provider'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

// 동적 임포트 최적화
const Logo3DCanvas = dynamic(() => import('@/components/3d-features/Logo3DCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
  )
})

const Features3D = dynamic(() => import('@/components/3d-features/Features3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
  )
})

// 애니메이션 변형
const fadeInUpVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay,
      ease: "easeOut"
    }
  })
}

const buttonVariants = {
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  },
  tap: {
    scale: 0.95
  }
}

// 컨테이너 애니메이션
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
}

export default function Home() {
  const containerRef = useRef(null)
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -150])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 150])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95])

  const handleLogout = async () => {
    await logout();
    // 페이지 새로고침
    window.location.reload();
  };

  const handleStartChat = () => {
    router.push('/chatbot');
  };

  if (!mounted) return null

  return (
    <main ref={containerRef} className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-[#051b2c] dark:to-[#0a2540] text-gray-900 dark:text-white overflow-hidden">
      <NavSidebar />
      <ThemeToggle />

      {/* 히어로 섹션 - lg 브레이크포인트에서 사이드바 너비만큼 마진 추가 */}
      <section className={`
        relative min-h-screen flex items-center justify-center 
        py-12 sm:py-20 md:py-32 px-4 sm:px-6 lg:px-8
        ${!isMobile ? 'lg:ml-[320px]' : ''} // 사이드바 너비만큼 마진
        transition-all duration-300
      `}>
        {/* 배경 효과 */}
        <motion.div 
          style={{ y: y1 }}
          className="absolute inset-0 bg-gradient-to-r from-blue-100/30 to-indigo-100/30 dark:from-[#1174ed]/20 dark:to-blue-500/20"
        />
        
        {/* 그리드 패턴 */}
        <motion.div 
          style={{ y: y2 }}
          className="absolute inset-0"
        >
          <div 
            className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20 dark:opacity-10"
            style={{
              maskImage: 'linear-gradient(to bottom, white, transparent)',
              WebkitMaskImage: 'linear-gradient(to bottom, white, transparent)',
              backgroundSize: '30px 30px'
            }}
          />
        </motion.div>

        {/* 메인 콘텐츠 - 최대 너비 조정 */}
        <motion.div 
          style={{ y: y1, opacity, scale }}
          className="relative z-10 text-center w-full max-w-5xl mx-auto space-y-8 sm:space-y-12"
        >
          {/* 로고 섹션 */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-8 w-full">
            <div className="w-full max-w-[280px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px] transition-all duration-300">
              <Logo3DCanvas />
            </div>
            <motion.div 
              className="relative group w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] md:w-[140px] md:h-[140px] lg:w-[180px] lg:h-[180px] transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur opacity-50 group-hover:opacity-75 transition duration-500"></div>
              <div className="relative w-[120px] h-[120px] md:w-[180px] md:h-[180px] bg-white rounded-full p-4 ring-1 ring-gray-200/50 backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 to-indigo-50 rounded-full"></div>
                <div className="relative h-full w-full">
                  <Image
                    src="/smwu-mainpage-logo.png"
                    alt="SmartFoodTech Logo"
                    fill
                    className="object-contain p-3"
                    priority
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* 타이틀 */}
          <motion.h1 
            variants={fadeInUpVariant}
            initial="hidden"
            animate="visible"
            custom={0}
            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-[#1174ed] dark:to-blue-400 font-['Geist Mono'] tracking-tight px-4"
          >
            AI 기반 스마트 푸드테크 솔루션
          </motion.h1>

          {/* CTA 버튼 */}
          <motion.div
            variants={containerVariants}
            className="flex flex-col sm:flex-row gap-4 mt-8"
            initial="hidden"
            animate="visible"
          >
            {/* 버튼 완전히 제거 */}
          </motion.div>
        </motion.div>
      </section>

      {/* 특징 섹션도 사이드바 너비 고려 */}
      <motion.section
        className={`${!isMobile ? 'lg:ml-[320px]' : ''} transition-all duration-300`}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <Features3D />
      </motion.section>
    </main>
  )
}

