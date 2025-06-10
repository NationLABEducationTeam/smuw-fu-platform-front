'use client'

import { SearchPage } from "@/components/search/search-page"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function Page() {
  return (
    <ProtectedRoute>
      <SearchPage />
    </ProtectedRoute>
  )
}
