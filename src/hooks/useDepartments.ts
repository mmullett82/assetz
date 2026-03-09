'use client'

import useSWR from 'swr'
import type { Department } from '@/types'
import { MOCK_DEPARTMENTS } from '@/lib/mock-data'
import { USE_MOCK } from '@/lib/config'
import apiClient from '@/lib/api-client'

export function useDepartments() {
  const { data, error, isLoading, mutate } = useSWR<Department[]>(
    'departments',
    () => USE_MOCK ? Promise.resolve(MOCK_DEPARTMENTS) : apiClient.departments.list(),
    { revalidateOnFocus: false }
  )

  return {
    departments: data ?? [],
    isLoading,
    error,
    mutate,
  }
}
