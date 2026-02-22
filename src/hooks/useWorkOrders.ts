'use client'

import useSWR from 'swr'
import type { WorkOrder, PaginatedResponse } from '@/types'
import apiClient, { type WorkOrdersQuery } from '@/lib/api-client'
import { MOCK_WORK_ORDERS } from '@/lib/mock-work-orders'

const USE_MOCK = process.env.NODE_ENV === 'development'

function mockFetcher(query?: WorkOrdersQuery): PaginatedResponse<WorkOrder> {
  let data = [...MOCK_WORK_ORDERS]

  if (query?.search) {
    const q = query.search.toLowerCase()
    data = data.filter(
      (wo) =>
        wo.title.toLowerCase().includes(q) ||
        wo.work_order_number.toLowerCase().includes(q) ||
        wo.description.toLowerCase().includes(q)
    )
  }
  if (query?.status)        data = data.filter((wo) => wo.status === query.status)
  if (query?.priority)      data = data.filter((wo) => wo.priority === query.priority)
  if (query?.asset_id)      data = data.filter((wo) => wo.asset_id === query.asset_id)
  if (query?.assigned_to_id) data = data.filter((wo) => wo.assigned_to_id === query.assigned_to_id)

  // Default sort: open/critical first, then by due_date ascending
  const PRIORITY_WEIGHT: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
  const STATUS_WEIGHT:   Record<string, number> = { open: 0, in_progress: 1, on_hold: 2, completed: 3, cancelled: 4 }

  data.sort((a, b) => {
    const sw = (STATUS_WEIGHT[a.status] ?? 5) - (STATUS_WEIGHT[b.status] ?? 5)
    if (sw !== 0) return sw
    const pw = (PRIORITY_WEIGHT[a.priority] ?? 4) - (PRIORITY_WEIGHT[b.priority] ?? 4)
    if (pw !== 0) return pw
    if (a.due_date && b.due_date) return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    return 0
  })

  return { data, total: data.length, page: 1, page_size: 50, total_pages: 1 }
}

export function useWorkOrders(query?: WorkOrdersQuery) {
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<WorkOrder>>(
    ['work-orders', query],
    () => USE_MOCK ? Promise.resolve(mockFetcher(query)) : apiClient.workOrders.list(query),
    { revalidateOnFocus: false }
  )

  return {
    workOrders: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    mutate,
  }
}
