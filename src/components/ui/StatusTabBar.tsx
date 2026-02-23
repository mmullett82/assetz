'use client'

export interface TabDef {
  value: string | null   // null = "All"
  label: string
  count?: number         // count badge (only shown when provided)
  labelClass?: string    // colored text for unselected state
}

interface StatusTabBarProps {
  tabs: TabDef[]
  activeValue: string | null
  onChange: (value: string | null) => void
}

export default function StatusTabBar({ tabs, activeValue, onChange }: StatusTabBarProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-0.5">
      {tabs.map((tab) => {
        const isSelected = tab.value === activeValue
        return (
          <button
            key={tab.value ?? '__all__'}
            type="button"
            onClick={() => onChange(tab.value)}
            className={[
              'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              isSelected
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50',
            ].join(' ')}
          >
            <span className={!isSelected && tab.labelClass ? tab.labelClass : undefined}>
              {tab.label}
            </span>
            {tab.count !== undefined && (
              <span
                className={[
                  'rounded-full px-1.5 py-0.5 text-xs font-semibold leading-none',
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600',
                ].join(' ')}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
