'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { InstagramAnalysis } from '@/types/instagram'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!
  }
})

export function FoodTrendChart() {
  const [trendData, setTrendData] = useState<{
    date: string;
    posts: number;
    likes: number;
    comments: number;
  }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0]
        const command = new GetObjectCommand({
          Bucket: 'smwu-daily-instagram-analysis',
          Key: `${today}/latest.json`
        })
        
        const response = await s3Client.send(command)
        if (!response.Body) {
          throw new Error('Response body is empty')
        }
        
        const str = await response.Body.transformToString()
        if (!str) {
          throw new Error('Empty response string')
        }

        const data = JSON.parse(str) as InstagramAnalysis
        setTrendData([{
          date: today,
          posts: data.statistics.total_posts,
          likes: data.statistics.average_likes_per_post,
          comments: data.statistics.average_comments_per_post
        }])
      } catch (error) {
        console.error('Error fetching trend data:', error)
        setError(error instanceof Error ? error.message : '데이터를 불러오는데 실패했습니다')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrendData()
  }, [])

  if (isLoading) {
    return (
      <Card className="w-full mt-8">
        <CardHeader className="text-center">
          <CardTitle>인스타그램 음식 해시태그 트렌드</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[400px]">
          <div>로딩 중...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full mt-8">
        <CardHeader className="text-center">
          <CardTitle>인스타그램 음식 해시태그 트렌드</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[400px]">
          <div className="text-gray-600 text-center">
            <p>오늘의 인사이트가 아직 생성되지 않았습니다.</p>
            <p className="text-sm mt-2">매일 오전 9시에 새로운 인사이트가 업데이트됩니다.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>인스타그램 음식 해시태그 트렌드</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full" style={{ minHeight: "400px" }}>
          <ChartContainer
            config={{
              posts: {
                label: "게시물 수",
                color: "hsl(var(--chart-1))",
              },
              likes: {
                label: "평균 좋아요",
                color: "hsl(var(--chart-2))",
              },
              comments: {
                label: "평균 댓글",
                color: "hsl(var(--chart-3))",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%" minHeight={400}>
              <LineChart 
                data={trendData}
                margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
              >
                <XAxis 
                  dataKey="date" 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  padding={{ left: 20, right: 20 }}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={55}
                  tickFormatter={(value) => `${(value/1000).toFixed(1)}k`}
                  domain={[0, 'auto']}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  cursor={{ stroke: '#888888', strokeDasharray: '5 5' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="posts" 
                  stroke="var(--color-posts)" 
                  strokeWidth={3} 
                  dot={{ fill: "var(--color-posts)", r: 6, strokeWidth: 0 }}
                  activeDot={{ r: 8, strokeWidth: 2 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="likes" 
                  stroke="var(--color-likes)" 
                  strokeWidth={3} 
                  strokeDasharray="5 5"
                  dot={{ fill: "var(--color-likes)", r: 6, strokeWidth: 0 }}
                  activeDot={{ r: 8, strokeWidth: 2 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="comments" 
                  stroke="var(--color-comments)" 
                  strokeWidth={3} 
                  strokeDasharray="3 3"
                  dot={{ fill: "var(--color-comments)", r: 6, strokeWidth: 0 }}
                  activeDot={{ r: 8, strokeWidth: 2 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}