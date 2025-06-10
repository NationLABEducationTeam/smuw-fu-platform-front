import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import { motion, AnimatePresence } from 'framer-motion';
import { ChartDataItem, CorpData, Top10Data } from '@/types/corp-trend';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BarChart2, 
  PieChart, 
  Filter, 
  RefreshCw, 
  Info, 
  Download, 
  ArrowUpRight, 
  ArrowDownRight,
  Search,
  Maximize2,
  StoreIcon,
  Banknote,
  AreaChart,
  LayoutGrid
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

// 비교 인사이트 컴포넌트
const ComparisonInsight = React.memo(({ data, category, sortBy }: { 
  data: ChartDataItem[];
  category: string;
  sortBy: string;
}) => {
  if (!data || data.length === 0) return null;

  // 상위 3개 브랜드 추출
  const top3 = data.slice(0, 3);
  const topBrand = top3[0];
  
  // 평균값 계산
  const avgValue = data.reduce((sum, item) => sum + item.value, 0) / data.length;
  const percentDiff = ((topBrand.value - avgValue) / avgValue * 100).toFixed(1);
  
  const formatValue = (value: number): string => {
    if (value >= 100000000) {
      return `${(value / 100000000).toFixed(1)}억원`;
    } else if (value >= 10000) {
      return `${(value / 10000).toFixed(1)}만원`;
    }
    return value.toLocaleString() + '원';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-4 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 bg-blue-100 p-2 rounded-full text-blue-600">
          <Info className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-medium text-gray-800 mb-2">데이터 인사이트</h3>
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-blue-600">{topBrand.brandNm}</span>는 
            {sortBy === 'avrgSlsAmt' && `평균 매출액이 ${formatValue(topBrand.value)}로`}
            {sortBy === 'frcsCnt' && `가맹점 수가 ${topBrand.value}개로`}
            {sortBy === 'arUnitAvrgSlsAmt' && `단위면적당 매출액이 ${formatValue(topBrand.value)}로`}
            {' '}
            <span className="font-semibold">{category} 카테고리</span>에서 1위를 차지하고 있습니다.
            이는 업계 평균보다 <span className={Number(percentDiff) > 0 ? "text-emerald-600 font-semibold" : "text-rose-600 font-semibold"}>
              {Number(percentDiff) > 0 ? '+' : ''}{percentDiff}%
            </span> 높은 수치입니다.
          </p>
          
          <div className="mt-3 flex flex-wrap gap-2">
            {top3.map((brand, index) => (
              <Badge key={brand.brandNm} variant="outline" className="bg-white/80">
                <span className="font-bold mr-1 text-blue-600">{index + 1}.</span> {brand.brandNm}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

ComparisonInsight.displayName = 'ComparisonInsight';

// 로딩 스켈레톤 컴포넌트
const ChartSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
    <Skeleton className="h-[400px] w-full rounded-lg" />
    <div className="flex gap-2">
      <Skeleton className="h-8 w-24 rounded-full" />
      <Skeleton className="h-8 w-24 rounded-full" />
      <Skeleton className="h-8 w-24 rounded-full" />
    </div>
  </div>
);

// 메인 컴포넌트
export function CorpTrend() {
  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<{ top10: Top10Data } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('외식-한식');
  const [sortBy, setSortBy] = useState<'avrgSlsAmt' | 'frcsCnt' | 'arUnitAvrgSlsAmt'>('avrgSlsAmt');
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeMainCategory, setActiveMainCategory] = useState<string | null>(null);

  // 데이터 가져오기
  useEffect(() => {
    setIsLoading(true);
    
    fetch('/corp_trend.json')
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        updateChartData(data.top10, selectedCategory, sortBy);
        
        // 메인 카테고리 자동 설정
        const mainCategories = Array.from(new Set(Object.keys(data.top10).map(cat => cat.split('-')[0])));
        if (mainCategories.length > 0) {
          setActiveMainCategory(mainCategories[0]);
        }
        
        // 로딩 느린 것처럼 시뮬레이션 (실제 데이터는 빠르게 로드됨)
        setTimeout(() => {
          setIsLoading(false);
        }, 800);
      })
      .catch(error => {
        console.error('Error fetching corp trend data:', error);
        setIsLoading(false);
      });
  }, []);

  // 차트 데이터 업데이트
  const updateChartData = useCallback((data: Top10Data, category: string, sortKey: string) => {
    if (!data[category]) return;
    
    const newData: ChartDataItem[] = data[category].map(item => ({
      brandNm: item.brandNm,
      value: item[sortKey as keyof CorpData] as number,
      frcsCnt: item.frcsCnt,
      arUnitAvrgSlsAmt: item.arUnitAvrgSlsAmt,
      avrgSlsAmt: item.avrgSlsAmt
    }));
    
    // 정렬 적용
    newData.sort((a, b) => b.value - a.value);
    
    setChartData(newData);
  }, []);

  // 값 포맷 함수
  const formatValue = useCallback((value: any): string => {
    // 숫자가 아닌 경우 처리
    if (value === null || value === undefined) return "데이터 없음";
    if (typeof value !== 'number') {
      // 숫자로 변환 시도
      const numValue = Number(value);
      if (isNaN(numValue)) return `${value}`;
      value = numValue;
    }
    
    if (value >= 100000000) {
      return `${(value / 100000000).toFixed(1)}억`;
    }
    if (value >= 10000) {
      return `${(value / 10000).toFixed(1)}만`;
    }
    return value.toLocaleString();
  }, []);

  // 메모이제이션된 카테고리 목록
  const { categories, mainCategories, filteredSubCategories } = useMemo(() => {
    if (!data) return { categories: [], mainCategories: [], filteredSubCategories: [] };
    
    const allCategories = Object.keys(data.top10);
    const mainCats = Array.from(new Set(allCategories.map(cat => cat.split('-')[0])));
    
    const filteredSubs = activeMainCategory 
      ? allCategories.filter(cat => cat.startsWith(activeMainCategory))
      : allCategories;
    
    return { 
      categories: allCategories, 
      mainCategories: mainCats,
      filteredSubCategories: filteredSubs
    };
  }, [data, activeMainCategory]);

  // 검색어에 따른 필터링된 차트 데이터
  const filteredChartData = useMemo(() => {
    if (!searchTerm) return chartData;
    
    return chartData.filter(item => 
      item.brandNm.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [chartData, searchTerm]);

  // 로딩 상태 표시
  if (isLoading) {
    return (
      <Card className="shadow-md border-none">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
          <CardTitle className="text-xl font-bold text-gray-700">프랜차이즈 현황 분석</CardTitle>
          <CardDescription>데이터를 불러오는 중입니다...</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ChartSkeleton />
        </CardContent>
      </Card>
    );
  }

  // 데이터 없음 표시
  if (!data) {
    return (
      <Card className="shadow-md border-none">
        <CardContent className="p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-red-100 p-3 rounded-full inline-block mx-auto mb-4">
              <RefreshCw className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">데이터를 불러올 수 없습니다</h3>
            <p className="text-gray-600 mb-4">프랜차이즈 현황 데이터를 불러오는 중 오류가 발생했습니다.</p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              새로고침
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${isMaximized ? 'fixed inset-4 z-50 bg-white rounded-xl shadow-2xl overflow-auto p-6' : ''}`}>
      {/* 최대화/최소화 버튼 */}
      {isMaximized && (
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMaximized(false)}
            className="bg-white/80 backdrop-blur-sm hover:bg-white shadow-md"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* 메인 카테고리 탭 */}
      <Tabs
        value={activeMainCategory || ''}
        onValueChange={setActiveMainCategory}
        className="space-y-4"
      >
        <TabsList className="bg-gray-100/70 p-1 rounded-lg w-full flex">
          {mainCategories.map(mainCat => (
            <TabsTrigger
              key={mainCat}
              value={mainCat}
              className="flex-1 data-[state=active]:bg-white rounded-md data-[state=active]:shadow-sm transition-all"
            >
              {mainCat}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      
      {/* 서브 카테고리 선택 */}
      <Card className="bg-white rounded-lg shadow-sm border-none overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 pb-4 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-gray-800">
                {activeMainCategory} 카테고리 선택
              </CardTitle>
              <CardDescription>
                원하는 세부 카테고리를 선택하여 프랜차이즈 현황을 확인하세요
              </CardDescription>
            </div>
            
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="브랜드 검색..."
                className="pl-9 w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          <ScrollArea className="h-[140px] w-full">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-1">
              {filteredSubCategories.map(category => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedCategory(category);
                    updateChartData(data.top10, category, sortBy);
                  }}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all
                    border shadow-sm border-transparent
                    ${selectedCategory === category
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                      : 'bg-white hover:bg-blue-50 text-gray-700 hover:border-blue-200'
                    }
                  `}
                >
                  <div className="text-center">
                    {category.split('-')[1]}
                  </div>
                </motion.button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* 데이터 시각화 */}
      <Card className="bg-white rounded-lg shadow-md border-none overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-white to-blue-50 pb-4 border-b">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-1.5 rounded-lg">
                <BarChart2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-800">
                  {selectedCategory.split('-')[1]} TOP 10
                </CardTitle>
                <CardDescription>
                  {sortBy === 'avrgSlsAmt' && '평균 매출액 기준 순위'}
                  {sortBy === 'frcsCnt' && '가맹점 수 기준 순위'}
                  {sortBy === 'arUnitAvrgSlsAmt' && '단위면적당 매출액 기준 순위'}
                </CardDescription>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 ml-0 sm:ml-auto">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-white hover:bg-gray-50"
                      onClick={() => setIsMaximized(!isMaximized)}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>차트 확대</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className={`bg-white hover:bg-gray-50 ${chartType === 'bar' ? 'border-blue-200 text-blue-600' : ''}`}
                      onClick={() => setChartType('bar')}
                    >
                      <BarChart2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>막대 차트</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className={`bg-white hover:bg-gray-50 ${chartType === 'pie' ? 'border-blue-200 text-blue-600' : ''}`}
                      onClick={() => setChartType('pie')}
                    >
                      <PieChart className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>파이 차트</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-white hover:bg-gray-50 gap-1"
                  >
                    <Filter className="h-4 w-4 mr-1" />
                    {sortBy === 'avrgSlsAmt' && '평균 매출액'}
                    {sortBy === 'frcsCnt' && '가맹점 수'}
                    {sortBy === 'arUnitAvrgSlsAmt' && '단위면적당 매출액'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => {
                      setSortBy('avrgSlsAmt');
                      updateChartData(data.top10, selectedCategory, 'avrgSlsAmt');
                    }}
                    className="gap-2"
                  >
                    <Banknote className="h-4 w-4" />
                    <span>평균 매출액</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      setSortBy('frcsCnt');
                      updateChartData(data.top10, selectedCategory, 'frcsCnt');
                    }}
                    className="gap-2"
                  >
                    <StoreIcon className="h-4 w-4" />
                    <span>가맹점 수</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      setSortBy('arUnitAvrgSlsAmt');
                      updateChartData(data.top10, selectedCategory, 'arUnitAvrgSlsAmt');
                    }}
                    className="gap-2"
                  >
                    <AreaChart className="h-4 w-4" />
                    <span>단위면적당 매출액</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-white hover:bg-gray-50"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>데이터 다운로드</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 sm:p-6">
          {filteredChartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
              <Search className="h-12 w-12 mb-2 text-gray-300" />
              <p>검색 결과가 없습니다</p>
              <Button
                variant="link"
                className="mt-2"
                onClick={() => setSearchTerm('')}
              >
                검색어 지우기
              </Button>
            </div>
          ) : (
            <>
              {/* 데이터 인사이트 */}
              <div className="mb-6">
                <ComparisonInsight 
                  data={filteredChartData} 
                  category={selectedCategory} 
                  sortBy={sortBy} 
                />
              </div>
              
              {/* 차트 섹션 */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${selectedCategory}-${sortBy}-${chartType}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`${isMaximized ? 'h-[70vh]' : 'h-[500px]'}`}
                >
                  {chartType === 'bar' ? (
                    <ResponsiveBar
                      data={filteredChartData}
                      keys={['value']}
                      indexBy="brandNm"
                      margin={{ top: 20, right: 20, bottom: 60, left: 120 }}
                      padding={0.3}
                      layout="horizontal"
                      valueScale={{ type: 'linear' }}
                      colors={({ data, index }) => {
                        // 첫 번째 항목은 특별한 색상으로
                        if (index === 0) return 'hsl(210, 90%, 60%)';
                        // 두 번째, 세 번째 항목은 조금 더 밝은 색상으로
                        if (index < 3) return `hsl(210, 85%, ${65 + index * 3}%)`;
                        // 나머지는 그라데이션으로
                        return `hsl(210, 70%, ${70 + index * 2}%)`;
                      }}
                      borderRadius={4}
                      borderWidth={1}
                      borderColor={{
                        from: 'color',
                        modifiers: [['darker', 0.2]]
                      }}
                      axisTop={null}
                      axisRight={null}
                      axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        format: (value) => formatValue(Number(value)),
                        legend: sortBy === 'avrgSlsAmt' ? '평균 매출액' :
                              sortBy === 'frcsCnt' ? '가맹점 수' : '단위면적당 매출액',
                        legendPosition: 'middle',
                        legendOffset: 45,
                        truncateTickAt: 0
                      }}
                      axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                      }}
                      enableGridX={true}
                      enableGridY={false}
                      labelSkipWidth={12}
                      labelSkipHeight={12}
                      labelTextColor={{
                        from: 'color',
                        modifiers: [['darker', 3]]
                      }}
                      role="application"
                      ariaLabel="프랜차이즈 차트"
                      barAriaLabel={e => `${e.id}: ${e.formattedValue}`}
                      theme={{
                        tooltip: {
                          container: {
                            background: 'white',
                            color: '#333',
                            fontSize: '12px',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            padding: '12px'
                          }
                        },
                        grid: {
                          line: {
                            stroke: '#e2e8f0',
                            strokeWidth: 1
                          }
                        },
                        axis: {
                          ticks: {
                            text: {
                              fontSize: 12,
                              fill: '#64748b'
                            }
                          },
                          legend: {
                            text: {
                              fontSize: 14,
                              fill: '#334155',
                              fontWeight: 500
                            }
                          }
                        }
                      }}
                      animate={true}
                      motionConfig="gentle"
                      tooltip={({ data, value }) => (
                        <div className="bg-white px-4 py-3 shadow-lg rounded-lg border border-gray-100">
                          <div className="font-medium text-gray-900 mb-1">{data.brandNm}</div>
                          <div className="text-sm space-y-1 text-gray-600">
                            {sortBy === 'avrgSlsAmt' && (
                              <>
                                <div className="flex items-center gap-1 font-semibold text-blue-600">
                                  <Banknote className="h-3.5 w-3.5" />
                                  평균 매출액: {formatValue(value)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <StoreIcon className="h-3.5 w-3.5 text-gray-400" />
                                  가맹점 수: {data.frcsCnt}개
                                </div>
                                <div className="flex items-center gap-1">
                                  <AreaChart className="h-3.5 w-3.5 text-gray-400" />
                                  단위면적당: {formatValue(data.arUnitAvrgSlsAmt)}
                                </div>
                              </>
                            )}
                            {sortBy === 'frcsCnt' && (
                              <>
                                <div className="flex items-center gap-1 font-semibold text-blue-600">
                                  <StoreIcon className="h-3.5 w-3.5" />
                                  가맹점 수: {formatValue(value)}개
                                </div>
                                <div className="flex items-center gap-1">
                                  <Banknote className="h-3.5 w-3.5 text-gray-400" />
                                  평균 매출액: {formatValue(data.avrgSlsAmt)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <AreaChart className="h-3.5 w-3.5 text-gray-400" />
                                  단위면적당: {formatValue(data.arUnitAvrgSlsAmt)}
                                </div>
                              </>
                            )}
                            {sortBy === 'arUnitAvrgSlsAmt' && (
                              <>
                                <div className="flex items-center gap-1 font-semibold text-blue-600">
                                  <AreaChart className="h-3.5 w-3.5" />
                                  단위면적당: {formatValue(value)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Banknote className="h-3.5 w-3.5 text-gray-400" />
                                  평균 매출액: {formatValue(data.avrgSlsAmt)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <StoreIcon className="h-3.5 w-3.5 text-gray-400" />
                                  가맹점 수: {data.frcsCnt}개
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    />
                  ) : (
                    <ResponsivePie
                      data={filteredChartData.map(item => ({
                        id: item.brandNm,
                        label: item.brandNm,
                        value: item.value,
                        data: {
                          frcsCnt: item.frcsCnt,
                          avrgSlsAmt: item.avrgSlsAmt,
                          arUnitAvrgSlsAmt: item.arUnitAvrgSlsAmt
                        }
                      })) as any}
                      margin={{ top: 40, right: 120, bottom: 40, left: 120 }}
                      innerRadius={0.5}
                      padAngle={0.7}
                      cornerRadius={3}
                      activeOuterRadiusOffset={8}
                      colors={{ scheme: 'blues' }}
                      borderWidth={1}
                      borderColor={{
                        from: 'color',
                        modifiers: [['darker', 0.2]]
                      }}
                      arcLinkLabelsSkipAngle={10}
                      arcLinkLabelsTextColor="#333333"
                      arcLinkLabelsThickness={2}
                      arcLinkLabelsColor={{ from: 'color' }}
                      arcLabelsSkipAngle={10}
                      arcLabelsTextColor={{
                        from: 'color',
                        modifiers: [['darker', 2]]
                      }}
                      legends={[
                        {
                          anchor: 'right',
                          direction: 'column',
                          justify: false,
                          translateX: 120,
                          translateY: 0,
                          itemsSpacing: 0,
                          itemWidth: 100,
                          itemHeight: 20,
                          itemTextColor: '#999',
                          itemDirection: 'left-to-right',
                          itemOpacity: 1,
                          symbolSize: 18,
                          symbolShape: 'circle',
                          effects: [
                            {
                              on: 'hover',
                              style: {
                                itemTextColor: '#000'
                              }
                            }
                          ]
                        }
                      ]}
                      animate={true}
                      motionConfig="gentle"
                      tooltip={({ datum }: any) => (
                        <div className="bg-white px-4 py-3 shadow-lg rounded-lg border border-gray-100">
                          <div className="font-medium text-gray-900 mb-1">{datum.label}</div>
                          <div className="text-sm space-y-1 text-gray-600">
                            {sortBy === 'avrgSlsAmt' && (
                              <>
                                <div className="flex items-center gap-1 font-semibold text-blue-600">
                                  <Banknote className="h-3.5 w-3.5" />
                                  평균 매출액: {formatValue(datum.value)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <StoreIcon className="h-3.5 w-3.5 text-gray-400" />
                                  가맹점 수: {datum.data.frcsCnt}개
                                </div>
                                <div className="flex items-center gap-1">
                                  <AreaChart className="h-3.5 w-3.5 text-gray-400" />
                                  단위면적당: {formatValue(datum.data.arUnitAvrgSlsAmt)}
                                </div>
                              </>
                            )}
                            {sortBy === 'frcsCnt' && (
                              <>
                                <div className="flex items-center gap-1 font-semibold text-blue-600">
                                  <StoreIcon className="h-3.5 w-3.5" />
                                  가맹점 수: {formatValue(datum.value)}개
                                </div>
                                <div className="flex items-center gap-1">
                                  <Banknote className="h-3.5 w-3.5 text-gray-400" />
                                  평균 매출액: {formatValue(datum.data.avrgSlsAmt)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <AreaChart className="h-3.5 w-3.5 text-gray-400" />
                                  단위면적당: {formatValue(datum.data.arUnitAvrgSlsAmt)}
                                </div>
                              </>
                            )}
                            {sortBy === 'arUnitAvrgSlsAmt' && (
                              <>
                                <div className="flex items-center gap-1 font-semibold text-blue-600">
                                  <AreaChart className="h-3.5 w-3.5" />
                                  단위면적당: {formatValue(datum.value)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Banknote className="h-3.5 w-3.5 text-gray-400" />
                                  평균 매출액: {formatValue(datum.data.avrgSlsAmt)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <StoreIcon className="h-3.5 w-3.5 text-gray-400" />
                                  가맹점 수: {datum.data.frcsCnt}개
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}