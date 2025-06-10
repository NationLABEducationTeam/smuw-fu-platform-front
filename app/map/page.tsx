'use client'

import { MapPage } from "@/components/map/map-page"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function Page() {
  return (
    <ProtectedRoute>
      <MapPage />
    </ProtectedRoute>
  )
}
