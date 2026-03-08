'use client'

import useSWR from 'swr'
import type { Asset } from '@/types'
import apiClient from '@/lib/api-client'
import { USE_MOCK } from '@/lib/config'
import { MOCK_ASSETS } from '@/lib/mock-data'

interface AssetDependencies {
  depends_on: Asset[]
  feeds: Asset[]
  dependents: Asset[]
}

function mockDependencies(id: string): AssetDependencies {
  const asset = MOCK_ASSETS.find((a) => a.id === id)
  if (!asset) return { depends_on: [], feeds: [], dependents: [] }

  return {
    depends_on: (asset.depends_on ?? []).flatMap((aid) => {
      const a = MOCK_ASSETS.find((x) => x.id === aid)
      return a ? [a] : []
    }),
    feeds: (asset.feeds ?? []).flatMap((aid) => {
      const a = MOCK_ASSETS.find((x) => x.id === aid)
      return a ? [a] : []
    }),
    dependents: MOCK_ASSETS.filter(
      (a) => a.depends_on?.includes(id) || a.feeds?.includes(id)
    ),
  }
}

export function useAssetDependencies(id: string | null) {
  const { data, error, isLoading } = useSWR<AssetDependencies>(
    id ? ['asset-dependencies', id] : null,
    () =>
      USE_MOCK
        ? Promise.resolve(mockDependencies(id!))
        : apiClient.assets.dependencies(id!),
    { revalidateOnFocus: false }
  )

  return {
    dependencies: data ?? { depends_on: [], feeds: [], dependents: [] },
    isLoading,
    error,
  }
}
