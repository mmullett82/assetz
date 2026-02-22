/**
 * Mock work orders for assetZ development — SOLLiD Cabinetry scenario.
 * Covers all statuses and priority levels.
 */

import type { WorkOrder, WorkOrderComment } from '@/types'

// Relative to Feb 21 2026 (today in this project)
const T = (offset: string) => {
  const d = new Date('2026-02-21T10:00:00Z')
  const [sign, n, unit] = offset.match(/([+-])(\d+)([dhm])/)?.slice(1) ?? ['+', '0', 'd']
  const ms = parseInt(n) * (unit === 'd' ? 86400000 : unit === 'h' ? 3600000 : 60000)
  d.setTime(d.getTime() + (sign === '+' ? ms : -ms))
  return d.toISOString()
}

export const MOCK_COMMENTS: Record<string, WorkOrderComment[]> = {
  'wo-002': [
    {
      id: 'cmt-001',
      work_order_id: 'wo-002',
      user_id: 'usr-tech1',
      user: { id: 'usr-tech1', organization_id: 'org-solid', email: 'j.hayes@solid.com', full_name: 'Jake Hayes', role: 'technician', is_active: true, created_at: T('-60d'), updated_at: T('-60d') },
      body: 'Checked the feed rollers — significant wear on the top roller. Ordering replacement.',
      created_at: T('-2h'),
    },
    {
      id: 'cmt-002',
      work_order_id: 'wo-002',
      user_id: 'usr-mgr1',
      user: { id: 'usr-mgr1', organization_id: 'org-solid', email: 'matt@solid.com', full_name: 'Matt M.', role: 'manager', is_active: true, created_at: T('-60d'), updated_at: T('-60d') },
      body: 'Parts ordered from supplier — ETA 2 days. Keep machine running at reduced speed until parts arrive.',
      created_at: T('-1h'),
    },
  ],
  'wo-001': [
    {
      id: 'cmt-003',
      work_order_id: 'wo-001',
      user_id: 'usr-tech2',
      user: { id: 'usr-tech2', organization_id: 'org-solid', email: 's.park@solid.com', full_name: 'Sara Park', role: 'technician', is_active: true, created_at: T('-60d'), updated_at: T('-60d') },
      body: 'Error code E-204 on the CNC controller. Spindle drive fault. Machine is locked out.',
      created_at: T('-4h'),
    },
  ],
}

export const MOCK_WORK_ORDERS: WorkOrder[] = [
  // 1. CRITICAL / open — Rover CNC down (machine is already "down" in asset mock)
  {
    id: 'wo-001',
    organization_id: 'org-solid',
    work_order_number: 'WO-2026-0041',
    asset_id: 'ast-002',
    type: 'corrective',
    status: 'open',
    priority: 'critical',
    due_status: 'red',
    title: 'Rover CNC #1 — spindle drive fault (E-204)',
    description: 'Machine threw E-204 spindle drive fault and locked out mid-job. No panel response. Machine is tagged out.',
    failure_code: 'ELEC',
    requested_by_id: 'usr-tech2',
    assigned_to_id: 'usr-tech1',
    due_date: T('-1d'),
    estimated_hours: 4,
    comments: MOCK_COMMENTS['wo-001'],
    created_at: T('-4h'),
    updated_at: T('-4h'),
  },

  // 2. HIGH / in_progress — Edge Bander feed roller wear
  {
    id: 'wo-002',
    organization_id: 'org-solid',
    work_order_number: 'WO-2026-0040',
    asset_id: 'ast-001',
    type: 'corrective',
    status: 'in_progress',
    priority: 'high',
    due_status: 'yellow',
    title: 'Edge Bander #1 — feed roller wear, reduced performance',
    description: 'Banding quality has degraded — edges lifting on 10% of pieces. Feed rollers show significant wear.',
    failure_code: 'MECH',
    requested_by_id: 'usr-mgr1',
    assigned_to_id: 'usr-tech1',
    due_date: T('+1d'),
    started_at: T('-2h'),
    estimated_hours: 3,
    actual_hours: 2,
    comments: MOCK_COMMENTS['wo-002'],
    created_at: T('-1d'),
    updated_at: T('-1h'),
  },

  // 3. MEDIUM / on_hold — Skill CNC PM waiting on air filter parts
  {
    id: 'wo-003',
    organization_id: 'org-solid',
    work_order_number: 'WO-2026-0039',
    asset_id: 'ast-003',
    type: 'preventive',
    status: 'on_hold',
    priority: 'medium',
    due_status: 'yellow',
    title: 'Skill CNC Router #1 — quarterly PM (air filters, lubrication)',
    description: 'Scheduled quarterly PM. Replace air filters, lubricate all axes, check vacuum pump.',
    requested_by_id: 'usr-mgr1',
    assigned_to_id: 'usr-tech2',
    due_date: T('+2d'),
    started_at: T('-6h'),
    estimated_hours: 2,
    actual_hours: 0.5,
    pm_schedule_id: 'pm-003',
    created_at: T('-3d'),
    updated_at: T('-6h'),
  },

  // 4. HIGH / open — Compressor annual inspection (due in 4 days — green)
  {
    id: 'wo-004',
    organization_id: 'org-solid',
    work_order_number: 'WO-2026-0038',
    asset_id: 'ast-006',
    type: 'inspection',
    status: 'open',
    priority: 'high',
    due_status: 'green',
    title: 'Air Compressor #1 — annual inspection & oil change',
    description: 'Annual Kaeser service: drain and replace compressor oil, check separator element, inspect belts, test safety relief valve.',
    requested_by_id: 'usr-mgr1',
    due_date: T('+4d'),
    estimated_hours: 3,
    pm_schedule_id: 'pm-001',
    created_at: T('-7d'),
    updated_at: T('-7d'),
  },

  // 5. LOW / completed — Spray booth filter change
  {
    id: 'wo-005',
    organization_id: 'org-solid',
    work_order_number: 'WO-2026-0037',
    asset_id: 'ast-007',
    type: 'preventive',
    status: 'completed',
    priority: 'low',
    due_status: 'green',
    title: 'Auto Spray Booth #1 — intake filter replacement',
    description: 'Monthly intake filter swap.',
    requested_by_id: 'usr-mgr1',
    assigned_to_id: 'usr-tech2',
    due_date: T('-2d'),
    started_at: T('-3d'),
    completed_at: T('-2d'),
    estimated_hours: 1,
    actual_hours: 0.75,
    pm_schedule_id: 'pm-002',
    created_at: T('-7d'),
    updated_at: T('-2d'),
  },

  // 6. MEDIUM / open — Beam Saw blade change
  {
    id: 'wo-006',
    organization_id: 'org-solid',
    work_order_number: 'WO-2026-0036',
    asset_id: 'ast-004',
    type: 'corrective',
    status: 'open',
    priority: 'medium',
    due_status: 'green',
    title: 'Beam Saw #1 — blade replacement (250k cut cycles)',
    description: 'Blade has reached rated cut-cycle life. Edge quality starting to decline on melamine panels.',
    requested_by_id: 'usr-tech1',
    due_date: T('+5d'),
    estimated_hours: 1.5,
    created_at: T('-2d'),
    updated_at: T('-2d'),
  },

  // 7. CRITICAL / completed — emergency corrective last week (late)
  {
    id: 'wo-007',
    organization_id: 'org-solid',
    work_order_number: 'WO-2026-0035',
    asset_id: 'ast-006',
    type: 'corrective',
    status: 'completed',
    priority: 'critical',
    due_status: 'red',
    title: 'Air Compressor #1 — emergency: pressure drop, belt slipping',
    description: 'Plant pressure dropped to 65 PSI (normal: 110). Belt on main drive visibly slipping. Replaced belt and tensioner.',
    failure_code: 'MECH',
    cause_code: 'WEAR',
    remedy: 'Replaced drive belt (P/N KSR-BELT-SK25) and tensioner. Plant pressure restored to 115 PSI.',
    requested_by_id: 'usr-mgr1',
    assigned_to_id: 'usr-tech1',
    due_date: T('-8d'),
    started_at: T('-10d'),
    completed_at: T('-8d'),
    estimated_hours: 2,
    actual_hours: 2.5,
    created_at: T('-10d'),
    updated_at: T('-8d'),
  },
]

export function getMockWorkOrder(id: string): WorkOrder | undefined {
  return MOCK_WORK_ORDERS.find((wo) => wo.id === id)
}
