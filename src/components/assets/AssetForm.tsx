'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Asset, DependencyCode } from '@/types'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { buildFacilityAssetId, buildAssetNumber } from '@/lib/asset-id'
import { MOCK_DEPARTMENTS } from '@/lib/mock-data'
import { MOCK_USERS } from '@/lib/mock-settings'
import { RefreshCw, AlertTriangle, Camera, Paperclip } from 'lucide-react'

type AssetFormData = {
  name: string
  description: string
  manufacturer: string
  model: string
  serial_number: string
  year_installed: string
  status: Asset['status']
  location_notes: string
  // ID components
  company_code: string
  building_code: string
  department_id: string
  department_code: string
  system_type: string
  unit_type: string
  dependency_code: DependencyCode
  dependency_group: string
  sequence: string
  // Barcode
  company_prefix: string
  type_code: string
  barcode_sequence: string
  // Meter
  current_meter_value: string
  meter_unit: string
  // Purchase Information
  purchase_price: string
  purchase_date: string
  purchase_invoice_number: string
  expected_life_years: string
  replacement_cost: string
  salvage_value: string
  // Warranty
  warranty_title: string
  warranty_expiration_date: string
  warranty_vendor: string
  // Key Dates
  date_of_manufacture: string
  date_placed_in_service: string
  date_removed: string
  out_of_service_begin: string
  out_of_service_end: string
  // Condition Assessment
  current_condition: string
  condition_date: string
  estimated_replace_date: string
  assessment_note: string
  // Safety & Procedures
  safety_note: string
  training_note: string
  shutdown_procedure_note: string
  loto_procedure_note: string
  emergency_note: string
  // Assignment & Tags
  assigned_to_id: string
  emergency_contact_id: string
  tag_number: string
  rfid: string
}

const DEFAULT_FORM: AssetFormData = {
  name: '',
  description: '',
  manufacturer: '',
  model: '',
  serial_number: '',
  year_installed: '',
  status: 'operational',
  location_notes: '',
  company_code: 'SC',
  building_code: 'B1',
  department_id: '',
  department_code: '',
  system_type: '',
  unit_type: '',
  dependency_code: 'C',
  dependency_group: '1',
  sequence: '1',
  company_prefix: 'SLD',
  type_code: '',
  barcode_sequence: '1',
  current_meter_value: '',
  meter_unit: 'hours',
  purchase_price: '',
  purchase_date: '',
  purchase_invoice_number: '',
  expected_life_years: '',
  replacement_cost: '',
  salvage_value: '',
  warranty_title: '',
  warranty_expiration_date: '',
  warranty_vendor: '',
  date_of_manufacture: '',
  date_placed_in_service: '',
  date_removed: '',
  out_of_service_begin: '',
  out_of_service_end: '',
  current_condition: '',
  condition_date: '',
  estimated_replace_date: '',
  assessment_note: '',
  safety_note: '',
  training_note: '',
  shutdown_procedure_note: '',
  loto_procedure_note: '',
  emergency_note: '',
  assigned_to_id: '',
  emergency_contact_id: '',
  tag_number: '',
  rfid: '',
}

function assetToFormData(asset: Asset): AssetFormData {
  return {
    name: asset.name,
    description: asset.description ?? '',
    manufacturer: asset.manufacturer ?? '',
    model: asset.model ?? '',
    serial_number: asset.serial_number ?? '',
    year_installed: asset.year_installed?.toString() ?? '',
    status: asset.status,
    location_notes: asset.location_notes ?? '',
    company_code: asset.company_code,
    building_code: asset.building_code,
    department_id: asset.department_id,
    department_code: asset.department_code,
    system_type: asset.system_type,
    unit_type: asset.unit_type,
    dependency_code: asset.dependency_code,
    dependency_group: asset.dependency_group.toString(),
    sequence: asset.sequence.toString(),
    company_prefix: asset.asset_number.split('-')[0],
    type_code: asset.asset_number.split('-')[1],
    barcode_sequence: parseInt(asset.asset_number.split('-')[2], 10).toString(),
    current_meter_value: asset.current_meter_value?.toString() ?? '',
    meter_unit: asset.meter_unit ?? 'hours',
    purchase_price: asset.purchase_price?.toString() ?? '',
    purchase_date: asset.purchase_date ?? '',
    purchase_invoice_number: asset.purchase_invoice_number ?? '',
    expected_life_years: asset.expected_life_years?.toString() ?? '',
    replacement_cost: asset.replacement_cost?.toString() ?? '',
    salvage_value: asset.salvage_value?.toString() ?? '',
    warranty_title: asset.warranty_title ?? '',
    warranty_expiration_date: asset.warranty_expiration_date ?? '',
    warranty_vendor: asset.warranty_vendor ?? '',
    date_of_manufacture: asset.date_of_manufacture ?? '',
    date_placed_in_service: asset.date_placed_in_service ?? '',
    date_removed: asset.date_removed ?? '',
    out_of_service_begin: asset.out_of_service_begin ?? '',
    out_of_service_end: asset.out_of_service_end ?? '',
    current_condition: asset.current_condition ?? '',
    condition_date: asset.condition_date ?? '',
    estimated_replace_date: asset.estimated_replace_date ?? '',
    assessment_note: asset.assessment_note ?? '',
    safety_note: asset.safety_note ?? '',
    training_note: asset.training_note ?? '',
    shutdown_procedure_note: asset.shutdown_procedure_note ?? '',
    loto_procedure_note: asset.loto_procedure_note ?? '',
    emergency_note: asset.emergency_note ?? '',
    assigned_to_id: asset.assigned_to_id ?? '',
    emergency_contact_id: asset.emergency_contact_id ?? '',
    tag_number: asset.tag_number ?? '',
    rfid: asset.rfid ?? '',
  }
}

const CONDITION_OPTIONS = [
  { value: '',         label: 'Not assessed'  },
  { value: 'excellent', label: 'Excellent'   },
  { value: 'good',     label: 'Good'          },
  { value: 'fair',     label: 'Fair'          },
  { value: 'poor',     label: 'Poor'          },
  { value: 'critical', label: 'Critical'      },
]

const ACTIVE_TECHS = MOCK_USERS.filter((u) => u.is_active && (u.role === 'technician' || u.role === 'manager' || u.role === 'admin'))

interface AssetFormProps {
  asset?: Asset   // undefined = new asset
}

export default function AssetForm({ asset }: AssetFormProps) {
  const router = useRouter()
  const isEditing = !!asset

  const [form, setForm] = useState<AssetFormData>(
    asset ? assetToFormData(asset) : DEFAULT_FORM
  )
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof AssetFormData, string>>>({})

  // Auto-derive department_code from selected department_id
  useEffect(() => {
    const dept = MOCK_DEPARTMENTS.find((d) => d.id === form.department_id)
    if (dept) {
      setForm((prev) => ({ ...prev, department_code: dept.code }))
    }
  }, [form.department_id])

  // Computed preview IDs
  const previewFacilityId =
    form.company_code && form.building_code && form.department_code &&
    form.system_type && form.unit_type && form.dependency_group && form.sequence
      ? buildFacilityAssetId({
          companyCode: form.company_code,
          buildingCode: form.building_code,
          departmentCode: form.department_code,
          systemType: form.system_type,
          unitType: form.unit_type,
          dependencyCode: form.dependency_code,
          dependencyGroup: parseInt(form.dependency_group) || 1,
          sequence: parseInt(form.sequence) || 1,
        })
      : null

  const previewAssetNumber =
    form.company_prefix && form.type_code && form.barcode_sequence
      ? buildAssetNumber({
          companyPrefix: form.company_prefix,
          typeCode: form.type_code,
          sequence: parseInt(form.barcode_sequence) || 1,
        })
      : null

  function set(field: keyof AssetFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof AssetFormData, string>> = {}
    if (!form.name.trim())           errs.name = 'Name is required'
    if (!form.department_id)         errs.department_id = 'Department is required'
    if (!form.system_type.trim())    errs.system_type = 'System type is required'
    if (!form.unit_type.trim())      errs.unit_type = 'Unit type is required'
    if (!form.type_code.trim())      errs.type_code = 'Type code is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setIsSaving(true)
    try {
      // TODO: wire to apiClient.assets.create() / .update()
      await new Promise((r) => setTimeout(r, 600))
      router.push('/assets')
      router.refresh()
    } catch {
      setErrors({ name: 'Save failed. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  const textareaClass = 'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y'

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6 max-w-3xl">

      {/* Smart ID Preview */}
      {(previewFacilityId || previewAssetNumber) && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-1">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
            Generated IDs
          </p>
          {previewFacilityId && (
            <p className="font-mono text-sm text-blue-900">{previewFacilityId}</p>
          )}
          {previewAssetNumber && (
            <p className="font-mono text-xs text-blue-700">{previewAssetNumber}</p>
          )}
        </div>
      )}

      {/* 1. Basic info */}
      <fieldset className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <legend className="text-sm font-semibold text-slate-700 px-1">Basic Information</legend>

        <Input
          label="Asset name"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          error={errors.name}
          placeholder="Edge Bander #1"
          required
        />

        <Input
          label="Description"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Homag Edgeteq S-500 edge banding machine"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Manufacturer"
            value={form.manufacturer}
            onChange={(e) => set('manufacturer', e.target.value)}
            placeholder="Homag"
          />
          <Input
            label="Model"
            value={form.model}
            onChange={(e) => set('model', e.target.value)}
            placeholder="Edgeteq S-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Serial number"
            value={form.serial_number}
            onChange={(e) => set('serial_number', e.target.value)}
            placeholder="HMG-2019-44821"
          />
          <Input
            label="Year installed"
            type="number"
            value={form.year_installed}
            onChange={(e) => set('year_installed', e.target.value)}
            placeholder="2019"
            min="1900"
            max={new Date().getFullYear() + 1}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => set('status', e.target.value)}
            options={[
              { value: 'operational',    label: 'Operational'    },
              { value: 'maintenance',    label: 'Maintenance'    },
              { value: 'down',           label: 'Down'           },
              { value: 'decommissioned', label: 'Decommissioned' },
            ]}
          />
          <Input
            label="Location notes"
            value={form.location_notes}
            onChange={(e) => set('location_notes', e.target.value)}
            placeholder="West wall, Bay A"
          />
        </div>
      </fieldset>

      {/* 2. Facility Asset ID builder */}
      <fieldset className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <legend className="flex items-center gap-2 text-sm font-semibold text-slate-700 px-1">
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Facility Asset ID
        </legend>
        <p className="text-xs text-slate-500">
          Format: <code className="font-mono bg-slate-100 px-1 rounded">COMPANY-BUILDING-DEPT-SYSTEM-UNIT-C1-01</code>
          <br />
          Dashes separate fields. Underscores for multi-word values (e.g. EDGE_BANDER).
        </p>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Input
            label="Company code"
            value={form.company_code}
            onChange={(e) => set('company_code', e.target.value.toUpperCase())}
            placeholder="SC"
            hint="e.g. SC for SOLLiD Cabinetry"
          />
          <Input
            label="Building code"
            value={form.building_code}
            onChange={(e) => set('building_code', e.target.value.toUpperCase())}
            placeholder="B1"
          />
          <Select
            label="Department"
            value={form.department_id}
            onChange={(e) => set('department_id', e.target.value)}
            options={MOCK_DEPARTMENTS.map((d) => ({ value: d.id, label: `${d.name} (${d.code})` }))}
            placeholder="Select department"
            error={errors.department_id}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="System type"
            value={form.system_type}
            onChange={(e) => set('system_type', e.target.value.toUpperCase())}
            placeholder="EDGE"
            error={errors.system_type}
            hint="Equipment category (e.g. EDGE, CNC, AIR)"
          />
          <Input
            label="Unit type"
            value={form.unit_type}
            onChange={(e) => set('unit_type', e.target.value.toUpperCase())}
            placeholder="EDGE_BANDER"
            error={errors.unit_type}
            hint="Use underscore for multi-word types"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Select
            label="Dependency code"
            value={form.dependency_code}
            onChange={(e) => set('dependency_code', e.target.value as DependencyCode)}
            options={[
              { value: 'C', label: 'C — Cell (independent)' },
              { value: 'L', label: 'L — Line (direct)'      },
              { value: 'U', label: 'U — Utility'            },
            ]}
          />
          <Input
            label="Group #"
            type="number"
            value={form.dependency_group}
            onChange={(e) => set('dependency_group', e.target.value)}
            min="1"
            placeholder="1"
            hint="e.g. 1 → C1"
          />
          <Input
            label="Sequence"
            type="number"
            value={form.sequence}
            onChange={(e) => set('sequence', e.target.value)}
            min="1"
            placeholder="1"
            hint="→ 01, 02 …"
          />
        </div>
      </fieldset>

      {/* 3. Barcode / Asset Number */}
      <fieldset className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <legend className="text-sm font-semibold text-slate-700 px-1">
          Barcode / Asset Number
        </legend>
        <p className="text-xs text-slate-500">
          Format: <code className="font-mono bg-slate-100 px-1 rounded">PREFIX-TYPE-0001</code>.
          Asset number = barcode number.
        </p>

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Company prefix"
            value={form.company_prefix}
            onChange={(e) => set('company_prefix', e.target.value.toUpperCase())}
            placeholder="SLD"
          />
          <Input
            label="Type code"
            value={form.type_code}
            onChange={(e) => set('type_code', e.target.value.toUpperCase())}
            placeholder="EB"
            error={errors.type_code}
            hint="Short abbreviation"
          />
          <Input
            label="Sequence"
            type="number"
            value={form.barcode_sequence}
            onChange={(e) => set('barcode_sequence', e.target.value)}
            min="1"
            placeholder="1"
            hint="→ 0001"
          />
        </div>
      </fieldset>

      {/* 4. Meter (optional) */}
      <fieldset className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <legend className="text-sm font-semibold text-slate-700 px-1">
          Meter Tracking <span className="font-normal text-slate-400">(optional)</span>
        </legend>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Current meter value"
            type="number"
            value={form.current_meter_value}
            onChange={(e) => set('current_meter_value', e.target.value)}
            placeholder="0"
            min="0"
          />
          <Select
            label="Unit"
            value={form.meter_unit}
            onChange={(e) => set('meter_unit', e.target.value)}
            options={[
              { value: 'hours',  label: 'Hours'  },
              { value: 'cycles', label: 'Cycles' },
              { value: 'miles',  label: 'Miles'  },
              { value: 'km',     label: 'km'     },
            ]}
          />
        </div>
      </fieldset>

      {/* 5. Purchase Information */}
      <fieldset className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <legend className="text-xs font-semibold uppercase tracking-wide text-slate-400 pb-3 px-1">
          Purchase Information
        </legend>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Purchase Price</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.purchase_price}
                onChange={(e) => set('purchase_price', e.target.value)}
                placeholder="0.00"
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 pl-7 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <Input
            label="Purchase Date"
            type="date"
            value={form.purchase_date}
            onChange={(e) => set('purchase_date', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Invoice Number"
            value={form.purchase_invoice_number}
            onChange={(e) => set('purchase_invoice_number', e.target.value)}
            placeholder="INV-2024-0042"
          />
          <Input
            label="Expected Life (years)"
            type="number"
            min="0"
            step="1"
            value={form.expected_life_years}
            onChange={(e) => set('expected_life_years', e.target.value)}
            placeholder="10"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Replacement Cost</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.replacement_cost}
                onChange={(e) => set('replacement_cost', e.target.value)}
                placeholder="0.00"
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 pl-7 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Salvage Value</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.salvage_value}
                onChange={(e) => set('salvage_value', e.target.value)}
                placeholder="0.00"
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 pl-7 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </fieldset>

      {/* 6. Warranty */}
      <fieldset className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <legend className="text-xs font-semibold uppercase tracking-wide text-slate-400 pb-3 px-1">
          Warranty
        </legend>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Warranty Title"
            value={form.warranty_title}
            onChange={(e) => set('warranty_title', e.target.value)}
            placeholder="Extended Parts Warranty"
          />
          <Input
            label="Expiration Date"
            type="date"
            value={form.warranty_expiration_date}
            onChange={(e) => set('warranty_expiration_date', e.target.value)}
          />
        </div>

        <Input
          label="Warranty Vendor / Contact"
          value={form.warranty_vendor}
          onChange={(e) => set('warranty_vendor', e.target.value)}
          placeholder="Homag North America"
        />
      </fieldset>

      {/* 7. Key Dates */}
      <fieldset className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <legend className="text-xs font-semibold uppercase tracking-wide text-slate-400 pb-3 px-1">
          Key Dates
        </legend>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Date of Manufacture"
            type="date"
            value={form.date_of_manufacture}
            onChange={(e) => set('date_of_manufacture', e.target.value)}
          />
          <Input
            label="Date Placed In Service"
            type="date"
            value={form.date_placed_in_service}
            onChange={(e) => set('date_placed_in_service', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Date Removed"
            type="date"
            value={form.date_removed}
            onChange={(e) => set('date_removed', e.target.value)}
          />
          <Input
            label="Out of Service — Begin"
            type="date"
            value={form.out_of_service_begin}
            onChange={(e) => set('out_of_service_begin', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Out of Service — End"
            type="date"
            value={form.out_of_service_end}
            onChange={(e) => set('out_of_service_end', e.target.value)}
          />
        </div>
      </fieldset>

      {/* 8. Condition Assessment */}
      <fieldset className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <legend className="text-xs font-semibold uppercase tracking-wide text-slate-400 pb-3 px-1">
          Condition Assessment
        </legend>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Current Condition"
            value={form.current_condition}
            onChange={(e) => set('current_condition', e.target.value)}
            options={CONDITION_OPTIONS}
          />
          <Input
            label="Assessment Date"
            type="date"
            value={form.condition_date}
            onChange={(e) => set('condition_date', e.target.value)}
          />
        </div>

        <Input
          label="Estimated Replacement Date"
          type="date"
          value={form.estimated_replace_date}
          onChange={(e) => set('estimated_replace_date', e.target.value)}
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Assessment Notes</label>
          <textarea
            value={form.assessment_note}
            onChange={(e) => set('assessment_note', e.target.value)}
            rows={3}
            placeholder="Notes about current condition…"
            className={textareaClass}
          />
        </div>

        {/* Read-only cost rollup — edit mode only */}
        {isEditing && (
          <div className="rounded-lg bg-slate-50 border border-slate-100 px-4 py-3 grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-500">Total WO Cost</p>
              <p className="text-sm font-semibold text-slate-800">$4,200</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Labor Hours</p>
              <p className="text-sm font-semibold text-slate-800">18.5 h</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Downtime</p>
              <p className="text-sm font-semibold text-slate-800">3d 4h</p>
            </div>
          </div>
        )}
      </fieldset>

      {/* 9. Safety & Procedures (collapsible) */}
      <details className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <summary className="flex items-center justify-between cursor-pointer select-none list-none px-5 py-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Safety &amp; Procedures</span>
          <span className="text-xs text-slate-400">Click to expand</span>
        </summary>

        <div className="px-5 pb-5 space-y-4 border-t border-slate-100 pt-4">
          {/* Warning banner */}
          <div className="flex items-start gap-2.5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" aria-hidden="true" />
            <p className="text-xs text-amber-700">
              This information is visible to all technicians assigned to this asset.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Safety Notes</label>
            <textarea
              value={form.safety_note}
              onChange={(e) => set('safety_note', e.target.value)}
              rows={4}
              placeholder="General safety warnings and PPE requirements…"
              className={textareaClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Training Notes</label>
            <textarea
              value={form.training_note}
              onChange={(e) => set('training_note', e.target.value)}
              rows={4}
              placeholder="Required training or certifications…"
              className={textareaClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Shutdown Procedure</label>
            <textarea
              value={form.shutdown_procedure_note}
              onChange={(e) => set('shutdown_procedure_note', e.target.value)}
              rows={4}
              placeholder="Step-by-step shutdown procedure…"
              className={textareaClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">LOTO Procedure</label>
            <textarea
              value={form.loto_procedure_note}
              onChange={(e) => set('loto_procedure_note', e.target.value)}
              rows={4}
              placeholder="Lockout / Tagout steps…"
              className={textareaClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Emergency Notes</label>
            <textarea
              value={form.emergency_note}
              onChange={(e) => set('emergency_note', e.target.value)}
              rows={4}
              placeholder="Emergency contacts, procedures, and escalation…"
              className={textareaClass}
            />
          </div>
        </div>
      </details>

      {/* 10. Assignment & Tags */}
      <fieldset className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <legend className="text-xs font-semibold uppercase tracking-wide text-slate-400 pb-3 px-1">
          Assignment &amp; Tags
        </legend>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Primary Technician"
            value={form.assigned_to_id}
            onChange={(e) => set('assigned_to_id', e.target.value)}
            placeholder="Unassigned"
            options={ACTIVE_TECHS.map((u) => ({ value: u.id, label: u.full_name }))}
          />
          <Select
            label="Emergency Contact"
            value={form.emergency_contact_id}
            onChange={(e) => set('emergency_contact_id', e.target.value)}
            placeholder="None"
            options={ACTIVE_TECHS.map((u) => ({ value: u.id, label: u.full_name }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tag Number</label>
            <input
              type="text"
              value={form.tag_number}
              onChange={(e) => set('tag_number', e.target.value)}
              placeholder="TAG-001"
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">RFID Tag</label>
            <input
              type="text"
              value={form.rfid}
              onChange={(e) => set('rfid', e.target.value)}
              placeholder="RFID-XXXXXXXX"
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </fieldset>

      {/* 11. Photos (placeholder) */}
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

      {/* 12. Documents (placeholder) */}
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
        <Button type="submit" loading={isSaving}>
          {isEditing ? 'Save Changes' : 'Create Asset'}
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
