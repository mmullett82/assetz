'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  CheckCircle2,
  ChevronRight,
  LogIn,
  Loader2,
  AlertTriangle,
  RotateCcw,
  X,
} from 'lucide-react'
import { PLATFORM_MOCK_DATA, PLATFORM_META } from '@/lib/mock-import-data'

// ─── Step Indicator ───────────────────────────────────────────────────────────

const STEP_LABELS = ['Connect', 'Select Data', 'Field Mapping', 'Import', 'Report']

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

// ─── Step 1: Connect ──────────────────────────────────────────────────────────

function ConnectStep({
  platform,
  onNext,
}: {
  platform: string
  onNext: () => void
}) {
  const [connecting, setConnecting] = useState(false)
  const [connected, setConnected] = useState(false)
  const meta = PLATFORM_META[platform] ?? PLATFORM_META['maintainx']
  const data = PLATFORM_MOCK_DATA[platform] ?? PLATFORM_MOCK_DATA['maintainx']

  const handleConnect = () => {
    setConnecting(true)
    setTimeout(() => {
      setConnecting(false)
      setConnected(true)
    }, 1500)
  }

  return (
    <div>
      {/* Branded header */}
      <div className={`rounded-xl ${meta.bgClass} bg-opacity-10 border-2 ${meta.borderClass} p-5 mb-6 text-center`}>
        <h2 className={`text-2xl font-bold ${meta.textClass} mb-1`}>{meta.label}</h2>
        <p className="text-sm text-slate-500">{meta.tagline}</p>
      </div>

      <div className="text-center mb-6">
        <p className="text-sm text-slate-600 mb-4">
          Connect your {meta.label} account to import your data directly into assetZ.
          We use a secure OAuth connection — your credentials are never stored.
        </p>

        {!connected ? (
          <button
            onClick={handleConnect}
            disabled={connecting}
            className={`inline-flex items-center gap-2 rounded-lg ${meta.bgClass} px-6 py-3 text-sm font-semibold text-white disabled:opacity-70 hover:opacity-90 transition-opacity`}
          >
            {connecting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Connecting…</>
            ) : (
              <><LogIn className="h-4 w-4" /> Connect to {meta.label}</>
            )}
          </button>
        ) : (
          <div className="rounded-xl bg-green-50 border-2 border-green-200 p-4 inline-flex items-center gap-3 text-left">
            <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800">Connected successfully</p>
              <p className="text-xs text-green-600">Signed in as {data.connectedAs}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          disabled={!connected}
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40 hover:bg-blue-700 transition-colors"
        >
          Continue <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// ─── Step 2: Select Entities ──────────────────────────────────────────────────

const ALL_ENTITY_KEYS = ['assets', 'work_orders', 'pm_schedules', 'parts', 'locations', 'users']
const ENTITY_LABELS: Record<string, string> = {
  assets: 'Assets',
  work_orders: 'Work Orders',
  pm_schedules: 'PM Schedules',
  parts: 'Parts & Inventory',
  locations: 'Locations',
  users: 'Users',
}

function SelectEntitiesStep({
  platform,
  selected,
  onToggle,
  onSelectAll,
  onDeselectAll,
  onNext,
  onBack,
}: {
  platform: string
  selected: Set<string>
  onToggle: (key: string) => void
  onSelectAll: () => void
  onDeselectAll: () => void
  onNext: () => void
  onBack: () => void
}) {
  const data = PLATFORM_MOCK_DATA[platform] ?? PLATFORM_MOCK_DATA['maintainx']

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 mb-1">Select what to import</h2>
      <p className="text-sm text-slate-500 mb-4">Choose which data types to bring into assetZ.</p>

      <div className="flex gap-2 mb-4">
        <button onClick={onSelectAll} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">
          Select All
        </button>
        <button onClick={onDeselectAll} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">
          Deselect All
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 mb-6">
        {ALL_ENTITY_KEYS.map(key => {
          const entity = data.entities[key]
          if (!entity) return null
          const isChecked = selected.has(key)
          return (
            <label key={key} className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => onToggle(key)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600"
              />
              <span className="flex-1 text-sm font-medium text-slate-800">{ENTITY_LABELS[key]}</span>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                ~{entity.count.toLocaleString()}
              </span>
            </label>
          )
        })}
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
          Back
        </button>
        <button
          disabled={selected.size === 0}
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40 hover:bg-blue-700 transition-colors"
        >
          Continue <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// ─── Step 3: Platform Field Map ───────────────────────────────────────────────

const PLATFORM_FIELD_MAP: Record<string, { source: string; target: string }[]> = {
  assets: [
    { source: 'Asset Name',    target: 'name' },
    { source: 'Category',      target: 'department' },
    { source: 'Location',      target: 'location' },
    { source: 'Serial Number', target: 'serial_number' },
    { source: 'Make',          target: 'manufacturer' },
    { source: 'Model Number',  target: 'model' },
    { source: 'Status',        target: 'status' },
  ],
  work_orders: [
    { source: 'Title',         target: 'title' },
    { source: 'Status',        target: 'status' },
    { source: 'Priority',      target: 'priority' },
    { source: 'Type',          target: 'type' },
    { source: 'Asset',         target: 'asset_id' },
    { source: 'Assigned To',   target: 'assigned_to' },
    { source: 'Due Date',      target: 'due_date' },
  ],
  pm_schedules: [
    { source: 'Title',         target: 'title' },
    { source: 'Frequency',     target: 'frequency' },
    { source: 'Asset',         target: 'asset_id' },
    { source: 'Assigned To',   target: 'assigned_to' },
    { source: 'Next Due',      target: 'next_due_at' },
  ],
  parts: [
    { source: 'Part Name',     target: 'name' },
    { source: 'Part Number',   target: 'part_number' },
    { source: 'Manufacturer',  target: 'manufacturer' },
    { source: 'Qty On Hand',   target: 'quantity_on_hand' },
    { source: 'Unit Cost',     target: 'unit_cost' },
  ],
  locations: [
    { source: 'Location Name', target: 'name' },
    { source: 'Code',          target: 'code' },
    { source: 'Building',      target: 'building' },
  ],
  users: [
    { source: 'Full Name',     target: 'full_name' },
    { source: 'Email',         target: 'email' },
    { source: 'Role',          target: 'role' },
  ],
}

function PlatformFieldMapStep({
  platform,
  selectedEntities,
  onNext,
  onBack,
}: {
  platform: string
  selectedEntities: Set<string>
  onNext: () => void
  onBack: () => void
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(selectedEntities))
  const data = PLATFORM_MOCK_DATA[platform] ?? PLATFORM_MOCK_DATA['maintainx']
  const meta = PLATFORM_META[platform] ?? PLATFORM_META['maintainx']

  const toggleExpand = (key: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 mb-1">Review field mapping</h2>
      <p className="text-sm text-slate-500 mb-4">
        Fields from {meta.label} have been pre-mapped to assetZ. You can adjust any mapping.
      </p>

      {/* Platform notes */}
      {data.fieldMappingNotes.length > 0 && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800 mb-1">{meta.label} mapping notes</p>
              <ul className="space-y-1">
                {data.fieldMappingNotes.map((note, i) => (
                  <li key={i} className="text-xs text-amber-700">• {note}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2 mb-6">
        {Array.from(selectedEntities).map(key => {
          const fieldMap = PLATFORM_FIELD_MAP[key] ?? []
          const isOpen = expanded.has(key)
          return (
            <div key={key} className="rounded-xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => toggleExpand(key)}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
              >
                <span className="text-sm font-semibold text-slate-800">{ENTITY_LABELS[key]}</span>
                <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
              </button>
              {isOpen && (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-white border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wide">
                      <th className="px-4 py-2 text-left">{meta.label} Field</th>
                      <th className="px-4 py-2 text-left">assetZ Field</th>
                      <th className="px-4 py-2 text-center w-16">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {fieldMap.map(({ source, target }) => (
                      <tr key={source}>
                        <td className="px-4 py-2.5 text-slate-600 font-mono">{source}</td>
                        <td className="px-4 py-2.5">
                          <select
                            defaultValue={target}
                            className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-700 w-full max-w-[180px]"
                          >
                            <option value={target}>{target}</option>
                          </select>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500 inline-block" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
          Back
        </button>
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Start Import <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// ─── Step 4: Import Progress ──────────────────────────────────────────────────

interface EntityProgress {
  done: number
  total: number
  status: 'queued' | 'importing' | 'complete'
}

function ImportProgressStep({
  platform,
  selectedEntities,
  entityProgress,
  timeRemaining,
  onDone,
}: {
  platform: string
  selectedEntities: Set<string>
  entityProgress: Record<string, EntityProgress>
  timeRemaining: number
  onDone: () => void
}) {
  const allComplete = Object.keys(entityProgress).length > 0 &&
    Object.values(entityProgress).every(e => e.status === 'complete')

  useEffect(() => {
    if (allComplete) {
      const t = setTimeout(onDone, 600)
      return () => clearTimeout(t)
    }
  }, [allComplete, onDone])

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 mb-1">Importing from {PLATFORM_META[platform]?.label ?? platform}…</h2>
      <p className="text-sm text-slate-500 mb-5">
        {allComplete ? 'All data has been imported.' : `Estimated time remaining: ${timeRemaining}s`}
      </p>

      <div className="space-y-3 mb-6">
        {Array.from(selectedEntities).map(key => {
          const prog = entityProgress[key]
          if (!prog) return null
          const pct = prog.total > 0 ? Math.round((prog.done / prog.total) * 100) : 0
          return (
            <div key={key} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-800">{ENTITY_LABELS[key]}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">{prog.done.toLocaleString()} / {prog.total.toLocaleString()}</span>
                  <span className={[
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                    prog.status === 'complete' ? 'bg-green-100 text-green-700' :
                    prog.status === 'importing' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-500',
                  ].join(' ')}>
                    {prog.status === 'complete' ? 'Complete' : prog.status === 'importing' ? 'Importing' : 'Queued'}
                  </span>
                </div>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  style={{ width: `${pct}%` }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    prog.status === 'complete' ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Step 5: Validation Report ────────────────────────────────────────────────

function ValidationReportStep({
  platform,
  entityProgress,
  onRollback,
  rolledBack,
}: {
  platform: string
  entityProgress: Record<string, EntityProgress>
  onRollback: () => void
  rolledBack: boolean
}) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [rolling, setRolling] = useState(false)
  const meta = PLATFORM_META[platform] ?? PLATFORM_META['maintainx']
  const data = PLATFORM_MOCK_DATA[platform] ?? PLATFORM_MOCK_DATA['maintainx']

  const totalImported = Object.values(entityProgress).reduce((sum, e) => sum + Math.floor(e.total * 0.96), 0)

  const handleConfirmRollback = () => {
    setShowConfirm(false)
    setRolling(true)
    setTimeout(() => {
      setRolling(false)
      onRollback()
    }, 1200)
  }

  if (rolledBack) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Rollback Complete</h2>
        <p className="text-sm text-slate-500 mb-6">All imported records have been removed.</p>
        <Link href="/import" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
          Back to Import
        </Link>
      </div>
    )
  }

  if (rolling) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-10 w-10 text-slate-400 animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-600">Rolling back…</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 mb-1">Import Complete</h2>
      <p className="text-sm text-slate-500 mb-4">Here&apos;s a summary of what was imported from {meta.label}.</p>

      {/* Summary table */}
      <div className="rounded-xl border border-slate-200 overflow-hidden mb-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <th className="px-4 py-3 text-left">Entity</th>
              <th className="px-4 py-3 text-right">Imported</th>
              <th className="px-4 py-3 text-right">Skipped</th>
              <th className="px-4 py-3 text-right">Failed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Object.entries(entityProgress).map(([key, prog]) => {
              const imported = Math.floor(prog.total * 0.96)
              const skipped = Math.floor(prog.total * 0.03)
              const failed = prog.total - imported - skipped
              return (
                <tr key={key}>
                  <td className="px-4 py-3 font-medium text-slate-800">{ENTITY_LABELS[key]}</td>
                  <td className="px-4 py-3 text-right text-green-600 font-semibold">{imported.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-yellow-600">{skipped}</td>
                  <td className="px-4 py-3 text-right text-red-500">{failed}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Sample record comparison */}
      <div className="rounded-xl border border-slate-200 overflow-hidden mb-5">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
          <p className="text-sm font-semibold text-slate-700">Sample Record Verification</p>
        </div>
        <div className="grid grid-cols-2 divide-x divide-slate-200">
          <div className="p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">{data.sampleRecord.platformLabel}</p>
            <dl className="space-y-1.5">
              {Object.entries(data.sampleRecord.source).map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-slate-400">{k}</dt>
                  <dd className="text-xs font-medium text-slate-700">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">In assetZ</p>
            <dl className="space-y-1.5">
              {Object.entries(data.sampleRecord.mapped).map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-slate-400">{k}</dt>
                  <dd className="text-xs font-medium text-green-700">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-slate-500">{totalImported.toLocaleString()} total records imported</p>
        <Link href="/assets" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
          View Imported Assets <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Rollback section */}
      <div className="rounded-xl border-2 border-red-200 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-red-700">Rollback Import</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Permanently remove all {totalImported.toLocaleString()} records imported in this session.
            </p>
          </div>
          <button
            onClick={() => setShowConfirm(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Rollback
          </button>
        </div>
      </div>

      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900">Rollback import?</h3>
              <button onClick={() => setShowConfirm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-5">
              This will permanently remove all <strong>{totalImported.toLocaleString()}</strong> records
              imported in this session. This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRollback}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
              >
                Yes, Roll Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

export default function PlatformWizard({ platform }: { platform: string }) {
  const meta = PLATFORM_META[platform] ?? PLATFORM_META['maintainx']
  const data = PLATFORM_MOCK_DATA[platform] ?? PLATFORM_MOCK_DATA['maintainx']

  const [step, setStep] = useState(1)
  const [selectedEntities, setSelectedEntities] = useState<Set<string>>(
    new Set(['assets', 'work_orders', 'parts'])
  )
  const [entityProgress, setEntityProgress] = useState<Record<string, EntityProgress>>({})
  const [timeRemaining, setTimeRemaining] = useState(8)
  const [rolledBack, setRolledBack] = useState(false)

  const toggleEntity = (key: string) => {
    setSelectedEntities(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  // Start import simulation when reaching step 4
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([])

  useEffect(() => {
    if (step !== 4) return

    // Initialize progress
    const initial: Record<string, EntityProgress> = {}
    Array.from(selectedEntities).forEach(key => {
      const entity = data.entities[key]
      if (entity) {
        initial[key] = { done: 0, total: entity.count, status: 'queued' }
      }
    })
    setEntityProgress(initial)

    // Countdown
    let t = 8
    const countdown = setInterval(() => {
      t -= 1
      setTimeRemaining(Math.max(0, t))
      if (t <= 0) clearInterval(countdown)
    }, 1000)
    intervalsRef.current.push(countdown)

    // Stagger entity imports
    Array.from(selectedEntities).forEach((key, i) => {
      const entity = data.entities[key]
      if (!entity) return

      const startDelay = i * 600
      const startTimeout = setTimeout(() => {
        setEntityProgress(prev => ({
          ...prev,
          [key]: { ...prev[key], status: 'importing' },
        }))

        const tickSize = Math.max(1, Math.floor(entity.count * 0.05))
        const interval = setInterval(() => {
          setEntityProgress(prev => {
            const cur = prev[key]
            if (!cur || cur.status === 'complete') return prev
            const next = Math.min(cur.done + tickSize, cur.total)
            return {
              ...prev,
              [key]: {
                ...cur,
                done: next,
                status: next >= cur.total ? 'complete' : 'importing',
              },
            }
          })
        }, 180 + i * 40)
        intervalsRef.current.push(interval)
      }, startDelay)

      // Store timeout id — can't push to intervalsRef directly but cleanup handles intervals
      void startTimeout
    })

    return () => {
      intervalsRef.current.forEach(clearInterval)
      intervalsRef.current = []
      clearInterval(countdown)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/import" className="text-sm text-blue-600 hover:underline">← Back to Import</Link>
        <h1 className="text-xl font-bold text-slate-900 mt-2">Import from {meta.label}</h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <StepIndicator step={step} />

        {step === 1 && (
          <ConnectStep platform={platform} onNext={() => setStep(2)} />
        )}
        {step === 2 && (
          <SelectEntitiesStep
            platform={platform}
            selected={selectedEntities}
            onToggle={toggleEntity}
            onSelectAll={() => setSelectedEntities(new Set(ALL_ENTITY_KEYS))}
            onDeselectAll={() => setSelectedEntities(new Set())}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <PlatformFieldMapStep
            platform={platform}
            selectedEntities={selectedEntities}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <ImportProgressStep
            platform={platform}
            selectedEntities={selectedEntities}
            entityProgress={entityProgress}
            timeRemaining={timeRemaining}
            onDone={() => setStep(5)}
          />
        )}
        {step === 5 && (
          <ValidationReportStep
            platform={platform}
            entityProgress={entityProgress}
            onRollback={() => setRolledBack(true)}
            rolledBack={rolledBack}
          />
        )}
      </div>
    </div>
  )
}
