import type { WorkOrderStatus, WorkOrderPriority, DueStatus } from '@/types'

// ─── Scoreboard-specific types (aggregated, not part of backend schema) ────────

export interface TechnicianWOSummary {
  id: string
  work_order_number: string
  title: string
  status: WorkOrderStatus
  priority: WorkOrderPriority
  due_date?: string
  due_status?: DueStatus
  asset_name: string
}

export interface TechnicianScore {
  user_id: string
  name: string
  email: string
  assigned_wos: number
  completed_wos: number
  pm_completion_pct: number     // 0–100
  on_time_pct: number           // 0–100
  overdue_wos: number
  avg_response_hours: number    // hours from WO open → in_progress
  row_status: 'green' | 'yellow' | 'red'
  recent_wos: TechnicianWOSummary[]
}

export interface TeamSummary {
  pm_completion_rate: number    // 0–100
  on_time_wo_rate: number       // 0–100
  preventive_pct: number        // % of WOs that are preventive
  total_open_wos: number
}

// ─── Row status helper ─────────────────────────────────────────────────────────

function rowStatus(score: Pick<TechnicianScore, 'on_time_pct' | 'overdue_wos'>): 'green' | 'yellow' | 'red' {
  if (score.on_time_pct < 75 || score.overdue_wos >= 3) return 'red'
  if (score.on_time_pct >= 90 && score.overdue_wos === 0) return 'green'
  return 'yellow'
}

// ─── Mock data — Feb 2026 period ───────────────────────────────────────────────

export const MOCK_TECH_SCORES: TechnicianScore[] = [
  {
    user_id: 'usr-tech5',
    name: 'Chris Walsh',
    email: 'cwalsh@sollid.com',
    assigned_wos: 10,
    completed_wos: 10,
    pm_completion_pct: 95,
    on_time_pct: 96.0,
    overdue_wos: 0,
    avg_response_hours: 1.8,
    row_status: rowStatus({ on_time_pct: 96.0, overdue_wos: 0 }),
    recent_wos: [
      {
        id: 'wo-cw-01',
        work_order_number: 'WO-2026-0041',
        title: 'Belt tensioner replacement',
        status: 'completed',
        priority: 'medium',
        due_date: '2026-02-18',
        due_status: 'green',
        asset_name: 'Edge Bander C1-01',
      },
      {
        id: 'wo-cw-02',
        work_order_number: 'WO-2026-0044',
        title: 'Monthly lubrication PM',
        status: 'completed',
        priority: 'low',
        due_date: '2026-02-20',
        due_status: 'green',
        asset_name: 'CNC Rover C2-01',
      },
      {
        id: 'wo-cw-03',
        work_order_number: 'WO-2026-0051',
        title: 'Vacuum pump filter service',
        status: 'in_progress',
        priority: 'medium',
        due_date: '2026-02-24',
        due_status: 'green',
        asset_name: 'CNC DrillTeq C4-01',
      },
    ],
  },
  {
    user_id: 'usr-tech1',
    name: 'Jake Hayes',
    email: 'jhayes@sollid.com',
    assigned_wos: 12,
    completed_wos: 11,
    pm_completion_pct: 92,
    on_time_pct: 91.7,
    overdue_wos: 0,
    avg_response_hours: 2.1,
    row_status: rowStatus({ on_time_pct: 91.7, overdue_wos: 0 }),
    recent_wos: [
      {
        id: 'wo-jh-01',
        work_order_number: 'WO-2026-0038',
        title: 'Servo motor inspection',
        status: 'completed',
        priority: 'high',
        due_date: '2026-02-15',
        due_status: 'green',
        asset_name: 'Beam Saw C5-01',
      },
      {
        id: 'wo-jh-02',
        work_order_number: 'WO-2026-0047',
        title: 'Coolant system flush',
        status: 'completed',
        priority: 'medium',
        due_date: '2026-02-19',
        due_status: 'green',
        asset_name: 'CNC Skill C3-01',
      },
      {
        id: 'wo-jh-03',
        work_order_number: 'WO-2026-0053',
        title: 'Air filter replacement',
        status: 'in_progress',
        priority: 'low',
        due_date: '2026-02-25',
        due_status: 'green',
        asset_name: 'Compressor U1-01',
      },
      {
        id: 'wo-jh-04',
        work_order_number: 'WO-2026-0056',
        title: 'Safety guard inspection',
        status: 'open',
        priority: 'high',
        due_date: '2026-02-23',
        due_status: 'yellow',
        asset_name: 'Beam Saw C5-02',
      },
    ],
  },
  {
    user_id: 'usr-tech4',
    name: 'Dana Kim',
    email: 'dkim@sollid.com',
    assigned_wos: 6,
    completed_wos: 5,
    pm_completion_pct: 75,
    on_time_pct: 83.3,
    overdue_wos: 2,
    avg_response_hours: 4.2,
    row_status: rowStatus({ on_time_pct: 83.3, overdue_wos: 2 }),
    recent_wos: [
      {
        id: 'wo-dk-01',
        work_order_number: 'WO-2026-0036',
        title: 'Spray nozzle cleaning',
        status: 'completed',
        priority: 'medium',
        due_date: '2026-02-14',
        due_status: 'green',
        asset_name: 'Auto Spraybooth C1-01',
      },
      {
        id: 'wo-dk-02',
        work_order_number: 'WO-2026-0039',
        title: 'Conveyor belt inspection',
        status: 'open',
        priority: 'medium',
        due_date: '2026-02-10',
        due_status: 'red',
        asset_name: 'Auto Spraybooth C1-01',
      },
      {
        id: 'wo-dk-03',
        work_order_number: 'WO-2026-0043',
        title: 'Exhaust fan motor PM',
        status: 'open',
        priority: 'high',
        due_date: '2026-02-12',
        due_status: 'red',
        asset_name: 'Dust Collector U1-02',
      },
    ],
  },
  {
    user_id: 'usr-tech2',
    name: 'Sara Park',
    email: 'spark@sollid.com',
    assigned_wos: 9,
    completed_wos: 7,
    pm_completion_pct: 80,
    on_time_pct: 77.8,
    overdue_wos: 1,
    avg_response_hours: 3.4,
    row_status: rowStatus({ on_time_pct: 77.8, overdue_wos: 1 }),
    recent_wos: [
      {
        id: 'wo-sp-01',
        work_order_number: 'WO-2026-0033',
        title: 'Dovetailer blade replacement',
        status: 'completed',
        priority: 'high',
        due_date: '2026-02-13',
        due_status: 'green',
        asset_name: 'Dovetailer C6-01',
      },
      {
        id: 'wo-sp-02',
        work_order_number: 'WO-2026-0045',
        title: 'Pneumatic system check',
        status: 'in_progress',
        priority: 'medium',
        due_date: '2026-02-22',
        due_status: 'yellow',
        asset_name: 'CNC Rover C2-02',
      },
      {
        id: 'wo-sp-03',
        work_order_number: 'WO-2026-0037',
        title: 'Spindle bearing lubrication',
        status: 'open',
        priority: 'critical',
        due_date: '2026-02-08',
        due_status: 'red',
        asset_name: 'CNC DrillTeq C4-02',
      },
      {
        id: 'wo-sp-04',
        work_order_number: 'WO-2026-0054',
        title: 'Control panel inspection',
        status: 'open',
        priority: 'low',
        due_date: '2026-02-27',
        due_status: 'green',
        asset_name: 'Edge Bander C1-02',
      },
    ],
  },
  {
    user_id: 'usr-tech3',
    name: 'Mike Torres',
    email: 'mtorres@sollid.com',
    assigned_wos: 8,
    completed_wos: 4,
    pm_completion_pct: 58,
    on_time_pct: 62.5,
    overdue_wos: 3,
    avg_response_hours: 6.8,
    row_status: rowStatus({ on_time_pct: 62.5, overdue_wos: 3 }),
    recent_wos: [
      {
        id: 'wo-mt-01',
        work_order_number: 'WO-2026-0029',
        title: 'Hydraulic fluid change',
        status: 'open',
        priority: 'high',
        due_date: '2026-02-05',
        due_status: 'red',
        asset_name: 'Beam Saw C5-03',
      },
      {
        id: 'wo-mt-02',
        work_order_number: 'WO-2026-0031',
        title: 'Electrical panel PM',
        status: 'open',
        priority: 'critical',
        due_date: '2026-02-07',
        due_status: 'red',
        asset_name: 'CNC Skill C3-02',
      },
      {
        id: 'wo-mt-03',
        work_order_number: 'WO-2026-0035',
        title: 'Dust collection filter PM',
        status: 'on_hold',
        priority: 'medium',
        due_date: '2026-02-11',
        due_status: 'red',
        asset_name: 'Dust Collector U1-01',
      },
      {
        id: 'wo-mt-04',
        work_order_number: 'WO-2026-0048',
        title: 'Chain drive inspection',
        status: 'in_progress',
        priority: 'medium',
        due_date: '2026-02-26',
        due_status: 'green',
        asset_name: 'Edge Bander C1-03',
      },
    ],
  },
]

export const MOCK_TEAM_SUMMARY: TeamSummary = {
  pm_completion_rate: 80,    // yellow — below 90% target
  on_time_wo_rate: 81,       // yellow — below 90% target
  preventive_pct: 35,        // green — above 30% target
  total_open_wos: 9,         // yellow — 4–8 = caution zone
}
