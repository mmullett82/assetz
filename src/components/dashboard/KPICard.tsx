import type { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

type CardStatus = 'green' | 'yellow' | 'red' | 'neutral'

const STATUS_BORDER: Record<CardStatus, string> = {
  green:   'border-l-green-500',
  yellow:  'border-l-yellow-400',
  red:     'border-l-red-500',
  neutral: 'border-l-slate-300',
}

const STATUS_VALUE_COLOR: Record<CardStatus, string> = {
  green:   'text-slate-900',
  yellow:  'text-yellow-600',
  red:     'text-red-600',
  neutral: 'text-slate-900',
}

interface Delta {
  /** Raw numeric change (positive or negative) */
  value: number
  unit?: string
  /** Whether a positive delta is desirable for this metric */
  positiveIsGood: boolean
  label?: string   // e.g. "vs last week"
}

interface KPICardProps {
  label: string
  value: string | number
  icon?: ReactNode
  status?: CardStatus
  delta?: Delta
  sublabel?: string
  loading?: boolean
  href?: string
}

function DeltaIndicator({ delta }: { delta: Delta }) {
  const { value, unit = '', positiveIsGood, label = 'vs last 7d' } = delta
  if (value === 0) {
    return (
      <span className="flex items-center gap-0.5 text-xs text-slate-400">
        <Minus className="h-3 w-3" />
        No change
      </span>
    )
  }

  const isGood     = positiveIsGood ? value > 0 : value < 0
  const colorClass = isGood ? 'text-green-600' : 'text-red-500'
  const Icon       = value > 0 ? TrendingUp : TrendingDown
  const sign       = value > 0 ? '+' : ''

  return (
    <span className={`flex items-center gap-0.5 text-xs font-medium ${colorClass}`}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {sign}{value}{unit}
      <span className="text-slate-400 font-normal ml-0.5">{label}</span>
    </span>
  )
}

export default function KPICard({
  label,
  value,
  icon,
  status = 'neutral',
  delta,
  sublabel,
  loading = false,
}: KPICardProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm animate-pulse">
        <div className="h-3 w-24 rounded bg-slate-100" />
        <div className="mt-3 h-9 w-16 rounded bg-slate-100" />
        <div className="mt-2 h-3 w-20 rounded bg-slate-100" />
      </div>
    )
  }

  return (
    <div
      className={[
        'rounded-xl border border-slate-200 bg-white p-4 shadow-sm',
        'border-l-4 transition-shadow hover:shadow-md',
        STATUS_BORDER[status],
      ].join(' ')}
    >
      {/* Label + icon */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        {icon && (
          <span className="text-slate-300">{icon}</span>
        )}
      </div>

      {/* Value */}
      <p className={`mt-2 text-4xl font-bold tabular-nums leading-none ${STATUS_VALUE_COLOR[status]}`}>
        {value}
      </p>

      {/* Sublabel */}
      {sublabel && (
        <p className="mt-1 text-xs text-slate-400">{sublabel}</p>
      )}

      {/* Delta */}
      {delta && (
        <div className="mt-2">
          <DeltaIndicator delta={delta} />
        </div>
      )}
    </div>
  )
}
