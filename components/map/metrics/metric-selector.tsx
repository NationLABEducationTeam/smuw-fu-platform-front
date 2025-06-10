import { VISUALIZATION_METRICS, FUTURE_METRICS } from '@/constants/visualization';
import { Users } from 'lucide-react';
import { MetricCard } from '@/components/visualization/metric-card';
import { DistrictData } from '@/types/visualization';
import { formatValue } from '@/utils/visualization';

interface MetricSelectorProps {
  selectedMetric: string | null;
  onMetricSelect: (metricId: string) => void;
  districtData: DistrictData | null;
}

export function MetricSelector({
  selectedMetric,
  onMetricSelect,
  districtData
}: MetricSelectorProps) {
  return (
    <div className="mt-6">
      <h3 className="font-semibold mb-3">데이터 시각화</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {[...VISUALIZATION_METRICS, ...FUTURE_METRICS].map((metric) => {
          const Icon = metric.icon;
          return (
            <button
              key={metric.id}
              onClick={() => metric.isImplemented && onMetricSelect(metric.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg text-center
                ${metric.isImplemented 
                  ? selectedMetric === metric.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
              disabled={!metric.isImplemented}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[10px] sm:text-xs">{metric.name}</span>
            </button>
          );
        })}
      </div>

      {selectedMetric && districtData && selectedMetric in districtData && (
        <div className="mt-4">
          <MetricCard
            icon={VISUALIZATION_METRICS.find(m => m.id === selectedMetric)?.icon || Users}
            label={VISUALIZATION_METRICS.find(m => m.id === selectedMetric)?.name || ''}
            value={formatValue(
              String(selectedMetric), 
              districtData[selectedMetric as keyof DistrictData] as number
            )}
            description={VISUALIZATION_METRICS.find(m => m.id === selectedMetric)?.description || ''}
          />
        </div>
      )}
    </div>
  );
} 