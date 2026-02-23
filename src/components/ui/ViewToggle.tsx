'use client'

import { LayoutPanelLeft, Table2, CalendarDays } from 'lucide-react'
import type { ListViewMode } from '@/types'

interface ViewToggleProps {
  mode: ListViewMode
  onChange: (mode: ListViewMode) => void
  showCalendar?: boolean
}

export default function ViewToggle({ mode, onChange, showCalendar = false }: ViewToggleProps) {
  const buttons: { key: ListViewMode; icon: React.ReactNode; label: string }[] = [
    { key: 'panel',    icon: <LayoutPanelLeft className="h-4 w-4" />, label: 'Panel view'    },
    { key: 'table',    icon: <Table2 className="h-4 w-4" />,          label: 'Table view'    },
    ...(showCalendar
      ? [{ key: 'calendar' as ListViewMode, icon: <CalendarDays className="h-4 w-4" />, label: 'Calendar view' }]
      : []),
  ]

  return (
    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
      {buttons.map(({ key, icon, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          aria-label={label}
          className={[
            'flex items-center justify-center rounded-md p-2 transition-colors',
            mode === key
              ? 'bg-slate-900 text-white'
              : 'text-slate-400 hover:text-slate-700',
          ].join(' ')}
        >
          {icon}
        </button>
      ))}
    </div>
  )
}
