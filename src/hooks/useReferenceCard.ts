'use client'

import useSWR from 'swr'
import type { ReferenceCard } from '@/types'
import apiClient from '@/lib/api-client'
import { MOCK_REFERENCE_CARDS } from '@/lib/mock-reference-cards'
import { USE_MOCK } from '@/lib/config'

export function useReferenceCard(id: string) {
  const { data, error, isLoading, mutate } = useSWR<ReferenceCard>(
    id ? `reference-card/${id}` : null,
    () => {
      if (USE_MOCK) {
        const found = MOCK_REFERENCE_CARDS.find((c) => c.id === id)
        return found ? Promise.resolve(found) : Promise.reject(new Error('Not found'))
      }
      return apiClient.referenceCards.get(id)
    },
    { revalidateOnFocus: false }
  )

  return { card: data, isLoading, error, mutate }
}

export function useReferenceCardForAsset(assetId: string, assetModel?: string) {
  const { data, error, isLoading } = useSWR<ReferenceCard | null>(
    assetId ? `reference-card-for-asset/${assetId}` : null,
    () => {
      if (USE_MOCK) {
        // Resolution: specific asset first, then model match
        const byAsset = MOCK_REFERENCE_CARDS.find((c) => c.asset_id === assetId)
        if (byAsset) return Promise.resolve(byAsset)
        if (assetModel) {
          const byModel = MOCK_REFERENCE_CARDS.find((c) => c.asset_model === assetModel)
          if (byModel) return Promise.resolve(byModel)
        }
        return Promise.resolve(null)
      }
      return apiClient.referenceCards.forAsset(assetId)
    },
    { revalidateOnFocus: false }
  )

  return { card: data ?? null, isLoading, error }
}
