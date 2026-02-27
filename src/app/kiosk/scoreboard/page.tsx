'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Zap, X } from 'lucide-react'
import { useScoreboard } from '@/hooks/useScoreboard'
import type { TechnicianScore, TeamSummary } from '@/lib/mock-scoreboard'
import Stoplight from '@/components/ui/Stoplight'

// ─── Period auto-rotate ────────────────────────────────────────────────────────

const PERIODS = ['week', 'month', 'quarter'] as const
type Period = (typeof PERIODS)[number]

const PERIOD_LABELS: Record<Period, string> = {
  week:    'This Week',
  month:   'Feb 2026',
  quarter: 'Q1 2026',
}

const ROTATE_MS = 30_000 // 30 seconds per period
const TICK_MS   = 200

// ─── Team KPI item ─────────────────────────────────────────────────────────────

function KPIItem({
  label,
  value,
  status,
}: {
  label: string
  value: string
  status: 'green' | 'yellow' | 'red'
}) {
  const colors = { green: 'text-green-400', yellow: 'text-yellow-400', red: 'text-red-400' }
  return (
    <div className="text-center px-4">
      <div className={`text-5xl font-black tabular-nums ${colors[status]}`}>{value}</div>
      <div className="mt-1.5 text-xs font-semibold uppercase tracking-widest text-slate-400">
        {label}
      </div>
    </div>
  )
}

// ─── Tech card ─────────────────────────────────────────────────────────────────

function TechCard({ tech }: { tech: TechnicianScore }) {
  const borderColor = {
    green:  'border-green-500',
    yellow: 'border-yellow-400',
    red:    'border-red-500',
  }[tech.row_status]

  const onTimePctColor =
    tech.on_time_pct >= 90 ? 'text-green-400' :
    tech.on_time_pct >= 75 ? 'text-yellow-400' :
    'text-red-400'

  const pmPctColor =
    tech.pm_completion_pct >= 90 ? 'text-green-400' :
    tech.pm_completion_pct >= 75 ? 'text-yellow-400' :
    'text-red-400'

  return (
    <div className={`rounded-xl border-l-4 bg-slate-800 p-5 flex items-start gap-4 ${borderColor}`}>
      <Stoplight status={tech.row_status} size="lg" />

      <div className="flex-1 min-w-0">
        <div className="text-xl font-bold text-white truncate">{tech.name}</div>

        <div className={`mt-1 text-5xl font-black tabular-nums leading-none ${onTimePctColor}`}>
          {tech.on_time_pct.toFixed(0)}
          <span className="text-2xl font-bold">%</span>
          <span className="ml-2 text-sm font-normal text-slate-400">on-time</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          <span>
            <span className={`font-bold ${pmPctColor}`}>{tech.pm_completion_pct}%</span>
            <span className="ml-1 text-slate-400">PM</span>
          </span>
          <span>
            {tech.overdue_wos > 0 ? (
              <>
                <span className="font-bold text-red-400">{tech.overdue_wos}</span>
                <span className="ml-1 text-slate-400">overdue</span>
              </>
            ) : (
              <span className="font-semibold text-green-400">0 overdue</span>
            )}
          </span>
          <span>
            <span className="font-bold text-slate-300">
              {tech.completed_wos}/{tech.assigned_wos}
            </span>
            <span className="ml-1 text-slate-400">WOs</span>
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function teamStatus(
  val: number,
  greenAt: number,
  yellowAt: number,
): 'green' | 'yellow' | 'red' {
  return val >= greenAt ? 'green' : val >= yellowAt ? 'yellow' : 'red'
}

function openWoStatus(open: number): 'green' | 'yellow' | 'red' {
  return open <= 3 ? 'green' : open <= 8 ? 'yellow' : 'red'
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function KioskScoreboardPage() {
  // Live clock
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1_000)
    return () => clearInterval(id)
  }, [])

  // Period auto-rotate + progress bar
  const [periodIdx, setPeriodIdx] = useState(1) // start at 'month'
  const [progress,  setProgress]  = useState(0) // 0–100

  useEffect(() => {
    let elapsed = 0
    setProgress(0)
    const id = setInterval(() => {
      elapsed += TICK_MS
      setProgress(Math.min(100, (elapsed / ROTATE_MS) * 100))
      if (elapsed >= ROTATE_MS) {
        elapsed = 0
        setProgress(0)
        setPeriodIdx((i) => (i + 1) % PERIODS.length)
      }
    }, TICK_MS)
    return () => clearInterval(id)
  }, [])

  const period = PERIODS[periodIdx]
  const { scores, teamSummary } = useScoreboard(period)

  const clockStr = now.toLocaleTimeString('en-US', {
    hour:   '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month:   'long',
    day:     'numeric',
  })

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">

      {/* ── Top bar ── */}
      <header className="flex items-center gap-5 px-8 py-4 border-b border-slate-800 shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <Zap className="h-7 w-7 text-blue-400" aria-hidden="true" />
          <span className="text-xl font-black tracking-tight">assetZ</span>
        </div>

        <div className="h-7 w-px bg-slate-700" />

        {/* Title */}
        <div>
          <div className="text-base font-bold text-slate-100">Maintenance Scoreboard</div>
          <div className="text-xs text-slate-400">SOLLiD Cabinetry · Main Plant</div>
        </div>

        <div className="flex-1" />

        {/* Period label + progress bar */}
        <div className="text-right mr-2">
          <div className="text-sm font-semibold text-slate-200">{PERIOD_LABELS[period]}</div>
          <div className="mt-1.5 h-1 w-32 rounded-full bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500"
              style={{ width: `${progress}%`, transition: `width ${TICK_MS}ms linear` }}
            />
          </div>
        </div>

        {/* Clock */}
        <div className="text-right">
          <div className="text-3xl font-black tabular-nums leading-tight">{clockStr}</div>
          <div className="text-xs text-slate-400">{dateStr}</div>
        </div>

        {/* Exit */}
        <Link
          href="/reports/scoreboard"
          className="ml-3 flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          title="Exit TV mode"
          aria-label="Exit TV mode"
        >
          <X className="h-5 w-5" />
        </Link>
      </header>

      {/* ── Team KPI bar ── */}
      {teamSummary && (
        <div className="flex items-center justify-around border-b border-slate-800 py-6 px-8 shrink-0">
          <KPIItem
            label="PM Completion"
            value={`${teamSummary.pm_completion_rate}%`}
            status={teamStatus(teamSummary.pm_completion_rate, 90, 75)}
          />
          <div className="h-12 w-px bg-slate-700" />
          <KPIItem
            label="On-Time Rate"
            value={`${teamSummary.on_time_wo_rate}%`}
            status={teamStatus(teamSummary.on_time_wo_rate, 90, 75)}
          />
          <div className="h-12 w-px bg-slate-700" />
          <KPIItem
            label="Preventive Work"
            value={`${teamSummary.preventive_pct}%`}
            status={teamSummary.preventive_pct >= 30 ? 'green' : 'yellow'}
          />
          <div className="h-12 w-px bg-slate-700" />
          <KPIItem
            label="Open Work Orders"
            value={String(teamSummary.total_open_wos)}
            status={openWoStatus(teamSummary.total_open_wos)}
          />
        </div>
      )}

      {/* ── Tech card grid ── */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {scores.map((tech) => (
            <TechCard key={tech.user_id} tech={tech} />
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800 px-8 py-2 text-xs text-slate-600 flex items-center justify-between shrink-0">
        <span>Auto-refreshes every 60 s · Period rotates every 30 s</span>
        <span>chaiT · assetZ v0.1</span>
      </footer>
    </div>
  )
}
