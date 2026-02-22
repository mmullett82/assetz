import Link from 'next/link'
import { BarChart2, TrendingUp, FileDown } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Reports' }

const REPORTS = [
  {
    href: '/reports/scoreboard',
    icon: BarChart2,
    title: 'Maintenance Scoreboard',
    description: 'Technician accountability — PM completion, on-time rates, overdue WOs. Projected at standup, posted on the floor.',
    active: true,
  },
  {
    href: '#',
    icon: TrendingUp,
    title: 'Trend Analysis',
    description: 'WO volume, failure patterns, MTTR trends over time.',
    active: false,
  },
  {
    href: '#',
    icon: FileDown,
    title: 'PM Compliance Export',
    description: 'Export PM completion history to CSV for audits and compliance review.',
    active: false,
  },
]

export default function ReportsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
      <p className="mt-1 text-sm text-slate-500">
        Maintenance analytics and accountability tools.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((report) => {
          const Icon = report.icon
          const card = (
            <div
              className={[
                'rounded-xl border bg-white p-5 shadow-sm transition-shadow',
                report.active
                  ? 'border-slate-200 hover:shadow-md cursor-pointer'
                  : 'border-slate-200 opacity-60 pointer-events-none',
              ].join(' ')}
            >
              <div className="flex items-start gap-3">
                <div className={`rounded-lg p-2 ${report.active ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-slate-900">{report.title}</h2>
                    {!report.active && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                        Coming soon
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    {report.description}
                  </p>
                </div>
              </div>
            </div>
          )

          return report.active ? (
            <Link key={report.title} href={report.href} className="block">
              {card}
            </Link>
          ) : (
            <div key={report.title}>{card}</div>
          )
        })}
      </div>
    </div>
  )
}
