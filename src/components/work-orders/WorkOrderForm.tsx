'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { WorkOrder, WorkOrderType, WorkOrderPriority, WorkOrderStatus } from '@/types'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { MOCK_ASSETS } from '@/lib/mock-data'

type WOFormData = {
  title: string
  description: string
  type: WorkOrderType
  priority: WorkOrderPriority
  status: WorkOrderStatus
  asset_id: string
  due_date: string
  estimated_hours: string
  failure_code: string
  cause_code: string
  remedy: string
}

const DEFAULT: WOFormData = {
  title: '',
  description: '',
  type: 'corrective',
  priority: 'medium',
  status: 'open',
  asset_id: '',
  due_date: '',
  estimated_hours: '',
  failure_code: '',
  cause_code: '',
  remedy: '',
}

function woToFormData(wo: WorkOrder): WOFormData {
  return {
    title:           wo.title,
    description:     wo.description,
    type:            wo.type,
    priority:        wo.priority,
    status:          wo.status,
    asset_id:        wo.asset_id,
    due_date:        wo.due_date ? wo.due_date.split('T')[0] : '',
    estimated_hours: wo.estimated_hours?.toString() ?? '',
    failure_code:    wo.failure_code ?? '',
    cause_code:      wo.cause_code ?? '',
    remedy:          wo.remedy ?? '',
  }
}

interface WorkOrderFormProps {
  workOrder?: WorkOrder
  defaultAssetId?: string
}

export default function WorkOrderForm({ workOrder, defaultAssetId }: WorkOrderFormProps) {
  const router    = useRouter()
  const isEditing = !!workOrder

  const [form, setForm]       = useState<WOFormData>(() => {
    const base = workOrder ? woToFormData(workOrder) : DEFAULT
    if (defaultAssetId && !base.asset_id) base.asset_id = defaultAssetId
    return base
  })
  const [isSaving, setSaving] = useState(false)
  const [errors, setErrors]   = useState<Partial<Record<keyof WOFormData, string>>>({})

  function set(field: keyof WOFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof WOFormData, string>> = {}
    if (!form.title.trim())   errs.title   = 'Title is required'
    if (!form.asset_id)       errs.asset_id = 'Asset is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      // TODO: wire to apiClient.workOrders.create() / .update()
      await new Promise((r) => setTimeout(r, 600))
      router.push('/work-orders')
      router.refresh()
    } catch {
      setErrors({ title: 'Save failed. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const isCompleted = form.status === 'completed'

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6 max-w-2xl">

      {/* Core details */}
      <fieldset className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <legend className="text-sm font-semibold text-slate-700 px-1">Work Order Details</legend>

        <Input
          label="Title"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          error={errors.title}
          placeholder="Describe the work to be done"
          required
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={4}
            placeholder="Detailed description of the issue or work required…"
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Type"
            value={form.type}
            onChange={(e) => set('type', e.target.value)}
            options={[
              { value: 'corrective',  label: 'Corrective'  },
              { value: 'preventive',  label: 'Preventive'  },
              { value: 'inspection',  label: 'Inspection'  },
              { value: 'project',     label: 'Project'     },
              { value: 'safety',      label: 'Safety'      },
            ]}
          />
          <Select
            label="Priority"
            value={form.priority}
            onChange={(e) => set('priority', e.target.value)}
            options={[
              { value: 'low',      label: 'Low'      },
              { value: 'medium',   label: 'Medium'   },
              { value: 'high',     label: 'High'     },
              { value: 'critical', label: '! Critical' },
            ]}
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

      {/* Scheduling */}
      <fieldset className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <legend className="text-sm font-semibold text-slate-700 px-1">Scheduling</legend>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Due date"
            type="date"
            value={form.due_date}
            onChange={(e) => set('due_date', e.target.value)}
            hint="Red/Yellow/Green status is computed from this"
          />
          <Input
            label="Estimated hours"
            type="number"
            value={form.estimated_hours}
            onChange={(e) => set('estimated_hours', e.target.value)}
            min="0"
            step="0.5"
            placeholder="2.5"
          />
        </div>

        {isEditing && (
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => set('status', e.target.value)}
            options={[
              { value: 'open',        label: 'Open'        },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'on_hold',     label: 'On Hold'     },
              { value: 'completed',   label: 'Completed'   },
              { value: 'cancelled',   label: 'Cancelled'   },
            ]}
          />
        )}
      </fieldset>

      {/* Failure / resolution codes */}
      <fieldset className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <legend className="text-sm font-semibold text-slate-700 px-1">
          Failure Codes <span className="font-normal text-slate-400">(optional)</span>
        </legend>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Failure code"
            value={form.failure_code}
            onChange={(e) => set('failure_code', e.target.value.toUpperCase())}
            placeholder="MECH, ELEC, FLUID…"
          />
          <Input
            label="Cause code"
            value={form.cause_code}
            onChange={(e) => set('cause_code', e.target.value.toUpperCase())}
            placeholder="WEAR, BREAK, SETUP…"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Resolution / remedy
          </label>
          <textarea
            value={form.remedy}
            onChange={(e) => set('remedy', e.target.value)}
            rows={3}
            placeholder="What was done to fix the issue…"
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
        </div>
      </fieldset>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button type="submit" loading={isSaving}>
          {isEditing ? 'Save Changes' : 'Create Work Order'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()} disabled={isSaving}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
