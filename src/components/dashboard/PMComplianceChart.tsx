'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  type TooltipProps,
} from 'recharts'
import { PM_COMPLIANCE_DATA } from '@/lib/mock-dashboard'

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const rate   = payload.find((p) => p.dataKey === 'rate')?.value
  const target = payload.find((p) => p.dataKey === 'target')?.value
  const isBelow = (rate ?? 0) < (target ?? 90)

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <span
          className={`font-bold text-sm ${isBelow ? 'text-red-600' : 'text-green-600'}`}
        >
          {rate}%
        </span>
        <span className="text-slate-400">vs {target}% target</span>
      </div>
    </div>
  )
}

export default function PMComplianceChart() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-700">PM Compliance</h2>
        <p className="text-xs text-slate-400">Monthly rate vs. 90% target — last 6 months</p>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart
          data={PM_COMPLIANCE_DATA}
          margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[60, 100]}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* 90% target reference line */}
          <ReferenceLine
            y={90}
            stroke="#94a3b8"
            strokeDasharray="4 4"
            label={{
              value: 'Target 90%',
              position: 'insideTopRight',
              fontSize: 10,
              fill: '#94a3b8',
            }}
          />

          {/* Hide the target line from rendering as a series */}
          <Line dataKey="target" stroke="transparent" dot={false} legendType="none" />

          <Line
            dataKey="rate"
            name="Compliance"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={(props) => {
              const { cx, cy, payload } = props
              const isBelow = payload.rate < payload.target
              return (
                <circle
                  key={`dot-${cx}-${cy}`}
                  cx={cx}
                  cy={cy}
                  r={4}
                  fill={isBelow ? '#ef4444' : '#22c55e'}
                  stroke="white"
                  strokeWidth={2}
                />
              )
            }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
