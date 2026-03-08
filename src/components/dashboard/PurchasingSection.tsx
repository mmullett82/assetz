'use client'

import Link from 'next/link'
import { Package, Truck } from 'lucide-react'
import type { DashboardKPIs } from '@/types'

interface InventoryProps {
  kpis: DashboardKPIs | undefined
  loading?: boolean
}

export default function PurchasingSection({ kpis, loading }: InventoryProps) {
  const partsLow = kpis?.parts_low_stock ?? 0
  const backorder = kpis?.parts_on_backorder ?? 0

  const cards = [
    {
      label: 'Parts Low Stock',
      value: partsLow,
      icon: Package,
      href: '/parts?status=low_stock,out_of_stock',
      border: partsLow > 0 ? 'border-l-yellow-400' : 'border-l-green-500',
      textColor: partsLow > 0 ? 'text-yellow-600' : 'text-slate-900',
    },
    {
      label: 'Parts on Backorder',
      value: backorder,
      icon: Truck,
      href: '/parts?on_backorder=true',
      border: backorder > 0 ? 'border-l-red-500' : 'border-l-green-500',
      textColor: backorder > 0 ? 'text-red-600' : 'text-slate-900',
    },
  ]

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Inventory</p>
      <div className="flex flex-col gap-3">
        {cards.map((card) => {
          if (loading) {
            return (
              <div key={card.label} className="rounded-lg border border-slate-200 border-l-4 border-l-slate-100 bg-white p-3 animate-pulse">
                <div className="h-3 w-28 rounded bg-slate-100" />
                <div className="mt-2 h-7 w-10 rounded bg-slate-100" />
              </div>
            )
          }
          return (
            <Link
              key={card.label}
              href={card.href}
              className={[
                'rounded-lg border border-slate-200 border-l-4 bg-white p-3',
                'hover:shadow-md hover:ring-1 hover:ring-blue-300 transition-shadow',
                card.border,
              ].join(' ')}
            >
              <div className="flex items-center gap-1.5">
                <card.icon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{card.label}</span>
              </div>
              <p className={`mt-1.5 text-2xl font-bold tabular-nums ${card.textColor}`}>{card.value}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
