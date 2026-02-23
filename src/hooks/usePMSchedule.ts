'use client'

import useSWR from 'swr'
import type { PMSchedule } from '@/types'
import apiClient from '@/lib/api-client'
import { getMockPMSchedule } from '@/lib/mock-pm-schedules'
import { pmDueStatus } from '@/lib/pm-utils'

const USE_MOCK = true // always use mock data until backend is connected

export function usePMSchedule(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<PMSchedule>(
    id ? ['pm-schedule', id] : null,
    () => {
      if (USE_MOCK) {
        const pm = getMockPMSchedule(id!)
        if (!pm) return Promise.reject(new Error('Not found'))
        return Promise.resolve({ ...pm, due_status: pmDueStatus(pm.next_due_at) })
      }
      return apiClient.pmSchedules.get(id!)
    },
    { revalidateOnFocus: false }
  )

  return { pmSchedule: data, isLoading, error, mutate }
}
