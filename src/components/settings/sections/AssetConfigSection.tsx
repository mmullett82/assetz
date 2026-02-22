'use client'

import { useState } from 'react'
import type { SectionId } from '@/app/(dashboard)/settings/page'
import ConfigList from '../ConfigList'
import {
  MOCK_ASSET_STATUSES,
  MOCK_ASSET_CONDITIONS,
  MOCK_ASSET_CRITICALITY,
  MOCK_ASSET_CATEGORIES,
  MOCK_ASSET_SYSTEM_TYPES,
  MOCK_ASSET_METER_TYPES,
  type ConfigItem,
} from '@/lib/mock-settings'

const ASSET_TABS: SectionId[] = [
  'asset-statuses',
  'asset-conditions',
  'asset-criticality',
  'asset-categories',
  'asset-system-types',
  'asset-meter-types',
]

const TAB_LABELS: Record<string, string> = {
  'asset-statuses':     'Statuses',
  'asset-conditions':   'Conditions',
  'asset-criticality':  'Criticality',
  'asset-categories':   'Categories',
  'asset-system-types': 'System Types',
  'asset-meter-types':  'Meter Types',
}

interface AssetConfigSectionProps {
  sectionId: SectionId
}

export default function AssetConfigSection({ sectionId }: AssetConfigSectionProps) {
  const initialIdx = Math.max(0, ASSET_TABS.indexOf(sectionId))
  const [tabIdx, setTabIdx] = useState(initialIdx)

  const [statuses,    setStatuses]    = useState<ConfigItem[]>(MOCK_ASSET_STATUSES)
  const [conditions,  setConditions]  = useState<ConfigItem[]>(MOCK_ASSET_CONDITIONS)
  const [criticality, setCriticality] = useState<ConfigItem[]>(MOCK_ASSET_CRITICALITY)
  const [categories,  setCategories]  = useState<ConfigItem[]>(MOCK_ASSET_CATEGORIES)
  const [systemTypes, setSystemTypes] = useState<ConfigItem[]>(MOCK_ASSET_SYSTEM_TYPES)
  const [meterTypes,  setMeterTypes]  = useState<ConfigItem[]>(MOCK_ASSET_METER_TYPES)

  const ASSET_STATUS_SYSTEM_KEYS = ['operational', 'down', 'maintenance', 'decommissioned']

  function renderTab() {
    switch (ASSET_TABS[tabIdx]) {
      case 'asset-statuses':
        return (
          <ConfigList
            title="Asset Statuses"
            description="Status values shown on asset cards and detail pages."
            items={statuses}
            onChange={setStatuses}
            allowColor
            systemKeys={ASSET_STATUS_SYSTEM_KEYS}
          />
        )
      case 'asset-conditions':
        return (
          <ConfigList
            title="Asset Conditions"
            description="Physical condition assessments recorded during inspections."
            items={conditions}
            onChange={setConditions}
          />
        )
      case 'asset-criticality':
        return (
          <ConfigList
            title="Asset Criticality"
            description="Criticality ratings used to prioritize maintenance."
            items={criticality}
            onChange={setCriticality}
            allowColor
          />
        )
      case 'asset-categories':
        return (
          <ConfigList
            title="Asset Categories"
            description="High-level groupings for filtering and reporting."
            items={categories}
            onChange={setCategories}
          />
        )
      case 'asset-system-types':
        return (
          <ConfigList
            title="System Types"
            description="System type codes used in Facility Asset IDs (e.g., CNC, EDGE)."
            items={systemTypes}
            onChange={setSystemTypes}
          />
        )
      case 'asset-meter-types':
        return (
          <ConfigList
            title="Meter Types"
            description="Units used for meter-based PM schedules."
            items={meterTypes}
            onChange={setMeterTypes}
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
        {ASSET_TABS.map((tab, idx) => (
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
