import React from 'react';
import { Card } from "@/components/ui/card";
import { Clock, Search, TrendingUp, Info } from 'lucide-react';

interface SearchInformationProps {
  data: {
    total_results?: number;
    time_taken?: number;
    query_displayed?: string;
    [key: string]: any;
  };
}

export function SearchInformationSection({ data }: SearchInformationProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  // 주요 메트릭과 추가 정보를 분리
  const mainMetrics = [
    {
      key: 'total_results',
      label: '총 검색 결과',
      value: data.total_results ? formatNumber(data.total_results) : '-',
      icon: <Search className="w-5 h-5 text-blue-600" />,
      bgColor: 'from-blue-50',
      iconBg: 'bg-blue-100',
      size: 'col-span-2 md:col-span-1'
    },
    {
      key: 'time_taken',
      label: '검색 소요 시간',
      value: data.time_taken ? `${data.time_taken.toFixed(2)}초` : '-',
      icon: <Clock className="w-5 h-5 text-green-600" />,
      bgColor: 'from-green-50',
      iconBg: 'bg-green-100',
      size: 'col-span-2 md:col-span-1'
    },
    {
      key: 'query_displayed',
      label: '검색어',
      value: data.query_displayed || '-',
      icon: <TrendingUp className="w-5 h-5 text-purple-600" />,
      bgColor: 'from-purple-50',
      iconBg: 'bg-purple-100',
      size: 'col-span-2 md:col-span-1'
    }
  ];

  // 추가 정보 필터링
  const additionalInfo = Object.entries(data).filter(
    ([key]) => !['total_results', 'time_taken', 'query_displayed'].includes(key)
  );

  return (
    <div className="grid grid-cols-4 auto-rows-min gap-4">
      {/* 주요 메트릭 */}
      {mainMetrics.map(({ key, label, value, icon, bgColor, iconBg, size }) => (
        <Card 
          key={key}
          className={`p-4 bg-gradient-to-br ${bgColor} to-white ${size} hover:shadow-md transition-shadow`}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 ${iconBg} rounded-lg`}>
              {icon}
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <h3 className="text-2xl font-bold text-gray-900 break-all">
                {value}
              </h3>
            </div>
          </div>
        </Card>
      ))}

      {/* 추가 정보 */}
      {additionalInfo.map(([key, value]) => {
        const valueString = typeof value === 'object' ? JSON.stringify(value, null, 2) : value.toString();
        const isLongValue = valueString.length > 50;
        
        return (
          <Card 
            key={key} 
            className={`p-4 bg-gradient-to-br from-gray-50 to-white hover:shadow-md transition-shadow
              ${isLongValue ? 'col-span-4' : 'col-span-2'}`}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Info className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 capitalize">
                  {key.replace(/_/g, ' ')}
                </p>
                <div className={`mt-1 ${isLongValue ? 'font-mono text-sm' : 'text-lg font-bold'} text-gray-900 break-all`}>
                  {isLongValue ? (
                    <pre className="whitespace-pre-wrap">
                      {valueString}
                    </pre>
                  ) : valueString}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
} 