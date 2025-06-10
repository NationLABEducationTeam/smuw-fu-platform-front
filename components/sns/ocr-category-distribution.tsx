import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { OcrAnalysis } from '@/types/instagram'

const COLORS = [
  'hsl(326, 100%, 74%)',  // 핑크
  'hsl(262, 83%, 74%)',   // 보라
  'hsl(199, 89%, 70%)',   // 하늘
  'hsl(46, 100%, 71%)'    // 노랑
];
export function OcrCategoryDistribution({ 
  data, 
  onCategorySelect 
}: { 
  data: OcrAnalysis[];
  onCategorySelect: (category: string) => void;
}) {
  const categoryMapping: Record<string, string> = {
    'menu': '메뉴',
    'price': '가격',
    'facility': '시설',
    'other': '기타'
  }

  const categoryData = data.reduce((acc, curr) => {
    acc[categoryMapping[curr.category]] = (acc[categoryMapping[curr.category]] || 0) + curr.frequency;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            onClick={(_, index) => onCategorySelect(pieData[index].name)}
          >
            {pieData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}