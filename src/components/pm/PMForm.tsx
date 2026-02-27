'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { PMSchedule, PMFrequency, WorkOrderStatus } from '@/types'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { MOCK_ASSETS, MOCK_DEPARTMENTS } from '@/lib/mock-data'
import { MOCK_PARTS } from '@/lib/mock-parts'
import { X } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { USE_MOCK } from '@/lib/config'

type PMType = 'time_based' | 'meter_based' | 'time_meter_override'
type EndCondition = 'none' | 'occurrences' | 'date'

type RequiredPart = { part_id: string; quantity: number }

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
  // New fields
  pm_type: PMType
  expected_completion_days: string
  expected_completion_hours: string
  wo_creation_time: string
  default_wo_status: WorkOrderStatus
  default_problem_code: string
  default_cause_code: string
  end_condition: EndCondition
  end_occurrences: string
  end_date: string
  skip_if_open: boolean
  required_parts: RequiredPart[]
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
  pm_type: 'time_based',
  expected_completion_days: '',
  expected_completion_hours: '',
  wo_creation_time: '08:00',
  default_wo_status: 'open',
  default_problem_code: '',
  default_cause_code: '',
  end_condition: 'none',
  end_occurrences: '',
  end_date: '',
  skip_if_open: false,
  required_parts: [],
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
    pm_type:         pm.pm_type ?? 'time_based',
    expected_completion_days:  pm.expected_completion_days?.toString() ?? '',
    expected_completion_hours: pm.expected_completion_hours?.toString() ?? '',
    wo_creation_time:          pm.wo_creation_time ?? '08:00',
    default_wo_status:         pm.default_wo_status ?? 'open',
    default_problem_code:      pm.default_problem_code ?? '',
    default_cause_code:        pm.default_cause_code ?? '',
    end_condition:    pm.end_condition ?? 'none',
    end_occurrences:  pm.end_occurrences?.toString() ?? '',
    end_date:         pm.end_date ?? '',
    skip_if_open:     pm.skip_if_open ?? false,
    required_parts:   pm.required_parts ?? [],
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

const MOCK_PROBLEM_CODES = [
  { value: 'MECH', label: 'MECH — Mechanical' },
  { value: 'ELEC', label: 'ELEC — Electrical' },
  { value: 'FLUID', label: 'FLUID — Hydraulic/Pneumatic' },
  { value: 'CTRL', label: 'CTRL — Controls/PLC' },
  { value: 'SAFE', label: 'SAFE — Safety System' },
  { value: 'WEAR', label: 'WEAR — Normal Wear' },
]

const MOCK_CAUSE_CODES = [
  { value: 'WEAR', label: 'WEAR — Normal Wear' },
  { value: 'BREAK', label: 'BREAK — Breakage' },
  { value: 'SETUP', label: 'SETUP — Improper Setup' },
  { value: 'MAINT', label: 'MAINT — Lack of Maintenance' },
  { value: 'AGE', label: 'AGE — End of Life' },
  { value: 'OPR', label: 'OPR — Operator Error' },
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

  // Parts picker state
  const [pickerPartId, setPickerPartId] = useState('')
  const [pickerQty, setPickerQty]       = useState('1')

  function set<K extends keyof PMFormData>(field: K, value: PMFormData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function addPart() {
    if (!pickerPartId || !pickerQty) return
    const qty = parseInt(pickerQty) || 1
    setForm((prev) => ({
      ...prev,
      required_parts: [
        ...prev.required_parts.filter((p) => p.part_id !== pickerPartId),
        { part_id: pickerPartId, quantity: qty },
      ],
    }))
    setPickerPartId('')
    setPickerQty('1')
  }

  function removePart(partId: string) {
    setForm((prev) => ({
      ...prev,
      required_parts: prev.required_parts.filter((p) => p.part_id !== partId),
    }))
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof PMFormData, string>> = {}
    if (!form.title.trim())   errs.title    = 'Title is required'
    if (!form.asset_id)       errs.asset_id = 'Asset is required'
    if (!form.next_due_at)    errs.next_due_at = 'Next due date is required'
    if (form.pm_type !== 'meter_based' && form.frequency === 'monthly' && form.interval_value) {
      const n = Number(form.interval_value)
      if (!Number.isInteger(n) || n < 1) errs.interval_value = 'Must be a whole number ≥ 1'
    }
    if ((form.pm_type === 'meter_based' || form.frequency === 'meter_based') && !form.meter_interval) {
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
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 600))
      } else if (isEditing && pmSchedule) {
        await apiClient.pmSchedules.update(pmSchedule.id, form as unknown as Partial<PMSchedule>)
      } else {
        await apiClient.pmSchedules.create(form as unknown as Partial<PMSchedule>)
      }
      router.push('/pm')
      router.refresh()
    } catch {
      setErrors({ title: 'Save failed. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const isMeterBased = form.pm_type === 'meter_based' || form.frequency === 'meter_based'
  const isMonthly    = !isMeterBased && form.frequency === 'monthly'
  const showTimeFreq = form.pm_type !== 'meter_based'

  const partOptions = MOCK_PARTS.map((p) => ({
    value: p.id,
    label: `${p.name} — ${p.part_number}`,
  }))

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

      {/* Schedule Type */}
      <fieldset className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <legend className="text-sm font-semibold text-slate-700 px-1">Schedule Type</legend>

        <div className="flex rounded-lg border border-slate-200 overflow-hidden">
          {([
            { value: 'time_based',          label: 'Time-Based'          },
            { value: 'meter_based',          label: 'Meter-Based'         },
            { value: 'time_meter_override',  label: 'Time + Meter Override' },
          ] as { value: PMType; label: string }[]).map((opt, i, arr) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set('pm_type', opt.value)}
              className={[
                'flex-1 px-3 py-2.5 text-xs font-semibold transition-colors',
                i < arr.length - 1 ? 'border-r border-slate-200' : '',
                form.pm_type === opt.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50',
              ].join(' ')}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Frequency & Schedule */}
      <fieldset className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <legend className="text-sm font-semibold text-slate-700 px-1">Frequency &amp; Schedule</legend>

        <div className="grid grid-cols-2 gap-4">
          {showTimeFreq && (
            <Select
              label="Frequency"
              value={form.frequency}
              onChange={(e) => set('frequency', e.target.value as PMFrequency)}
              options={FREQUENCY_OPTIONS.filter((f) => f.value !== 'meter_based')}
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

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Next due date"
            type="date"
            value={form.next_due_at}
            onChange={(e) => set('next_due_at', e.target.value)}
            error={errors.next_due_at}
            required
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Generate WO at</label>
            <input
              type="time"
              value={form.wo_creation_time}
              onChange={(e) => set('wo_creation_time', e.target.value)}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Expected Completion */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Expected Completion</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              value={form.expected_completion_days}
              onChange={(e) => set('expected_completion_days', e.target.value)}
              placeholder="0"
              className="w-20 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-500">days</span>
            <input
              type="number"
              min="0"
              max="23"
              value={form.expected_completion_hours}
              onChange={(e) => set('expected_completion_hours', e.target.value)}
              placeholder="0"
              className="w-20 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-500">hours</span>
          </div>
        </div>
      </fieldset>

      {/* Work Order Defaults */}
      <fieldset className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <legend className="text-sm font-semibold text-slate-700 px-1">Work Order Defaults</legend>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Default WO Status"
            value={form.default_wo_status}
            onChange={(e) => set('default_wo_status', e.target.value as WorkOrderStatus)}
            options={[
              { value: 'open',        label: 'Open'        },
              { value: 'in_progress', label: 'In Progress' },
            ]}
          />
          <Select
            label="Default Problem Code"
            value={form.default_problem_code}
            onChange={(e) => set('default_problem_code', e.target.value)}
            placeholder="None"
            options={MOCK_PROBLEM_CODES}
          />
        </div>

        <Select
          label="Default Cause Code"
          value={form.default_cause_code}
          onChange={(e) => set('default_cause_code', e.target.value)}
          placeholder="None"
          options={MOCK_CAUSE_CODES}
        />
      </fieldset>

      {/* End Conditions */}
      <fieldset className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
        <legend className="text-sm font-semibold text-slate-700 px-1">End Conditions</legend>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="end_condition"
            value="none"
            checked={form.end_condition === 'none'}
            onChange={() => set('end_condition', 'none')}
            className="accent-blue-600"
          />
          <span className="text-sm text-slate-700">No end date</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="end_condition"
            value="occurrences"
            checked={form.end_condition === 'occurrences'}
            onChange={() => set('end_condition', 'occurrences')}
            className="accent-blue-600"
          />
          <span className="text-sm text-slate-700">End after</span>
          {form.end_condition === 'occurrences' && (
            <input
              type="number"
              min="1"
              value={form.end_occurrences}
              onChange={(e) => set('end_occurrences', e.target.value)}
              placeholder="12"
              className="w-20 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
          <span className="text-sm text-slate-700">occurrences</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="end_condition"
            value="date"
            checked={form.end_condition === 'date'}
            onChange={() => set('end_condition', 'date')}
            className="accent-blue-600"
          />
          <span className="text-sm text-slate-700">End on date</span>
          {form.end_condition === 'date' && (
            <input
              type="date"
              value={form.end_date}
              onChange={(e) => set('end_date', e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </label>
      </fieldset>

      {/* Options */}
      <fieldset className="rounded-xl border border-slate-200 bg-white p-5">
        <legend className="text-sm font-semibold text-slate-700 px-1 mb-3">Options</legend>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.skip_if_open}
            onChange={(e) => set('skip_if_open', e.target.checked)}
            className="mt-0.5 accent-blue-600"
          />
          <span className="text-sm text-slate-700">
            Don&apos;t generate a new WO if the previous PM work order is still open
          </span>
        </label>
      </fieldset>

      {/* Required Parts */}
      <fieldset className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <legend className="text-sm font-semibold text-slate-700 px-1">Required Parts</legend>

        <div className="flex gap-2">
          <div className="flex-1">
            <select
              value={pickerPartId}
              onChange={(e) => setPickerPartId(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select part…</option>
              {partOptions.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <input
            type="number"
            min="1"
            value={pickerQty}
            onChange={(e) => setPickerQty(e.target.value)}
            placeholder="Qty"
            className="w-20 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button type="button" onClick={addPart} disabled={!pickerPartId}>
            + Add
          </Button>
        </div>

        {form.required_parts.length > 0 && (
          <ul className="space-y-2">
            {form.required_parts.map((rp) => {
              const part = MOCK_PARTS.find((p) => p.id === rp.part_id)
              return (
                <li key={rp.part_id} className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                  <div>
                    <span className="text-sm font-medium text-slate-800">{part?.name ?? rp.part_id}</span>
                    <span className="ml-2 text-xs text-slate-500">× {rp.quantity}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePart(rp.part_id)}
                    className="rounded p-0.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    aria-label="Remove part"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
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
