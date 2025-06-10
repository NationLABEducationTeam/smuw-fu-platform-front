'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { QuestionInput } from './question-input'
import { DIAGNOSIS_QUESTIONS } from '@/constants/diagnosis-questions'
import type { DiagnosisAnswers } from '@/types/diagnosis'
import type { AnalysisResult } from '@/types/analysis'


export function StartupDiagnosisForm() {
  const [isStarted, setIsStarted] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<DiagnosisAnswers>({})
  const [isLoading, setIsLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)

  if (!isStarted) {
    return (
      <div className="max-w-3xl mx-auto text-center">
        <div className="bg-white p-8 rounded-lg shadow-sm border">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            AI 창업 역량 진단
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            예비 창업자를 위한 전문적인 자가진단 키트로, AI가 당신의 창업 준비 상태를 분석하고
            맞춤형 인사이트를 제공합니다.
          </p>
          
          <div className="grid grid-cols-1 gap-6 mb-8">
            <div className="text-left space-y-6">
              <h3 className="text-lg font-semibold text-gray-700">진단 영역</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg bg-blue-50">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="font-semibold">창업자 역량</span>
                  </div>
                  <p className="text-sm text-gray-600 ml-5">창업 경험, 전문성, 리더십 등</p>
                </div>
                <div className="p-4 border rounded-lg bg-blue-50">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="font-semibold">시장 기획</span>
                  </div>
                  <p className="text-sm text-gray-600 ml-5">시장 분석, 고객 니즈 파악</p>
                </div>
                <div className="p-4 border rounded-lg bg-blue-50">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="font-semibold">아이템 분석</span>
                  </div>
                  <p className="text-sm text-gray-600 ml-5">제품/서비스의 경쟁력, 차별성</p>
                </div>
                <div className="p-4 border rounded-lg bg-blue-50">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="font-semibold">비즈니스 모델</span>
                  </div>
                  <p className="text-sm text-gray-600 ml-5">수익 구조, 운영 계획</p>
                </div>
                <div className="p-4 border rounded-lg bg-blue-50 md:col-span-2">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="font-semibold">전략</span>
                  </div>
                  <p className="text-sm text-gray-600 ml-5">마케팅, 성장 전략, 리스크 관리</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center">
                <span className="w-5 h-5 mr-2">⏱️</span>
                <span>소요시간 10-15분</span>
              </div>
              <div className="flex items-center">
                <span className="w-5 h-5 mr-2">📊</span>
                <span>25개 문항</span>
              </div>
              <div className="flex items-center">
                <span className="w-5 h-5 mr-2">🤖</span>
                <span>AI 맞춤 분석</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                모든 답변은 AI 분석을 위해서만 사용되며, 안전하게 보호됩니다.
              </p>
              <Button 
                size="lg"
                onClick={() => setIsStarted(true)}
                className="px-8 py-6 text-lg"
              >
                진단 시작하기
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [DIAGNOSIS_QUESTIONS[currentStep].id]: {
        question: DIAGNOSIS_QUESTIONS[currentStep].question,
        answer: answer
      }
    }))
  }
  

  const handleNext = () => {
    if (currentStep < DIAGNOSIS_QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      //변동 필요
      const response = await fetch('http://43.203.148.128:8000/buiness-checkup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: Object.entries(answers).map(([id, data]) => ({
            questionId: parseInt(id),
            question: data.question,
            answer: data.answer
          }))
        })
      })
  
      if (!response.ok) {
        throw new Error('분석 요청에 실패했습니다')
      }
  
      const result = await response.json()
      setAnalysisResult(result)
    } catch (error) {
      console.error('Error submitting diagnosis:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-12">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-lg font-medium text-gray-700">
          AI가 답변을 분석하고 있습니다...
        </p>
        <p className="text-sm text-gray-500">
          잠시만 기다려주세요
        </p>
      </div>
    )
  }

  if (analysisResult) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 종합 점수 섹션 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">AI 창업 진단 결과</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {Object.entries(analysisResult.data.scores).map(([category, score]) => (
              <div key={category} className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="relative inline-block w-16 h-16 sm:w-20 sm:h-20 mb-2">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle
                      className="text-blue-100"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                      r="34"
                      cx="40"
                      cy="40"
                    />
                    <circle
                      className="text-blue-600"
                      strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 34}`}
                      strokeDashoffset={`${2 * Math.PI * 34 * (1 - Number(score) / 100)}`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="34"
                      cx="40"
                      cy="40"
                    />
                  </svg>
                  <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg font-bold">
                    {score}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-700 capitalize">
                  {category}
                </h3>
              </div>
            ))}
          </div>
        </div>

        {/* 상세 분석 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(analysisResult.data.analysis.analysis).map(([category, content]) => (
            <div key={category} className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 capitalize flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                {category} 분석
              </h3>
              <p className="text-gray-600">{content}</p>
            </div>
          ))}
        </div>

        {/* 추천사항 섹션 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            개선 추천사항
          </h3>
          <ul className="space-y-3">
            {analysisResult.data.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3">
                  {index + 1}
                </span>
                <span className="text-gray-600">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 재시작 버튼 */}
        <div className="text-center">
          <button
            onClick={() => {
              setIsStarted(false)
              setCurrentStep(0)
              setAnswers({})
              setAnalysisResult(null)
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            새로운 진단 시작하기
          </button>
        </div>
      </div>
    )
  }

  const progress = ((currentStep + 1) / DIAGNOSIS_QUESTIONS.length) * 100

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">
          {currentStep + 1} / {DIAGNOSIS_QUESTIONS.length}
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-xl font-semibold mb-4">
            {DIAGNOSIS_QUESTIONS[currentStep].question}
          </h3>
          {DIAGNOSIS_QUESTIONS[currentStep].description && (
            <p className="text-sm text-gray-500 mb-4">
              {DIAGNOSIS_QUESTIONS[currentStep].description}
            </p>
          )}
          <QuestionInput
            question={DIAGNOSIS_QUESTIONS[currentStep]}
            value={answers[DIAGNOSIS_QUESTIONS[currentStep].id]?.answer || ''}
            onChange={handleAnswer}
          />
        </div>

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            이전
          </Button>
          
          {currentStep === DIAGNOSIS_QUESTIONS.length - 1 ? (
            <Button onClick={handleSubmit}>
              제출하기
            </Button>
          ) : (
            <Button onClick={handleNext}>
              다음
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}