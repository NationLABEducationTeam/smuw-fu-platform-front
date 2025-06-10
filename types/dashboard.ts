export type TimeStance = 'yesterday' | 'weekly' | 'monthly' | 'quarterly';

export interface TrendingDataItem {
  keyword: string;
  count: string;
  change: string;
  graph_data: number[];
}

export interface TrendingKeyword extends TrendingDataItem {
  rank: number;
  graphData: { time: number; value: number; }[];
}

export interface YouTubeVideo {
  title: string;
  video_id: string;
  view_count: number;
  like_count: number;
  url: string;
}

export interface ChartDataPoint {
    time: number;
    [key: string]: number;  // 동적 키워드를 위한 인덱스 시그니처
  }