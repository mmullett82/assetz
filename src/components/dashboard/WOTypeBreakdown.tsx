'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from 'recharts'
import { WO_TYPE_DATA } from '@/lib/mock-dashboard'

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const { name, value, payload: p } = payload[0]
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg text-xs">
      <div className="flex items-center gap-2">
        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
        <span className="font-semibold text-slate-700">{name}</span>
        <span className="text-slate-400">{value}%</span>
      </div>
    </div>
  )
}

export default function WOTypeBreakdown() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-2">
        <h2 className="text-sm font-semibold text-slate-700">WO by Type</h2>
        <p className="text-xs text-slate-400">Distribution of work orders</p>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={WO_TYPE_DATA}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={78}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
          >
            {WO_TYPE_DATA.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <ul className="mt-2 space-y-1.5">
        {WO_TYPE_DATA.map((entry) => (
          <li key={entry.name} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span
                className="inline-block h-2 w-2 rounded-full shrink-0"
                style={{ background: entry.color }}
              />
              {entry.name}
            </span>
            <span className="font-semibold text-slate-700">{entry.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
