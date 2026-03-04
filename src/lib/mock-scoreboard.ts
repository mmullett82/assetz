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

// ─── Placeholder data — will be replaced as real WO/PM data is imported ────────
// Each technician starts with zeroed-out stats. The scoreboard will compute
// real numbers from actual work order data once it's in the system.

export const MOCK_TECH_SCORES: TechnicianScore[] = [
  {
    user_id: 'usr-tech1',
    name: 'Eon Jones',
    email: 'eon@solidcabinetry.com',
    assigned_wos: 0,
    completed_wos: 0,
    pm_completion_pct: 0,
    on_time_pct: 0,
    overdue_wos: 0,
    avg_response_hours: 0,
    row_status: 'green',
    recent_wos: [],
  },
  {
    user_id: 'usr-tech2',
    name: 'Gary Clack',
    email: 'gary@solidcabinetry.com',
    assigned_wos: 0,
    completed_wos: 0,
    pm_completion_pct: 0,
    on_time_pct: 0,
    overdue_wos: 0,
    avg_response_hours: 0,
    row_status: 'green',
    recent_wos: [],
  },
  {
    user_id: 'usr-tech3',
    name: 'Frank Zapata',
    email: 'frank@solidcabinetry.com',
    assigned_wos: 0,
    completed_wos: 0,
    pm_completion_pct: 0,
    on_time_pct: 0,
    overdue_wos: 0,
    avg_response_hours: 0,
    row_status: 'green',
    recent_wos: [],
  },
  {
    user_id: 'usr-tech4',
    name: 'Dominic Arbizu',
    email: 'dominic@solidcabinetry.com',
    assigned_wos: 0,
    completed_wos: 0,
    pm_completion_pct: 0,
    on_time_pct: 0,
    overdue_wos: 0,
    avg_response_hours: 0,
    row_status: 'green',
    recent_wos: [],
  },
  {
    user_id: 'usr-tech5',
    name: 'Raul Gonzalez',
    email: 'raul@solidcabinetry.com',
    assigned_wos: 0,
    completed_wos: 0,
    pm_completion_pct: 0,
    on_time_pct: 0,
    overdue_wos: 0,
    avg_response_hours: 0,
    row_status: 'green',
    recent_wos: [],
  },
  {
    user_id: 'usr-tech6',
    name: 'Mike Grimaldi',
    email: 'mike.g@solidcabinetry.com',
    assigned_wos: 0,
    completed_wos: 0,
    pm_completion_pct: 0,
    on_time_pct: 0,
    overdue_wos: 0,
    avg_response_hours: 0,
    row_status: 'green',
    recent_wos: [],
  },
]

export const MOCK_TEAM_SUMMARY: TeamSummary = {
  pm_completion_rate: 0,
  on_time_wo_rate: 0,
  preventive_pct: 0,
  total_open_wos: 0,
}
