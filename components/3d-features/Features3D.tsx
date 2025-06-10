'use client'

import { TrendingUp, Users, DollarSign, Bot, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const features = [
  { 
    icon: TrendingUp, 
    title: '푸드테크 트렌드', 
    description: '푸드테크 트렌드 분석과 키워드 검색으로\n최신 푸드테크 동향을 파악해보세요', 
    relatedFeatures: ['요식업/푸드테크 트렌드', '키워드 검색'],
    gradient: 'from-blue-500 to-indigo-500'
  },
  { 
    icon: Users, 
    title: '소비자 패턴', 
    description: '상세 지도와 SNS 데이터를 통해\n지역별 소비자 특성을 분석해보세요', 
    relatedFeatures: ['상세 지도', 'SNS 지도'],
    gradient: 'from-indigo-500 to-purple-500'
  },
  { 
    icon: DollarSign, 
    title: '시장 기회', 
    description: '창/폐업 분석과 AI 창업진단으로\n새로운 시장 기회를 발견하세요', 
    relatedFeatures: ['창/폐업 분석', 'AI 창업진단'],
    gradient: 'from-purple-500 to-pink-500'
  },
  { 
    icon: Bot, 
    title: '챗봇', 
    description: 'AI 챗봇을 통해 맞춤형 데이터를\n분석하고 인사이트를 얻어보세요', 
    relatedFeatures: ['챗봇'],
    gradient: 'from-pink-500 to-rose-500'
  },
]

export default function Features3D() {
  return (
    <div className="relative py-32 overflow-hidden">
      {/* 배경 효과 */}
      <div className="absolute inset-0 bg-gray-50 dark:bg-[#051b2c]" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 dark:opacity-5" />
      
      {/* 섹션 타이틀 */}
      <div className="relative text-center mb-20">
        <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-[#1174ed] dark:to-blue-400 font-['Geist Mono'] mb-4">
          AI 기반 스마트 푸드테크 솔루션
        </h2>
        <p className="text-xl font-['Geist Mono']">
          <span className="text-gray-700 dark:text-white">혁신적인 기술로</span>{' '}
          <span className="text-blue-600 dark:text-[#1174ed] font-semibold">미래 식품 산업</span>{' '}
          <span className="text-gray-700 dark:text-white">을 선도하세요</span>
        </p>
      </div>

      {/* 카드 그리드 */}
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group bg-white/80 dark:bg-[#0a2540]/50 backdrop-blur-sm border border-gray-200 dark:border-0 shadow-lg hover:shadow-xl dark:shadow-xl dark:hover:shadow-2xl transition-all duration-300 overflow-hidden hover:bg-white dark:hover:bg-[#0a2540]"
            >
              <CardContent className="p-8">
                {/* 카드 헤더 */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white font-['Geist Mono']">{feature.title}</h3>
                </div>

                {/* 카드 설명 */}
                <p className="text-lg text-gray-600 dark:text-blue-100/80 mb-8 font-['Geist Mono'] whitespace-pre-line">
                  {feature.description}
                </p>

                {/* 관련 기능 태그 */}
                <div className="flex flex-wrap gap-2">
                  {feature.relatedFeatures.map((tag, i) => (
                    <div 
                      key={i}
                      className={`
                        px-4 py-2 rounded-full 
                        bg-gradient-to-r ${feature.gradient} 
                        text-white text-sm font-bold
                        shadow-lg
                        flex items-center gap-2
                        transform transition-all duration-300
                        hover:scale-105 hover:shadow-xl
                        font-['Geist Mono']
                      `}
                    >
                      <ArrowRight className="w-4 h-4" />
                      {tag}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 