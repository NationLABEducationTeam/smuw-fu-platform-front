export function CommercialChangeDistribution({ 
    distribution, 
    totalCount 
  }: { 
    distribution: { [key: string]: number };
    totalCount: number;
  }) {
    return (
      <div className="space-y-4">
        {Object.entries(distribution).map(([type, count]) => (
          <div key={type} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{type}</span>
              <span>{count}개 ({((count / totalCount) * 100).toFixed(1)}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${
                  type === '상권확장' ? 'bg-green-500' :
                  type === '정체' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${(count / totalCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    )
  }