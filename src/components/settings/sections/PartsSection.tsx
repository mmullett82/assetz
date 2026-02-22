'use client'

import { useState } from 'react'
import ConfigList from '../ConfigList'
import {
  MOCK_PARTS_CATEGORIES,
  MOCK_PARTS_UNITS,
  MOCK_PARTS_DEFAULTS,
  type ConfigItem,
  type MockPartsDefaults,
} from '@/lib/mock-settings'

const PARTS_UNIT_SYSTEM_KEYS = ['ea']

export default function PartsSection() {
  const [categories, setCategories] = useState<ConfigItem[]>(MOCK_PARTS_CATEGORIES)
  const [units,      setUnits]      = useState<ConfigItem[]>(MOCK_PARTS_UNITS)
  const [defaults,   setDefaults]   = useState<MockPartsDefaults>({ ...MOCK_PARTS_DEFAULTS })
  const [saved, setSaved] = useState(false)

  const activeUnits = units.filter(u => u.is_active)

  function handleSaveDefaults(e: React.FormEvent) {
    e.preventDefault()
    console.log('Save parts defaults:', defaults)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      <ConfigList
        title="Part Categories"
        description="Categories for organising parts inventory."
        items={categories}
        onChange={setCategories}
      />

      <ConfigList
        title="Units of Measure"
        description="Units used when issuing and ordering parts. 'Each' (ea) is a system default."
        items={units}
        onChange={setUnits}
        systemKeys={PARTS_UNIT_SYSTEM_KEYS}
      />

      {/* Parts defaults card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-slate-900">Parts Defaults</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Default values pre-filled when adding new parts to inventory.
          </p>
        </div>

        <form onSubmit={handleSaveDefaults} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Reorder Point
              </label>
              <p className="text-xs text-slate-400 mb-2">Trigger reorder when qty drops below this.</p>
              <input
                type="number"
                min={0}
                value={defaults.default_reorder_point}
                onChange={e => setDefaults(prev => ({ ...prev, default_reorder_point: Number(e.target.value) }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Reorder Quantity
              </label>
              <p className="text-xs text-slate-400 mb-2">Default quantity to order when restocking.</p>
              <input
                type="number"
                min={1}
                value={defaults.default_reorder_quantity}
                onChange={e => setDefaults(prev => ({ ...prev, default_reorder_quantity: Number(e.target.value) }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Default Unit of Measure
              </label>
              <p className="text-xs text-slate-400 mb-2">Pre-selected UOM for new parts.</p>
              <select
                value={defaults.default_unit_of_measure}
                onChange={e => setDefaults(prev => ({ ...prev, default_unit_of_measure: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {activeUnits.map(u => (
                  <option key={u.key} value={u.key}>{u.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Save Defaults
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Saved
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
