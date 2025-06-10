import type {
  KakaoMap,
  KakaoLatLng,
  KakaoMarker,
  KakaoPolygon,
  KakaoCustomOverlay,
  KakaoLatLngBounds,
  KakaoMarkerClusterer,
  KakaoMapOptions,
  KakaoMarkerOptions,
  KakaoPolygonOptions,
  KakaoCustomOverlayOptions,
  KakaoMarkerClustererOptions
} from './kakao-maps';

declare global {
  interface Window {
    kakao: {
      maps: {
        LatLng: new (lat: number, lng: number) => KakaoLatLng;
        Map: new (container: HTMLElement, options: KakaoMapOptions) => KakaoMap;
        ZoomControl: new () => any;
        MapTypeControl: new () => any;
        LatLngBounds: new () => KakaoLatLngBounds;
        Marker: new (options: KakaoMarkerOptions) => KakaoMarker;
        Polygon: new (options: KakaoPolygonOptions) => KakaoPolygon;
        CustomOverlay: new (options: KakaoCustomOverlayOptions) => KakaoCustomOverlay;
        MarkerClusterer: new (options: KakaoMarkerClustererOptions) => KakaoMarkerClusterer;
        ControlPosition: {
          TOPRIGHT: any;
          RIGHT: any;
          TOP: any;
          BOTTOM: any;
          LEFT: any;
          CENTER: any;
        };
        MapTypeId: {
          ROADMAP: any;
          HYBRID: any;
          SATELLITE: any;
          TERRAIN: any;
        };
        event: {
          addListener: (target: KakaoMap | KakaoMarker | KakaoPolygon, type: string, handler: (...args: any[]) => void) => void;
          removeListener: (target: KakaoMap | KakaoMarker | KakaoPolygon, type: string, handler: (...args: any[]) => void) => void;
          trigger: (target: KakaoMap | KakaoMarker | KakaoPolygon, type: string, data?: any) => void;
        };
        services: any;
        clusterer: any;
        drawing: any;
        load: (callback: () => void) => void;
      };
    };
  }
} 