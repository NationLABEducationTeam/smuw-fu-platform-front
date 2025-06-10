export interface GeoJSONFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
  properties: {
    adm_cd2?: string;
    [key: string]: any;
  };
}

export interface GeoJSONResponse {
  type: string;
  features: GeoJSONFeature[];
} 