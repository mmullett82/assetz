'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Inbox, ListFilter } from 'lucide-react'
import { useRequests } from '@/hooks/useRequests'
import { useRequestQueue } from '@/hooks/useRequestQueue'
import { usePermissions } from '@/hooks/usePermissions'
import RequestCard from '@/components/requests/RequestCard'
import TriagePanel from '@/components/requests/TriagePanel'
import Can from '@/components/ui/Can'
import type { WorkRequest, RequestStatus } from '@/types'

type ViewTab = 'queue' | 'all' | 'mine'

export default function RequestsPage() {
  const { can, role, user } = usePermissions()
  const canTriage = can('triage_requests')
  const [tab, setTab] = useState<ViewTab>(canTriage ? 'queue' : 'mine')
  const [statusFilter, setStatusFilter] = useState<RequestStatus | ''>('')
  const [selectedRequest, setSelectedRequest] = useState<WorkRequest | null>(null)

  const { queue, mutate: mutateQueue } = useRequestQueue()
  const { requests: allRequests, mutate: mutateAll } = useRequests(
    statusFilter ? { status: statusFilter } : undefined
  )
  const { requests: myRequests } = useRequests({ requester_id: user?.id })

  const tabs = [
    ...(canTriage ? [{ id: 'queue' as ViewTab, label: 'Triage Queue', count: queue.length }] : []),
    { id: 'all' as ViewTab, label: 'All Requests', count: allRequests.length },
    { id: 'mine' as ViewTab, label: 'My Requests', count: myRequests.length },
  ]

  const displayedRequests = tab === 'queue' ? queue : tab === 'mine' ? myRequests : allRequests

  function handleTriageComplete() {
    setSelectedRequest(null)
    mutateQueue()
    mutateAll()
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Requests</h1>
          <p className="text-sm text-slate-500">
            {canTriage ? 'Review and triage maintenance requests' : 'Track your maintenance requests'}
          </p>
        </div>
        <Can action="submit_requests">
          <Link
            href="/requests/new"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" /> New Request
          </Link>
        </Can>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={[
              'flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              tab === t.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700',
            ].join(' ')}
          >
            {t.label}
            {t.count > 0 && (
              <span className="ml-1.5 inline-flex items-center rounded-full bg-slate-200 px-1.5 py-0.5 text-xs tabular-nums">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Status filter (for "all" tab) */}
      {tab === 'all' && (
        <div className="flex items-center gap-2">
          <ListFilter className="h-4 w-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as RequestStatus | '')}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
          >
            <option value="">All statuses</option>
            <option value="submitted">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      )}

      {/* Content */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Request list */}
        <div className={selectedRequest ? 'lg:col-span-2' : 'lg:col-span-3'}>
          {displayedRequests.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-slate-200 p-12 text-center">
              <Inbox className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-500">No requests</p>
              <p className="text-xs text-slate-400 mt-1">
                {tab === 'queue' ? 'All requests have been triaged' : 'No requests match your filter'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedRequests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => canTriage && req.status === 'submitted' ? setSelectedRequest(req) : undefined}
                  className={canTriage && req.status === 'submitted' ? 'cursor-pointer' : ''}
                >
                  <RequestCard
                    request={req}
                    showQueuePosition={tab === 'queue'}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Triage panel (right side) */}
        {selectedRequest && canTriage && (
          <div className="lg:col-span-1">
            <div className="sticky top-4 rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-900">{selectedRequest.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{selectedRequest.description}</p>
              <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                <p><span className="font-medium">Requester:</span> {selectedRequest.requester_name}</p>
                <p><span className="font-medium">Urgency:</span> {selectedRequest.urgency}</p>
                {selectedRequest.location_description && (
                  <p><span className="font-medium">Location:</span> {selectedRequest.location_description}</p>
                )}
                {selectedRequest.asset?.name && (
                  <p><span className="font-medium">Asset:</span> {selectedRequest.asset.name}</p>
                )}
              </div>
              <TriagePanel request={selectedRequest} onComplete={handleTriageComplete} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
