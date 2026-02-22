import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'PM Schedules' }

export default function PMPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">PM Schedules</h1>
          <p className="mt-1 text-sm text-slate-500">
            Preventive maintenance schedules, compliance tracking, and AI-generated PM suggestions.
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors min-h-[44px]"
        >
          + Add Schedule
        </button>
      </div>

      <div className="mt-8 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
        <p className="text-slate-400 text-sm">PM schedule management coming in Phase 1 · Step 5</p>
      </div>
    </div>
  )
}
