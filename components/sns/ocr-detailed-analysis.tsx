import { OcrAnalysis } from '@/types/instagram'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HeartIcon, MessageCircleIcon } from 'lucide-react'

export function OcrDetailedAnalysis({ data }: { data: OcrAnalysis[] }) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case '메뉴':
        return 'bg-sky-100 text-sky-800'
      case '가격':
        return 'bg-emerald-100 text-emerald-800'
      case '시설':
        return 'bg-amber-100 text-amber-800'
      default:
        return 'bg-indigo-100 text-indigo-800'
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((item) => (
        <Card key={item.text} className="overflow-hidden transition-all hover:shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold">{item.text}</CardTitle>
              <Badge variant="secondary" className={getCategoryColor(item.category)}>
                {item.category}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center space-x-1">
                <span className="font-medium text-muted-foreground">출현 횟수:</span>
                <span>{item.frequency}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-medium text-muted-foreground">게시물 수:</span>
                <span>{item.postCount}</span>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="mb-2 text-sm font-medium text-muted-foreground">평균 참여도</h4>
              <div className="flex justify-between">
                <div className="flex items-center space-x-1">
                  <HeartIcon className="h-4 w-4 text-red-500" />
                  <span className="text-sm">{item.averageEngagement.likes}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircleIcon className="h-4 w-4 text-cyan-500" />
                  <span className="text-sm">{item.averageEngagement.comments}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

