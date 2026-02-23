'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import type { TechnicianScore, TeamSummary } from '@/lib/mock-scoreboard'
import { MOCK_TECH_SCORES, MOCK_TEAM_SUMMARY } from '@/lib/mock-scoreboard'

const USE_MOCK = true // always use mock data until backend is connected

interface ScoreboardData {
  scores: TechnicianScore[]
  teamSummary: TeamSummary
}

async function fetchScoreboard(_key: [string, string]): Promise<ScoreboardData> {
  if (USE_MOCK) {
    return Promise.resolve({ scores: MOCK_TECH_SCORES, teamSummary: MOCK_TEAM_SUMMARY })
  }
  // TODO: wire to apiClient when Grant's endpoint is ready
  // const res = await apiClient.get(`/scoreboard?period=${period}`)
  // return res
  return Promise.resolve({ scores: MOCK_TECH_SCORES, teamSummary: MOCK_TEAM_SUMMARY })
}

export function useScoreboard(period: string = 'month') {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const { data, error, isLoading } = useSWR<ScoreboardData>(
    ['scoreboard', period],
    fetchScoreboard,
    {
      revalidateOnFocus: false,
      refreshInterval: 60_000,
    }
  )

  useEffect(() => {
    if (data) {
      setLastUpdated(new Date())
    }
  }, [data])

  return {
    scores: data?.scores ?? [],
    teamSummary: data?.teamSummary ?? null,
    isLoading,
    error,
    lastUpdated,
  }
}
