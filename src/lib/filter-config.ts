import type { FilterAttribute, SavedFilter } from '@/types'
import { MOCK_DEPARTMENTS } from './mock-data'
import { MOCK_PARTS } from './mock-parts'
import { MOCK_USERS } from './mock-settings'

// ─── Assets ───────────────────────────────────────────────────────────────────

export const ASSET_FILTER_ATTRIBUTES: FilterAttribute[] = [
  {
    key: 'status', label: 'Status', operator: 'eq',
    options: [
      { value: 'operational',    label: 'Operational'    },
      { value: 'maintenance',    label: 'Maintenance'    },
      { value: 'down',           label: 'Down'           },
      { value: 'decommissioned', label: 'Decommissioned' },
    ],
  },
  {
    key: 'department_id', label: 'Department', operator: 'eq',
    options: MOCK_DEPARTMENTS.map((d) => ({ value: d.id, label: d.name })),
  },
  {
    key: 'current_condition', label: 'Condition', operator: 'eq',
    options: [
      { value: 'excellent', label: 'Excellent' },
      { value: 'good',      label: 'Good'      },
      { value: 'fair',      label: 'Fair'       },
      { value: 'poor',      label: 'Poor'       },
      { value: 'critical',  label: 'Critical'   },
    ],
  },
  {
    key: 'system_type', label: 'System Type', operator: 'eq',
    options: [
      { value: 'EDGE',  label: 'Edge Banding' },
      { value: 'CNC',   label: 'CNC Machinery' },
      { value: 'JOIN',  label: 'Joinery'       },
      { value: 'AIR',   label: 'Air / Utilities' },
      { value: 'SPRAY', label: 'Finishing / Spray' },
    ],
  },
  {
    key: 'dependency_code', label: 'Dependency Type', operator: 'eq',
    options: [
      { value: 'L', label: 'Production Line (L)' },
      { value: 'C', label: 'Independent Cell (C)' },
      { value: 'U', label: 'Utility (U)'          },
    ],
  },
  {
    key: 'assigned_to_id', label: 'Assigned To', operator: 'eq',
    options: MOCK_USERS.filter((u) => u.is_active).map((u) => ({ value: u.id, label: u.full_name })),
  },
]

export const ASSET_SAVED_FILTERS: SavedFilter[] = [
  {
    id: 'critical-assets',
    label: 'Critical Assets',
    filters: [{ key: 'current_condition', label: 'Condition', value: 'critical', displayValue: 'Critical' }],
  },
  {
    id: 'down-equipment',
    label: 'Down Equipment',
    filters: [{ key: 'status', label: 'Status', value: 'down', displayValue: 'Down' }],
  },
]

// ─── Work Orders ──────────────────────────────────────────────────────────────

export const WO_FILTER_ATTRIBUTES: FilterAttribute[] = [
  {
    key: 'status', label: 'Status', operator: 'eq',
    options: [
      { value: 'open',        label: 'Open'        },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'on_hold',     label: 'On Hold'     },
      { value: 'completed',   label: 'Completed'   },
      { value: 'cancelled',   label: 'Cancelled'   },
    ],
  },
  {
    key: 'priority', label: 'Priority', operator: 'eq',
    options: [
      { value: 'critical', label: 'Critical' },
      { value: 'high',     label: 'High'     },
      { value: 'medium',   label: 'Medium'   },
      { value: 'low',      label: 'Low'      },
    ],
  },
  {
    key: 'type', label: 'Type', operator: 'eq',
    options: [
      { value: 'corrective',  label: 'Corrective'  },
      { value: 'preventive',  label: 'Preventive'  },
      { value: 'inspection',  label: 'Inspection'  },
      { value: 'project',     label: 'Project'     },
      { value: 'safety',      label: 'Safety'      },
      { value: 'breakdown',   label: 'Breakdown'   },
    ],
  },
  {
    key: 'assigned_to_id', label: 'Assigned To', operator: 'eq',
    options: MOCK_USERS.filter((u) => u.is_active).map((u) => ({ value: u.id, label: u.full_name })),
  },
  {
    key: 'origin_type', label: 'Origin', operator: 'eq',
    options: [
      { value: 'manual',       label: 'Manual'         },
      { value: 'pm_generated', label: 'PM Generated'   },
      { value: 'request',      label: 'Request'        },
    ],
  },
  { key: 'overdue',   label: 'Overdue',   operator: 'boolean' },
  { key: 'due_date',  label: 'Due Date',  operator: 'date_range' },
]

export const WO_SAVED_FILTERS: SavedFilter[] = [
  {
    id: 'my-open',
    label: 'My Open WOs',
    filters: [{ key: 'status', label: 'Status', value: 'open', displayValue: 'Open' }],
  },
  {
    id: 'overdue',
    label: 'Overdue',
    filters: [{ key: 'overdue', label: 'Overdue', value: 'true', displayValue: 'Yes' }],
  },
  {
    id: 'emergency',
    label: 'Emergency',
    filters: [{ key: 'priority', label: 'Priority', value: 'critical', displayValue: 'Critical' }],
  },
]

// ─── PM Schedules ─────────────────────────────────────────────────────────────

export const PM_FILTER_ATTRIBUTES: FilterAttribute[] = [
  {
    key: 'frequency', label: 'Frequency', operator: 'eq',
    options: [
      { value: 'daily',      label: 'Daily'        },
      { value: 'weekly',     label: 'Weekly'       },
      { value: 'biweekly',   label: 'Bi-weekly'    },
      { value: 'monthly',    label: 'Monthly'      },
      { value: 'quarterly',  label: 'Quarterly'    },
      { value: 'semiannual', label: 'Semi-annual'  },
      { value: 'annual',     label: 'Annual'       },
      { value: 'meter_based',label: 'Meter-based'  },
    ],
  },
  {
    key: 'assigned_to_id', label: 'Assigned To', operator: 'eq',
    options: MOCK_USERS.filter((u) => u.is_active).map((u) => ({ value: u.id, label: u.full_name })),
  },
  {
    key: 'pm_type', label: 'PM Type', operator: 'eq',
    options: [
      { value: 'time_based',          label: 'Time-based'          },
      { value: 'meter_based',         label: 'Meter-based'         },
      { value: 'time_meter_override', label: 'Time + Meter Override' },
    ],
  },
  { key: 'is_active', label: 'Active Only', operator: 'boolean' },
]

// ─── Parts ────────────────────────────────────────────────────────────────────

const PART_MANUFACTURERS = [
  ...new Set(MOCK_PARTS.map((p) => p.manufacturer).filter(Boolean)),
] as string[]

const PART_LOCATIONS = [
  ...new Set(MOCK_PARTS.map((p) => p.location).filter(Boolean)),
] as string[]

export const PART_FILTER_ATTRIBUTES: FilterAttribute[] = [
  {
    key: 'status', label: 'Stock Status', operator: 'eq',
    options: [
      { value: 'in_stock',     label: 'In Stock'     },
      { value: 'low_stock',    label: 'Low Stock'    },
      { value: 'out_of_stock', label: 'Out of Stock' },
      { value: 'on_order',     label: 'On Order'     },
    ],
  },
  {
    key: 'manufacturer', label: 'Manufacturer', operator: 'eq',
    options: PART_MANUFACTURERS.map((m) => ({ value: m, label: m })),
  },
  {
    key: 'location', label: 'Location', operator: 'eq',
    options: PART_LOCATIONS.map((l) => ({ value: l, label: l })),
  },
]

export const PART_SAVED_FILTERS: SavedFilter[] = [
  {
    id: 'low-stock',
    label: 'Low Stock',
    filters: [{ key: 'status', label: 'Stock Status', value: 'low_stock', displayValue: 'Low Stock' }],
  },
  {
    id: 'out-of-stock',
    label: 'Out of Stock',
    filters: [{ key: 'status', label: 'Stock Status', value: 'out_of_stock', displayValue: 'Out of Stock' }],
  },
]
