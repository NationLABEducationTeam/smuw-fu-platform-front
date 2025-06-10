export const MODEL_OPTIONS = {
  "Claude 3.5 Sonnet": "apac.anthropic.claude-3-5-sonnet-20240620-v1:0"
} as const;

export type ModelId = typeof MODEL_OPTIONS[keyof typeof MODEL_OPTIONS];

// 모델 제공업체 식별 함수
export function getModelProvider(modelId: ModelId): 'anthropic' | 'unknown' {
  if (modelId.includes('anthropic')) {
    return 'anthropic';
  }
  return 'unknown';
}

// 모델별 페이로드 생성 함수
export function getModelPayload(modelId: ModelId, message: string) {
  const provider = getModelProvider(modelId);
  
  switch (provider) {
    case 'anthropic':
      return {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.9,
        messages: [
          {
            role: "user",
            content: [{ type: "text", text: message }],
          }
        ],
      };
    default:
      throw new Error(`지원되지 않는 모델: ${modelId}`);
  }
}

// 모델별 응답 파싱 함수
export function parseModelResponse(modelId: ModelId, response: any) {
  const provider = getModelProvider(modelId);
  
  switch (provider) {
    case 'anthropic':
      // 스트리밍 응답의 경우 전체 응답이 이미 조합되어 있음
      if (typeof response === 'string') {
        return response;
      }
      // 비스트리밍 응답의 경우
      if (response.content && Array.isArray(response.content)) {
        return response.content[0].text;
      }
      throw new Error('알 수 없는 응답 형식');
    default:
      throw new Error(`지원되지 않는 모델: ${modelId}`);
  }
}