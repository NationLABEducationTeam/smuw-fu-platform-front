'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Youtube, Eye, ThumbsUp, Clock, ExternalLink, Play, ChevronLeft, ChevronRight, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { YouTubeVideo } from "@/types/dashboard"
import { fetchYouTubeVideos } from "@/utils/trending-data"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function VideoSuggestion() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  // 비디오 카테고리 추출 (예시)
  const categories = [
    { id: 'all', name: '전체' },
    { id: 'food', name: '음식' },
    { id: 'restaurant', name: '레스토랑' },
    { id: 'cooking', name: '요리' },
    { id: 'cafe', name: '카페' }
  ]

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const fetchedVideos = await fetchYouTubeVideos()
        setVideos(fetchedVideos)
      } catch (error) {
        console.error('비디오 로딩 중 오류 발생:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadVideos()
  }, [])

  // 카테고리별 필터링 (실제로는 API에서 카테고리 정보가 제공되어야 함)
  const filteredVideos = activeCategory === 'all' 
    ? videos 
    : videos.filter(video => 
        video.title.toLowerCase().includes(activeCategory.toLowerCase())
      )

  // 캐러셀 스크롤 핸들러
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return
    
    const scrollAmount = direction === 'left' 
      ? -carouselRef.current.offsetWidth 
      : carouselRef.current.offsetWidth
    
    carouselRef.current.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    })
  }

  // 페이지 이동 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    if (carouselRef.current) {
      const itemWidth = carouselRef.current.offsetWidth
      carouselRef.current.scrollTo({
        left: page * itemWidth,
        behavior: 'smooth'
      })
    }
  }

  // 총 페이지 수 계산
  const totalPages = Math.ceil(filteredVideos.length / 3)

  return (
    <Card className="overflow-hidden shadow-lg border-none bg-gradient-to-br from-white to-red-50">
      <CardHeader className="border-b bg-gradient-to-r from-red-600 to-red-500 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-white p-2 rounded-full">
              <Youtube className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">스마트 푸드 테크 추천 동영상</CardTitle>
              <p className="text-white/80 text-sm mt-1">최신 트렌드와 인사이트를 영상으로 확인하세요</p>
            </div>
          </div>
          
          <Tabs 
            value={activeCategory} 
            onValueChange={setActiveCategory}
            className="w-full sm:w-auto"
          >
            <TabsList className="bg-white/20 p-1 h-auto grid grid-cols-3 sm:flex sm:grid-cols-none">
              {categories.map(category => (
                <TabsTrigger 
                  key={category.id}
                  value={category.id}
                  className="text-white data-[state=active]:bg-white data-[state=active]:text-red-600 text-xs sm:text-sm"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {isLoading ? (
          <VideoSkeleton />
        ) : (
          <div className="space-y-6">
            <div className="relative">
              {/* 캐러셀 네비게이션 버튼 */}
              <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 z-10">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg"
                  onClick={() => scrollCarousel('left')}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg"
                  onClick={() => scrollCarousel('right')}
                  disabled={currentPage === totalPages - 1}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
              
              {/* 비디오 캐러셀 */}
              <div 
                ref={carouselRef}
                className="overflow-x-auto scrollbar-hide snap-x snap-mandatory flex space-x-6 pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {filteredVideos.length > 0 ? (
                  filteredVideos.map((video) => (
                    <div 
                      key={video.video_id}
                      className="snap-start flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
                    >
                      <VideoItem
                        video={video}
                        isHovered={hoveredVideo === video.video_id}
                        onHover={() => setHoveredVideo(video.video_id)}
                        onLeave={() => setHoveredVideo(null)}
                      />
                    </div>
                  ))
                ) : (
                  <div className="w-full py-12 text-center text-gray-500">
                    <Info className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>선택한 카테고리에 해당하는 비디오가 없습니다</p>
                    <Button 
                      variant="link" 
                      className="mt-2 text-red-500"
                      onClick={() => setActiveCategory('all')}
                    >
                      모든 비디오 보기
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {/* 페이지 인디케이터 */}
            {filteredVideos.length > 0 && (
              <div className="flex justify-center gap-2">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="icon"
                    className={`w-2 h-2 rounded-full p-0 ${
                      currentPage === index 
                        ? 'bg-red-500' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    onClick={() => handlePageChange(index)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function VideoItem({ video, isHovered, onHover, onLeave }: { 
  video: YouTubeVideo, 
  isHovered: boolean, 
  onHover: () => void, 
  onLeave: () => void 
}) {
  return (
    <motion.div 
      className="group bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl h-full flex flex-col"
      whileHover={{ y: -5 }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative aspect-video">
        <Image
          src={`https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`}
          alt={video.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        
        {/* 썸네일 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* 재생 버튼 */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              size="icon"
              className="bg-red-600 hover:bg-red-700 text-white rounded-full w-12 h-12 shadow-lg"
              onClick={() => window.open(video.url, '_blank')}
            >
              <Play className="h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
        
        {/* 비디오 메타데이터 배지 */}
        <div className="absolute bottom-2 right-2 flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className="bg-black/70 text-white text-xs px-2 py-1 flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {formatNumber(video.view_count)}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>조회수: {video.view_count.toLocaleString()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className="bg-black/70 text-white text-xs px-2 py-1 flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3" />
                  {formatNumber(video.like_count)}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>좋아요: {video.like_count.toLocaleString()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-medium text-gray-800 line-clamp-2 mb-2 flex-1">
          {video.title}
        </h3>
        
        <div className="mt-auto pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDuration(180)}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 p-0 h-6"
              onClick={() => window.open(video.url, '_blank')}
            >
              <span>보러가기</span>
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function VideoSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, index) => (
        <motion.div 
          key={index} 
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Skeleton className="aspect-video rounded-xl bg-gray-200/70" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-full bg-gray-200/70" />
            <Skeleton className="h-5 w-2/3 bg-gray-200/70" />
            <div className="flex justify-between pt-2">
              <Skeleton className="h-4 w-16 bg-gray-200/70" />
              <Skeleton className="h-4 w-16 bg-gray-200/70" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}