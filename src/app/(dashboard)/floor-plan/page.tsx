import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Floor Plan' }

export default function FloorPlanPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Floor Plan</h1>
      <p className="mt-1 text-sm text-slate-500">
        Interactive facility map with real-time asset status and dependency visualization.
      </p>

      <div className="mt-6 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-24 text-center">
        <p className="text-slate-400 text-sm">
          Canvas/SVG floor plan viewer — coming after core CMMS is complete
        </p>
      </div>
    </div>
  )
}
