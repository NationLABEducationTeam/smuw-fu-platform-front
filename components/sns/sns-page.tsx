'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Instagram, 
  TrendingUp, 
  Users, 
  Utensils, 
  LayoutGrid, 
  LayoutList, 
  Filter, 
  Search, 
  Bookmark, 
  Download, 
  Info,
  ChevronDown,
  ArrowRight,
  ArrowUpRight,
  RefreshCcw,
  SlidersHorizontal,
  Eye,
  ChartBar,
  MessageSquare,
  Heart
} from 'lucide-react'
import { HashtagAnalysisDashboard } from './hashtag-analysis-dashboard'
import { InstagramFeed } from './instagram-feed'
import { InstagramAnalysisData, Post } from '@/types/instagram'
import { ocrAnalysisData } from '@/types/ocr-analysis-data'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { OcrAnalysisDashboard } from './ocr-analysis-dashboard'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PostCard } from './postcard'
import { PostsList } from './posts-list'
import { FoodTrendChart } from './food-trend-chart'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const s3Client = new S3Client({
  region: 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!
  }
})

export function SNSPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [data, setData] = useState<InstagramAnalysisData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'combined' | 'charts' | 'posts'>('combined')
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set())
  const [lastUpdated, setLastUpdated] = useState<string>('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const today = new Date().toISOString().split('T')[0]
        const command = new GetObjectCommand({
          Bucket: 'smwu-daily-instagram-analysis',
          Key: `${today}/latest.json`
        })
        
        const response = await s3Client.send(command)
        const str = await response.Body?.transformToString()
        const jsonData = str ? JSON.parse(str) as InstagramAnalysisData : null
        setData(jsonData)
        setLastUpdated(new Date().toLocaleString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }))
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // 해시태그 분석 (일반적인 해시태그 제외)
  const getTopHashtags = () => {
    if (!data) return []
    
    const excludedTags = new Set([
      "맛스타그램", "먹스타", "맛스타", "먹스타그램", "푸드스타그램",
      "instafood", "foodie", "foodporn", "야식", "좋아요", "일상",
      "팔로우", "데일리", "fff", "맛집", "food"
    ])

    const hashtagCount = new Map<string, number>()
    data.data.profile_analysis.forEach(profile => {
      profile.posts.forEach((post: Post) => {
        post.hashtags.forEach((tag: string) => {
          if (!excludedTags.has(tag)) {
            hashtagCount.set(tag, (hashtagCount.get(tag) || 0) + 1)
          }
        })
      })
    })

    return Array.from(hashtagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
  }

  // 인기 음식 태그 분석
  const getPopularFood = () => {
    if (!data) return 'N/A'
    
    const foodTags = new Set([
      "김치", "비빔밥", "떡볶이", "불고기", "삼겹살", "치킨", "파스타",
      "피자", "라면", "초밥", "우동", "돈까스", "마라탕", "짜장면",
      "짬뽕", "감자탕", "순대", "칼국수", "쌀국수", "스테이크"
    ])

    const foodCount = new Map<string, number>()
    data.data.profile_analysis.forEach(profile => {
      profile.posts.forEach((post: Post) => {
        post.hashtags.forEach((tag: string) => {
          if (foodTags.has(tag)) {
            foodCount.set(tag, (foodCount.get(tag) || 0) + 1)
          }
        })
      })
    })

    return Array.from(foodCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
  }

  const getStatistics = () => {
    if (!data) return null
    return data.data.profile_analysis.reduce(
      (acc, profile) => {
        acc.totalPosts += profile.statistics.total_posts
        acc.totalLikes += profile.statistics.total_likes
        acc.totalComments += profile.statistics.total_comments
        return acc
      },
      { totalPosts: 0, totalLikes: 0, totalComments: 0 }
    )
  }

  // 포스트를 필터링하는 함수
  const getFilteredPosts = () => {
    if (!data) return []
    
    // 모든 포스트를 평면화
    let allPosts = data.data.profile_analysis.flatMap(profile => 
      profile.posts.map(post => ({
        ...post,
        username: profile.account,
        // 아바타는 페이크 URL을 생성
        userAvatar: `https://i.pravatar.cc/150?u=${profile.account}`
      }))
    )
    
    // 검색어 필터링
    if (searchTerm) {
      allPosts = allPosts.filter(post => 
        post.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.hashtags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    
    // 선택된 해시태그 필터링
    if (selectedHashtag) {
      allPosts = allPosts.filter(post => 
        post.hashtags.includes(selectedHashtag)
      )
    }
    
    // 좋아요 수를 기준으로 정렬
    return allPosts.sort((a, b) => b.likes - a.likes)
  }

  // 북마크 토글 함수
  const toggleBookmark = (postId: string) => {
    setBookmarkedPosts(prev => {
      const newBookmarks = new Set(prev)
      if (newBookmarks.has(postId)) {
        newBookmarks.delete(postId)
      } else {
        newBookmarks.add(postId)
      }
      return newBookmarks
    })
  }

  const stats = getStatistics()
  const filteredPosts = getFilteredPosts()
  const topHashtags = getTopHashtags()
  const popularFoods = getPopularFood()

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute top-0 left-0 w-full h-full rounded-full border-t-2 border-b-2 border-blue-500 animate-spin"></div>
            <Instagram className="w-8 h-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-500" />
          </div>
          <p className="text-blue-500 font-semibold animate-pulse">소셜 미디어 인사이트 로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 pb-16">
      {/* 헤더 섹션 */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="py-8"
      >
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">소셜 미디어 인사이트</h1>
            <p className="text-gray-500 mt-2">인스타그램 데이터 분석과 트렌드를 한눈에 확인하세요</p>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <RefreshCcw className="h-4 w-4" />
            <span>마지막 업데이트: {lastUpdated}</span>
          </div>
        </div>
        
        {/* 보기 모드 및 필터 컨트롤 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-gray-100 rounded-lg p-1">
                <Button 
                  variant={viewMode === 'combined' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setViewMode('combined')}
                  className="h-8"
                >
                  <LayoutGrid className="h-4 w-4 mr-1" />
                  통합 보기
                </Button>
                <Button 
                  variant={viewMode === 'charts' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setViewMode('charts')}
                  className="h-8"
                >
                  <ChartBar className="h-4 w-4 mr-1" />
                  차트만
                </Button>
                <Button 
                  variant={viewMode === 'posts' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setViewMode('posts')}
                  className="h-8"
                >
                  <LayoutList className="h-4 w-4 mr-1" />
                  포스트만
                </Button>
              </div>
              
              <Separator orientation="vertical" className="h-8 hidden sm:block" />
              
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="검색어 입력..."
                  className="pl-9 h-9 w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {selectedHashtag && (
                <Badge 
                  variant="secondary" 
                  className="gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 font-medium"
                >
                  #{selectedHashtag}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 hover:bg-blue-200 rounded-full p-0"
                    onClick={() => setSelectedHashtag(null)}
                  >
                    <span className="sr-only">태그 제거</span>
                    ×
                  </Button>
                </Badge>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    필터
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>필터 옵션</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="p-2">
                    <p className="text-xs text-gray-500 mb-2">인기 해시태그</p>
                    <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                      {topHashtags.map(([tag, count]) => (
                        <Badge 
                          key={tag}
                          variant="outline" 
                          className="cursor-pointer hover:bg-blue-50"
                          onClick={() => setSelectedHashtag(tag)}
                        >
                          #{tag} ({count})
                        </Badge>
                      ))}
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <Download className="h-4 w-4 mr-2" />
                    내보내기
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    CSV로 내보내기
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    JSON으로 내보내기
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    보고서 PDF 다운로드
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 통계 카드 섹션 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <StatCard
          icon={<Instagram className="h-5 w-5 text-blue-500" />}
          title="분석된 총 게시물"
          value={stats?.totalPosts || 0}
          detail="최근 게시된 인스타그램 포스트"
          trend={{ value: "+12%", direction: "up" }}
        />
        <StatCard
          icon={<Heart className="h-5 w-5 text-pink-500" />}
          title="총 좋아요"
          value={stats?.totalLikes || 0}
          detail="모든 게시물의 받은 좋아요 수"
          trend={{ value: "+8%", direction: "up" }}
        />
        <StatCard
          icon={<MessageSquare className="h-5 w-5 text-indigo-500" />}
          title="총 댓글"
          value={stats?.totalComments || 0}
          detail="모든 게시물의 받은 댓글 수"
          trend={{ value: "+5%", direction: "up" }}
        />
      </motion.div>

      {/* 필터링된 컨텐츠 화면 */}
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <TabsList className="bg-blue-50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Eye className="h-4 w-4 mr-2" />
              개요
            </TabsTrigger>
            <TabsTrigger value="hashtags" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Filter className="h-4 w-4 mr-2" />
              해시태그 분석
            </TabsTrigger>
            <TabsTrigger value="ocr" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Search className="h-4 w-4 mr-2" />
              이미지 텍스트 분석
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 주요 컨텐츠 영역 */}
        <TabsContent value="overview" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 왼쪽 컬럼 - 차트 */}
            {(viewMode === 'combined' || viewMode === 'charts') && (
              <div className="lg:col-span-2 space-y-6">
                <Card className="overflow-hidden border-blue-100 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-blue-800">트렌드 분석</CardTitle>
                        <CardDescription>최근 인스타그램 활동 추이</CardDescription>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Info className="h-4 w-4 text-blue-600" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-80">최근 인스타그램 데이터 기반 식품/외식 관련 트렌드 분석 결과입니다. 인기 게시물, 해시태그, 좋아요 및 댓글 수 추이를 확인할 수 있습니다.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="p-6">
                      <FoodTrendChart />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="overflow-hidden border-blue-100 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-blue-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-indigo-800">인기 푸드 태그</CardTitle>
                        <CardDescription>가장 많이 언급된 음식 해시태그</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="whitespace-nowrap pb-4">
                      <div className="flex gap-2 mt-2">
                        {Array.isArray(popularFoods) ? (
                          popularFoods.map(([food, count], index) => (
                            <div 
                              key={food}
                              className="flex-none"
                            >
                              <div 
                                className="rounded-lg p-3 text-center bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 transition-all hover:shadow-md cursor-pointer"
                                onClick={() => setSelectedHashtag(food)}
                              >
                                <p className="font-medium text-indigo-800 mb-1">{food}</p>
                                <Badge variant="secondary" className="bg-white">
                                  {count} 개 포스트
                                </Badge>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p>데이터가 없습니다</p>
                        )}
                      </div>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {/* 오른쪽 컬럼 - 포스트 */}
            {(viewMode === 'combined' || viewMode === 'posts') && (
              <div className={`${viewMode === 'posts' ? 'lg:col-span-3' : 'lg:col-span-1'} space-y-6`}>
                <PostsList 
                  posts={filteredPosts}
                  bookmarkedPosts={bookmarkedPosts}
                  onBookmarkToggle={toggleBookmark}
                  selectedHashtag={selectedHashtag}
                  onHashtagSelect={(tag) => setSelectedHashtag(tag)}
                />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="hashtags">
          <HashtagAnalysisDashboard />
        </TabsContent>

        <TabsContent value="ocr">
          <OcrAnalysisDashboard data={ocrAnalysisData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: string | number
  detail?: string
  trend?: {
    value: string
    direction: 'up' | 'down' | 'neutral'
  }
}

function StatCard({ icon, title, value, detail, trend }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="relative"
    >
      <Card className="overflow-hidden border-blue-100 h-full shadow-sm hover:shadow-md transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold">{value.toLocaleString()}</p>
                {trend && (
                  <div className={`flex items-center text-xs font-medium rounded-full px-2 py-1 ${
                    trend.direction === 'up' 
                      ? 'bg-green-100 text-green-700' 
                      : trend.direction === 'down'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {trend.direction === 'up' ? (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    ) : trend.direction === 'down' ? (
                      <ChevronDown className="h-3 w-3 mr-1" />
                    ) : null}
                    {trend.value}
                  </div>
                )}
              </div>
              {detail && <p className="text-xs text-gray-500">{detail}</p>}
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}