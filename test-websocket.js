const WebSocket = require('ws');

// WebSocket URL
const url = 'wss://dzamj9uv1g.execute-api.ap-northeast-2.amazonaws.com/production';

// WebSocket 연결
console.log(`연결 시도: ${url}`);
const ws = new WebSocket(url);

// 연결 이벤트
ws.on('open', () => {
  console.log('연결 성공!');
  
  // 테스트 메시지 전송
  const message = {
    type: 'chatRequest',
    data: {
      message: 'Hello, how are you today?',
      modelId: 'arn:aws:bedrock:ap-northeast-2:010438473566:inference-profile/YOUR_INFERENCE_PROFILE_ID',
      sessionId: 'test-session'
    }
  };
  
  console.log('메시지 전송:', JSON.stringify(message));
  ws.send(JSON.stringify(message));
});

// 메시지 수신 이벤트
ws.on('message', (data) => {
  console.log('메시지 수신:', data.toString());
  
  // 메시지를 받은 후 응답이 완료되었거나 오류가 발생한 경우 연결 종료
  const response = JSON.parse(data.toString());
  if (response.type === 'chatStreamEnd' || response.type === 'error') {
    console.log('응답 수신 완료, 연결 종료 중...');
    ws.close();
    process.exit(0);
  }
});

// 에러 이벤트
ws.on('error', (error) => {
  console.error('에러 발생:', error);
  process.exit(1);
});

// 연결 종료 이벤트
ws.on('close', (code, reason) => {
  console.log(`연결 종료: 코드=${code}, 이유=${reason || '없음'}`);
  process.exit(0);
});

// 30초 후 강제 종료 (타임아웃 안전장치)
setTimeout(() => {
  console.log('타임아웃: 30초가 지나 강제 종료합니다.');
  ws.close();
  process.exit(0);
}, 30000); 