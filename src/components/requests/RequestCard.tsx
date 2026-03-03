'use client'

import Link from 'next/link'
import { Clock, MapPin, Cpu } from 'lucide-react'
import type { WorkRequest, RequestUrgency } from '@/types'
import RequestStatusBadge from './RequestStatusBadge'
import QueuePositionBadge from './QueuePositionBadge'

const URGENCY_STYLES: Record<RequestUrgency, string> = {
  emergency: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  normal: 'bg-blue-100 text-blue-700',
  low: 'bg-slate-100 text-slate-600',
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

interface Props {
  request: WorkRequest
  showQueuePosition?: boolean
}

export default function RequestCard({ request, showQueuePosition }: Props) {
  return (
    <Link
      href={`/requests/${request.id}`}
      className="block rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md hover:border-blue-200 transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {showQueuePosition && request.queue_position && (
              <QueuePositionBadge position={request.queue_position} />
            )}
            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${URGENCY_STYLES[request.urgency]}`}>
              {request.urgency}
            </span>
            <RequestStatusBadge status={request.status} />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 truncate">{request.title}</h3>
          {request.description && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{request.description}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" /> {timeAgo(request.created_at)}
        </span>
        {request.location_description && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {request.location_description}
          </span>
        )}
        {request.asset?.name && (
          <span className="flex items-center gap-1">
            <Cpu className="h-3 w-3" /> {request.asset.name}
          </span>
        )}
        <span>by {request.requester_name}</span>
      </div>
    </Link>
  )
}
