'use client'

import Link from 'next/link'
import { PackageMinus, Truck } from 'lucide-react'
import type { DashboardKPIs } from '@/types'

interface PurchasingSectionProps {
  kpis: DashboardKPIs | undefined
  loading?: boolean
}

export default function PurchasingSection({ kpis, loading }: PurchasingSectionProps) {
  const cards = [
    {
      label: 'Parts Require Reorder',
      value: kpis?.parts_low_stock ?? 0,
      icon: PackageMinus,
      href: '/parts?low_stock_only=true',
      color: (kpis?.parts_low_stock ?? 0) > 0 ? 'border-l-yellow-400' : 'border-l-green-500',
    },
    {
      label: 'Parts on Backorder',
      value: kpis?.parts_on_backorder ?? 0,
      icon: Truck,
      href: '/parts?on_backorder=true',
      color: (kpis?.parts_on_backorder ?? 0) > 0 ? 'border-l-red-500' : 'border-l-green-500',
    },
  ]

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 mb-3">Purchasing & Inventory</h2>
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => {
          if (loading) {
            return (
              <div key={card.label} className="rounded-lg border border-slate-200 bg-white p-4 animate-pulse">
                <div className="h-3 w-28 rounded bg-slate-100" />
                <div className="mt-2 h-8 w-10 rounded bg-slate-100" />
              </div>
            )
          }
          return (
            <Link
              key={card.label}
              href={card.href}
              className={[
                'rounded-lg border border-slate-200 bg-white p-4 border-l-4',
                'hover:shadow-md hover:ring-1 hover:ring-blue-300 transition-shadow',
                card.color,
              ].join(' ')}
            >
              <div className="flex items-center gap-2">
                <card.icon className="h-4 w-4 text-slate-400" />
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{card.label}</span>
              </div>
              <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900">{card.value}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
