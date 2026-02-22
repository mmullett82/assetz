'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { PMSchedule, PMFrequency } from '@/types'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { MOCK_ASSETS } from '@/lib/mock-data'

type PMFormData = {
  title: string
  description: string
  asset_id: string
  frequency: PMFrequency
  interval_value: string
  meter_interval: string
  estimated_hours: string
  instructions: string
  next_due_at: string
  is_active: boolean
}

const DEFAULT: PMFormData = {
  title: '',
  description: '',
  asset_id: '',
  frequency: 'monthly',
  interval_value: '',
  meter_interval: '',
  estimated_hours: '',
  instructions: '',
  next_due_at: '',
  is_active: true,
}

function pmToFormData(pm: PMSchedule): PMFormData {
  return {
    title:           pm.title,
    description:     pm.description,
    asset_id:        pm.asset_id,
    frequency:       pm.frequency,
    interval_value:  pm.interval_value?.toString() ?? '',
    meter_interval:  pm.meter_interval?.toString() ?? '',
    estimated_hours: pm.estimated_hours?.toString() ?? '',
    instructions:    pm.instructions ?? '',
    next_due_at:     pm.next_due_at ? pm.next_due_at.split('T')[0] : '',
    is_active:       pm.is_active,
  }
}

const FREQUENCY_OPTIONS: { value: PMFrequency; label: string }[] = [
  { value: 'daily',       label: 'Daily'           },
  { value: 'weekly',      label: 'Weekly'          },
  { value: 'biweekly',    label: 'Every 2 weeks'   },
  { value: 'monthly',     label: 'Monthly'         },
  { value: 'quarterly',   label: 'Quarterly'       },
  { value: 'semiannual',  label: 'Every 6 months'  },
  { value: 'annual',      label: 'Annual'          },
  { value: 'meter_based', label: 'Meter-based'     },
]

interface PMFormProps {
  pmSchedule?: PMSchedule
}

export default function PMForm({ pmSchedule }: PMFormProps) {
  const router    = useRouter()
  const isEditing = !!pmSchedule

  const [form, setForm]       = useState<PMFormData>(() =>
    pmSchedule ? pmToFormData(pmSchedule) : DEFAULT
  )
  const [isSaving, setSaving] = useState(false)
  const [errors, setErrors]   = useState<Partial<Record<keyof PMFormData, string>>>({})

  function set<K extends keyof PMFormData>(field: K, value: PMFormData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof PMFormData, string>> = {}
    if (!form.title.trim())   errs.title    = 'Title is required'
    if (!form.asset_id)       errs.asset_id = 'Asset is required'
    if (!form.next_due_at)    errs.next_due_at = 'Next due date is required'
    if (form.frequency === 'monthly' && form.interval_value) {
      const n = Number(form.interval_value)
      if (!Number.isInteger(n) || n < 1) errs.interval_value = 'Must be a whole number ≥ 1'
    }
    if (form.frequency === 'meter_based' && !form.meter_interval) {
      errs.meter_interval = 'Meter interval is required for meter-based PMs'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      // TODO: wire to apiClient.pmSchedules.create() / .update()
      await new Promise((r) => setTimeout(r, 600))
      router.push('/pm')
      router.refresh()
    } catch {
      setErrors({ title: 'Save failed. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const isMeterBased = form.frequency === 'meter_based'
  const isMonthly    = form.frequency === 'monthly'

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6 max-w-2xl">

      {/* Core details */}
      <fieldset className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <legend className="text-sm font-semibold text-slate-700 px-1">Schedule Details</legend>

        <Input
          label="Title"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          error={errors.title}
          placeholder="e.g. Quarterly Oil Change — Air Compressor"
          required
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Description <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={2}
            placeholder="Brief summary of what this PM covers…"
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
        </div>

        <Select
          label="Asset"
          value={form.asset_id}
          onChange={(e) => set('asset_id', e.target.value)}
          error={errors.asset_id}
          placeholder="Select asset"
          options={MOCK_ASSETS.map((a) => ({
            value: a.id,
            label: `${a.name} — ${a.facility_asset_id}`,
          }))}
        />
      </fieldset>

      {/* Schedule */}
      <fieldset className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <legend className="text-sm font-semibold text-slate-700 px-1">Frequency &amp; Schedule</legend>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Frequency"
            value={form.frequency}
            onChange={(e) => set('frequency', e.target.value as PMFrequency)}
            options={FREQUENCY_OPTIONS}
          />

          {isMonthly && (
            <Input
              label="Every N months"
              type="number"
              min="1"
              step="1"
              value={form.interval_value}
              onChange={(e) => set('interval_value', e.target.value)}
              error={errors.interval_value}
              placeholder="1"
              hint="Leave blank for every month"
            />
          )}

          {isMeterBased && (
            <Input
              label="Meter interval"
              type="number"
              min="1"
              value={form.meter_interval}
              onChange={(e) => set('meter_interval', e.target.value)}
              error={errors.meter_interval}
              placeholder="e.g. 500"
              hint="Units depend on the asset's meter type"
              required
            />
          )}

          <Input
            label="Estimated hours"
            type="number"
            min="0"
            step="0.25"
            value={form.estimated_hours}
            onChange={(e) => set('estimated_hours', e.target.value)}
            placeholder="0.0"
            hint="Optional — helps with scheduling"
          />
        </div>

        <Input
          label="Next due date"
          type="date"
          value={form.next_due_at}
          onChange={(e) => set('next_due_at', e.target.value)}
          error={errors.next_due_at}
          required
        />
      </fieldset>

      {/* Step-by-step instructions */}
      <fieldset className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
        <legend className="text-sm font-semibold text-slate-700 px-1">Instructions</legend>

        <p className="text-xs text-slate-400">
          Enter each step on its own line. Steps will appear as a checklist on the PM detail page.
        </p>
        <textarea
          value={form.instructions}
          onChange={(e) => set('instructions', e.target.value)}
          rows={8}
          placeholder={'1. Check oil level\n2. Drain condensate\n3. Replace air filter element\n4. Check belt tension…'}
          className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono"
        />
      </fieldset>

      {/* Status toggle (edit only) */}
      {isEditing && (
        <fieldset className="rounded-xl border border-slate-200 bg-white p-5">
          <legend className="text-sm font-semibold text-slate-700 px-1">Status</legend>
          <label className="flex items-center gap-3 cursor-pointer mt-2">
            <button
              type="button"
              role="switch"
              aria-checked={form.is_active}
              onClick={() => set('is_active', !form.is_active)}
              className={[
                'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                form.is_active ? 'bg-blue-600' : 'bg-slate-200',
              ].join(' ')}
            >
              <span
                className={[
                  'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transform transition-transform',
                  form.is_active ? 'translate-x-5' : 'translate-x-0',
                ].join(' ')}
              />
            </button>
            <span className="text-sm text-slate-700">
              {form.is_active ? 'Active — will generate upcoming PM reminders' : 'Inactive — schedule paused'}
            </span>
          </label>
        </fieldset>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button type="submit" loading={isSaving} className="min-w-[120px]">
          {isEditing ? 'Save Changes' : 'Create Schedule'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={isSaving}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
