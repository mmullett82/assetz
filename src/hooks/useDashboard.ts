'use client'

import { useEffect } from 'react'
import useSWR from 'swr'
import type { DashboardKPIs, WSEvent } from '@/types'
import apiClient from '@/lib/api-client'
import { MOCK_KPIS } from '@/lib/mock-dashboard'
import wsManager from '@/lib/ws-manager'

const USE_MOCK = true // always use mock data until backend is connected

export function useDashboard() {
  const { data, error, isLoading, mutate } = useSWR<DashboardKPIs>(
    'dashboard/kpis',
    () => USE_MOCK ? Promise.resolve(MOCK_KPIS) : apiClient.dashboard.kpis(),
    {
      revalidateOnFocus: false,
      // Refresh every 60s as a safety net alongside WebSocket updates
      refreshInterval: 60_000,
    }
  )

  // Subscribe to real-time KPI updates from the backend WebSocket.
  // When Grant's backend emits a kpi.updated event, we call mutate() to
  // merge the new values into the existing KPI snapshot.
  useEffect(() => {
    const unsubscribe = wsManager.on<Partial<DashboardKPIs>>(
      'kpi.updated',
      (event: WSEvent<Partial<DashboardKPIs>>) => {
        mutate(
          (prev) => prev ? { ...prev, ...event.payload } : prev,
          { revalidate: false }
        )
      }
    )
    return unsubscribe
  }, [mutate])

  return { kpis: data, isLoading, error, mutate }
}
