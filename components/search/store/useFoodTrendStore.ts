import { create } from 'zustand'
import { KeywordAnalysisResponse } from '@/types/keyword-analysis'

interface FoodTrendStore {
  data: KeywordAnalysisResponse | null
  isLoading: boolean
  error: string | null
  setData: (data: KeywordAnalysisResponse) => void
  setIsLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

export const useFoodTrendStore = create<FoodTrendStore>((set) => ({
  data: null,
  isLoading: false,
  error: null,
  setData: (data) => set({ data }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error })
}))