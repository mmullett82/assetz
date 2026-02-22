import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">
        KPI overview — real-time data coming via WebSocket.
      </p>

      {/* Placeholder KPI grid */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {[
          { label: 'Open Work Orders', value: '—', color: 'blue' },
          { label: 'Overdue', value: '—', color: 'red' },
          { label: 'Due Today', value: '—', color: 'yellow' },
          { label: 'Completed This Week', value: '—', color: 'green' },
          { label: 'Assets Down', value: '—', color: 'red' },
          { label: 'PM Compliance', value: '—%', color: 'green' },
          { label: 'Parts Low Stock', value: '—', color: 'yellow' },
          { label: 'Active Technicians', value: '—', color: 'blue' },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {kpi.label}
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{kpi.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
