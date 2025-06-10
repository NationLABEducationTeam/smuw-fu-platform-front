export interface CorpData {
    avrgSlsAmt: number;
    corpNm: string;
    brandNm: string;
    frcsCnt: number;
    arUnitAvrgSlsAmt: number;
  }
  
export interface Top10Data {
    [key: string]: CorpData[];
}

export type ChartDataItem = {
    [key: string]: string | number;
    brandNm: string;
    value: number;
    frcsCnt: number;
    arUnitAvrgSlsAmt: number;
    avrgSlsAmt: number;
};