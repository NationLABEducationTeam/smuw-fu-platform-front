import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '혁신적인 기능 | 스마트 푸드테크 솔루션',
  description: 'AI 기반 스마트 푸드테크 솔루션의 혁신적인 기능을 소개합니다. 데이터 분석, 트렌드 파악, 상권 분석 등 다양한 기능을 확인하세요.',
  keywords: ['푸드테크', 'AI', '데이터 분석', '트렌드', '상권 분석', '소셜 미디어', '챗봇'],
  openGraph: {
    title: '혁신적인 기능 | 스마트 푸드테크 솔루션',
    description: 'AI 기반 스마트 푸드테크 솔루션의 혁신적인 기능을 소개합니다.',
    images: [
      {
        url: '/feature1.jpeg',
        width: 1200,
        height: 630,
        alt: '스마트 푸드테크 솔루션 기능 소개',
      },
    ],
  },
}

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section>
      {children}
    </section>
  )
} 