'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { ExternalLink, Calendar, Bookmark, Share2, ThumbsUp, Info, Eye, ChevronDown, ChevronUp } from 'lucide-react'
import { OrganicResult } from '@/types/serp'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface OrganicResultsProps {
  results: OrganicResult[];
}

export function OrganicResults({ results }: OrganicResultsProps) {
  if (!results || results.length === 0) return null;

  return (
    <div className="space-y-6">
      {results.map((result, index) => (
        <ResultCard 
          key={result.position} 
          result={result} 
          index={index}
        />
      ))}
    </div>
  );
}

interface ResultCardProps {
  result: OrganicResult;
  index: number;
}

function ResultCard({ result, index }: ResultCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  // 결과 링크 클릭 핸들러
  const handleResultClick = () => {
    window.open(result.redirect_link || result.link, '_blank');
  };
  
  // 결과 저장 토글 핸들러
  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
  };
  
  // 공유 핸들러
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // 웹 공유 API 사용(지원하는 브라우저)
    if (navigator.share) {
      navigator.share({
        title: result.title,
        url: result.link
      }).catch(err => {
        console.error('공유하기 실패:', err);
      });
    } else {
      // 클립보드에 복사
      navigator.clipboard.writeText(result.link).then(() => {
        alert('링크가 클립보드에 복사되었습니다.');
      }).catch(err => {
        console.error('복사 실패:', err);
      });
    }
  };
  
  // 스니펫 단어 강조 함수
  const highlightWords = (text: string, words: string[]) => {
    if (!words || words.length === 0) return text;
    
    let highlightedText = text;
    words.forEach(word => {
      const regex = new RegExp(`(${word})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-amber-100 dark:bg-amber-700/30 px-0.5 rounded">$1</mark>');
    });
    
    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="overflow-hidden hover:shadow-md transition-all duration-300 border border-gray-200 hover:border-blue-200 bg-white dark:bg-gray-900">
        <CardContent className="p-0">
          <div 
            className="p-6 cursor-pointer hover:bg-blue-50/30 dark:hover:bg-blue-950/10 transition-colors"
            onClick={handleResultClick}
          >
            <div className="flex gap-4">
              {/* 썸네일 이미지 */}
              {result.thumbnail && (
                <div className="flex-shrink-0 relative w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden">
                  <Image
                    src={result.thumbnail}
                    alt={result.title}
                    fill
                    className="object-cover transition-transform hover:scale-105 duration-300"
                    sizes="(max-width: 768px) 96px, 128px"
                  />
                </div>
              )}

              {/* 컨텐츠 */}
              <div className="flex-1 min-w-0">
                {/* 링크 및 제목 */}
                <div className="mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    {result.favicon && (
                      <Image
                        src={result.favicon}
                        alt=""
                        width={16}
                        height={16}
                        className="rounded-sm"
                      />
                    )}
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <span className="truncate">{result.displayed_link}</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="cursor-help">
                              <Info className="h-3.5 w-3.5 text-gray-400" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs max-w-[200px]">원본 링크: {result.link}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </span>
                  </div>
                  <h3 
                    className="text-xl font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 group"
                  >
                    {result.title}
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                </div>

                {/* 스니펫 */}
                <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                  {highlightWords(result.snippet, result.snippet_highlighted_words)}
                </p>

                {/* 메타 정보 */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                  {result.date && (
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{result.date}</span>
                    </div>
                  )}
                  {result.source && (
                    <Badge variant="outline" className="text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
                      {result.source}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* 사이트링크 - 확장 */}
            <AnimatePresence>
              {(result.sitelinks?.expanded || result.sitelinks?.inline) && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  {result.sitelinks?.expanded && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                      {result.sitelinks.expanded.map((sitelink, idx) => (
                        <motion.div 
                          key={idx} 
                          className="space-y-1"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: idx * 0.1 }}
                        >
                          <a
                            href={sitelink.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1 group"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {sitelink.title}
                            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{sitelink.snippet}</p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                  
                  {result.sitelinks?.inline && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {result.sitelinks.inline.map((sitelink, idx) => (
                        <a
                          key={idx}
                          href={sitelink.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                        >
                          {sitelink.title}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* 액션 버튼 */}
          <div className="flex items-center justify-between px-6 py-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleSaveToggle}
                className={`text-xs h-8 gap-1 ${isSaved ? 'text-amber-600 dark:text-amber-400' : 'text-gray-600 dark:text-gray-400'}`}
              >
                <Bookmark className={`h-3.5 w-3.5 ${isSaved ? 'fill-amber-600 dark:fill-amber-400' : ''}`} />
                <span>{isSaved ? '저장됨' : '저장'}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleShare}
                className="text-xs h-8 gap-1 text-gray-600 dark:text-gray-400"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>공유</span>
              </Button>
            </div>
            
            {(result.sitelinks?.expanded || result.sitelinks?.inline) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="text-xs h-8 gap-1 text-gray-600 dark:text-gray-400"
              >
                <span>{isExpanded ? '접기' : '펼치기'}</span>
                {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 