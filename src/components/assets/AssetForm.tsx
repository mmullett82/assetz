'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Asset, DependencyCode } from '@/types'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { buildFacilityAssetId, buildAssetNumber } from '@/lib/asset-id'
import { MOCK_DEPARTMENTS } from '@/lib/mock-data'
import { RefreshCw } from 'lucide-react'

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
  }
}

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

      {/* Basic info */}
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

      {/* Facility Asset ID builder */}
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

      {/* Barcode / Asset Number */}
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

      {/* Meter (optional) */}
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
