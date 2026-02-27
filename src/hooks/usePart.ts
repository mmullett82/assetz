'use client'

import useSWR from 'swr'
import type { Part } from '@/types'
import apiClient from '@/lib/api-client'
import { getMockPart } from '@/lib/mock-parts'
import { USE_MOCK } from '@/lib/config'

export function usePart(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Part>(
    id ? ['part', id] : null,
    () => {
      if (USE_MOCK) {
        const part = getMockPart(id!)
        if (!part) return Promise.reject(new Error('Not found'))
        return Promise.resolve(part)
      }
      return apiClient.parts.get(id!)
    },
    { revalidateOnFocus: false }
  )

  return { part: data, isLoading, error, mutate }
}
