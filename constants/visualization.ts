import { 
    Building2, 
    Users, 
    Store, 
    Users2,
    Timer,
    CreditCard,
    Building,
    Home
  } from 'lucide-react';
  
  export const VISUALIZATION_METRICS = [
    {
      id: 'tot_ppltn',
      name: '유동인구',
      icon: Users,
      isImplemented: true,
      description: '해당 지역의 일평균 유동인구입니다.'
    },
    {
      id: 'employee_cnt',
      name: '직장인구',
      icon: Users2,
      isImplemented: true,
      description: '해당 행정동의 직장인구 수입니다.'
    },
    {
      id: 'tot_house',
      name: '세대수',
      icon: Building,
      isImplemented: true,
      description: '해당 행정동의 총 세대수입니다.'
    },
    {
      id: 'tot_family',
      name: '가족수',
      icon: Home,
      isImplemented: true,
      description: '해당 행정동의 가족 수입니다.'
    },
    {
      id: 'income',
      name: '소득',
      icon: Timer,
      isImplemented: true,
      description: '해당 행정동의 소득 수준입니다.'
    },
    {
      id: 'consumption',
      name: '소비',
      icon: CreditCard,
      isImplemented: true,
      description: '해당 행정동의 음식업 소비 수준입니다.'  
    }
  ];
  
  export const FUTURE_METRICS = [
    {
      id: 'sales',
      name: '매출',
      icon: Store,
      isImplemented: false,
      description: '추후 업데이트 예정입니다.'
    }
  ];
  


  export const FOOD_CATEGORIES = {
    'I20101': { name: '백반/한정식', icon: '🍚' },
    'I20102': { name: '국/탕/찌개류', icon: '🥘' },
    'I20103': { name: '족발/보쌈', icon: '🦶' },
    'I20104': { name: '전/부침개', icon: '🥓' },
    'I20105': { name: '국수/칼국수', icon: '🍜' },
    'I20106': { name: '냉면/밀면', icon: '🍜🥶' },
    'I20107': { name: '돼지고기 구이/찜', icon: '🥓' },
    'I20108': { name: '소고기 구이/찜', icon: '🥩' },
    'I20109': { name: '곱창 전골/구이', icon: '🥘' },
    'I20110': { name: '닭/오리고기 구이/찜', icon: '🍗' },
    'I20111': { name: '횟집', icon: '🐟' },
    'I20112': { name: '해산물 구이/찜', icon: '🦐' },
    'I20113': { name: '복 요리 전문', icon: '🐡' },
    'I20199': { name: '기타 한식 음식점', icon: '🍱' },
    'I20201': { name: '중국집', icon: '🥢' },
    'I20202': { name: '마라탕/훠궈', icon: '🌶️' },
    'I20301': { name: '일식 회/초밥', icon: '🍣' },
    'I20302': { name: '일식 카레/돈가스/덮밥', icon: '🍛' },
    'I20303': { name: '일식 면 요리', icon: '🍜' },
    'I20399': { name: '기타 일식 음식점', icon: '🍱' },
    'I20401': { name: '경양식', icon: '🍽️' },
    'I20402': { name: '파스타/스테이크', icon: '🍝' },
    'I20403': { name: '패밀리레스토랑', icon: '🍴' },
    'I20499': { name: '기타 서양식 음식점', icon: '🍽️' },
    'I20501': { name: '베트남식 음식', icon: '🍜' },
    'I20599': { name: '기타 아시아식 전문', icon: '🥢' },
    'I20601': { name: '분류 안된 외국식 음식점', icon: '🌏' },
    'I20701': { name: '구내식당', icon: '🏢' },
    'I20702': { name: '뷔페', icon: '🍽️' },
    'I21001': { name: '빵/도넛', icon: '🥐' },
    'I21002': { name: '떡/한과', icon: '🍡' },
    'I21003': { name: '피자', icon: '🍕' },
    'I21004': { name: '버거', icon: '🍔' },
    'I21005': { name: '토스트/샌드위치/샐러드', icon: '🥪' },
    'I21006': { name: '치킨', icon: '🍗' },
    'I21007': { name: '김밥/만두/분식', icon: '🍙' },
    'I21008': { name: '아이스크림/빙수', icon: '🍦' },
    'I21099': { name: '그 외 기타 간이 음식점', icon: '🥡' },
    'I21101': { name: '일반 유흥 주점', icon: '🍺' },
    'I21102': { name: '무도 유흥 주점', icon: '💃' },
    'I21103': { name: '생맥주 전문', icon: '🍺' },
    'I21104': { name: '요리 주점', icon: '🍶' },
    'I21201': { name: '카페', icon: '☕' }
  } as const;