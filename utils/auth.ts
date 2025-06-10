import { 
  CognitoUserPool, 
  CognitoUser, 
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoUserSession
} from 'amazon-cognito-identity-js';

// Cognito 설정
const userPoolData = {
  UserPoolId: 'ap-northeast-2_6vGiuXQDD',
  ClientId: '4qd763luurnkv1gnc7sqhuqnc1' // Cognito 앱 클라이언트 ID
};

const userPool = new CognitoUserPool(userPoolData);

// 회원가입 함수
export const signUp = (username: string, password: string, email: string, name: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const attributeList = [
      new CognitoUserAttribute({
        Name: 'email',
        Value: email
      }),
      new CognitoUserAttribute({
        Name: 'name',
        Value: name
      })
    ];

    userPool.signUp(username, password, attributeList, [], (err, result) => {
      if (err) {
        console.error('회원가입 오류:', err);
        reject(err);
        return;
      }
      resolve({ success: true, user: result?.user });
    });
  });
};

// 회원가입 확인 함수 (이메일 인증 코드)
export const confirmSignUp = (username: string, code: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: userPool
    });

    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        console.error('회원가입 확인 오류:', err);
        reject(err);
        return;
      }
      resolve({ success: true });
    });
  });
};

// 로그인 함수
export const signIn = (username: string, password: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const authenticationData = {
      Username: username,
      Password: password
    };
    
    const authenticationDetails = new AuthenticationDetails(authenticationData);

    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: userPool
    });

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (session) => {
        resolve({ 
          success: true, 
          user: cognitoUser,
          idToken: session.getIdToken().getJwtToken(),
          accessToken: session.getAccessToken().getJwtToken(),
          refreshToken: session.getRefreshToken().getToken()
        });
      },
      onFailure: (err) => {
        console.error('로그인 오류:', err);
        reject(err);
      },
      newPasswordRequired: (userAttributes, requiredAttributes) => {
        // 사용자가 처음 로그인할 때 암호 변경이 필요한 경우
        console.log('새 비밀번호가 필요합니다.');
        resolve({ 
          success: false, 
          requireNewPassword: true,
          user: cognitoUser,
          userAttributes,
          requiredAttributes
        });
      }
    });
  });
};

// 로그아웃 함수
export const signOut = (): Promise<any> => {
  return new Promise((resolve) => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
      resolve({ success: true });
    } else {
      resolve({ success: true, message: '로그인된 사용자가 없습니다.' });
    }
  });
};

// 현재 인증된 사용자 정보 가져오기
export const getCurrentUser = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser();
    
    if (!cognitoUser) {
      resolve(null);
      return;
    }

    cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err) {
        console.error('세션 가져오기 오류:', err);
        resolve(null);
        return;
      }

      if (!session) {
        resolve(null);
        return;
      }

      cognitoUser.getUserAttributes((err, attributes) => {
        if (err) {
          console.error('사용자 속성 가져오기 오류:', err);
          resolve({
            username: cognitoUser.getUsername(),
            attributes: {}
          });
          return;
        }

        const userData: Record<string, string> = {};
        attributes?.forEach(attr => {
          userData[attr.getName()] = attr.getValue();
        });

        // name 속성이 있으면 username으로 사용
        const displayName = userData['name'] || cognitoUser.getUsername();
        
        resolve({
          username: displayName,
          attributes: userData
        });
      });
    });
  });
};

// JWT 토큰 가져오기 (API 호출에 사용)
export const getJwtToken = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser();
    
    if (!cognitoUser) {
      resolve({ success: false, message: '로그인된 사용자가 없습니다.' });
      return;
    }

    cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err) {
        console.error('세션 가져오기 오류:', err);
        resolve({ success: false, message: '세션 가져오기 오류', error: err.message });
        return;
      }

      if (!session) {
        resolve({ success: false, message: '유효한 세션이 없습니다.' });
        return;
      }

      resolve({ 
        success: true, 
        token: session.getIdToken().getJwtToken(),
        accessToken: session.getAccessToken().getJwtToken(),
        refreshToken: session.getRefreshToken().getToken()
      });
    });
  });
};

// 새 비밀번호 설정 함수
export const completeNewPasswordChallenge = (user: CognitoUser, newPassword: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    user.completeNewPasswordChallenge(newPassword, {}, {
      onSuccess: (session) => {
        resolve({ 
          success: true, 
          user,
          idToken: session.getIdToken().getJwtToken(),
          accessToken: session.getAccessToken().getJwtToken(),
          refreshToken: session.getRefreshToken().getToken()
        });
      },
      onFailure: (err) => {
        console.error('새 비밀번호 설정 오류:', err);
        reject(err);
      }
    });
  });
}; 