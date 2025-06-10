# SMWU Food Business Analytics API Documentation

이 문서는 SMWU 음식업 분석 플랫폼의 API 엔드포인트들을 정의합니다.

## 개요

### 서버 정보
- **API Gateway Server**: `https://c8v9u0g8qg.execute-api.ap-northeast-2.amazonaws.com/prod1`
- **FastAPI Server**: `http://43.203.148.128:8000`

### 인증
대부분의 API는 AWS Cognito JWT 토큰 인증이 필요합니다.
- **인증 방식**: Bearer Token (JWT)
- **헤더**: `Authorization: Bearer {JWT_TOKEN}`

### 공개 엔드포인트
- `/api/location` - 위치 정보 조회 (인증 불필요)

## API 엔드포인트 분류

### 1. 위치 및 지역 정보
| 엔드포인트 | 메서드 | 설명 | 인증 |
|-----------|--------|------|------|
| `/api/location` | GET | 행정구역 위치 정보 조회 | ❌ |
| `/api/donginfo` | GET | 상세 동 정보 (인구, 면적 등) | ✅ |

### 2. 음식점 정보
| 엔드포인트 | 메서드 | 설명 | 인증 |
|-----------|--------|------|------|
| `/api/restaurant` | POST | 지역별 음식점 데이터 조회 | ✅ |

### 3. 트렌드 및 키워드 분석
| 엔드포인트 | 메서드 | 설명 | 인증 |
|-----------|--------|------|------|
| `/api/search-trends` | POST | 검색 트렌드 데이터 | ✅ |
| `/api/keyword-search` | POST | 키워드 검색 | ✅ |
| `/api/v1/keyword-insights/analyze` | POST | 고급 키워드 분석 | ✅ |

### 4. 유튜브 데이터
| 엔드포인트 | 메서드 | 설명 | 인증 |
|-----------|--------|------|------|
| `/api/youtube` | POST | 관련 유튜브 영상 조회 | ✅ |

### 5. 경제 및 매출 데이터
| 엔드포인트 | 메서드 | 설명 | 인증 |
|-----------|--------|------|------|
| `/api/money` | POST | 소득/소비 데이터 | ✅ |
| `/api/sales/district` | GET | 지역별 매출 데이터 (API Gateway) | ✅ |
| `/api/ec2-salesdata` | GET | 매출 데이터 (FastAPI) | ❌ |
| `/api/couchbase-sales` | POST | Couchbase 매출 데이터 | ✅ |
| `/api/estimate-sales` | POST | 매출 예측 | ✅ |

### 6. 상권 분석
| 엔드포인트 | 메서드 | 설명 | 인증 |
|-----------|--------|------|------|
| `/api/commercial-area-change` | POST | 상권 변화 분석 | ✅ |

## 사용 예시

### 1. 위치 정보 조회 (공개 API)
```bash
curl -X GET \
  "https://c8v9u0g8qg.execute-api.ap-northeast-2.amazonaws.com/prod1/api/location?district_code=11110" \
  -H "Accept: application/json"
```

### 2. 음식점 데이터 조회 (인증 필요)
```bash
curl -X POST \
  "https://c8v9u0g8qg.execute-api.ap-northeast-2.amazonaws.com/prod1/api/restaurant" \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "location": "강남구",
    "category": "한식",
    "administrative_code": "11680"
  }'
```

### 3. 트렌드 데이터 조회
```bash
curl -X POST \
  "https://c8v9u0g8qg.execute-api.ap-northeast-2.amazonaws.com/prod1/api/search-trends" \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "period": "weekly",
    "category": "음식"
  }'
```

### 4. FastAPI 매출 데이터 조회
```bash
curl -X GET \
  "http://43.203.148.128:8000/api/ec2-salesdata?category=한식&period=2024-01&limit=50" \
  -H "Accept: application/json"
```

## 데이터 스키마

### Location (위치 정보)
```json
{
  "name": "강남구",
  "administrative_code": "11680",
  "population_code": "11680",
  "moneyData": {
    "income": 450,
    "consumption": 3200000
  }
}
```

### Restaurant (음식점 정보)  
```json
{
  "name": "맛있는 한식당",
  "address": "서울시 강남구 역삼동 123-45",
  "latitude": 37.5665,
  "longitude": 126.9780,
  "category": "한식"
}
```

### SalesData (매출 데이터)
```json
{
  "sales_volume": 15000000,
  "customer_count": 1200,
  "price_index": 105.5,
  "growth_rate": 12.3,
  "period": "2024-01"
}
```

### TrendData (트렌드 데이터)
```json
{
  "keyword": "떡볶이",
  "search_volume": 8500,
  "growth_rate": 15.7,
  "period": "weekly"
}
```

## 에러 처리

모든 API는 표준 HTTP 상태 코드를 사용합니다:

- `200` - 성공
- `400` - 잘못된 요청
- `401` - 인증 실패
- `403` - 권한 없음
- `404` - 리소스 없음
- `500` - 서버 오류

### 에러 응답 형식
```json
{
  "error": "에러 메시지",
  "code": "ERROR_CODE",
  "details": "상세 에러 정보"
}
```

## 인증 토큰 획득

AWS Cognito를 통해 JWT 토큰을 획득해야 합니다:

1. **로그인 요청**
```javascript
import { signIn } from './utils/auth';

const result = await signIn('username', 'password');
if (result.success) {
  const token = result.idToken;
  // API 요청 시 사용
}
```

2. **토큰 사용**
```javascript
const response = await fetch(apiUrl, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## 속도 제한

- API Gateway: 초당 최대 1000 요청
- FastAPI: 분당 최대 10000 요청

## 지원

API 관련 문의사항은 다음으로 연락 주세요:
- 이메일: support@smwu-food.com
- 개발팀: SMWU Food Business Team

## OpenAPI 스펙 파일

완전한 OpenAPI 3.0.0 스펙은 `openapi-spec.yaml` 파일에서 확인할 수 있습니다.

### Swagger UI로 문서 보기

OpenAPI 스펙을 Swagger UI에서 확인하려면:

1. [Swagger Editor](https://editor.swagger.io/) 접속
2. `openapi-spec.yaml` 파일 내용 복사/붙여넣기
3. 인터랙티브 문서 확인

### 코드 생성

OpenAPI 스펙을 사용하여 다양한 언어의 클라이언트 SDK를 생성할 수 있습니다:

```bash
# JavaScript/TypeScript 클라이언트 생성
npx @openapitools/openapi-generator-cli generate \
  -i openapi-spec.yaml \
  -g typescript-axios \
  -o ./generated-client

# Python 클라이언트 생성  
openapi-generator-cli generate \
  -i openapi-spec.yaml \
  -g python \
  -o ./python-client
```

## 버전 관리

- 현재 버전: v1.0.0
- API 버전 관리는 URL 경로에 포함 (예: `/api/v1/...`)
- 주요 변경사항은 버전업과 함께 공지

## 변경사항

### v1.0.0 (2024-01-15)
- 초기 API 스펙 정의
- 모든 엔드포인트 OpenAPI 3.0.0 형식으로 문서화
- 인증 및 보안 스키마 정의 