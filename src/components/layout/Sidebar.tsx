'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Cpu,
  ClipboardList,
  CalendarClock,
  Package,
  Map,
  BarChart2,
  Settings,
  X,
  Zap,
  PanelLeft,
  PanelLeftOpen,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard',    label: 'Dashboard',        icon: LayoutDashboard },
  { href: '/assets',       label: 'Assets',           icon: Cpu             },
  { href: '/work-orders',  label: 'Work Orders',      icon: ClipboardList   },
  { href: '/pm',           label: 'PM Schedules',     icon: CalendarClock   },
  { href: '/parts',        label: 'Parts & Inventory',icon: Package         },
  { href: '/floor-plan',   label: 'Floor Plan',       icon: Map             },
  { href: '/reports',      label: 'Reports',          icon: BarChart2       },
  { href: '/settings',     label: 'Settings',         icon: Settings        },
] as const

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  collapsed: boolean
  onCollapseToggle: () => void
}

export default function Sidebar({ isOpen, onClose, collapsed, onCollapseToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-30 flex flex-col',
          'bg-slate-900 transition-all duration-200 ease-in-out',
          'lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          collapsed ? 'w-16' : 'w-56',
        ].join(' ')}
      >
        {/* Logo / brand */}
        {collapsed ? (
          /* Collapsed header — just the logo icon */
          <div className="flex h-16 items-center justify-center border-b border-slate-700">
            <Link href="/dashboard" aria-label="assetZ home">
              <Zap className="h-6 w-6 text-blue-400" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          /* Expanded header — logo + collapse button (desktop) + close button (mobile) */
          <div className="flex h-16 items-center justify-between border-b border-slate-700 px-4">
            <Link href="/dashboard" className="flex items-center gap-2 min-h-0">
              <Zap className="h-6 w-6 text-blue-400" aria-hidden="true" />
              <span className="text-xl font-bold tracking-tight text-white">assetZ</span>
            </Link>
            {/* Mobile close */}
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden rounded-md p-1 text-slate-400 hover:text-white"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            {/* Desktop collapse */}
            <button
              type="button"
              onClick={onCollapseToggle}
              title="Collapse sidebar"
              className="hidden lg:flex items-center justify-center rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              aria-label="Collapse sidebar"
            >
              <PanelLeft className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-4 px-2" aria-label="Main navigation">
          <ul className="space-y-1" role="list">
            {/* Expand button — collapsed state, desktop only */}
            {collapsed && (
              <li>
                <button
                  type="button"
                  onClick={onCollapseToggle}
                  title="Expand sidebar"
                  className="hidden lg:flex w-full justify-center rounded-lg py-2.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                  aria-label="Expand sidebar"
                >
                  <PanelLeftOpen className="h-5 w-5" aria-hidden="true" />
                </button>
              </li>
            )}

            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive =
                href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(href)

              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onClose}
                    title={collapsed ? label : undefined}
                    className={[
                      'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium',
                      'min-h-[44px] transition-colors',
                      collapsed ? 'justify-center gap-0' : 'gap-3',
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white',
                    ].join(' ')}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    {!collapsed && label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-700 px-2 py-3">
          {!collapsed && (
            <p className="px-2 text-xs text-slate-500">chaiT · assetZ v0.1</p>
          )}
        </div>
      </aside>
    </>
  )
}
