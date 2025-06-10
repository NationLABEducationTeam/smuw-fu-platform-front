// SERP 데이터 타입 정의


export interface LocalResults {
  places: LocalResult[];
  more_locations_link?: string;
}

export interface LocalResult {
  position: number;
  label: string;
  title: string;
  description?: string;
  address: string;
  phone?: string;
  hours?: string;
  service_options?: {
    매장_내_식사?: boolean;
    테이크아웃?: boolean;
    비대면_배달?: boolean;
    배달_서비스?: boolean;
    [key: string]: boolean | undefined;
  };
  links?: {
    directions?: string;
    [key: string]: string | undefined;
  };
  place_id?: string;
  place_id_search?: string;
  gps_coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface OrganicResult {
  position: number;
  title: string;
  link: string;
  redirect_link?: string;
  displayed_link: string;
  favicon?: string;
  thumbnail?: string;
  snippet: string;
  snippet_highlighted_words: string[];
  source?: string;
  date?: string;
  sitelinks?: {
    inline?: Array<{
      title: string;
      link: string;
    }>;
    expanded?: Array<{
      title: string;
      link: string;
      snippet: string;
    }>;
  };
}

export interface RelatedSearch {
  query: string;
  link: string;
}

export interface KnowledgeGraphHours {
  opens: string;
  closes: string;
}

export interface KnowledgeGraphPopularTimes {
  live?: {
    time: string;
    info: string;
  };
  [key: string]: any;
}

export interface KnowledgeGraph {
  title: string;
  type?: string;
  directions?: string;
  entity_type?: string;
  hours?: {
    [key: string]: KnowledgeGraphHours;
  };
  kgmid?: string;
  knowledge_graph_search_link?: string;
  local_map?: Record<string, any>;
  merchant_description?: string;
  place_id?: string;
  popular_times?: KnowledgeGraphPopularTimes;
  rating?: number;
  raw_hours?: string;
  review_count?: number;
  serpapi_knowledge_graph_search_link?: string;
  thumbnail?: string;
  unclaimed_listing?: boolean;
  website?: string;
}


export interface InlineImage {
  source: string;
  thumbnail: string;
  original: string;
  title: string;
  source_name: string;
}

export interface InlineVideo {
  position: number;
  title: string;
  link: string;
  thumbnail: string;
  duration?: string;
  platform?: string;
  channel?: {
    name: string;
    link: string;
  };
  published?: string;
  views?: string;
}

export interface TopStory {
  title: string;
  link: string;
  source: string;
  date: string;
  snippet?: string;
  thumbnail?: string;
}

export interface SerpData {
  search_parameters?: Record<string, string>;
  search_information?: {
    total_results?: number;
    time_taken?: number;
    query_displayed?: string;
  };
  local_map?: Record<string, any>;
  local_results?: LocalResults;
  knowledge_graph?: KnowledgeGraph;
  inline_images?: InlineImage[];
  inline_videos?: InlineVideo[];
  organic_results?: OrganicResult[];
  filters?: Array<{
    type: string;
    name: string;
    link: string;
    selected?: boolean;
  }>;
  top_stories?: TopStory[];
  top_stories_link?: string;
  top_stories_serpapi_link?: string;
  related_searches?: RelatedSearch[];
}

export interface KeywordInsightsProps {
  data: SerpData | null;
  isLoading: boolean;
  error: string | null;
} 