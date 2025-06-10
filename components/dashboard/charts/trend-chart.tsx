'use client'

import { useState, useRef, useEffect } from 'react'
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ReferenceArea } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TimeStance, TrendingKeyword } from '@/types/dashboard'
import { motion, AnimatePresence } from 'framer-motion'
import { ZoomIn, ZoomOut, RefreshCw, Info, TrendingUp, Download } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ChartDataPoint {
  time: number;
  [key: string]: number;  // 동적 키워드를 위한 인덱스 시그니처
}

interface TrendChartProps {
  timeStance: TimeStance;
  selectedKeywords: string[];
  chartData: ChartDataPoint[];  // any[] 대신 구체적인 타입 사용
  trendingKeywords: TrendingKeyword[];
  onTimeStanceChange: (value: TimeStance) => void;
  onKeywordToggle: (keyword: string) => void;
}

export function TrendChart({
  timeStance,
  selectedKeywords,
  chartData,
  trendingKeywords,
  onTimeStanceChange,
  onKeywordToggle
}: TrendChartProps) {
  // 차트 줌 기능을 위한 상태
  const [zoomState, setZoomState] = useState<{
    refAreaLeft: number | null;
    refAreaRight: number | null;
    isZooming: boolean;
    zoomedData: ChartDataPoint[];
  }>({
    refAreaLeft: null,
    refAreaRight: null,
    isZooming: false,
    zoomedData: chartData
  });

  // 차트 데이터 업데이트 시 zoomedData도 업데이트
  useEffect(() => {
    setZoomState(prev => ({
      ...prev,
      zoomedData: chartData
    }));
  }, [chartData]);

  // 차트 줌 관련 핸들러
  const handleZoomStart = (e: any) => {
    if (!e) return;
    setZoomState(prev => ({
      ...prev,
      refAreaLeft: e.activeLabel,
      isZooming: true
    }));
  };

  const handleZoomMove = (e: any) => {
    if (!e || !zoomState.isZooming) return;
    setZoomState(prev => ({
      ...prev,
      refAreaRight: e.activeLabel
    }));
  };

  const handleZoomEnd = () => {
    if (!zoomState.refAreaLeft || !zoomState.refAreaRight) {
      setZoomState(prev => ({
        ...prev,
        isZooming: false,
        refAreaLeft: null,
        refAreaRight: null
      }));
      return;
    }

    // 줌 영역 정규화
    let left = Math.min(zoomState.refAreaLeft, zoomState.refAreaRight);
    let right = Math.max(zoomState.refAreaLeft, zoomState.refAreaRight);

    // 줌 데이터 필터링
    const zoomedData = chartData.filter(
      (entry) => entry.time >= left && entry.time <= right
    );

    setZoomState({
      refAreaLeft: null,
      refAreaRight: null,
      isZooming: false,
      zoomedData: zoomedData.length > 0 ? zoomedData : chartData
    });
  };

  const handleResetZoom = () => {
    setZoomState({
      refAreaLeft: null,
      refAreaRight: null,
      isZooming: false,
      zoomedData: chartData
    });
  };

  // 시간대 표시 포맷터
  const formatTime = (value: number): string => {
    if (timeStance === 'yesterday') return `${value}시`;
    if (timeStance === 'weekly') return `${value + 1}일`;
    if (timeStance === 'monthly') return `${value + 1}주`;
    if (timeStance === 'quarterly') return `${value + 1}월`;
    return value.toString();
  };

  // 키워드 색상 생성
  const getKeywordColor = (index: number) => {
    const colors = [
      'hsl(210, 100%, 50%)', // 파랑
      'hsl(340, 90%, 55%)',  // 핑크
      'hsl(160, 80%, 45%)',  // 녹색
      'hsl(40, 100%, 55%)',  // 주황
      'hsl(270, 70%, 60%)',  // 보라
      'hsl(190, 90%, 50%)',  // 청록
      'hsl(0, 90%, 60%)',    // 빨강
      'hsl(60, 100%, 45%)',  // 노랑
    ];
    return colors[index % colors.length];
  };

  // 키워드 그룹화 (카테고리별)
  const keywordCategories = trendingKeywords.reduce((acc, keyword) => {
    // 여기서는 간단히 첫 글자로 그룹화 (실제로는 더 의미 있는 카테고리 로직 필요)
    const firstChar = keyword.keyword.charAt(0);
    if (!acc[firstChar]) {
      acc[firstChar] = [];
    }
    acc[firstChar].push(keyword);
    return acc;
  }, {} as Record<string, TrendingKeyword[]>);

  return (
    <Card className="overflow-hidden shadow-lg border-none bg-gradient-to-br from-white to-blue-50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b bg-white p-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-xl font-bold text-gray-900">키워드 트렌드</CardTitle>
          </div>
          <p className="text-sm text-gray-500">시간대별 키워드 검색량 추이</p>
        </div>
        <div className="flex items-center gap-2">
          <Select 
            value={timeStance} 
            onValueChange={onTimeStanceChange}
          >
            <SelectTrigger className="w-[140px] bg-white border-gray-200">
              <SelectValue placeholder="시간 범위 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yesterday">전일</SelectItem>
              <SelectItem value="weekly">주간</SelectItem>
              <SelectItem value="monthly">월간</SelectItem>
              <SelectItem value="quarterly">분기별</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleResetZoom}
            disabled={zoomState.zoomedData === chartData}
            className="bg-white"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            className="bg-white"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="chart" className="mb-6">
          <TabsList className="bg-blue-100/50">
            <TabsTrigger value="chart">차트</TabsTrigger>
            <TabsTrigger value="keywords">키워드</TabsTrigger>
          </TabsList>
          <TabsContent value="chart" className="mt-4">
            <div className="h-[400px] relative">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={`chart-${timeStance}-${selectedKeywords.join('-')}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={zoomState.zoomedData}
                      onMouseDown={handleZoomStart}
                      onMouseMove={handleZoomMove}
                      onMouseUp={handleZoomEnd}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="time" 
                        stroke="#64748b"
                        tickFormatter={formatTime}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        stroke="#64748b" 
                        tick={{ fontSize: 12 }}
                        width={40}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          padding: '12px'
                        }}
                        formatter={(value, name) => [value, name]}
                        labelFormatter={(value) => formatTime(Number(value))}
                      />
                      <Legend 
                        verticalAlign="top" 
                        height={36}
                        formatter={(value) => (
                          <span className="text-sm font-medium">{value}</span>
                        )}
                      />
                      {selectedKeywords.map((keyword, index) => (
                        <Line
                          key={keyword}
                          type="monotone"
                          dataKey={keyword}
                          name={keyword}
                          stroke={getKeywordColor(index)}
                          strokeWidth={3}
                          dot={false}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                          animationDuration={1000}
                          animationEasing="ease-in-out"
                        />
                      ))}
                      {zoomState.refAreaLeft && zoomState.refAreaRight && (
                        <ReferenceArea
                          x1={zoomState.refAreaLeft}
                          x2={zoomState.refAreaRight}
                          strokeOpacity={0.3}
                          fill="#3b82f6"
                          fillOpacity={0.3}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                  
                  {/* 줌 안내 메시지 */}
                  <div className="absolute bottom-0 left-0 p-2 text-xs text-gray-500 flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    <span>드래그하여 확대</span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </TabsContent>
          <TabsContent value="keywords" className="mt-4">
            <div className="space-y-4">
              {Object.entries(keywordCategories).map(([category, keywords]) => (
                <div key={category} className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">{category} 관련</h3>
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((keyword) => (
                      <motion.div
                        key={keyword.keyword}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className={`
                            transition-all duration-200 rounded-full
                            ${selectedKeywords.includes(keyword.keyword)
                              ? 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600'
                              : 'bg-white text-gray-700 hover:bg-blue-50 border-gray-200'
                            }
                          `}
                          onClick={() => onKeywordToggle(keyword.keyword)}
                        >
                          {keyword.keyword}
                          <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                            selectedKeywords.includes(keyword.keyword)
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {keyword.count}
                          </span>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* 선택된 키워드 요약 */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">선택된 키워드</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 text-xs h-7 px-2"
              onClick={() => selectedKeywords.forEach(k => onKeywordToggle(k))}
              disabled={selectedKeywords.length === 0}
            >
              모두 해제
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedKeywords.length > 0 ? (
              selectedKeywords.map((keyword, index) => (
                <div 
                  key={keyword}
                  className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                  style={{ backgroundColor: `${getKeywordColor(index)}20`, color: getKeywordColor(index) }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getKeywordColor(index) }}></span>
                  {keyword}
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500">선택된 키워드가 없습니다</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}