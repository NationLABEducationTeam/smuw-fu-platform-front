export interface KakaoLatLng {
  getLat(): number;
  getLng(): number;
  equals(latlng: KakaoLatLng): boolean;
  toString(): string;
}

export interface KakaoLatLngBounds {
  extend(latlng: KakaoLatLng): void;
  getSouthWest(): KakaoLatLng;
  getNorthEast(): KakaoLatLng;
  toString(): string;
  equals(bounds: KakaoLatLngBounds): boolean;
  contain(latlng: KakaoLatLng): boolean;
  getCenter(): KakaoLatLng;
  union(bounds: KakaoLatLngBounds): KakaoLatLngBounds;
}

export interface KakaoMapOptions {
  center: KakaoLatLng;
  level?: number;
  mapTypeId?: string;
  draggable?: boolean;
  scrollwheel?: boolean;
  zoomable?: boolean;
}

export interface KakaoMap {
  setCenter(latlng: KakaoLatLng): void;
  getCenter(): KakaoLatLng;
  setLevel(level: number, options?: { animate: boolean }): void;
  getLevel(): number;
  setMapTypeId(mapTypeId: string): void;
  getMapTypeId(): string;
  setBounds(bounds: KakaoLatLngBounds, paddingTop?: number, paddingRight?: number, paddingBottom?: number, paddingLeft?: number): void;
  getBounds(): KakaoLatLngBounds;
  addControl(control: any, position: any): void;
  removeControl(control: any): void;
  setDraggable(draggable: boolean): void;
  getDraggable(): boolean;
  setZoomable(zoomable: boolean): void;
  getZoomable(): boolean;
  relayout(): void;
  getProjection(): KakaoMapProjection;
}

export interface KakaoMapProjection {
  containerPointFromCoords(latlng: KakaoLatLng): KakaoPoint;
  coordsFromContainerPoint(point: KakaoPoint): KakaoLatLng;
}

export interface KakaoPoint {
  x: number;
  y: number;
}

export interface KakaoPolygon {
  setMap(map: KakaoMap | null): void;
  getMap(): KakaoMap;
  setPath(path: KakaoLatLng[] | KakaoLatLng[][]): void;
  getPath(): KakaoLatLng[];
  setOptions(options: KakaoPolygonOptions): void;
}

export interface KakaoPolygonOptions {
  map?: KakaoMap;
  path: KakaoLatLng[] | KakaoLatLng[][];
  strokeWeight?: number;
  strokeColor?: string;
  strokeOpacity?: number;
  strokeStyle?: string;
  fillColor?: string;
  fillOpacity?: number;
  zIndex?: number;
}

export interface KakaoCustomOverlay {
  setMap(map: KakaoMap | null): void;
  getMap(): KakaoMap;
  setPosition(position: KakaoLatLng): void;
  getPosition(): KakaoLatLng;
  setContent(content: string | HTMLElement): void;
  getContent(): string | HTMLElement;
  setVisible(visible: boolean): void;
  getVisible(): boolean;
}

export interface KakaoCustomOverlayOptions {
  map?: KakaoMap;
  position: KakaoLatLng;
  content: string | HTMLElement;
  xAnchor?: number;
  yAnchor?: number;
  zIndex?: number;
  clickable?: boolean;
}

export interface KakaoMarker {
  setMap(map: KakaoMap | null): void;
  getMap(): KakaoMap;
  setPosition(position: KakaoLatLng): void;
  getPosition(): KakaoLatLng;
  setVisible(visible: boolean): void;
  getVisible(): boolean;
  setZIndex(zIndex: number): void;
  getZIndex(): number;
  setTitle(title: string): void;
  getTitle(): string;
}

export interface KakaoMarkerClusterer {
  addMarkers(markers: KakaoMarker[]): void;
  removeMarkers(markers: KakaoMarker[]): void;
  clear(): void;
}

export interface KakaoMapAPI {
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  LatLngBounds: new () => KakaoLatLngBounds;
  CustomOverlay: new (options: KakaoCustomOverlayOptions) => KakaoCustomOverlay;
  Polygon: new (options: KakaoPolygonOptions) => KakaoPolygon;
  Point: new (x: number, y: number) => KakaoPoint;
  Map: new (container: HTMLElement, options: KakaoMapOptions) => KakaoMap;
  MapProjection: new () => KakaoMapProjection;
  Marker: new (options: { position: KakaoLatLng }) => KakaoMarker;
  MarkerClusterer: new (options: {
    map: KakaoMap;
    averageCenter?: boolean;
    minLevel?: number;
    disableClickZoom?: boolean;
    styles?: Array<{
      width?: string;
      height?: string;
      background?: string;
      borderRadius?: string;
      color?: string;
      textAlign?: string;
      fontSize?: string;
      lineHeight?: string;
      fontWeight?: string;
    }>;
  }) => KakaoMarkerClusterer;
  event: {
    addListener: (target: any, type: string, handler: (...args: any[]) => void) => void;
    removeListener: (target: any, type: string, handler: (...args: any[]) => void) => void;
  };
  ControlPosition: {
    TOP: number;
    TOPLEFT: number;
    TOPRIGHT: number;
    LEFT: number;
    RIGHT: number;
    BOTTOM: number;
    BOTTOMLEFT: number;
    BOTTOMRIGHT: number;
  };
  ZoomControl: new () => any;
  MapTypeControl: new () => any;
  load: (callback: () => void) => void;
}

// 전역 선언을 제거하고 타입 선언 파일에는 통합하지 않습니다.
// 실제 코드에서 필요시 타입 캐스팅을 통해 처리합니다.
// (window.kakao.maps as unknown as KakaoMapAPI)

// declare global {
//   interface Window {
//     kakao: {
//       maps: KakaoMapAPI;
//     };
//   }
// } 