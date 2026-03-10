'use client'

import PMStackBuilder from '@/components/pm/PMStackBuilder'

export default function PMBuilderPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">PM Stack Builder</h1>
        <p className="text-sm text-slate-500 mt-1">
          Create multiple PM intervals for a single asset in one flow — no more filling out the same form over and over.
        </p>
      </div>
      <PMStackBuilder />
    </div>
  )
}
