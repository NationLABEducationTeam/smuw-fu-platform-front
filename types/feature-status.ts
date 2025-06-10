export type FeatureStatus = 'available' | 'beta' | 'unavailable' | 'update-in-progress';

export interface Feature {
  name: string;
  status: FeatureStatus;
  description?: string;
}

export const getStatusColor = (status: FeatureStatus) => {
  switch (status) {
    case 'available':
      return 'green';
    case 'beta':
      return 'yellow';
    case 'unavailable':
      return 'red';
    case 'update-in-progress':
      return 'blue';
  }
};

export const FEATURES: Feature[] = [
  {
    name: '요식업/푸드테크 트렌드',
    status: 'available',
    description: '실시간 요식업 키워드 분석 및 경쟁 기업/프랜차이즈 현황 분석'
  },
  {
    name: '상세 지도',
    status: 'available',
    description: '지역별 상권 분석'
  },
  {
    name: '키워드 검색',
    status: 'available',
    description: 'Version 2.0 출시'
  },
  {
    name: 'SNS 분석',
    status: 'available',
    description: '추가 인사이트 제공 개발 중'
  },
  {
    name: 'AI 창업 진단',
    status: 'available',
    description: '창업 진단 봇 1.0'
  },
  {
    name: '창/폐업 분석',
    status: 'available',
    description: '서울시 한정 가능 / 추가 기능 개발중'
  },
  {
    name: 'AI 챗봇',
    status: 'available',
    description: 'Claude 3.5 Sonnet 모델 기반 AI 챗봇'
  }
];