'use client'

import useSWR from 'swr'
import type { WorkOrder } from '@/types'
import apiClient from '@/lib/api-client'
import { getMockWorkOrder } from '@/lib/mock-work-orders'

const USE_MOCK = true // always use mock data until backend is connected

export function useWorkOrder(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<WorkOrder>(
    id ? ['work-order', id] : null,
    () =>
      USE_MOCK
        ? Promise.resolve(getMockWorkOrder(id!) ?? Promise.reject(new Error('Not found')))
        : apiClient.workOrders.get(id!),
    { revalidateOnFocus: false }
  )

  return { workOrder: data, isLoading, error, mutate }
}
