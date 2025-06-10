'use client'

import { cva } from 'class-variance-authority'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Minus, Info } from "lucide-react"
import { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// 변화율에 따른 스타일 변형 정의
const trendVariants = cva("flex items-center gap-1 text-sm font-medium", {
  variants: {
    trend: {
      positive: "text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full",
      negative: "text-rose-600 bg-rose-50 px-2 py-1 rounded-full",
      neutral: "text-gray-600 bg-gray-50 px-2 py-1 rounded-full"
    }
  },
  defaultVariants: {
    trend: "neutral"
  }
})

// 카드 스타일 변형 정의
const cardVariants = cva("overflow-hidden transition-all duration-300 hover:shadow-lg border-t-4", {
  variants: {
    trend: {
      positive: "border-t-emerald-500 hover:border-t-emerald-600",
      negative: "border-t-rose-500 hover:border-t-rose-600",
      neutral: "border-t-blue-500 hover:border-t-blue-600"
    }
  },
  defaultVariants: {
    trend: "neutral"
  }
})

// 아이콘 배경 스타일 변형 정의
const iconVariants = cva("h-10 w-10 rounded-full flex items-center justify-center", {
  variants: {
    trend: {
      positive: "bg-emerald-100 text-emerald-600",
      negative: "bg-rose-100 text-rose-600",
      neutral: "bg-blue-100 text-blue-600"
    }
  },
  defaultVariants: {
    trend: "neutral"
  }
})

interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  icon?: LucideIcon;
  description?: string;
  tooltip?: string;
}

export function StatsCard({ title, value, change, icon: Icon, description, tooltip }: StatsCardProps) {
  const changeValue = parseFloat(change);
  const trend = changeValue > 0 ? "positive" : changeValue < 0 ? "negative" : "neutral";
  
  const TrendIcon = changeValue > 0 ? ArrowUpRight : changeValue < 0 ? ArrowDownRight : Minus;
  
  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cardVariants({ trend })}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {title}
                </CardTitle>
                
                {tooltip && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">
                          <Info className="h-3.5 w-3.5 text-gray-400" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-[200px]">{tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="text-3xl font-bold text-gray-900">{value}</div>
                
                <div className="flex items-center justify-between">
                  <div className={trendVariants({ trend })}>
                    <TrendIcon className="h-3.5 w-3.5" />
                    <span>{change}</span>
                  </div>
                  
                  {description && (
                    <p className="text-xs text-gray-500">{description}</p>
                  )}
                </div>
              </div>
            </div>
            
            {Icon && (
              <motion.div 
                className={iconVariants({ trend })}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Icon className="h-5 w-5" />
              </motion.div>
            )}
          </div>
          
          {/* 변화율에 따른 진행 표시줄 */}
          {changeValue !== 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  className={`h-full rounded-full ${
                    trend === 'positive' ? 'bg-emerald-500' : 
                    trend === 'negative' ? 'bg-rose-500' : 'bg-blue-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${Math.min(Math.abs(changeValue), 100)}%` 
                  }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}