'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import {
  Cpu,
  Wrench,
  CalendarDays,
  Package,
  MapPin,
  Users,
  Upload,
  CheckCircle2,
  Circle,
  AlertTriangle,
  ChevronRight,
  FileText,
  X,
} from 'lucide-react'
import type { ImportEntityType, FieldMapping, ImportValidationRow } from '@/types'
import { ENTITY_FIELDS, suggestMapping } from '@/lib/import-field-maps'

// ─── Step Indicator ───────────────────────────────────────────────────────────

const STEP_LABELS = ['Entity Type', 'Upload File', 'Map Columns', 'Preview & Validate', 'Import']

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEP_LABELS.map((label, i) => {
        const num = i + 1
        const isActive = num === step
        const isComplete = num < step
        return (
          <div key={num} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={[
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                  isComplete ? 'bg-green-500 text-white' : isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500',
                ].join(' ')}
              >
                {isComplete ? <CheckCircle2 className="h-4 w-4" /> : num}
              </div>
              <span className={`mt-1 text-xs font-medium hidden sm:block ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`h-0.5 w-10 sm:w-14 mx-1 mb-4 ${isComplete ? 'bg-green-400' : 'bg-slate-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Entity Type Step ─────────────────────────────────────────────────────────

const ENTITY_OPTIONS: { type: ImportEntityType; label: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: 'assets',       label: 'Assets',        description: 'Equipment, machines, and facilities',     icon: Cpu          },
  { type: 'work_orders',  label: 'Work Orders',   description: 'Corrective and reactive maintenance jobs', icon: Wrench       },
  { type: 'pm_schedules', label: 'PM Schedules',  description: 'Planned preventive maintenance tasks',    icon: CalendarDays },
  { type: 'parts',        label: 'Parts',         description: 'Spare parts and inventory items',         icon: Package      },
  { type: 'locations',    label: 'Locations',     description: 'Buildings, departments, and areas',       icon: MapPin       },
  { type: 'users',        label: 'Users',         description: 'Technicians, managers, and requesters',   icon: Users        },
]

function EntityTypeStep({
  selected,
  onSelect,
  onNext,
}: {
  selected: ImportEntityType | null
  onSelect: (t: ImportEntityType) => void
  onNext: () => void
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 mb-1">What are you importing?</h2>
      <p className="text-sm text-slate-500 mb-5">Select the type of data in your file.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {ENTITY_OPTIONS.map(({ type, label, description, icon: Icon }) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className={[
              'rounded-xl border-2 p-4 text-left transition-all hover:shadow-sm',
              selected === type ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300',
            ].join(' ')}
          >
            <Icon className={`h-5 w-5 mb-2 ${selected === type ? 'text-blue-600' : 'text-slate-500'}`} />
            <p className={`text-sm font-semibold ${selected === type ? 'text-blue-700' : 'text-slate-800'}`}>{label}</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-tight">{description}</p>
          </button>
        ))}
      </div>
      <div className="flex justify-end">
        <button
          disabled={!selected}
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40 hover:bg-blue-700 transition-colors"
        >
          Continue <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// ─── Upload Step ──────────────────────────────────────────────────────────────

function UploadStep({
  fileName,
  fileSize,
  rowCount,
  columnCount,
  onFileLoad,
  onNext,
  onBack,
}: {
  fileName: string
  fileSize: string
  rowCount: number
  columnCount: number
  onFileLoad: (file: File) => void
  onNext: () => void
  onBack: () => void
}) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (file: File) => {
      onFileLoad(file)
    },
    [onFileLoad]
  )

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const hasFile = Boolean(fileName)

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 mb-1">Upload your file</h2>
      <p className="text-sm text-slate-500 mb-5">Drag & drop a CSV or Excel file, or click to browse.</p>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onClick={() => inputRef.current?.click()}
        className={[
          'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 cursor-pointer transition-colors mb-4',
          dragging ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:border-blue-300 hover:bg-slate-50',
        ].join(' ')}
      >
        <Upload className="h-8 w-8 text-slate-400 mb-3" />
        <p className="text-sm font-medium text-slate-700">Drop file here or click to browse</p>
        <p className="text-xs text-slate-400 mt-1">Supported: .csv, .xlsx, .xls</p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
      </div>

      {hasFile && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 flex items-start gap-3 mb-4">
          <FileText className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-green-800 truncate">{fileName}</p>
            <div className="flex gap-4 mt-1">
              <span className="text-xs text-green-600">{fileSize}</span>
              <span className="text-xs text-green-600">{rowCount.toLocaleString()} rows</span>
              <span className="text-xs text-green-600">{columnCount} columns</span>
            </div>
          </div>
          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
        </div>
      )}

      <div className="flex justify-between">
        <button onClick={onBack} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
          Back
        </button>
        <button
          disabled={!hasFile}
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40 hover:bg-blue-700 transition-colors"
        >
          Continue <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// ─── Column Map Step ──────────────────────────────────────────────────────────

const CONFIDENCE_ICONS = {
  auto:      <CheckCircle2 className="h-4 w-4 text-green-500" aria-label="Auto-mapped" />,
  suggested: <Circle className="h-4 w-4 text-yellow-400 fill-yellow-400" aria-label="Suggested" />,
  none:      <Circle className="h-4 w-4 text-slate-300" aria-label="Review needed" />,
}

function ColumnMapStep({
  mappings,
  entityType,
  onMappingChange,
  onNext,
  onBack,
}: {
  mappings: FieldMapping[]
  entityType: ImportEntityType
  onMappingChange: (idx: number, update: Partial<FieldMapping>) => void
  onNext: () => void
  onBack: () => void
}) {
  const fields = ENTITY_FIELDS[entityType]
  const requiredUnmapped = mappings.filter(m => m.required && !m.targetField && !m.skip)

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 mb-1">Map your columns</h2>
      <p className="text-sm text-slate-500 mb-5">
        Match your file&apos;s columns to assetZ fields. AI has auto-mapped what it can.
      </p>

      <div className="overflow-x-auto rounded-xl border border-slate-200 mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <th className="px-4 py-3 text-left">Your Column</th>
              <th className="px-4 py-3 text-left">Sample Data</th>
              <th className="px-4 py-3 text-left">Map to assetZ Field</th>
              <th className="px-4 py-3 text-center w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mappings.map((m, idx) => (
              <tr key={idx} className={m.skip ? 'opacity-40' : ''}>
                <td className="px-4 py-3 font-medium text-slate-800">{m.sourceColumn}</td>
                <td className="px-4 py-3 text-slate-500 text-xs max-w-[160px] truncate">{m.sampleValue || '—'}</td>
                <td className="px-4 py-3">
                  <select
                    value={m.targetField ?? ''}
                    disabled={m.skip}
                    onChange={(e) => onMappingChange(idx, { targetField: e.target.value || null })}
                    className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-700 disabled:bg-slate-50 w-full"
                  >
                    <option value="">— Skip this column —</option>
                    {fields.map(f => (
                      <option key={f.field} value={f.field}>
                        {f.label}{f.required ? ' *' : ''}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-center">
                  {m.skip ? (
                    <button onClick={() => onMappingChange(idx, { skip: false })} className="text-slate-400 hover:text-blue-600">
                      <X className="h-4 w-4" />
                    </button>
                  ) : (
                    CONFIDENCE_ICONS[m.confidence]
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {requiredUnmapped.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg bg-yellow-50 border border-yellow-200 p-3 mb-4">
          <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
          <p className="text-sm text-yellow-800">
            {requiredUnmapped.length} required field{requiredUnmapped.length > 1 ? 's' : ''} not mapped.
            Import may fail for rows missing these values.
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-1 text-xs text-slate-500">
          {CONFIDENCE_ICONS.auto} <span>Auto-mapped</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          {CONFIDENCE_ICONS.suggested} <span>Suggested</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          {CONFIDENCE_ICONS.none} <span>Review needed</span>
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
          Back
        </button>
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Preview <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// ─── Preview & Validate Step ──────────────────────────────────────────────────

function PreviewValidateStep({
  rawRows,
  mappings,
  validationRows,
  onNext,
  onBack,
}: {
  rawRows: Record<string, string>[]
  mappings: FieldMapping[]
  validationRows: ImportValidationRow[]
  onNext: () => void
  onBack: () => void
}) {
  const activeMappings = mappings.filter(m => m.targetField && !m.skip)
  const previewRows = validationRows.slice(0, 10)
  const errorCount = validationRows.filter(r => r.errors.length > 0).length
  const warningCount = validationRows.filter(r => r.warnings.length > 0).length
  const readyCount = rawRows.length - errorCount

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 mb-1">Preview &amp; Validate</h2>
      <p className="text-sm text-slate-500 mb-4">
        Showing first 10 rows. Cells with issues are highlighted.
      </p>

      {/* Summary bar */}
      <div className="flex flex-wrap gap-3 mb-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          <CheckCircle2 className="h-3.5 w-3.5" /> {readyCount.toLocaleString()} rows ready
        </span>
        {warningCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
            <AlertTriangle className="h-3.5 w-3.5" /> {warningCount} warnings
          </span>
        )}
        {errorCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
            <X className="h-3.5 w-3.5" /> {errorCount} errors
          </span>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 mb-5">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <th className="px-3 py-2 text-left w-10">#</th>
              {activeMappings.map(m => (
                <th key={m.targetField} className="px-3 py-2 text-left whitespace-nowrap">{m.targetField}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {previewRows.map((vr) => {
              const hasError = vr.errors.length > 0
              return (
                <tr key={vr.rowIndex} className={hasError ? 'bg-red-50' : ''}>
                  <td className="px-3 py-2 text-slate-400">{vr.rowIndex + 1}</td>
                  {activeMappings.map(m => {
                    const val = vr.data[m.targetField!] ?? ''
                    const missing = m.required && !val
                    return (
                      <td
                        key={m.targetField}
                        className={[
                          'px-3 py-2 max-w-[140px] truncate',
                          missing ? 'bg-red-100 text-red-700 font-medium' : 'text-slate-700',
                        ].join(' ')}
                        title={val}
                      >
                        {val || (missing ? 'MISSING' : '—')}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
          Back
        </button>
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Import {readyCount.toLocaleString()} rows <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// ─── Import Result Step ───────────────────────────────────────────────────────

const ENTITY_PATHS: Record<ImportEntityType, string> = {
  assets: '/assets',
  work_orders: '/work-orders',
  pm_schedules: '/pm',
  parts: '/parts',
  locations: '/settings',
  users: '/settings',
}

function ImportResultStep({
  entityType,
  rawRowCount,
}: {
  entityType: ImportEntityType
  rawRowCount: number
}) {
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const [counts, setCounts] = useState({ imported: 0, skipped: 0 })

  useEffect(() => {
    let current = 0
    const interval = setInterval(() => {
      current += 5
      setProgress(Math.min(current, 100))
      if (current >= 100) {
        clearInterval(interval)
        const skipped = Math.floor(rawRowCount * 0.04)
        setCounts({ imported: rawRowCount - skipped, skipped })
        setDone(true)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [rawRowCount])

  const MOCK_ERRORS = [
    `Row 12: Missing required field "name" — skipped`,
    `Row 47: Invalid date format in "install_date" — skipped`,
    `Row 91: Duplicate serial number "SN-2019-0042" — skipped`,
  ]

  const entityLabel = ENTITY_OPTIONS.find(e => e.type === entityType)?.label ?? entityType
  const path = ENTITY_PATHS[entityType]

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 mb-1">
        {done ? 'Import Complete' : 'Importing…'}
      </h2>
      <p className="text-sm text-slate-500 mb-5">
        {done ? `${entityLabel} have been imported into assetZ.` : 'Processing your file…'}
      </p>

      {/* Progress bar */}
      <div className="rounded-xl bg-slate-100 h-3 mb-2 overflow-hidden">
        <div
          style={{ width: `${progress}%` }}
          className="h-3 bg-blue-600 rounded-full transition-all duration-100"
        />
      </div>
      <p className="text-xs text-slate-500 text-right mb-6">{progress}%</p>

      {done && (
        <div className="space-y-4">
          <div className="rounded-xl bg-green-50 border border-green-200 p-5 flex items-center gap-4">
            <CheckCircle2 className="h-10 w-10 text-green-500 shrink-0" />
            <div>
              <p className="text-lg font-bold text-green-800">{counts.imported.toLocaleString()} {entityLabel} imported</p>
              <p className="text-sm text-green-600">{counts.skipped} rows skipped due to errors</p>
            </div>
          </div>

          {counts.skipped > 0 && (
            <div className="rounded-xl border border-slate-200">
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 rounded-t-xl">
                <p className="text-sm font-semibold text-slate-700">Skipped Rows ({counts.skipped})</p>
              </div>
              <ul className="divide-y divide-slate-100">
                {MOCK_ERRORS.slice(0, counts.skipped).map((err, i) => (
                  <li key={i} className="px-4 py-2.5 text-xs text-red-600 font-mono">{err}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end">
            <Link
              href={path}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              View Imported {entityLabel} <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

function getFirstNonEmpty(rows: Record<string, string>[], col: string): string {
  for (const row of rows) {
    const v = row[col]
    if (v && v.trim()) return v.trim()
  }
  return ''
}

export default function CSVWizard() {
  const [step, setStep] = useState(1)
  const [entityType, setEntityType] = useState<ImportEntityType | null>(null)
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState('')
  const [mappings, setMappings] = useState<FieldMapping[]>([])
  const [validationRows, setValidationRows] = useState<ImportValidationRow[]>([])

  const handleFileLoad = useCallback(
    (file: File) => {
      const ext = file.name.split('.').pop()?.toLowerCase()
      setFileName(file.name)
      const size = file.size < 1024 * 1024
        ? `${(file.size / 1024).toFixed(1)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      setFileSize(size)

      if (ext === 'csv') {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            const fields = (result.meta.fields ?? []) as string[]
            setHeaders(fields)
            setRawRows(result.data as Record<string, string>[])
          },
        })
      } else {
        file.arrayBuffer().then((ab) => {
          const wb = XLSX.read(ab)
          const ws = wb.Sheets[wb.SheetNames[0]]
          const data = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' })
          if (data.length > 0) {
            setHeaders(Object.keys(data[0]))
            setRawRows(data)
          }
        })
      }
    },
    []
  )

  // Build mappings when advancing from upload
  const buildMappings = useCallback(() => {
    if (!entityType) return
    const fields = ENTITY_FIELDS[entityType]
    const requiredSet = new Set(fields.filter(f => f.required).map(f => f.field))
    const newMappings: FieldMapping[] = headers.map(h => {
      const suggestion = suggestMapping(h, entityType)
      return {
        sourceColumn: h,
        sampleValue: getFirstNonEmpty(rawRows, h),
        targetField: suggestion.field,
        skip: false,
        confidence: suggestion.confidence,
        required: suggestion.field ? requiredSet.has(suggestion.field) : false,
      }
    })
    setMappings(newMappings)
  }, [entityType, headers, rawRows])

  // Validate rows when advancing from column map
  const buildValidation = useCallback(() => {
    const activeMappings = mappings.filter(m => m.targetField && !m.skip)
    const validated: ImportValidationRow[] = rawRows.slice(0, 50).map((row, idx) => {
      const data: Record<string, string> = {}
      activeMappings.forEach(m => {
        data[m.targetField!] = row[m.sourceColumn] ?? ''
      })
      const errors: string[] = []
      const warnings: string[] = []
      activeMappings.forEach(m => {
        if (m.required && !data[m.targetField!]) {
          errors.push(`Missing required: ${m.targetField}`)
        }
      })
      return { rowIndex: idx, data, errors, warnings }
    })
    setValidationRows(validated)
  }, [mappings, rawRows])

  const handleNext = () => {
    if (step === 2) buildMappings()
    if (step === 3) buildValidation()
    setStep(s => s + 1)
  }

  const updateMapping = (idx: number, update: Partial<FieldMapping>) => {
    setMappings(prev => prev.map((m, i) => i === idx ? { ...m, ...update } : m))
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/import" className="text-sm text-blue-600 hover:underline">← Back to Import</Link>
        <h1 className="text-xl font-bold text-slate-900 mt-2">CSV / Excel Import</h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <StepIndicator step={step} />

        {step === 1 && (
          <EntityTypeStep
            selected={entityType}
            onSelect={setEntityType}
            onNext={handleNext}
          />
        )}
        {step === 2 && (
          <UploadStep
            fileName={fileName}
            fileSize={fileSize}
            rowCount={rawRows.length}
            columnCount={headers.length}
            onFileLoad={handleFileLoad}
            onNext={handleNext}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && entityType && (
          <ColumnMapStep
            mappings={mappings}
            entityType={entityType}
            onMappingChange={updateMapping}
            onNext={handleNext}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <PreviewValidateStep
            rawRows={rawRows}
            mappings={mappings}
            validationRows={validationRows}
            onNext={handleNext}
            onBack={() => setStep(3)}
          />
        )}
        {step === 5 && entityType && (
          <ImportResultStep
            entityType={entityType}
            rawRowCount={rawRows.length || 100}
          />
        )}
      </div>
    </div>
  )
}
