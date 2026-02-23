'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Part, PartStatus } from '@/types'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { Camera, Paperclip } from 'lucide-react'

type PartFormData = {
  part_number: string
  name: string
  description: string
  manufacturer: string
  vendor: string
  vendor_part_number: string
  alternate_part_number: string
  manufacturer_barcode: string
  unit_of_measure: string
  unit_cost: string
  quantity_on_hand: string
  reorder_point: string
  reorder_quantity: string
  par_quantity: string
  min_level: string
  max_level: string
  quantity_on_back_order: string
  location: string
  status: PartStatus
}

const DEFAULT: PartFormData = {
  part_number:           '',
  name:                  '',
  description:           '',
  manufacturer:          '',
  vendor:                '',
  vendor_part_number:    '',
  alternate_part_number: '',
  manufacturer_barcode:  '',
  unit_of_measure:       '',
  unit_cost:             '',
  quantity_on_hand:      '0',
  reorder_point:         '',
  reorder_quantity:      '',
  par_quantity:          '',
  min_level:             '',
  max_level:             '',
  quantity_on_back_order: '',
  location:              '',
  status:                'in_stock',
}

function partToFormData(part: Part): PartFormData {
  return {
    part_number:           part.part_number,
    name:                  part.name,
    description:           part.description ?? '',
    manufacturer:          part.manufacturer ?? '',
    vendor:                part.vendor ?? '',
    vendor_part_number:    part.vendor_part_number ?? '',
    alternate_part_number: part.alternate_part_number ?? '',
    manufacturer_barcode:  part.manufacturer_barcode ?? '',
    unit_of_measure:       part.unit_of_measure,
    unit_cost:             part.unit_cost?.toString() ?? '',
    quantity_on_hand:      part.quantity_on_hand.toString(),
    reorder_point:         part.reorder_point?.toString() ?? '',
    reorder_quantity:      part.reorder_quantity?.toString() ?? '',
    par_quantity:          part.par_quantity?.toString() ?? '',
    min_level:             part.min_level?.toString() ?? '',
    max_level:             part.max_level?.toString() ?? '',
    quantity_on_back_order: part.quantity_on_back_order?.toString() ?? '',
    location:              part.location ?? '',
    status:                part.status,
  }
}

const STATUS_OPTIONS: { value: PartStatus; label: string }[] = [
  { value: 'in_stock',     label: 'In Stock'     },
  { value: 'low_stock',    label: 'Low Stock'    },
  { value: 'out_of_stock', label: 'Out of Stock' },
  { value: 'on_order',     label: 'On Order'     },
]

interface PartFormProps {
  part?: Part
}

export default function PartForm({ part }: PartFormProps) {
  const router    = useRouter()
  const isEditing = !!part

  const [form, setForm]       = useState<PartFormData>(() =>
    part ? partToFormData(part) : DEFAULT
  )
  const [isSaving, setSaving] = useState(false)
  const [errors, setErrors]   = useState<Partial<Record<keyof PartFormData, string>>>({})

  function set<K extends keyof PartFormData>(field: K, value: PartFormData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof PartFormData, string>> = {}
    if (!form.part_number.trim())     errs.part_number     = 'Part number is required'
    if (!form.name.trim())            errs.name            = 'Name is required'
    if (!form.unit_of_measure.trim()) errs.unit_of_measure = 'Unit of measure is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      // TODO: wire to apiClient.parts.create() / .update()
      await new Promise((r) => setTimeout(r, 600))
      router.push('/parts')
      router.refresh()
    } catch {
      setErrors({ part_number: 'Save failed. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6 max-w-2xl">

      {/* Part Details */}
      <fieldset className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <legend className="text-sm font-semibold text-slate-700 px-1">Part Details</legend>

        <Input
          label="Part Number"
          value={form.part_number}
          onChange={(e) => set('part_number', e.target.value)}
          error={errors.part_number}
          placeholder="e.g. HOM-250190"
          className="font-mono"
          required
        />

        <Input
          label="Name"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          error={errors.name}
          placeholder="e.g. EB Feed Roller"
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
            placeholder="Brief description of this part…"
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Manufacturer"
            value={form.manufacturer}
            onChange={(e) => set('manufacturer', e.target.value)}
            placeholder="e.g. Homag"
          />
          <Input
            label="Vendor / Supplier"
            value={form.vendor}
            onChange={(e) => set('vendor', e.target.value)}
            placeholder="e.g. Stiles Machinery"
          />
        </div>

        <Input
          label="Vendor Part Number"
          value={form.vendor_part_number}
          onChange={(e) => set('vendor_part_number', e.target.value)}
          placeholder="e.g. STL-250190"
        />

        <Input
          label="Alternate Part #"
          value={form.alternate_part_number}
          onChange={(e) => set('alternate_part_number', e.target.value)}
          placeholder="e.g. ALT-250190"
          hint="Equivalent part from different manufacturer"
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Manufacturer Barcode</label>
          <input
            type="text"
            value={form.manufacturer_barcode}
            onChange={(e) => set('manufacturer_barcode', e.target.value)}
            placeholder="e.g. 012345678901"
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-mono text-slate-900 placeholder:text-slate-400 placeholder:font-sans focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </fieldset>

      {/* Inventory */}
      <fieldset className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <legend className="text-sm font-semibold text-slate-700 px-1">Inventory</legend>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Unit of Measure"
            value={form.unit_of_measure}
            onChange={(e) => set('unit_of_measure', e.target.value)}
            error={errors.unit_of_measure}
            placeholder="ea / ft / gal / kg…"
            required
          />
          <Input
            label="Unit Cost"
            type="number"
            min="0"
            step="0.01"
            value={form.unit_cost}
            onChange={(e) => set('unit_cost', e.target.value)}
            placeholder="0.00"
            hint="Optional"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="On Hand"
            type="number"
            min="0"
            step="1"
            value={form.quantity_on_hand}
            onChange={(e) => set('quantity_on_hand', e.target.value)}
          />
          <Input
            label="Reorder Point"
            type="number"
            min="0"
            step="1"
            value={form.reorder_point}
            onChange={(e) => set('reorder_point', e.target.value)}
            placeholder="—"
          />
          <Input
            label="Reorder Qty"
            type="number"
            min="1"
            step="1"
            value={form.reorder_quantity}
            onChange={(e) => set('reorder_quantity', e.target.value)}
            placeholder="—"
          />
        </div>

        <Input
          label="PAR Quantity"
          type="number"
          min="0"
          step="1"
          value={form.par_quantity}
          onChange={(e) => set('par_quantity', e.target.value)}
          placeholder="—"
          hint="Ideal stock level (Periodic Automatic Replenishment)"
        />

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Min Level"
            type="number"
            min="0"
            step="1"
            value={form.min_level}
            onChange={(e) => set('min_level', e.target.value)}
            placeholder="—"
          />
          <Input
            label="Max Level"
            type="number"
            min="0"
            step="1"
            value={form.max_level}
            onChange={(e) => set('max_level', e.target.value)}
            placeholder="—"
          />
          <Input
            label="On Backorder"
            type="number"
            min="0"
            step="1"
            value={form.quantity_on_back_order}
            onChange={(e) => set('quantity_on_back_order', e.target.value)}
            placeholder="0"
          />
        </div>

        <Input
          label="Location"
          value={form.location}
          onChange={(e) => set('location', e.target.value)}
          placeholder="Shelf B3, Row 2"
          hint="Optional — physical shelf/bin location"
        />
      </fieldset>

      {/* Status (edit only) */}
      {isEditing && (
        <fieldset className="rounded-xl border border-slate-200 bg-white p-5">
          <legend className="text-sm font-semibold text-slate-700 px-1">Status</legend>
          <div className="mt-2">
            <Select
              label="Stock Status"
              value={form.status}
              onChange={(e) => set('status', e.target.value as PartStatus)}
              options={STATUS_OPTIONS}
            />
          </div>
        </fieldset>
      )}

      {/* Photos (placeholder) */}
      <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center bg-white">
        <Camera className="mx-auto h-10 w-10 text-slate-300 mb-3" aria-hidden="true" />
        <p className="text-sm font-medium text-slate-600 mb-1">Upload photos</p>
        <p className="text-xs text-slate-400 mb-4">JPG, PNG up to 10MB</p>
        <button
          type="button"
          onClick={() => console.log('TODO: photo upload')}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        >
          Choose Files
        </button>
      </div>

      {/* Documents (placeholder) */}
      <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center bg-white">
        <Paperclip className="mx-auto h-10 w-10 text-slate-300 mb-3" aria-hidden="true" />
        <p className="text-sm font-medium text-slate-600 mb-1">Attach documents</p>
        <p className="text-xs text-slate-400 mb-4">PDF, DOCX, XLSX</p>
        <button
          type="button"
          onClick={() => console.log('TODO: document upload')}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        >
          Attach Files
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button type="submit" loading={isSaving} className="min-w-[120px]">
          {isEditing ? 'Save Changes' : 'Add Part'}
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
