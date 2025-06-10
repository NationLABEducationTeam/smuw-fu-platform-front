'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { BarChartIcon, Activity, TrendingUp, ArrowUpIcon, ArrowDownIcon, MinusIcon, Search, Loader2 } from 'lucide-react'
import { useLocationSearch } from '@/hooks/useLocationSearch'
import { API_ENDPOINTS } from '@/utils/api'
import { SearchResult } from '@/types/search'
import { BusinessData, BusinessAnalysisResponse } from '@/types/business'
import { ComparisonMetricCard } from './comparison-metric-card'
import { AdjacentAreasTable } from './adjacent-areas-table'
import { CommercialChangeDistribution } from './commercial-change-distribution'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

/* 창 폐업 분석 페이지 */

export function BusinessAnalysisPage() {
  const [data, setData] = useState<BusinessData | null>(null)
  const [adjacentData, setAdjacentData] = useState<BusinessAnalysisResponse | null>(null)
  const [activeTab, setActiveTab] = useState('operation')
  const [isLoading, setIsLoading] = useState(false)
  const {
    searchTerm,
    setSearchTerm,
    searchState,
    handleSelectLocation,
    searchLocation
  } = useLocationSearch()

  const handleLocationSelect = async (result: SearchResult) => {
    setIsLoading(true)
    try {
      const locationData = await handleSelectLocation(result)
      
      if (!locationData.administrative_code.startsWith('11')) {
        alert('서울특별시 내의 행정동만 분석 가능합니다.')
        setIsLoading(false)
        return
      }

      const administrativeCode = locationData.administrative_code.slice(0, -2)
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}${API_ENDPOINTS.COMMERCIAL_AREA_CHANGE}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            queryStringParameters: {
              adstrd_cd: administrativeCode
            }
          }),
          signal: AbortSignal.timeout(70000)
        }
      )
  
      if (!response.ok) {
        throw new Error('데이터를 불러오는데 실패했습니다')
      }
  
      const responseData = await response.json()
      const analysisData = JSON.parse(responseData.body) as BusinessAnalysisResponse
      setData(analysisData.target_area)
      setAdjacentData(analysisData)
    } catch (error) {
      console.error('Error fetching business data:', error)
      if (error instanceof Error && error.name === 'TimeoutError') {
        alert('데이터를 불러오는데 시간이 너무 오래 걸립니다. 잠시 후 다시 시도해주세요.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    if (searchTerm.trim().length >= 2) {
      await searchLocation(searchTerm.trim())
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="flex-1 overflow-auto">
        <main className="p-8 max-w-7xl mx-auto">
          <Card className="mb-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="flex gap-4 items-center">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="행정동 이름을 입력하세요 (서울시만 가능합니다)"
                    className="pl-10 h-12 text-lg rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-colors duration-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                  disabled={isLoading || searchState.isLoading}
                >
                  {isLoading || searchState.isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {isLoading ? '분석중...' : '검색중...'}
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-5 w-5" />
                      검색
                    </>
                  )}
                </Button>
              </form>

              {searchState.results && searchState.results.length > 0 && (
                <div className="relative mt-2">
                  <Card className="absolute w-full z-50 shadow-xl border-gray-200">
                    <CardContent className="p-0">
                      {searchState.results.map((result, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          className="w-full justify-start rounded-none hover:bg-blue-50 transition-colors duration-200 py-3 text-left"
                          onClick={() => handleLocationSelect(result)}
                        >
                          {result.full_name}
                        </Button>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
          
          {isLoading ? (
            <Card className="flex flex-col justify-center items-center h-64 shadow-lg">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
              <p className="text-gray-600 font-medium">데이터를 불러오는 중입니다...</p>
            </Card>
          ) : adjacentData ? (
            <div className="space-y-8">
              <section>
                <h2 className="text-3xl font-bold mb-6 text-gray-800">{data?.adstrd_cd_nm} 상권 분석</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <InsightCard title="영업 기간 분석" data={data?.insights.summary.operation} />
                  <InsightCard title="폐업 기간 분석" data={data?.insights.summary.closure} />
                  <CommercialTrendCard trends={data?.commercial_change_trends} />
                </div>

                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>시계열 분석</CardTitle>
                    <CardDescription>영업 및 폐업 기간의 시간에 따른 변화</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="operation" onValueChange={(value) => setActiveTab(value)}>
                      <TabsList className="mb-4">
                        <TabsTrigger value="operation">영업 기간</TabsTrigger>
                        <TabsTrigger value="closure">폐업 기간</TabsTrigger>
                      </TabsList>
                      <TabsContent value="operation">
                        <TimeSeriesChart data={data} type="operation" />
                      </TabsContent>
                      <TabsContent value="closure">
                        <TimeSeriesChart data={data} type="closure" />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>분석 인사이트</CardTitle>
                    <CardDescription>주요 분석점과 및 시사점</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-2">
                      {data?.insights.analysis.map((insight, index) => (
                        <li key={index} className="text-gray-700">{insight}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </section>

              <AdjacentAreasTable data={adjacentData.adjacent} />
              <CommercialChangeDistribution 
                distribution={adjacentData.comparison_metrics.changes_summary.distribution}
                totalCount={adjacentData.comparison_metrics.changes_summary.total_count}
              />
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}

function InsightCard({ title, data }: { title: string; data: BusinessData['insights']['summary']['operation'] | null | undefined }) {
  if (!data) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">지역 증감률</p>
              <p className="text-2xl font-bold">
                {data.local_growth > 0 ? '+' : ''}{data.local_growth}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">서울 증감률</p>
              <p className="text-2xl font-bold">
                {data.seoul_growth > 0 ? '+' : ''}{data.seoul_growth}%
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">서울 평균과의 차이:</span>
            <span className="font-medium">
              {data.comparison_with_seoul > 0 ? '+' : ''}{data.comparison_with_seoul}개월
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">추세:</span>
            <span className="flex items-center space-x-1">
              {data.trend === '증가' ? (
                <ArrowUpIcon className="w-4 h-4 text-green-500" />
              ) : data.trend === '감소' ? (
                <ArrowDownIcon className="w-4 h-4 text-red-500" />
              ) : (
                <MinusIcon className="w-4 h-4 text-yellow-500" />
              )}
              <span className={`font-medium ${
                data.trend === '증가' ? 'text-green-600' :
                data.trend === '감소' ? 'text-red-600' :
                'text-yellow-600'
              }`}>
                {data.trend}
              </span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CommercialTrendCard({ trends }: { trends: BusinessData['commercial_change_trends'] | null | undefined }) {
  if (!trends || trends.length === 0) return null

  const latestTrend = trends[trends.length - 1]
  const trendCount = trends.filter(trend => trend === latestTrend).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">상권 변화 추이</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold mb-2">{latestTrend}</p>
        <p className="text-sm text-gray-500">최근 {trendCount}분기 동안 지속됨</p>
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={trends.map((trend, index) => ({ name: `Q${index + 1}`, value: trend === latestTrend ? 1 : 0 }))}>
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function TimeSeriesChart({ data, type }: { data: BusinessData | null | undefined; type: 'operation' | 'closure' }) {
  if (!data) return null

  const chartData = data.time_series.labels.map((label, index) => ({
    name: label,
    local: data.time_series.datasets[type].avg_months.local[index],
    seoul: data.time_series.datasets[type].avg_months.seoul[index],
  }))

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          dataKey="name"
          tick={{ fill: '#6b7280' }}
          tickLine={{ stroke: '#6b7280' }}
          axisLine={{ stroke: '#6b7280' }}
        />
        <YAxis
          tick={{ fill: '#6b7280' }}
          tickLine={{ stroke: '#6b7280' }}
          axisLine={{ stroke: '#6b7280' }}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e0e0e0' }}
          labelStyle={{ color: '#111827' }}
        />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        <Line type="monotone" dataKey="local" name="지역 평균" stroke="#3b82f6" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="seoul" name="서울 평균" stroke="#10b981" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}