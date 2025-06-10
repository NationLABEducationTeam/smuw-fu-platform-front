'use client'

import { StartupDiagnosisPage } from "@/components/startup-diagnosis"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function Page() {
  return (
    <ProtectedRoute>
      <StartupDiagnosisPage />
    </ProtectedRoute>
  )
}