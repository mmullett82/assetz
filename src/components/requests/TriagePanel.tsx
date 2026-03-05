'use client'

import { useState, useEffect } from 'react'
import { Check, X, Loader2, Sparkles } from 'lucide-react'
import type { WorkRequest } from '@/types'
import apiClient from '@/lib/api-client'
import { USE_MOCK } from '@/lib/config'
import { TextareaWithVoice } from '@/components/ui/VoiceInput'

interface TriageSuggestion {
  priority: string
  priority_reason: string
  asset_id: string | null
  asset_match_reason: string
  urgency_assessment: string
}

interface Props {
  request: WorkRequest
  onComplete: () => void
}

export default function TriagePanel({ request, onComplete }: Props) {
  const [mode, setMode] = useState<'idle' | 'approve' | 'reject'>('idle')
  const [priority, setPriority] = useState('medium')
  const [techId, setTechId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestion, setSuggestion] = useState<TriageSuggestion | null>(null)
  const [sugLoading, setSugLoading] = useState(false)

  // Fetch AI suggestion on mount
  useEffect(() => {
    if (USE_MOCK || request.status !== 'submitted') return
    setSugLoading(true)
    fetch('/api/agent/triage-suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: request.title,
        description: request.description,
        location: request.location_description,
      }),
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setSuggestion(data) })
      .catch(() => {})
      .finally(() => setSugLoading(false))
  }, [request.id, request.status, request.title, request.description, request.location_description])

  async function handleApprove() {
    setLoading(true)
    try {
      if (!USE_MOCK) {
        await apiClient.requests.approve(request.id, {
          priority,
          assigned_to_id: techId || undefined,
          due_date: dueDate || undefined,
        })
      }
      onComplete()
    } finally {
      setLoading(false)
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) return
    setLoading(true)
    try {
      if (!USE_MOCK) {
        await apiClient.requests.reject(request.id, rejectReason)
      }
      onComplete()
    } finally {
      setLoading(false)
    }
  }

  if (mode === 'idle') {
    return (
      <div className="mt-4 space-y-3">
        {/* AI Suggestion */}
        {sugLoading && (
          <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-xs text-blue-700">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            AI analyzing request...
          </div>
        )}
        {suggestion && !sugLoading && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-xs font-semibold text-blue-800">AI Suggestion</span>
            </div>
            <p className="text-xs text-blue-700">{suggestion.urgency_assessment}</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => { setPriority(suggestion.priority); setMode('approve') }}
                className="px-2 py-0.5 text-[11px] font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-full hover:bg-blue-200 transition-colors"
              >
                Priority: {suggestion.priority}
              </button>
            </div>
          </div>
        )}
      <div className="flex gap-2">
        <button
          onClick={() => setMode('approve')}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-colors"
        >
          <Check className="h-4 w-4" /> Approve
        </button>
        <button
          onClick={() => setMode('reject')}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors"
        >
          <X className="h-4 w-4" /> Reject
        </button>
      </div>
      </div>
    )
  }

  if (mode === 'approve') {
    return (
      <div className="mt-4 space-y-3 rounded-lg border border-green-200 bg-green-50 p-4">
        <h4 className="text-sm font-semibold text-green-800">Approve & Create Work Order</h4>

        <div>
          <label className="block text-xs font-medium text-green-700 mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full rounded-lg border border-green-300 bg-white px-3 py-2 text-sm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-green-700 mb-1">Assign Technician (optional)</label>
          <input
            type="text"
            value={techId}
            onChange={(e) => setTechId(e.target.value)}
            placeholder="Technician ID"
            className="w-full rounded-lg border border-green-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-green-700 mb-1">Due Date (optional)</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-lg border border-green-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleApprove}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Confirm Approve
          </button>
          <button
            onClick={() => setMode('idle')}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // reject mode
  return (
    <div className="mt-4 space-y-3 rounded-lg border border-red-200 bg-red-50 p-4">
      <h4 className="text-sm font-semibold text-red-800">Reject Request</h4>

      <div>
        <label className="block text-xs font-medium text-red-700 mb-1">Reason (required)</label>
        <TextareaWithVoice
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={3}
          placeholder="Explain why this request is being rejected..."
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleReject}
          disabled={loading || !rejectReason.trim()}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
          Confirm Reject
        </button>
        <button
          onClick={() => setMode('idle')}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
