'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OcrFrequencyChart } from './ocr-frequency-chart'
import { OcrCategoryDistribution } from './ocr-category-distribution'
import { OcrDetailedAnalysis } from './ocr-detailed-analysis'
import { OcrAnalysis } from '@/types/instagram'

interface OcrAnalysisDashboardProps {
  data: OcrAnalysis[];
}

export function OcrAnalysisDashboard({ data }: OcrAnalysisDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredData = selectedCategory === 'all' 
    ? data 
    : data.filter(item => item.category === selectedCategory)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>OCR 텍스트 분석</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="frequency" className="space-y-4">
          <TabsList>
            <TabsTrigger value="frequency">출현 빈도</TabsTrigger>
            <TabsTrigger value="category">카테고리 분포</TabsTrigger>
            <TabsTrigger value="detailed">상세 분석</TabsTrigger>
          </TabsList>

          <TabsContent value="frequency">
            <OcrFrequencyChart data={filteredData} />
          </TabsContent>

          <TabsContent value="category">
            <OcrCategoryDistribution data={data} onCategorySelect={setSelectedCategory} />
          </TabsContent>

          <TabsContent value="detailed">
            <OcrDetailedAnalysis data={filteredData} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}