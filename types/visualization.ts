export interface DistrictData {
  adm_cd?: string;         // 행정동 코드  
  adm_nm?: string;         // 행정동 이름
  tot_ppltn?: number;      // 총 인구수
  employee_cnt?: number;   // 직장인 수
  tot_house?: number;      // 총 주택 수
  tot_family?: number;     // 총 가구 수
  ppltn_dnsty?: number;    // 인구 밀도
  corp_cnt?: number;       // 기업 수
  avg_age?: number;        // 평균 나이
  avg_fmember_cnt?: number; // 가구당 평균 인원 수
  oldage_suprt_per?: number; // 노인 부양 비율
  juv_suprt_per?: number;  // 청소년 부양 비율
  aged_child_idx?: number; // 노년-아동 지수
  nongga_cnt?: string;     // 농가 수
  nongga_ppltn?: string;   // 농가 인구
  naesuoga_cnt?: string;   // 내수용 가정 수
  naesuoga_ppltn?: string; // 내수용 가정 인구
  haesuoga_cnt?: string;   // 해수용 가정 수
  haesuoga_ppltn?: string; // 해수용 가정 인구
  imga_cnt?: string;       // 임가 수
  imga_ppltn?: string;     // 임가 인구
  income?: number;         // 소득
  consumption?: number;    // 소비
  [key: string]: any;      // 기타 속성
}

export interface VisualizationMetric {
id: keyof DistrictData;
name: string;
icon: React.ReactNode;
isImplemented: boolean;
description: string;
}

export interface SearchTrendsResult {
  results: {
    daily?: Array<{
      graph_data: any[];
    }>;
    weekly?: Array<{
      graph_data: any[];
    }>;
    monthly?: Array<{
      graph_data: any[];
    }>;
  };
}