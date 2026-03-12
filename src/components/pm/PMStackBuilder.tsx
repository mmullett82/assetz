'use client'

import { useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, X, ChevronDown, ChevronUp, GripVertical, Layers, ArrowRight, ArrowLeft,
  Check, AlertCircle, Upload, FileText, Sparkles, Loader2, Settings2,
} from 'lucide-react'
import AssetCombobox from '@/components/ui/AssetCombobox'
import Button from '@/components/ui/Button'
import apiClient from '@/lib/api-client'
import { USE_MOCK } from '@/lib/config'
import type { PMFrequency } from '@/types'
import type { ExtractionResult } from '@/app/api/pm-schedules/extract/route'

/* ─── Types ─── */

type IntervalItem = {
  id: string
  frequency: PMFrequency
  title: string
  estimatedHours: string
  tasks: string[]
  cascade: boolean
  collapsed: boolean
  // Advanced settings
  showAdvanced: boolean
  skipIfOpen: boolean
  endCondition: 'none' | 'occurrences' | 'date'
  endOccurrences: string
  endDate: string
  defaultProblemCode: string
  defaultCauseCode: string
}

type Step = 'asset' | 'source' | 'build' | 'review'

const FREQ_ORDER: PMFrequency[] = ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'semiannual', 'annual']

const FREQ_LABELS: Record<PMFrequency, string> = {
  daily: 'Daily', weekly: 'Weekly', biweekly: 'Every 2 Weeks', monthly: 'Monthly',
  quarterly: 'Quarterly', semiannual: 'Every 6 Months', annual: 'Annual', meter_based: 'Meter-Based',
}

const FREQ_COLORS: Record<PMFrequency, string> = {
  daily: 'bg-violet-100 text-violet-700 border-violet-200',
  weekly: 'bg-blue-100 text-blue-700 border-blue-200',
  biweekly: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  monthly: 'bg-green-100 text-green-700 border-green-200',
  quarterly: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  semiannual: 'bg-orange-100 text-orange-700 border-orange-200',
  annual: 'bg-red-100 text-red-700 border-red-200',
  meter_based: 'bg-slate-100 text-slate-700 border-slate-200',
}

const PROBLEM_CODES = [
  { value: '', label: 'None' },
  { value: 'MECH', label: 'MECH — Mechanical' },
  { value: 'ELEC', label: 'ELEC — Electrical' },
  { value: 'FLUID', label: 'FLUID — Hydraulic/Pneumatic' },
  { value: 'CTRL', label: 'CTRL — Controls/PLC' },
  { value: 'SAFE', label: 'SAFE — Safety System' },
  { value: 'WEAR', label: 'WEAR — Normal Wear' },
]

let _id = 0
function uid() { return `interval_${++_id}` }

function makeInterval(freq: PMFrequency, title = '', tasks: string[] = [''], hours = ''): IntervalItem {
  return {
    id: uid(), frequency: freq, title, estimatedHours: hours, tasks,
    cascade: true, collapsed: false, showAdvanced: false,
    skipIfOpen: false, endCondition: 'none', endOccurrences: '', endDate: '',
    defaultProblemCode: '', defaultCauseCode: '',
  }
}

/* ─── Breadcrumb ─── */

function Breadcrumb({ steps, current, onNavigate }: {
  steps: { key: Step; label: string }[]
  current: Step
  onNavigate: (s: Step) => void
}) {
  const idx = steps.findIndex((s) => s.key === current)
  return (
    <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
      {steps.map((s, i) => (
        <span key={s.key} className="flex items-center gap-2">
          {i > 0 && <ArrowRight className="h-3 w-3 text-slate-300" />}
          {i < idx ? (
            <button onClick={() => onNavigate(s.key)} className="text-blue-600 hover:text-blue-700 font-medium">
              {s.label}
            </button>
          ) : i === idx ? (
            <span className="font-semibold text-slate-900">{s.label}</span>
          ) : (
            <span>{s.label}</span>
          )}
        </span>
      ))}
    </div>
  )
}

/* ─── Main Component ─── */

export default function PMStackBuilder() {
  const router = useRouter()

  const [step, setStep] = useState<Step>('asset')
  const [assetId, setAssetId] = useState('')
  const [intervals, setIntervals] = useState<IntervalItem[]>([])
  const [nextDue, setNextDue] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  })
  const [isSaving, setSaving] = useState(false)
  const [created, setCreated] = useState(false)

  // Document upload state
  const fileRef = useRef<HTMLInputElement>(null)
  const [extracting, setExtracting] = useState(false)
  const [extractResult, setExtractResult] = useState<ExtractionResult | null>(null)
  const [extractError, setExtractError] = useState('')

  const usedFreqs = new Set(intervals.map((i) => i.frequency))
  const availableFreqs = FREQ_ORDER.filter((f) => !usedFreqs.has(f))
  const sortedIntervals = useMemo(
    () => [...intervals].sort((a, b) => FREQ_ORDER.indexOf(a.frequency) - FREQ_ORDER.indexOf(b.frequency)),
    [intervals]
  )

  const STEPS: { key: Step; label: string }[] = [
    { key: 'asset', label: 'Asset' },
    { key: 'source', label: 'Source' },
    { key: 'build', label: 'Build' },
    { key: 'review', label: 'Review' },
  ]

  /* ── Interval helpers ── */

  function addInterval(freq: PMFrequency) {
    setIntervals((prev) => [...prev, makeInterval(freq)])
  }

  function removeInterval(id: string) {
    setIntervals((prev) => prev.filter((i) => i.id !== id))
  }

  function updateInterval(id: string, updates: Partial<IntervalItem>) {
    setIntervals((prev) => prev.map((i) => i.id === id ? { ...i, ...updates } : i))
  }

  function addTask(id: string) {
    setIntervals((prev) => prev.map((i) => i.id === id ? { ...i, tasks: [...i.tasks, ''] } : i))
  }

  function updateTask(id: string, idx: number, value: string) {
    setIntervals((prev) => prev.map((i) =>
      i.id === id ? { ...i, tasks: i.tasks.map((t, j) => j === idx ? value : t) } : i
    ))
  }

  function removeTask(id: string, idx: number) {
    setIntervals((prev) => prev.map((i) =>
      i.id === id ? { ...i, tasks: i.tasks.filter((_, j) => j !== idx) } : i
    ))
  }

  function getCascadedTasks(interval: IntervalItem): string[] {
    const myIdx = FREQ_ORDER.indexOf(interval.frequency)
    const myTasks = interval.tasks.filter((t) => t.trim())
    if (!interval.cascade) return myTasks
    const shorter: string[] = []
    sortedIntervals.forEach((o) => {
      if (FREQ_ORDER.indexOf(o.frequency) < myIdx) {
        o.tasks.filter((t) => t.trim()).forEach((t) => { if (!shorter.includes(t)) shorter.push(t) })
      }
    })
    return [...shorter, ...myTasks]
  }

  function canReview() {
    return intervals.length > 0 && intervals.every((i) => i.tasks.some((t) => t.trim()))
  }

  /* ── Document extraction ── */

  async function handleFileUpload(file: File) {
    setExtracting(true)
    setExtractError('')
    setExtractResult(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/pm-schedules/extract', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Extraction failed')
      const data: ExtractionResult = await res.json()
      setExtractResult(data)

      // Auto-populate intervals from extraction
      const newIntervals = data.intervals
        .filter((ei) => FREQ_ORDER.includes(ei.frequency as PMFrequency))
        .map((ei) => makeInterval(
          ei.frequency as PMFrequency,
          ei.title,
          ei.tasks.length > 0 ? ei.tasks : [''],
          ei.estimatedHours
        ))
      if (newIntervals.length > 0) setIntervals(newIntervals)
    } catch {
      setExtractError('Failed to extract PM data. You can still build manually.')
    } finally {
      setExtracting(false)
    }
  }

  function handleStartScratch() {
    // Default to one monthly interval pre-added
    if (intervals.length === 0) {
      setIntervals([makeInterval('monthly')])
    }
    setStep('build')
  }

  /* ── Save ── */

  async function handleCreate() {
    setSaving(true)
    try {
      for (const interval of sortedIntervals) {
        const tasks = getCascadedTasks(interval)
        const title = interval.title.trim() || `${FREQ_LABELS[interval.frequency]} PM`
        const instructions = tasks.map((t, i) => `${i + 1}. ${t}`).join('\n')
        const payload = {
          title, description: 'Auto-generated by PM Stack Builder',
          asset_id: assetId, frequency: interval.frequency,
          estimated_hours: interval.estimatedHours ? parseFloat(interval.estimatedHours) : undefined,
          instructions, next_due_at: nextDue, is_active: true, pm_type: 'time_based' as const,
          skip_if_open: interval.skipIfOpen,
          end_condition: interval.endCondition,
          end_occurrences: interval.endOccurrences ? parseInt(interval.endOccurrences) : undefined,
          end_date: interval.endDate || undefined,
          default_problem_code: interval.defaultProblemCode || undefined,
          default_cause_code: interval.defaultCauseCode || undefined,
        }
        if (USE_MOCK) { await new Promise((r) => setTimeout(r, 300)) }
        else { await apiClient.pmSchedules.create(payload as never) }
      }
      setCreated(true)
    } catch { /* error toast from api client */ }
    finally { setSaving(false) }
  }

  /* ═══════════════════════════════════════════════════════════════
     STEP 1: Asset
     ═══════════════════════════════════════════════════════════════ */

  if (step === 'asset') {
    return (
      <div className="max-w-lg mx-auto mt-8">
        <Breadcrumb steps={STEPS} current="asset" onNavigate={setStep} />
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
              <Layers className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Select Asset</h2>
              <p className="text-sm text-slate-500">Which equipment needs PM schedules?</p>
            </div>
          </div>

          <AssetCombobox label="Asset" value={assetId} onChange={setAssetId} required />

          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">First PM Due Date</label>
            <input
              type="date" value={nextDue} onChange={(e) => setNextDue(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-400 mt-1">All intervals start from this date. Adjust individually later.</p>
          </div>

          <div className="mt-8 flex justify-end">
            <Button onClick={() => setStep('source')} disabled={!assetId}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  /* ═══════════════════════════════════════════════════════════════
     STEP 2: Source — "Start from scratch" or "Import from document"
     ═══════════════════════════════════════════════════════════════ */

  if (step === 'source') {
    return (
      <div className="max-w-lg mx-auto mt-8">
        <Breadcrumb steps={STEPS} current="source" onNavigate={setStep} />
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">How do you want to start?</h2>
              <p className="text-sm text-slate-500">Build from scratch or import from a document.</p>
            </div>
          </div>

          {/* Option A: Start from scratch */}
          <button
            type="button"
            onClick={handleStartScratch}
            className="w-full flex items-center justify-between gap-4 rounded-xl border-2 border-slate-200 bg-white px-5 py-5 text-left hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
          >
            <div>
              <p className="text-sm font-semibold text-slate-900">Start from scratch</p>
              <p className="text-xs text-slate-500 mt-1">
                Manually add intervals and tasks — great if you know the PM schedule by heart.
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
          </button>

          {/* Option B: Import from document */}
          <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-5 py-5 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-semibold text-slate-900">Import from document</p>
            </div>
            <p className="text-xs text-slate-500">
              Upload a manufacturer manual, maintenance schedule, or even a phone photo of a PM checklist — AI will extract the intervals and tasks.
            </p>

            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(file)
              }}
            />

            {extracting ? (
              <div className="flex items-center gap-3 py-4">
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                <div>
                  <p className="text-sm font-medium text-slate-700">Analyzing document…</p>
                  <p className="text-xs text-slate-400">Extracting PM intervals and tasks</p>
                </div>
              </div>
            ) : extractResult ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-green-800">
                    Extracted <strong>{extractResult.intervals.length} intervals</strong> from {extractResult.source}
                    <span className="text-green-600 ml-1">({Math.round(extractResult.confidence * 100)}% confidence)</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setStep('build')} className="flex-1">
                    Review &amp; Edit Extracted PMs <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="secondary" onClick={() => { setExtractResult(null); fileRef.current?.click() }}>
                    Re-upload
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {extractError && (
                  <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
                    <AlertCircle className="h-4 w-4 shrink-0" /> {extractError}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  Upload PDF, Image, or Text File
                </button>
                <p className="text-[11px] text-slate-400 text-center">
                  Supports: PDF, PNG, JPG, TXT, CSV · Max 10MB
                </p>
              </>
            )}
          </div>

          <div className="pt-2">
            <button onClick={() => setStep('asset')} className="text-sm text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ═══════════════════════════════════════════════════════════════
     STEP 3: Build Intervals
     ═══════════════════════════════════════════════════════════════ */

  if (step === 'build') {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Breadcrumb steps={STEPS} current="build" onNavigate={setStep} />

        {sortedIntervals.map((interval) => {
          const freqIdx = FREQ_ORDER.indexOf(interval.frequency)
          const hasShorter = sortedIntervals.some((o) => FREQ_ORDER.indexOf(o.frequency) < freqIdx)
          const colorCls = FREQ_COLORS[interval.frequency]

          return (
            <div key={interval.id} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-3 bg-slate-50 border-b border-slate-100">
                <GripVertical className="h-4 w-4 text-slate-300" />
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colorCls}`}>
                  {FREQ_LABELS[interval.frequency]}
                </span>
                <input
                  type="text" value={interval.title}
                  onChange={(e) => updateInterval(interval.id, { title: e.target.value })}
                  placeholder={`${FREQ_LABELS[interval.frequency]} PM`}
                  className="flex-1 bg-transparent text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
                <input
                  type="number" min="0" step="0.25" value={interval.estimatedHours}
                  onChange={(e) => updateInterval(interval.id, { estimatedHours: e.target.value })}
                  placeholder="hrs"
                  className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 text-right focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button type="button" onClick={() => updateInterval(interval.id, { collapsed: !interval.collapsed })}
                  className="rounded p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                  {interval.collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </button>
                <button type="button" onClick={() => removeInterval(interval.id)}
                  className="rounded p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" aria-label="Remove">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              {!interval.collapsed && (
                <div className="px-5 py-4 space-y-3">
                  {hasShorter && (
                    <label className="flex items-start gap-2.5 cursor-pointer rounded-lg border border-blue-100 bg-blue-50/50 px-3 py-2.5">
                      <input type="checkbox" checked={interval.cascade}
                        onChange={(e) => updateInterval(interval.id, { cascade: e.target.checked })}
                        className="mt-0.5 accent-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Include shorter-interval tasks</p>
                        <p className="text-xs text-blue-600 mt-0.5">Tasks from shorter PMs auto-included when this PM is performed.</p>
                      </div>
                    </label>
                  )}

                  {/* Tasks */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Tasks</p>
                    <div className="space-y-2">
                      {interval.tasks.map((task, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 w-5 text-right shrink-0">{idx + 1}.</span>
                          <input type="text" value={task}
                            onChange={(e) => updateTask(interval.id, idx, e.target.value)}
                            placeholder="Describe this task…"
                            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          {interval.tasks.length > 1 && (
                            <button type="button" onClick={() => removeTask(interval.id, idx)}
                              className="rounded p-1 text-slate-300 hover:text-red-500 transition-colors">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={() => addTask(interval.id)}
                      className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
                      + Add task
                    </button>
                  </div>

                  {/* Advanced Settings (collapsible) */}
                  <div className="border-t border-slate-100 pt-3">
                    <button type="button"
                      onClick={() => updateInterval(interval.id, { showAdvanced: !interval.showAdvanced })}
                      className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors">
                      <Settings2 className="h-3.5 w-3.5" />
                      Advanced Settings
                      {interval.showAdvanced ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>

                    {interval.showAdvanced && (
                      <div className="mt-3 space-y-3 rounded-lg bg-slate-50 p-3 border border-slate-100">
                        {/* Skip if open */}
                        <label className="flex items-start gap-2.5 cursor-pointer">
                          <input type="checkbox" checked={interval.skipIfOpen}
                            onChange={(e) => updateInterval(interval.id, { skipIfOpen: e.target.checked })}
                            className="mt-0.5 accent-blue-600" />
                          <span className="text-sm text-slate-700">
                            Don&apos;t generate a new WO if the previous one is still open
                          </span>
                        </label>

                        {/* Default codes */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Problem Code</label>
                            <select value={interval.defaultProblemCode}
                              onChange={(e) => updateInterval(interval.id, { defaultProblemCode: e.target.value })}
                              className="block w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                              {PROBLEM_CODES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Cause Code</label>
                            <select value={interval.defaultCauseCode}
                              onChange={(e) => updateInterval(interval.id, { defaultCauseCode: e.target.value })}
                              className="block w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                              {PROBLEM_CODES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                          </div>
                        </div>

                        {/* End condition */}
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1.5">End Condition</label>
                          <div className="space-y-1.5">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="radio" name={`end-${interval.id}`} checked={interval.endCondition === 'none'}
                                onChange={() => updateInterval(interval.id, { endCondition: 'none' })} className="accent-blue-600" />
                              <span className="text-xs text-slate-700">No end date</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="radio" name={`end-${interval.id}`} checked={interval.endCondition === 'occurrences'}
                                onChange={() => updateInterval(interval.id, { endCondition: 'occurrences' })} className="accent-blue-600" />
                              <span className="text-xs text-slate-700">End after</span>
                              {interval.endCondition === 'occurrences' && (
                                <input type="number" min="1" value={interval.endOccurrences}
                                  onChange={(e) => updateInterval(interval.id, { endOccurrences: e.target.value })}
                                  placeholder="12" className="w-16 rounded border border-slate-200 px-2 py-1 text-xs" />
                              )}
                              <span className="text-xs text-slate-700">occurrences</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="radio" name={`end-${interval.id}`} checked={interval.endCondition === 'date'}
                                onChange={() => updateInterval(interval.id, { endCondition: 'date' })} className="accent-blue-600" />
                              <span className="text-xs text-slate-700">End on</span>
                              {interval.endCondition === 'date' && (
                                <input type="date" value={interval.endDate}
                                  onChange={(e) => updateInterval(interval.id, { endDate: e.target.value })}
                                  className="rounded border border-slate-200 px-2 py-1 text-xs" />
                              )}
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Add interval */}
        {availableFreqs.length > 0 && (
          <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-5">
            <p className="text-sm font-medium text-slate-600 mb-3">
              <Plus className="inline h-4 w-4 mr-1 -mt-0.5" />
              Add Interval
            </p>
            <div className="flex flex-wrap gap-2">
              {availableFreqs.map((freq) => (
                <button key={freq} type="button" onClick={() => addInterval(freq)}
                  className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold hover:shadow-sm transition-all ${FREQ_COLORS[freq]}`}>
                  + {FREQ_LABELS[freq]}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4">
          <Button variant="secondary" onClick={() => setStep('source')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div className="flex items-center gap-3">
            {!canReview() && intervals.length > 0 && (
              <span className="text-xs text-amber-600 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> Each interval needs at least one task
              </span>
            )}
            <Button onClick={() => setStep('review')} disabled={!canReview()}>
              Review <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  /* ═══════════════════════════════════════════════════════════════
     STEP 4: Review & Create
     ═══════════════════════════════════════════════════════════════ */

  if (created) {
    return (
      <div className="max-w-lg mx-auto mt-12 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          {sortedIntervals.length === 1 ? 'PM Schedule Created!' : 'PM Stack Created!'}
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          {sortedIntervals.length} PM schedule{sortedIntervals.length !== 1 ? 's' : ''} created for this asset.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={() => router.push('/pm')}>View All PMs</Button>
          <Button variant="secondary" onClick={() => {
            setStep('asset'); setAssetId(''); setIntervals([]); setCreated(false); setExtractResult(null)
          }}>
            Create More
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Breadcrumb steps={STEPS} current="review" onNavigate={setStep} />

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">
            {sortedIntervals.length === 1 ? 'Review PM Schedule' : 'Review PM Stack'}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {sortedIntervals.length} interval{sortedIntervals.length !== 1 ? 's' : ''} — starting {nextDue}
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {sortedIntervals.map((interval) => {
            const allTasks = getCascadedTasks(interval)
            const ownTasks = interval.tasks.filter((t) => t.trim())
            const cascadedCount = allTasks.length - ownTasks.length

            return (
              <div key={interval.id} className="px-6 py-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${FREQ_COLORS[interval.frequency]}`}>
                    {FREQ_LABELS[interval.frequency]}
                  </span>
                  <span className="text-sm font-medium text-slate-800">
                    {interval.title.trim() || `${FREQ_LABELS[interval.frequency]} PM`}
                  </span>
                  {interval.estimatedHours && <span className="text-xs text-slate-400">~{interval.estimatedHours}h</span>}
                </div>
                <ol className="space-y-1 ml-2">
                  {allTasks.map((task, idx) => {
                    const inherited = idx < cascadedCount
                    return (
                      <li key={idx} className={`flex items-start gap-2 text-sm ${inherited ? 'text-slate-400' : 'text-slate-700'}`}>
                        <span className="text-xs text-slate-300 w-4 text-right shrink-0 mt-0.5">{idx + 1}.</span>
                        <span>{task}{inherited && <span className="ml-1.5 text-[10px] font-medium text-slate-400 uppercase">inherited</span>}</span>
                      </li>
                    )
                  })}
                </ol>
                {(interval.skipIfOpen || interval.endCondition !== 'none' || interval.defaultProblemCode) && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {interval.skipIfOpen && <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Skip if open</span>}
                    {interval.endCondition === 'occurrences' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Ends after {interval.endOccurrences}x</span>}
                    {interval.endCondition === 'date' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Ends {interval.endDate}</span>}
                    {interval.defaultProblemCode && <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Code: {interval.defaultProblemCode}</span>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <Button variant="secondary" onClick={() => setStep('build')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Edit
        </Button>
        <Button onClick={handleCreate} loading={isSaving}>
          <Layers className="mr-2 h-4 w-4" />
          Create {sortedIntervals.length} PM{sortedIntervals.length !== 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  )
}
