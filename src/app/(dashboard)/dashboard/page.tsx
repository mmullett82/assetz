'use client'

import {
  ClipboardList,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Cpu,
  CalendarClock,
  Package,
  Users,
  Timer,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { useDashboard } from '@/hooks/useDashboard'
import { useWorkOrders } from '@/hooks/useWorkOrders'
import KPICard from '@/components/dashboard/KPICard'
import WOTrendChart from '@/components/dashboard/WOTrendChart'
import PMComplianceChart from '@/components/dashboard/PMComplianceChart'
import WOTypeBreakdown from '@/components/dashboard/WOTypeBreakdown'
import DownAssetsAlert from '@/components/dashboard/DownAssetsAlert'
import CriticalWOList from '@/components/dashboard/CriticalWOList'
import { MOCK_KPI_DELTAS } from '@/lib/mock-dashboard'
import wsManager from '@/lib/ws-manager'

function LiveIndicator() {
  // For now always shows disconnected since no backend is running.
  // Will show green dot when wsManager.isConnected is true.
  const connected = wsManager.isConnected
  return (
    <span
      title={connected ? 'Live — real-time updates active' : 'Not connected to live data'}
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${connected ? 'text-green-600' : 'text-slate-400'}`}
    >
      {connected
        ? <Wifi className="h-3.5 w-3.5" />
        : <WifiOff className="h-3.5 w-3.5" />}
      {connected ? 'Live' : 'Mock data'}
    </span>
  )
}

export default function DashboardPage() {
  const { kpis, isLoading }       = useDashboard()
  const { workOrders }            = useWorkOrders()

  const d = MOCK_KPI_DELTAS

  const pmStatus = (kpis?.pm_compliance_rate ?? 0) >= 90
    ? 'green'
    : (kpis?.pm_compliance_rate ?? 0) >= 75
    ? 'yellow'
    : 'red'

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">
            {new Date().toLocaleDateString('en-CA', {
              weekday: 'long', month: 'long', day: 'numeric',
            })}
          </p>
        </div>
        <LiveIndicator />
      </div>

      {/* Down-asset alert banner — only shows when assets are down */}
      <DownAssetsAlert />

      {/* KPI grid — 2 cols mobile, 4 cols desktop */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard
          label="Open Work Orders"
          value={kpis?.open_work_orders ?? '—'}
          icon={<ClipboardList className="h-5 w-5" />}
          status={
            (kpis?.open_work_orders ?? 0) > 8 ? 'red'
            : (kpis?.open_work_orders ?? 0) > 4 ? 'yellow'
            : 'neutral'
          }
          delta={{ value: d.open_work_orders.value, positiveIsGood: false }}
          loading={isLoading}
        />

        <KPICard
          label="Overdue"
          value={kpis?.overdue_work_orders ?? '—'}
          icon={<AlertTriangle className="h-5 w-5" />}
          status={(kpis?.overdue_work_orders ?? 0) > 0 ? 'red' : 'green'}
          delta={{ value: d.overdue_work_orders.value, positiveIsGood: false }}
          loading={isLoading}
        />

        <KPICard
          label="Due Today"
          value={kpis?.work_orders_due_today ?? '—'}
          icon={<Clock className="h-5 w-5" />}
          status={(kpis?.work_orders_due_today ?? 0) > 2 ? 'yellow' : 'neutral'}
          delta={{ value: d.work_orders_due_today.value, positiveIsGood: false }}
          loading={isLoading}
        />

        <KPICard
          label="Completed This Week"
          value={kpis?.work_orders_completed_this_week ?? '—'}
          icon={<CheckCircle2 className="h-5 w-5" />}
          status="green"
          delta={{ value: d.work_orders_completed_this_week.value, positiveIsGood: true }}
          loading={isLoading}
        />

        <KPICard
          label="Assets Down"
          value={
            kpis
              ? `${kpis.assets_down} / ${kpis.total_assets}`
              : '—'
          }
          icon={<Cpu className="h-5 w-5" />}
          status={(kpis?.assets_down ?? 0) > 0 ? 'red' : 'green'}
          delta={{ value: d.assets_down.value, positiveIsGood: false }}
          sublabel={kpis ? `${kpis.total_assets - kpis.assets_down} operational` : undefined}
          loading={isLoading}
        />

        <KPICard
          label="PM Compliance"
          value={kpis ? `${kpis.pm_compliance_rate}%` : '—%'}
          icon={<CalendarClock className="h-5 w-5" />}
          status={pmStatus}
          delta={{ value: d.pm_compliance_rate.value, unit: '%', positiveIsGood: true }}
          sublabel="Target: 90%"
          loading={isLoading}
        />

        <KPICard
          label="Parts Low Stock"
          value={kpis?.parts_low_stock ?? '—'}
          icon={<Package className="h-5 w-5" />}
          status={(kpis?.parts_low_stock ?? 0) > 0 ? 'yellow' : 'green'}
          delta={{ value: d.parts_low_stock.value, positiveIsGood: false }}
          loading={isLoading}
        />

        <KPICard
          label="MTTR"
          value={kpis?.mean_time_to_repair ? `${kpis.mean_time_to_repair}h` : '—'}
          icon={<Timer className="h-5 w-5" />}
          status={
            (kpis?.mean_time_to_repair ?? 0) > 8 ? 'red'
            : (kpis?.mean_time_to_repair ?? 0) > 4 ? 'yellow'
            : 'green'
          }
          delta={{ value: d.mean_time_to_repair.value, unit: 'h', positiveIsGood: false }}
          sublabel="Mean time to repair"
          loading={isLoading}
        />
      </div>

      {/* Charts row — WO trend (larger) + WO type donut (smaller) */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WOTrendChart />
        </div>
        <div>
          <WOTypeBreakdown />
        </div>
      </div>

      {/* PM compliance + open WOs row */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PMComplianceChart />
        </div>
        <div>
          <CriticalWOList workOrders={workOrders} />
        </div>
      </div>
    </div>
  )
}
