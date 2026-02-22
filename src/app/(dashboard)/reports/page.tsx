import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Reports' }

export default function ReportsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
      <p className="mt-1 text-sm text-slate-500">
        Maintenance scoreboard, trend charts, and exportable reports.
      </p>

      <div className="mt-8 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
        <p className="text-slate-400 text-sm">Reports coming in Phase 1 · Step 7</p>
      </div>
    </div>
  )
}
