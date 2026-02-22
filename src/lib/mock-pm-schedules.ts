/**
 * Mock PM schedules for assetZ — SOLLiD Cabinetry scenario.
 * Spans all due statuses: overdue, due soon, on schedule, inactive.
 *
 * IDs match pm_schedule_id references in mock-work-orders.ts:
 *   pm-001 → Compressor annual service (linked to wo-004)
 *   pm-002 → Spray booth filter (linked to wo-005)
 *   pm-003 → Skill CNC quarterly PM (linked to wo-003)
 */

import type { PMSchedule } from '@/types'

// Relative to Feb 21 2026 (today)
const D = (iso: string) => iso  // passthrough — dates are already absolute

export const MOCK_PM_SCHEDULES: PMSchedule[] = [
  // 1. OVERDUE — Compressor quarterly oil change (last done 4 months ago)
  {
    id: 'pm-004',
    organization_id: 'org-solid',
    asset_id: 'ast-006',
    title: 'Air Compressor — quarterly oil & separator check',
    description: 'Drain and replace compressor oil. Inspect separator element for saturation. Check condensate drain.',
    instructions: [
      'Lock out / tag out compressor',
      'Drain old oil via drain plug into catch container',
      'Inspect and clean oil fill port',
      'Fill with Kaeser Sigma Fluid S-460 (2.5L)',
      'Inspect separator element — replace if pressure differential > 8 PSI',
      'Check condensate auto-drain — ensure it cycles correctly',
      'Remove LOTO and run compressor 5 minutes — check for leaks',
      'Log oil change in maintenance log',
    ].join('\n'),
    frequency: 'quarterly',
    estimated_hours: 1.5,
    assigned_to_id: 'usr-tech1',
    last_completed_at: D('2025-10-15T10:00:00Z'),
    next_due_at: D('2026-01-15T10:00:00Z'),  // overdue by ~5 weeks
    due_status: 'red',
    is_active: true,
    created_at: D('2024-01-01T00:00:00Z'),
    updated_at: D('2025-10-15T10:00:00Z'),
  },

  // 2. DUE SOON (yellow) — Skill CNC monthly lubrication
  {
    id: 'pm-003',
    organization_id: 'org-solid',
    asset_id: 'ast-003',
    title: 'Skill CNC Router — monthly lubrication & axis check',
    description: 'Lubricate all linear axes, ball screws, and rack & pinion. Check axis home positions.',
    instructions: [
      'Clean all axis ways with lint-free cloth',
      'Apply Mobilgrease XHP 222 to X, Y, Z linear guides (4 pumps each)',
      'Grease ball screws — 2 pumps per screw via zerk fittings',
      'Run axis calibration routine (MDI: G28)',
      'Verify X, Y, Z home positions within ±0.02mm',
      'Check vacuum pump oil level — top up if below minimum',
      'Inspect all air fittings for leaks',
      'Log in machine maintenance book',
    ].join('\n'),
    frequency: 'monthly',
    estimated_hours: 1,
    assigned_to_id: 'usr-tech2',
    last_completed_at: D('2026-01-23T09:00:00Z'),
    next_due_at: D('2026-02-23T09:00:00Z'),  // due in 2 days — yellow
    due_status: 'yellow',
    is_active: true,
    created_at: D('2024-02-01T00:00:00Z'),
    updated_at: D('2026-01-23T09:00:00Z'),
  },

  // 3. GREEN — Compressor annual Kaeser service (due in 4 days)
  {
    id: 'pm-001',
    organization_id: 'org-solid',
    asset_id: 'ast-006',
    title: 'Air Compressor — annual Kaeser service',
    description: 'Full annual service per Kaeser SK 25 service manual: oil, belts, filters, safety valve.',
    instructions: [
      'Lock out / tag out compressor',
      'Drain and replace compressor oil (Sigma Fluid S-460, 2.5L)',
      'Replace air/oil separator element (Kaeser P/N 6.3456.0)',
      'Replace intake air filter (Kaeser P/N 6.1965.0)',
      'Inspect and re-tension drive belt — replace if worn',
      'Test safety relief valve — actuate manually, ensure it reseats',
      'Check all hose connections and fittings for leaks',
      'Inspect motor mounts and vibration isolators',
      'Run compressor 15 min — record pressure, temperature, amps',
      'Update service sticker on unit',
      'Submit service report to manager',
    ].join('\n'),
    frequency: 'annual',
    estimated_hours: 3,
    assigned_to_id: 'usr-tech1',
    last_completed_at: D('2025-02-25T10:00:00Z'),
    next_due_at: D('2026-02-25T10:00:00Z'),  // due in 4 days — green
    due_status: 'green',
    is_active: true,
    created_at: D('2024-01-01T00:00:00Z'),
    updated_at: D('2025-02-25T10:00:00Z'),
  },

  // 4. GREEN — Edge Bander biweekly cleaning
  {
    id: 'pm-005',
    organization_id: 'org-solid',
    asset_id: 'ast-001',
    title: 'Edge Bander — biweekly glue pot & roller cleaning',
    description: 'Clean glue pot and applicator roller. Inspect feed rollers, pressure rollers, and trimming unit.',
    instructions: [
      'Heat glue pot to 180°C and drain old glue into waste container',
      'Clean pot interior with Weiss cleaning granules while hot',
      'Inspect applicator roller for scoring — record wear level',
      'Clean all feed rollers with roller cleaner solution',
      'Check pressure roller pressure (target: 3.5–4.5 bar)',
      'Clean top and bottom trimming units — remove adhesive buildup',
      'Check end trimming saw blade — replace if chips > 3',
      'Inspect banding magazine — remove debris',
      'Run 3 test pieces — check edge adhesion and trim quality',
    ].join('\n'),
    frequency: 'biweekly',
    estimated_hours: 0.75,
    last_completed_at: D('2026-02-09T08:00:00Z'),
    next_due_at: D('2026-02-23T08:00:00Z'),  // due in 2 days — yellow
    due_status: 'yellow',
    is_active: true,
    created_at: D('2024-01-15T00:00:00Z'),
    updated_at: D('2026-02-09T08:00:00Z'),
  },

  // 5. GREEN — Spray Booth monthly filter (recently completed)
  {
    id: 'pm-002',
    organization_id: 'org-solid',
    asset_id: 'ast-007',
    title: 'Auto Spray Booth — monthly intake filter replacement',
    description: 'Replace intake filters and inspect exhaust filters. Check booth pressure differential.',
    instructions: [
      'Lock out spray system — ensure no spray cycle active',
      'Remove and dispose of intake filter panels (4x panels)',
      'Install new G4 intake filter panels',
      'Inspect exhaust filter bank — replace if loading > 75%',
      'Check booth pressure differential (should be -5 to -10 Pa)',
      'Inspect conveyor belt for overspray buildup',
      'Restart system and verify pressures',
    ].join('\n'),
    frequency: 'monthly',
    estimated_hours: 1,
    assigned_to_id: 'usr-tech2',
    last_completed_at: D('2026-02-19T10:00:00Z'),
    next_due_at: D('2026-03-19T10:00:00Z'),  // due in 26 days — green
    due_status: 'green',
    is_active: true,
    created_at: D('2024-04-01T00:00:00Z'),
    updated_at: D('2026-02-19T10:00:00Z'),
  },

  // 6. GREEN — Beam Saw quarterly blade inspection
  {
    id: 'pm-006',
    organization_id: 'org-solid',
    asset_id: 'ast-004',
    title: 'Beam Saw — quarterly blade inspection & alignment',
    description: 'Inspect main blade and scoring blade. Check alignment, scoring height, and fence calibration.',
    instructions: [
      'Lock out / tag out saw',
      'Inspect main blade — count carbide tips, measure tip height',
      'Replace main blade if tip height < 5mm or > 2 chipped tips',
      'Inspect scoring blade — replace if worn',
      'Check main blade run-out with dial indicator (max 0.05mm)',
      'Verify scoring blade alignment to main blade (should be centred)',
      'Check fence calibration — run 3 test cuts, measure with calipers',
      'Inspect pneumatic clamp pressure and function',
      'Clean beam rail and lubricate with Ballistol',
      'Log inspection results — note blade condition and tip count',
    ].join('\n'),
    frequency: 'quarterly',
    estimated_hours: 2,
    last_completed_at: D('2025-11-21T10:00:00Z'),
    next_due_at: D('2026-02-21T10:00:00Z'),  // due today — yellow
    due_status: 'yellow',
    is_active: true,
    created_at: D('2024-03-01T00:00:00Z'),
    updated_at: D('2025-11-21T10:00:00Z'),
  },
]

export function getMockPMSchedule(id: string): PMSchedule | undefined {
  return MOCK_PM_SCHEDULES.find((pm) => pm.id === id)
}

// Fake completion history per PM (last 4 completions before current last_completed_at)
export const MOCK_PM_HISTORY: Record<string, { completed_at: string; tech: string; notes?: string; actual_hours: number }[]> = {
  'pm-001': [
    { completed_at: '2025-02-25T10:00:00Z', tech: 'Jake Hayes',  actual_hours: 3.5, notes: 'Replaced separator element and belt. All within spec.' },
    { completed_at: '2024-02-22T10:00:00Z', tech: 'Jake Hayes',  actual_hours: 3.0 },
    { completed_at: '2023-02-18T10:00:00Z', tech: 'Sara Park',   actual_hours: 4.0, notes: 'Replaced drive belt — worn to wear indicator.' },
  ],
  'pm-004': [
    { completed_at: '2025-10-15T10:00:00Z', tech: 'Jake Hayes',  actual_hours: 1.5 },
    { completed_at: '2025-07-12T10:00:00Z', tech: 'Jake Hayes',  actual_hours: 1.5 },
    { completed_at: '2025-04-08T10:00:00Z', tech: 'Sara Park',   actual_hours: 2.0, notes: 'Separator element replaced — pressure differential was 10 PSI.' },
    { completed_at: '2025-01-10T10:00:00Z', tech: 'Jake Hayes',  actual_hours: 1.5 },
  ],
  'pm-003': [
    { completed_at: '2026-01-23T09:00:00Z', tech: 'Sara Park', actual_hours: 1.0 },
    { completed_at: '2025-12-20T09:00:00Z', tech: 'Sara Park', actual_hours: 1.0 },
    { completed_at: '2025-11-18T09:00:00Z', tech: 'Sara Park', actual_hours: 1.25, notes: 'Z-axis was slightly out of home — adjusted.' },
    { completed_at: '2025-10-21T09:00:00Z', tech: 'Jake Hayes', actual_hours: 1.0 },
  ],
  'pm-002': [
    { completed_at: '2026-02-19T10:00:00Z', tech: 'Sara Park',  actual_hours: 0.75 },
    { completed_at: '2026-01-20T10:00:00Z', tech: 'Sara Park',  actual_hours: 1.0, notes: 'Replaced exhaust filter bank — was at 80% load.' },
    { completed_at: '2025-12-18T10:00:00Z', tech: 'Jake Hayes', actual_hours: 0.75 },
    { completed_at: '2025-11-19T10:00:00Z', tech: 'Sara Park',  actual_hours: 1.0 },
  ],
}
