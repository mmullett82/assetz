'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Clock, Inbox } from 'lucide-react'
import { useRequestQueue } from '@/hooks/useRequestQueue'
import QueuePositionBadge from '@/components/requests/QueuePositionBadge'
import type { RequestUrgency } from '@/types'

const URGENCY_COLORS: Record<RequestUrgency, string> = {
  emergency: 'border-l-red-500 bg-red-950/30',
  high: 'border-l-orange-500 bg-orange-950/20',
  normal: 'border-l-blue-500 bg-blue-950/20',
  low: 'border-l-slate-500 bg-slate-800/50',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function KioskRequestsPage() {
  const router = useRouter()
  const { queue } = useRequestQueue()
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold text-blue-400">assetZ</span>
          <span className="text-lg font-semibold text-white">Request Queue</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-lg tabular-nums text-slate-300">
            {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button
            onClick={() => router.push('/requests')}
            className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Exit kiosk mode"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* KPI bar */}
      <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-slate-800">
        <div className="text-center">
          <p className="text-3xl font-bold tabular-nums">{queue.length}</p>
          <p className="text-xs text-slate-400 uppercase">In Queue</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold tabular-nums">
            {queue.length > 0 ? timeAgo(queue[queue.length - 1]?.created_at) : '—'}
          </p>
          <p className="text-xs text-slate-400 uppercase">Oldest Wait</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold tabular-nums text-red-400">
            {queue.filter((r) => r.urgency === 'emergency' || r.urgency === 'high').length}
          </p>
          <p className="text-xs text-slate-400 uppercase">High/Emergency</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold tabular-nums text-green-400">0</p>
          <p className="text-xs text-slate-400 uppercase">Approved Today</p>
        </div>
      </div>

      {/* Queue list */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <Inbox className="h-16 w-16 mb-4" />
            <p className="text-xl font-medium">Queue Empty</p>
            <p className="text-sm">All requests have been processed</p>
          </div>
        ) : (
          <div className="space-y-3">
            {queue.map((req) => (
              <div
                key={req.id}
                className={[
                  'rounded-lg border-l-4 p-5',
                  URGENCY_COLORS[req.urgency],
                ].join(' ')}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <QueuePositionBadge position={req.queue_position ?? 0} />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {req.urgency}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white">{req.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                      {req.location_description && <span>{req.location_description}</span>}
                      <span>{req.requester_name}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {timeAgo(req.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
