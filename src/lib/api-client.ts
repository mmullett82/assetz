/**
 * API client for assetZ backend (FastAPI on localhost:8000)
 * All calls are scoped to the authenticated user's organization.
 *
 * During development without a backend, functions return placeholder data.
 * Replace the placeholder implementations as Grant's API endpoints come online.
 */

import type {
  Asset,
  WorkOrder,
  PMSchedule,
  Part,
  User,
  DashboardKPIs,
  PaginatedResponse,
} from '@/types'

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api'

// ─── Auth token management ────────────────────────────────────────────────────

let _authToken: string | null = null

export function setAuthToken(token: string | null): void {
  _authToken = token
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('assetz_token')
  }
  return _authToken
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

// URL query params — values are coerced to strings
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryParams = Record<string, any>

interface RequestOptions extends RequestInit {
  params?: QueryParams
}

async function apiFetch<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const token = getAuthToken()
  const { params, ...fetchOptions } = options

  let url = `${API_BASE}${path}`
  if (params) {
    const query = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) query.set(k, String(v))
    }
    const qs = query.toString()
    if (qs) url += `?${qs}`
  }

  const res = await fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...fetchOptions.headers,
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? `API error ${res.status}`)
  }

  // 204 No Content
  if (res.status === 204) return undefined as T

  return res.json() as Promise<T>
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export const auth = {
  login: (payload: LoginPayload) =>
    apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  logout: () =>
    apiFetch<void>('/auth/logout', { method: 'POST' }),

  me: () => apiFetch<User>('/auth/me'),
}

// ─── Assets ──────────────────────────────────────────────────────────────────

export interface AssetsQuery {
  page?: number
  page_size?: number
  department_id?: string
  status?: string
  search?: string
}

export const assets = {
  list: (query?: AssetsQuery) =>
    apiFetch<PaginatedResponse<Asset>>('/assets', { params: query }),

  get: (id: string) => apiFetch<Asset>(`/assets/${id}`),

  create: (data: Partial<Asset>) =>
    apiFetch<Asset>('/assets', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<Asset>) =>
    apiFetch<Asset>(`/assets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/assets/${id}`, { method: 'DELETE' }),

  // Get dependency graph for an asset
  dependencies: (id: string) =>
    apiFetch<{ depends_on: Asset[]; feeds: Asset[]; dependents: Asset[] }>(
      `/assets/${id}/dependencies`
    ),
}

// ─── Work Orders ──────────────────────────────────────────────────────────────

export interface WorkOrdersQuery {
  page?: number
  page_size?: number
  status?: string
  priority?: string
  asset_id?: string
  assigned_to_id?: string
  search?: string
}

export const workOrders = {
  list: (query?: WorkOrdersQuery) =>
    apiFetch<PaginatedResponse<WorkOrder>>('/work-orders', { params: query }),

  get: (id: string) => apiFetch<WorkOrder>(`/work-orders/${id}`),

  create: (data: Partial<WorkOrder>) =>
    apiFetch<WorkOrder>('/work-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<WorkOrder>) =>
    apiFetch<WorkOrder>(`/work-orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, status: WorkOrder['status']) =>
    apiFetch<WorkOrder>(`/work-orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  addComment: (id: string, body: string) =>
    apiFetch<WorkOrder>(`/work-orders/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    }),

  uploadPhoto: (id: string, formData: FormData) =>
    apiFetch<WorkOrder>(`/work-orders/${id}/photos`, {
      method: 'POST',
      body: formData,
      headers: {},  // Let browser set Content-Type for multipart
    }),
}

// ─── PM Schedules ─────────────────────────────────────────────────────────────

export interface PMSchedulesQuery {
  page?: number
  page_size?: number
  asset_id?: string
  is_active?: boolean
  overdue_only?: boolean
}

export const pmSchedules = {
  list: (query?: PMSchedulesQuery) =>
    apiFetch<PaginatedResponse<PMSchedule>>('/pm-schedules', {
      params: query,
    }),

  get: (id: string) => apiFetch<PMSchedule>(`/pm-schedules/${id}`),

  create: (data: Partial<PMSchedule>) =>
    apiFetch<PMSchedule>('/pm-schedules', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<PMSchedule>) =>
    apiFetch<PMSchedule>(`/pm-schedules/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  complete: (id: string, completedAt?: string) =>
    apiFetch<PMSchedule>(`/pm-schedules/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ completed_at: completedAt ?? new Date().toISOString() }),
    }),

  // AI-generated PM from equipment manual
  generateFromManual: (assetId: string) =>
    apiFetch<PMSchedule[]>(`/pm-schedules/generate`, {
      method: 'POST',
      body: JSON.stringify({ asset_id: assetId }),
    }),
}

// ─── Parts ────────────────────────────────────────────────────────────────────

export interface PartsQuery {
  page?: number
  page_size?: number
  search?: string
  status?: string
  asset_id?: string
  low_stock_only?: boolean
}

export const parts = {
  list: (query?: PartsQuery) =>
    apiFetch<PaginatedResponse<Part>>('/parts', { params: query }),

  get: (id: string) => apiFetch<Part>(`/parts/${id}`),

  create: (data: Partial<Part>) =>
    apiFetch<Part>('/parts', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<Part>) =>
    apiFetch<Part>(`/parts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  reserve: (partId: string, workOrderId: string, quantity: number) =>
    apiFetch<void>(`/parts/${partId}/reserve`, {
      method: 'POST',
      body: JSON.stringify({ work_order_id: workOrderId, quantity }),
    }),

  release: (partId: string, workOrderId: string) =>
    apiFetch<void>(`/parts/${partId}/release`, {
      method: 'POST',
      body: JSON.stringify({ work_order_id: workOrderId }),
    }),
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const dashboard = {
  kpis: () => apiFetch<DashboardKPIs>('/dashboard/kpis'),
}

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = {
  list: () => apiFetch<User[]>('/users'),
  get: (id: string) => apiFetch<User>(`/users/${id}`),
  update: (id: string, data: Partial<User>) =>
    apiFetch<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
}

// ─── Named export for convenience ─────────────────────────────────────────────

const apiClient = { auth, assets, workOrders, pmSchedules, parts, dashboard, users }
export default apiClient
