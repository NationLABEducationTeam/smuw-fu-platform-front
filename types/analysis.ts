export interface SalesAnalysis {
  daily_sales: {
    data: { [key: string]: number };
  };
  time_based_sales: {
    data: { [key: string]: number };
  };
  demographics: {
    gender: {
      male: number;
      female: number;
    };
    age: { [key: string]: number };
  };
  weekday_weekend: {
    weekday: number;
    weekend: number;
  };
}

export interface Industry {
  industry_name: string;
  sales_analysis: SalesAnalysis;
}

export interface SalesData {
  district_name: string;
  quarter: string;
  industries?: {
    [key: string]: Industry;
  };
  industry_analysis?: Industry[];
}

export interface AnalysisResult {
  data: {
    scores: {
      [key: string]: number;
    };
    analysis: {
      [key: string]: string;
    };
    recommendations: string[];
  };
}