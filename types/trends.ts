export interface TimeSeriesData {
  date: string;
  [key: string]: string | number;
}

// 기존 프로퍼티들의 타입을 더 명확하게 지정
export interface RegionData {
  geoName: string;
  geoCode: string;
  totalInterest?: number;
  [keyword: string]: string | number | undefined;  // 모든 추가 프로퍼티가 이 타입들 중 하나를 가질 수 있음
}

export interface TrendsResponse {
  interest_over_time: TimeSeriesData[];
  interest_by_region: RegionData[];
}