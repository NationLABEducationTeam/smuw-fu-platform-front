'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion, AnimatePresence } from "framer-motion"
import { PostCard } from './postcard'
import { Post } from '@/types/instagram'
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  TrendingUp, 
  Calendar, 
  Heart, 
  MessageCircle, 
  RefreshCw, 
  Hash,
  LayoutGrid,
  LayoutList,
  ArrowDownUp,
  X,
  Info,
  MapPin,
  Bookmark
} from 'lucide-react'

// Post 타입을 확장하여 username과 userAvatar 속성 추가
interface ExtendedPost extends Post {
  username?: string;
  userAvatar?: string;
}

interface PostsListProps {
  posts: ExtendedPost[];
  bookmarkedPosts?: Set<string>;
  onBookmarkToggle?: (postId: string) => void;
  selectedHashtag?: string | null;
  onHashtagSelect?: (hashtag: string) => void;
}

type SortOption = 'recent' | 'likes' | 'comments' | 'engagement';
type ViewMode = 'grid' | 'list';
type FilterTab = 'all' | 'bookmarked' | 'trending';

export function PostsList({ 
  posts, 
  bookmarkedPosts = new Set(), 
  onBookmarkToggle,
  selectedHashtag,
  onHashtagSelect
}: PostsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<string | null>(null);
  const [minLikes, setMinLikes] = useState<number | null>(null);
  const [minComments, setMinComments] = useState<number | null>(null);
  
  // 모든 위치 목록 추출
  const allLocations = useMemo(() => {
    const locations = new Set<string>();
    posts.forEach(post => {
      if (post.location && post.location.name) {
        locations.add(post.location.name);
      }
    });
    return Array.from(locations).sort();
  }, [posts]);
  
  // 모든 해시태그 목록 추출 및 빈도 계산
  const hashtagFrequency = useMemo(() => {
    const frequency: Record<string, number> = {};
    posts.forEach(post => {
      post.hashtags.forEach(tag => {
        frequency[tag] = (frequency[tag] || 0) + 1;
      });
    });
    return frequency;
  }, [posts]);
  
  // 인기 해시태그 추출 (상위 10개)
  const popularHashtags = useMemo(() => {
    return Object.entries(hashtagFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));
  }, [hashtagFrequency]);
  
  // 필터링된 포스트
  const filteredPosts = useMemo(() => {
    let result = [...posts];
    
    // 검색어 필터링
    if (searchTerm) {
      result = result.filter(post => 
        post.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.hashtags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (post.location?.name && post.location.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // 해시태그 필터링
    if (selectedHashtag) {
      result = result.filter(post => post.hashtags.includes(selectedHashtag));
    }
    
    // 북마크 필터링
    if (activeFilter === 'bookmarked') {
      result = result.filter(post => bookmarkedPosts.has(post.post_id));
    }
    
    // 트렌딩 필터링 (좋아요 + 댓글 수가 많은 상위 20%)
    if (activeFilter === 'trending') {
      result = result.sort((a, b) => 
        (b.likes + b.comments) - (a.likes + a.comments)
      ).slice(0, Math.max(1, Math.floor(result.length * 0.2)));
    }
    
    // 위치 필터링
    if (locationFilter) {
      result = result.filter(post => 
        post.location?.name === locationFilter
      );
    }
    
    // 날짜 범위 필터링
    if (dateRange) {
      const now = new Date();
      const filterDate = new Date();
      
      switch(dateRange) {
        case 'today':
          filterDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      result = result.filter(post => {
        const postDate = new Date(post.posting_date);
        return postDate >= filterDate;
      });
    }
    
    // 최소 좋아요 필터링
    if (minLikes !== null) {
      result = result.filter(post => post.likes >= minLikes);
    }
    
    // 최소 댓글 필터링
    if (minComments !== null) {
      result = result.filter(post => post.comments >= minComments);
    }
    
    // 정렬
    switch(sortOption) {
      case 'recent':
        result.sort((a, b) => new Date(b.posting_date).getTime() - new Date(a.posting_date).getTime());
        break;
      case 'likes':
        result.sort((a, b) => b.likes - a.likes);
        break;
      case 'comments':
        result.sort((a, b) => b.comments - a.comments);
        break;
      case 'engagement':
        result.sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments));
        break;
    }
    
    return result;
  }, [
    posts, 
    searchTerm, 
    selectedHashtag, 
    activeFilter, 
    bookmarkedPosts, 
    locationFilter, 
    dateRange, 
    minLikes, 
    minComments, 
    sortOption
  ]);
  
  // 필터 초기화
  const resetFilters = () => {
    setSearchTerm('');
    setLocationFilter(null);
    setDateRange(null);
    setMinLikes(null);
    setMinComments(null);
    setActiveFilter('all');
  };
  
  // 해시태그 선택 핸들러
  const handleHashtagClick = (tag: string) => {
    if (onHashtagSelect) {
      onHashtagSelect(tag);
    }
  };
  
  // 북마크 토글 핸들러
  const handleBookmarkToggle = (postId: string) => {
    if (onBookmarkToggle) {
      onBookmarkToggle(postId);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* 필터 및 컨트롤 섹션 */}
      <Card className="border-pink-100 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl text-pink-800 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-pink-600" />
                인스타그램 포스트
              </CardTitle>
              <CardDescription>
                {filteredPosts.length}개의 포스트 {selectedHashtag && `(#${selectedHashtag})`}
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 border-pink-200 text-pink-700 hover:bg-pink-50"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                필터
              </Button>
              
              <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                <SelectTrigger className="w-[140px] h-9 border-pink-200">
                  <div className="flex items-center gap-2">
                    <ArrowDownUp className="h-4 w-4 text-pink-600" />
                    <SelectValue placeholder="정렬 기준" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">최신순</SelectItem>
                  <SelectItem value="likes">좋아요순</SelectItem>
                  <SelectItem value="comments">댓글순</SelectItem>
                  <SelectItem value="engagement">인기순</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="bg-gray-100 rounded-lg p-1">
                <Button 
                  variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 px-2"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 px-2"
                >
                  <LayoutList className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <CardContent className="border-t border-pink-100 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Search className="h-3.5 w-3.5 text-gray-500" />
                      검색
                    </div>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="키워드, 해시태그, 위치..."
                        className="pl-9 border-pink-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      {searchTerm && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1 h-7 w-7 text-gray-400 hover:text-gray-600"
                          onClick={() => setSearchTerm('')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-gray-500" />
                      위치
                    </div>
                    <Select value={locationFilter || ''} onValueChange={(value) => setLocationFilter(value || null)}>
                      <SelectTrigger className="border-pink-200">
                        <SelectValue placeholder="모든 위치" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">모든 위치</SelectItem>
                        {allLocations.map(location => (
                          <SelectItem key={location} value={location}>{location}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-gray-500" />
                      기간
                    </div>
                    <Select value={dateRange || ''} onValueChange={(value) => setDateRange(value || null)}>
                      <SelectTrigger className="border-pink-200">
                        <SelectValue placeholder="모든 기간" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">모든 기간</SelectItem>
                        <SelectItem value="today">오늘</SelectItem>
                        <SelectItem value="week">최근 1주일</SelectItem>
                        <SelectItem value="month">최근 1개월</SelectItem>
                        <SelectItem value="year">최근 1년</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5 text-gray-500" />
                      최소 좋아요
                    </div>
                    <Select 
                      value={minLikes !== null ? minLikes.toString() : ''} 
                      onValueChange={(value) => setMinLikes(value ? parseInt(value) : null)}
                    >
                      <SelectTrigger className="border-pink-200">
                        <SelectValue placeholder="제한 없음" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">제한 없음</SelectItem>
                        <SelectItem value="10">10+</SelectItem>
                        <SelectItem value="50">50+</SelectItem>
                        <SelectItem value="100">100+</SelectItem>
                        <SelectItem value="500">500+</SelectItem>
                        <SelectItem value="1000">1,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <MessageCircle className="h-3.5 w-3.5 text-gray-500" />
                      최소 댓글
                    </div>
                    <Select 
                      value={minComments !== null ? minComments.toString() : ''} 
                      onValueChange={(value) => setMinComments(value ? parseInt(value) : null)}
                    >
                      <SelectTrigger className="border-pink-200">
                        <SelectValue placeholder="제한 없음" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">제한 없음</SelectItem>
                        <SelectItem value="5">5+</SelectItem>
                        <SelectItem value="10">10+</SelectItem>
                        <SelectItem value="25">25+</SelectItem>
                        <SelectItem value="50">50+</SelectItem>
                        <SelectItem value="100">100+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-end">
                    <Button 
                      variant="outline" 
                      className="border-pink-200 text-pink-700 hover:bg-pink-50"
                      onClick={resetFilters}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      필터 초기화
                    </Button>
                  </div>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
        
        <CardContent className="pt-0 pb-4">
          <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as FilterTab)}>
            <TabsList className="bg-pink-50">
              <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-pink-700">
                전체 포스트
              </TabsTrigger>
              <TabsTrigger value="bookmarked" className="data-[state=active]:bg-white data-[state=active]:text-pink-700">
                <Bookmark className="h-4 w-4 mr-1" />
                저장됨
                {bookmarkedPosts.size > 0 && (
                  <Badge className="ml-1 bg-pink-200 text-pink-800 hover:bg-pink-300">
                    {bookmarkedPosts.size}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="trending" className="data-[state=active]:bg-white data-[state=active]:text-pink-700">
                <TrendingUp className="h-4 w-4 mr-1" />
                인기 포스트
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* 인기 해시태그 섹션 */}
      {popularHashtags.length > 0 && (
        <div className="bg-white rounded-lg border border-pink-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Hash className="h-4 w-4 text-pink-600" />
            <h3 className="text-sm font-medium text-gray-700">인기 해시태그</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full">
                    <Info className="h-3 w-3 text-gray-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-[200px]">포스트에서 가장 많이 사용된 해시태그입니다.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <ScrollArea className="w-full whitespace-nowrap pb-2">
            <div className="flex gap-2">
              {popularHashtags.map(({ tag, count }) => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className={`
                    px-3 py-2 cursor-pointer whitespace-nowrap
                    ${selectedHashtag === tag 
                      ? 'bg-pink-100 text-pink-800 border-pink-300' 
                      : 'bg-white text-gray-700 hover:bg-pink-50 hover:text-pink-700 hover:border-pink-200'}
                  `}
                  onClick={() => handleHashtagClick(tag)}
                >
                  #{tag}
                  <span className="ml-1 text-xs text-gray-500">({count})</span>
                </Badge>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}
      
      {/* 포스트 목록 */}
      {filteredPosts.length > 0 ? (
        <div className={`${viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8' 
          : 'flex flex-col space-y-8'}`}
        >
          <AnimatePresence>
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.post_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                layout
                className={`${viewMode === 'list' ? 'max-w-4xl mx-auto w-full' : ''}`}
              >
                <PostCard
                  imageUrl={post.image_url}
                  likes={post.likes}
                  comments={post.comments}
                  description={post.caption}
                  username={post.username || '사용자'}
                  userAvatar={post.userAvatar || `https://i.pravatar.cc/150?u=${post.username || 'user'}`}
                  timestamp={post.posting_date}
                  location={post.location}
                  hashtags={post.hashtags}
                  isBookmarked={bookmarkedPosts.has(post.post_id)}
                  onBookmarkToggle={() => handleBookmarkToggle(post.post_id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-pink-100 p-8 text-center">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="h-12 w-12 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 mb-2">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">포스트를 찾을 수 없습니다</h3>
            <p className="text-gray-500 max-w-md">
              검색어나 필터 조건을 변경해보세요. 다른 해시태그를 선택하거나 필터를 초기화하면 더 많은 결과를 볼 수 있습니다.
            </p>
            <Button 
              variant="outline" 
              className="mt-4 border-pink-200 text-pink-700 hover:bg-pink-50"
              onClick={resetFilters}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              필터 초기화
            </Button>
          </div>
        </div>
      )}
      
      {/* 더 많은 포스트 로드 버튼 */}
      {filteredPosts.length > 0 && filteredPosts.length < posts.length && (
        <div className="flex justify-center mt-6">
          <Button 
            variant="outline" 
            className="border-pink-200 text-pink-700 hover:bg-pink-50"
          >
            더 많은 포스트 보기
          </Button>
        </div>
      )}
    </div>
  );
} 