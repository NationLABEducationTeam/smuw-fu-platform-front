import { Bar, BarChart, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { OcrAnalysis } from '@/types/instagram'

export function OcrFrequencyChart({ data }: { data: OcrAnalysis[] }) {
  const categoryColors: Record<string, string> = {
    'menu': "hsl(200, 95%, 60%)",      // 밝은 하늘색
    'price': "hsl(145, 63%, 60%)",     // 밝은 연두색
    'facility': "hsl(29, 100%, 70%)",  // 밝은 주황색
    'other': "hsl(265, 89%, 80%)"      // 밝은 연보라색
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>OCR 빈도 분석</CardTitle>
        <CardDescription>인스타그램 게시물에서 감지된 텍스트의 빈도</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            frequency: {
              label: "빈도",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[400px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis 
                dataKey="text" 
                tick={{ fill: 'hsl(var(--foreground))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--foreground))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as OcrAnalysis;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              텍스트
                            </span>
                            <span className="font-bold">{data.text}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              빈도
                            </span>
                            <span className="font-bold">{data.frequency}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              카테고리
                            </span>
                            <span className="font-bold">{data.category}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              게시물 수
                            </span>
                            <span className="font-bold">{data.postCount}</span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="frequency" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={categoryColors[entry.category]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}