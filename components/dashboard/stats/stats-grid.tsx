'use client'

import { TrendingKeyword } from "@/types/dashboard"
import { StatsCard } from "./stats-card"
import { motion } from "framer-motion"
import { Search, TrendingUp, TrendingDown, BarChart } from "lucide-react"

interface StatsGridProps {
  totalSearches: number;
  trendingKeywords: TrendingKeyword[];
  biggestGainer: TrendingKeyword;
  biggestLoser: TrendingKeyword;
}

export function StatsGrid({ 
  totalSearches, 
  trendingKeywords, 
  biggestGainer, 
  biggestLoser 
}: StatsGridProps) {
  const stats = [
    { 
      title: "총 검색어", 
      value: totalSearches.toLocaleString(), 
      change: "+12.5%",
      icon: Search,
      description: "지난 주 대비"
    },
    { 
      title: "탑 키워드", 
      value: trendingKeywords[0]?.keyword || 'N/A', 
      change: `${trendingKeywords[0]?.count || 0}`,
      icon: BarChart,
      description: "검색 볼륨"
    },
    { 
      title: "인기도 급상승", 
      value: biggestGainer.keyword || 'N/A', 
      change: `+${biggestGainer.change}%`,
      icon: TrendingUp,
      description: "지난 주 대비"
    },
    { 
      title: "인기도 급하강", 
      value: biggestLoser.keyword || 'N/A', 
      change: `${biggestLoser.change}%`,
      icon: TrendingDown,
      description: "지난 주 대비"
    }
  ]

  // 애니메이션 변형
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {stats.map((stat, i) => (
        <motion.div key={i} variants={item}>
          <StatsCard
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            description={stat.description}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}