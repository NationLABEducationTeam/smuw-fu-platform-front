"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingUp, TrendingDown, Users, Building2, BarChart3, Clock, ArrowLeft, ChevronLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts'
import { SalesData } from '@/types/analysis'
import { Button } from '@/components/ui/button'

export interface AnalysisPanelProps {
  isOpen: boolean
  onClose: () => void
  data: SalesData | null
  isCollapsed?: boolean
  onToggle?: () => void
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F']

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('ko-KR', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(num)
}

const formatPercent = (num: number) => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(num / 100)
}

export function AnalysisPanel({ isOpen, onClose, data, isCollapsed, onToggle }: AnalysisPanelProps) {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (data?.industries) {
      // console.log('분석 패널 데이터 수신:', data);
      const industryKeys = Object.keys(data.industries);
      // console.log('사용 가능한 업종 목록:', industryKeys);
      if (industryKeys.length > 0) {
        setSelectedIndustry(industryKeys[0]);
      }
    }
  }, [data])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (!data || !selectedIndustry) return null
  if (!isOpen) return null
  if (!data.industries) {
    console.error('업종 데이터가 없습니다');
    return null;
  }

  const industryData = data.industries[selectedIndustry]
  // console.log('선택된 업종 데이터:', selectedIndustry, industryData);

  const dailySalesData = Object.entries(industryData.sales_analysis.daily_sales.data).map(([day, sales]) => ({
    day,
    sales: sales
  }))

  const timeSalesData = Object.entries(industryData.sales_analysis.time_based_sales.data).map(([time, sales]) => ({
    time,
    sales: sales
  }))

  const demographicsData = Object.entries(industryData.sales_analysis.demographics.age).map(([age, sales]) => ({
    age,
    sales: sales
  }))

  const totalSales = Object.values(industryData.sales_analysis.daily_sales.data).reduce((sum, sales) => sum + sales, 0)
  const averageDailySales = totalSales / 7

  // 고객 수 관련 데이터 추가 로깅
  // console.log('고객 수 데이터:', industryData.sales_analysis.weekday_weekend);

  // 접힌 상태일 때 표시할 축소된 패널
  if (isCollapsed) {
    return (
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ 
          type: 'spring', 
          damping: 30, 
          stiffness: 300,
          mass: 1
        }}
        className={`
          fixed top-4 right-4 z-50
          bg-white rounded-lg shadow-xl overflow-hidden
          flex flex-col cursor-pointer
        `}
        onClick={onToggle}
      >
        <div className="p-3 flex items-center gap-2">
          <h2 className="text-sm font-bold text-gray-800">{data.district_name}</h2>
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ 
        type: 'spring', 
        damping: 30, 
        stiffness: 300,
        mass: 1
      }}
      className={`
        fixed top-0 right-0 z-50 h-full 
        ${isMobile ? 'w-full' : 'w-[480px]'} 
        bg-white shadow-xl overflow-y-auto
        flex flex-col
      `}
    >
      <div className="sticky top-0 bg-white z-10 p-4 border-b flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button 
              onClick={onClose}
              variant="ghost" 
              size="icon"
              className="mr-2 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Button>
            <h2 className="text-xl font-bold text-gray-800">{data.district_name} 분석</h2>
          </div>
          <Button 
            onClick={onClose}
            variant="ghost" 
            size="icon"
            className="rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-700" />
          </Button>
        </div>
        
        <div className="relative">
          <select 
            className="w-full p-3 border rounded-lg bg-white appearance-none pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
          >
            {data.industries && Object.entries(data.industries).map(([id, industry]) => (
              <option key={id} value={id}>{industry.industry_name}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 flex-grow">
        {/* Customer Count Section */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span>평균 일일 고객수</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-4">
              {industryData.sales_analysis.weekday_weekend.weekday.toLocaleString()} 명
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>주중/주말 비율</span>
                  <span className="font-medium">
                    {formatPercent(industryData.sales_analysis.weekday_weekend.weekday / (industryData.sales_analysis.weekday_weekend.weekday + industryData.sales_analysis.weekday_weekend.weekend))} / 
                    {formatPercent(industryData.sales_analysis.weekday_weekend.weekend / (industryData.sales_analysis.weekday_weekend.weekday + industryData.sales_analysis.weekday_weekend.weekend))}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500" 
                    style={{ 
                      width: `${(industryData.sales_analysis.weekday_weekend.weekday / (industryData.sales_analysis.weekday_weekend.weekday + industryData.sales_analysis.weekday_weekend.weekend)) * 100}%` 
                    }} 
                  />
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-2">시간대별 매출</div>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={timeSalesData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#e5e7eb">
                      {timeSalesData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.sales === Math.max(...timeSalesData.map(d => d.sales)) ? "#3b82f6" : "#e5e7eb"} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales Analysis Section */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-rose-500" />
              <span>일평균 추정매출</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-4">
              {(averageDailySales / 10000).toLocaleString()} 만 원
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-2">요일별 매출</div>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={dailySalesData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#e5e7eb">
                      {dailySalesData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.sales === Math.max(...dailySalesData.map(d => d.sales)) ? "#ef4444" : "#e5e7eb"} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demographics Section */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" />
              <span>주 고객층</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {/* 성별 분포 */}
              <div>
                <div className="text-sm text-gray-600 mb-2">성별</div>
                <div className="h-[180px]"> {/* 높이 조정 */}
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: '남성', value: industryData.sales_analysis.demographics.gender.male },
                          { name: '여성', value: industryData.sales_analysis.demographics.gender.female }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={50}
                        fill="#8884d8"
                        dataKey="value"
                        labelLine={false} // 라벨 선 제거
                        label={({ name, percent }) => `${name}\n${(percent * 100).toFixed(0)}%`}
                      >
                        {[
                          { name: '남성', value: industryData.sales_analysis.demographics.gender.male },
                          { name: '여성', value: industryData.sales_analysis.demographics.gender.female }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 연령대별 분포 */}
              <div>
                <div className="text-sm text-gray-600 mb-2">연령대</div>
                <div className="h-[180px]"> {/* 높이 조정 */}
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={demographicsData}
                        cx="50%"
                        cy="50%"
                        outerRadius={50}
                        fill="#8884d8"
                        dataKey="sales"
                        labelLine={false} // 라벨 선 제거
                        label={({ age, percent }) => `${age}\n${(percent * 100).toFixed(0)}%`}
                      >
                        {demographicsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 수치로 보기 */}
              <div className="col-span-2 mt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>성별:</strong>
                    <div>남성: {formatNumber(industryData.sales_analysis.demographics.gender.male)}원</div>
                    <div>여성: {formatNumber(industryData.sales_analysis.demographics.gender.female)}원</div>
                  </div>
                  <div>
                    <strong>연령대:</strong>
                    {Object.entries(industryData.sales_analysis.demographics.age).map(([age, sales]) => (
                      <div key={age}>{age}: {formatNumber(sales)}원</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Peak Time Section */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" />
              <span>피크 타임</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-4">
              {Object.entries(industryData.sales_analysis.time_based_sales.data).reduce((a, b) => a[1] > b[1] ? a : b)[0]}
            </div>
            <div className="text-sm text-gray-600">
              해당 시간대 매출: {formatNumber(Math.max(...Object.values(industryData.sales_analysis.time_based_sales.data) as number[]) / 10000)}원
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

