# SMWU 음식 웹 애플리케이션 🍽️

> 숙명여자대학교 음식 관련 서비스를 위한 AI 기반 웹 애플리케이션

## 📋 프로젝트 개요

SMWU 음식 웹 애플리케이션은 숙명여자대학교 학생들을 위한 포괄적인 음식 서비스 플랫폼입니다. AI 챗봇, 지도 서비스, 비즈니스 분석, 실시간 소통 등 다양한 기능을 제공합니다.

### 🎯 주요 기능

- **🤖 AI 챗봇**: AWS Bedrock Claude 3.5 Sonnet을 활용한 실시간 대화
- **📍 지도 서비스**: 카카오맵 API를 통한 음식점 위치 정보
- **📊 대시보드**: 데이터 시각화 및 분석 도구
- **💬 실시간 소통**: WebSocket 기반 실시간 채팅
- **🔐 사용자 인증**: AWS Cognito를 통한 안전한 인증 시스템
- **📈 비즈니스 분석**: 다양한 차트와 그래프를 통한 데이터 분석
- **🚀 스타트업 진단**: 창업 관련 진단 및 분석 도구
- **🎨 3D 시각화**: Three.js를 활용한 3D 데이터 표현
- **🔍 검색 기능**: 통합 검색 시스템
- **👥 SNS 기능**: 소셜 네트워킹 기능
- **🛠️ 관리자 패널**: 시스템 관리 및 모니터링

## 🛠️ 기술 스택

### 프론트엔드
- **Next.js 14.2.16** - React 기반 풀스택 프레임워크
- **TypeScript** - 타입 안전성을 위한 정적 타입 언어
- **Tailwind CSS** - 유틸리티 우선 CSS 프레임워크
- **shadcn/ui** - 재사용 가능한 컴포넌트 라이브러리
- **Framer Motion** - 애니메이션 라이브러리
- **Three.js** - 3D 그래픽 라이브러리

### 백엔드 & 클라우드
- **AWS Lambda** - 서버리스 컴퓨팅
- **AWS API Gateway** - WebSocket API 관리
- **AWS Bedrock** - AI 모델 서비스 (Claude 3.5 Sonnet)
- **AWS Cognito** - 사용자 인증 및 권한 관리
- **AWS DynamoDB** - NoSQL 데이터베이스
- **AWS S3** - 파일 저장소

### 데이터 시각화
- **Nivo** - React 차트 라이브러리
- **Recharts** - 차트 및 그래프 컴포넌트
- **D3.js** - 워드 클라우드 생성

### 외부 서비스
- **카카오맵 API** - 지도 서비스
- **OpenAI API** - 추가 AI 기능

## 📁 프로젝트 구조

```
├── app/                      # Next.js App Router
│   ├── admin/               # 관리자 페이지
│   ├── auth/                # 인증 관련 페이지
│   ├── business-analysis/   # 비즈니스 분석 페이지
│   ├── chatbot/             # AI 챗봇 페이지
│   ├── dashboard/           # 대시보드 페이지
│   ├── features/            # 기능 페이지들
│   ├── map/                 # 지도 페이지
│   ├── search/              # 검색 페이지
│   ├── sns/                 # SNS 기능 페이지
│   ├── startup-diagnosis/   # 스타트업 진단 페이지
│   └── websocket-test/      # WebSocket 테스트 페이지
├── components/              # 재사용 가능한 컴포넌트
│   ├── ui/                  # shadcn/ui 컴포넌트
│   ├── 3d-features/         # 3D 관련 컴포넌트
│   ├── auth/                # 인증 컴포넌트
│   ├── business-analysis/   # 비즈니스 분석 컴포넌트
│   ├── chatbot/             # 챗봇 컴포넌트
│   ├── dashboard/           # 대시보드 컴포넌트
│   ├── features/            # 기능 컴포넌트
│   ├── map/                 # 지도 컴포넌트
│   ├── search/              # 검색 컴포넌트
│   ├── sns/                 # SNS 컴포넌트
│   ├── startup-diagnosis/   # 스타트업 진단 컴포넌트
│   └── visualization/       # 시각화 컴포넌트
├── lambda/                  # AWS Lambda 함수들
│   ├── connectHandler.mjs   # WebSocket 연결 처리
│   ├── disconnectHandler.mjs # WebSocket 연결 해제 처리
│   ├── chatrequestHandler.mjs # 채팅 요청 처리
│   └── getChatHistoryHandler.mjs # 채팅 히스토리 조회
├── utils/                   # 유틸리티 함수들
├── hooks/                   # 커스텀 React 훅
├── contexts/                # React Context 상태 관리
├── services/                # 외부 서비스 연동
├── types/                   # TypeScript 타입 정의
├── constants/               # 상수 정의
└── lib/                     # 라이브러리 설정
```

## 🚀 시작하기

### 필수 요구사항

- **Node.js** 18.0.0 이상
- **npm** 또는 **yarn**
- **AWS 계정** (백엔드 서비스용)
- **카카오 개발자 계정** (지도 API용)

### 설치 및 실행

1. **저장소 클론**
   ```bash
   git clone https://github.com/your-username/smwu-food-web-app.git
   cd smwu-food-web-app
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **환경 변수 설정**
   
   `.env.local` 파일을 생성하고 다음 변수들을 설정하세요:
   ```env
   # AWS 설정
   NEXT_PUBLIC_WEBSOCKET_URL=wss://your-api-gateway-id.execute-api.ap-northeast-2.amazonaws.com/production
   NEXT_PUBLIC_AWS_REGION=ap-northeast-2
   NEXT_PUBLIC_COGNITO_USER_POOL_ID=ap-northeast-2_xxxxxxxxx
   NEXT_PUBLIC_COGNITO_CLIENT_ID=your-client-id
   
   # 카카오맵 API
   NEXT_PUBLIC_KAKAO_MAP_API_KEY=your-kakao-map-api-key
   
   # 기타 API
   NEXT_PUBLIC_API_BASE_URL=https://your-api-base-url.com
   ```

4. **개발 서버 실행**
   ```bash
   npm run dev
   ```

5. **브라우저에서 확인**
   
   [http://localhost:8080](http://localhost:8080)에서 애플리케이션을 확인할 수 있습니다.

## 🏗️ 빌드 및 배포

### 정적 빌드
```bash
npm run build
```

### 배포
이 프로젝트는 정적 내보내기 모드로 설정되어 있어 다음 플랫폼에 배포할 수 있습니다:
- AWS S3 + CloudFront
- Vercel
- Netlify
- GitHub Pages

## 🔧 AWS 인프라 설정

### 1. DynamoDB 테이블 생성
- **WebSocketConnections**: WebSocket 연결 정보 저장
- **ChatHistory**: 채팅 히스토리 저장

### 2. Lambda 함수 배포
`lambda/` 폴더의 함수들을 AWS Lambda에 배포:
- connectHandler.mjs
- disconnectHandler.mjs
- chatrequestHandler.mjs
- getChatHistoryHandler.mjs

### 3. API Gateway 설정
WebSocket API를 생성하고 다음 라우트를 설정:
- `$connect` → connectHandler
- `$disconnect` → disconnectHandler
- `$default` → defaultHandler
- `chatRequest` → chatrequestHandler

### 4. Cognito 사용자 풀 설정
사용자 인증을 위한 Cognito 사용자 풀을 생성하고 설정합니다.

### 5. Bedrock 모델 액세스 설정
Claude 3.5 Sonnet 모델에 대한 액세스를 활성화합니다.

## 📖 주요 기능 가이드

### AI 챗봇 사용법
1. 로그인 후 챗봇 페이지로 이동
2. 메시지 입력 후 전송
3. AI가 실시간으로 응답 생성
4. 대화 내용은 자동으로 저장됨

### 지도 서비스 사용법
1. 지도 페이지에서 현재 위치 확인
2. 음식점 검색 및 필터링
3. 상세 정보 확인 및 리뷰 작성

### 대시보드 활용법
1. 다양한 차트와 그래프로 데이터 시각화
2. 실시간 업데이트되는 통계 정보
3. 커스텀 필터링 및 정렬 기능

## 🔍 개발 가이드

### 새로운 페이지 추가
```typescript
// app/new-page/page.tsx
export default function NewPage() {
  return (
    <div>
      <h1>새로운 페이지</h1>
    </div>
  );
}
```

### 새로운 컴포넌트 추가
```typescript
// components/new-component.tsx
interface NewComponentProps {
  title: string;
}

export function NewComponent({ title }: NewComponentProps) {
  return <div>{title}</div>;
}
```

### 새로운 Lambda 함수 추가
```javascript
// lambda/newHandler.mjs
export const handler = async (event) => {
  // 로직 구현
  return { statusCode: 200, body: 'Success' };
};
```

## 🐛 문제 해결

### 일반적인 문제들

1. **WebSocket 연결 실패**
   - 환경 변수 확인
   - AWS API Gateway 설정 확인
   - 네트워크 연결 상태 확인

2. **인증 오류**
   - Cognito 설정 확인
   - JWT 토큰 만료 여부 확인
   - 사용자 권한 확인

3. **빌드 오류**
   - 의존성 버전 확인
   - TypeScript 타입 오류 수정
   - 환경 변수 설정 확인

## 🤝 기여하기

1. Fork 프로젝트
2. 새로운 브랜치 생성 (`git checkout -b feature/new-feature`)
3. 변경사항 커밋 (`git commit -am 'Add new feature'`)
4. 브랜치에 Push (`git push origin feature/new-feature`)
5. Pull Request 생성

## 📝 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 문의사항

프로젝트에 대한 문의사항이나 버그 리포트는 [Issues](https://github.com/your-username/smwu-food-web-app/issues)에 등록해 주세요.

## 🔗 관련 링크

- [Next.js 문서](https://nextjs.org/docs)
- [AWS Lambda 문서](https://docs.aws.amazon.com/lambda/)
- [AWS Bedrock 문서](https://docs.aws.amazon.com/bedrock/)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [카카오맵 API 문서](https://apis.map.kakao.com/)

---

<p align="center">
  Made with ❤️ for SMWU Students
</p>
