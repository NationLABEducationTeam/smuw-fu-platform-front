'use client'

import React, { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Store, ShoppingBag, Phone, Clock, Truck, Star, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { LocalResults } from '@/types/serp'
import { motion, AnimatePresence } from 'framer-motion'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface LocalResultsSectionProps {
  data: LocalResults;
}

export function LocalResultsSection({ data }: LocalResultsSectionProps) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  
  if (!data?.places || data.places.length === 0) return null;

  const toggleExpand = (position: number) => {
    setExpandedItems(prev => ({
      ...prev,
      [position]: !prev[position]
    }));
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">위치 검색 결과</h2>
        <Badge variant="outline" className="px-3 py-1">
          {data.places.length}개 결과
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {data.places.map((result, index) => {
            const isExpanded = expandedItems[result.position] || false;
            
            return (
              <motion.div
                key={result.position}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="h-full"
              >
                <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 border-transparent hover:border-primary/20">
                  <CardContent className="p-0">
                    {/* 지도 미리보기 (GPS 좌표가 있는 경우) */}
                    {result.gps_coordinates && (
                      <div className="relative w-full h-32 bg-blue-50">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20">
                          <img 
                            src={`https://maps.googleapis.com/maps/api/staticmap?center=${result.gps_coordinates.latitude},${result.gps_coordinates.longitude}&zoom=15&size=600x200&markers=color:red%7C${result.gps_coordinates.latitude},${result.gps_coordinates.longitude}&key=YOUR_API_KEY`} 
                            alt={`${result.title} 위치`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-white text-primary shadow-sm">
                            {result.label}
                          </Badge>
                        </div>
                      </div>
                    )}
                    
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        {!result.gps_coordinates && (
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-medium">{result.label}</span>
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium mb-1 group flex items-start">
                            <span className="mr-2">{result.title}</span>
                            {result.place_id_search && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-5 w-5 rounded-full opacity-70 hover:opacity-100"
                                      onClick={() => window.open(result.place_id_search, '_blank')}
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>자세히 보기</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </h3>
                          
                          {result.description && (
                            <p className="text-sm text-muted-foreground mb-2">{result.description}</p>
                          )}
                          
                          <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
                            <MapPin className="w-4 h-4 text-primary/70" />
                            <span className="truncate">{result.address}</span>
                          </div>
                          
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                {/* 전화번호 */}
                                {result.phone && (
                                  <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
                                    <Phone className="w-4 h-4 text-primary/70" />
                                    <a 
                                      href={`tel:${result.phone}`} 
                                      className="hover:text-primary transition-colors"
                                    >
                                      {result.phone}
                                    </a>
                                  </div>
                                )}

                                {/* 영업시간 */}
                                {result.hours && (
                                  <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
                                    <Clock className="w-4 h-4 text-primary/70" />
                                    <span>{result.hours}</span>
                                  </div>
                                )}
                                
                                {/* 서비스 옵션 */}
                                {result.service_options && Object.entries(result.service_options).length > 0 && (
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    {Object.entries(result.service_options).map(([key, value]) => (
                                      value && (
                                        <Badge key={key} variant="secondary" className="flex items-center gap-1">
                                          {key === '매장_내_식사' ? (
                                            <Store className="w-3 h-3" />
                                          ) : key === '테이크아웃' ? (
                                            <ShoppingBag className="w-3 h-3" />
                                          ) : key === '비대면_배달' || key === '배달_서비스' ? (
                                            <Truck className="w-3 h-3" />
                                          ) : null}
                                          {key.replace(/_/g, ' ')}
                                        </Badge>
                                      )
                                    ))}
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                          
                          <div className="flex items-center gap-2 mt-3">
                            {/* 길찾기 버튼 */}
                            {result.links?.directions && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => window.open(result.links?.directions, '_blank')}
                              >
                                <Navigation className="w-4 h-4 mr-2" />
                                길찾기
                              </Button>
                            )}
                            
                            {/* 확장/축소 버튼 */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpand(result.position)}
                              className="text-muted-foreground"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="w-4 h-4 mr-1" />
                                  접기
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4 mr-1" />
                                  더보기
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 더 많은 위치 보기 링크 */}
      {data.more_locations_link && (
        <motion.div 
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            variant="outline"
            className="text-primary hover:text-primary/80 border-primary/20 hover:border-primary/40"
            onClick={() => window.open(data.more_locations_link, '_blank')}
          >
            더 많은 위치 보기
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
} 