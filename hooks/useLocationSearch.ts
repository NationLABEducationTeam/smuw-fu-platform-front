import { useState, useCallback } from 'react';
import { SearchResult, SearchState, SearchResponse, LocationResponse } from '../types/search';
import { fetchFromAPI, API_ENDPOINTS } from '@/utils/api';

interface MoneyAPIResponse {
  statusCode: number;
  headers: { [key: string]: string };
  body: string;
}

interface MoneyData {
  monthly_income: number;
  expenditure: {
    total: number;
    food_dining: number;
    [key: string]: number;
  };
}

export function useLocationSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchState, setSearchState] = useState<SearchState>({
    results: [],
    isLoading: false,
    error: null,
  });

  // searchLocation 함수 내부
  const searchLocation = useCallback(async (term: string) => {
    if (!term || term.length < 2) return;
    
    setSearchState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await fetchFromAPI<SearchResponse>(API_ENDPOINTS.LOCATION, { query: term });
      
      setSearchState({
        results: response.results || [],
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Search error:', error);
      setSearchState({
        results: [],
        isLoading: false,
        error: error instanceof Error ? error.message : '검색 중 오류가 발생했습니다',
      });
    }
  }, []);

  const resetSearch = useCallback(() => {
    setSearchTerm('');
    setSearchState({
      results: [],
      isLoading: false,
      error: null,
    });
  }, []);

  // handleSelectLocation 함수 내부
  const handleSelectLocation = useCallback(async (location: SearchResult) => {
    try {
      setSearchTerm(location.full_name);
      setSearchState(prev => ({ ...prev, results: [] }));
      
      const response = await fetchFromAPI<LocationResponse>(API_ENDPOINTS.LOCATION, { 
        selected: {
          dong_name: location.dong_name,
          full_name: location.full_name
        }
      });

      if (!response) {
        throw new Error('행정동 코드 조회 실패');
      }

      // 여기에 서울시 체크 추가
      if (!response.administrative_code.startsWith('11')) {
        return {
          name: response.name,
          administrative_code: response.administrative_code,
          population_code: response.population_code,
          moneyData: {
            income: 0,
            consumption: 0
          }
        };
      }

      // 서울시인 경우에만 money 데이터 요청
      const moneyResponse = await fetchFromAPI<MoneyAPIResponse>(API_ENDPOINTS.MONEY, {
        district_codes: response.administrative_code.slice(0, -2),
        start_index: 1,
        end_index: 1000
      });

      const moneyData = JSON.parse(moneyResponse.body) as MoneyData;

      return {
        name: response.name,
        administrative_code: response.administrative_code,
        population_code: response.population_code,
        moneyData: {
          income: moneyData.monthly_income,
          consumption: moneyData.expenditure.total
        }
      };
    } catch (error) {
      console.error('Selection error:', error);
      throw error;
    }
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    searchState,
    handleSelectLocation,
    searchLocation,
    resetSearch
  };
}