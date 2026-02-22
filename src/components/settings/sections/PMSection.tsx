'use client'

import { useState } from 'react'
import ConfigList from '../ConfigList'
import ToggleSwitch from '../ToggleSwitch'
import {
  MOCK_PM_FREQUENCIES,
  MOCK_PM_DEFAULTS,
  MOCK_USERS,
  type ConfigItem,
  type MockPMDefaults,
} from '@/lib/mock-settings'

const PM_FREQ_SYSTEM_KEYS = [
  'daily', 'weekly', 'biweekly', 'monthly',
  'quarterly', 'semiannual', 'annual', 'meter_based',
]

export default function PMSection() {
  const [frequencies, setFrequencies] = useState<ConfigItem[]>(MOCK_PM_FREQUENCIES)
  const [defaults, setDefaults] = useState<MockPMDefaults>({ ...MOCK_PM_DEFAULTS })
  const [saved, setSaved] = useState(false)

  const assignableUsers = MOCK_USERS.filter(u => u.is_active && (u.role === 'technician' || u.role === 'manager'))

  function handleSaveDefaults(e: React.FormEvent) {
    e.preventDefault()
    console.log('Save PM defaults:', defaults)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      <ConfigList
        title="PM Frequencies"
        description="Available recurrence options for PM schedules."
        items={frequencies}
        onChange={setFrequencies}
        systemKeys={PM_FREQ_SYSTEM_KEYS}
      />

      {/* PM Defaults card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-slate-900">PM Defaults</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Default settings applied when creating new PM schedules.
          </p>
        </div>

        <form onSubmit={handleSaveDefaults} className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Skip if WO Already Open</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Don&apos;t generate a new PM work order if one is already open for this asset.
              </p>
            </div>
            <ToggleSwitch
              checked={defaults.skip_if_open}
              onChange={v => setDefaults(prev => ({ ...prev, skip_if_open: v }))}
              label="Skip if open work order exists"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Lead Time (days)
            </label>
            <p className="text-xs text-slate-400 mb-2">
              How many days before due date a PM work order is generated.
            </p>
            <input
              type="number"
              min={0}
              max={30}
              value={defaults.lead_time_days}
              onChange={e => setDefaults(prev => ({ ...prev, lead_time_days: Number(e.target.value) }))}
              className="w-32 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Auto-Assign To
            </label>
            <p className="text-xs text-slate-400 mb-2">
              Automatically assign new PM work orders to this user.
            </p>
            <select
              value={defaults.auto_assign_id}
              onChange={e => setDefaults(prev => ({ ...prev, auto_assign_id: e.target.value }))}
              className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">No auto-assignment</option>
              {assignableUsers.map(u => (
                <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>
              ))}
            </select>
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
