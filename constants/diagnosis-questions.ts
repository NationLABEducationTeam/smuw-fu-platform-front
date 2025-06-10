import { Question } from '@/types/diagnosis'

export const DIAGNOSIS_QUESTIONS: Question[] = [
  // 필수 기본 정보
  {
    id: 1,
    question: '창업하고자 하는 정확한 위치(행정동)를 선택해주세요.',
    type: 'location',  // select에서 location으로 변경
    category: 'location',
    description: '행정동 단위까지 정확한 위치 선택이 필요합니다.',
    required: true
  },
  {
    id: 2,
    question: '창업하고자 하는 음식점의 업종은 무엇입니까?',
    type: 'select',
    options: [
      '한식-일반',
      '한식-고기구이',
      '한식-분식',
      '일식-라멘',
      '일식-회/스시',
      '중식',
      '양식-피자/파스타',
      '양식-버거',
      '카페/디저트',
      '치킨',
      '주점',
      '기타'
    ],
    category: 'business',
    description: '세부 업종에 따라 상권 분석 결과가 달라질 수 있습니다.',
    required: true
  },

  // 사업자 정보
  {
    id: 3,
    question: '현재 운영 중이거나 계획 중인 사업의 형태는 무엇입니까?',
    type: 'radio',
    options: ['개인사업자', '법인사업자', '예비창업자', '기타'],
    category: 'personal',
    description: '사업자 형태에 따라 필요한 절차와 준비사항이 다릅니다.'
  },
  {
    id: 4,
    question: '창업 경험이 있으십니까?',
    type: 'radio',
    options: ['없음', '1회', '2회', '3회 이상'],
    category: 'personal',
    description: '이전 창업 경험은 성공 확률에 영향을 미칠 수 있습니다.'
  },
  {
    id: 5,
    question: '주방 경력이 있으십니까?',
    type: 'select',
    options: ['없음', '1년 미만', '1-3년', '3-5년', '5년 이상'],
    category: 'personal',
    description: '주방 운영 경험은 초기 안정화에 중요한 요소입니다.'
  },

  // 상권 및 입지 분석
  {
    id: 6,
    question: '선호하는 상권의 특성은 무엇입니까?',
    type: 'radio',
    options: ['주거지역', '상업지역', '오피스지역', '학교근처', '복합지역'],
    category: 'location',
    description: '상권 특성에 따라 주요 고객층과 영업 전략이 달라질 수 있습니다.'
  },
  {
    id: 7,
    question: '주요 경쟁점포 수는 몇 개입니까? (반경 500m 이내)',
    type: 'select',
    options: ['없음', '1-3개', '4-6개', '7개 이상'],
    category: 'market',
    description: '동일 업종의 경쟁 점포 수를 입력해주세요.'
  },
  {
    id: 8,
    question: '해당 위치의 주차 가능 여부는 어떻게 되십니까?',
    type: 'radio',
    options: ['주차 공간 없음', '2대 미만', '2-5대', '6대 이상'],
    category: 'location',
    description: '주차 공간은 고객 접근성에 중요한 요소입니다.'
  },

  // 시장 분석
  {
    id: 9,
    question: '주요 타겟 고객층은 누구입니까?',
    type: 'radio',
    options: ['10-20대', '30-40대', '50대 이상', '전연령층'],
    category: 'market',
    description: '주요 고객층에 따라 마케팅 전략이 달라질 수 있습니다.'
  },
  {
    id: 10,
    question: '선호하는 메뉴 가격대는 어떻게 되십니까?',
    type: 'select',
    options: ['5천원 미만', '5천원-1만원', '1만원-2만원', '2만원 이상'],
    category: 'market',
    description: '메뉴 가격대는 목표 고객층과 연관됩니다.'
  },
  {
    id: 11,
    question: '예상하는 객단가는 얼마입니까?',
    type: 'select',
    options: ['1만원 미만', '1-2만원', '2-3만원', '3만원 이상'],
    category: 'market',
    description: '객단가는 수익성 분석의 기준이 됩니다.'
  },

  // 운영 계획
  {
    id: 12,
    question: '예상하는 직원 수는 몇 명입니까?',
    type: 'select',
    options: ['1-2명', '3-5명', '6-10명', '10명 이상'],
    category: 'operation',
    description: '직원 수는 인건비 산정의 기준이 됩니다.'
  },
  {
    id: 13,
    question: '예상하는 영업 시간을 입력해주세요.',
    type: 'text',
    category: 'operation',
    description: '예: 09:00-21:00'
  },
  {
    id: 14,
    question: '예상하는 좌석 수는 몇 석입니까?',
    type: 'select',
    options: ['10석 미만', '10-20석', '21-35석', '36-50석', '50석 이상'],
    category: 'operation',
    description: '좌석 수에 따라 필요한 매장 면적과 인건비가 달라질 수 있습니다.'
  },
  {
    id: 15,
    question: '배달 서비스 운영 계획이 있으십니까?',
    type: 'radio',
    options: ['예', '아니오', '추후 검토'],
    category: 'operation',
    description: '배달 서비스 운영 시 추가 인력과 설비가 필요할 수 있습니다.'
  },
  {
    id: 16,
    question: '예상하는 평균 회전율은 어떻게 되십니까? (1일 기준)',
    type: 'select',
    options: ['2회전 이하', '2-3회전', '3-4회전', '4회전 이상'],
    category: 'operation',
    description: '좌석당 회전율은 수익성 분석의 중요한 지표입니다.'
  },
  {
    id: 17,
    question: '희망하는 매장 면적은 어떻게 되십니까?',
    type: 'select',
    options: ['10평 미만', '10-20평', '20-30평', '30평 이상'],
    category: 'operation',
    description: '매장 면적은 좌석 수와 주방 설비 규모를 결정합니다.'
  },

  // 재무 계획
  {
    id: 18,
    question: '예상하는 초기 투자 비용은 얼마입니까?',
    type: 'select',
    options: ['5천만원 미만', '5천만원~1억원', '1억원~2억원', '2억원 이상'],
    category: 'finance',
    description: '초기 투자 비용은 향후 수익성 분석의 중요한 기준이 됩니다.'
  },
  {
    id: 19,
    question: '예상하는 월 매출액은 얼마입니까?',
    type: 'select',
    options: ['1000만원 미만', '1000-3000만원', '3000-5000만원', '5000만원 이상'],
    category: 'finance',
    description: '예상 매출액은 수익성 분석의 기준이 됩니다.'
  },
  {
    id: 20,
    question: '예상하는 식자재 원가율은 어떻게 되십니까?',
    type: 'select',
    options: ['30% 미만', '30-35%', '36-40%', '40% 이상'],
    category: 'finance',
    description: '식자재 원가율은 수익성에 직접적인 영향을 미칩니다.'
  },
  {
    id: 21,
    question: '주방 설비 투자 예상 비용은 얼마입니까?',
    type: 'select',
    options: ['2천만원 미만', '2천-4천만원', '4천-6천만원', '6천만원 이상'],
    category: 'finance',
    description: '업종별 필요한 주방 설비가 다를 수 있습니다.'
  },

  // 프랜차이즈 관련
  {
    id: 22,
    question: '프랜차이즈 가맹 계획이 있으십니까?',
    type: 'radio',
    options: ['예', '아니오', '검토중'],
    category: 'business',
    description: '프랜차이즈 가맹은 초기 안정화에 도움이 될 수 있으나, 추가 비용이 발생합니다.'
  },

  // 특별 요구사항
  {
    id: 23,
    question: '특별히 필요한 설비가 있습니까? (복수 선택 가능)',
    type: 'checkbox',
    options: ['대형 환기시설', '가스레인지', '특수 주방기구', '냉장/냉동시설', '기타'],
    category: 'operation',
    description: '업종별 특수 설비 필요 여부를 확인합니다.'
  },
  {
    id: 24,
    question: '인테리어 투자 계획은 어떻게 되십니까?',
    type: 'select',
    options: ['3천만원 미만', '3천-5천만원', '5천-8천만원', '8천만원 이상'],
    category: 'finance',
    description: '인테리어 비용은 초기 투자의 큰 부분을 차지할 수 있습니다.'
  }
]