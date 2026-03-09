'use client'

import useSWR from 'swr'
import type { Tag } from '@/types'
import { USE_MOCK } from '@/lib/config'
import apiClient from '@/lib/api-client'

const MOCK_TAGS: Tag[] = []

export function useTags() {
  const { data, error, isLoading, mutate } = useSWR<Tag[]>(
    'tags',
    () => USE_MOCK ? Promise.resolve(MOCK_TAGS) : apiClient.tags.list(),
    { revalidateOnFocus: false }
  )

  return {
    tags: data ?? [],
    isLoading,
    error,
    mutate,
  }
}
