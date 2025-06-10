/** @type {import('next').NextConfig} */
const nextConfig = {
    compiler: {
        styledComponents: true,
    },
    output: 'export', // 정적 내보내기 모드 활성화
    trailingSlash: true, // URL 끝에 슬래시 추가 (중요: 정적 호스팅에서 라우팅 문제 해결)
    optimizeFonts: false,  // experimental에서 최상위로 이동
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'i.namu.wiki'
            },
            {
                protocol: 'https',
                hostname: 'i.ytimg.com'
            }
        ]
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    env: {
        NEXT_PUBLIC_KAKAO_MAP_API_KEY: process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY,
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL
    },
};

export default nextConfig;