'use client'

import { useState, useRef } from 'react'
import type { SectionId } from '@/app/(dashboard)/settings/page'
import type { UserRole } from '@/types'
import ToggleSwitch from '../ToggleSwitch'
import ConfigList from '../ConfigList'
import {
  MOCK_USERS,
  MOCK_CREWS,
  MOCK_USER_SHIFTS,
  type MockUser,
  type MockCrew,
  type ConfigItem,
} from '@/lib/mock-settings'

const USER_TABS: SectionId[] = ['users-list', 'users-crews', 'users-shifts']

const TAB_LABELS: Record<string, string> = {
  'users-list':  'Users',
  'users-crews': 'Crews',
  'users-shifts': 'Shifts',
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  manager: 'Manager',
  technician: 'Technician',
  requester: 'Requester',
}

interface UsersSectionProps {
  sectionId: SectionId
}

// ─── Crew Modal ───────────────────────────────────────────────────────────────
interface CrewModalProps {
  crew?: MockCrew
  users: MockUser[]
  onSave: (data: { name: string; lead_user_id: string; member_ids: string[] }) => void
  onClose: () => void
}

function CrewModal({ crew, users, onSave, onClose }: CrewModalProps) {
  const [name, setName]         = useState(crew?.name ?? '')
  const [leadId, setLeadId]     = useState(crew?.lead_user_id ?? '')
  const [memberIds, setMemberIds] = useState<string[]>(crew?.member_ids ?? [])
  const overlayRef = useRef<HTMLDivElement>(null)

  function toggleMember(id: string) {
    setMemberIds(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id])
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), lead_user_id: leadId, member_ids: memberIds })
  }

  const activeUsers = users.filter(u => u.is_active)

  return (
    <div
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
      className="fixed inset-0 z-50 flex items-end sm:items-center p-4 bg-black/50"
    >
      <div className="w-full max-w-md mx-auto rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 sticky top-0 bg-white">
          <h2 className="text-base font-semibold text-slate-900">
            {crew ? 'Edit Crew' : 'New Crew'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Crew Name</label>
            <input
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Team Lead</label>
            <select
              value={leadId}
              onChange={e => setLeadId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">No lead assigned</option>
              {activeUsers.map(u => (
                <option key={u.id} value={u.id}>{u.full_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Members</label>
            <div className="rounded-lg border border-slate-200 divide-y divide-slate-100 max-h-48 overflow-y-auto">
              {activeUsers.map(u => (
                <label key={u.id} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={memberIds.includes(u.id)}
                    onChange={() => toggleMember(u.id)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900">{u.full_name}</div>
                    <div className="text-xs text-slate-400">{ROLE_LABELS[u.role]}</div>
                  </div>
                </label>
              ))}
            </div>
            <p className="mt-1 text-xs text-slate-400">{memberIds.length} member(s) selected</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              {crew ? 'Save Changes' : 'Create Crew'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function UsersSection({ sectionId }: UsersSectionProps) {
  const initialIdx = Math.max(0, USER_TABS.indexOf(sectionId))
  const [tabIdx, setTabIdx] = useState(initialIdx)

  const [users,  setUsers]  = useState<MockUser[]>(MOCK_USERS)
  const [crews,  setCrews]  = useState<MockCrew[]>(MOCK_CREWS)
  const [shifts, setShifts] = useState<ConfigItem[]>(MOCK_USER_SHIFTS)
  const [saved, setSaved]   = useState(false)

  const [crewModal, setCrewModal] = useState<{ crew?: MockCrew } | null>(null)

  function updateUserField(id: string, field: keyof MockUser, value: unknown) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, [field]: value } : u))
  }

  function handleSaveUsers() {
    console.log('Save users:', users)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function handleSaveCrew(data: { name: string; lead_user_id: string; member_ids: string[] }) {
    if (crewModal?.crew) {
      setCrews(prev => prev.map(c => c.id === crewModal.crew!.id ? { ...c, ...data } : c))
    } else {
      setCrews(prev => [...prev, { id: `crew-${Date.now()}`, ...data }])
    }
    setCrewModal(null)
  }

  function getUserName(id: string) {
    return users.find(u => u.id === id)?.full_name ?? id
  }

  return (
    <div className="space-y-4">
      {/* Tab strip */}
      <div className="flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
        {USER_TABS.map((tab, idx) => (
          <button
            key={tab}
            onClick={() => setTabIdx(idx)}
            className={[
              'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              tabIdx === idx
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900',
            ].join(' ')}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Users tab */}
      {USER_TABS[tabIdx] === 'users-list' && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Users</h3>
              <p className="text-xs text-slate-500 mt-0.5">{users.filter(u => u.is_active).length} active users</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => console.log('TODO: invite user')}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Invite User
              </button>
              <button
                onClick={handleSaveUsers}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
              >
                Save Changes
              </button>
              {saved && (
                <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Saved
                </span>
              )}
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs font-medium text-slate-500">
                  <th className="px-5 py-2.5 text-left">Name</th>
                  <th className="px-4 py-2.5 text-left">Email</th>
                  <th className="px-4 py-2.5 text-left">Role</th>
                  <th className="px-4 py-2.5 text-left">Phone</th>
                  <th className="px-4 py-2.5 text-center">Active</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className={['border-b border-slate-50 hover:bg-slate-50/50', !user.is_active ? 'opacity-60' : ''].join(' ')}>
                    <td className="px-5 py-3 font-medium text-slate-900">{user.full_name}</td>
                    <td className="px-4 py-3 text-slate-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={e => updateUserField(user.id, 'role', e.target.value as UserRole)}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="technician">Technician</option>
                        <option value="requester">Requester</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{user.phone ?? '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <ToggleSwitch
                        checked={user.is_active}
                        onChange={v => updateUserField(user.id, 'is_active', v)}
                        size="sm"
                        label={`Toggle active status for ${user.full_name}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-slate-100">
            {users.map(user => (
              <div key={user.id} className={['px-4 py-3', !user.is_active ? 'opacity-60' : ''].join(' ')}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-slate-900">{user.full_name}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                    {user.phone && <div className="text-xs text-slate-400">{user.phone}</div>}
                  </div>
                  <ToggleSwitch
                    checked={user.is_active}
                    onChange={v => updateUserField(user.id, 'is_active', v)}
                    size="sm"
                  />
                </div>
                <div className="mt-2">
                  <select
                    value={user.role}
                    onChange={e => updateUserField(user.id, 'role', e.target.value as UserRole)}
                    className="rounded-lg border border-slate-200 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="technician">Technician</option>
                    <option value="requester">Requester</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Crews tab */}
      {USER_TABS[tabIdx] === 'users-crews' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Crews</h3>
              <p className="text-xs text-slate-500 mt-0.5">{crews.length} crew(s) defined</p>
            </div>
            <button
              onClick={() => setCrewModal({})}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
            >
              + New Crew
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {crews.map(crew => {
              const memberCount = crew.member_ids.length
              const leadName = crew.lead_user_id ? getUserName(crew.lead_user_id) : null
              return (
                <div key={crew.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium text-sm text-slate-900">{crew.name}</div>
                      {leadName && (
                        <div className="text-xs text-slate-500 mt-0.5">Lead: {leadName}</div>
                      )}
                    </div>
                    <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {memberCount} member{memberCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <button
                    onClick={() => setCrewModal({ crew })}
                    className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Edit Crew
                  </button>
                </div>
              )
            })}
            {crews.length === 0 && (
              <div className="sm:col-span-2 lg:col-span-3 rounded-xl border-2 border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
                No crews yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shifts tab */}
      {USER_TABS[tabIdx] === 'users-shifts' && (
        <ConfigList
          title="Shifts"
          description="Work shift definitions for scheduling and reporting."
          items={shifts}
          onChange={setShifts}
          allowDefault
        />
      )}

      {/* Crew modal */}
      {crewModal !== null && (
        <CrewModal
          crew={crewModal.crew}
          users={users}
          onSave={handleSaveCrew}
          onClose={() => setCrewModal(null)}
        />
      )}
    </div>
  )
}
