'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Printer, RefreshCw, Shield } from 'lucide-react'
import { useScoreboard } from '@/hooks/useScoreboard'
import KPICard from '@/components/dashboard/KPICard'
import TechnicianTable from '@/components/scoreboard/TechnicianTable'

// ─── Period selector ───────────────────────────────────────────────────────────

type Period = 'week' | 'month' | 'quarter'

const PERIOD_LABELS: Record<Period, string> = {
  week:    'This Week',
  month:   'Feb 2026',
  quarter: 'Q1 2026',
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ScoreboardPage() {
  const [period, setPeriod] = useState<Period>('month')
  const { scores, teamSummary, isLoading, lastUpdated } = useScoreboard(period)

  const lastUpdatedStr = lastUpdated
    ? lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : '—'

  const printTitle = `SOLLiD Cabinetry · Maintenance Scoreboard · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`

  return (
    <div className="space-y-6">

      {/* Print-only title (hidden on screen) */}
      <div className="hidden print:block text-center py-4 border-b border-slate-300 mb-4">
        <p className="text-lg font-bold text-slate-900">{printTitle}</p>
      </div>

      {/* Back link */}
      <Link
        href="/reports"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors print:hidden"
      >
        <ArrowLeft className="h-4 w-4" />
        Reports
      </Link>

      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Maintenance Scoreboard</h1>
          <p className="mt-0.5 text-sm text-slate-500">{PERIOD_LABELS[period]}</p>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          {/* Period segmented buttons */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
            {(['week', 'month', 'quarter'] as Period[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={[
                  'px-3 py-1.5 text-sm font-medium transition-colors',
                  p === period
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-50',
                  p !== 'week' ? 'border-l border-slate-200' : '',
                ].join(' ')}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          {/* Print button */}
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>
      </div>

      {/* Auto-refresh indicator */}
      <p className="flex items-center gap-1.5 text-xs text-slate-400 print:hidden">
        <RefreshCw className="h-3 w-3" />
        Auto-refreshes every 60 seconds
        <span className="text-slate-300">·</span>
        Last updated {lastUpdatedStr}
      </p>

      {/* Team Summary KPI bar */}
      {teamSummary && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 print:grid-cols-4">
          <KPICard
            label="PM Completion Rate"
            value={`${teamSummary.pm_completion_rate}%`}
            status={teamSummary.pm_completion_rate >= 90 ? 'green' : teamSummary.pm_completion_rate >= 75 ? 'yellow' : 'red'}
            sublabel="Target: 90%"
            loading={isLoading}
          />
          <KPICard
            label="On-Time WO Rate"
            value={`${teamSummary.on_time_wo_rate}%`}
            status={teamSummary.on_time_wo_rate >= 90 ? 'green' : teamSummary.on_time_wo_rate >= 75 ? 'yellow' : 'red'}
            sublabel="Target: 90%"
            loading={isLoading}
          />
          <KPICard
            label="Preventive Work"
            value={`${teamSummary.preventive_pct}%`}
            status={teamSummary.preventive_pct >= 30 ? 'green' : 'yellow'}
            sublabel="Target: ≥30%"
            icon={<Shield className="h-5 w-5" />}
            loading={isLoading}
          />
          <KPICard
            label="Open Work Orders"
            value={teamSummary.total_open_wos}
            status={teamSummary.total_open_wos <= 3 ? 'green' : teamSummary.total_open_wos <= 8 ? 'yellow' : 'red'}
            sublabel="4–8 = caution zone"
            loading={isLoading}
          />
        </div>
      )}

      {/* Technician scoreboard */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Technician Scoreboard
        </h2>
        <TechnicianTable scores={scores} />
      </div>
    </div>
  )
}
