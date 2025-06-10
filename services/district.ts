import { fetchFromAPI, fetchFromFastAPI, fetchFromAPIGateway, API_ENDPOINTS } from '@/utils/api';
import { DistrictData } from '@/types/visualization';
import { DistrictResponse, MoneyResponse, SalesData } from '@/types/api';

export interface MoneyData {
  income: number;
  consumption: number;
}

export async function fetchDistrictInfo(populationCode: string): Promise<DistrictData> {
  const response = await fetchFromAPI<any>(API_ENDPOINTS.DONGINFO, { 
    adm_cd: populationCode 
  });

  const data = JSON.parse(response.body) as DistrictResponse;

  if (!data || !data.result || !data.result[0]) {
    throw new Error('Failed to fetch district data');
  }

  return processDistrictData(data.result[0]);
}

export async function fetchMoneyData(administrativeCode: string): Promise<MoneyData> {
  try {
    const districtCode = administrativeCode.slice(0, -2);
    const response = await fetchFromAPI<any>(API_ENDPOINTS.MONEY, {
      district_codes: districtCode,
      start_index: 1,
      end_index: 1000
    });

    const data = JSON.parse(response.body) as MoneyResponse;

    return {
      income: data.monthly_income || 0,
      consumption: data.expenditure?.food_dining || 0
    };
  } catch (error) {
    console.error('Money data fetch error:', error);
    return { income: 0, consumption: 0 };
  }
}

export async function fetchSalesData(administrativeCode: string): Promise<SalesData | null> {
  if (!administrativeCode.startsWith('11')) {
    // console.log('Not a Seoul district code:', administrativeCode);
    return null;
  }

  try {
    const districtCode = administrativeCode.slice(0, -2);
    // console.log('Fetching sales data for district:', districtCode);
    
    // Lambda Function URL로 직접 GET 요청
    const url = `https://6y6ivlkbrr75pnjdkdototgqty0mfiuf.lambda-url.ap-northeast-2.on.aws/?${districtCode}=`;
    // console.log('Requesting URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Lambda request failed: ${response.statusText}`);
    }

    const data = await response.json();
    // console.log('Received sales data:', data);
    
    if (!data || !data.industries || Object.keys(data.industries).length === 0) {
      // console.log('No sales data available for district:', districtCode);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch sales data:', error);
    return null;
  }
}

function processDistrictData(rawData: DistrictResponse['result'][0]): DistrictData {
  return {
    tot_ppltn: rawData.tot_ppltn !== 'N/A' 
      ? parseInt(String(rawData.tot_ppltn)) 
      : 0,
    employee_cnt: rawData.employee_cnt !== 'N/A' 
      ? parseInt(String(rawData.employee_cnt)) 
      : 0,
    tot_house: rawData.tot_house !== 'N/A' 
      ? parseInt(String(rawData.tot_house)) 
      : 0,
    tot_family: rawData.tot_family !== 'N/A' 
      ? parseInt(String(rawData.tot_family)) 
      : 0,
    income: rawData.income !== 'N/A' 
      ? parseInt(String(rawData.income)) 
      : 0,
    consumption: rawData.consumption !== 'N/A' 
      ? parseInt(String(rawData.consumption)) 
      : 0
  };
} 