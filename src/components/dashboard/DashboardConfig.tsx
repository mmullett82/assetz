'use client'

import { useState, useEffect } from 'react'
import { Settings2, X } from 'lucide-react'

export interface DashboardSections {
  workBreakdown: boolean
  myWorkCenter: boolean
  quickLinks: boolean
  charts: boolean
}

const DEFAULTS: DashboardSections = {
  workBreakdown: false,
  myWorkCenter: true,
  quickLinks: true,
  charts: false,
}

const LABELS: Record<keyof DashboardSections, string> = {
  workBreakdown: 'Work & Inventory Breakdown',
  myWorkCenter: 'My Work Center',
  quickLinks: 'Quick Actions',
  charts: 'Charts & Trends',
}

// v3 key — simplified defaults (work breakdown + charts off by default)
const STORAGE_KEY = 'dashboard-sections-v3'

export function useDashboardSections() {
  const [sections, setSections] = useState<DashboardSections>(() => {
    if (typeof window === 'undefined') return DEFAULTS
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS
    } catch {
      return DEFAULTS
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sections))
  }, [sections])

  return { sections, setSections }
}

interface DashboardConfigProps {
  sections: DashboardSections
  onChange: (sections: DashboardSections) => void
}

export default function DashboardConfig({ sections, onChange }: DashboardConfigProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        title="Configure dashboard sections"
      >
        <Settings2 className="h-4 w-4" />
        Configure
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 w-60 rounded-lg border border-slate-200 bg-white py-2 shadow-lg">
            <div className="flex items-center justify-between px-3 pb-2 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-700">Show Sections</span>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="px-3 pt-2 pb-1 text-xs text-slate-400">Status cards are always shown</p>
            {(Object.keys(LABELS) as (keyof DashboardSections)[]).map((key) => (
              <label
                key={key}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={sections[key]}
                  onChange={() => onChange({ ...sections, [key]: !sections[key] })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                {LABELS[key]}
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
