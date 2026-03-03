'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import RequestForm from '@/components/requests/RequestForm'

function NewRequestContent() {
  const searchParams = useSearchParams()
  const assetParam = searchParams.get('asset')

  // TODO: If assetParam exists, resolve asset via API
  // For now we just show the form without prefill

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Submit Maintenance Request</h1>
        <p className="text-sm text-slate-500">
          Describe what needs fixing — our maintenance team will be notified immediately.
        </p>
      </div>

      <RequestForm prefillAsset={null} />
    </div>
  )
}

export default function NewRequestPage() {
  return (
    <Suspense fallback={<div className="text-slate-400 p-8">Loading...</div>}>
      <NewRequestContent />
    </Suspense>
  )
}
