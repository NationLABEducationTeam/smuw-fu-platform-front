'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingKeyword } from "@/types/dashboard"
import { MoreVertical, Download, Search, ArrowUpDown, ChevronUp, ChevronDown, BarChart2, Filter } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface TrendingKeywordsTableProps {
  trendingKeywords: TrendingKeyword[];
}

export function TrendingKeywordsTable({ trendingKeywords }: TrendingKeywordsTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof TrendingKeyword;
    direction: 'asc' | 'desc';
  }>({
    key: 'rank',
    direction: 'asc'
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // 키워드 카테고리 추출 (첫 글자 기준)
  const categories = Array.from(new Set(
    trendingKeywords.map(keyword => keyword.keyword.charAt(0))
  )).sort();
  
  // 정렬 함수
  const sortedKeywords = [...trendingKeywords].sort((a, b) => {
    if (sortConfig.key === 'rank' || sortConfig.key === 'change') {
      const aValue = parseInt(a[sortConfig.key].toString());
      const bValue = parseInt(b[sortConfig.key].toString());
      
      return sortConfig.direction === 'asc' 
        ? aValue - bValue 
        : bValue - aValue;
    } else {
      const aValue = a[sortConfig.key].toString();
      const bValue = b[sortConfig.key].toString();
      
      return sortConfig.direction === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }
  });
  
  // 필터링 함수
  const filteredKeywords = sortedKeywords.filter(keyword => {
    const matchesSearch = keyword.keyword.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory 
      ? keyword.keyword.charAt(0) === selectedCategory 
      : true;
    
    return matchesSearch && matchesCategory;
  });
  
  // 정렬 핸들러
  const handleSort = (key: keyof TrendingKeyword) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };
  
  // 변화율에 따른 배지 색상
  const getChangeBadgeColor = (change: string) => {
    const value = parseInt(change);
    if (value > 20) return "bg-emerald-500 text-white";
    if (value > 0) return "bg-emerald-100 text-emerald-800";
    if (value < -20) return "bg-rose-500 text-white";
    if (value < 0) return "bg-rose-100 text-rose-800";
    return "bg-gray-100 text-gray-800";
  };
  
  return (
    <Card className="overflow-hidden shadow-lg border-none bg-gradient-to-br from-white to-blue-50">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-white p-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-xl font-bold text-gray-900">인기있는 키워드</CardTitle>
          </div>
          <p className="text-sm text-gray-500">실시간 트렌드 키워드 순위</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="bg-white hover:bg-blue-50 border-blue-200 text-blue-600 hover:text-blue-700 gap-2"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">보고서 다운로드</span>
          </Button>
        </div>
      </CardHeader>
      
      <div className="p-4 border-b bg-white">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="키워드 검색..."
              className="pl-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-full px-3 h-8 text-xs font-medium ${
                selectedCategory === null 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:bg-blue-50'
              }`}
              onClick={() => setSelectedCategory(null)}
            >
              전체
            </Button>
            
            {categories.map(category => (
              <Button
                key={category}
                variant="ghost"
                size="sm"
                className={`rounded-full px-3 h-8 text-xs font-medium ${
                  selectedCategory === category 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-blue-50'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead 
                  className="w-[80px] font-bold cursor-pointer"
                  onClick={() => handleSort('rank')}
                >
                  <div className="flex items-center gap-1">
                    랭크
                    {sortConfig.key === 'rank' && (
                      sortConfig.direction === 'asc' 
                        ? <ChevronUp className="h-4 w-4" /> 
                        : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="font-bold cursor-pointer"
                  onClick={() => handleSort('keyword')}
                >
                  <div className="flex items-center gap-1">
                    키워드
                    {sortConfig.key === 'keyword' && (
                      sortConfig.direction === 'asc' 
                        ? <ChevronUp className="h-4 w-4" /> 
                        : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="text-right font-bold cursor-pointer"
                  onClick={() => handleSort('count')}
                >
                  <div className="flex items-center justify-end gap-1">
                    검색량
                    {sortConfig.key === 'count' && (
                      sortConfig.direction === 'asc' 
                        ? <ChevronUp className="h-4 w-4" /> 
                        : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="text-right hidden sm:table-cell font-bold cursor-pointer"
                  onClick={() => handleSort('change')}
                >
                  <div className="flex items-center justify-end gap-1">
                    변화율
                    {sortConfig.key === 'change' && (
                      sortConfig.direction === 'asc' 
                        ? <ChevronUp className="h-4 w-4" /> 
                        : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredKeywords.map((item, index) => (
                  <motion.tr
                    key={item.keyword}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="hover:bg-blue-50/50 transition-colors group"
                  >
                    <TableCell className="font-mono font-bold">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center
                        ${parseInt(item.rank.toString()) <= 3 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-700'
                        }
                      `}>
                        {item.rank}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900">{item.keyword}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {item.keyword.split('').map((char, i) => (
                          <span 
                            key={i}
                            className={char === searchTerm.charAt(i) && searchTerm ? 'text-blue-600 font-bold' : ''}
                          >
                            {char}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      <div className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full text-gray-700">
                        <span>{item.count}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-right font-medium">
                      <div className={`
                        inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs
                        ${getChangeBadgeColor(item.change)}
                      `}>
                        {parseInt(item.change) > 0 ? '+' : ''}{item.change}%
                        {parseInt(item.change) > 0 
                          ? <ChevronUp className="h-3 w-3" /> 
                          : parseInt(item.change) < 0 
                          ? <ChevronDown className="h-3 w-3" /> 
                          : null
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 hover:bg-blue-100"
                          >
                            <MoreVertical className="h-4 w-4 text-gray-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>상세 분석</DropdownMenuItem>
                          <DropdownMenuItem>관련 키워드 보기</DropdownMenuItem>
                          <DropdownMenuItem>트렌드 예측</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
              
              {filteredKeywords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    검색 결과가 없습니다
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}