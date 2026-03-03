'use client'

import useSWR from 'swr'
import type { WorkRequest } from '@/types'
import apiClient from '@/lib/api-client'
import { MOCK_REQUESTS } from '@/lib/mock-requests'
import { USE_MOCK } from '@/lib/config'

const URGENCY_WEIGHT: Record<string, number> = {
  emergency: 100,
  high: 75,
  normal: 50,
  low: 25,
}

function mockQueue(): WorkRequest[] {
  return MOCK_REQUESTS
    .filter((r) => r.status === 'submitted')
    .sort((a, b) => {
      const wa = URGENCY_WEIGHT[a.urgency] ?? 50
      const wb = URGENCY_WEIGHT[b.urgency] ?? 50
      if (wb !== wa) return wb - wa
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    })
    .map((r, i) => ({ ...r, queue_position: i + 1 }))
}

export function useRequestQueue() {
  const { data, error, isLoading, mutate } = useSWR<WorkRequest[]>(
    'requests/queue',
    () => USE_MOCK ? Promise.resolve(mockQueue()) : apiClient.requests.queue(),
    {
      revalidateOnFocus: false,
      refreshInterval: 30_000,
    }
  )

  return { queue: data ?? [], isLoading, error, mutate }
}
