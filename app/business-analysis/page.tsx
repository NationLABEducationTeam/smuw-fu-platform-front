'use client'

import { BusinessAnalysisPage } from "@/components/business-analysis"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function Page() {
  return (
    <ProtectedRoute>
      <BusinessAnalysisPage />
    </ProtectedRoute>
  )
}