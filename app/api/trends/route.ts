import { NextResponse } from 'next/server'
import { TrendsResponse } from '@/types/trends'

// search-page.tsx의 가짜 데이터 생성 로직 재사용
const getRandomDate = () => {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * 30))
  return date.toISOString().split('T')[0]
}

const getRandomNumber = () => Math.floor(Math.random() * 101)

const generateMockTrendsData = (keywords: string[]): TrendsResponse => ({
  interest_over_time: Array.from({ length: 30 }, () => ({
    date: getRandomDate(),
    ...Object.fromEntries(keywords.map(keyword => [keyword, getRandomNumber()]))
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
  
  interest_by_region: [
    '서울', '부산', '인천', '대구', '대전', '광주', '울산', 
    '세종', '경기', '강원', '충북', '충남', '전북', '전남', 
    '경북', '경남', '제주'
  ].map((region, index) => ({
    geoName: region,
    geoCode: `KR-${index.toString().padStart(2, '0')}`,
    ...Object.fromEntries(keywords.map(keyword => [keyword, getRandomNumber()]))
  }))
})

export async function POST(request: Request) {
  try {
    const { keywords } = await request.json()

    if (!keywords || !keywords.length) {
      return NextResponse.json(
        { error: '키워드를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 실제 API 호출 대신 가짜 데이터 반환
    const mockData = generateMockTrendsData(keywords)
    return NextResponse.json(mockData)

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}