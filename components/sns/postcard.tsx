import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, MapPin, Share2, ExternalLink } from 'lucide-react'
import { Location } from '@/types/instagram'
import { motion } from 'framer-motion'
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PostCardProps {
  imageUrl: string
  likes: number
  comments: number
  description: string
  username: string
  userAvatar: string
  timestamp: string
  location: Location
  hashtags: string[]
  isBookmarked?: boolean
  onBookmarkToggle?: () => void
}

export function PostCard({ 
  imageUrl, 
  likes, 
  comments, 
  description, 
  username, 
  userAvatar, 
  timestamp,
  location,
  hashtags,
  isBookmarked = false,
  onBookmarkToggle
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(isBookmarked)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleLikeToggle = () => {
    setIsLiked(!isLiked)
  }

  const handleSaveToggle = () => {
    setIsSaved(!isSaved)
    if (onBookmarkToggle) {
      onBookmarkToggle()
    }
  }

  // 타임스탬프 포맷팅
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    // 1일 이내
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000))
      if (hours < 1) {
        const minutes = Math.floor(diff / (60 * 1000))
        return `${minutes}분 전`
      }
      return `${hours}시간 전`
    }
    
    // 1주일 이내
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000))
      return `${days}일 전`
    }
    
    // 그 외
    return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`
  }

  return (
    <motion.div 
      whileHover={{ y: -5 }} 
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="overflow-hidden transition-all duration-200 bg-white hover:shadow-xl border border-pink-100 hover:border-pink-300 rounded-xl h-full flex flex-col">
        <CardContent className="p-0 flex-1 flex flex-col">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-pink-200 ring-2 ring-pink-50">
                <AvatarImage src={userAvatar} alt={`${username}'s avatar`} />
                <AvatarFallback className="bg-gradient-to-br from-pink-400 to-pink-600 text-white">{username[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-pink-600">{username}</span>
                {location && location.name && (
                  <div className="flex items-center text-xs text-gray-500">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{location.name}</span>
                  </div>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 rounded-full hover:bg-pink-50 hover:text-pink-600">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
          
          {/* 이미지 */}
          <div className="relative aspect-square bg-gray-100 flex-shrink-0">
            <img 
              src={imageUrl} 
              alt={description.substring(0, 50)} 
              className="w-full h-full object-cover transition-transform hover:scale-[1.02] duration-700" 
            />
            <div 
              className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer bg-black/10 backdrop-blur-[1px]"
              onDoubleClick={handleLikeToggle}
            >
              {isLiked && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.4 }}
                >
                  <Heart className="h-24 w-24 text-white drop-shadow-lg" fill="white" />
                </motion.div>
              )}
            </div>
          </div>
          
          {/* 액션 버튼 */}
          <div className="flex items-center justify-between p-4 border-t border-b border-gray-100 bg-gradient-to-r from-white to-pink-50/30">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                className="h-9 w-9 text-gray-700 hover:text-pink-600 hover:bg-pink-100 rounded-full"
                onClick={handleLikeToggle}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-pink-600 text-pink-600' : ''} transition-colors duration-300`} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-9 w-9 text-gray-700 hover:text-blue-600 hover:bg-blue-100 rounded-full"
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-9 w-9 text-gray-700 hover:text-green-600 hover:bg-green-100 rounded-full"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className={`h-9 w-9 text-gray-700 hover:text-amber-600 hover:bg-amber-100 rounded-full ${isSaved ? 'text-amber-600 bg-amber-50' : ''}`}
              onClick={handleSaveToggle}
            >
              <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-amber-600' : ''} transition-colors duration-300`} />
            </Button>
          </div>
          
          {/* 좋아요, 설명 및 댓글 */}
          <div className="p-4 space-y-3 flex-grow">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{likes.toLocaleString()} 좋아요</span>
              <span className="text-gray-500 text-xs">•</span>
              <span className="text-gray-500 text-xs">{comments.toLocaleString()} 댓글</span>
            </div>
            
            <div className="text-sm">
              <span className="font-semibold text-pink-600 mr-1">{username}</span>
              <span className={`text-gray-700 ${!isExpanded && description.length > 100 ? 'line-clamp-2' : ''}`}>
                {description}
              </span>
              {description.length > 100 && !isExpanded && (
                <button 
                  className="text-gray-500 text-xs ml-1 hover:text-gray-700"
                  onClick={() => setIsExpanded(true)}
                >
                  더 보기
                </button>
              )}
            </div>
            
            {/* 해시태그 */}
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {hashtags.slice(0, 5).map(tag => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="bg-pink-50 text-pink-600 hover:bg-pink-100 cursor-pointer px-2.5 py-1 text-xs rounded-full transition-colors"
                  >
                    #{tag}
                  </Badge>
                ))}
                {hashtags.length > 5 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge 
                          variant="outline" 
                          className="bg-gray-50 text-gray-600 hover:bg-gray-100 cursor-pointer px-2.5 py-1 text-xs rounded-full"
                        >
                          +{hashtags.length - 5}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {hashtags.slice(5).map(tag => (
                            <Badge key={tag} variant="secondary" className="bg-pink-50 text-pink-600">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}
            
            <p className="text-gray-400 text-xs">{formatTimestamp(timestamp)}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}