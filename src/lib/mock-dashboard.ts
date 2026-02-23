/**
 * Mock dashboard data for assetZ — SOLLiD Cabinetry scenario.
 * All KPIs and chart series are realistic for a mid-size cabinet manufacturing plant.
 */

import type { DashboardKPIs } from '@/types'

// ─── KPI snapshot ─────────────────────────────────────────────────────────────

export const MOCK_KPIS: DashboardKPIs = {
  open_work_orders:              4,
  overdue_work_orders:           1,
  work_orders_due_today:         0,
  work_orders_completed_this_week: 2,
  assets_down:                   1,    // Rover CNC is down
  total_assets:                  9,
  pm_compliance_rate:            78,   // Below 90% target — needs attention
  mean_time_to_repair:           3.2,  // hours
  parts_low_stock:               2,
  technicians_active:            2,
}

// Deltas vs. prior 7 days — positive = improved
export const MOCK_KPI_DELTAS: Record<string, { value: number; unit?: string }> = {
  open_work_orders:              { value: -2 },          // 2 fewer open WOs
  overdue_work_orders:           { value: -1 },          // 1 fewer overdue
  work_orders_due_today:         { value: 0 },
  work_orders_completed_this_week: { value: +2 },       // 2 more completed
  assets_down:                   { value: +1 },          // 1 more asset down (bad)
  pm_compliance_rate:            { value: -7, unit: '%' }, // dropped 7 pts
  parts_low_stock:               { value: +1 },          // 1 more low stock item
  mean_time_to_repair:           { value: -0.8, unit: 'h' }, // faster by 0.8h (good)
}

// ─── WO trend — 8 weeks ───────────────────────────────────────────────────────

export type WOTrendPoint = {
  week: string      // "Jan 5", "Jan 12", …
  opened: number
  completed: number
}

export const WO_TREND_DATA: WOTrendPoint[] = [
  { week: 'Jan 5',  opened: 8,  completed: 6  },
  { week: 'Jan 12', opened: 5,  completed: 7  },
  { week: 'Jan 19', opened: 9,  completed: 5  },
  { week: 'Jan 26', opened: 7,  completed: 9  },
  { week: 'Feb 2',  opened: 11, completed: 8  },
  { week: 'Feb 9',  opened: 6,  completed: 10 },
  { week: 'Feb 16', opened: 8,  completed: 7  },
  { week: 'Feb 21', opened: 3,  completed: 2  }, // current partial week
]

// ─── PM compliance — 6 months ─────────────────────────────────────────────────

export type PMCompliancePoint = {
  month: string
  rate: number
  target: number
}

export const PM_COMPLIANCE_DATA: PMCompliancePoint[] = [
  { month: 'Sep', rate: 82, target: 90 },
  { month: 'Oct', rate: 88, target: 90 },
  { month: 'Nov', rate: 79, target: 90 },
  { month: 'Dec', rate: 91, target: 90 },
  { month: 'Jan', rate: 85, target: 90 },
  { month: 'Feb', rate: 78, target: 90 }, // current month, below target
]

// ─── WO by type ───────────────────────────────────────────────────────────────

export type WOTypePoint = {
  name: string
  value: number
  color: string
}

export const WO_TYPE_DATA: WOTypePoint[] = [
  { name: 'Corrective',  value: 45, color: '#ef4444' },
  { name: 'Preventive',  value: 30, color: '#3b82f6' },
  { name: 'Inspection',  value: 15, color: '#8b5cf6' },
  { name: 'Safety',      value: 7,  color: '#f97316' },
  { name: 'Project',     value: 3,  color: '#6b7280' },
]

// ─── WO by priority ───────────────────────────────────────────────────────────

export type WOPriorityPoint = {
  name: string
  value: number
  color: string
}

export const WO_PRIORITY_DATA: WOPriorityPoint[] = [
  { name: 'Critical', value: 5,  color: '#ef4444' },
  { name: 'High',     value: 20, color: '#f97316' },
  { name: 'Medium',   value: 45, color: '#3b82f6' },
  { name: 'Low',      value: 30, color: '#94a3b8' },
]
