'use client'

import { useState, useEffect } from 'react'
import { Question } from '@/types/diagnosis'
import { SearchResult } from '@/types/search'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useLocationSearch } from '@/hooks/useLocationSearch'
import { MagnifyingGlassIcon, CheckIcon } from "@heroicons/react/24/outline"

interface QuestionInputProps {
  question: Question
  value: string
  onChange: (value: string) => void
}

export function QuestionInput({ question, value, onChange }: QuestionInputProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<SearchResult | null>(null)
  const { searchState, searchLocation } = useLocationSearch()

  useEffect(() => {
    if (value) {
      setSearchTerm(value)
    }
  }, [value])

  const handleLocationSelect = (result: SearchResult) => {
    setSelectedLocation(result)
    setSearchTerm(result.full_name)
    onChange(result.full_name)
  }

  // 위치 검색 질문 (id: 1)
  if (question.id === 1) {
    return (
      <div className="space-y-2">
        <div className="relative">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setSelectedLocation(null)
            }}
            onKeyDown={(e) => e.key === 'Enter' && searchLocation(searchTerm)}
            placeholder="행정동을 검색해주세요 (예: 청파동)"
            className="pr-10"
          />
          <button 
            onClick={() => searchLocation(searchTerm)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {searchTerm && searchTerm.length < 2 && (
          <p className="text-sm text-gray-500">
            2글자 이상 입력해주세요
          </p>
        )}

        {searchState.error && (
          <p className="text-sm text-red-500">
            {searchState.error}
          </p>
        )}

        {searchState.results && searchState.results.length > 0 && (
          <div className="border rounded-lg shadow-sm max-h-60 overflow-y-auto">
            {searchState.results.map((result, index) => (
              <button
                key={`${result.full_name}-${index}`}
                onClick={() => handleLocationSelect(result)}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex justify-between items-center
                  ${selectedLocation?.full_name === result.full_name ? 'bg-blue-50 text-blue-600' : ''}`}
              >
                <span>{result.full_name}</span>
                {selectedLocation?.full_name === result.full_name && (
                  <CheckIcon className="w-5 h-5 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        )}

        {selectedLocation && (
          <p className="text-sm text-green-600">
            선택된 위치: {selectedLocation.full_name}
          </p>
        )}
      </div>
    )
  }

  switch (question.type) {
    case 'radio':
      return (
        <RadioGroup value={value} onValueChange={onChange} className="space-y-4">
          {question.options?.map((option) => (
            <div key={option} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent transition-colors">
              <RadioGroupItem value={option} id={option} />
              <Label htmlFor={option}>{option}</Label>
            </div>
          ))}
        </RadioGroup>
      )

    case 'text':
      return (
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="답변을 입력해주세요"
          className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
        />
      )

    case 'select':
      return (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="선택해주세요" />
          </SelectTrigger>
          <SelectContent>
            {question.options?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )

    default:
      return null
  }
}