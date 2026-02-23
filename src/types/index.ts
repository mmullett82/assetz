// Core TypeScript interfaces for assetZ — matching backend schema
// All entities are scoped to an organization_id for multi-tenancy

// ─── Enums ────────────────────────────────────────────────────────────────────

export type DependencyCode = 'L' | 'C' | 'U'
// L = Production Line (directly coupled, one stops = line stops)
// C = Independent Cell (same-type group, not mechanically dependent)
// U = Utility (serves multiple departments)

export type AssetStatus = 'operational' | 'down' | 'maintenance' | 'decommissioned'

export type WorkOrderStatus = 'open' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'

export type WorkOrderPriority = 'low' | 'medium' | 'high' | 'critical'

export type WorkOrderType = 'corrective' | 'preventive' | 'inspection' | 'project' | 'safety' | 'breakdown'

export type PMFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual' | 'meter_based'

export type UserRole = 'admin' | 'manager' | 'technician' | 'requester'

export type PartStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'on_order'

// Red/Yellow/Green status — measured against DUE DATE
// Green: on-time OR 3+ days remaining
// Yellow: 1–2 days remaining
// Red: past due
export type DueStatus = 'green' | 'yellow' | 'red'

// ─── Organization & Facility ──────────────────────────────────────────────────

export interface Organization {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface Facility {
  id: string
  organization_id: string
  name: string
  // Building code used in Facility Asset ID (e.g., "B1")
  building_code: string
  address?: string
  timezone: string
  created_at: string
  updated_at: string
}

export interface Department {
  id: string
  organization_id: string
  facility_id: string
  name: string
  // Department code used in Facility Asset ID (e.g., "MIL", "FIN", "FAC")
  // Represents physical location, NOT equipment category
  code: string
  created_at: string
  updated_at: string
}

// ─── Asset ────────────────────────────────────────────────────────────────────

export interface Asset {
  id: string
  organization_id: string
  facility_id: string
  department_id: string

  // Smart ID System
  // Format: [Company]-[Building]-[Department]-[SystemType]-[UnitType]-[DependencyCode][Group]-[Sequence]
  // Example: SC-B1-MIL-EDGE-EDGE_BANDER-C1-01
  facility_asset_id: string

  // Short scannable barcode — same as asset number
  // Format: [CompanyPrefix]-[TypeCode]-[4-digit sequence]
  // Example: SLD-EB-0001
  asset_number: string

  name: string
  description?: string
  manufacturer?: string
  model?: string
  serial_number?: string
  year_installed?: number

  // ID system components
  company_code: string
  building_code: string
  department_code: string
  system_type: string
  unit_type: string
  dependency_code: DependencyCode
  dependency_group: number   // e.g., 1 → C1, U2
  sequence: number           // 01, 02, etc.

  status: AssetStatus
  location_notes?: string

  // Graph relationships (populated from Kuzu graph DB)
  depends_on?: string[]       // Asset IDs this asset directly depends on (L equipment)
  feeds?: string[]            // Asset IDs this asset indirectly feeds (C/U equipment)
  dependents?: string[]       // Asset IDs that depend on this one

  // Floor plan positioning
  floor_plan_x?: number
  floor_plan_y?: number
  floor_plan_zone?: string

  // Meter tracking for meter-based PMs
  current_meter_value?: number
  meter_unit?: string         // hours, cycles, etc.
  last_meter_update?: string

  // Purchase Information
  purchase_price?: number
  purchase_date?: string
  purchase_invoice_number?: string
  expected_life_years?: number
  replacement_cost?: number
  salvage_value?: number

  // Warranty
  warranty_title?: string
  warranty_expiration_date?: string
  warranty_vendor?: string

  // Dates
  date_of_manufacture?: string
  date_placed_in_service?: string
  date_removed?: string
  out_of_service_begin?: string
  out_of_service_end?: string

  // Condition Assessment
  current_condition?: string        // key matching settings conditions list
  condition_date?: string
  estimated_replace_date?: string
  assessment_note?: string

  // Safety & Procedures
  safety_note?: string
  training_note?: string
  shutdown_procedure_note?: string
  loto_procedure_note?: string
  emergency_note?: string

  // Assignment & IDs
  assigned_to_id?: string           // primary technician
  emergency_contact_id?: string
  tag_number?: string               // physical tag
  rfid?: string

  created_at: string
  updated_at: string
}

// ─── Work Order ───────────────────────────────────────────────────────────────

export interface WorkOrder {
  id: string
  organization_id: string
  work_order_number: string   // Human-readable WO number (e.g., WO-2024-0042)

  asset_id: string
  asset?: Asset               // Populated on fetch

  type: WorkOrderType
  status: WorkOrderStatus
  priority: WorkOrderPriority
  due_status?: DueStatus      // Computed from due_date

  title: string
  description: string
  failure_code?: string
  cause_code?: string
  remedy?: string

  requested_by_id: string
  requested_by?: User
  assigned_to_id?: string
  assigned_to?: User

  due_date?: string
  started_at?: string
  completed_at?: string
  estimated_hours?: number
  actual_hours?: number

  // Associated PM schedule if this is a preventive WO
  pm_schedule_id?: string

  // Origin tracking
  origin_type?: 'manual' | 'pm_generated' | 'request'
  originated_date?: string
  originator_id?: string
  assigned_date?: string
  completed_datetime?: string
  action_taken?: string

  comments?: WorkOrderComment[]
  photos?: WorkOrderPhoto[]
  parts_used?: WorkOrderPart[]

  created_at: string
  updated_at: string
}

export interface WorkOrderComment {
  id: string
  work_order_id: string
  user_id: string
  user?: User
  body: string
  created_at: string
}

export interface WorkOrderPhoto {
  id: string
  work_order_id: string
  url: string
  caption?: string
  uploaded_by_id: string
  created_at: string
}

export interface WorkOrderPart {
  id: string
  work_order_id: string
  part_id: string
  part?: Part
  quantity_used: number
  unit_cost?: number
}

// ─── PM Schedule ─────────────────────────────────────────────────────────────

export interface PMSchedule {
  id: string
  organization_id: string

  asset_id: string
  asset?: Asset

  title: string
  description: string
  instructions?: string

  frequency: PMFrequency
  interval_value?: number       // e.g., every 3 months → frequency=monthly, interval=3
  meter_interval?: number       // for meter_based PMs
  estimated_hours?: number

  assigned_to_id?: string
  assigned_to?: User

  last_completed_at?: string
  next_due_at?: string
  due_status?: DueStatus

  is_active: boolean

  // Schedule type
  pm_type?: 'time_based' | 'meter_based' | 'time_meter_override'
  expected_completion_days?: number
  expected_completion_hours?: number
  wo_creation_time?: string          // e.g. "08:00"
  default_wo_status?: WorkOrderStatus
  default_problem_code?: string
  default_cause_code?: string
  end_condition?: 'none' | 'occurrences' | 'date'
  end_occurrences?: number
  end_date?: string
  skip_if_open?: boolean
  required_parts?: { part_id: string; quantity: number }[]

  created_at: string
  updated_at: string
}

// ─── Parts & Inventory ────────────────────────────────────────────────────────

export interface Part {
  id: string
  organization_id: string

  // Part number = manufacturer part number (no internal numbering)
  part_number: string
  name: string
  description?: string
  manufacturer?: string
  vendor?: string
  vendor_part_number?: string

  unit_of_measure: string     // ea, ft, gal, etc.
  unit_cost?: number

  quantity_on_hand: number
  quantity_reserved: number   // Reserved for open WOs
  reorder_point?: number
  reorder_quantity?: number

  status: PartStatus
  location?: string           // Physical shelf/bin location

  // Compatible assets (many-to-many)
  compatible_assets?: string[]

  // Extended inventory fields
  alternate_part_number?: string
  manufacturer_barcode?: string
  par_quantity?: number              // ideal stock level
  min_level?: number
  max_level?: number
  quantity_on_back_order?: number

  created_at: string
  updated_at: string
}

export interface PartReservation {
  id: string
  part_id: string
  work_order_id: string
  quantity_reserved: number
  reserved_by_id: string
  reserved_at: string
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  organization_id: string
  email: string
  full_name: string
  role: UserRole
  is_active: boolean
  avatar_url?: string
  phone?: string
  created_at: string
  updated_at: string
}

// ─── API Response Wrappers ────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface ApiError {
  detail: string
  status_code: number
}

// ─── Dashboard / KPI ─────────────────────────────────────────────────────────

export interface DashboardKPIs {
  open_work_orders: number
  overdue_work_orders: number
  work_orders_due_today: number
  work_orders_completed_this_week: number
  assets_down: number
  total_assets: number
  pm_compliance_rate: number        // Percentage 0–100
  mean_time_to_repair?: number      // Hours
  parts_low_stock: number
  technicians_active: number
}

// ─── WebSocket Events ─────────────────────────────────────────────────────────

export type WSEventType =
  | 'work_order.created'
  | 'work_order.updated'
  | 'work_order.completed'
  | 'asset.status_changed'
  | 'kpi.updated'
  | 'notification'

export interface WSEvent<T = unknown> {
  type: WSEventType
  payload: T
  timestamp: string
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface Notification {
  id: string
  user_id: string
  title: string
  body: string
  type: 'alert' | 'info' | 'warning'
  read: boolean
  link?: string
  created_at: string
}

// ─── Floor Plan ───────────────────────────────────────────────────────────────

export interface FloorPlan {
  id: string
  facility_id: string
  name: string
  image_url?: string
  svg_data?: string
  width: number
  height: number
  scale?: number        // px per foot
  zones?: FloorPlanZone[]
  created_at: string
  updated_at: string
}

export interface FloorPlanZone {
  id: string
  floor_plan_id: string
  name: string
  color?: string
  polygon_points: { x: number; y: number }[]
}
