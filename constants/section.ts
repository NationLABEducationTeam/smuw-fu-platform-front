import { Info, Map, MapPin, BarChart, Image, Search, ExternalLink, Clock } from 'lucide-react';

// 섹션 타입별 아이콘 매핑
export const SECTION_ICONS = {
  local_map: Map,
  local_results: MapPin,
  knowledge_graph: BarChart,
  inline_images: Image,
  organic_results: Search,
  related_searches: ExternalLink,
  pagination: Clock,
} as const;

// 섹션 타입별 레이블 매핑
export const SECTION_LABELS: Record<string, string> = {
  local_map: '지도',
  local_results: '주변 검색 결과',
  knowledge_graph: '지식 그래프',
  inline_images: '이미지',
  organic_results: '검색 결과',
  filters: '필터',
  top_stories_link: '주요 뉴스',
  related_searches: '연관 검색어'
} as const; 