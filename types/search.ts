export interface SearchResult {
  full_name: string;
  dong_name: string;
}

export interface SearchResponse {
  results: SearchResult[];
}

export interface SearchState {
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
}

export interface LocationResponse {
  name: string;
  administrative_code: string;
  population_code: string;
}