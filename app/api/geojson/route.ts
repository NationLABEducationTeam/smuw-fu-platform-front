import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // URL에서 code 파라미터 추출
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    
    if (!code) {
      return NextResponse.json({ error: '행정동 코드가 필요합니다.' }, { status: 400 });
    }
    
    // 시도 코드 추출 (첫 2자리)
    const sidoCode = code.substring(0, 2);
    
    // 시도 코드별 파일 이름 맵핑
    const sidoMap: Record<string, string> = {
      '11': '서울특별시',
      '26': '부산광역시',
      '27': '대구광역시',
      '28': '인천광역시',
      '29': '광주광역시',
      '30': '대전광역',
      '31': '울산광역시',
      '36': '세종특별자치시',
      '41': '경기도',
      '42': '강원도',
      '43': '충청북도',
      '44': '충청남도',
      '45': '전라북도',
      '46': '전라남도',
      '47': '경상북도',
      '48': '경상남도',
      '50': '제주특별자치도'
    };
    
    const sidoName = sidoMap[sidoCode];
    
    if (!sidoName) {
      return NextResponse.json({ error: '유효하지 않은 시도 코드입니다.' }, { status: 400 });
    }
    
    // GeoJSON 파일 경로
    const filePath = path.join(process.cwd(), 'public', 'geojson', `hangjeongdong_${sidoName}.geojson`);
    
    // 파일 존재 확인
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: '해당 지역의 GeoJSON 파일을 찾을 수 없습니다.' }, { status: 404 });
    }
    
    // GeoJSON 파일 읽기
    const geojsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // 특정 행정동만 필터링
    const filteredFeatures = geojsonData.features.filter((feature: any) => {
      return feature.properties.adm_cd2 === code;
    });
    
    if (filteredFeatures.length === 0) {
      return NextResponse.json({ error: '해당 행정동 코드에 대한 데이터를 찾을 수 없습니다.' }, { status: 404 });
    }
    
    // 필터링된 GeoJSON 반환
    const filteredGeojson = {
      type: geojsonData.type,
      features: filteredFeatures
    };
    
    return NextResponse.json(filteredGeojson);
  } catch (error) {
    console.error('GeoJSON 처리 중 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 