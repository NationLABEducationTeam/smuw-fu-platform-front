import React from 'react';
import { Badge } from "@/components/ui/badge";
import { KnowledgeGraph } from '@/types/serp';
import { ExternalLink, Info, MapPin, Globe, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KnowledgeGraphSectionProps {
  data: KnowledgeGraph;
}

export function KnowledgeGraphSection({ data }: KnowledgeGraphSectionProps) {
  // 영업 시간 포맷팅
  const formatHours = (hours: typeof data.hours) => {
    if (!hours) return null;
    return Object.entries(hours).map(([day, time]) => ({
      day,
      ...time
    }));
  };

  const formattedHours = formatHours(data.hours);

  return (
    <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl overflow-hidden">
      <div className="flex flex-col md:flex-row gap-6 p-6">
        {/* 이미지 섹션 */}
        {data.thumbnail && (
          <div className="flex-shrink-0">
            <div className="relative group">
              <img
                src={data.thumbnail}
                alt={data.title}
                className="w-full md:w-64 h-64 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/90 hover:bg-white"
                  onClick={() => window.open(data.thumbnail, '_blank')}
                >
                  원본 보기
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 정보 섹션 */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* 헤더: 제목 & 타입 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {data.title}
            </h2>
            {data.type && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                {data.type}
              </Badge>
            )}
          </div>

          {/* 설명 */}
          {data.merchant_description && (
            <div className="prose prose-sm max-w-none text-gray-600">
              <p>{data.merchant_description}</p>
            </div>
          )}

          {/* 평점 정보 */}
          {data.rating && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="font-medium text-gray-900">{data.rating}</span>
              </div>
              {data.review_count && (
                <span className="text-sm text-gray-500">
                  {data.review_count.toLocaleString()}개의 리뷰
                </span>
              )}
            </div>
          )}

          {/* 영업 시간 */}
          {data.raw_hours && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{data.raw_hours}</span>
            </div>
          )}

          {/* 상세 영업 시간 */}
          {formattedHours && formattedHours.length > 0 && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              {formattedHours.map(({ day, opens, closes }) => (
                <div key={day} className="flex justify-between">
                  <span className="font-medium text-gray-700">{day}</span>
                  <span className="text-gray-600">{opens} - {closes}</span>
                </div>
              ))}
            </div>
          )}

          {/* 실시간 인기도 */}
          {data.popular_times?.live && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="font-medium">{data.popular_times.live.time}</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                {data.popular_times.live.info}
              </p>
            </div>
          )}

          {/* 링크 섹션 */}
          <div className="flex flex-wrap gap-4 pt-4">
            {data.website && (
              <a
                href={data.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 transition-colors"
              >
                <Globe className="w-4 h-4" />
                웹사이트 방문
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {data.directions && (
              <a
                href={data.directions}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                길찾기
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 