import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { SearchResult } from '@/types/search';
import { FormEvent } from 'react';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm?: (term: string) => void;
  onSearchTermChange?: (term: string) => void;
  onSearch: ((e?: React.FormEvent) => Promise<void>) | ((term: string) => Promise<void>);
  onSearchClick?: () => void;
  isLoading: boolean;
  error: string | null | undefined;
  searchResults?: SearchResult[];
  results?: SearchResult[];
  onSelectResult: (result: SearchResult) => void;
}

const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent" />
);

export function SearchBar({
  searchTerm,
  setSearchTerm,
  onSearchTermChange,
  onSearch,
  onSearchClick,
  isLoading,
  error,
  searchResults,
  results,
  onSelectResult
}: SearchBarProps) {
  const handleTermChange = (value: string) => {
    if (setSearchTerm) {
      setSearchTerm(value);
    } else if (onSearchTermChange) {
      onSearchTermChange(value);
    }
  };

  const handleSearch = (e?: FormEvent) => {
    if (e) e.preventDefault();
    
    if (typeof onSearch === 'function') {
      try {
        // @ts-ignore - 여러 형태의 onSearch 함수를 지원하기 위해 타입 검사 무시
        onSearch(e);
      } catch (error) {
        console.error('Search error:', error);
      }
    }
  };

  const handleSearchClick = () => {
    if (onSearchClick) {
      onSearchClick();
    }
  };
  
  const displayResults = searchResults || results || [];

  return (
    <div className="mb-4">
      <form onSubmit={handleSearch} className="relative">
        <input 
          type="text"
          placeholder="행정동 이름 검색"
          className="w-full px-4 py-2 border rounded-full text-sm focus:outline-none focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => handleTermChange(e.target.value)}
          onClick={handleSearchClick}
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
          onClick={handleSearch}
        >
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          )}
        </button>
      </form>
      
      {error && (
        <div className="mt-2 text-sm text-red-500 px-2">
          {error}
        </div>
      )}

      {searchTerm && searchTerm.length < 2 && (
        <div className="mt-2 text-sm text-gray-500 px-2">
          2글자 이상 입력해주세요
        </div>
      )}

      {displayResults.length > 0 && (
        <div className="mt-2 border rounded-lg overflow-hidden divide-y">
          {displayResults.map((result) => (
            <div 
              key={result.full_name} 
              className="p-2 hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => onSelectResult(result)}
            >
              <p className="font-medium">{result.full_name}</p>
              <p className="text-gray-500 text-sm">{result.dong_name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 