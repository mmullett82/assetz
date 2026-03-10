'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, ChevronDown, ChevronUp, GripVertical, Layers, ArrowRight, Check, AlertCircle } from 'lucide-react'
import AssetCombobox from '@/components/ui/AssetCombobox'
import Button from '@/components/ui/Button'
import { TextareaWithVoice } from '@/components/ui/VoiceInput'
import apiClient from '@/lib/api-client'
import { USE_MOCK } from '@/lib/config'
import type { PMFrequency } from '@/types'

/* ─── Types ─── */

type IntervalItem = {
  id: string
  frequency: PMFrequency
  title: string
  estimatedHours: string
  tasks: string[]   // each line is a task
  cascade: boolean  // include tasks from shorter intervals
  collapsed: boolean
}

const FREQ_ORDER: PMFrequency[] = ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'semiannual', 'annual']

const FREQ_LABELS: Record<PMFrequency, string> = {
  daily:      'Daily',
  weekly:     'Weekly',
  biweekly:   'Every 2 Weeks',
  monthly:    'Monthly',
  quarterly:  'Quarterly',
  semiannual: 'Every 6 Months',
  annual:     'Annual',
  meter_based: 'Meter-Based',
}

const FREQ_COLORS: Record<PMFrequency, string> = {
  daily:       'bg-violet-100 text-violet-700 border-violet-200',
  weekly:      'bg-blue-100 text-blue-700 border-blue-200',
  biweekly:    'bg-cyan-100 text-cyan-700 border-cyan-200',
  monthly:     'bg-green-100 text-green-700 border-green-200',
  quarterly:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  semiannual:  'bg-orange-100 text-orange-700 border-orange-200',
  annual:      'bg-red-100 text-red-700 border-red-200',
  meter_based: 'bg-slate-100 text-slate-700 border-slate-200',
}

let _id = 0
function uid() { return `interval_${++_id}` }

/* ─── Component ─── */

export default function PMStackBuilder() {
  const router = useRouter()

  // Step state
  const [step, setStep] = useState<'asset' | 'build' | 'review'>('asset')

  // Asset
  const [assetId, setAssetId] = useState('')

  // Intervals
  const [intervals, setIntervals] = useState<IntervalItem[]>([])
  const [nextDue, setNextDue] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  })

  // Saving
  const [isSaving, setSaving] = useState(false)
  const [created, setCreated] = useState(false)

  // Available frequencies (exclude already-added ones)
  const usedFreqs = new Set(intervals.map((i) => i.frequency))
  const availableFreqs = FREQ_ORDER.filter((f) => !usedFreqs.has(f))

  // Sort intervals by frequency order
  const sortedIntervals = useMemo(
    () => [...intervals].sort((a, b) => FREQ_ORDER.indexOf(a.frequency) - FREQ_ORDER.indexOf(b.frequency)),
    [intervals]
  )

  /* ── Helpers ── */

  function addInterval(freq: PMFrequency) {
    setIntervals((prev) => [
      ...prev,
      {
        id: uid(),
        frequency: freq,
        title: '',
        estimatedHours: '',
        tasks: [''],
        cascade: true,
        collapsed: false,
      },
    ])
  }

  function removeInterval(id: string) {
    setIntervals((prev) => prev.filter((i) => i.id !== id))
  }

  function updateInterval(id: string, updates: Partial<IntervalItem>) {
    setIntervals((prev) => prev.map((i) => i.id === id ? { ...i, ...updates } : i))
  }

  function addTask(id: string) {
    setIntervals((prev) =>
      prev.map((i) => i.id === id ? { ...i, tasks: [...i.tasks, ''] } : i)
    )
  }

  function updateTask(id: string, taskIdx: number, value: string) {
    setIntervals((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, tasks: i.tasks.map((t, j) => j === taskIdx ? value : t) }
          : i
      )
    )
  }

  function removeTask(id: string, taskIdx: number) {
    setIntervals((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, tasks: i.tasks.filter((_, j) => j !== taskIdx) }
          : i
      )
    )
  }

  function toggleCollapse(id: string) {
    updateInterval(id, { collapsed: !intervals.find((i) => i.id === id)?.collapsed })
  }

  // Build cascaded task list for review
  function getCascadedTasks(interval: IntervalItem): string[] {
    const myIdx = FREQ_ORDER.indexOf(interval.frequency)
    const myTasks = interval.tasks.filter((t) => t.trim())

    if (!interval.cascade) return myTasks

    // Gather tasks from all shorter intervals
    const shorterTasks: string[] = []
    sortedIntervals.forEach((other) => {
      if (FREQ_ORDER.indexOf(other.frequency) < myIdx) {
        other.tasks.filter((t) => t.trim()).forEach((t) => {
          if (!shorterTasks.includes(t)) shorterTasks.push(t)
        })
      }
    })

    return [...shorterTasks, ...myTasks]
  }

  // Validation
  function canProceedToBuild() {
    return !!assetId
  }

  function canProceedToReview() {
    if (intervals.length === 0) return false
    return intervals.every((i) => i.tasks.some((t) => t.trim()))
  }

  /* ── Save ── */

  async function handleCreate() {
    setSaving(true)
    try {
      for (const interval of sortedIntervals) {
        const cascadedTasks = getCascadedTasks(interval)
        const title = interval.title.trim() || `${FREQ_LABELS[interval.frequency]} PM`
        const instructions = cascadedTasks.map((t, i) => `${i + 1}. ${t}`).join('\n')

        const payload = {
          title,
          description: `Auto-generated by PM Stack Builder`,
          asset_id: assetId,
          frequency: interval.frequency,
          estimated_hours: interval.estimatedHours ? parseFloat(interval.estimatedHours) : undefined,
          instructions,
          next_due_at: nextDue,
          is_active: true,
          pm_type: 'time_based' as const,
        }

        if (USE_MOCK) {
          await new Promise((r) => setTimeout(r, 300))
        } else {
          await apiClient.pmSchedules.create(payload as never)
        }
      }
      setCreated(true)
    } catch {
      // error toast handled by api client
    } finally {
      setSaving(false)
    }
  }

  /* ─── Step 1: Asset Selection ─── */

  if (step === 'asset') {
    return (
      <div className="max-w-lg mx-auto mt-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
              <Layers className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Step 1: Select Asset</h2>
              <p className="text-sm text-slate-500">Which equipment needs PM schedules?</p>
            </div>
          </div>

          <AssetCombobox
            label="Asset"
            value={assetId}
            onChange={setAssetId}
            required
          />

          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              First PM Due Date
            </label>
            <input
              type="date"
              value={nextDue}
              onChange={(e) => setNextDue(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-400 mt-1">
              All intervals will start from this date. You can adjust individually later.
            </p>
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              onClick={() => setStep('build')}
              disabled={!canProceedToBuild()}
            >
              Next: Add Intervals
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  /* ─── Step 2: Build Intervals ─── */

  if (step === 'build') {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Progress header */}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <button onClick={() => setStep('asset')} className="text-blue-600 hover:text-blue-700 font-medium">
            Asset
          </button>
          <ArrowRight className="h-3 w-3" />
          <span className="font-semibold text-slate-900">Build Intervals</span>
          <ArrowRight className="h-3 w-3" />
          <span>Review</span>
        </div>

        {/* Interval cards */}
        {sortedIntervals.map((interval) => {
          const freqIdx = FREQ_ORDER.indexOf(interval.frequency)
          const hasShorter = sortedIntervals.some((o) => FREQ_ORDER.indexOf(o.frequency) < freqIdx)
          const colorCls = FREQ_COLORS[interval.frequency]

          return (
            <div
              key={interval.id}
              className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
            >
              {/* Card header */}
              <div className="flex items-center gap-3 px-5 py-3 bg-slate-50 border-b border-slate-100">
                <GripVertical className="h-4 w-4 text-slate-300" />
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colorCls}`}>
                  {FREQ_LABELS[interval.frequency]}
                </span>
                <input
                  type="text"
                  value={interval.title}
                  onChange={(e) => updateInterval(interval.id, { title: e.target.value })}
                  placeholder={`${FREQ_LABELS[interval.frequency]} PM`}
                  className="flex-1 bg-transparent text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
                <input
                  type="number"
                  min="0"
                  step="0.25"
                  value={interval.estimatedHours}
                  onChange={(e) => updateInterval(interval.id, { estimatedHours: e.target.value })}
                  placeholder="hrs"
                  className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 text-right focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => toggleCollapse(interval.id)}
                  className="rounded p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  {interval.collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => removeInterval(interval.id)}
                  className="rounded p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  aria-label="Remove interval"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Card body */}
              {!interval.collapsed && (
                <div className="px-5 py-4 space-y-3">
                  {/* Cascade toggle */}
                  {hasShorter && (
                    <label className="flex items-start gap-2.5 cursor-pointer rounded-lg border border-blue-100 bg-blue-50/50 px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={interval.cascade}
                        onChange={(e) => updateInterval(interval.id, { cascade: e.target.checked })}
                        className="mt-0.5 accent-blue-600"
                      />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Include shorter-interval tasks</p>
                        <p className="text-xs text-blue-600 mt-0.5">
                          Tasks from shorter PM intervals will automatically be included when this PM is performed.
                        </p>
                      </div>
                    </label>
                  )}

                  {/* Tasks unique to this interval */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                      Tasks for this interval
                    </p>
                    <div className="space-y-2">
                      {interval.tasks.map((task, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 w-5 text-right shrink-0">{idx + 1}.</span>
                          <input
                            type="text"
                            value={task}
                            onChange={(e) => updateTask(interval.id, idx, e.target.value)}
                            placeholder="Describe this task…"
                            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          {interval.tasks.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTask(interval.id, idx)}
                              className="rounded p-1 text-slate-300 hover:text-red-500 transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => addTask(interval.id)}
                      className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      + Add task
                    </button>
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
                <button
                  key={freq}
                  type="button"
                  onClick={() => addInterval(freq)}
                  className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold hover:shadow-sm transition-all ${FREQ_COLORS[freq]}`}
                >
                  + {FREQ_LABELS[freq]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Nav */}
        <div className="flex items-center justify-between pt-4">
          <Button variant="secondary" onClick={() => setStep('asset')}>
            Back
          </Button>
          <div className="flex items-center gap-3">
            {!canProceedToReview() && intervals.length > 0 && (
              <span className="text-xs text-amber-600 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                Each interval needs at least one task
              </span>
            )}
            <Button
              onClick={() => setStep('review')}
              disabled={!canProceedToReview()}
            >
              Review Stack
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  /* ─── Step 3: Review & Create ─── */

  if (created) {
    return (
      <div className="max-w-lg mx-auto mt-12 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">PM Stack Created!</h2>
        <p className="text-sm text-slate-500 mb-6">
          {sortedIntervals.length} PM schedule{sortedIntervals.length !== 1 ? 's' : ''} created for this asset.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={() => router.push('/pm')}>
            View All PMs
          </Button>
          <Button variant="secondary" onClick={() => {
            setStep('asset')
            setAssetId('')
            setIntervals([])
            setCreated(false)
          }}>
            Build Another Stack
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress header */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <button onClick={() => setStep('asset')} className="text-blue-600 hover:text-blue-700 font-medium">
          Asset
        </button>
        <ArrowRight className="h-3 w-3" />
        <button onClick={() => setStep('build')} className="text-blue-600 hover:text-blue-700 font-medium">
          Build Intervals
        </button>
        <ArrowRight className="h-3 w-3" />
        <span className="font-semibold text-slate-900">Review &amp; Create</span>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">
            Review PM Stack
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {sortedIntervals.length} interval{sortedIntervals.length !== 1 ? 's' : ''} will be created — starting {nextDue}
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
                  {interval.estimatedHours && (
                    <span className="text-xs text-slate-400">~{interval.estimatedHours}h</span>
                  )}
                </div>
                <ol className="space-y-1 ml-2">
                  {allTasks.map((task, idx) => {
                    const isCascaded = idx < cascadedCount
                    return (
                      <li key={idx} className={`flex items-start gap-2 text-sm ${isCascaded ? 'text-slate-400' : 'text-slate-700'}`}>
                        <span className="text-xs text-slate-300 w-4 text-right shrink-0 mt-0.5">{idx + 1}.</span>
                        <span>
                          {task}
                          {isCascaded && (
                            <span className="ml-1.5 text-[10px] font-medium text-slate-400 uppercase">inherited</span>
                          )}
                        </span>
                      </li>
                    )
                  })}
                </ol>
              </div>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="secondary" onClick={() => setStep('build')}>
          Back to Edit
        </Button>
        <Button onClick={handleCreate} loading={isSaving}>
          <Layers className="mr-2 h-4 w-4" />
          Create {sortedIntervals.length} PM Schedule{sortedIntervals.length !== 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  )
}
