export interface SearchVolumeData {
  total: number;
  timeTaken: number;
  queryDisplayed: string;
}

export interface KnowledgeGraphData {
  title: string;
  thumbnail?: string;
  type?: string;
  rating?: number;
  reviewCount?: number;
  address?: string;
  phone?: string;
  description?: string;
  website?: string;
  hours?: {
    [key: string]: {
      opens?: string;
      closes?: string;
    };
  };
}

export interface ImageData {
  source: string;
  thumbnail: string;
  title: string;
  sourceName: string;
}

export interface SearchResultData {
  title: string;
  link: string;
  snippet: string;
  date?: string;
  displayedLink: string;
}

export interface RelatedSearchData {
  query: string;
  link: string;
}

export interface StandardizedResponse {
  metadata: {
    hasKnowledgeGraph: boolean;
    hasImages: boolean;
    hasSearchResults: boolean;
    hasRelatedSearches: boolean;
  };
  components: {
    searchVolume?: SearchVolumeData;
    knowledgeGraph?: KnowledgeGraphData;
    images?: ImageData[];
    searchResults?: SearchResultData[];
    relatedSearches?: RelatedSearchData[];
  };
} 