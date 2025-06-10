'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { InstagramAnalysisData } from '@/types/instagram'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Sector,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  Filter,
  RefreshCw,
  Download,
  Maximize2,
  Instagram,
  ChevronDown,
  Hash,
  MapPin,
  PieChartIcon,
  BarChart2,
  ActivityIcon,
  TrendingUp,
  Info,
  Share2,
  Heart,
  MessageCircle
} from 'lucide-react'
import { ScrollArea } from "@/components/ui/scroll-area"

const s3Client = new S3Client({
  region: 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!
  }
})

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', 
  '#D4A5A5', '#9FA4A9', '#9B5DE5', '#F15BB5', '#00BBF9',
  '#00F5D4', '#FEE440', '#FB5607', '#FFBE0B', '#8338EC'
]

// 가독성을 위한 숫자 포맷 함수
const formatNumber = (num: number) => {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`
  }
  return num
}

// 액티브 섹터 렌더링 함수
const renderActiveShape = (props: any) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={4}
      />
      <text x={cx} y={cy} dy={-20} textAnchor="middle" fill="#333" fontSize={14} fontWeight={500}>
        {payload.name}
      </text>
      <text x={cx} y={cy} textAnchor="middle" fill="#333" fontSize={16} fontWeight={600}>
        {value}
      </text>
      <text x={cx} y={cy} dy={20} textAnchor="middle" fill="#666" fontSize={12}>
        {`(${(percent * 100).toFixed(1)}%)`}
      </text>
    </g>
  );
};

// 맞춤형 툴팁 컴포넌트
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-100">
        <p className="font-medium text-gray-900">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-2 mt-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.fill }} />
            <p className="text-sm text-gray-700">
              {entry.name}: <span className="font-semibold">{entry.value}</span>
            </p>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export function HashtagAnalysisDashboard() {
  const [data, setData] = useState<InstagramAnalysisData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('popular')
  const [regionFilter, setRegionFilter] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [activePieIndex, setActivePieIndex] = useState(0)
  const [timeRange, setTimeRange] = useState('week')
  const [showPercentage, setShowPercentage] = useState(false)
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null)

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
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // 인기 해시태그 데이터
  const popularHashtags = useMemo(() => {
    if (!data?.data?.hashtag_analysis?.trends?.top_hashtags) return []
    
    const excludedTags = new Set([
      "맛스타그램", "먹스타", "맛스타", "먹스타그램", "푸드스타그램",
      "instafood", "foodie", "foodporn", "야식", "좋아요", "일상",
      "팔로우", "데일리", "fff", "food"
    ])
    
    return Object.entries(data.data.hashtag_analysis.trends.top_hashtags)
      .filter(([tag]) => !excludedTags.has(tag))
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
  }, [data])

  // 지역별 트렌드 데이터
  const regionalTrends = useMemo(() => {
    if (!data?.data?.hashtag_analysis?.trends?.regional_trends) return []
    
    return Object.entries(data.data.hashtag_analysis.trends.regional_trends)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [data])

  // 카테고리별 트렌드 데이터
  const categoryTrends = useMemo(() => {
    if (!data?.data?.hashtag_analysis?.trends?.category_trends) return []
    
    return Object.entries(data.data.hashtag_analysis.trends.category_trends)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [data])

  // 검색어로 필터링된 해시태그
  const filteredHashtags = useMemo(() => {
    if (!data?.data?.hashtag_analysis?.trends?.top_hashtags) return []
    
    return Object.entries(data.data.hashtag_analysis.trends.top_hashtags)
      .filter(([tag]) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 20)
  }, [data, searchTerm])

  // 해시태그 관련 포스트 찾기
  const findRelatedPosts = (hashtag: string) => {
    if (!data) return []
    
    const relatedPosts = data.data.profile_analysis.flatMap(profile => 
      profile.posts.filter(post => 
        post.hashtags.includes(hashtag)
      ).map(post => ({
        ...post,
        username: profile.account,
        userAvatar: `https://i.pravatar.cc/150?u=${profile.account}`
      }))
    )
    
    return relatedPosts.sort((a, b) => b.likes - a.likes).slice(0, 5)
  }

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-blue-500 text-sm animate-pulse">해시태그 분석 데이터 로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 필터 및 검색 카드 */}
        <Card className="border-blue-100 shadow-sm md:col-span-3">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="해시태그 검색..."
                    className="pl-9 h-9 w-full sm:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="기간 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">오늘</SelectItem>
                    <SelectItem value="week">이번 주</SelectItem>
                    <SelectItem value="month">이번 달</SelectItem>
                  </SelectContent>
                </Select>
                
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
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Switch
                    id="percentage-mode"
                    checked={showPercentage}
                    onCheckedChange={setShowPercentage}
                  />
                  <Label htmlFor="percentage-mode">백분율 표시</Label>
                </div>
                <Button variant="outline" size="sm" className="h-9">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  새로고침
                </Button>
                <Button variant="outline" size="sm" className="h-9">
                  <Download className="h-4 w-4 mr-2" />
                  내보내기
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* 인기 해시태그 차트 */}
        <motion.div 
          className="md:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-blue-100 shadow-sm h-full">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-blue-800 flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-blue-600" />
                    인기 해시태그 분석
                  </CardTitle>
                  <CardDescription>가장 많이 언급된 해시태그</CardDescription>
                </div>
                <Tabs defaultValue="bar" className="w-[240px]">
                  <TabsList className="bg-blue-100/50">
                    <TabsTrigger value="bar" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
                      <BarChart2 className="h-4 w-4 mr-1" />
                      막대
                    </TabsTrigger>
                    <TabsTrigger value="pie" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
                      <PieChartIcon className="h-4 w-4 mr-1" />
                      파이
                    </TabsTrigger>
                    <TabsTrigger value="radar" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
                      <ActivityIcon className="h-4 w-4 mr-1" />
                      레이더
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <TabsContent value="bar" className="mt-0">
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={popularHashtags}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end"
                        height={70}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        tickFormatter={(value) => {
                          if (showPercentage) {
                            return `${((value / data!.data.hashtag_analysis.trends.post_count) * 100).toFixed(1)}%`;
                          }
                          return formatNumber(value).toString();
                        }}
                      />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="value" 
                        name="언급 수" 
                        radius={[4, 4, 0, 0]}
                        onClick={(data) => data && data.name && setSelectedHashtag(data.name)}
                      >
                        {popularHashtags.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                            fillOpacity={selectedHashtag === entry.name ? 1 : 0.8}
                            stroke={selectedHashtag === entry.name ? "#333" : "none"}
                            strokeWidth={selectedHashtag === entry.name ? 1 : 0}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              
              <TabsContent value="pie" className="mt-0">
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={popularHashtags}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => showPercentage 
                          ? `#${name} (${(percent * 100).toFixed(1)}%)` 
                          : `#${name}`
                        }
                        labelLine={{ stroke: '#666', strokeWidth: 1, strokeDasharray: '2 2' }}
                        activeIndex={activePieIndex}
                        activeShape={renderActiveShape}
                        onMouseEnter={(_, index) => setActivePieIndex(index)}
                        onClick={(data) => setSelectedHashtag(data.name)}
                      >
                        {popularHashtags.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                            stroke="#fff"
                            strokeWidth={1}
                          />
                        ))}
                      </Pie>
                      <Legend 
                        layout="vertical" 
                        align="right" 
                        verticalAlign="middle"
                        formatter={(value) => `#${value}`}
                      />
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              
              <TabsContent value="radar" className="mt-0">
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={popularHashtags.slice(0, 8)}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="name" />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 'auto']}
                        tick={{ fontSize: 10 }}
                        tickFormatter={(value) => {
                          if (showPercentage) {
                            return `${((value / data!.data.hashtag_analysis.trends.post_count) * 100).toFixed(0)}%`;
                          }
                          return formatNumber(value).toString();
                        }}
                      />
                      <Radar 
                        name="언급 수" 
                        dataKey="value" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.6}
                      />
                      <Legend />
                      <RechartsTooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* 해시태그 인사이트 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-blue-100 shadow-sm h-full">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-blue-100">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-indigo-800 flex items-center gap-2">
                    <Hash className="h-5 w-5 text-indigo-600" />
                    해시태그 인사이트
                  </CardTitle>
                  <CardDescription>분석된 해시태그 통계</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-indigo-50 rounded-lg">
                  <div className="text-center md:text-left">
                    <p className="text-sm text-indigo-600">총 게시물 수</p>
                    <p className="text-2xl font-bold text-indigo-900">
                      {data?.data.hashtag_analysis.trends.post_count.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-indigo-600">고유 해시태그</p>
                    <p className="text-2xl font-bold text-indigo-900">
                      {data?.data.hashtag_analysis.trends.unique_hashtags.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-sm text-indigo-600">해시태그/포스트</p>
                    <p className="text-2xl font-bold text-indigo-900">
                      {(data?.data.hashtag_analysis.trends.unique_hashtags || 0) / 
                       (data?.data.hashtag_analysis.trends.post_count || 1) > 0 ? 
                          ((data?.data.hashtag_analysis.trends.unique_hashtags || 0) / 
                          (data?.data.hashtag_analysis.trends.post_count || 1)).toFixed(1) : '0'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-gray-600 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    지역별 분포
                  </h3>
                  <div className="bg-white rounded-lg border border-gray-100 p-3">
                    <ScrollArea className="h-[120px]">
                      <div className="space-y-2">
                        {regionalTrends.slice(0, 10).map((region, index) => (
                          <div key={region.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              ></div>
                              <span className="text-sm">{region.name}</span>
                            </div>
                            <span className="text-sm font-medium">
                              {showPercentage
                                ? `${(region.value / data!.data.hashtag_analysis.trends.post_count * 100).toFixed(1)}%`
                                : region.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  전체 해시태그 보고서 다운로드
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* 해시태그 검색 결과 */}
      {searchTerm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-blue-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-800 text-lg">검색 결과: "{searchTerm}"</CardTitle>
              <CardDescription>{filteredHashtags.length}개의 해시태그가 검색되었습니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {filteredHashtags.map((tag, index) => (
                    <motion.div
                      key={tag.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                    >
                      <Badge 
                        variant="outline" 
                        className="px-3 py-2 cursor-pointer hover:bg-blue-50 transition-colors"
                        onClick={() => setSelectedHashtag(tag.name)}
                      >
                        <span className="font-medium">#{tag.name}</span>
                        <span className="ml-2 text-gray-500">{tag.value}</span>
                      </Badge>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {filteredHashtags.length === 0 && (
                  <div className="w-full text-center py-8 text-gray-500">
                    검색 결과가 없습니다
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
      
      {/* 선택된 해시태그 상세 정보 */}
      {selectedHashtag && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-blue-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-blue-800 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span>#{selectedHashtag} 인사이트</span>
                  </CardTitle>
                  <CardDescription>선택한 해시태그에 대한 상세 분석</CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hover:bg-blue-100 h-8 w-8"
                  onClick={() => setSelectedHashtag(null)}
                >
                  <span className="sr-only">닫기</span>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">관련 인기 포스트</h3>
                  <div className="space-y-3">
                    {findRelatedPosts(selectedHashtag).map(post => (
                      <div 
                        key={post.post_id} 
                        className="p-3 border border-gray-100 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                        onClick={() => window.open(post.post_url, '_blank')}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                            <img 
                              src={post.thumbnail_url} 
                              alt={post.caption.substring(0, 20)} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-medium text-blue-600">{post.username}</span>
                                <span className="text-gray-400 text-xs">•</span>
                                <span className="text-gray-500 text-xs">{new Date(post.posting_date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="flex items-center gap-1 text-pink-600">
                                  <Heart className="h-3 w-3" />
                                  {post.likes}
                                </span>
                                <span className="flex items-center gap-1 text-blue-600">
                                  <MessageCircle className="h-3 w-3" />
                                  {post.comments}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 mt-1 line-clamp-2">{post.caption}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {findRelatedPosts(selectedHashtag).length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        관련 포스트가 없습니다
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">관련 해시태그</h3>
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-indigo-700">
                        #{selectedHashtag} 통계
                      </span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Info className="h-4 w-4 text-indigo-600" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>선택한 해시태그의 전체 데이터에서의 비율과 통계</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-white rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">등장 빈도</p>
                        <p className="text-lg font-bold text-indigo-700">
                          {data?.data.hashtag_analysis.trends.top_hashtags[selectedHashtag] || 0}회
                        </p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">전체 비율</p>
                        <p className="text-lg font-bold text-indigo-700">
                          {((data?.data.hashtag_analysis.trends.top_hashtags[selectedHashtag] || 0) / 
                          (data?.data.hashtag_analysis.trends.post_count || 1) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full"
                      onClick={() => {
                        // 클립보드에 복사
                        navigator.clipboard.writeText(`#${selectedHashtag}`);
                      }}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      해시태그 복사하기
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}