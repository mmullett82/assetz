'use client'

import useSWR from 'swr'
import type { Asset, PaginatedResponse } from '@/types'
import apiClient, { type AssetsQuery } from '@/lib/api-client'
import { MOCK_ASSETS } from '@/lib/mock-data'
import { USE_MOCK } from '@/lib/config'

function mockFetcher(query?: AssetsQuery): PaginatedResponse<Asset> {
  let data = [...MOCK_ASSETS]

  if (query?.search) {
    const q = query.search.toLowerCase()
    data = data.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.facility_asset_id.toLowerCase().includes(q) ||
        a.asset_number.toLowerCase().includes(q) ||
        a.manufacturer?.toLowerCase().includes(q)
    )
  }

  if (query?.status) {
    data = data.filter((a) => a.status === query.status)
  }

  if (query?.department_id) {
    data = data.filter((a) => a.department_id === query.department_id)
  }

  return {
    data,
    total: data.length,
    page: 1,
    page_size: 50,
    total_pages: 1,
  }
}

export function useAssets(query?: AssetsQuery) {
  const key = ['assets', query]

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Asset>>(
    key,
    () =>
      USE_MOCK
        ? Promise.resolve(mockFetcher(query))
        : apiClient.assets.list(query),
    { revalidateOnFocus: false }
  )

  return {
    assets: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    mutate,
  }
}
