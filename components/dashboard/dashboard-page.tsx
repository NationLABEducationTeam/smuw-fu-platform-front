'use client'

import { useState, useEffect, useRef } from 'react'
import { StatsGrid } from '@/components/dashboard/stats'
import { TrendChart } from '@/components/dashboard/charts'
import { TrendingKeywordsTable } from '@/components/dashboard/tables'
import { VideoSuggestion } from '@/components/dashboard/youtube'
import { getTrendingData, getTrendingKeywords, fetchYouTubeVideos } from '@/utils/trending-data'
import { TimeStance, TrendingKeyword, TrendingDataItem, ChartDataPoint } from '@/types/dashboard'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CorpTrend } from '@/components/dashboard/chart-corps'
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ChevronDown, 
  BarChart2, 
  TrendingUp, 
  Youtube, 
  RefreshCw, 
  Info, 
  AlertCircle, 
  Lightbulb,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  Sparkles,
  Zap,
  Layers,
  PieChart
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"

export function DashboardPage() {
  // State management
  const [timeStance, setTimeStance] = useState<TimeStance>('weekly')
  const [trendingData, setTrendingData] = useState<TrendingDataItem[]>([])
  const [trendingKeywords, setTrendingKeywords] = useState<TrendingKeyword[]>([])
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [totalSearches, setTotalSearches] = useState(0)
  const [biggestGainer, setBiggestGainer] = useState<TrendingKeyword | null>(null)
  const [biggestLoser, setBiggestLoser] = useState<TrendingKeyword | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('trends')
  const [showInsight, setShowInsight] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [showWelcome, setShowWelcome] = useState(true)
  
  // Refs for scroll animations
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })
  
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.8])
  const headerScale = useTransform(scrollYProgress, [0, 0.1], [1, 0.98])
  const headerY = useTransform(scrollYProgress, [0, 0.1], [0, -10])

  // Fetch data with simulated loading progress
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      setLoadingProgress(0)
      
      // Simulate loading progress
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 15
        })
      }, 200)
      
      try {
        // Fetch trending data
        setLoadingProgress(30)
        const data = await getTrendingData(timeStance)
        setTrendingData(data)
        setLoadingProgress(60)
        
        // Process keywords
        const keywords = getTrendingKeywords(data)
        setTrendingKeywords(keywords)
        setLoadingProgress(80)
        
        // Initialize selected keywords
        if (selectedKeywords.length === 0) {
          setSelectedKeywords(keywords.slice(0, 3).map(k => k.keyword))
        }

        // Calculate total searches
        const total = keywords.reduce((sum, keyword) => 
          sum + parseInt(keyword.count.replace('+', '')), 0
        )
        setTotalSearches(total)

        // Find biggest gainer and loser
        if (keywords.length > 0) {
          const gainer = keywords.reduce((max, current) => 
            parseInt(current.change) > parseInt(max.change) ? current : max
          , keywords[0])
          setBiggestGainer(gainer)

          const loser = keywords.reduce((min, current) => 
            parseInt(current.change) < parseInt(min.change) ? current : min
          , keywords[0])
          setBiggestLoser(loser)
        }

        // Prepare chart data
        if (data.length > 0) {
          const chartData = data[0].graph_data.map((_, index) => ({
            time: index,
            ...keywords.reduce((acc, keyword) => ({
              ...acc,
              [keyword.keyword]: keyword.graph_data[index]
            }), {})
          }))
          setChartData(chartData)
        }
        
        setLoadingProgress(100)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setLoadingProgress(100)
      } finally {
        clearInterval(progressInterval)
        setTimeout(() => {
          setIsLoading(false)
        }, 500) // Small delay for smooth transition
      }
    }

    fetchData()
    
    // Auto-hide welcome message after 5 seconds
    const welcomeTimer = setTimeout(() => {
      setShowWelcome(false)
    }, 5000)
    
    return () => {
      clearTimeout(welcomeTimer)
    }
  }, [timeStance])

  // Keyword toggle handler
  const toggleKeyword = (keyword: string) => {
    setSelectedKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword) 
        : [...prev, keyword]
    )
  }

  // 인사이트 메시지 생성 (실제로는 AI 기반 인사이트가 될 수 있음)
  const getInsightMessage = () => {
    if (!biggestGainer || !biggestLoser) return null;
    
    return (
      <div className="flex items-start gap-3">
        <div className="mt-1 bg-gradient-to-br from-amber-400 to-amber-600 p-2 rounded-full text-white">
          <Lightbulb className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-gray-800 font-medium">
            트렌드 인사이트
          </p>
          <p className="text-gray-600 text-sm mt-1">
            <span className="font-semibold text-blue-600">{biggestGainer.keyword}</span>의 인기가 급상승하고 있습니다 (+{biggestGainer.change}%). 
            반면, <span className="font-semibold text-rose-600">{biggestLoser.keyword}</span>의 인기는 감소하고 있습니다 ({biggestLoser.change}%). 
            이는 소비자들이 {timeStance === 'weekly' ? '이번 주' : timeStance === 'monthly' ? '이번 달' : '최근'} 
            {biggestGainer.keyword}에 더 많은 관심을 보이고 있음을 시사합니다.
          </p>
          
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
              <Sparkles className="h-3 w-3 mr-1" />
              트렌드 분석
            </Badge>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-100">
              <Zap className="h-3 w-3 mr-1" />
              AI 인사이트
            </Badge>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-400 hover:text-gray-500 mt-1 shrink-0"
          onClick={() => setShowInsight(false)}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  // 로딩 상태 표시
  if (isLoading) {
    return (
      <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-full max-w-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <BarChart2 className="h-6 w-6 text-white animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">데이터 로딩 중...</h2>
                  <p className="text-sm text-gray-500">최신 트렌드 정보를 가져오고 있습니다</p>
                </div>
              </div>
              
              <Progress value={loadingProgress} className="h-2 mb-2" />
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>데이터 분석 중</span>
                <span>{Math.round(loadingProgress)}%</span>
              </div>
            </div>
          </div>
          
          <Skeleton className="h-32 w-full rounded-xl bg-white/50" />
          <Skeleton className="h-64 w-full rounded-xl bg-white/50" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-96 w-full rounded-xl bg-white/50" />
            <Skeleton className="h-96 w-full rounded-xl bg-white/50" />
          </div>
        </div>
      </div>
    );
  }

  if (!biggestGainer || !biggestLoser) {
    return (
      <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-white shadow-lg border-none">
            <CardContent className="p-8 flex items-center justify-center">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">데이터를 불러올 수 없습니다</h3>
                <p className="text-gray-600 mb-4">트렌드 데이터를 불러오는 중 오류가 발생했습니다.</p>
                <Button 
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  새로고침
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* 헤더 섹션 - 스크롤에 따라 변형 */}
        <motion.div
          style={{ 
            opacity: headerOpacity,
            scale: headerScale,
            y: headerY
          }}
          className="sticky top-0 z-30 pt-2 pb-4"
        >
          <Card className="bg-gradient-to-r from-[#4461F2] to-[#6BBBF7] text-white border-none shadow-xl overflow-hidden backdrop-blur-sm bg-opacity-90">
            <CardContent className="p-0">
              <div className="relative">
                {/* 배경 패턴 */}
                <div className="absolute inset-0 opacity-10">
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                      <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100" height="100" fill="url(#grid)" />
                  </svg>
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between p-6 md:p-8">
                  <div className="space-y-3 mb-4 md:mb-0">
                    <div className="flex items-center gap-2">
                      <div className="bg-white/20 p-1.5 rounded-lg">
                        <BarChart2 className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold">요식업/푸드테크 트렌드</h2>
                    </div>
                    <p className="text-white/90 max-w-xl">
                      실시간 트렌드와 인사이트를 확인하세요. 데이터 기반 의사결정으로 비즈니스 성과를 향상시킬 수 있습니다.
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="bg-white/20 px-3 py-1 rounded-full flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        최근 업데이트: {new Date().toLocaleDateString()}
                      </div>
                      <div className="bg-white/20 px-3 py-1 rounded-full flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" />
                        실시간 데이터
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="bg-white/20 text-white hover:bg-white/30">
                            <Download className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>데이터 다운로드</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="bg-white/20 text-white hover:bg-white/30">
                            <Filter className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>필터 설정</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <Button variant="secondary" className="bg-white text-[#4461F2] hover:bg-white/90 shadow-lg">
                      데이터 소스 확인
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 환영 메시지 - 자동으로 사라짐 */}
        <AnimatePresence>
          {showWelcome && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-none shadow-md bg-gradient-to-r from-indigo-500 to-purple-500 text-white overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-white/20 p-2 rounded-full">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-lg">
                        안녕하세요, 푸드테크 트렌드 대시보드에 오신 것을 환영합니다!
                      </p>
                      <p className="text-white/80 text-sm mt-1">
                        이 대시보드는 최신 요식업 트렌드와 키워드를 실시간으로 분석하여 제공합니다. 
                        다양한 차트와 데이터를 통해 시장 동향을 파악하고 비즈니스에 활용하세요.
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-white/80 hover:text-white hover:bg-white/10 mt-1 shrink-0"
                      onClick={() => setShowWelcome(false)}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI 인사이트 */}
        <AnimatePresence>
          {showInsight && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0, transition: { duration: 0.3 } }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-none shadow-md bg-white overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  {getInsightMessage()}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 통계 그리드 */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <StatsGrid 
            totalSearches={totalSearches}
            trendingKeywords={trendingKeywords}
            biggestGainer={biggestGainer}
            biggestLoser={biggestLoser}
          />
        </motion.div>

        {/* 탭 컨텐츠 */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-4 sm:p-6"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">데이터 분석 대시보드</h2>
                <p className="text-sm text-gray-500">다양한 관점에서 트렌드를 분석하고 인사이트를 얻으세요</p>
              </div>
              
              <TabsList className="bg-gray-100 p-1 rounded-lg">
                <TabsTrigger value="trends" className="data-[state=active]:bg-white rounded-md">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  트렌드 분석
                </TabsTrigger>
                <TabsTrigger value="franchise" className="data-[state=active]:bg-white rounded-md">
                  <BarChart2 className="h-4 w-4 mr-2" />
                  프랜차이즈 현황
                </TabsTrigger>
                <TabsTrigger value="videos" className="data-[state=active]:bg-white rounded-md">
                  <Youtube className="h-4 w-4 mr-2" />
                  추천 동영상
                </TabsTrigger>
              </TabsList>
            </div>
            
            <AnimatePresence mode="wait">
              <TabsContent value="trends" className="space-y-6 mt-6 outline-none">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TrendChart 
                      timeStance={timeStance}
                      selectedKeywords={selectedKeywords}
                      chartData={chartData}
                      trendingKeywords={trendingKeywords}
                      onTimeStanceChange={setTimeStance}
                      onKeywordToggle={toggleKeyword}
                    />

                    <TrendingKeywordsTable 
                      trendingKeywords={trendingKeywords}
                    />
                  </div>
                </motion.div>
              </TabsContent>
              
              <TabsContent value="franchise" className="mt-6 outline-none">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-white rounded-lg shadow-md border-none">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-purple-100 p-1.5 rounded-lg">
                          <PieChart className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold text-gray-800">프랜차이즈 현황 분석</CardTitle>
                          <CardDescription className="text-gray-600">
                            업종별 매출, 가맹점 수, 단위면적당 매출액을 한눈에 파악하세요
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <CorpTrend />
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
              
              <TabsContent value="videos" className="mt-6 outline-none">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <VideoSuggestion />
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </motion.div>
        
        {/* 푸터 정보 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 text-center text-sm text-gray-500"
        >
          <p>© 2024 스마트 푸드테크 솔루션. 모든 데이터는 실시간으로 업데이트됩니다.</p>
          <p className="mt-1">문의: support@smartfoodtech.kr</p>
        </motion.div>
      </div>
    </div>
  )
}