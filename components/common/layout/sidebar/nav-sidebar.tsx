'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Menu, X, TrendingUp, Users, DollarSign, BarChart, Search, Map, MessageSquare, HelpCircle, AlertTriangle, LogOut, LogIn, UserPlus, Sparkles, Mail, Info, ChevronLeft } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

// 사이드바 컨텍스트 생성
interface SidebarContextType {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export const SidebarContext = createContext<SidebarContextType>({
  isSidebarOpen: false,
  setIsSidebarOpen: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

// 사이드바 Provider 컴포넌트
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // 기본값을 설정하고, useEffect에서 업데이트
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // 클라이언트 사이드에서만 초기 상태 설정
  useEffect(() => {
    // 스토리지에서 사이드바 상태 확인
    const wasExplicitlyClosed = localStorage.getItem('sidebarClosed') === 'true';
    const isDesktop = window.innerWidth >= 1024;
    
    // 데스크톱이고 명시적으로 닫히지 않았으면 열기
    if (isDesktop && !wasExplicitlyClosed) {
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false);
    }
  }, []);

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, setIsSidebarOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const userName = "민숙명"

const navGroups: NavGroup[] = [
  {
    title: "소개",
    items: [
      {
        icon: Sparkles,
        label: "기능 소개",
        href: "/features"
      }
    ]
  },
  {
    title: "푸드테크 트렌드",
    items: [
      {
        icon: TrendingUp,
        label: "요식업/푸드테크 트렌드",
        href: "/dashboard"
      },
      {
        icon: Search,
        label: "키워드 검색",
        href: "/search"
      }
    ]
  },
  {
    title: "소비자 패턴",
    items: [
      {
        icon: Map,
        label: "상세 지도",
        href: "/map"
      },
      {
        icon: BarChart,
        label: "SNS 분석",
        href: "/sns"
      }
    ]
  },
  {
    title: "시장 기회",
    items: [
      {
        icon: DollarSign,
        label: "창/폐업 분석",
        href: "/business-analysis"
      },
      {
        icon: Users,
        label: "AI 창업 진단",
        href: "/startup-diagnosis"
      }
    ]
  },
  {
    title: "챗봇",
    items: [
      {
        icon: MessageSquare,
        label: "AI 에이젼트",
        href: "/chatbot"
      }
    ]
  }
];

export function NavSidebar() {
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const isChatbotPage = pathname === '/chatbot';

  // 화면 크기 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg 브레이크포인트
      if (window.innerWidth >= 1024) {
        // 데스크톱에서 처음 열릴 때는 사이드바를 자동으로 열어둡니다
        // 하지만 사용자가 명시적으로 닫은 경우는 유지합니다
        const wasExplicitlyClosed = localStorage.getItem('sidebarClosed') === 'true';
        if (!wasExplicitlyClosed) {
          setIsSidebarOpen(true);
        }
      } else {
        // 모바일에서는 기본적으로 닫혀있는 상태로 시작
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsSidebarOpen]);

  // 사용자가 명시적으로 사이드바를 닫았을 때 상태 저장
  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    
    // 사용자가 명시적으로 닫았음을 기록
    if (!newState && !isMobile) {
      localStorage.setItem('sidebarClosed', 'true');
    } else if (newState && !isMobile) {
      localStorage.removeItem('sidebarClosed');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // chatbot 페이지에서는 NavSidebar를 숨김
  if (isChatbotPage) {
    return null;
  }

  return (
    <>
      {/* 토글 버튼 - 항상 표시되는 버튼으로 변경 */}
      <motion.button
        onClick={toggleSidebar}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className={`
          fixed z-50 p-2.5 bg-white/90 backdrop-blur-sm
          rounded-full shadow-lg hover:shadow-xl
          transition-all duration-300 ease-in-out
          border border-gray-100 dark:border-gray-800
          ${isSidebarOpen 
            ? 'top-6 sm:left-[260px] md:left-[280px] lg:left-[300px]' 
            : 'top-6 left-6'
          }
        `}
        aria-label={isSidebarOpen ? "사이드바 닫기" : "사이드바 열기"}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isSidebarOpen ? 'close' : 'open'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {isSidebarOpen ? (
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.button>

      {/* 사이드바 */}
      <AnimatePresence mode="wait">
        <motion.aside 
          key={`sidebar-${isSidebarOpen}`}
          initial={{ x: isSidebarOpen ? 0 : -320 }}
          animate={{ x: isSidebarOpen ? 0 : -320 }}
          exit={{ x: -320 }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 40,
            duration: 0.3 
          }}
          className={`
            fixed top-0 left-0 h-screen
            w-[280px] sm:w-[300px] lg:w-[320px]
            bg-gradient-to-br from-[#1d556f] to-[#288fb4] dark:from-[#1d556f] dark:to-[#288fb4]/90
            z-40 overflow-y-auto
            border-r border-[#efddb2]/30 dark:border-[#efddb2]/20
          `}
        >
          {/* 로고 섹션 */}
          <div className="relative w-full px-4 sm:px-6 py-6 sm:py-8 border-b border-[#efddb2]/30 dark:border-[#efddb2]/20">
            <Link 
              href="/" 
              className="block" 
              onClick={() => isMobile && setIsSidebarOpen(false)}
            >
              <Image
                src="/smwu-sidebar-logo.png"
                alt="Logo"
                width={400}
                height={104}
                className="w-full h-auto object-contain"
                priority
              />
            </Link>   
          </div>

          {/* 사용자 정보 */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#efddb2]/30 dark:border-[#efddb2]/20">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-[#fa360a] to-[#288fb4] flex items-center justify-center text-white font-bold text-sm sm:text-base">
                  {user.username && user.username.length > 0 ? user.username[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-['Geist Mono'] text-[#efddb2] dark:text-[#efddb2]">
                    <span className="font-bold">{user.username || '사용자'}</span>님
                  </p>
                  <p className="text-[10px] sm:text-xs text-[#efddb2]/70 dark:text-[#efddb2]/70 font-['Geist Mono']">
                    일반 사용자
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-[#efddb2] hover:text-white hover:bg-[#fa360a]/30"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs sm:text-sm font-['Geist Mono'] text-[#efddb2] dark:text-[#efddb2]">
                  로그인이 필요합니다
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#efddb2] hover:text-white hover:bg-[#288fb4]/30"
                    onClick={() => {
                      router.push('/auth/login');
                      if (isMobile) setIsSidebarOpen(false);
                    }}
                  >
                    <LogIn className="w-4 h-4 mr-1" />
                    <span className="text-xs">로그인</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#efddb2] hover:text-white hover:bg-[#288fb4]/30"
                    onClick={() => {
                      router.push('/auth/signup');
                      if (isMobile) setIsSidebarOpen(false);
                    }}
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    <span className="text-xs">회원가입</span>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* 네비게이션 메뉴 */}
          <nav className="flex-1 px-2 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-10">
            {navGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-2">
                <div className="flex items-center gap-2 px-2 sm:px-3 mb-3">
                  <h2 className="text-xs sm:text-sm lg:text-base font-bold tracking-wider text-[#efddb2] dark:text-[#efddb2] flex items-center">
                    {group.title}
                  </h2>
                  <div className="flex-1 h-[1px] bg-[#efddb2]/30 dark:bg-[#efddb2]/30" />
                </div>
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link 
                      key={item.href} 
                      href={item.href} 
                      className="block w-full"
                      onClick={() => isMobile && setIsSidebarOpen(false)}
                    >
                      <Button 
                        variant="ghost" 
                        className={`
                          w-full px-2 sm:px-3 py-2 sm:py-2.5
                          flex items-center justify-start
                          text-xs sm:text-sm lg:text-base font-['Geist Mono']
                          transition-all duration-300
                          rounded-lg
                          ${isActive 
                            ? 'bg-gradient-to-r from-[#fa360a] to-[#fa360a]/80 text-white hover:from-[#fa360a] hover:to-[#fa360a]/90' 
                            : 'text-white/90 hover:text-white hover:bg-[#288fb4]/30'
                          }
                        `}
                      >
                        <item.icon className="mr-2 h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                        <span>{item.label}</span>
                      </Button>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* FAQ 섹션 */}
          <div className="p-2 sm:p-4 mt-auto border-t border-[#8aacff]/30 dark:border-[#8aacff]/20 space-y-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full bg-gradient-to-r from-[#efddb2]/20 to-[#efddb2]/10 text-[#efddb2] hover:text-white hover:from-[#fa360a]/30 hover:to-[#fa360a]/20 font-semibold transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-['Geist Mono'] rounded-lg py-1.5 sm:py-2"
                >
                  <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  FAQ 보기
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto bg-gradient-to-br from-[#1d556f] to-[#288fb4] dark:from-[#1d556f] dark:to-[#288fb4]/90 text-white border-none shadow-xl">
                <DialogHeader>
                  <div className="flex items-center gap-3 pb-4 border-b border-[#efddb2]/30 dark:border-[#efddb2]/20">
                    <div className="w-10 h-10 rounded-full bg-[#efddb2]/20 flex items-center justify-center">
                      <HelpCircle className="h-5 w-5 text-[#efddb2]" />
                    </div>
                    <DialogTitle className="text-xl text-[#efddb2] dark:text-[#efddb2] font-bold font-['Geist Mono']">
                      자주 묻는 질문 (FAQ)
                    </DialogTitle>
                  </div>
                </DialogHeader>
                
                <div className="mt-6 space-y-5">
                  <div className="relative">
                    <div className="absolute -left-6 top-5 bottom-0 w-0.5 bg-gradient-to-b from-[#efddb2] to-transparent"></div>
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-[#288fb4]/30 dark:bg-[#288fb4]/30 p-5 rounded-lg border border-[#efddb2]/20"
                    >
                      <h4 className="font-bold text-[#efddb2] dark:text-[#efddb2] mb-3 flex items-center gap-2 font-['Geist Mono']">
                        <div className="w-8 h-8 rounded-full bg-[#efddb2]/20 flex items-center justify-center shrink-0">
                          <HelpCircle className="w-4 h-4 text-[#efddb2]" />
                        </div>
                        <span>이 서비스는 어떤 기능을 제공하나요?</span>
                      </h4>
                      <div className="text-white/90 dark:text-white/90 ml-10 space-y-2">
                        <p className="font-['Geist Mono'] leading-relaxed">
                          저희 서비스는 다음과 같은 다양한 기능을 제공합니다:
                        </p>
                        <ul className="list-disc pl-5 space-y-1.5 font-['Geist Mono'] text-sm">
                          <li>푸드테크 트렌드 분석과 실시간 인사이트</li>
                          <li>데이터 기반 소비자 패턴 파악</li>
                          <li>AI 창업 진단 및 시장 기회 분석</li>
                          <li>키워드 검색 및 분석 도구 제공</li>
                          <li>지역 기반 상권 분석 및 시각화</li>
                          <li>AI 챗봇을 통한 개인화된 추천</li>
                        </ul>
                      </div>
                    </motion.div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute -left-6 top-5 bottom-0 w-0.5 bg-gradient-to-b from-[#efddb2] to-transparent"></div>
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="bg-[#288fb4]/30 dark:bg-[#288fb4]/30 p-5 rounded-lg border border-[#efddb2]/20"
                    >
                      <h4 className="font-bold text-[#efddb2] dark:text-[#efddb2] mb-3 flex items-center gap-2 font-['Geist Mono']">
                        <div className="w-8 h-8 rounded-full bg-[#efddb2]/20 flex items-center justify-center shrink-0">
                          <HelpCircle className="w-4 h-4 text-[#efddb2]" />
                        </div>
                        <span>데이터는 어떻게 업데이트되나요?</span>
                      </h4>
                      <div className="text-white/90 dark:text-white/90 ml-10 space-y-2">
                        <p className="font-['Geist Mono'] leading-relaxed">
                          데이터는 다음과 같은 방식으로 업데이트됩니다:
                        </p>
                        <ul className="list-disc pl-5 space-y-1.5 font-['Geist Mono'] text-sm">
                          <li>실시간 API 연동을 통한 최신 트렌드 데이터 수집</li>
                          <li>주간/월간 정기 업데이트로 시장 동향 반영</li>
                          <li>AI 모델을 활용한 데이터 정확성 검증 및 보완</li>
                          <li>사용자 피드백을 반영한 지속적인 데이터 품질 개선</li>
                        </ul>
                      </div>
                    </motion.div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute -left-6 top-5 bottom-0 w-0.5 bg-gradient-to-b from-[#efddb2] to-transparent"></div>
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                      className="bg-[#288fb4]/30 dark:bg-[#288fb4]/30 p-5 rounded-lg border border-[#efddb2]/20"
                    >
                      <h4 className="font-bold text-[#efddb2] dark:text-[#efddb2] mb-3 flex items-center gap-2 font-['Geist Mono']">
                        <div className="w-8 h-8 rounded-full bg-[#efddb2]/20 flex items-center justify-center shrink-0">
                          <HelpCircle className="w-4 h-4 text-[#efddb2]" />
                        </div>
                        <span>회원가입은 어떻게 하나요?</span>
                      </h4>
                      <div className="text-white/90 dark:text-white/90 ml-10 space-y-2">
                        <p className="font-['Geist Mono'] leading-relaxed">
                          우측 상단의 '회원가입' 버튼을 클릭하여 간단한 정보 입력 후 가입할 수 있습니다. 소셜 로그인(구글, 네이버)도 지원합니다.
                        </p>
                        <div className="bg-[#efddb2]/10 p-3 rounded-md mt-2">
                          <p className="text-[#efddb2] text-sm flex items-start gap-2">
                            <div className="pt-0.5">
                              <AlertTriangle className="w-4 h-4" />
                            </div>
                            <span>회원가입 시 개인정보 처리방침 및 이용약관에 동의하셔야 합니다.</span>
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                  
                  <div className="pt-4 text-center">
                    <Button
                      variant="outline"
                      className="bg-transparent border-[#efddb2]/30 text-[#efddb2] hover:bg-[#efddb2]/10 hover:text-white font-['Geist Mono']"
                      onClick={() => window.open('mailto:support@smwu-foodtech.com')}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      더 궁금한 점이 있으신가요?
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full bg-gradient-to-r from-[#f97316]/20 to-[#fa360a]/10 text-[#efddb2] hover:text-white hover:from-[#fa360a]/40 hover:to-[#fa360a]/30 font-semibold transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-['Geist Mono'] rounded-lg py-1.5 sm:py-2 relative overflow-hidden group"
                >
                  <div className="absolute -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-10 group-hover:animate-shine" />
                  <div className="relative z-10 flex items-center justify-center gap-1 sm:gap-2">
                    <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-amber-300" />
                    <span>오류 신고하기</span>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gradient-to-br from-[#1d556f] to-[#288fb4] dark:from-[#1d556f] dark:to-[#288fb4]/90 text-white border-none shadow-xl">
                <DialogHeader>
                  <div className="flex items-center gap-3 pb-4 border-b border-[#efddb2]/30 dark:border-[#efddb2]/20">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-amber-300" />
                    </div>
                    <DialogTitle className="text-xl text-[#efddb2] dark:text-[#efddb2] font-bold font-['Geist Mono']">
                      오류 신고하기
                    </DialogTitle>
                  </div>
                </DialogHeader>
                
                <div className="mt-6 space-y-4">
                  <p className="text-white/90 font-['Geist Mono']">
                    발견하신 오류를 신고해 주시면 빠르게 수정하겠습니다. 아래 버튼을 클릭하면 오류 신고 페이지로 이동합니다.
                  </p>
                  
                  <div className="bg-[#efddb2]/10 p-4 rounded-md">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-[#efddb2] shrink-0 mt-0.5" />
                      <div className="space-y-2">
                        <p className="text-[#efddb2] text-sm font-medium">오류 신고 시 포함해주세요:</p>
                        <ul className="list-disc pl-5 text-white/90 text-sm space-y-1">
                          <li>발생한 오류의 구체적인 내용</li>
                          <li>오류 발생 시간 및 사용 환경</li>
                          <li>재현 방법 (가능한 경우)</li>
                          <li>스크린샷 또는 오류 메시지</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <DialogTrigger asChild>
                      <Button variant="outline" className="border-[#efddb2]/30 text-[#efddb2] hover:bg-[#efddb2]/10">
                        취소
                      </Button>
                    </DialogTrigger>
                    <Button 
                      variant="default" 
                      className="bg-amber-500 hover:bg-amber-600 text-black"
                      onClick={() => window.open('https://docs.google.com/spreadsheets/d/17gRmHGgNDQkxADYYL8Q2U3scDPYG4-pV4YH9b5uObuc/edit?usp=sharing')}
                    >
                      오류 신고 페이지로 이동
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.aside>
      </AnimatePresence>

      {/* 모바일에서 사이드바가 열렸을 때 오버레이 추가 */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
} 