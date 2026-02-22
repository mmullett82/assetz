// Mock data for Settings & Configuration (Phase 1, Step 8)
// All interfaces are local to settings — not added to types/index.ts

import type { UserRole } from '@/types'

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ConfigItem {
  key: string                              // snake_case, immutable after creation
  label: string
  sort_order: number
  is_default: boolean                      // only one per list
  is_active: boolean
  color?: string                           // hex e.g. '#ef4444'
  extra?: Record<string, string | number>  // e.g. { due_offset_days: 3 }
}

export interface ExtraColumnDef {
  key: string
  label: string
  type: 'text' | 'number'
}

export interface MockCompany {
  name: string
  code: string
  address: string
  city: string
  province: string
  postal_code: string
  timezone: string
  industry: string
}

export interface MockBuilding {
  id: string
  name: string
  code: string
  address?: string
}

export interface MockDepartment {
  id: string
  building_id: string
  name: string
  code: string
}

export interface MockFacility {
  id: string
  name: string
  buildings: MockBuilding[]
  departments: MockDepartment[]
}

export interface MockUser {
  id: string
  full_name: string
  email: string
  role: UserRole
  is_active: boolean
  phone?: string
}

export interface MockCrew {
  id: string
  name: string
  lead_user_id?: string
  member_ids: string[]
}

export interface MockIDSchema {
  company_name: string
  company_prefix: string
  asset_prefix: string
  example_facility_id: string
  example_barcode: string
}

export interface MockPMDefaults {
  skip_if_open: boolean
  lead_time_days: number
  auto_assign_id: string
}

export interface MockPartsDefaults {
  default_reorder_point: number
  default_reorder_quantity: number
  default_unit_of_measure: string
}

// ─── Asset Config Lists ───────────────────────────────────────────────────────

export const MOCK_ASSET_STATUSES: ConfigItem[] = [
  { key: 'operational', label: 'Operational', sort_order: 1, is_default: true,  is_active: true,  color: '#22c55e' },
  { key: 'down',        label: 'Down',        sort_order: 2, is_default: false, is_active: true,  color: '#ef4444' },
  { key: 'maintenance', label: 'Maintenance', sort_order: 3, is_default: false, is_active: true,  color: '#f59e0b' },
  { key: 'decommissioned', label: 'Decommissioned', sort_order: 4, is_default: false, is_active: true, color: '#94a3b8' },
]

export const MOCK_ASSET_CONDITIONS: ConfigItem[] = [
  { key: 'excellent', label: 'Excellent', sort_order: 1, is_default: false, is_active: true },
  { key: 'good',      label: 'Good',      sort_order: 2, is_default: true,  is_active: true },
  { key: 'fair',      label: 'Fair',      sort_order: 3, is_default: false, is_active: true },
  { key: 'poor',      label: 'Poor',      sort_order: 4, is_default: false, is_active: true },
  { key: 'critical',  label: 'Critical',  sort_order: 5, is_default: false, is_active: true },
]

export const MOCK_ASSET_CRITICALITY: ConfigItem[] = [
  { key: 'critical',     label: 'Critical',     sort_order: 1, is_default: false, is_active: true, color: '#dc2626' },
  { key: 'high',         label: 'High',         sort_order: 2, is_default: false, is_active: true, color: '#ea580c' },
  { key: 'medium',       label: 'Medium',       sort_order: 3, is_default: true,  is_active: true, color: '#ca8a04' },
  { key: 'low',          label: 'Low',          sort_order: 4, is_default: false, is_active: true, color: '#16a34a' },
  { key: 'non_critical', label: 'Non-Critical', sort_order: 5, is_default: false, is_active: true, color: '#64748b' },
]

export const MOCK_ASSET_CATEGORIES: ConfigItem[] = [
  { key: 'cnc_machinery',      label: 'CNC Machinery',      sort_order: 1, is_default: false, is_active: true  },
  { key: 'edge_banding',       label: 'Edge Banding',       sort_order: 2, is_default: false, is_active: true  },
  { key: 'finishing',          label: 'Finishing',          sort_order: 3, is_default: false, is_active: true  },
  { key: 'joinery',            label: 'Joinery',            sort_order: 4, is_default: false, is_active: true  },
  { key: 'material_handling',  label: 'Material Handling',  sort_order: 5, is_default: true,  is_active: true  },
  { key: 'utilities',          label: 'Utilities',          sort_order: 6, is_default: false, is_active: true  },
  { key: 'dust_collection',    label: 'Dust Collection',    sort_order: 7, is_default: false, is_active: false },
]

export const MOCK_ASSET_SYSTEM_TYPES: ConfigItem[] = [
  { key: 'EDGE', label: 'EDGE — Edge Banding',   sort_order: 1, is_default: false, is_active: true },
  { key: 'CNC',  label: 'CNC — CNC Machining',   sort_order: 2, is_default: true,  is_active: true },
  { key: 'SPRAY',label: 'SPRAY — Spray Finishing',sort_order: 3, is_default: false, is_active: true },
  { key: 'AIR',  label: 'AIR — Compressed Air',  sort_order: 4, is_default: false, is_active: true },
  { key: 'JOIN', label: 'JOIN — Joinery',         sort_order: 5, is_default: false, is_active: true },
  { key: 'DUST', label: 'DUST — Dust Collection', sort_order: 6, is_default: false, is_active: true },
]

export const MOCK_ASSET_METER_TYPES: ConfigItem[] = [
  { key: 'hours',  label: 'Hours',       sort_order: 1, is_default: true,  is_active: true },
  { key: 'cycles', label: 'Cycles',      sort_order: 2, is_default: false, is_active: true },
  { key: 'parts',  label: 'Parts Count', sort_order: 3, is_default: false, is_active: true },
  { key: 'km',     label: 'Kilometers',  sort_order: 4, is_default: false, is_active: true },
]

// ─── Work Order Config Lists ──────────────────────────────────────────────────

export const MOCK_WO_STATUSES: ConfigItem[] = [
  { key: 'open',        label: 'Open',        sort_order: 1, is_default: true,  is_active: true, color: '#3b82f6' },
  { key: 'in_progress', label: 'In Progress', sort_order: 2, is_default: false, is_active: true, color: '#f59e0b' },
  { key: 'on_hold',     label: 'On Hold',     sort_order: 3, is_default: false, is_active: true, color: '#8b5cf6' },
  { key: 'completed',   label: 'Completed',   sort_order: 4, is_default: false, is_active: true, color: '#22c55e' },
  { key: 'cancelled',   label: 'Cancelled',   sort_order: 5, is_default: false, is_active: true, color: '#94a3b8' },
]

export const MOCK_WO_PRIORITIES: ConfigItem[] = [
  { key: 'critical', label: 'Critical', sort_order: 1, is_default: false, is_active: true, color: '#dc2626', extra: { due_offset_days: 1  } },
  { key: 'high',     label: 'High',     sort_order: 2, is_default: false, is_active: true, color: '#ea580c', extra: { due_offset_days: 3  } },
  { key: 'medium',   label: 'Medium',   sort_order: 3, is_default: true,  is_active: true, color: '#ca8a04', extra: { due_offset_days: 7  } },
  { key: 'low',      label: 'Low',      sort_order: 4, is_default: false, is_active: true, color: '#16a34a', extra: { due_offset_days: 14 } },
]

export const MOCK_WO_TYPES: ConfigItem[] = [
  { key: 'corrective',  label: 'Corrective',  sort_order: 1, is_default: true,  is_active: true },
  { key: 'preventive',  label: 'Preventive',  sort_order: 2, is_default: false, is_active: true },
  { key: 'inspection',  label: 'Inspection',  sort_order: 3, is_default: false, is_active: true },
  { key: 'project',     label: 'Project',     sort_order: 4, is_default: false, is_active: true },
  { key: 'safety',      label: 'Safety',      sort_order: 5, is_default: false, is_active: true },
]

export const MOCK_WO_PROBLEM_CODES: ConfigItem[] = [
  { key: 'mechanical_failure', label: 'Mechanical Failure',   sort_order: 1, is_default: false, is_active: true },
  { key: 'electrical_failure', label: 'Electrical Failure',   sort_order: 2, is_default: false, is_active: true },
  { key: 'worn_component',     label: 'Worn Component',       sort_order: 3, is_default: true,  is_active: true },
  { key: 'alignment_issue',    label: 'Alignment Issue',      sort_order: 4, is_default: false, is_active: true },
  { key: 'lubrication',        label: 'Lubrication Issue',    sort_order: 5, is_default: false, is_active: true },
  { key: 'contamination',      label: 'Contamination',        sort_order: 6, is_default: false, is_active: true },
  { key: 'operator_error',     label: 'Operator Error',       sort_order: 7, is_default: false, is_active: true },
]

export const MOCK_WO_CAUSE_CODES: ConfigItem[] = [
  { key: 'normal_wear',    label: 'Normal Wear',      sort_order: 1, is_default: true,  is_active: true  },
  { key: 'improper_use',   label: 'Improper Use',     sort_order: 2, is_default: false, is_active: true  },
  { key: 'lack_of_pm',     label: 'Lack of PM',       sort_order: 3, is_default: false, is_active: true  },
  { key: 'material_defect',label: 'Material Defect',  sort_order: 4, is_default: false, is_active: true  },
  { key: 'environmental',  label: 'Environmental',    sort_order: 5, is_default: false, is_active: true  },
  { key: 'unknown',        label: 'Unknown',          sort_order: 6, is_default: false, is_active: false },
]

export const MOCK_WO_CATEGORIES: ConfigItem[] = [
  { key: 'production',   label: 'Production',   sort_order: 1, is_default: true,  is_active: true },
  { key: 'facility',     label: 'Facility',     sort_order: 2, is_default: false, is_active: true },
  { key: 'safety',       label: 'Safety',       sort_order: 3, is_default: false, is_active: true },
  { key: 'improvement',  label: 'Improvement',  sort_order: 4, is_default: false, is_active: true },
]

// ─── PM Config Lists ──────────────────────────────────────────────────────────

export const MOCK_PM_FREQUENCIES: ConfigItem[] = [
  { key: 'daily',       label: 'Daily',            sort_order: 1, is_default: false, is_active: true },
  { key: 'weekly',      label: 'Weekly',           sort_order: 2, is_default: false, is_active: true },
  { key: 'biweekly',    label: 'Bi-Weekly',        sort_order: 3, is_default: false, is_active: true },
  { key: 'monthly',     label: 'Monthly',          sort_order: 4, is_default: true,  is_active: true },
  { key: 'quarterly',   label: 'Quarterly',        sort_order: 5, is_default: false, is_active: true },
  { key: 'semiannual',  label: 'Semi-Annual',      sort_order: 6, is_default: false, is_active: true },
  { key: 'annual',      label: 'Annual',           sort_order: 7, is_default: false, is_active: true },
  { key: 'meter_based', label: 'Meter-Based',      sort_order: 8, is_default: false, is_active: true },
]

// ─── Parts Config Lists ───────────────────────────────────────────────────────

export const MOCK_PARTS_CATEGORIES: ConfigItem[] = [
  { key: 'bearings',      label: 'Bearings',       sort_order: 1, is_default: false, is_active: true },
  { key: 'belts_chains',  label: 'Belts & Chains', sort_order: 2, is_default: false, is_active: true },
  { key: 'blades_cutters',label: 'Blades & Cutters',sort_order: 3, is_default: false, is_active: true },
  { key: 'electrical',    label: 'Electrical',     sort_order: 4, is_default: false, is_active: true },
  { key: 'filters',       label: 'Filters',        sort_order: 5, is_default: true,  is_active: true },
  { key: 'lubricants',    label: 'Lubricants',     sort_order: 6, is_default: false, is_active: true },
  { key: 'fasteners',     label: 'Fasteners',      sort_order: 7, is_default: false, is_active: true },
]

export const MOCK_PARTS_UNITS: ConfigItem[] = [
  { key: 'ea',  label: 'Each (ea)',   sort_order: 1, is_default: true,  is_active: true },
  { key: 'ft',  label: 'Feet (ft)',   sort_order: 2, is_default: false, is_active: true },
  { key: 'in',  label: 'Inches (in)', sort_order: 3, is_default: false, is_active: true },
  { key: 'gal', label: 'Gallon (gal)',sort_order: 4, is_default: false, is_active: true },
  { key: 'L',   label: 'Litre (L)',   sort_order: 5, is_default: false, is_active: true },
  { key: 'kg',  label: 'Kilogram (kg)',sort_order: 6, is_default: false, is_active: true },
  { key: 'set', label: 'Set',         sort_order: 7, is_default: false, is_active: true },
]

export const MOCK_USER_SHIFTS: ConfigItem[] = [
  { key: 'day',     label: 'Day Shift',     sort_order: 1, is_default: true,  is_active: true },
  { key: 'evening', label: 'Evening Shift', sort_order: 2, is_default: false, is_active: true },
  { key: 'night',   label: 'Night Shift',   sort_order: 3, is_default: false, is_active: true },
]

// ─── Company & Facility ───────────────────────────────────────────────────────

export const MOCK_COMPANY: MockCompany = {
  name: 'SOLLiD Cabinetry',
  code: 'SC',
  address: '20678 84th Ave',
  city: 'Langley',
  province: 'BC',
  postal_code: 'V2Y 0R7',
  timezone: 'America/Vancouver',
  industry: 'Cabinet Manufacturing',
}

export const MOCK_FACILITY_SETTINGS: MockFacility = {
  id: 'fac-1',
  name: 'Langley Plant',
  buildings: [
    { id: 'bldg-1', name: 'Main Building', code: 'B1', address: '20678 84th Ave, Langley BC' },
    { id: 'bldg-2', name: 'Warehouse',     code: 'W1' },
  ],
  departments: [
    { id: 'dept-1', building_id: 'bldg-1', name: 'Millroom',   code: 'MIL' },
    { id: 'dept-2', building_id: 'bldg-1', name: 'Finishing',  code: 'FIN' },
    { id: 'dept-3', building_id: 'bldg-1', name: 'Joinery',    code: 'JOI' },
    { id: 'dept-4', building_id: 'bldg-1', name: 'Facilities', code: 'FAC' },
    { id: 'dept-5', building_id: 'bldg-2', name: 'Receiving',  code: 'RCV' },
  ],
}

// ─── PM Defaults ─────────────────────────────────────────────────────────────

export const MOCK_PM_DEFAULTS: MockPMDefaults = {
  skip_if_open: true,
  lead_time_days: 3,
  auto_assign_id: '',
}

// ─── Parts Defaults ───────────────────────────────────────────────────────────

export const MOCK_PARTS_DEFAULTS: MockPartsDefaults = {
  default_reorder_point: 2,
  default_reorder_quantity: 6,
  default_unit_of_measure: 'ea',
}

// ─── Users ────────────────────────────────────────────────────────────────────

export const MOCK_USERS: MockUser[] = [
  { id: 'usr-admin',  full_name: 'Matt Mullett',   email: 'matt@solidcabinetry.com',   role: 'admin',      is_active: true,  phone: '604-555-0101' },
  { id: 'usr-mgr1',   full_name: 'Dan Cooper',     email: 'dan@solidcabinetry.com',    role: 'manager',    is_active: true,  phone: '604-555-0102' },
  { id: 'usr-tech1',  full_name: 'Jake Morrison',  email: 'jake@solidcabinetry.com',   role: 'technician', is_active: true,  phone: '604-555-0103' },
  { id: 'usr-tech2',  full_name: 'Sara Chen',      email: 'sara@solidcabinetry.com',   role: 'technician', is_active: true,  phone: '604-555-0104' },
  { id: 'usr-tech3',  full_name: 'Mike Okafor',    email: 'mike@solidcabinetry.com',   role: 'technician', is_active: true,  phone: '604-555-0105' },
  { id: 'usr-tech4',  full_name: 'Priya Nair',     email: 'priya@solidcabinetry.com',  role: 'technician', is_active: true                         },
  { id: 'usr-tech5',  full_name: 'Tom Larsen',     email: 'tom@solidcabinetry.com',    role: 'technician', is_active: true                         },
  { id: 'usr-req1',   full_name: 'Lisa Park',      email: 'lisa@solidcabinetry.com',   role: 'requester',  is_active: false                        },
]

// ─── Crews ────────────────────────────────────────────────────────────────────

export const MOCK_CREWS: MockCrew[] = [
  {
    id: 'crew-1',
    name: 'Day Shift A',
    lead_user_id: 'usr-tech1',
    member_ids: ['usr-tech1', 'usr-tech2', 'usr-tech3'],
  },
  {
    id: 'crew-2',
    name: 'Day Shift B',
    lead_user_id: 'usr-tech4',
    member_ids: ['usr-tech4', 'usr-tech5'],
  },
  {
    id: 'crew-3',
    name: 'Management',
    lead_user_id: 'usr-mgr1',
    member_ids: ['usr-admin', 'usr-mgr1'],
  },
]

// ─── ID Schema ────────────────────────────────────────────────────────────────

export const MOCK_ID_SCHEMA: MockIDSchema = {
  company_name: 'SOLLiD Cabinetry',
  company_prefix: 'SC',
  asset_prefix: 'SLD',
  example_facility_id: 'SC-B1-MIL-CNC-ROVER-C2-01',
  example_barcode: 'SLD-ROV-0001',
}
