import type { UserRole } from '@/types'

// ─── Actions ─────────────────────────────────────────────────────────────────

export type Action =
  // Dashboard
  | 'view_dashboard_full'
  | 'view_dashboard_my_work'
  | 'view_dashboard_my_requests'
  // Assets
  | 'view_assets'
  | 'create_assets'
  | 'edit_assets'
  | 'delete_assets'
  // Work Orders
  | 'view_all_work_orders'
  | 'view_assigned_work_orders'
  | 'view_own_requests'
  | 'create_work_orders'
  | 'update_work_order_status'
  // Requests
  | 'submit_requests'
  | 'triage_requests'
  // PM
  | 'view_pm'
  | 'create_pm'
  // Parts
  | 'view_parts'
  | 'create_parts'
  | 'reserve_parts'
  // Floor plan
  | 'view_floor_plan'
  | 'edit_floor_plan'
  // Reports
  | 'view_reports'
  // Settings
  | 'view_settings'
  | 'edit_settings'
  // Import
  | 'import_data'
  // Reference Cards
  | 'view_reference_cards'
  | 'edit_reference_cards'

// ─── Permission Matrix ───────────────────────────────────────────────────────

const PERMISSION_MATRIX: Record<UserRole, Set<Action>> = {
  admin: new Set<Action>([
    'view_dashboard_full', 'view_dashboard_my_work', 'view_dashboard_my_requests',
    'view_assets', 'create_assets', 'edit_assets', 'delete_assets',
    'view_all_work_orders', 'view_assigned_work_orders', 'view_own_requests',
    'create_work_orders', 'update_work_order_status',
    'submit_requests', 'triage_requests',
    'view_pm', 'create_pm',
    'view_parts', 'create_parts', 'reserve_parts',
    'view_floor_plan', 'edit_floor_plan',
    'view_reports',
    'view_settings', 'edit_settings',
    'import_data',
    'view_reference_cards', 'edit_reference_cards',
  ]),

  manager: new Set<Action>([
    'view_dashboard_full', 'view_dashboard_my_work', 'view_dashboard_my_requests',
    'view_assets', 'create_assets', 'edit_assets',
    'view_all_work_orders', 'view_assigned_work_orders', 'view_own_requests',
    'create_work_orders', 'update_work_order_status',
    'submit_requests', 'triage_requests',
    'view_pm', 'create_pm',
    'view_parts', 'create_parts', 'reserve_parts',
    'view_floor_plan', 'edit_floor_plan',
    'view_reports',
    'view_settings',
    'import_data',
    'view_reference_cards', 'edit_reference_cards',
  ]),

  technician: new Set<Action>([
    'view_dashboard_my_work',
    'view_assets',
    'view_assigned_work_orders', 'view_own_requests',
    'create_work_orders', 'update_work_order_status',
    'submit_requests',
    'view_pm',
    'view_parts', 'reserve_parts',
    'view_floor_plan',
    'view_reference_cards',
  ]),

  requester: new Set<Action>([
    'view_dashboard_my_requests',
    'view_assets', // limited view
    'view_own_requests',
    'submit_requests',
    'view_floor_plan',
    'view_reference_cards', // limited
  ]),

  viewer: new Set<Action>([
    'view_dashboard_full',
    'view_assets',
    'view_all_work_orders',
    'view_pm',
    'view_parts',
    'view_floor_plan',
    'view_reports',
    'view_reference_cards',
  ]),
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function hasPermission(role: UserRole, action: Action): boolean {
  return PERMISSION_MATRIX[role]?.has(action) ?? false
}

// Route → required action mapping
const ROUTE_PERMISSIONS: Record<string, Action> = {
  '/dashboard': 'view_dashboard_full', // fallback — dashboard handles role rendering internally
  '/assets': 'view_assets',
  '/work-orders': 'view_assigned_work_orders',
  '/pm': 'view_pm',
  '/parts': 'view_parts',
  '/floor-plan': 'view_floor_plan',
  '/reports': 'view_reports',
  '/settings': 'view_settings',
  '/import': 'import_data',
  '/requests': 'submit_requests',
}

/**
 * Check if a role can access a given route path.
 * Dashboard is always accessible (role-specific rendering handled internally).
 */
export function canAccessRoute(role: UserRole, path: string): boolean {
  // Dashboard is always accessible — it renders role-specific content
  if (path === '/dashboard') return true

  // Find the most specific matching route
  const matchedRoute = Object.keys(ROUTE_PERMISSIONS)
    .filter((route) => path.startsWith(route))
    .sort((a, b) => b.length - a.length)[0]

  if (!matchedRoute) return true // no restriction defined
  return hasPermission(role, ROUTE_PERMISSIONS[matchedRoute])
}

/**
 * Get nav items visible to this role.
 * Returns array of route paths the user should see in the sidebar.
 */
export function getVisibleRoutes(role: UserRole): string[] {
  return Object.entries(ROUTE_PERMISSIONS)
    .filter(([, action]) => hasPermission(role, action))
    .map(([route]) => route)
}
