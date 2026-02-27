'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from './Sidebar'
import Header from './Header'
import { useAuth } from '@/hooks/useAuth'
import { USE_MOCK } from '@/lib/config'

interface AppShellProps {
  children: React.ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('sidebar-collapsed') === 'true'
  })

  // Auth guard — redirect to login if not authenticated (skip in mock mode)
  useEffect(() => {
    if (!USE_MOCK && !authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [USE_MOCK, authLoading, isAuthenticated, router])

  if (!USE_MOCK && authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-slate-400">Loading...</div>
      </div>
    )
  }

  function handleCollapseToggle() {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem('sidebar-collapsed', String(next))
      return next
    })
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onCollapseToggle={handleCollapseToggle}
      />

      {/* Main column: header + scrollable content */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-4 sm:p-6"
        >
          {children}
        </main>
      </div>
    </div>
  )
}
