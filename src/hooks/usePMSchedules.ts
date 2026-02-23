'use client'

import useSWR from 'swr'
import type { PMSchedule, PaginatedResponse } from '@/types'
import apiClient, { type PMSchedulesQuery } from '@/lib/api-client'
import { MOCK_PM_SCHEDULES } from '@/lib/mock-pm-schedules'
import { pmDueStatus } from '@/lib/pm-utils'

const USE_MOCK = true // always use mock data until backend is connected

const STATUS_ORDER = { red: 0, yellow: 1, green: 2 }

function mockFetcher(query?: PMSchedulesQuery): PaginatedResponse<PMSchedule> {
  let data = MOCK_PM_SCHEDULES.map((pm) => ({
    ...pm,
    due_status: pmDueStatus(pm.next_due_at),
  }))

  if (!query?.is_active === false) {
    data = data.filter((pm) => pm.is_active)
  }
  if (query?.asset_id) {
    data = data.filter((pm) => pm.asset_id === query.asset_id)
  }
  if (query?.overdue_only) {
    data = data.filter((pm) => pm.due_status === 'red')
  }

  // Sort: overdue → due soon → on schedule, then by next_due_at
  data.sort((a, b) => {
    const statusDiff =
      (STATUS_ORDER[a.due_status ?? 'green'] ?? 2) -
      (STATUS_ORDER[b.due_status ?? 'green'] ?? 2)
    if (statusDiff !== 0) return statusDiff
    if (a.next_due_at && b.next_due_at) {
      return new Date(a.next_due_at).getTime() - new Date(b.next_due_at).getTime()
    }
    return 0
  })

  return { data, total: data.length, page: 1, page_size: 50, total_pages: 1 }
}

export function usePMSchedules(query?: PMSchedulesQuery) {
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<PMSchedule>>(
    ['pm-schedules', query],
    () => USE_MOCK ? Promise.resolve(mockFetcher(query)) : apiClient.pmSchedules.list(query),
    { revalidateOnFocus: false }
  )

  return {
    pmSchedules: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    mutate,
  }
}
