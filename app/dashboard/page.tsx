'use client'

import { DashboardPage } from "@/components/dashboard"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function Page() {
  return (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  )
}
