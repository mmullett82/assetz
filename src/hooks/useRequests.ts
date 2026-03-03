'use client'

import useSWR from 'swr'
import type { WorkRequest, PaginatedResponse } from '@/types'
import apiClient, { type RequestsQuery } from '@/lib/api-client'
import { MOCK_REQUESTS } from '@/lib/mock-requests'
import { USE_MOCK } from '@/lib/config'

function mockList(query?: RequestsQuery): PaginatedResponse<WorkRequest> {
  let data = [...MOCK_REQUESTS]
  if (query?.status) {
    const statuses = query.status.split(',')
    data = data.filter((r) => statuses.includes(r.status))
  }
  if (query?.requester_id) {
    data = data.filter((r) => r.requester_id === query.requester_id)
  }
  return { data, total: data.length, page: 1, page_size: 50, total_pages: 1 }
}

export function useRequests(query?: RequestsQuery) {
  const key = ['requests', JSON.stringify(query)]
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<WorkRequest>>(
    key,
    () => USE_MOCK ? Promise.resolve(mockList(query)) : apiClient.requests.list(query),
    { revalidateOnFocus: false }
  )

  return {
    requests: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    mutate,
  }
}

export function useRequest(id: string) {
  const { data, error, isLoading, mutate } = useSWR<WorkRequest>(
    id ? `request/${id}` : null,
    () => {
      if (USE_MOCK) {
        const found = MOCK_REQUESTS.find((r) => r.id === id)
        return found ? Promise.resolve(found) : Promise.reject(new Error('Not found'))
      }
      return apiClient.requests.get(id)
    },
    { revalidateOnFocus: false }
  )

  return { request: data, isLoading, error, mutate }
}
