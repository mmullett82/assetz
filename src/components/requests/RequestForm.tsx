'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Camera, Loader2 } from 'lucide-react'
import type { RequestUrgency, Asset } from '@/types'
import apiClient from '@/lib/api-client'
import { USE_MOCK } from '@/lib/config'

interface Props {
  prefillAsset?: Asset | null
}

const URGENCY_OPTIONS: { value: RequestUrgency; label: string; desc: string; color: string }[] = [
  { value: 'low', label: 'Low', desc: 'When you get a chance', color: 'border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-400' },
  { value: 'normal', label: 'Normal', desc: 'Standard priority', color: 'border-blue-300 bg-blue-50 text-blue-700 hover:border-blue-400' },
  { value: 'high', label: 'High', desc: 'Affecting production', color: 'border-orange-300 bg-orange-50 text-orange-700 hover:border-orange-400' },
  { value: 'critical', label: 'Critical', desc: 'Machine down / safety', color: 'border-red-300 bg-red-50 text-red-700 hover:border-red-400' },
]

export default function RequestForm({ prefillAsset }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState(prefillAsset?.location_notes ?? '')
  const [urgency, setUrgency] = useState<RequestUrgency>('normal')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    try {
      if (!USE_MOCK) {
        await apiClient.requests.create({
          title,
          description: description || undefined,
          location_description: location || undefined,
          urgency,
          asset_id: prefillAsset?.id,
          asset_identifier: prefillAsset?.asset_number,
        })
      }
      router.push('/requests')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      {/* Pre-filled asset */}
      {prefillAsset && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
          <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Machine</p>
          <p className="text-sm font-semibold text-blue-900">{prefillAsset.name}</p>
          <p className="text-xs text-blue-700">{prefillAsset.facility_asset_id}</p>
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          What&apos;s broken? <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g. CNC spindle making grinding noise"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 min-h-[56px] text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Tell us more
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Any details that would help — when it started, what you were doing, error codes..."
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Where is it?
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Mill Department, near the edge banders"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 min-h-[56px] text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Urgency */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          How urgent?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {URGENCY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setUrgency(opt.value)}
              className={[
                'rounded-lg border-2 p-3 text-left transition-all min-h-[56px]',
                urgency === opt.value
                  ? `${opt.color} ring-2 ring-offset-1 ring-current`
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
              ].join(' ')}
            >
              <span className="block text-sm font-semibold">{opt.label}</span>
              <span className="block text-xs opacity-75">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Photo (placeholder) */}
      <div>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 px-4 py-3 min-h-[56px] text-sm text-slate-500 hover:border-slate-400 hover:text-slate-600 transition-colors w-full justify-center"
        >
          <Camera className="h-5 w-5" />
          Add Photo
        </button>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting || !title.trim()}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 min-h-[56px] text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {submitting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Send className="h-5 w-5" />
        )}
        Submit Request
      </button>
    </form>
  )
}
