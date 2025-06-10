'use client'

import { StartupDiagnosisForm } from './startup-diagnosis-form'
import { Card, CardContent } from '@/components/ui/card'

export function StartupDiagnosisPage() {
  return (
    <div className="flex-1 overflow-auto">
      <main className="p-4 sm:p-6 lg:p-8">
        <Card className="max-w-4xl mx-auto w-full">
          <CardContent className="p-4 sm:p-6">
            <StartupDiagnosisForm />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}