import React from 'react';
import { Search, TrendingUp, ArrowRight } from 'lucide-react';
import { RelatedSearch } from '@/types/serp';
import { motion } from 'framer-motion';

interface RelatedSearchesSectionProps {
  data: RelatedSearch[];
}

export function RelatedSearchesSection({ data }: RelatedSearchesSectionProps) {
  if (!data || data.length === 0) return null;

  // 연관 검색어를 두 그룹으로 나누기
  const halfLength = Math.ceil(data.length / 2);
  const firstHalf = data.slice(0, halfLength);
  const secondHalf = data.slice(halfLength);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-blue-600">
        <TrendingUp className="w-5 h-5" />
        <h3 className="font-medium">이런 검색어는 어떠세요?</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 첫 번째 컬럼 */}
        <div className="space-y-3">
          {firstHalf.map((item, index) => (
            <motion.a
              key={item.query}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full">
                <Search className="w-4 h-4" />
              </div>
              <span className="flex-grow text-gray-700 group-hover:text-blue-600 transition-colors">
                {item.query}
              </span>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
            </motion.a>
          ))}
        </div>

        {/* 두 번째 컬럼 */}
        <div className="space-y-3">
          {secondHalf.map((item, index) => (
            <motion.a
              key={item.query}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: (index + halfLength) * 0.1 }}
            >
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full">
                <Search className="w-4 h-4" />
              </div>
              <span className="flex-grow text-gray-700 group-hover:text-blue-600 transition-colors">
                {item.query}
              </span>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
} 