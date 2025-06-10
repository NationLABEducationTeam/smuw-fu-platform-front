'use client'

import { useState } from 'react'
import { signIn, completeNewPasswordChallenge } from '@/utils/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { CognitoUser } from 'amazon-cognito-identity-js'

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [requireNewPassword, setRequireNewPassword] = useState(false)
  const [cognitoUser, setCognitoUser] = useState<CognitoUser | null>(null)
  
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await signIn(username, password)
      
      if (result.requireNewPassword) {
        // 암호 강제 변경이 필요한 경우
        setRequireNewPassword(true)
        setCognitoUser(result.user)
      } else if (result.success) {
        // 로그인 성공
        console.log('로그인 성공:', result);
        
        // 사용자 속성에서 name을 가져와 username으로 사용
        const userAttributes = result.user?.getUserAttributes ? await new Promise<Record<string, string>>((resolve) => {
          result.user.getUserAttributes((err: Error | null, attributes: any[] | undefined) => {
            if (err) {
              console.error('사용자 속성 가져오기 오류:', err);
              resolve({});
              return;
            }
            
            const userData: Record<string, string> = {};
            attributes?.forEach((attr: any) => {
              userData[attr.getName()] = attr.getValue();
            });
            
            resolve(userData);
          });
        }) : {};
        
        // name 속성이 있으면 username으로 사용
        const displayName = userAttributes['name'] || result.user?.getUsername() || '';
        
        login({
          username: displayName,
          attributes: userAttributes
        });
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err: any) {
      console.error('로그인 오류:', err)
      
      // 에러 메시지 처리
      if (err.code === 'UserNotConfirmedException') {
        setError('이메일 인증이 필요합니다. 회원가입 시 받은 인증 코드를 확인해주세요.')
      } else if (err.code === 'NotAuthorizedException') {
        setError('아이디 또는 비밀번호가 올바르지 않습니다.')
      } else if (err.code === 'UserNotFoundException') {
        setError('존재하지 않는 사용자입니다.')
      } else {
        setError(err.message || '로그인 중 오류가 발생했습니다.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!cognitoUser) {
        throw new Error('사용자 정보가 없습니다.')
      }

      const result = await completeNewPasswordChallenge(cognitoUser, newPassword)
      
      if (result.success) {
        // 새 비밀번호 설정 성공
        console.log('새 비밀번호 설정 성공:', result)
        if (onSuccess) {
          onSuccess()
        }
      }
    } catch (err: any) {
      console.error('새 비밀번호 설정 오류:', err)
      setError(err.message || '새 비밀번호 설정 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">로그인</CardTitle>
          <CardDescription className="text-center">
            계정에 로그인하여 서비스를 이용하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {requireNewPassword ? (
            // 새 비밀번호 설정 폼
            <form onSubmit={handleNewPasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">새 비밀번호</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="새 비밀번호를 입력하세요"
                  disabled={loading}
                />
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? '처리 중...' : '비밀번호 변경'}
              </Button>
            </form>
          ) : (
            // 로그인 폼
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">아이디</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="아이디를 입력하세요"
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">비밀번호</Label>
                  <Link href="/auth/forgot-password" className="text-xs text-blue-600 hover:underline">
                    비밀번호 찾기
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="비밀번호를 입력하세요"
                  disabled={loading}
                />
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? '로그인 중...' : '로그인'}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-center">
            계정이 없으신가요?{' '}
            <Link href="/auth/signup" className="text-blue-600 hover:underline">
              회원가입
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
} 