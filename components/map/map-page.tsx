'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { MenuIcon, X, ArrowLeft, ArrowRight, Filter, LayersIcon, Compass, Users, DollarSign, BarChart, TrendingUp } from 'lucide-react'
import { useLocationSearch } from '@/hooks/useLocationSearch';
import { SearchResult, LocationResponse } from '@/types/search';
import { DistrictData } from '@/types/visualization';
import { FOOD_CATEGORIES, FoodCategoryCode } from '@/constants/food-categories';
import { SearchBar } from '@/components/map/search/search-bar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { AnalysisPanel } from '@/components/map/modals/analysis-panel';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from '@/components/common/layout/sidebar/nav-sidebar';
import { fetchFromAPI, API_ENDPOINTS } from '@/utils/api';
import { Loader } from '@/components/ui/loader';
import { SalesData } from '@/types/analysis';
import { GeoJSONResponse } from '@/types/geojson';
import { fetchDistrictInfo, fetchMoneyData, fetchSalesData } from '@/services/district';

// 카카오맵 관련 타입들을 확장하는 선언 추가
declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        Map: any;
        LatLng: any;
        Marker: any;
        InfoWindow: any;
        MarkerClusterer: any;
        LatLngBounds: any;
        Polygon: any;
        CustomOverlay: any;
        event: {
          addListener: (target: any, type: string, handler: Function) => void;
        };
      };
    };
  }
}

// 표시할 데이터 타입 정의
interface DistrictDataOption {
  key: keyof DistrictData | string;
  label: string;
  formatter?: (value: any) => string;
}

// DistrictData 인터페이스를 확장
interface ExtendedDistrictData extends DistrictData {
  population?: number;
  area?: number;
}

// GeoJSON Feature 인터페이스 추가
interface GeoJSONFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
  properties: {
    adm_cd2: string;
    [key: string]: any;
  };
}

interface SelectedLocation {
  name: string;
  administrative_code: string;
  population_code: string;
  moneyData?: {
    income: number;
    consumption: number;
  };
}

interface Restaurant {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

const getSidoName = (admCode: string): string => {
  const sidoCode = admCode.slice(0, 2);
  const sidoMap: { [key: string]: string } = {
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
  return sidoMap[sidoCode] || '';
};

interface Point {
  x: number;
  y: number;
}

// Centroid 알고리즘 함수 추가
const findCentroid = (points: { x: number; y: number }[]) => {
  let area = 0;
  let x = 0;
  let y = 0;

  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const point1 = points[i];
    const point2 = points[j];
    const f = point1.x * point2.y - point2.x * point1.y;
    area += f;
    x += (point1.x + point2.x) * f;
    y += (point1.y + point2.y) * f;
  }

  area /= 2;
  area = Math.abs(area);
  x /= (6 * area);
  y /= (6 * area);

  return { x, y };
};

// API_ENDPOINTS에 GEOJSON 추가 (파일 상단에 추가)
const extendedAPIEndpoints = {
  ...API_ENDPOINTS,
  GEOJSON: '/api/geojson'
};

// 추가: 표시할 데이터 타입 정의
interface DistrictDataOption {
  key: keyof ExtendedDistrictData | string;
  label: string;
}

// 카테고리 필터 모달
export function MapPage() {
  // 사이드바 상태 관리
  const { isSidebarOpen } = useSidebar();
  
  // 상태 관리
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<any>(null);
  const clustererRef = useRef<any>(null);
  const currentPolygonsRef = useRef<any[]>([]);
  const currentOverlaysRef = useRef<any[]>([]);
  
  const [isMobile, setIsMobile] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(true);
  const [isAnalysisPanelOpen, setIsAnalysisPanelOpen] = useState(false);
  const [isAnalysisPanelCollapsed, setIsAnalysisPanelCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDataOption, setSelectedDataOption] = useState<DistrictDataOption>({
    key: 'tot_ppltn',
    label: '총 인구',
    formatter: (value) => `${Number(value).toLocaleString()}명`
  });
  const [selectedCategory, setSelectedCategory] = useState<FoodCategoryCode | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [districtData, setDistrictData] = useState<DistrictData | null>(null);
  const [salesData, setSalesData] = useState<SalesData | null>(null);

  // 검색 관련 훅
  const { 
    searchTerm, 
    setSearchTerm, 
    searchState, 
    handleSelectLocation: handleLocationSearchSelect, 
    searchLocation, 
    resetSearch 
  } = useLocationSearch();

  // 모바일 화면 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      
      // 모바일에서는 기본적으로 검색 패널 닫기
      if (window.innerWidth < 768) {
        setIsSearchOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Kakao 맵 초기화
  useEffect(() => {
    if (typeof window !== 'undefined' && !mapLoaded) {
      window.kakao.maps.load(() => {
        const container = document.getElementById('map');
        if (!container) return;
        
        const options = {
          center: new window.kakao.maps.LatLng(37.5665, 126.9780),
          level: 8
        };
        
        const map = new window.kakao.maps.Map(container, options);
        mapRef.current = map;
        
        // 클러스터러 초기화
        const clusterer = new window.kakao.maps.MarkerClusterer({
          map: map,
          averageCenter: true,
          minLevel: 5
        });
        clustererRef.current = clusterer;
        
        setMapLoaded(true);
      });
    }
  }, [mapLoaded]);

  // 지도 리셋 함수
  const resetMap = useCallback(() => {
    // 기존 오버레이 제거
    currentOverlaysRef.current.forEach(overlay => {
      overlay.setMap(null);
    });
    currentOverlaysRef.current = [];
    
    // 기존 폴리곤 제거
    currentPolygonsRef.current.forEach(polygon => {
      polygon.setMap(null);
    });
    currentPolygonsRef.current = [];
    
    // 선택된 메트릭 초기화
    setSelectedMetric(null);
    
    // 클러스터러 초기화
    if (clustererRef.current) {
      clustererRef.current.clear();
    }
  }, []);

  // 폴리곤과 오버레이 설정 로직
  const createPolygon = useCallback((paths: any[], properties: any = {}) => {
    if (!mapRef.current) return null;
    
    const polygon = new window.kakao.maps.Polygon({
      path: paths,
      strokeWeight: 2,
      strokeColor: '#F44336',
      strokeOpacity: 1,
      strokeStyle: 'solid',
      fillColor: '#F44336',
      fillOpacity: 0.3
    });
    
    polygon.setMap(mapRef.current);
    currentPolygonsRef.current.push(polygon);
    
    return polygon;
  }, []);

  // 표시 가능한 데이터 옵션들
  const dataOptions = useMemo<DistrictDataOption[]>(() => [
    { key: 'tot_ppltn', label: '총 인구', formatter: (value) => `${Number(value).toLocaleString()}명` },
    { key: 'employee_cnt', label: '직장인구', formatter: (value) => `${Number(value).toLocaleString()}명` },
    { key: 'corp_cnt', label: '기업 수', formatter: (value) => `${Number(value).toLocaleString()}개` },
    { key: 'ppltn_dnsty', label: '인구 밀도', formatter: (value) => `${Number(value).toLocaleString()}명/km²` },
    { key: 'avg_age', label: '평균 나이', formatter: (value) => `${value}세` },
    { key: 'tot_family', label: '총 가구 수', formatter: (value) => `${Number(value).toLocaleString()}가구` },
    { key: 'avg_fmember_cnt', label: '가구당 평균 인원', formatter: (value) => `${value}명` },
    { key: 'oldage_suprt_per', label: '노인 부양 비율', formatter: (value) => `${value}%` }
  ], []);

  // 구역 정보 오버레이 생성 - API 데이터를 완전히 수정
  const createDistrictOverlay = useCallback((position: any, text: string, data?: any) => {
    if (!mapRef.current) return null;
    
    console.log('오버레이 생성 시작 - 원본 데이터:', data);
    
    // API 응답 데이터 구조 확인 및 처리
    let processedData: any = null;
    
    // API 응답 구조 확인 (statusCode, body 등)
    if (data?.statusCode === 200 && data?.body) {
      try {
        // body가 문자열인 경우 파싱
        const bodyData = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
        console.log('bodyData 확인:', bodyData);
        
        // result 배열이 있는지 확인
        if (bodyData?.result && Array.isArray(bodyData.result) && bodyData.result.length > 0) {
          processedData = bodyData.result[0];
          console.log('추출된 데이터:', processedData);
        } else {
          processedData = bodyData;
        }
      } catch (error) {
        console.error('데이터 파싱 오류:', error);
      }
    } else if (data?.result && Array.isArray(data.result) && data.result.length > 0) {
      // 이미 파싱된 데이터에서 result 배열이 있는 경우
      processedData = data.result[0];
      console.log('이미 파싱된 데이터에서 추출:', processedData);
    } else {
      // 그 외의 경우 원본 데이터 사용
      processedData = data;
    }
    
    console.log('최종 처리된 데이터:', processedData);
    
    const content = document.createElement('div');
    content.className = 'district-overlay';
    
    // 데이터에 따른 텍스트 생성
    let dataText = '';
    
    // 데이터가 있는 경우에만 처리
    if (processedData && selectedDataOption) {
      // 키 이름을 문자열로 변환하여 데이터에서 값을 찾음
      const keyStr = selectedDataOption.key.toString();
      let value = processedData[keyStr];
      
      console.log(`데이터 검색 중: 키=${keyStr}, 값=${value}`);
      
      if (value !== undefined && value !== null && value !== 'N/A') {
        // 문자열을 숫자로 변환 시도
        if (typeof value === 'string' && !isNaN(Number(value))) {
          value = Number(value);
        }
        
        const formattedValue = selectedDataOption.formatter ? 
          selectedDataOption.formatter(value) : 
          value.toString();
        
        dataText = `<div class="font-bold text-blue-600 text-center mt-1">${formattedValue}</div>`;
      }
    }
    
    // 강조된 스타일의 오버레이 생성
    content.innerHTML = `
      <div class="bg-white px-4 py-2 rounded-lg shadow-md text-sm">
        <div class="font-medium text-center">${text}</div>
        ${dataText}
        <div class="text-xs text-gray-500 text-center mt-1">
          ${selectedDataOption ? selectedDataOption.label : ''}
        </div>
      </div>
    `;
    
    const overlay = new window.kakao.maps.CustomOverlay({
      position: position,
      content: content,
      yAnchor: 1.5
    });
    
    overlay.setMap(mapRef.current);
    currentOverlaysRef.current.push(overlay);
    
    return overlay;
  }, [mapRef, selectedDataOption]);

  // 마커 생성 함수
  const createMarker = useCallback((position: any, title: string) => {
    if (!mapRef.current) return null;
    
    const marker = new window.kakao.maps.Marker({
      position: position,
      title: title
    });
    
    return marker;
  }, []);

  // 마커 정보창 생성 함수
  const createInfoWindow = useCallback((marker: any, content: string) => {
    if (!mapRef.current) return null;
    
    const infowindow = new window.kakao.maps.InfoWindow({
      content: content
    });
    
    // 심플한 함수 식으로 변경하여 순환 참조 방지
    window.kakao.maps.event.addListener(marker, 'click', function() {
      infowindow.open(mapRef.current, marker);
    });
    
    return infowindow;
  }, []);

  // 현재 폴리곤 저장
  const setCurrentPolygons = useCallback((polygons: any[]) => {
    currentPolygonsRef.current = polygons;
  }, []);

  // 지역 정보 가져오기 (API 응답 구조에 맞게 수정)
  const fetchDistrictInfo = async (populationCode: string) => {
    try {
      console.log(`동 정보 요청: ${populationCode}`);
      
      // adm_cd 파라미터로 API 호출
      const response = await fetchFromAPI<any>(API_ENDPOINTS.DONGINFO, { 
        adm_cd: populationCode 
      });
      
      console.log('동 정보 응답 원본:', response);
      
      return response; // 원본 응답 그대로 반환
    } catch (error) {
      console.error('지역 정보 로드 중 오류:', error);
      return null;
    }
  };

  // 지역 선택 핸들러 - population_code 파라미터 사용
  const handleLocationSelect = useCallback(async (result: SearchResult) => {
    try {
      setIsLoading(true);
      
      // handleLocationSearchSelect 함수를 사용하여 필요한 코드와 데이터를 가져옵니다
      const locationData = await handleLocationSearchSelect(result);
      
      // 최소한의 로깅만 남기고 순환 참조 방지
      console.log(`선택된 위치: ${locationData.name} (${locationData.administrative_code})`);
      
      setSelectedLocation(locationData);

      resetMap();
      setSelectedMetric(null);

      // 지역 정보 가져오기 - 한 번만 API 호출하고 저장 (population_code 사용)
      const districtData = await fetchDistrictInfo(locationData.population_code);
      setDistrictData(districtData);

      // 지역 다각형 불러오기 (순환 참조 없이 간단하게 변경)
      const geoJSONResponse = await fetch(`${extendedAPIEndpoints.GEOJSON}?code=${locationData.administrative_code}`);
      const geoJSON: GeoJSONResponse = await geoJSONResponse.json();

      // 최소한의 로깅으로 변경 (순환 참조 방지)
      console.log(`GeoJSON 데이터 로드: ${geoJSON?.features?.length || 0}개 요소`);

      if (geoJSON?.features?.[0]) {
        const { coordinates, type } = geoJSON.features[0].geometry;
        let paths: any[] = [];

        if (type === 'MultiPolygon') {
          // MultiPolygon 형태
          const multiPaths: any[] = (coordinates as number[][][][]).map(polygon => {
            return polygon[0].map((coord: number[]) => new window.kakao.maps.LatLng(coord[1], coord[0]));
          });
          
          paths = multiPaths[0]; // 첫 번째 다각형만 사용
        } else {
          // Polygon 형태
          paths = (coordinates as number[][][])[0].map((coord: number[]) => 
            new window.kakao.maps.LatLng(coord[1], coord[0])
          );
        }

        // 폴리곤 생성
        const polygon = createPolygon(paths);
        setCurrentPolygons([polygon]);
        
        // 지도 중심과 줌 레벨 설정
        if (mapRef.current && paths.length > 0) {
          const bounds = new window.kakao.maps.LatLngBounds();
          
          paths.forEach(path => {
            bounds.extend(path);
          });
          
          mapRef.current.setBounds(bounds);
          
          // 구역 중심에 오버레이 표시 - districtData를 직접 사용
          const points = paths.map(path => ({ x: path.getLng(), y: path.getLat() }));
          const centroid = findCentroid(points);
          
          if (centroid) {
            const position = new window.kakao.maps.LatLng(centroid.y, centroid.x);
            createDistrictOverlay(position, locationData.name, districtData || undefined);
          }
        }
      }
      
      // 추가: 행정동이 선택되면 바로 분석 데이터 가져오기
      try {
        console.log('행정동 선택 후 자동 분석 데이터 로드 시작:', locationData.administrative_code);
        
        // Lambda URL에서 데이터 가져오기
        const salesData = await fetchSalesData(locationData.administrative_code);
        
        if (salesData) {
          console.log('자동 로드된 분석 데이터:', salesData);
          setSalesData(salesData);
          
          // 분석 패널 자동으로 열기 (펼친 상태로)
          setIsAnalysisPanelOpen(true);
          setIsAnalysisPanelCollapsed(false); // 펼친 상태로 설정
          setSelectedMetric('sales_volume'); // 기본 메트릭 선택
        } else {
          console.warn('분석 데이터를 가져올 수 없습니다:', locationData.administrative_code);
        }
      } catch (analysisError) {
        console.error('자동 분석 데이터 로드 오류:', analysisError);
        // 오류가 있어도 계속 진행
      }
      
    } catch (error) {
      console.error('지역 선택 중 오류:', error);
    } finally {
      setIsLoading(false);
    }
  }, [createDistrictOverlay, createPolygon, mapRef, resetMap, setCurrentPolygons, handleLocationSearchSelect]);

  // 카테고리 선택 핸들러
  const handleCategorySelect = (category: FoodCategoryCode | null) => {
    setSelectedCategory(category);
  };

  // 카테고리 적용 핸들러
  const handleCategoryApply = useCallback(async () => {
    if (!selectedLocation || !selectedCategory) return;

    try {
      setIsLoading(true);
      setIsModalOpen(false);

      // API가 필요로 하는 파라미터 형식으로 변경
      // 행정동 코드(10자리)에서 마지막 2자리를 제외한 8자리 코드 사용
      const adminCode = selectedLocation.administrative_code;
      const key = adminCode.substring(0, 8);

      console.log(`음식점 데이터 요청: 지역코드 ${key}, 카테고리 ${selectedCategory}`);

      const response = await fetchFromAPI<any>(
        API_ENDPOINTS.STORE,
        {
          key: key,
          indsSclsCd: selectedCategory
        }
      );

      console.log('API 응답:', response);

      // 지도의 기존 마커 제거
      if (clustererRef.current) {
        clustererRef.current.clear();
      }

      // API 응답 구조 처리 (body가 문자열인 경우 처리)
      let items = [];
      
      // 응답 구조 처리
      if (response && response.body) {
        // body가 문자열인 경우
        if (typeof response.body === 'string') {
          try {
            const bodyData = JSON.parse(response.body);
            console.log('파싱된 body 데이터:', bodyData);
            items = bodyData.items || [];
          } catch (error) {
            console.error('body 파싱 오류:', error);
          }
        } 
        // body가 이미 객체인 경우
        else if (typeof response.body === 'object') {
          items = response.body.items || [];
        }
      } 
      // 다른 응답 형식 (items가 직접 있는 경우)
      else if (response && Array.isArray(response.items)) {
        items = response.items;
      }
      // 응답 자체가 배열인 경우
      else if (Array.isArray(response)) {
        items = response;
      }
      
      console.log('처리된 음식점 데이터:', items);
      
      if (items.length > 0) {
        console.log(`${items.length}개의 음식점 데이터 로드됨`);
        
        // 마커 생성 및 추가
        const markers = items.map((item: Restaurant | any) => {
          if (!item.latitude || !item.longitude) {
            console.warn(`유효하지 않은 좌표: ${JSON.stringify(item)}`);
            return null;
          }
          
          // 좌표 변환
          const position = new window.kakao.maps.LatLng(item.latitude, item.longitude);
          
          // 마커 생성
          const marker = createMarker(position, item.name);
          
          // 정보창 내용
          const content = `
            <div class="p-2 text-sm max-w-[250px]">
              <div class="font-bold mb-1">${item.name}</div>
              <div class="text-gray-600 text-xs">${item.address || ''}</div>
            </div>
          `;
          
          // 정보창 생성
          createInfoWindow(marker, content);
          
          return marker;
        }).filter(Boolean); // null 값 제거
        
        // 클러스터러에 마커 추가
        if (clustererRef.current && markers.length > 0) {
          clustererRef.current.addMarkers(markers);
          console.log(`${markers.length}개의 마커가 지도에 추가됨`);
          
          // 지도 영역 조정
          const bounds = new window.kakao.maps.LatLngBounds();
          markers.forEach((marker: any) => {
            if (marker) {
              bounds.extend(marker.getPosition());
            }
          });
          
          mapRef.current.setBounds(bounds);
        } else {
          console.warn('마커 또는 클러스터러가 생성되지 않았습니다.');
        }
      } else {
        console.warn('음식점 데이터가 없습니다:', response);
      }
    } catch (error) {
      console.error('음식점 데이터 로드 중 오류:', error);
    } finally {
      setIsLoading(false);
    }
  }, [clustererRef, createInfoWindow, createMarker, mapRef, selectedCategory, selectedLocation]);

  // 메트릭 선택 핸들러 (분석 패널 열기)
  const handleMetricSelect = async (metric: string) => {
    if (!selectedLocation) return;
    
    setSelectedMetric(metric);
    setIsLoading(true);
    
    try {
      // Lambda URL에서 직접 데이터 가져오기
      const data = await fetchSalesData(selectedLocation.administrative_code);
      
      if (data) {
        console.log('Lambda URL 데이터 수신됨:', data);
        setSalesData(data);
        setIsAnalysisPanelOpen(true);
        setIsAnalysisPanelCollapsed(false); // 패널을 펼친 상태로 설정
      } else {
        console.error('데이터를 불러올 수 없습니다');
        alert('분석 데이터를 불러올 수 없습니다.');
      }
    } catch (error) {
      console.error('메트릭 데이터 로딩 오류:', error);
      alert('분석 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 메트릭 라벨 가져오기
  const getMetricLabel = (metricId: string): string => {
    const metrics: Record<string, string> = {
      'sales_volume': '매출 규모',
      'customer_count': '고객 수',
      'price_index': '가격 지수',
      'growth_rate': '성장률'
    };
    
    return metrics[metricId] || metricId;
  };

  // 필터 모달 토글
  const toggleFilterModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // 분석 패널 닫기 (이제는 접기로 변경)
  const handleAnalysisPanelClose = () => {
    // 패널을 닫는 대신 접은 상태로 전환
    setIsAnalysisPanelCollapsed(true);
  };

  // 분석 패널 토글 (접기/펼치기)
  const toggleAnalysisPanel = () => {
    if (isAnalysisPanelCollapsed) {
      setIsAnalysisPanelCollapsed(false);
    } else {
      setIsAnalysisPanelCollapsed(true);
    }
  };

  // 검색 패널 토글
  const toggleSearchPanel = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  // 지도 초기화 함수 (호출 시 선택된 모든 것 초기화)
  const resetMapView = () => {
    resetMap();
    setSelectedLocation(null);
    setDistrictData(null);
    setSelectedCategory(null);
    setSelectedMetric(null);
    setIsAnalysisPanelOpen(false);
    setIsAnalysisPanelCollapsed(false); // 패널 접힘 상태도 초기화
    resetSearch();
    
    // 초기 지도 위치로
    if (mapRef.current) {
      mapRef.current.setCenter(new window.kakao.maps.LatLng(37.5665, 126.9780));
      mapRef.current.setLevel(8);
    }
  };

  // 이제 FOOD_CATEGORIES를 배열로 변환하는 코드 추가
  const FOOD_CATEGORIES_ARRAY = Object.entries(FOOD_CATEGORIES).map(([code, name]) => ({
    code: code as FoodCategoryCode,
    name
  }));

  // 데이터 옵션 변경 핸들러 개선
  const handleDataOptionChange = useCallback((option: DistrictDataOption) => {
    console.log('데이터 옵션 변경:', option);
    setSelectedDataOption(option);
    
    // 현재 오버레이를, 새로운 데이터 옵션으로 업데이트
    if (selectedLocation && districtData) {
      console.log('오버레이 업데이트 시작:', { 
        location: selectedLocation, 
        option: option,
        data: districtData 
      });
      
      // 기존 오버레이 제거
      currentOverlaysRef.current.forEach(overlay => {
        overlay.setMap(null);
      });
      currentOverlaysRef.current = [];
      
      // 폴리곤 중심점 계산
      const polygon = currentPolygonsRef.current[0];
      if (polygon && mapRef.current) {
        const path = polygon.getPath();
        const points = path.map((latLng: any) => ({ 
          x: latLng.getLng(), 
          y: latLng.getLat() 
        }));
        
        const centroid = findCentroid(points);
        if (centroid) {
          const position = new window.kakao.maps.LatLng(centroid.y, centroid.x);
          createDistrictOverlay(position, selectedLocation.name, districtData);
        }
      }
    }
  }, [createDistrictOverlay, selectedLocation, districtData, mapRef]);

  return (
    // 전체 컨테이너 - 지도를 전체 화면으로 설정
    <div className="relative h-screen w-full overflow-hidden">
      {/* 지도 컨테이너 - 레이아웃 수정 */}
      <div 
        id="map" 
        className="absolute inset-0 w-full h-full z-10"
        style={{ 
          width: '100%', 
          height: '100%'
        }}
      />

      {/* 패널 토글 버튼 위치와 디자인 수정 */}
      <div className="absolute top-4 left-16 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Button 
            size="icon" 
            variant="secondary" 
            className="bg-white/90 backdrop-blur-md shadow-lg border-0 h-10 w-10"
            onClick={toggleSearchPanel}
          >
            {isMobile ? (
              isSearchOpen ? <X size={18} /> : <MenuIcon size={18} />
            ) : (
              isSearchOpen ? <ArrowLeft size={18} /> : <ArrowRight size={18} />
            )}
          </Button>
        </motion.div>
      </div>

      {/* 지도 컨트롤 버튼 */}
      <div className="absolute top-4 right-4 z-40 flex flex-col gap-2">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Button 
            size="icon" 
            variant="secondary" 
            className="bg-white/80 backdrop-blur-md shadow-lg border-0 h-10 w-10"
            onClick={resetMapView}
          >
            <Compass size={18} />
          </Button>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Button 
            size="icon" 
            variant="secondary" 
            className="bg-white/80 backdrop-blur-md shadow-lg border-0 h-10 w-10"
            onClick={toggleFilterModal}
            disabled={!selectedLocation}
          >
            <Filter size={18} />
          </Button>
        </motion.div>
      </div>

      {/* 검색 패널 (플로팅 스타일로 수정) */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            className="absolute top-4 left-28 z-50 w-[320px] max-h-[calc(100vh-2rem)]
              bg-white/95 backdrop-blur-sm rounded-lg shadow-lg overflow-auto"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-4">
              <SearchBar 
                searchTerm={searchTerm}
                onSearchTermChange={setSearchTerm}
                isLoading={searchState.isLoading}
                error={searchState.error}
                results={searchState.results}
                onSearch={async (e?: React.FormEvent) => {
                  if (e) e.preventDefault();
                  await searchLocation(searchTerm);
                }}
                onSearchClick={() => {}}
                onSelectResult={handleLocationSelect}
              />
              
              {selectedLocation && (
                <motion.div 
                  className="mt-4 space-y-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  {/* 선택된 행정동 헤더 섹션 */}
                  <div className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px]">
                    <h2 className="text-xl font-bold text-white mb-1">
                      {selectedLocation.name}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-white/20 text-white rounded-full px-2 py-0.5">
                        {selectedLocation.administrative_code}
                      </span>
                      {selectedCategory && (
                        <Badge variant="secondary" className="text-xs">
                          {FOOD_CATEGORIES_ARRAY.find(c => c.code === selectedCategory)?.name || '선택됨'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* 핵심 통계 데이터 */}
                  {districtData && (
                    <>
                      <div className="rounded-lg p-3 hover:bg-gray-50 transition-colors duration-200">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                          <Users className="w-4 h-4 text-blue-500" />
                          인구 통계
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white rounded-lg shadow-sm border p-3 flex flex-col hover:shadow-md hover:border-blue-200 transition-all duration-200">
                            <span className="text-xs text-gray-500 mb-1">총 인구</span>
                            <span className="font-medium text-base">
                              {(districtData as ExtendedDistrictData).tot_ppltn 
                                ? `${Number((districtData as ExtendedDistrictData).tot_ppltn).toLocaleString()}명` 
                                : <span className="text-gray-400 text-sm italic">정보 없음</span>}
                            </span>
                          </div>
                          <div className="bg-white rounded-lg shadow-sm border p-3 flex flex-col hover:shadow-md hover:border-blue-200 transition-all duration-200">
                            <span className="text-xs text-gray-500 mb-1">면적</span>
                            <span className="font-medium text-base">
                              {(districtData as ExtendedDistrictData).area 
                                ? `${Number((districtData as ExtendedDistrictData).area).toLocaleString()}km²` 
                                : <span className="text-gray-400 text-sm italic">정보 없음</span>}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {selectedLocation.moneyData && (
                        <div className="rounded-lg p-3 hover:bg-gray-50 transition-colors duration-200">
                          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-green-500" />
                            경제 데이터
                          </h3>
                          <div className="space-y-2">
                            <div className="bg-white rounded-lg shadow-sm border p-3 hover:shadow-md hover:border-green-200 transition-all duration-200">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">월 평균 소득</span>
                                <span className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-0.5">소득</span>
                              </div>
                              <span className="font-medium text-base mt-1 block">
                                {selectedLocation.moneyData.income.toLocaleString()}만원
                              </span>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border p-3 hover:shadow-md hover:border-blue-200 transition-all duration-200">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">월 평균 소비</span>
                                <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">소비</span>
                              </div>
                              <span className="font-medium text-base mt-1 block">
                                {(selectedLocation.moneyData.consumption / 10000).toLocaleString()}만원
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* 데이터 시각화 옵션 */}
                      <div className="rounded-lg p-3 hover:bg-gray-50 transition-colors duration-200">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                          <BarChart className="w-4 h-4 text-purple-500" />
                          폴리곤 데이터 시각화
                        </h3>
                        <div className="bg-white rounded-lg p-3 border shadow-sm hover:shadow-md transition-all duration-200">
                          <div className="flex flex-wrap gap-1">
                            {dataOptions.map((option) => (
                              <Badge 
                                key={option.key} 
                                variant={selectedDataOption.key === option.key ? "default" : "outline"}
                                className={`cursor-pointer transition-all duration-200 ${selectedDataOption.key === option.key 
                                  ? "bg-blue-500 hover:bg-blue-600" 
                                  : "hover:bg-gray-100"}`}
                                onClick={() => handleDataOptionChange(option)}
                              >
                                {option.label}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* 액션 버튼 */}
                  <div className="mt-2 space-y-2">
                    <Button 
                      onClick={toggleFilterModal} 
                      className="w-full bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow transition-all duration-200 hover:translate-y-[-1px]"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      업종 필터 설정
                    </Button>
                    
                    {selectedMetric ? (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsAnalysisPanelOpen(true);
                          setIsAnalysisPanelCollapsed(false);
                        }}
                        className="w-full border-blue-500 text-blue-600 hover:bg-blue-50 shadow-sm hover:shadow transition-all duration-200 hover:translate-y-[-1px]"
                      >
                        <BarChart className="w-4 h-4 mr-2" />
                        {getMetricLabel(selectedMetric)} 분석 보기
                      </Button>
                    ) : (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline"
                            className="w-full hover:shadow transition-all duration-200 hover:translate-y-[-1px]"
                          >
                            <BarChart className="w-4 h-4 mr-2" />
                            데이터 분석 선택
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2">
                          <div className="flex flex-col gap-1 min-w-[150px]">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="justify-start font-normal hover:bg-green-50 hover:text-green-700 transition-colors duration-200"
                              onClick={() => handleMetricSelect('sales_volume')}
                            >
                              <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                              매출 규모
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="justify-start font-normal hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
                              onClick={() => handleMetricSelect('customer_count')}
                            >
                              <Users className="w-4 h-4 mr-2 text-blue-500" />
                              고객 수
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="justify-start font-normal hover:bg-amber-50 hover:text-amber-700 transition-colors duration-200"
                              onClick={() => handleMetricSelect('price_index')}
                            >
                              <DollarSign className="w-4 h-4 mr-2 text-amber-500" />
                              가격 지수
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="justify-start font-normal hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200"
                              onClick={() => handleMetricSelect('growth_rate')}
                            >
                              <TrendingUp className="w-4 h-4 mr-2 text-purple-500" />
                              성장률
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 분석 패널은 그대로 유지 */}
      <AnalysisPanel 
        isOpen={isAnalysisPanelOpen} 
        onClose={handleAnalysisPanelClose} 
        data={salesData} 
        isCollapsed={isAnalysisPanelCollapsed}
        onToggle={toggleAnalysisPanel}
      />

      {/* 카테고리 필터 모달 */}
      <Modal title="업종 필터" isOpen={isModalOpen} onClose={toggleFilterModal}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 my-4">
          {FOOD_CATEGORIES_ARRAY.map(category => (
            <Button
              key={category.code}
              variant={selectedCategory === category.code ? "default" : "outline"}
              className="justify-start"
              onClick={() => handleCategorySelect(category.code)}
            >
              {category.name}
            </Button>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button 
            variant="outline" 
            onClick={() => handleCategorySelect(null)}
          >
            초기화
          </Button>
          <Button 
            onClick={handleCategoryApply}
            disabled={!selectedCategory}
          >
            적용
          </Button>
        </div>
      </Modal>

      {/* 로딩 인디케이터 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/10 backdrop-blur-sm">
          <Loader size="lg" />
        </div>
      )}
    </div>
  );
}

export default MapPage;