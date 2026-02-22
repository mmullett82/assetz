'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, Bell, ChevronRight, LogOut, User, Settings } from 'lucide-react'

// Map route segments to readable breadcrumb labels
const ROUTE_LABELS: Record<string, string> = {
  dashboard:    'Dashboard',
  assets:       'Assets',
  'work-orders': 'Work Orders',
  pm:           'PM Schedules',
  parts:        'Parts & Inventory',
  'floor-plan': 'Floor Plan',
  reports:      'Reports',
  settings:     'Settings',
  onboarding:   'Onboarding',
  new:          'New',
  edit:         'Edit',
}

function useBreadcrumbs(): { label: string; href: string }[] {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)
  return segments.map((seg, i) => ({
    label: ROUTE_LABELS[seg] ?? seg,
    href: '/' + segments.slice(0, i + 1).join('/'),
  }))
}

interface HeaderProps {
  onMenuClick: () => void
  // User object will come from auth context — placeholder for now
  userName?: string
  userRole?: string
  notificationCount?: number
}

export default function Header({
  onMenuClick,
  userName = 'Matt M.',
  userRole = 'Manager',
  notificationCount = 0,
}: HeaderProps) {
  const breadcrumbs = useBreadcrumbs()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-4">
      {/* Hamburger — mobile only */}
      <button
        type="button"
        onClick={onMenuClick}
        className="lg:hidden flex items-center justify-center rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex-1 min-w-0">
        <ol className="flex items-center gap-1 text-sm text-slate-500" role="list">
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1
            return (
              <li key={crumb.href} className="flex items-center gap-1">
                {i > 0 && (
                  <ChevronRight
                    className="h-3.5 w-3.5 shrink-0 text-slate-400"
                    aria-hidden="true"
                  />
                )}
                {isLast ? (
                  <span className="font-semibold text-slate-900 truncate">
                    {crumb.label}
                  </span>
                ) : (
                  <a
                    href={crumb.href}
                    className="truncate hover:text-slate-900 transition-colors"
                  >
                    {crumb.label}
                  </a>
                )}
              </li>
            )
          })}
        </ol>
      </nav>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button
          type="button"
          className="relative flex items-center justify-center rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          aria-label={`Notifications${notificationCount > 0 ? `, ${notificationCount} unread` : ''}`}
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          {notificationCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setUserMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full px-2 py-1 text-sm hover:bg-slate-100 transition-colors min-h-[44px]"
            aria-expanded={userMenuOpen}
            aria-haspopup="true"
            aria-label="User menu"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold select-none">
              {userName.charAt(0).toUpperCase()}
            </span>
            <span className="hidden sm:block text-left">
              <span className="block font-medium text-slate-900 leading-tight">
                {userName}
              </span>
              <span className="block text-xs text-slate-500 leading-tight capitalize">
                {userRole}
              </span>
            </span>
          </button>

          {/* Dropdown */}
          {userMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setUserMenuOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                <a
                  href="/settings"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <User className="h-4 w-4" aria-hidden="true" />
                  Profile
                </a>
                <a
                  href="/settings"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Settings className="h-4 w-4" aria-hidden="true" />
                  Settings
                </a>
                <hr className="my-1 border-slate-100" />
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                  onClick={() => {
                    setUserMenuOpen(false)
                    // logout() will be wired when auth context is added
                  }}
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
