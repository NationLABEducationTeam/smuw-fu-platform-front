'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/lib/theme-provider'

// 피처 데이터
const features = [
  {
    id: 'feature1',
    title: 'F&B 관련 검색어 분석',
    description: '식품 및 음료 산업에 관련된 검색어 트렌드를 분석하여 소비자의 관심사와 시장 동향을 파악합니다. 실시간으로 변화하는 검색 패턴을 통해 새로운 비즈니스 기회를 발견하세요.',
    image: '/feature1.jpeg',
    alt: 'F&B 관련 검색어 분석 이미지',
    textPosition: 'left',
    color: 'from-blue-600 to-indigo-500',
    href: '/search',
    keywords: ['트렌드', '검색어', '데이터', '분석', '인사이트']
  },
  {
    id: 'feature2',
    title: '트렌드 및 현황 분석 (요식업)',
    description: '요식업계의 최신 트렌드와 시장 현황을 종합적으로 분석합니다. 소비자 선호도, 경쟁 환경, 성장 기회 등 다양한 측면에서 데이터 기반 인사이트를 제공합니다.',
    image: '/feature2.jpeg',
    alt: '트렌드 및 현황 분석 이미지',
    textPosition: 'right',
    color: 'from-indigo-500 to-purple-500',
    href: '/dashboard',
    keywords: ['시장 동향', '소비자 선호도', '경쟁 분석', '성장 기회', '데이터']
  },
  {
    id: 'feature3',
    title: '지역 상권 분석',
    description: '특정 지역의 상권 데이터를 분석하여 최적의 비즈니스 위치를 찾아드립니다. 유동인구, 경쟁업체, 소비 패턴 등 다양한 요소를 고려한 정밀한 상권 분석으로 성공적인 창업을 지원합니다.',
    image: '/feature3.jpeg',
    alt: '지역 상권 분석 이미지',
    textPosition: 'left',
    color: 'from-purple-500 to-pink-500',
    href: '/map',
    keywords: ['상권', '위치 분석', '유동인구', '경쟁업체', '소비 패턴']
  },
  {
    id: 'feature4',
    title: '소셜 미디어 트렌드 분석',
    description: '소셜 미디어 플랫폼에서의 F&B 관련 대화와 트렌드를 분석합니다. 소비자의 실시간 반응과 의견을 파악하여 마케팅 전략 수립과 제품 개발에 활용할 수 있습니다.',
    image: '/feature4.jpeg',
    alt: '소셜 미디어 트렌드 분석 이미지',
    textPosition: 'right',
    color: 'from-pink-500 to-rose-500',
    href: '/sns',
    keywords: ['소셜 미디어', '트렌드', '소비자 반응', '마케팅', '인사이트']
  },
  {
    id: 'feature5',
    title: 'AI 챗봇',
    description: 'AWS Bedrock의 강력한 AI 기술을 활용한 챗봇으로 데이터 분석과 비즈니스 인사이트를 실시간으로 제공합니다. 복잡한 질문에도 정확하고 유용한 답변을 받아보세요.',
    image: '/feature5.jpeg',
    alt: 'AI 챗봇 이미지',
    textPosition: 'left',
    color: 'from-rose-500 to-red-500',
    href: '/chatbot',
    keywords: ['AI', '챗봇', '데이터 분석', '인사이트', 'AWS Bedrock']
  }
]

// 마우스 커서 효과 컴포넌트
const MouseFollower = () => {
  const cursorRef = useRef<HTMLDivElement>(null)
  const cursorDotRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  
  useEffect(() => {
    // RAF를 사용한 부드러운 커서 이동
    let mouseX = -100
    let mouseY = -100
    let cursorX = -100
    let cursorY = -100
    let dotX = -100
    let dotY = -100
    let cursorSpeed = 0.15 // 큰 커서 이동 속도
    let dotSpeed = 0.35 // 작은 점 이동 속도
    
    const updateCursor = () => {
      // 큰 커서 업데이트
      const diffX = mouseX - cursorX
      const diffY = mouseY - cursorY
      
      cursorX += diffX * cursorSpeed
      cursorY += diffY * cursorSpeed
      
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`
      }
      
      // 작은 점 업데이트 (더 빠르게 움직임)
      const dotDiffX = mouseX - dotX
      const dotDiffY = mouseY - dotY
      
      dotX += dotDiffX * dotSpeed
      dotY += dotDiffY * dotSpeed
      
      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`
      }
      
      requestAnimationFrame(updateCursor)
    }
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      setIsVisible(true)
    }
    
    const handleMouseLeave = () => {
      mouseX = -100
      mouseY = -100
      setIsVisible(false)
    }
    
    // 호버 상태 감지
    const handleMouseOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).tagName === 'BUTTON' || 
          (e.target as HTMLElement).tagName === 'A' ||
          (e.target as HTMLElement).closest('button') ||
          (e.target as HTMLElement).closest('a')) {
        setIsHovering(true)
      } else {
        setIsHovering(false)
      }
    }
    
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('mouseover', handleMouseOver, { passive: true })
    
    // 애니메이션 시작
    const animationId = requestAnimationFrame(updateCursor)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('mouseover', handleMouseOver)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <>
      {/* 큰 커서 링 */}
      <motion.div
        ref={cursorRef}
        className="fixed w-8 h-8 rounded-full pointer-events-none z-50 mix-blend-difference hidden md:block"
        style={{
          left: 0,
          top: 0,
          backgroundColor: 'transparent',
          border: '1.5px solid rgba(255, 255, 255, 0.8)',
          opacity: isVisible ? 1 : 0,
          willChange: 'transform',
        }}
        animate={{ 
          scale: isHovering ? 1.5 : 1,
          opacity: isVisible ? 1 : 0
        }}
        transition={{ duration: 0.2 }}
      />
      
      {/* 작은 커서 점 */}
      <motion.div
        ref={cursorDotRef}
        className="fixed w-2 h-2 rounded-full pointer-events-none z-50 mix-blend-difference hidden md:block"
        style={{
          left: 0,
          top: 0,
          backgroundColor: 'rgba(255, 255, 255, 1)',
          willChange: 'transform',
        }}
        animate={{ 
          opacity: isVisible ? 1 : 0,
          scale: isHovering ? 0 : 1
        }}
        transition={{ duration: 0.1 }}
      />
    </>
  )
}

// 키워드 태그 컴포넌트
const KeywordTag = ({ keyword, color }: { keyword: string, color: string }) => {
  return (
    <motion.span
      className={`inline-block px-3 py-1 text-xs rounded-full bg-gradient-to-r ${color} text-white font-medium mr-2 mb-2 shadow-sm`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ 
        scale: 1.05, 
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
      }}
      transition={{ duration: 0.2 }}
    >
      #{keyword}
    </motion.span>
  )
}

// 개별 피처 섹션 컴포넌트
const FeatureSection = ({ feature, index }: { feature: typeof features[0], index: number }) => {
  const router = useRouter()
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: false, amount: 0.2, margin: "-10% 0px -10% 0px" })
  const { theme } = useTheme()
  
  // 스크롤 기반 애니메이션 추가
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  })
  
  const opacity = useTransform(scrollYProgress, 
    [0, 0.2, 0.8, 1], 
    [0, 1, 1, 0]
  )
  
  const textX = useTransform(scrollYProgress, 
    [0, 0.2, 0.8, 1], 
    [feature.textPosition === 'left' ? -50 : 50, 0, 0, feature.textPosition === 'left' ? -50 : 50]
  )
  
  const imageScale = useTransform(scrollYProgress, 
    [0, 0.2, 0.8, 1], 
    [0.9, 1, 1, 0.9]
  )
  
  const imageY = useTransform(scrollYProgress, 
    [0, 0.2, 0.8, 1], 
    [50, 0, 0, 50]
  )
  
  // 배경 패럴랙스 효과
  const bgY = useTransform(scrollYProgress, 
    [0, 1], 
    [0, -30]
  )
  
  // 텍스트 애니메이션을 위한 문자 분리 - 성능 최적화를 위해 단어 단위로 변경
  const titleWords = feature.title.split(' ')
  
  // 지연 로딩을 위한 상태
  const [showKeywords, setShowKeywords] = useState(false)
  
  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        setShowKeywords(true)
      }, 800)
      
      return () => clearTimeout(timer)
    }
  }, [isInView])
  
  return (
    <div 
      ref={sectionRef}
      className={`
        min-h-screen w-full flex items-center justify-center py-20 relative overflow-hidden
        ${index % 2 === 0 ? 'bg-gray-50 dark:bg-[#051b2c]' : 'bg-white dark:bg-[#0a2540]'}
      `}
    >
      {/* 배경 패턴 효과 */}
      <motion.div 
        className="absolute inset-0 opacity-5 dark:opacity-10 will-change-transform"
        style={{ y: bgY }}
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-30" />
        <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-10 mix-blend-overlay`} />
      </motion.div>
      
      <motion.div 
        style={{ opacity }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10"
      >
        <div className={`
          grid grid-cols-1 ${feature.textPosition === 'left' 
            ? 'lg:grid-cols-[1fr,1.2fr]' 
            : 'lg:grid-cols-[1.2fr,1fr]'
          } gap-12 items-center
        `}>
          {/* 텍스트 섹션 */}
          <motion.div 
            className={`${feature.textPosition === 'right' ? 'lg:order-2' : ''} space-y-8 will-change-transform`}
            style={{ x: textX }}
          >
            <div className="space-y-6">
              {/* 애니메이션 타이틀 - 단어 단위로 변경 */}
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-['Geist Mono'] tracking-tight flex flex-wrap">
                {titleWords.map((word, i) => (
                  <motion.span
                    key={i}
                    className={`inline-block mr-[0.25em] bg-clip-text text-transparent bg-gradient-to-r ${feature.color} will-change-transform`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: 0.1 * i,
                      ease: [0.16, 1, 0.3, 1] 
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
              </h2>
              
              <motion.p 
                className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {feature.description}
              </motion.p>
              
              {/* 키워드 태그 - 지연 로딩 적용 */}
              {showKeywords && (
                <motion.div 
                  className="flex flex-wrap mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  {feature.keywords.map((keyword, i) => (
                    <KeywordTag 
                      key={i} 
                      keyword={keyword} 
                      color={feature.color} 
                    />
                  ))}
                </motion.div>
              )}
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Button 
                className={`
                  relative overflow-hidden group
                  bg-gradient-to-r ${feature.color} hover:opacity-90 transition-all
                  text-white font-medium py-6 px-8 rounded-full text-lg
                  shadow-lg hover:shadow-xl
                `}
                onClick={() => router.push(feature.href)}
              >
                <span className="relative z-10 flex items-center">
                  자세히 알아보기 
                  <motion.span
                    className="inline-block ml-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ 
                      repeat: Infinity, 
                      repeatType: "reverse", 
                      duration: 1.5, // 더 느리게 변경
                      ease: "easeInOut" 
                    }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.span>
                </span>
                
                {/* 버튼 호버 효과 */}
                <motion.div 
                  className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1.5, opacity: 0.2 }}
                  transition={{ duration: 0.4 }}
                />
              </Button>
            </motion.div>
          </motion.div>
          
          {/* 이미지 섹션 */}
          <motion.div 
            className={`${feature.textPosition === 'right' ? 'lg:order-1' : ''} relative will-change-transform`}
            style={{ 
              scale: imageScale,
              y: imageY
            }}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-2xl">
              {/* 이미지 */}
              <Image
                src={feature.image}
                alt={feature.alt}
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
                quality={85}
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEDQIHq4C7aQAAAABJRU5ErkJggg=="
              />
              
              {/* 그라디언트 오버레이 */}
              <div className={`
                absolute inset-0 bg-gradient-to-tr ${feature.color} 
                opacity-20 mix-blend-overlay
              `} />
              
              {/* 이미지 테두리 효과 */}
              <div className="absolute inset-0 border border-white/10 rounded-2xl" />
              
              {/* 이미지 하이라이트 효과 - 성능 최적화를 위해 조건부 렌더링 */}
              {isInView && (
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 opacity-0 hover:opacity-20 transition-opacity duration-700"
                  initial={{ rotate: -45, scale: 1.5 }}
                  animate={{ rotate: -45, x: ['100%', '-100%'] }}
                  transition={{ 
                    x: { repeat: Infinity, duration: 3, ease: "linear" }, // 더 느리게 변경
                    opacity: { duration: 0.3 }
                  }}
                />
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

// 헤더 섹션 컴포넌트
const HeaderSection = () => {
  const headerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: headerRef,
    offset: ["start start", "end start"]
  })
  
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9])
  
  // 배경 효과 애니메이션
  const bgY = useTransform(scrollYProgress, [0, 1], [0, -50])
  const gridOpacity = useTransform(scrollYProgress, [0, 0.5], [0.2, 0])
  
  // 타이틀 애니메이션
  const titleChars = "혁신적인 기능".split('')
  
  return (
    <div ref={headerRef} className="min-h-[90vh] relative flex items-center justify-center overflow-hidden will-change-transform">
      {/* 배경 효과 */}
      <motion.div 
        style={{ y: bgY }}
        className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white dark:from-[#051b2c] dark:to-[#0a2540] will-change-transform" 
      />
      <motion.div 
        style={{ 
          y: bgY, 
          opacity: gridOpacity 
        }}
        className="absolute inset-0 bg-[url('/grid.svg')] bg-center will-change-transform"
        initial={{ backgroundSize: '30px 30px' }}
      />
      
      {/* 동적 배경 그라디언트 - 성능 최적화를 위해 애니메이션 간소화 */}
      <motion.div 
        className="absolute inset-0 opacity-30 dark:opacity-20 will-change-transform"
        animate={{ 
          background: [
            'linear-gradient(45deg, rgba(59, 130, 246, 0.2) 0%, rgba(79, 70, 229, 0.2) 100%)',
            'linear-gradient(45deg, rgba(79, 70, 229, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
            'linear-gradient(45deg, rgba(168, 85, 247, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
            'linear-gradient(45deg, rgba(236, 72, 153, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)'
          ]
        }}
        transition={{ 
          duration: 30, // 더 느리게 변경하여 성능 향상
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* 헤더 콘텐츠 */}
      <motion.div 
        style={{ opacity, y, scale }}
        className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 will-change-transform"
      >
        <div className="flex justify-center overflow-hidden">
          {titleChars.map((char, i) => (
            <motion.span
              key={i}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-[#1174ed] dark:to-blue-400 font-['Geist Mono'] tracking-tight inline-block will-change-transform"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.05 * i, // 딜레이 감소
                ease: [0.16, 1, 0.3, 1]
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </div>
        
        {/* 설명 텍스트와 스크롤 버튼 사이에 충분한 공간 확보 */}
        <div className="relative pb-24"> {/* 하단 패딩 더 증가 */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }} // 딜레이 감소
            className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto"
          >
            AI 기반 스마트 푸드테크 솔루션으로 식품 산업의 미래를 선도하세요. 
            데이터 기반 인사이트와 혁신적인 기술로 비즈니스 성공을 지원합니다.
          </motion.p>
        </div>
      </motion.div>
      
      {/* 스크롤 다운 인디케이터 - 스타일 개선 */}
      <motion.div 
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 1, 
          ease: "easeOut",
          delay: 1
        }}
      >
        <motion.div 
          className="flex flex-col items-center bg-white/20 dark:bg-black/20 backdrop-blur-md px-6 py-3 rounded-full shadow-lg"
          whileHover={{ y: 5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-sm text-gray-700 dark:text-gray-200 mb-1 font-['Geist Mono'] font-medium">스크롤 하세요</p>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ 
              repeat: Infinity, 
              duration: 2,
              ease: "easeInOut" 
            }}
          >
            <ChevronDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default function FeatureShowcase() {
  // 성능 최적화를 위한 지연 로딩
  const [showMouseFollower, setShowMouseFollower] = useState(false)
  
  useEffect(() => {
    // 초기 렌더링 후 마우스 팔로워 활성화
    const timer = setTimeout(() => {
      setShowMouseFollower(true)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <div className="relative w-full">
      {showMouseFollower && <MouseFollower />}
      <HeaderSection />
      
      {features.map((feature, index) => (
        <FeatureSection 
          key={feature.id} 
          feature={feature} 
          index={index} 
        />
      ))}
    </div>
  )
} 