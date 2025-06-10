export interface BusinessAnalysisResponse {
    target_area: BusinessData;
    adjacent: {
      [area_name: string]: {
        adstrd_cd: string;
        adstrd_cd_nm: string;
        operation: {
          local: number;
          seoul: number;
        };
        closure: {
          local: number;
          seoul: number;
        };
        commercial_change: string;
      };
    };
    comparison_metrics: {
      operation: ComparisonMetric;
      closure: ComparisonMetric;
      vitality: ComparisonMetric;
      changes_summary: {
        total_count: number;
        distribution: {
          [change_type: string]: number;
        };
      };
    };
    additional_analysis: string[];
    meta: {
      query_time: string;
      adjacent_count: number;
      data_period: {
        start: string;
        end: string;
      };
    };
  }
  
  export interface ComparisonMetric {
    target: number;
    adjacent_avg: number;
    max_area: string;
    min_area: string;
    percentile: number;
  }
  
  export interface BusinessData {
    adstrd_cd: string;
    adstrd_cd_nm: string;
    time_series: {
      labels: string[];
      datasets: {
        operation: { avg_months: { local: number[]; seoul: number[]; } };
        closure: { avg_months: { local: number[]; seoul: number[]; } };
      };
    };
    commercial_change_trends: string[];
    insights: {
      summary: {
        operation: { 
          local_growth: number;
          seoul_growth: number;
          comparison_with_seoul: number;
          trend: string;
        };
        closure: { 
          local_growth: number;
          seoul_growth: number;
          comparison_with_seoul: number;
          trend: string;
        };
      };
      analysis: string[];
    };
  }