'use client'

import { useState, useEffect, useCallback } from 'react'
import type { User } from '@/types'
import apiClient, { setAuthToken } from '@/lib/api-client'
import wsManager from '@/lib/ws-manager'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  // Restore session from localStorage token on mount
  useEffect(() => {
    const token = localStorage.getItem('assetz_token')
    if (!token) {
      setState({ user: null, isLoading: false, isAuthenticated: false })
      return
    }

    apiClient.auth
      .me()
      .then((user) => {
        setState({ user, isLoading: false, isAuthenticated: true })
        wsManager.connect(token)
      })
      .catch(() => {
        localStorage.removeItem('assetz_token')
        setState({ user: null, isLoading: false, isAuthenticated: false })
      })
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { access_token, user } = await apiClient.auth.login({ email, password })
    localStorage.setItem('assetz_token', access_token)
    setAuthToken(access_token)
    wsManager.connect(access_token)
    setState({ user, isLoading: false, isAuthenticated: true })
    return user
  }, [])

  const logout = useCallback(async () => {
    await apiClient.auth.logout().catch(() => {})
    localStorage.removeItem('assetz_token')
    setAuthToken(null)
    wsManager.disconnect()
    setState({ user: null, isLoading: false, isAuthenticated: false })
  }, [])

  return { ...state, login, logout }
}
