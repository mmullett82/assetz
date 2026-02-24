import type { ImportEntityType } from '@/types'

export interface AssetZField {
  field: string
  label: string
  required: boolean
  type: 'string' | 'number' | 'date' | 'enum'
}

export const ENTITY_FIELDS: Record<ImportEntityType, AssetZField[]> = {
  assets: [
    { field: 'name',              label: 'Asset Name',        required: true,  type: 'string' },
    { field: 'facility_asset_id', label: 'Facility Asset ID', required: false, type: 'string' },
    { field: 'serial_number',     label: 'Serial Number',     required: false, type: 'string' },
    { field: 'model',             label: 'Model',             required: false, type: 'string' },
    { field: 'manufacturer',      label: 'Manufacturer',      required: false, type: 'string' },
    { field: 'department',        label: 'Department',        required: false, type: 'string' },
    { field: 'location',          label: 'Location',          required: false, type: 'string' },
    { field: 'status',            label: 'Status',            required: false, type: 'enum'   },
    { field: 'install_date',      label: 'Install Date',      required: false, type: 'date'   },
    { field: 'purchase_cost',     label: 'Purchase Cost',     required: false, type: 'number' },
    { field: 'notes',             label: 'Notes',             required: false, type: 'string' },
  ],
  work_orders: [
    { field: 'title',             label: 'Title',             required: true,  type: 'string' },
    { field: 'description',       label: 'Description',       required: false, type: 'string' },
    { field: 'status',            label: 'Status',            required: false, type: 'enum'   },
    { field: 'priority',          label: 'Priority',          required: false, type: 'enum'   },
    { field: 'type',              label: 'WO Type',           required: false, type: 'enum'   },
    { field: 'asset_id',          label: 'Asset',             required: false, type: 'string' },
    { field: 'assigned_to',       label: 'Assigned To',       required: false, type: 'string' },
    { field: 'due_date',          label: 'Due Date',          required: false, type: 'date'   },
    { field: 'completed_at',      label: 'Completed At',      required: false, type: 'date'   },
    { field: 'notes',             label: 'Notes',             required: false, type: 'string' },
  ],
  pm_schedules: [
    { field: 'title',             label: 'Title',             required: true,  type: 'string' },
    { field: 'description',       label: 'Description',       required: false, type: 'string' },
    { field: 'frequency',         label: 'Frequency',         required: true,  type: 'enum'   },
    { field: 'asset_id',          label: 'Asset',             required: false, type: 'string' },
    { field: 'assigned_to',       label: 'Assigned To',       required: false, type: 'string' },
    { field: 'next_due_at',       label: 'Next Due Date',     required: false, type: 'date'   },
    { field: 'estimated_hours',   label: 'Estimated Hours',   required: false, type: 'number' },
    { field: 'instructions',      label: 'Instructions',      required: false, type: 'string' },
  ],
  parts: [
    { field: 'name',              label: 'Part Name',         required: true,  type: 'string' },
    { field: 'part_number',       label: 'Part Number',       required: true,  type: 'string' },
    { field: 'description',       label: 'Description',       required: false, type: 'string' },
    { field: 'manufacturer',      label: 'Manufacturer',      required: false, type: 'string' },
    { field: 'vendor',            label: 'Vendor',            required: false, type: 'string' },
    { field: 'unit_of_measure',   label: 'Unit of Measure',   required: false, type: 'string' },
    { field: 'unit_cost',         label: 'Unit Cost',         required: false, type: 'number' },
    { field: 'quantity_on_hand',  label: 'Qty On Hand',       required: false, type: 'number' },
    { field: 'reorder_point',     label: 'Reorder Point',     required: false, type: 'number' },
    { field: 'location',          label: 'Storage Location',  required: false, type: 'string' },
  ],
  locations: [
    { field: 'name',              label: 'Location Name',     required: true,  type: 'string' },
    { field: 'code',              label: 'Location Code',     required: false, type: 'string' },
    { field: 'building',          label: 'Building',          required: false, type: 'string' },
    { field: 'floor',             label: 'Floor',             required: false, type: 'string' },
    { field: 'department',        label: 'Department',        required: false, type: 'string' },
    { field: 'notes',             label: 'Notes',             required: false, type: 'string' },
  ],
  users: [
    { field: 'full_name',         label: 'Full Name',         required: true,  type: 'string' },
    { field: 'email',             label: 'Email',             required: true,  type: 'string' },
    { field: 'role',              label: 'Role',              required: true,  type: 'enum'   },
    { field: 'phone',             label: 'Phone',             required: false, type: 'string' },
    { field: 'department',        label: 'Department',        required: false, type: 'string' },
  ],
}

// ─── Pattern matching for AI column suggestion ────────────────────────────────

const COLUMN_PATTERNS: Record<ImportEntityType, Record<string, string[]>> = {
  assets: {
    name:              ['name', 'asset name', 'equipment name', 'machine name', 'title', 'asset title'],
    facility_asset_id: ['facility asset id', 'asset id', 'asset code', 'equipment id', 'tag', 'tag number'],
    serial_number:     ['serial', 'serial number', 'serial #', 's/n', 'sn', 'serial no', 'serialnumber'],
    model:             ['model', 'model number', 'model #', 'model no', 'model name'],
    manufacturer:      ['manufacturer', 'make', 'brand', 'oem', 'vendor', 'mfr', 'mfg'],
    department:        ['department', 'dept', 'area', 'section', 'cost center'],
    location:          ['location', 'loc', 'building', 'room', 'site', 'facility'],
    status:            ['status', 'condition', 'state', 'asset status'],
    install_date:      ['install date', 'installation date', 'commissioned', 'placed in service', 'purchase date'],
    purchase_cost:     ['purchase cost', 'cost', 'price', 'value', 'acquisition cost', 'original cost'],
    notes:             ['notes', 'comments', 'description', 'remarks'],
  },
  work_orders: {
    title:             ['title', 'description', 'subject', 'work order', 'issue', 'problem', 'task name'],
    description:       ['description', 'details', 'notes', 'comments', 'instructions', 'narrative'],
    status:            ['status', 'state', 'wo status', 'work order status'],
    priority:          ['priority', 'urgency', 'severity', 'importance'],
    type:              ['type', 'wo type', 'work type', 'category', 'work order type'],
    asset_id:          ['asset', 'equipment', 'machine', 'asset name', 'asset id'],
    assigned_to:       ['assigned to', 'assignee', 'technician', 'assigned tech', 'worker'],
    due_date:          ['due date', 'due', 'deadline', 'target date', 'scheduled date'],
    completed_at:      ['completed', 'completed at', 'completion date', 'closed', 'resolved'],
    notes:             ['notes', 'comments', 'remarks', 'additional info'],
  },
  pm_schedules: {
    title:             ['title', 'name', 'pm name', 'task name', 'description', 'pm title'],
    description:       ['description', 'details', 'instructions', 'procedure'],
    frequency:         ['frequency', 'interval', 'schedule', 'recurrence', 'period'],
    asset_id:          ['asset', 'equipment', 'machine', 'asset name', 'asset id'],
    assigned_to:       ['assigned to', 'assignee', 'technician', 'responsible'],
    next_due_at:       ['next due', 'next due date', 'due date', 'next service'],
    estimated_hours:   ['estimated hours', 'est hours', 'time estimate', 'duration', 'man hours'],
    instructions:      ['instructions', 'procedure', 'steps', 'checklist', 'directions'],
  },
  parts: {
    name:              ['name', 'part name', 'description', 'item', 'item name', 'component'],
    part_number:       ['part number', 'part #', 'part no', 'pn', 'sku', 'item number', 'mfr part number', 'manufacturer part'],
    description:       ['description', 'notes', 'details', 'comments'],
    manufacturer:      ['manufacturer', 'make', 'brand', 'oem', 'mfr', 'mfg'],
    vendor:            ['vendor', 'supplier', 'source', 'distributor'],
    unit_of_measure:   ['unit of measure', 'uom', 'unit', 'measure', 'units'],
    unit_cost:         ['unit cost', 'cost', 'price', 'unit price', 'each cost'],
    quantity_on_hand:  ['quantity', 'qty', 'quantity on hand', 'qty on hand', 'on hand', 'stock', 'count', 'inventory'],
    reorder_point:     ['reorder', 'reorder point', 'reorder qty', 'min stock', 'minimum', 'par'],
    location:          ['location', 'bin', 'shelf', 'storage', 'bin location', 'warehouse location'],
  },
  locations: {
    name:              ['name', 'location name', 'location', 'area', 'zone'],
    code:              ['code', 'location code', 'loc code', 'abbreviation'],
    building:          ['building', 'bldg', 'building name', 'facility'],
    floor:             ['floor', 'level', 'story'],
    department:        ['department', 'dept', 'area', 'section'],
    notes:             ['notes', 'comments', 'description'],
  },
  users: {
    full_name:         ['name', 'full name', 'employee name', 'user name', 'display name'],
    email:             ['email', 'email address', 'e-mail', 'login', 'username'],
    role:              ['role', 'user role', 'access level', 'permission', 'type'],
    phone:             ['phone', 'phone number', 'cell', 'mobile', 'telephone'],
    department:        ['department', 'dept', 'team', 'group'],
  },
}

// ─── Suggestion logic ─────────────────────────────────────────────────────────

export function suggestMapping(
  column: string,
  entityType: ImportEntityType
): { field: string | null; confidence: 'auto' | 'suggested' | 'none' } {
  const normalized = column.toLowerCase().trim()
  const patterns = COLUMN_PATTERNS[entityType]

  // First pass: exact match
  for (const [field, candidates] of Object.entries(patterns)) {
    if (candidates.includes(normalized)) {
      return { field, confidence: 'auto' }
    }
  }

  // Second pass: partial / contains match
  for (const [field, candidates] of Object.entries(patterns)) {
    for (const candidate of candidates) {
      if (normalized.includes(candidate) || candidate.includes(normalized)) {
        return { field, confidence: 'suggested' }
      }
    }
  }

  return { field: null, confidence: 'none' }
}
