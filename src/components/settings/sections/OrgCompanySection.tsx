'use client'

import { useState } from 'react'
import { MOCK_COMPANY, type MockCompany } from '@/lib/mock-settings'

const TIMEZONES = [
  'America/Vancouver',
  'America/Edmonton',
  'America/Winnipeg',
  'America/Toronto',
  'America/Halifax',
  'America/St_Johns',
  'America/Chicago',
  'America/New_York',
  'America/Denver',
  'America/Los_Angeles',
]

export default function OrgCompanySection() {
  const [form, setForm]   = useState<MockCompany>({ ...MOCK_COMPANY })
  const [saved, setSaved] = useState(false)

  function handleChange(field: keyof MockCompany, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    console.log('Save company settings:', form)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-900">Company Information</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Organization details used throughout the system and in generated IDs.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <fieldset className="space-y-4">
          <legend className="text-xs font-semibold uppercase tracking-wide text-slate-400 pb-1">
            Company Identity
          </legend>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Company Code
              </label>
              <input
                type="text"
                required
                maxLength={8}
                value={form.code}
                onChange={e => handleChange('code', e.target.value.toUpperCase())}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="SC"
              />
              <p className="mt-1 text-xs text-slate-400">Used as the first segment in Facility Asset IDs.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Industry
              </label>
              <input
                type="text"
                value={form.industry}
                onChange={e => handleChange('industry', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-xs font-semibold uppercase tracking-wide text-slate-400 pb-1">
            Address
          </legend>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={form.address}
                onChange={e => handleChange('address', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={form.city}
                onChange={e => handleChange('city', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Province / State</label>
              <input
                type="text"
                maxLength={5}
                value={form.province}
                onChange={e => handleChange('province', e.target.value.toUpperCase())}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Postal Code</label>
              <input
                type="text"
                value={form.postal_code}
                onChange={e => handleChange('postal_code', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Timezone</label>
              <select
                value={form.timezone}
                onChange={e => handleChange('timezone', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {TIMEZONES.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Save Changes
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
  )
}
