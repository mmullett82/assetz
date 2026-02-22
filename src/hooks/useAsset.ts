'use client'

import useSWR from 'swr'
import type { Asset } from '@/types'
import apiClient from '@/lib/api-client'
import { getMockAsset } from '@/lib/mock-data'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true' || process.env.NODE_ENV === 'development'

export function useAsset(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Asset>(
    id ? ['asset', id] : null,
    () =>
      USE_MOCK
        ? Promise.resolve(getMockAsset(id!) ?? Promise.reject(new Error('Not found')))
        : apiClient.assets.get(id!),
    { revalidateOnFocus: false }
  )

  return { asset: data, isLoading, error, mutate }
}
