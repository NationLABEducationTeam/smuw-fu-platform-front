import { getJwtToken, signIn } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'https://c8v9u0g8qg.execute-api.ap-northeast-2.amazonaws.com/prod1';
const FASTAPI_BASE_URL = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL || 'http://43.203.148.128:8000';

export const API_ENDPOINTS = {
  LOCATION: '/api/location',
  STORE: '/api/restaurant',
  DONGINFO: '/api/donginfo',
  TRENDS: '/api/search-trends',
  YOUTUBE: '/api/youtube',
  MONEY: '/api/money',
  COMMERCIAL_AREA_CHANGE: '/api/commercial-area-change',
  KEYWORD_SEARCH: '/api/keyword-search',
  ESTIMATE_SALES: '/api/estimate-sales',
  SALES_BY_DISTRICT: '/api/sales/district',
  KEYWORD_INSIGHTS: '/api/v1/keyword-insights/analyze',
  COUCHBASE_SALES: 'api/couchbase-sales',
  SALES_BY_DISTRICT_FASTAPI: '/api/ec2-salesdata'
} as const;

// 인증이 필요 없는 엔드포인트 목록
const PUBLIC_ENDPOINTS = [
  API_ENDPOINTS.LOCATION
  // DONGINFO는 인증이 필요함
];

// 주어진 엔드포인트가 인증이 필요한지 확인하는 함수
const requiresAuth = (endpoint: string): boolean => {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return !PUBLIC_ENDPOINTS.includes(normalizedEndpoint as any);
};

// API Gateway를 통한 GET 요청을 위한 함수 (인증 여부 자동 판단)
export async function fetchFromAPIGateway<T>(endpoint: string, params: any = {}): Promise<T> {
  // 인증이 필요한 엔드포인트인지 확인
  if (requiresAuth(endpoint)) {
    return fetchFromAPIGatewayWithAuth<T>(endpoint, params);
  }
  
  try {
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const districtCode = Object.keys(params)[0];
    const url = `${API_BASE_URL}${normalizedEndpoint}?${districtCode}`;
    
    // console.log('Requesting URL (public):', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error('API Gateway call failed:', error);
    throw error;
  }
}

// API Gateway를 통한 POST 요청을 위한 함수 (인증 여부 자동 판단)
export async function fetchFromAPI<T>(endpoint: string, body: any = {}): Promise<T> {
  // 인증이 필요한 엔드포인트인지 확인
  if (requiresAuth(endpoint)) {
    return fetchFromAPIWithAuth<T>(endpoint, body);
  }
  
  try {
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${API_BASE_URL}${normalizedEndpoint}`;
    
    // console.log('Requesting URL (public):', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    // console.log(`API Call to ${endpoint}:`, {
    //   status: response.status,
    //   statusText: response.statusText,
    //   headers: Object.fromEntries(response.headers.entries()),
    // });

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

export async function fetchFromFastAPI<T>(endpoint: string, params: any = {}): Promise<T> {
  try {
    let url = `${FASTAPI_BASE_URL}${endpoint}`;
    
    // district 파라미터가 있으면 경로에 추가
    if (endpoint === '/api/sales/district' && params.district) {
      url = url + '/' + params.district;
      const { district, ...restParams } = params;
      params = restParams;
    }

    // 나머지 파라미터들만 쿼리스트링으로 추가
    const queryParams = new URLSearchParams(params).toString();
    url = `${url}${queryParams ? `?${queryParams}` : ''}`;
    
    // console.log(`Calling FastAPI: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('FastAPI error:', await response.text());
      throw new Error(`FastAPI request failed: ${response.statusText}`);
    }

    const data = await response.json();
    // console.log('FastAPI response data:', data);
    return data as T;
  } catch (error) {
    console.error('FastAPI call failed:', error);
    throw error;
  }
}

/**
 * 인증 토큰을 포함한 API 요청을 수행합니다.
 */
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  try {
    // JWT 토큰 가져오기
    const tokenResult = await getJwtToken();
    
    if (!tokenResult.success) {
      throw new Error('인증 토큰을 가져올 수 없습니다.');
    }
    
    // 헤더에 인증 토큰 추가
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${tokenResult.token}`
    };
    
    // API 요청 수행
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    // 응답 상태 확인
    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    console.error('인증된 API 요청 오류:', error);
    throw error;
  }
};

/**
 * 인증 토큰을 포함한 WebSocket URL을 생성합니다.
 */
export const getAuthenticatedWebSocketUrl = async (baseUrl: string): Promise<string> => {
  try {
    // JWT 토큰 가져오기
    const tokenResult = await getJwtToken();
    
    if (!tokenResult.success) {
      console.warn('인증 토큰을 가져올 수 없습니다. 비인증 WebSocket URL을 사용합니다.');
      return baseUrl;
    }
    
    // URL에 토큰 추가
    const url = new URL(baseUrl);
    url.searchParams.append('token', tokenResult.token);
    
    return url.toString();
  } catch (error) {
    console.error('인증된 WebSocket URL 생성 오류:', error);
    // 오류 발생 시 기본 URL 반환
    return baseUrl;
  }
};

// API Gateway를 통한 인증된 GET 요청
export async function fetchFromAPIGatewayWithAuth<T>(endpoint: string, params: any = {}): Promise<T> {
  try {
    // JWT 토큰 가져오기
    const tokenResult = await getJwtToken();
    
    if (!tokenResult.success) {
      throw new Error('인증 토큰을 가져올 수 없습니다.');
    }
    
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // 쿼리 파라미터 구성
    const queryParams = new URLSearchParams();
    for (const key in params) {
      queryParams.append(key, params[key]);
    }
    
    const url = `${API_BASE_URL}${normalizedEndpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    // console.log('Requesting URL with Auth:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${tokenResult.token}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('인증이 필요하거나 권한이 없습니다.');
      }
      throw new Error(`API 요청 실패: ${response.statusText}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error('인증된 API Gateway 호출 실패:', error);
    throw error;
  }
}

// 자동으로 로그인을 시도하는 함수
async function autoLogin(): Promise<{token?: string, success: boolean}> {
  try {
    // 테스트 계정 정보 사용 (임시 하드코딩)
    const username = 'testuser';  
    const password = 'Test1234!'; 
    
    // console.log('자동 로그인 시도 중...');
    const result = await signIn(username, password);
    
    if (result.success && result.idToken) {
      // console.log('자동 로그인 성공');
      return { 
        token: result.idToken,
        success: true 
      };
    } else {
      console.error('자동 로그인 실패:', result);
      return { success: false };
    }
  } catch (error) {
    console.error('자동 로그인 중 오류:', error);
    return { success: false };
  }
}

// API Gateway를 통한 인증된 POST 요청
export async function fetchFromAPIWithAuth<T>(endpoint: string, body: any = {}): Promise<T> {
  try {
    // JWT 토큰 가져오기
    let tokenResult = await getJwtToken();
    
    // 토큰이 없으면 자동 로그인 시도
    if (!tokenResult.success || !tokenResult.token) {
      // console.log('토큰이 없거나 유효하지 않음, 자동 로그인 시도');
      tokenResult = await autoLogin();
    }
    
    // 토큰 정보를 상세히 로깅
    // console.log('인증 토큰 상태:', {
    //   success: tokenResult.success,
    //   hasToken: !!tokenResult.token
    // });
    
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${API_BASE_URL}${normalizedEndpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    // 토큰이 있는 경우에만 Authorization 헤더 추가
    if (tokenResult.success && tokenResult.token) {
      headers['Authorization'] = `Bearer ${tokenResult.token}`;
    } else {
      throw new Error('인증 토큰을 가져올 수 없습니다. API 호출 불가');
    }
    
    // console.log('Requesting URL with Auth:', url);
    // console.log('Request Body:', body);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 오류 응답:', errorText);
      throw new Error(`API 요청 실패: ${response.statusText}, ${errorText}`);
    }
    
    // API 응답의 내용 파싱
    const responseData = await response.json();
    return responseData as T;
  } catch (error) {
    console.error('인증된 API 호출 실패:', error);
    throw error;
  }
}

// 대화 목록 가져오기
export async function fetchChatSessions(): Promise<any[]> {
  try {
    const tokenResult = await getJwtToken();
    
    if (!tokenResult.success) {
      console.warn('인증 토큰을 가져올 수 없습니다.');
      return [];
    }
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chathistory`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${tokenResult.token}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('인증이 필요하거나 권한이 없습니다.');
      }
      throw new Error(`API 요청 실패: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.sessions || [];
  } catch (error) {
    console.error('대화 목록 가져오기 실패:', error);
    return [];
  }
}

// 세션별 메시지 조회 함수
export async function fetchSessionMessages(sessionId: string): Promise<any[]> {
  try {
    const tokenResult = await getJwtToken();
    
    if (!tokenResult.success) {
      console.warn('인증 토큰을 가져올 수 없습니다.');
      return [];
    }
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chathistory/${sessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${tokenResult.token}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('인증이 필요하거나 권한이 없습니다.');
      }
      throw new Error(`API 요청 실패: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.messages || [];
  } catch (error) {
    console.error('세션 메시지 조회 실패:', error);
    return [];
  }
}