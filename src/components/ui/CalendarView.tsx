'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface CalendarItem {
  id: string
  title: string
  dueDate: string   // ISO date string
  isOverdue: boolean
  href: string
}

interface CalendarViewProps {
  items: CalendarItem[]
  onItemClick?: (id: string) => void
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
}

export default function CalendarView({ items, onItemClick }: CalendarViewProps) {
  const [viewType, setViewType] = useState<'month' | 'week'>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [expandedDay, setExpandedDay] = useState<string | null>(null)

  const today = new Date()

  // --- Month helpers ---
  function getMonthGrid(date: Date): (Date | null)[] {
    const year  = date.getFullYear()
    const month = date.getMonth()
    const first = new Date(year, month, 1)
    const last  = new Date(year, month + 1, 0)
    const grid: (Date | null)[] = []
    // Leading nulls for days before month start
    for (let i = 0; i < first.getDay(); i++) grid.push(null)
    for (let d = 1; d <= last.getDate(); d++) grid.push(new Date(year, month, d))
    // Trailing nulls to complete last row
    while (grid.length % 7 !== 0) grid.push(null)
    return grid
  }

  // --- Week helpers ---
  function getWeekDays(date: Date): Date[] {
    const day = date.getDay()
    const sunday = new Date(date)
    sunday.setDate(date.getDate() - day)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sunday)
      d.setDate(sunday.getDate() + i)
      return d
    })
  }

  function getItemsForDay(d: Date) {
    return items.filter((item) => isSameDay(new Date(item.dueDate), d))
  }

  function navigate(dir: -1 | 1) {
    const next = new Date(currentDate)
    if (viewType === 'month') {
      next.setMonth(next.getMonth() + dir)
    } else {
      next.setDate(next.getDate() + dir * 7)
    }
    setCurrentDate(next)
    setExpandedDay(null)
  }

  function goToday() {
    setCurrentDate(new Date())
    setExpandedDay(null)
  }

  const monthLabel = currentDate.toLocaleDateString('en-CA', { month: 'long', year: 'numeric' })

  // ─── Month View ──────────────────────────────────────────────────────────────
  const monthGrid = getMonthGrid(currentDate)
  const weekDays  = getWeekDays(currentDate)

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-md p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goToday}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => navigate(1)}
            className="rounded-md p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-slate-800">{monthLabel}</span>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-0.5">
          {(['month', 'week'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setViewType(v)}
              className={[
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors capitalize',
                viewType === v ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-800',
              ].join(' ')}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Day column headers */}
      <div className="grid grid-cols-7 border-b border-slate-100">
        {DAY_LABELS.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-semibold text-slate-400">{d}</div>
        ))}
      </div>

      {/* Month grid */}
      {viewType === 'month' && (
        <div className="grid grid-cols-7">
          {monthGrid.map((day, i) => {
            if (!day) {
              return <div key={`empty-${i}`} className="min-h-[80px] border-b border-r border-slate-100 bg-slate-50/50" />
            }
            const dayItems = getItemsForDay(day)
            const isToday  = isSameDay(day, today)
            const dayKey   = day.toISOString().slice(0, 10)
            const isExpanded = expandedDay === dayKey
            const MAX_VISIBLE = 3

            return (
              <div
                key={dayKey}
                className={[
                  'min-h-[80px] border-b border-r border-slate-100 p-1.5',
                  isToday ? 'bg-blue-50' : 'bg-white hover:bg-slate-50',
                ].join(' ')}
              >
                <div className={[
                  'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium mb-1',
                  isToday ? 'bg-blue-600 text-white' : 'text-slate-500',
                ].join(' ')}>
                  {day.getDate()}
                </div>

                <div className="space-y-0.5">
                  {(isExpanded ? dayItems : dayItems.slice(0, MAX_VISIBLE)).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onItemClick ? onItemClick(item.id) : undefined}
                      className={[
                        'block w-full truncate rounded px-1 py-0.5 text-left text-[11px] font-medium transition-colors',
                        item.isOverdue
                          ? 'text-red-600 bg-red-50 hover:bg-red-100'
                          : 'text-slate-700 bg-slate-100 hover:bg-slate-200',
                      ].join(' ')}
                      title={item.title}
                    >
                      {item.title}
                    </button>
                  ))}
                  {!isExpanded && dayItems.length > MAX_VISIBLE && (
                    <button
                      type="button"
                      onClick={() => setExpandedDay(dayKey)}
                      className="block w-full text-left text-[11px] text-blue-600 hover:underline pl-1"
                    >
                      +{dayItems.length - MAX_VISIBLE} more
                    </button>
                  )}
                  {isExpanded && (
                    <button
                      type="button"
                      onClick={() => setExpandedDay(null)}
                      className="block w-full text-left text-[11px] text-slate-400 hover:text-slate-600 pl-1"
                    >
                      Show less
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Week grid */}
      {viewType === 'week' && (
        <div className="grid grid-cols-7">
          {weekDays.map((day) => {
            const dayItems = getItemsForDay(day)
            const isToday  = isSameDay(day, today)
            const dayKey   = day.toISOString().slice(0, 10)

            return (
              <div
                key={dayKey}
                className={[
                  'min-h-[200px] border-r border-slate-100 p-2',
                  isToday ? 'bg-blue-50' : 'bg-white',
                ].join(' ')}
              >
                <div className={[
                  'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium mb-2',
                  isToday ? 'bg-blue-600 text-white' : 'text-slate-500',
                ].join(' ')}>
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {dayItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onItemClick ? onItemClick(item.id) : undefined}
                      className={[
                        'block w-full truncate rounded px-1.5 py-1 text-left text-xs font-medium transition-colors',
                        item.isOverdue
                          ? 'text-red-600 bg-red-50 hover:bg-red-100'
                          : 'text-slate-700 bg-slate-100 hover:bg-slate-200',
                      ].join(' ')}
                      title={item.title}
                    >
                      {item.title}
                    </button>
                  ))}
                  {dayItems.length === 0 && (
                    <p className="text-xs text-slate-300 px-1">—</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
