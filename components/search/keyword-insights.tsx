import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Info, Loader2, AlertTriangle, Globe, MapPin, Image as ImageIcon, FileText, Video, Link2, TrendingUp, Search } from 'lucide-react';
import { 
  KeywordInsightsProps, 
  LocalResults,
  LocalResult,
  RelatedSearch, 
  KnowledgeGraph, 
  InlineVideo,
  TopStory,
  OrganicResult
} from '@/types/serp';
import { LocalResultsSection } from './sections/local-results';
import { RelatedSearchesSection } from './sections/related-searches';
import { KnowledgeGraphSection } from './sections/knowledge-graph';
import { InlineVideosSection } from './sections/inline-videos';
import { TopStoriesSection } from './sections/top-stories';
import { SearchInformationSection } from './sections/search-information';
import { InlineImagesSection } from './sections/inline-images';
import { OrganicResults } from './sections/organic-results';
import { SECTION_ICONS, SECTION_LABELS } from '@/constants/section';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

// 타입 가드 함수들
const isLocalResults = (value: any): value is LocalResults => {
  return value && typeof value === 'object' && Array.isArray(value.places);
};

const isRelatedSearches = (value: any): value is RelatedSearch[] => {
  return Array.isArray(value) && value.length > 0 && value.every(
    item => typeof item === 'object' && typeof item.query === 'string'
  );
};

const isKnowledgeGraph = (value: any): value is KnowledgeGraph => {
  return value && typeof value === 'object' && typeof value.title === 'string';
};

const isInlineVideos = (value: any): value is InlineVideo[] => {
  return Array.isArray(value) && value.length > 0 && value.every(
    item => typeof item === 'object' && typeof item.title === 'string'
  );
};

const isTopStories = (value: any): value is TopStory[] => {
  return Array.isArray(value) && value.length > 0 && value.every(
    item => typeof item === 'object' && typeof item.title === 'string'
  );
};

const isSearchInformation = (value: any): value is { 
  total_results?: number;
  time_taken?: number;
  query_displayed?: string;
  [key: string]: any;
} => {
  return value && typeof value === 'object';
};

const isInlineImages = (value: any): value is Array<{
  source: string;
  thumbnail: string;
  original: string;
  title: string;
  source_name: string;
}> => {
  return Array.isArray(value) && value.length > 0 && value.every(
    item => typeof item === 'object' 
      && typeof item.thumbnail === 'string'
      && typeof item.title === 'string'
  );
};

const isOrganicResults = (value: any): value is OrganicResult[] => {
  return Array.isArray(value) && value.length > 0 && value.every(
    item => typeof item === 'object' 
      && typeof item.title === 'string'
      && typeof item.link === 'string'
  );
};

export function KeywordInsights({ data, isLoading, error }: KeywordInsightsProps) {
  // 데이터에서 각 섹션 추출
  const knowledgeGraph = React.useMemo(() => {
    if (data && data.knowledge_graph && isKnowledgeGraph(data.knowledge_graph)) {
      return data.knowledge_graph;
    }
    return null;
  }, [data]);

  const localResults = React.useMemo(() => {
    if (data && data.local_results && isLocalResults(data.local_results)) {
      return data.local_results;
    }
    return null;
  }, [data]);

  const organicResults = React.useMemo(() => {
    if (data && Array.isArray(data.organic_results)) {
      return data.organic_results;
    }
    return null;
  }, [data]);

  const inlineImages = React.useMemo(() => {
    if (data && data.inline_images) {
      return data.inline_images;
    }
    return null;
  }, [data]);

  const inlineVideos = React.useMemo(() => {
    if (data && data.inline_videos) {
      return data.inline_videos;
    }
    return null;
  }, [data]);

  const topStories = React.useMemo(() => {
    if (data && data.top_stories && Array.isArray(data.top_stories)) {
      return data.top_stories;
    }
    return null;
  }, [data]);

  const relatedSearches = React.useMemo(() => {
    if (data && data.related_searches && isRelatedSearches(data.related_searches)) {
      return data.related_searches;
    }
    return null;
  }, [data]);

  const searchInformation = React.useMemo(() => {
    if (data && data.search_information) {
      return data.search_information;
    }
    return null;
  }, [data]);

  // 사용 가능한 섹션 확인
  const availableSections = React.useMemo(() => {
    const sections = [];
    if (organicResults && organicResults.length > 0) sections.push('organic');
    if (knowledgeGraph) sections.push('knowledge');
    if (localResults && localResults.places.length > 0) sections.push('local');
    if (inlineImages && inlineImages.length > 0) sections.push('images');
    if (inlineVideos && inlineVideos.length > 0) sections.push('videos');
    if (topStories && topStories.length > 0) sections.push('stories');
    if (relatedSearches && relatedSearches.length > 0) sections.push('related');
    return sections;
  }, [organicResults, knowledgeGraph, localResults, inlineImages, inlineVideos, topStories, relatedSearches]);

  if (isLoading) {
    return (
      <Card className="border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 pb-7">
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Search className="w-5 h-5" />
            인사이트 분석 중
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-6 -mt-6 bg-white rounded-t-3xl">
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <Loader2 className="animate-spin h-10 w-10 text-indigo-600 mx-auto mb-4" />
                <p className="text-gray-600">검색 결과를 분석 중입니다...</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>인사이트 분석 오류</AlertTitle>
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!data || availableSections.length === 0) {
    return (
      <Card className="border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 pb-7">
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Info className="w-5 h-5" />
            인사이트 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-6 -mt-6 bg-white rounded-t-3xl">
            <div className="flex justify-center items-center py-8">
              <p className="text-gray-600">
                해당 키워드에 대한 추가 정보를 찾을 수 없습니다
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 섹션 설정
  const sectionIcons = {
    organic: <Globe className="w-5 h-5 text-indigo-500" />,
    knowledge: <FileText className="w-5 h-5 text-emerald-500" />,
    local: <MapPin className="w-5 h-5 text-red-500" />,
    images: <ImageIcon className="w-5 h-5 text-blue-500" />,
    videos: <Video className="w-5 h-5 text-rose-500" />,
    stories: <TrendingUp className="w-5 h-5 text-amber-500" />,
    related: <Link2 className="w-5 h-5 text-purple-500" />
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <Card className="border-none shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 pb-7">
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Info className="w-5 h-5" />
            키워드 인사이트
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-6 -mt-6 bg-white rounded-t-3xl">
            {searchInformation && (
              <div className="mb-6">
                <SearchInformationSection 
                  data={searchInformation} 
                />
              </div>
            )}
            
            <Tabs defaultValue={availableSections[0]} className="w-full">
              <TabsList className="w-full max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 bg-gray-100/80 p-1.5 rounded-lg mb-6">
                {availableSections.includes('organic') && (
                  <TabsTrigger value="organic" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <Globe className="w-4 h-4 mr-1.5 md:mr-0 lg:mr-1.5" />
                    <span className="hidden md:hidden lg:inline">검색결과</span>
                  </TabsTrigger>
                )}
                {availableSections.includes('knowledge') && (
                  <TabsTrigger value="knowledge" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <FileText className="w-4 h-4 mr-1.5 md:mr-0 lg:mr-1.5" />
                    <span className="hidden md:hidden lg:inline">정보</span>
                  </TabsTrigger>
                )}
                {availableSections.includes('local') && (
                  <TabsTrigger value="local" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <MapPin className="w-4 h-4 mr-1.5 md:mr-0 lg:mr-1.5" />
                    <span className="hidden md:hidden lg:inline">위치</span>
                  </TabsTrigger>
                )}
                {availableSections.includes('images') && (
                  <TabsTrigger value="images" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <ImageIcon className="w-4 h-4 mr-1.5 md:mr-0 lg:mr-1.5" />
                    <span className="hidden md:hidden lg:inline">이미지</span>
                  </TabsTrigger>
                )}
                {availableSections.includes('videos') && (
                  <TabsTrigger value="videos" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <Video className="w-4 h-4 mr-1.5 md:mr-0 lg:mr-1.5" />
                    <span className="hidden md:hidden lg:inline">비디오</span>
                  </TabsTrigger>
                )}
                {availableSections.includes('stories') && (
                  <TabsTrigger value="stories" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <TrendingUp className="w-4 h-4 mr-1.5 md:mr-0 lg:mr-1.5" />
                    <span className="hidden md:hidden lg:inline">스토리</span>
                  </TabsTrigger>
                )}
                {availableSections.includes('related') && (
                  <TabsTrigger value="related" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <Link2 className="w-4 h-4 mr-1.5 md:mr-0 lg:mr-1.5" />
                    <span className="hidden md:hidden lg:inline">관련 검색어</span>
                  </TabsTrigger>
                )}
              </TabsList>

              {availableSections.includes('organic') && (
                <TabsContent value="organic" className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-lg font-semibold text-gray-900">웹 검색 결과</h3>
                  </div>
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <OrganicResults results={organicResults!} />
                    </motion.div>
                  </AnimatePresence>
                </TabsContent>
              )}

              {availableSections.includes('knowledge') && (
                <TabsContent value="knowledge" className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-lg font-semibold text-gray-900">정보 그래프</h3>
                  </div>
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <KnowledgeGraphSection data={knowledgeGraph!} />
                    </motion.div>
                  </AnimatePresence>
                </TabsContent>
              )}

              {availableSections.includes('local') && (
                <TabsContent value="local" className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-red-500" />
                    <h3 className="text-lg font-semibold text-gray-900">위치 정보</h3>
                  </div>
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <LocalResultsSection data={localResults!} />
                    </motion.div>
                  </AnimatePresence>
                </TabsContent>
              )}

              {availableSections.includes('images') && (
                <TabsContent value="images" className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <ImageIcon className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-900">이미지</h3>
                  </div>
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <InlineImagesSection data={inlineImages!} />
                    </motion.div>
                  </AnimatePresence>
                </TabsContent>
              )}

              {availableSections.includes('videos') && (
                <TabsContent value="videos" className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Video className="w-5 h-5 text-rose-500" />
                    <h3 className="text-lg font-semibold text-gray-900">비디오</h3>
                  </div>
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <InlineVideosSection data={inlineVideos!} />
                    </motion.div>
                  </AnimatePresence>
                </TabsContent>
              )}

              {availableSections.includes('stories') && (
                <TabsContent value="stories" className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-amber-500" />
                    <h3 className="text-lg font-semibold text-gray-900">주요 스토리</h3>
                  </div>
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TopStoriesSection data={topStories!} />
                    </motion.div>
                  </AnimatePresence>
                </TabsContent>
              )}

              {availableSections.includes('related') && (
                <TabsContent value="related" className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Link2 className="w-5 h-5 text-purple-500" />
                    <h3 className="text-lg font-semibold text-gray-900">관련 검색어</h3>
                  </div>
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <RelatedSearchesSection data={relatedSearches!} />
                    </motion.div>
                  </AnimatePresence>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 