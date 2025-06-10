'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, MapIcon, Search, TrendingUp, Brain, Store, MessageSquare, AlertTriangle } from 'lucide-react'
import { FEATURES, getStatusColor } from '@/types/feature-status'
import { Badge } from "@/components/ui/badge"

// 반응형 스타일 클래스 정의
const styles = {
  modalContainer: `
    fixed inset-0 bg-black/50 flex items-center justify-center z-50
    p-3
  `,
  card: `
    w-full max-w-3xl
  `,
  cardContent: `
    p-3
  `,
  titleSection: `
    space-y-2
  `,
  mainTitle: `
    text-blue-600 font-medium mb-1
    text-sm
  `,
  subtitle: `
    text-gray-900 font-bold leading-tight
    text-base
  `,
  updateLink: `
    flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors
    text-xs
    hidden sm:flex
  `,
  featureSection: `
    bg-gradient-to-br from-gray-50 to-white rounded-xl
    border border-gray-100
  `,
  featureGrid: `
    grid
    grid-cols-1 sm:grid-cols-2
  `,
  featureItem: `
    flex items-start gap-2
    bg-white border border-gray-100 shadow-sm
    hover:shadow-md transition-shadow duration-200
  `,
  statusLegend: `
    flex items-center justify-center flex-wrap
    text-xs
  `,
  updateLog: `
    bg-gradient-to-r from-blue-50 to-indigo-50 
    border border-blue-100 rounded-lg
  `,
  updateLogTitle: `
    font-semibold text-blue-800 flex items-center gap-2
    text-sm
  `,
  updateLogItem: `
    flex items-start gap-2 text-sm text-blue-700
    pl-6
  `,
  updateNotice: `
    mt-3 p-3 bg-yellow-50 border border-yellow-200 
    rounded-lg text-yellow-700 text-sm
    flex items-start gap-2
  `,
}

// 기능별 아이콘 매핑
const FEATURE_ICONS = {
  '요식업/푸드테크 트렌드': TrendingUp,
  '상세 지도': MapIcon,
  '키워드 검색': Search,
  'AI 창업 진단': Brain,
  '창/폐업 분석': Store,
  'AI 챗봇': MessageSquare,
} as const;

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsOpen(true)
  }, [])

  const handleClose = () => {
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className={styles.modalContainer}>
      <Card className={styles.card}>
        <CardContent className={styles.cardContent}>
          <div className="space-y-4">
            <div className={styles.titleSection}>
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant="outline" className="mb-2 bg-blue-50 text-blue-700 border-blue-200">
                    Version 3.0
                  </Badge>
                  <h2 className={styles.subtitle}>
                    Amazon Bedrock 기반 AI 챗봇이 추가되었습니다
                  </h2>
                  <p className="text-gray-600 mt-1 text-sm">
                    Claude 3.5 Sonnet 모델을 활용한 고성능 AI 챗봇을 만나보세요.
                  </p>
                </div>
                <a 
                  href="https://rustic-kryptops-10c.notion.site/DeepBistro-14597216034e806eb2b6f218ca7f1da3?pvs=4" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.updateLink}
                >
                  <span>업데이트 로그</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              <div className={`${styles.updateLog} mt-2 p-3`}>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-700">Amazon Bedrock의 Claude 3.5 Sonnet 모델 통합</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <span className="text-sm text-blue-700">실시간 스트리밍 응답</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <span className="text-sm text-blue-700">대화 컨텍스트 유지</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${styles.featureSection} p-3 mt-2`}>
              <h3 className="font-semibold text-gray-900 mb-3 text-base">
                서비스 현황
              </h3>
              <div className={`${styles.featureGrid} gap-3`}>
                {FEATURES.map((feature, index) => {
                  const Icon = FEATURE_ICONS[feature.name as keyof typeof FEATURE_ICONS];
                  const statusColor = getStatusColor(feature.status);
                  
                  return (
                    <div 
                      key={index} 
                      className={`${styles.featureItem} p-3`}
                    >
                      {Icon && (
                        <div className={`p-1.5 rounded-lg bg-${statusColor}-50`}>
                          <Icon className={`w-4 h-4 text-${statusColor}-600`} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 text-sm">
                            {feature.name}
                          </p>
                          <span className={`w-2 h-2 rounded-full bg-${statusColor}-500`} />
                        </div>
                        {feature.description && (
                          <p className="text-xs text-gray-600 mt-0.5">
                            {feature.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={`${styles.statusLegend} pt-1 gap-3`}>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs">사용 가능</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span className="text-xs">베타 테스트</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-xs">업데이트 중</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-xs">준비 중</span>
              </div>
            </div>
          </div>

          <Button 
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 text-sm"
            onClick={handleClose}
          >
            확인했습니다
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}