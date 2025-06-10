interface BaseResponse {
  status: string
  message: string
  timestamp: string
  keyword: string
}

export interface InlineImage {
  source: string
  thumbnail: string
  original: string
  title: string
  source_name: string
}

export interface OrganicResult {
  position: number
  title: string
  link: string
  redirect_link?: string
  displayed_link: string
  favicon?: string
  date?: string
  snippet: string
  snippet_highlighted_words?: string[]
  source: string
  sitelinks?: {
    inline: Array<{
      title: string
      link: string
    }>
  }
}

export interface RelatedSearch {
  block_position: number
  query: string
  link: string
  serpapi_link: string
}

export interface KnowledgeGraph {
  title: string
  thumbnail?: string
  type?: string
  rating?: number
  review_count?: number
  주소?: string
  전화번호?: string
  merchant_description?: string
  website?: string
  hours?: {
    [key: string]: {
      opens?: string
      closes?: string
    }
  }
}

export interface SearchInformation {
  total_results: number;
  time_taken_displayed: number;
  query_displayed: string;
  organic_results_state?: string;
}

export interface GoogleSearchData {
  search_information: SearchInformation;
  knowledge_graph?: KnowledgeGraph;
  organic_results: OrganicResult[];
  related_searches: RelatedSearch[];
  inline_images?: InlineImage[];
}

export interface SearchAnalysisData {
  searchVolumeTrend: Array<{ date: string; value: number }>
  relatedKeywords: Array<{ keyword: string; score: number }>
  sentimentAnalysis: {
    positive: number
    neutral: number
    negative: number
  }
  topMentions: Array<{
    source: string
    snippet: string
  }>
}

export interface KeywordAnalysisResponse extends BaseResponse {
  data: GoogleSearchData | SearchAnalysisData
}

export function isGoogleSearchData(data: any): data is GoogleSearchData {
  return 'organic_results' in data && Array.isArray(data.organic_results)
}

export function isSearchAnalysisData(data: any): data is SearchAnalysisData {
  return 'searchVolumeTrend' in data && Array.isArray(data.searchVolumeTrend)
}

export function isSearchAnalysisResponse(response: KeywordAnalysisResponse): boolean {
  return isSearchAnalysisData(response.data)
}

export function isGoogleSearchResponse(response: KeywordAnalysisResponse): boolean {
  return isGoogleSearchData(response.data)
}

