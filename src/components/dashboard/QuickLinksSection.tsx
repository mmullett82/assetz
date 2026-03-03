'use client'

import Link from 'next/link'
import { Plus, ClipboardList, CalendarClock, Inbox, Package, Cpu } from 'lucide-react'
import Can from '@/components/ui/Can'
import type { Action } from '@/lib/permissions'
import type { LucideIcon } from 'lucide-react'

interface QuickLink {
  label: string
  href: string
  icon: LucideIcon
  permission: Action
  color: string
}

const LINKS: QuickLink[] = [
  { label: 'Create Work Order', href: '/work-orders/new', icon: ClipboardList, permission: 'create_work_orders', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
  { label: 'Create PM', href: '/pm/new', icon: CalendarClock, permission: 'create_pm', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
  { label: 'Submit Request', href: '/requests/new', icon: Inbox, permission: 'submit_requests', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
  { label: 'Create Part', href: '/parts/new', icon: Package, permission: 'create_parts', color: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
  { label: 'Create Asset', href: '/assets/new', icon: Cpu, permission: 'create_assets', color: 'bg-slate-50 text-slate-700 hover:bg-slate-100' },
]

export default function QuickLinksSection() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 mb-3">Quick Actions</h2>
      <div className="flex flex-wrap gap-2">
        {LINKS.map((link) => (
          <Can key={link.href} action={link.permission}>
            <Link
              href={link.href}
              className={[
                'inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                link.color,
              ].join(' ')}
            >
              <Plus className="h-4 w-4" />
              {link.label}
            </Link>
          </Can>
        ))}
      </div>
    </div>
  )
}
