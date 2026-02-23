'use client'

import useSWR from 'swr'
import type { Part, PaginatedResponse } from '@/types'
import apiClient, { type PartsQuery } from '@/lib/api-client'
import { MOCK_PARTS } from '@/lib/mock-parts'

const USE_MOCK = true // always use mock data until backend is connected

export interface PartsQueryExtended extends PartsQuery {
  manufacturer?: string
}

function mockFetcher(query?: PartsQueryExtended): PaginatedResponse<Part> {
  let data = [...MOCK_PARTS]

  if (query?.search) {
    const q = query.search.toLowerCase()
    data = data.filter(
      (p) =>
        p.part_number.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.manufacturer?.toLowerCase().includes(q) ||
        p.vendor?.toLowerCase().includes(q)
    )
  }

  if (query?.status) {
    data = data.filter((p) => p.status === query.status)
  }

  if (query?.manufacturer) {
    data = data.filter((p) => p.manufacturer === query.manufacturer)
  }

  if (query?.asset_id) {
    data = data.filter((p) => p.compatible_assets?.includes(query.asset_id!))
  }

  if (query?.low_stock_only) {
    data = data.filter((p) => p.status === 'low_stock' || p.status === 'out_of_stock')
  }

  return { data, total: data.length, page: 1, page_size: 50, total_pages: 1 }
}

export function useParts(query?: PartsQueryExtended) {
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Part>>(
    ['parts', query],
    () => USE_MOCK ? Promise.resolve(mockFetcher(query)) : apiClient.parts.list(query),
    { revalidateOnFocus: false }
  )

  return {
    parts: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    mutate,
  }
}
