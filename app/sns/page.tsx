'use client'

import { SNSPage } from "@/components/sns/sns-page"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function Page() {
  return (
    <ProtectedRoute>
      <SNSPage />
    </ProtectedRoute>
  )
}
