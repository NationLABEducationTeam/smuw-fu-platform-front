'use client'

import { SignupForm } from '@/components/auth/SignupForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  
  const handleSignupSuccess = () => {
    // 회원가입 성공 시 로그인 페이지로 리디렉션
    router.push('/auth/login')
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-[#051b2c] dark:to-[#0a2540] p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            메인 페이지로 돌아가기
          </Link>
        </div>
        
        <SignupForm onSuccess={handleSignupSuccess} />
      </div>
    </div>
  )
} 