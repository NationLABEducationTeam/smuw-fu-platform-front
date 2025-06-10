import { NextResponse } from 'next/server';
import { fetchFromAPI, API_ENDPOINTS } from '@/utils/api';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await fetchFromAPI(API_ENDPOINTS.LOCATION, body);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}