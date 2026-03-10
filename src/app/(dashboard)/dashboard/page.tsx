'use client'

import {
  ClipboardList,
  AlertTriangle,
  Cpu,
  CalendarClock,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { useDashboard } from '@/hooks/useDashboard'
import { useWorkOrders } from '@/hooks/useWorkOrders'
import { usePermissions } from '@/hooks/usePermissions'
import KPICard from '@/components/dashboard/KPICard'
import WOTrendChart from '@/components/dashboard/WOTrendChart'
import PMComplianceChart from '@/components/dashboard/PMComplianceChart'
import WOTypeBreakdown from '@/components/dashboard/WOTypeBreakdown'
import DownAssetsAlert from '@/components/dashboard/DownAssetsAlert'
import CriticalWOList from '@/components/dashboard/CriticalWOList'
import WorkOverviewSection from '@/components/dashboard/WorkOverviewSection'
import PurchasingSection from '@/components/dashboard/PurchasingSection'
import MyWorkCenter from '@/components/dashboard/MyWorkCenter'
import QuickLinksSection from '@/components/dashboard/QuickLinksSection'
import DashboardConfig, { useDashboardSections } from '@/components/dashboard/DashboardConfig'
import { MOCK_KPI_DELTAS } from '@/lib/mock-dashboard'
import wsManager from '@/lib/ws-manager'

function LiveIndicator() {
  const connected = wsManager.isConnected
  return (
    <span
      title={connected ? 'Live — real-time updates active' : 'Not connected to live data'}
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${connected ? 'text-green-600' : 'text-slate-400'}`}
    >
      {connected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
      {connected ? 'Live' : 'Offline'}
    </span>
  )
}

export default function DashboardPage() {
  const { kpis, isLoading } = useDashboard()
  const { workOrders } = useWorkOrders()
  const { role, can, user } = usePermissions()
  const { sections, setSections } = useDashboardSections()

  const d = MOCK_KPI_DELTAS

  const pmStatus = (kpis?.pm_compliance_rate ?? 0) >= 90
    ? 'green'
    : (kpis?.pm_compliance_rate ?? 0) >= 75
    ? 'yellow'
    : 'red'

  const showFullDashboard = can('view_dashboard_full')
  const showMyWork = can('view_dashboard_my_work')
  const showMyRequests = can('view_dashboard_my_requests')

  return (
    <div className="space-y-5">

      {/* ── Page header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">
            {new Date().toLocaleDateString('en-CA', {
              weekday: 'long', month: 'long', day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <LiveIndicator />
          <DashboardConfig sections={sections} onChange={setSections} />
        </div>
      </div>

      {/* ── Alert banner — only renders when assets are down ── */}
      {showFullDashboard && <DownAssetsAlert />}

      {/* ── Tier 1: Critical status — always visible ─────────
           These four cards answer "are we on fire right now?"
           Order: most urgent → most contextual (F-pattern reading)   */}
      {showFullDashboard && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KPICard
            label="Overdue"
            value={kpis?.overdue_work_orders ?? '—'}
            icon={<AlertTriangle className="h-5 w-5" />}
            status={(kpis?.overdue_work_orders ?? 0) > 0 ? 'red' : 'green'}
            delta={{ value: d.overdue_work_orders.value, positiveIsGood: false }}
            loading={isLoading}
            href="/work-orders?overdue=true"
          />

          <KPICard
            label="Assets Down"
            value={kpis ? `${kpis.assets_down} / ${kpis.total_assets}` : '—'}
            icon={<Cpu className="h-5 w-5" />}
            status={(kpis?.assets_down ?? 0) > 0 ? 'red' : 'green'}
            delta={{ value: d.assets_down.value, positiveIsGood: false }}
            sublabel={kpis ? `${kpis.total_assets - kpis.assets_down} operational` : undefined}
            loading={isLoading}
            href="/assets?status=down"
          />

          <KPICard
            label="PM Compliance"
            value={kpis ? `${kpis.pm_compliance_rate}%` : '—%'}
            icon={<CalendarClock className="h-5 w-5" />}
            status={pmStatus}
            delta={{ value: d.pm_compliance_rate.value, unit: '%', positiveIsGood: true }}
            sublabel="Target: 90%"
            loading={isLoading}
            href="/pm?overdue_only=true"
          />

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
            href="/work-orders"
          />
        </div>
      )}

      {/* ── Tier 2: Work Breakdown + Inventory side-by-side ──
           Left (2/3): 6 work-state cards — planned, reactive,
             due today, critical, completed this week, MTTR
           Right (1/3): 4 inventory + request cards — all
             parts and requests info in one column              */}
      {sections.workBreakdown && showFullDashboard && (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <WorkOverviewSection kpis={kpis} loading={isLoading} />
          </div>
          <div>
            <PurchasingSection kpis={kpis} loading={isLoading} />
          </div>
        </div>
      )}

      {/* ── Quick Actions ────────────────────────────────────── */}
      {sections.quickLinks && <QuickLinksSection />}

      {/* ── My Work Center + Open Work Orders — side by side ── */}
      {sections.myWorkCenter && showMyWork && (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <MyWorkCenter
              workOrders={workOrders}
              userId={user?.id}
              loading={isLoading}
            />
          </div>
          <div>
            <CriticalWOList workOrders={workOrders} />
          </div>
        </div>
      )}

      {/* ── Requester view ───────────────────────────────────── */}
      {role === 'requester' && showMyRequests && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">My Requests</h2>
          <p className="text-sm text-slate-500 mb-4">Track your submitted maintenance requests</p>
          <a
            href="/requests"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
          >
            View My Requests
          </a>
        </div>
      )}

      {/* ── Charts & Trends — analytical, below operational ── */}
      {sections.charts && showFullDashboard && (
        <>
          <div className="flex items-center gap-2 pt-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Charts & Trends</p>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <WOTrendChart />
            </div>
            <div>
              <WOTypeBreakdown />
            </div>
          </div>

          <PMComplianceChart />
        </>
      )}

    </div>
  )
}
