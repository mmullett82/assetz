'use client'

import { useState } from 'react'
import type { SectionId } from '@/app/(dashboard)/settings/page'
import ConfigList from '../ConfigList'
import {
  MOCK_WO_STATUSES,
  MOCK_WO_PRIORITIES,
  MOCK_WO_TYPES,
  MOCK_WO_PROBLEM_CODES,
  MOCK_WO_CAUSE_CODES,
  MOCK_WO_CATEGORIES,
  type ConfigItem,
} from '@/lib/mock-settings'

const WO_TABS: SectionId[] = [
  'wo-statuses',
  'wo-priorities',
  'wo-types',
  'wo-problem-codes',
  'wo-cause-codes',
  'wo-categories',
]

const TAB_LABELS: Record<string, string> = {
  'wo-statuses':      'Statuses',
  'wo-priorities':    'Priorities',
  'wo-types':         'Types',
  'wo-problem-codes': 'Problem Codes',
  'wo-cause-codes':   'Cause Codes',
  'wo-categories':    'Categories',
}

interface WOConfigSectionProps {
  sectionId: SectionId
}

export default function WOConfigSection({ sectionId }: WOConfigSectionProps) {
  const initialIdx = Math.max(0, WO_TABS.indexOf(sectionId))
  const [tabIdx, setTabIdx] = useState(initialIdx)

  const [statuses,      setStatuses]      = useState<ConfigItem[]>(MOCK_WO_STATUSES)
  const [priorities,    setPriorities]    = useState<ConfigItem[]>(MOCK_WO_PRIORITIES)
  const [types,         setTypes]         = useState<ConfigItem[]>(MOCK_WO_TYPES)
  const [problemCodes,  setProblemCodes]  = useState<ConfigItem[]>(MOCK_WO_PROBLEM_CODES)
  const [causeCodes,    setCauseCodes]    = useState<ConfigItem[]>(MOCK_WO_CAUSE_CODES)
  const [categories,    setCategories]    = useState<ConfigItem[]>(MOCK_WO_CATEGORIES)

  const WO_STATUS_SYSTEM_KEYS = ['open', 'in_progress', 'on_hold', 'completed', 'cancelled']
  const WO_TYPE_SYSTEM_KEYS   = ['corrective', 'preventive', 'inspection', 'project', 'safety']

  function renderTab() {
    switch (WO_TABS[tabIdx]) {
      case 'wo-statuses':
        return (
          <ConfigList
            title="Work Order Statuses"
            description="Status values for the work order lifecycle."
            items={statuses}
            onChange={setStatuses}
            allowColor
            systemKeys={WO_STATUS_SYSTEM_KEYS}
          />
        )
      case 'wo-priorities':
        return (
          <ConfigList
            title="Work Order Priorities"
            description="Priority levels with due-date offset defaults."
            items={priorities}
            onChange={setPriorities}
            allowColor
            extraColumns={[{ key: 'due_offset_days', label: 'Due Offset (days)', type: 'number' }]}
          />
        )
      case 'wo-types':
        return (
          <ConfigList
            title="Work Order Types"
            description="Classification of maintenance activity types."
            items={types}
            onChange={setTypes}
            systemKeys={WO_TYPE_SYSTEM_KEYS}
          />
        )
      case 'wo-problem-codes':
        return (
          <ConfigList
            title="Problem Codes"
            description="Codes describing the symptom or failure observed."
            items={problemCodes}
            onChange={setProblemCodes}
          />
        )
      case 'wo-cause-codes':
        return (
          <ConfigList
            title="Cause Codes"
            description="Root cause classifications for failure analysis."
            items={causeCodes}
            onChange={setCauseCodes}
          />
        )
      case 'wo-categories':
        return (
          <ConfigList
            title="WO Categories"
            description="Groupings used in reporting and cost tracking."
            items={categories}
            onChange={setCategories}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {/* Tab strip */}
      <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
        {WO_TABS.map((tab, idx) => (
          <button
            key={tab}
            onClick={() => setTabIdx(idx)}
            className={[
              'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              tabIdx === idx
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900',
            ].join(' ')}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {renderTab()}
    </div>
  )
}
