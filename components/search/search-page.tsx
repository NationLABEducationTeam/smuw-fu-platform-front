'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Activity, TrendingUp, Calendar, X, BarChart2, ExternalLink, Image, Map, FileText, Globe, MapPin, Clock, Download } from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, BarChart, Bar, Area, AreaChart, CartesianGrid, Cell, ReferenceDot, Label } from 'recharts'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { KeywordInsights } from './keyword-insights'
import { fetchFromAPI, fetchFromFastAPI, API_ENDPOINTS } from '@/utils/api'
import { FileText as FileTextIcon, Globe as GlobeIcon, Map as MapIcon, Image as ImageIcon } from 'lucide-react'

// Define interfaces for the component
interface TrendData {
  count: string
  change: string
  period_change: string
  graph_data: number[]
  weekday_stats?: {
    mon: number
    tue: number
    wed: number
    thu: number
    fri: number
    sat: number
    sun: number
  }
}

interface ApiResponse {
  message: string
  timestamp: string
  processingTime: number
  duration: string
  results: {
    daily: TrendData[]
    weekly: TrendData[]
    monthly: TrendData[]
  }
}

interface SearchState {
  keyword: string
  data: ApiResponse | null 
  isLoading: boolean
  error: string | null
}

type Duration = '1month' | '3month' | '1year' | '3year'
type TimeUnit = 'daily' | 'weekly' | 'monthly'

// 추천 검색어 데이터
const SUGGESTED_SEARCHES = [
  { text: "요아정", category: "메뉴" },
  { text: "탕후루", category: "장소" },
  { text: "우설", category: "메뉴" },
  { text: "굽네치킨", category: "장소" },
  { text: "판다익스프레스", category: "메뉴" },
];

// 말풍선 컴포넌트
const SuggestionBubble = ({ text, category, onClick }: { 
  text: string; 
  category: string;
  onClick: () => void;
}) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="group relative bg-white px-4 py-2 rounded-2xl shadow-sm border border-blue-100 hover:border-blue-300 transition-colors"
    onClick={onClick}
  >
    <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white border-b border-r border-blue-100 group-hover:border-blue-300 transition-colors transform rotate-45" />
    <div className="flex items-center gap-2">
      <span className="text-gray-900">{text}</span>
      <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-xs">
        {category}
      </Badge>
    </div>
  </motion.button>
);

// 빈 상태 컴포넌트
const EmptyState = ({ onSearch }: { onSearch: (keyword: string) => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="mt-12 text-center"
  >
    <div className="w-64 h-64 mx-auto mb-6 bg-gradient-to-b from-blue-50 to-transparent rounded-full flex items-center justify-center">
      <Search className="w-24 h-24 text-blue-200" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">
      검색어를 입력해보세요
    </h3>
    <p className="text-gray-500 mb-8">
      메뉴, 식당, 가격 등 다양한 정보를 검색할 수 있어요
    </p>
    <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
      {SUGGESTED_SEARCHES.map((suggestion, index) => (
        <SuggestionBubble
          key={index}
          {...suggestion}
          onClick={() => onSearch(suggestion.text)}
        />
      ))}
    </div>
  </motion.div>
);

// Custom tooltip component for the main chart
const CustomTooltip = ({ active, payload, label, timeUnit }: any) => {
  if (!active || !payload || !payload.length || !payload[0]?.value) return null;

  return (
    <Card className="border-none shadow-lg">
      <CardContent className="p-4 bg-white/95 backdrop-blur-lg">
        <div className="mb-2 pb-2 border-b">
          <p className="font-medium text-sm text-muted-foreground">
            {timeUnit === 'daily' ? `${label}일` : 
             timeUnit === 'weekly' ? `${label + 1}주차` : 
             `${label + 1}월`}
          </p>
        </div>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 py-1">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ 
                  background: entry.color
                }}
              />
              <span className="font-medium text-sm">{entry.name}</span>
            </div>
            <span className="font-mono text-sm">{Number(entry.value).toLocaleString()}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// 시간 라벨 포맷팅 함수
const getTimeLabel = (value: number, timeUnit: TimeUnit) => {
  if (timeUnit === 'daily') {
    return `${value}일`;
  }
  if (timeUnit === 'weekly') {
    return `${value + 1}주차`;
  }
  // 월간 데이터의 경우 현재 월부터 이전 월 순서로 표시
  const now = new Date();
  const currentMonth = now.getMonth();
  const targetMonth = (currentMonth - value + 12) % 12;  // 음수 처리를 위해 12를 더하고 나머지 연산
  return `${targetMonth + 1}월`;
};

// 최고점 라벨 컴포넌트
const CustomLabel = ({ value, color, timeLabel, viewBox }: {
  value: number;
  color: string;
  timeLabel: string;
  viewBox?: { x: number; y: number };
}) => {
  const x = viewBox?.x ?? 0;
  const y = viewBox?.y ?? 0;

  return (
    <g transform={`translate(${x - 40}, ${y - 20})`}>
      <rect
        x="0"
        y="0"
        width="80"
        height="24"
        rx="12"
        fill={color}
        fillOpacity={0.1}
      />
      <text
        x="40"
        y="16"
        textAnchor="middle"
        fill={color}
        className="text-xs font-medium"
      >
        {`${timeLabel} · ${value.toLocaleString()}`}
      </text>
    </g>
  );
};

// 시계열 차트 컴포넌트
const TimeSeriesChart = ({ data, timeUnit }: { data: any[], timeUnit: TimeUnit }) => {
  const peaks = Object.keys(data[0] || {})
    .filter(key => key !== 'time')
    .map(key => {
      const maxValue = Math.max(...data.map(d => d[key] || 0));
      const peakPoint = data.find(d => d[key] === maxValue);
      return { keyword: key, value: maxValue, time: peakPoint?.time };
    });

  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart 
          data={data} 
          margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
          <defs>
            {Object.keys(data[0] || {}).filter(key => key !== 'time').map((key, index) => {
              const colors = [
                { start: '#22C55E', end: '#86EFAC' }, // 그린
                { start: '#0EA5E9', end: '#38BDF8' }, // 스카이블루
                { start: '#6366F1', end: '#A5B4FC' }, // 인디고
                { start: '#EC4899', end: '#F9A8D4' }, // 핑크
                { start: '#F59E0B', end: '#FCD34D' }, // 앰버
              ];
              const gradient = colors[index % colors.length];
              return (
                <linearGradient 
                  key={key} 
                  id={`colorGradient-${index}`} 
                  x1="0" y1="0" x2="0" y2="1"
                >
                  <stop offset="5%" stopColor={gradient.start} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={gradient.end} stopOpacity={0.1} />
                </linearGradient>
              );
            })}
          </defs>
          <XAxis
            dataKey="time"
            stroke="#64748b"
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => getTimeLabel(value, timeUnit)}
          />
          <YAxis 
            stroke="#64748b"
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip content={<CustomTooltip timeUnit={timeUnit} />} />
          <Legend verticalAlign="top" height={36} />
          {Object.keys(data[0] || {}).filter(key => key !== 'time').map((key, index) => {
            const colors = [
              { stroke: '#22C55E', fill: `url(#colorGradient-${index})` }, // 그린
              { stroke: '#0EA5E9', fill: `url(#colorGradient-${index})` }, // 스카이블루
              { stroke: '#6366F1', fill: `url(#colorGradient-${index})` }, // 인디고
              { stroke: '#EC4899', fill: `url(#colorGradient-${index})` }, // 핑크
              { stroke: '#F59E0B', fill: `url(#colorGradient-${index})` }, // 앰버
            ];
            const color = colors[index % colors.length];
            const peak = peaks.find(p => p.keyword === key);
            
            return (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                name={key}
                stroke={color.stroke}
                fill={color.fill}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, fill: color.stroke }}
              >
                {peak && (
                  <ReferenceDot
                    x={peak.time}
                    y={peak.value}
                    r={4}
                    fill={color.stroke}
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    <Label
                      content={
                        <CustomLabel 
                          value={peak.value} 
                          color={color.stroke}
                          timeLabel={getTimeLabel(peak.time, timeUnit)}
                        />
                      }
                      position="top"
                    />
                  </ReferenceDot>
                )}
              </Area>
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// 요일별 차트 컴포넌트
const WeekdayChart = ({ data, keyword }: { data: { [key: string]: number }, keyword: string }) => {
  const weekdayLabels = {
    mon: '월', tue: '화', wed: '수', thu: '목', fri: '금', sat: '토', sun: '일'
  };

  const chartData = Object.entries(data).map(([key, value]) => ({
    day: weekdayLabels[key as keyof typeof weekdayLabels],
    value: value
  }));

  const maxValue = Math.max(...chartData.map(item => item.value));

  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} barSize={32}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
          <XAxis 
            dataKey="day" 
            stroke="#64748b"
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            stroke="#64748b"
            tickFormatter={(value) => value.toLocaleString()}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }}
            content={({ active, payload, label }) => {
              if (!active || !payload || !payload[0]?.value) return null;
              const value = Number(payload[0].value);
              return (
                <div className="bg-white px-3 py-2 shadow-lg rounded-lg border border-gray-100">
                  <p className="font-medium text-sm text-gray-900">{label}요일</p>
                  <p className="text-sm font-mono mt-1 text-gray-600">
                    {value.toLocaleString()} 검색
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    전체 대비 {Math.round((value / maxValue) * 100)}%
                  </p>
                </div>
              );
            }}
          />
          <Bar 
            dataKey="value" 
            radius={[4, 4, 0, 0]}
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index === 5 || index === 6 ? '#22C55E' : '#86EFAC'}
                fillOpacity={0.9}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export function SearchPage() {
  const [searchStates, setSearchStates] = useState<SearchState[]>([])
  const [currentKeyword, setCurrentKeyword] = useState('')
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('daily')
  const [duration, setDuration] = useState<Duration>('1month')
  const [keywordInsights, setKeywordInsights] = useState<{
    data: any | null;
    isLoading: boolean;
    error: string | null;
  }>({
    data: null,
    isLoading: false,
    error: null,
  });
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  
  // 음성 인식 기능
  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // @ts-ignore - 브라우저 API 호환성을 위해 타입 오류 무시
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      // @ts-ignore
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'ko-KR';
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      // @ts-ignore
      recognition.onresult = (event) => {
        // @ts-ignore
        const transcript = event.results[0][0].transcript;
        setCurrentKeyword(transcript);
        setIsAutocompleteOpen(false);
      };
      
      // @ts-ignore
      recognition.onerror = (event) => {
        // @ts-ignore
        console.error('음성 인식 오류:', event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    } else {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다.');
    }
  };
  
  // 자동완성 기능
  useEffect(() => {
    if (currentKeyword.trim().length > 0) {
      // 실제 구현시에는 API로 변경
      const mockSuggestions = [
        `${currentKeyword} 맛집`,
        `${currentKeyword} 메뉴`,
        `${currentKeyword} 가격`,
        `${currentKeyword} 영업시간`,
        `${currentKeyword} 위치`
      ];
      
      setSuggestions(mockSuggestions);
      setIsAutocompleteOpen(true);
    } else {
      setIsAutocompleteOpen(false);
    }
  }, [currentKeyword]);

  // Effect to refresh all keywords when duration or time unit changes
  useEffect(() => {
    if (searchStates.length > 0) {
      refreshAllKeywords()
    }
  }, [duration, timeUnit])

  // Function to refresh all keywords
  const refreshAllKeywords = async () => {
    const updatedStates = await Promise.all(
      searchStates.map(async (state) => {
        try {
          const response = await fetch('https://j7vj4npzmuazojs4t4wmewltcu0ncrlj.lambda-url.ap-northeast-2.on.aws/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              keyword: state.keyword,
              duration 
            }),
          })

          if (!response.ok) {
            throw new Error('키워드 분석 중 오류가 발생했습니다')
          }

          const data: ApiResponse = await response.json()
          return { ...state, data, isLoading: false, error: null }
        } catch (err) {
          return { 
            ...state, 
            error: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다',
            isLoading: false 
          }
        }
      })
    )

    setSearchStates(updatedStates)
  }

  // Function to handle duration change
  const handleDurationChange = (newDuration: Duration) => {
    setDuration(newDuration)
  }

  // Function to handle time unit change
  const handleTimeUnitChange = (newTimeUnit: TimeUnit) => {
    setTimeUnit(newTimeUnit)
  }

  // Function to handle search
  const handleSearch = async (keyword: string = currentKeyword) => {
    if (!keyword.trim()) return;
    if (searchStates.length >= 5) {
      alert('최대 5개의 키워드까지 비교할 수 있습니다');
      return;
    }
    if (searchStates.some(state => state.keyword === keyword)) {
      alert('이미 추가된 키워드입니다');
      return;
    }

    const newState: SearchState = {
      keyword,
      data: null,
      isLoading: true,
      error: null
    };

    setSearchStates(prev => [...prev, newState]);

    try {
      // API Gateway의 COUCHBASE_SALES 엔드포인트로 요청 변경
      const trendData = await fetchFromAPI<ApiResponse>(API_ENDPOINTS.COUCHBASE_SALES, { 
        keyword,
        duration 
      });

      console.log('API Response:', trendData);

      setSearchStates(prev => prev.map(state => 
        state.keyword === keyword 
          ? { ...state, data: trendData, isLoading: false }
          : state
      ));

      // 키워드 인사이트 데이터도 같은 엔드포인트로 요청
      setKeywordInsights(prev => ({ ...prev, isLoading: true, error: null }));
      
      const insightsData = await fetchFromAPI(API_ENDPOINTS.COUCHBASE_SALES, { keyword });
      
      setKeywordInsights({
        data: insightsData,
        isLoading: false,
        error: null,
      });

      setCurrentKeyword('');
    } catch (err) {
      console.error('API Error:', err);
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다';
      
      setSearchStates(prev => prev.map(state => 
        state.keyword === keyword 
          ? { ...state, error: errorMessage, isLoading: false }
          : state
      ));

      setKeywordInsights(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  };

  // 키워드 삭제 함수
  const removeKeyword = (keywordToRemove: string) => {
    setSearchStates(prev => prev.filter(state => state.keyword !== keywordToRemove));
  };

  // Function to get chart data
  const getChartData = () => {
    if (searchStates.length === 0) return []
    
    const timeRangeData = searchStates.map(state => {
      const graphData = state.data?.results?.[timeUnit]?.[0]?.graph_data || [];
      return {
        keyword: state.keyword,
        data: graphData
      };
    });

    const maxLength = Math.max(...timeRangeData.map(d => d.data.length))
    return Array.from({ length: maxLength }, (_, i) => {
      const point: any = { time: i }
      timeRangeData.forEach(({ keyword, data }) => {
        point[keyword] = data[i]
      })
      return point
    })
  }

  // Function to get duration label
  const getDurationLabel = () => {
    switch (duration) {
      case '1month': return '1개월';
      case '3month': return '3개월';
      case '1year': return '1년';
      case '3year': return '3년';
    }
  }

  // Function to get time unit label
  const getTimeUnitLabel = () => {
    switch (timeUnit) {
      case 'daily': return '일간 트렌드';
      case 'weekly': return '주간 트렌드';
      case 'monthly': return '월간 트렌드';
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F9FF] to-white">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-6">
          {/* 검색 섹션 - 현대적인 디자인으로 개선 */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-blue-50 via-blue-100/50 to-white backdrop-blur-xl rounded-2xl shadow-lg border border-blue-200 p-6 md:p-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <Search className="w-7 h-7 text-blue-500" />
                  스마트 검색
                </h1>
                <p className="text-gray-500 mt-1">
                  키워드를 입력하면 다양한 형태로 검색 결과를 제공합니다
                </p>
              </div>
              <div className="flex items-center gap-2">
                {activeFilter && (
                  <Badge variant="secondary" className="h-8 bg-blue-100 text-blue-700 gap-1">
                    <span>필터: {activeFilter}</span>
                    <button
                      onClick={() => setActiveFilter(null)}
                      className="ml-1 p-0.5 hover:bg-blue-200 rounded-full transition-colors"
                      aria-label="필터 제거"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {searchStates.length > 0 && (
                  <Badge variant="secondary" className="h-8 bg-indigo-100 text-indigo-700 gap-1.5">
                    <Activity className="w-4 h-4" />
                    {searchStates.length}/5
                  </Badge>
                )}
              </div>
            </div>

            <div className="relative">
              <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <Input
                    ref={searchInputRef}
                    type="text"
                    value={currentKeyword}
                    onChange={(e) => setCurrentKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    onFocus={() => currentKeyword.trim() && setIsAutocompleteOpen(true)}
                    placeholder="검색어를 입력하세요 (예: 치킨, 맥도날드, 피자)"
                    className="flex-1 pl-10 pr-24 h-14 bg-white border-gray-200 focus:border-blue-500 rounded-xl shadow-sm text-base"
                    aria-label="검색어 입력"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    <button
                      onClick={() => setCurrentKeyword('')}
                      className={`p-1.5 rounded-full transition-colors ${
                        currentKeyword ? 'text-gray-400 hover:bg-gray-100' : 'text-transparent'
                      }`}
                      aria-label="검색어 지우기"
                      tabIndex={currentKeyword ? 0 : -1}
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={startListening}
                      className={`p-1.5 rounded-full transition-colors ${
                        isListening ? 'text-red-500 bg-red-50' : 'text-blue-500 hover:bg-blue-50'
                      }`}
                      aria-label="음성 검색"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <Button
                  onClick={() => handleSearch()}
                  disabled={!currentKeyword.trim() || searchStates.length >= 5}
                  className="h-14 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm"
                >
                  {searchStates.length === 0 ? '검색' : '키워드 추가'}
                </Button>
              </div>

              {/* 자동완성 드롭다운 */}
              <AnimatePresence>
                {isAutocompleteOpen && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute left-0 right-16 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-20"
                  >
                    <ul className="py-2">
                      {suggestions.map((suggestion, index) => (
                        <li key={index}>
                          <button
                            className="w-full px-4 py-2 text-left hover:bg-blue-50 text-gray-700 flex items-center gap-2"
                            onClick={() => {
                              setCurrentKeyword(suggestion);
                              setIsAutocompleteOpen(false);
                              setTimeout(() => handleSearch(suggestion), 100);
                            }}
                          >
                            <Search className="w-4 h-4 text-gray-400" />
                            <span>{suggestion}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 필터 버튼 그룹 */}
            <div className="mt-4 flex flex-wrap gap-2">
              {['차트', '링크', '이미지', '위치'].map((filter) => (
                <Button
                  key={filter}
                  variant="outline"
                  size="sm"
                  className={`rounded-full ${
                    activeFilter === filter 
                      ? 'bg-blue-100 text-blue-700 border-blue-300' 
                      : 'bg-white text-gray-600 hover:bg-blue-50'
                  }`}
                  onClick={() => setActiveFilter(activeFilter === filter ? null : filter)}
                >
                  {filter === '차트' && <BarChart2 className="w-3.5 h-3.5 mr-1.5" />}
                  {filter === '링크' && <ExternalLink className="w-3.5 h-3.5 mr-1.5" />}
                  {filter === '이미지' && <Image className="w-3.5 h-3.5 mr-1.5" />}
                  {filter === '위치' && <MapPin className="w-3.5 h-3.5 mr-1.5" />}
                  {filter}
                </Button>
              ))}
            </div>

            {/* 추천 검색어 섹션 - 검색 결과가 없을 때만 표시 */}
            {searchStates.length === 0 && <EmptyState onSearch={handleSearch} />}
          </motion.div>

          <AnimatePresence mode="wait">
            {searchStates.length > 0 && (
              <motion.div
                key="search-results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* 현재 검색된 키워드 목록 */}
                <div className="flex flex-wrap gap-2 sticky top-0 z-10 backdrop-blur-xl bg-white/70 p-3 rounded-xl shadow-sm">
                  {searchStates.map((state) => (
                    <Badge
                      key={state.keyword}
                      variant="secondary"
                      className="h-8 bg-indigo-50 text-indigo-700 gap-1.5 pr-2 transition-all hover:bg-indigo-100"
                    >
                      <span>{state.keyword}</span>
                      <button
                        onClick={() => removeKeyword(state.keyword)}
                        className="ml-1 p-0.5 hover:bg-indigo-200 rounded-full transition-colors"
                        aria-label={`${state.keyword} 키워드 삭제`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                {/* 탭 기반 검색 결과 */}
                <Tabs defaultValue="trends" className="w-full">
                  <TabsList className="w-full max-w-md mx-auto grid grid-cols-3 bg-blue-50 p-1 rounded-full mb-6">
                    <TabsTrigger value="trends" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      트렌드
                    </TabsTrigger>
                    <TabsTrigger value="insights" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <Activity className="w-4 h-4 mr-2" />
                      인사이트
                    </TabsTrigger>
                    <TabsTrigger value="results" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <Search className="w-4 h-4 mr-2" />
                      검색결과
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="trends">
                    {/* 기간 선택 */}
                    <div className="bg-gradient-to-br from-blue-50 via-blue-100/50 to-white backdrop-blur-xl rounded-xl shadow-md border border-blue-200 p-6 mb-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-blue-500" />
                          기간 설정
                        </h2>
                        <div className="flex flex-wrap gap-3">
                          <div className="bg-white px-3 py-1 rounded-full text-sm text-gray-700 flex items-center gap-1.5 shadow-sm">
                            <Clock className="w-4 h-4 text-blue-500" />
                            {getDurationLabel()}
                          </div>
                          <div className="bg-white px-3 py-1 rounded-full text-sm text-gray-700 flex items-center gap-1.5 shadow-sm">
                            <BarChart2 className="w-4 h-4 text-blue-500" />
                            {getTimeUnitLabel()}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Tabs 
                          value={duration} 
                          onValueChange={(value) => handleDurationChange(value as Duration)}
                          className="w-full"
                        >
                          <TabsList className="w-full grid grid-cols-4 bg-gray-100/80 p-1 rounded-lg">
                            <TabsTrigger 
                              value="1month"
                              className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600"
                            >
                              1개월
                            </TabsTrigger>
                            <TabsTrigger 
                              value="3month"
                              className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600"
                            >
                              3개월
                            </TabsTrigger>
                            <TabsTrigger 
                              value="1year"
                              className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600"
                            >
                              1년
                            </TabsTrigger>
                            <TabsTrigger 
                              value="3year"
                              className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600"
                            >
                              3년
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>

                        <Tabs 
                          value={timeUnit} 
                          onValueChange={(value) => handleTimeUnitChange(value as TimeUnit)}
                          className="w-full"
                        >
                          <TabsList className="w-full grid grid-cols-3 bg-gray-100/80 p-1 rounded-lg">
                            <TabsTrigger 
                              value="daily"
                              className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600"
                            >
                              일간
                            </TabsTrigger>
                            <TabsTrigger 
                              value="weekly"
                              className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600"
                            >
                              주간
                            </TabsTrigger>
                            <TabsTrigger 
                              value="monthly"
                              className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600"
                            >
                              월간
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                    </div>

                    {/* 트렌드 차트 */}
                    <Card className="border-none shadow-lg overflow-hidden mb-6">
                      <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 pb-7">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            {getTimeUnitLabel()}
                          </CardTitle>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                              <Download className="w-4 h-4 mr-1" />
                              CSV
                            </Button>
                            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                              <Download className="w-4 h-4 mr-1" />
                              이미지
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="p-6 -mt-6 bg-white rounded-t-3xl shadow-lg">
                          <div className="flex flex-wrap gap-2 mb-4">
                            {searchStates.map((state, index) => {
                              const colors = [
                                '#22C55E', '#0EA5E9', '#6366F1', '#EC4899', '#F59E0B'
                              ];
                              return (
                                <div
                                  key={state.keyword}
                                  className="flex items-center gap-1.5 text-sm"
                                >
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: colors[index % colors.length] }}
                                  />
                                  <span className="font-medium">{state.keyword}</span>
                                  {state.isLoading && (
                                    <Skeleton className="h-4 w-4 rounded-full" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <TimeSeriesChart data={getChartData()} timeUnit={timeUnit} />
                        </div>
                      </CardContent>
                    </Card>

                    {/* 요일별 트렌드 - 그리드 레이아웃 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {searchStates.map((state) => (
                        state.data?.results?.daily?.[0]?.weekday_stats && (
                          <motion.div
                            key={`weekday-${state.keyword}`}
                            whileHover={{ translateY: -5 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            <Card className="border-none shadow-lg overflow-hidden h-full">
                              <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-600 pb-7">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    {state.keyword} 요일별 트렌드
                                  </CardTitle>
                                  <button
                                    onClick={() => removeKeyword(state.keyword)}
                                    className="text-white hover:bg-white/20 p-1.5 rounded-full transition-colors"
                                    aria-label={`${state.keyword} 키워드 삭제`}
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </CardHeader>
                              <CardContent className="p-0">
                                <div className="p-6 -mt-6 bg-white rounded-t-3xl">
                                  {state.data?.results?.daily?.[0]?.weekday_stats && (
                                    <WeekdayChart 
                                      data={state.data.results.daily[0].weekday_stats} 
                                      keyword={state.keyword} 
                                    />
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="insights">
                    {/* 키워드 인사이트 섹션 */}
                    <KeywordInsights
                      data={keywordInsights.data}
                      isLoading={keywordInsights.isLoading}
                      error={keywordInsights.error}
                    />
                  </TabsContent>

                  <TabsContent value="results">
                    <div className="space-y-6">
                      {keywordInsights.isLoading ? (
                        <SearchResultsSkeleton />
                      ) : keywordInsights.error ? (
                        <Alert variant="destructive">
                          <AlertTitle>오류 발생</AlertTitle>
                          <AlertDescription>
                            {keywordInsights.error}
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div className="lg:col-span-2 space-y-6">
                            <Card className="border-none shadow-lg">
                              <CardHeader>
                                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                  <FileText className="w-5 h-5 text-blue-500" />
                                  관련 정보
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                {/* 이 부분을 API 응답에 따라 동적으로 변경 */}
                                <p className="text-gray-700">
                                  "{searchStates[0]?.keyword}"에 대한 검색 결과입니다. 검색어와 관련된 다양한 정보를 확인하세요.
                                </p>
                              </CardContent>
                            </Card>
                            
                            <Card className="border-none shadow-lg">
                              <CardHeader>
                                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                  <Globe className="w-5 h-5 text-blue-500" />
                                  웹 검색 결과
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                {/* 웹 검색 결과는 유기적 결과 컴포넌트 사용 */}
                                <div className="rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                  <div className="p-4">
                                    <div className="flex items-center gap-2 mb-1">
                                      <img 
                                        src="https://www.google.com/favicon.ico" 
                                        alt="" 
                                        className="w-4 h-4" 
                                      />
                                      <span className="text-xs text-gray-500">example.com</span>
                                    </div>
                                    <a 
                                      href="#" 
                                      className="text-lg font-medium text-blue-600 hover:underline"
                                    >
                                      {searchStates[0]?.keyword} 관련 정보 - 예시 검색 결과
                                    </a>
                                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                                      이것은 {searchStates[0]?.keyword}에 대한 검색 결과 예시입니다. 실제 구현시에는 API에서 받아온 데이터를 표시합니다.
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                            
                            <Card className="border-none shadow-lg">
                              <CardHeader>
                                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                  <Image className="w-5 h-5 text-blue-500" />
                                  이미지
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                  {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div 
                                      key={i} 
                                      className="aspect-square bg-gray-100 rounded-lg overflow-hidden hover:opacity-90 transition-opacity relative"
                                    >
                                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                        <ImageIcon className="w-8 h-8" />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                          
                          <div className="space-y-6">
                            <Card className="border-none shadow-lg">
                              <CardHeader>
                                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                  <MapPin className="w-5 h-5 text-blue-500" />
                                  위치 정보
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                                  <MapIcon className="w-10 h-10 text-gray-400" />
                                </div>
                                <div className="space-y-3">
                                  <div className="p-3 bg-blue-50 rounded-lg">
                                    <div className="font-medium text-gray-900">{searchStates[0]?.keyword}</div>
                                    <div className="text-sm text-gray-600 mt-1">서울특별시 강남구 삼성동 123-45</div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                            
                            <Card className="border-none shadow-lg">
                              <CardHeader>
                                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                  <TrendingUp className="w-5 h-5 text-blue-500" />
                                  관련 검색어
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="flex flex-wrap gap-2">
                                  {['맛집', '배달', '가격', '메뉴', '리뷰', '위치'].map((tag) => (
                                    <button
                                      key={tag}
                                      className="px-3 py-1.5 bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-full text-sm transition-colors"
                                      onClick={() => {
                                        const newKeyword = `${searchStates[0]?.keyword} ${tag}`;
                                        setCurrentKeyword(newKeyword);
                                        setTimeout(() => handleSearch(newKeyword), 100);
                                      }}
                                    >
                                      {searchStates[0]?.keyword} {tag}
                                    </button>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// 검색 결과 스켈레톤 컴포넌트
const SearchResultsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-lg">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border border-gray-200 overflow-hidden p-4">
                <Skeleton className="h-4 w-32 mb-3" />
                <Skeleton className="h-5 w-64 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-6">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full mb-3 rounded-lg" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

