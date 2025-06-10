import { useRef, useEffect, useState, useCallback } from 'react';
import type {
  KakaoMap,
  KakaoMarker,
  KakaoPolygon,
  KakaoLatLng,
  KakaoMarkerClusterer,
  KakaoCustomOverlay,
  KakaoMapOptions,
  KakaoPolygonOptions,
  KakaoCustomOverlayOptions,
  KakaoPoint,
  KakaoMapProjection,
  KakaoMapAPI
} from '@/types/kakao-maps';
import { DistrictData } from '@/types/visualization';

interface UseKakaoMapProps {
  initialCenter?: { lat: number; lng: number };
  initialLevel?: number;
}

interface MarkerInfo {
  marker: KakaoMarker;
  overlay?: KakaoCustomOverlay;
}

interface MarkerContent {
  title: string;
  description: string;
}

// 스크립트 로드 상태를 전역으로 관리
let isScriptLoaded = false;

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('ko-KR', {
    notation: num > 9999 ? 'compact' : 'standard',
    maximumFractionDigits: 1
  }).format(num);
};

interface UseKakaoMapReturn {
  mapRef: React.RefObject<KakaoMap>;
  mapContainerRef: React.RefObject<HTMLDivElement>;
  clusterer: KakaoMarkerClusterer | null;
  currentPolygons: KakaoPolygon[];
  createPolygon: (path: KakaoLatLng[], options?: Partial<KakaoPolygonOptions>) => KakaoPolygon | null;
  createMarker: (position: KakaoLatLng, content?: { title: string; description: string }) => { marker: any; overlay?: KakaoCustomOverlay } | null;
  createDistrictOverlay: (position: KakaoLatLng, data: any, name: string) => KakaoCustomOverlay | null;
  resetMap: () => void;
  setCurrentPolygons: React.Dispatch<React.SetStateAction<KakaoPolygon[]>>;
  setCurrentMarkers: React.Dispatch<React.SetStateAction<MarkerInfo[]>>;
  isMapLoaded: boolean;
}

export function useKakaoMap({ 
  initialCenter = { lat: 37.545024, lng: 126.964831 },
  initialLevel = 3 
}: UseKakaoMapProps = {}): UseKakaoMapReturn {
  const mapRef = useRef<KakaoMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [clusterer, setClusterer] = useState<KakaoMarkerClusterer | null>(null);
  const [currentPolygons, setCurrentPolygons] = useState<KakaoPolygon[]>([]);
  const [currentMarkers, setCurrentMarkers] = useState<MarkerInfo[]>([]);
  const [currentOverlay, setCurrentOverlay] = useState<KakaoCustomOverlay | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // 지도 초기화 함수
  const initializeMap = useCallback(() => {
    if (!mapContainerRef.current || !window.kakao?.maps) return;

    // 카카오맵 API에 안전하게 접근하기 위한 타입 캐스팅
    const kakaoMaps = window.kakao.maps as unknown as KakaoMapAPI;
    
    const options: KakaoMapOptions = {
      center: new kakaoMaps.LatLng(initialCenter.lat, initialCenter.lng),
      level: initialLevel
    };

    const map = new kakaoMaps.Map(mapContainerRef.current, options);
    mapRef.current = map;

    // 컨트롤 추가
    const zoomControl = new kakaoMaps.ZoomControl();
    map.addControl(zoomControl, kakaoMaps.ControlPosition.RIGHT);

    const mapTypeControl = new kakaoMaps.MapTypeControl();
    map.addControl(mapTypeControl, kakaoMaps.ControlPosition.TOPRIGHT);

    // 클러스터러 초기화
    const newClusterer = new kakaoMaps.MarkerClusterer({
      map: map,
      averageCenter: true,
      minLevel: 5,
      disableClickZoom: true,
      styles: [{
        width: '50px',
        height: '50px',
        background: 'rgba(255, 80, 80, .8)',
        borderRadius: '25px',
        color: '#fff',
        textAlign: 'center',
        lineHeight: '50px',
        fontSize: '14px',
        fontWeight: 'bold'
      }]
    });

    setClusterer(newClusterer);
    setIsMapLoaded(true);
  }, [initialCenter, initialLevel]);

  // 카카오맵 스크립트 로드
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!isScriptLoaded) {
      const script = document.createElement('script');
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&libraries=services,clusterer&autoload=false`;
      script.async = true;

      script.onload = () => {
        // kakao.maps 객체를 안전하게 타입 캐스팅하여 사용
        (window.kakao.maps as any).load(() => {
          isScriptLoaded = true;
          initializeMap();
        });
      };

      document.head.appendChild(script);
    } else if (window.kakao?.maps) {
      initializeMap();
    }

    return () => {
      if (mapRef.current) {
        currentPolygons.forEach(polygon => polygon.setMap(null));
        currentMarkers.forEach(({ marker, overlay }) => {
          marker.setMap(null);
          if (overlay) overlay.setMap(null);
        });
        if (clusterer) clusterer.clear();
      }
    };
  }, []);

  // 폴리곤 생성 함수
  const createPolygon = useCallback((path: KakaoLatLng[], options: Partial<KakaoPolygonOptions> = {}) => {
    if (!mapRef.current || !window.kakao?.maps || !isMapLoaded) return null;

    // 안전한 타입 캐스팅
    const kakaoMaps = window.kakao.maps as unknown as KakaoMapAPI;
    
    const polygon = new kakaoMaps.Polygon({
      path,
      strokeWeight: 3,
      strokeColor: '#004c80',
      strokeOpacity: 0.8,
      fillColor: '#fff',
      fillOpacity: 0.3,
      ...options
    });

    polygon.setMap(mapRef.current);
    return polygon;
  }, [isMapLoaded]);

  // 마커 생성 함수
  const createMarker = useCallback((
    position: KakaoLatLng,
    content?: MarkerContent
  ): MarkerInfo | null => {
    if (!mapRef.current || !window.kakao?.maps || !isMapLoaded) return null;

    // 안전한 타입 캐스팅
    const kakaoMaps = window.kakao.maps as unknown as KakaoMapAPI;
    
    const marker = new kakaoMaps.Marker({ position });
    
    let overlay: KakaoCustomOverlay | undefined;
    
    if (content) {
      const overlayContent = document.createElement('div');
      overlayContent.className = 'bg-white p-3 rounded-lg shadow-lg text-sm';
      overlayContent.innerHTML = `
        <div class="font-semibold mb-1">${content.title}</div>
        <div class="text-gray-600">${content.description}</div>
      `;

      const overlayOptions: KakaoCustomOverlayOptions = {
        content: overlayContent,
        position: position,
        xAnchor: 0.5,
        yAnchor: 1.5
      };

      overlay = new kakaoMaps.CustomOverlay(overlayOptions);

      kakaoMaps.event.addListener(marker, 'click', () => {
        currentMarkers.forEach(({ overlay }) => {
          if (overlay) overlay.setMap(null);
        });
        overlay?.setMap(mapRef.current);
      });
    }

    return { marker, overlay };
  }, [currentMarkers, isMapLoaded]);

  // 폴리곤 중앙에 정보 표시 함수
  const createDistrictOverlay = useCallback((
    position: KakaoLatLng,
    data: DistrictData,
    name: string
  ) => {
    if (!mapRef.current || !window.kakao?.maps || !isMapLoaded) return null;

    // 안전한 타입 캐스팅
    const kakaoMaps = window.kakao.maps as unknown as KakaoMapAPI;
    
    // 기존 오버레이 제거
    if (currentOverlay) {
      currentOverlay.setMap(null);
    }

    const content = document.createElement('div');
    content.className = 'bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg text-sm min-w-[200px]';
    content.innerHTML = `
      <div class="font-semibold text-base mb-2 text-center">${name}</div>
      <div class="space-y-1">
        <div class="flex justify-between">
          <span class="text-gray-600">총 인구</span>
          <span class="font-medium">${formatNumber(data.tot_ppltn ?? 0)}명</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">직장인구</span>
          <span class="font-medium">${formatNumber(data.employee_cnt ?? 0)}명</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">총 가구</span>
          <span class="font-medium">${formatNumber(data.tot_house ?? 0)}가구</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">총 세대</span>
          <span class="font-medium">${formatNumber(data.tot_family ?? 0)}세대</span>
        </div>
        ${data.income ? `
          <div class="flex justify-between">
            <span class="text-gray-600">소득</span>
            <span class="font-medium">${formatNumber(data.income ?? 0)}만원</span>
          </div>
        ` : ''}
        ${data.consumption ? `
          <div class="flex justify-between">
            <span class="text-gray-600">소비</span>
            <span class="font-medium">${formatNumber(data.consumption ?? 0)}만원</span>
          </div>
        ` : ''}
      </div>
    `;

    const overlay = new kakaoMaps.CustomOverlay({
      content: content,
      position: position,
      xAnchor: 0.5,
      yAnchor: 0.5,
      zIndex: 3
    });

    overlay.setMap(mapRef.current);
    setCurrentOverlay(overlay);
    return overlay;
  }, [currentOverlay, isMapLoaded]);

  // 지도 초기화 함수
  const resetMap = useCallback(() => {
    if (!mapRef.current) return;

    // 모든 폴리곤과 마커 제거
    currentPolygons.forEach(polygon => polygon.setMap(null));
    setCurrentPolygons([]);

    currentMarkers.forEach(({ marker, overlay }) => {
      marker.setMap(null);
      if (overlay) overlay.setMap(null);
    });
    setCurrentMarkers([]);

    if (currentOverlay) {
      currentOverlay.setMap(null);
      setCurrentOverlay(null);
    }

    if (clusterer) {
      clusterer.clear();
    }
  }, [currentPolygons, currentMarkers, currentOverlay, clusterer]);

  return {
    mapRef,
    mapContainerRef,
    clusterer,
    currentPolygons,
    createPolygon,
    createMarker,
    createDistrictOverlay,
    resetMap,
    setCurrentPolygons,
    setCurrentMarkers,
    isMapLoaded
  };
} 