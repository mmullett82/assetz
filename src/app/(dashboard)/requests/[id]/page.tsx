'use client'

import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { useRequest } from '@/hooks/useRequests'
import { usePermissions } from '@/hooks/usePermissions'
import RequestStatusBadge from '@/components/requests/RequestStatusBadge'
import QueuePositionBadge from '@/components/requests/QueuePositionBadge'
import TriagePanel from '@/components/requests/TriagePanel'

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { request, isLoading, mutate } = useRequest(id)
  const { can } = usePermissions()

  if (isLoading) {
    return <div className="p-8 text-slate-400">Loading...</div>
  }

  if (!request) {
    return <div className="p-8 text-slate-400">Request not found</div>
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <Link
        href="/requests"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Requests
      </Link>

      <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <RequestStatusBadge status={request.status} />
              {request.queue_position && <QueuePositionBadge position={request.queue_position} />}
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 capitalize">
                {request.urgency}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{request.title}</h1>
          </div>
        </div>

        {request.description && (
          <p className="text-sm text-slate-600">{request.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Requester</p>
            <p className="text-slate-900">{request.requester_name}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Submitted</p>
            <p className="text-slate-900">{new Date(request.created_at).toLocaleString()}</p>
          </div>
          {request.location_description && (
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Location</p>
              <p className="text-slate-900">{request.location_description}</p>
            </div>
          )}
          {request.asset && (
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Asset</p>
              <Link href={`/assets/${request.asset.id}`} className="text-blue-600 hover:underline">
                {request.asset.name}
              </Link>
            </div>
          )}
        </div>

        {/* Review info */}
        {request.reviewed_at && (
          <div className="rounded-lg bg-slate-50 p-3 text-sm">
            <p className="text-xs font-medium text-slate-500 uppercase mb-1">Review</p>
            <p className="text-slate-700">
              {request.status === 'approved' ? 'Approved' : 'Rejected'} by {request.reviewed_by?.full_name ?? 'Unknown'}
              {' '}on {new Date(request.reviewed_at).toLocaleString()}
            </p>
            {request.rejection_reason && (
              <p className="text-red-600 mt-1">Reason: {request.rejection_reason}</p>
            )}
          </div>
        )}

        {/* Linked WO */}
        {request.work_order && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-3">
            <p className="text-xs font-medium text-green-600 uppercase mb-1">Work Order Created</p>
            <Link
              href={`/work-orders/${request.work_order.id}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 hover:underline"
            >
              {request.work_order.work_order_number}
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {/* Triage panel for managers on submitted requests */}
        {can('triage_requests') && request.status === 'submitted' && (
          <TriagePanel request={request} onComplete={() => mutate()} />
        )}
      </div>
    </div>
  )
}
