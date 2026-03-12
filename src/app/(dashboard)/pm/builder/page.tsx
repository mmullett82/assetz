'use client'

import PMStackBuilder from '@/components/pm/PMStackBuilder'

export default function PMBuilderPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">New PM Schedule</h1>
        <p className="text-sm text-slate-500 mt-1">
          Create one or more PM intervals for an asset — start from scratch or import from a manufacturer document.
        </p>
      </div>
      <PMStackBuilder />
    </div>
  )
}
