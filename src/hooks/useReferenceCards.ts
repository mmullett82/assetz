'use client'

import useSWR from 'swr'
import type { ReferenceCard } from '@/types'
import apiClient from '@/lib/api-client'
import { MOCK_REFERENCE_CARDS } from '@/lib/mock-reference-cards'
import { USE_MOCK } from '@/lib/config'

export function useReferenceCards() {
  const { data, error, isLoading, mutate } = useSWR<ReferenceCard[]>(
    'reference-cards',
    () => USE_MOCK ? Promise.resolve(MOCK_REFERENCE_CARDS) : apiClient.referenceCards.list(),
    { revalidateOnFocus: false }
  )

  return { cards: data ?? [], isLoading, error, mutate }
}
