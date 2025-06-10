import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ComparisonMetric } from "@/types/business"
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react'

export function ComparisonMetricCard({ 
  title, 
  icon, 
  data, 
  unit 
}: { 
  title: string;
  icon: React.ReactNode;
  data: ComparisonMetric;
  unit: string;
}) {
  const percentile = 100 - data.percentile
  const isAboveAverage = data.target > data.adjacent_avg

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          {icon}
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-between items-baseline">
            <div>
              <p className="text-sm text-muted-foreground">현재 값</p>
              <p className="text-3xl font-bold">
                {data.target.toFixed(1)}{unit}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">인접 지역 평균</p>
              <p className="text-xl font-semibold">
                {data.adjacent_avg.toFixed(1)}{unit}
              </p>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">백분위</span>
              <span className="text-sm font-bold">{percentile.toFixed(1)}%</span>
            </div>
            <Progress value={percentile} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">최고 지역</p>
              <p className="font-medium">{data.max_area}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">최저 지역</p>
              <p className="font-medium">{data.min_area}</p>
            </div>
          </div>

          <div className="flex items-center justify-center">
            {isAboveAverage ? (
              <div className="flex items-center text-green-600">
                <ArrowUpIcon className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">평균 이상</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <ArrowDownIcon className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">평균 이하</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}