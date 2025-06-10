import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/lib/theme-provider";
import "./globals.css";
import Script from "next/script";
import { WelcomeModal } from '@/components/common/layout/WelcomeModal'
import { NavSidebar, SidebarProvider } from '@/components/common/layout/sidebar/nav-sidebar'
import { SidebarLayout } from '@/components/sidebar-layout'
import { AuthProvider } from '@/contexts/AuthContext'

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "DeepBistro",
  description: "잘 정리된 데이터를 기반으로 한 인사이트로 당신의 F&B 비즈니스를 한 단계 더 발전시키세요",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <Script
          src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&libraries=services,clusterer&autoload=false`}
          strategy="beforeInteractive"
        />
      </head>
      <body className="antialiased relative">
        <ThemeProvider defaultTheme="light">
          <AuthProvider>
            <SidebarProvider>
              <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
                <NavSidebar />
                <SidebarLayout>
                  {children}
                </SidebarLayout>
              </div>
              <WelcomeModal />
            </SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}