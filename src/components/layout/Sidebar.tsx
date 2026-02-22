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
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
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
          'fixed inset-y-0 left-0 z-30 flex w-64 flex-col',
          'bg-slate-900 transition-transform duration-200 ease-in-out',
          // Desktop: always visible; mobile: slide in/out
          'lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Logo / brand */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-700">
          <Link href="/dashboard" className="flex items-center gap-2 min-h-0">
            <Zap className="h-6 w-6 text-blue-400" aria-hidden="true" />
            <span className="text-xl font-bold tracking-tight text-white">
              assetZ
            </span>
          </Link>
          {/* Close button — mobile only */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden rounded-md p-1 text-slate-400 hover:text-white"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-4 px-2" aria-label="Main navigation">
          <ul className="space-y-1" role="list">
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
                    className={[
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                      'min-h-[44px] transition-colors',
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white',
                    ].join(' ')}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-700 px-4 py-3">
          <p className="text-xs text-slate-500">chaiT · assetZ v0.1</p>
        </div>
      </aside>
    </>
  )
}
