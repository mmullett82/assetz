'use client'

import { useState } from 'react'
import { Clock, Plus, Trash2, ChevronDown } from 'lucide-react'
import { MOCK_USERS } from '@/lib/mock-settings'
import type { LaborEntry } from '@/types'

interface LaborLogProps {
  entries: LaborEntry[]
  onAdd: (entry: Omit<LaborEntry, 'id' | 'work_order_id' | 'user' | 'created_at'>) => Promise<void>
  onDelete?: (entryId: string) => Promise<void>
  isCompleted: boolean
}

const today = new Date().toISOString().slice(0, 10)

const TECH_USERS = MOCK_USERS.filter((u) => u.role === 'technician' || u.role === 'manager')

export default function LaborLog({ entries, onAdd, onDelete, isCompleted }: LaborLogProps) {
  const [showForm, setShowForm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [date, setDate] = useState(today)
  const [hours, setHours] = useState('')
  const [notes, setNotes] = useState('')
  const [userId, setUserId] = useState(TECH_USERS[0]?.id ?? '')

  const totalHours = entries.reduce((sum, e) => sum + e.hours, 0)

  async function handleAdd() {
    if (!userId || !hours || !date) return
    setIsSaving(true)
    try {
      await onAdd({
        user_id: userId,
        hours: parseFloat(hours),
        date,
        notes: notes.trim() || undefined,
      })
      setHours('')
      setNotes('')
      setDate(today)
      setShowForm(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-400" />
          Labor Log
        </h2>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 rounded-full px-2.5 py-0.5">
          {totalHours.toFixed(1)} hrs total
        </span>
      </div>

      {/* Entries list */}
      {entries.length === 0 ? (
        <p className="text-sm text-slate-400 italic">No labor logged yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-start justify-between gap-2 py-2.5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-800">{entry.user.full_name}</span>
                  <span className="text-xs text-slate-400">{new Date(entry.date).toLocaleDateString()}</span>
                  <span className="text-xs font-semibold text-slate-700 bg-slate-100 rounded px-1.5 py-0.5">
                    {entry.hours.toFixed(1)} h
                  </span>
                </div>
                {entry.notes && (
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{entry.notes}</p>
                )}
              </div>
              {!isCompleted && onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(entry.id)}
                  className="shrink-0 rounded p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  aria-label="Delete labor entry"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Add entry form */}
      {!isCompleted && (
        <>
          {showForm ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    max={today}
                    className="block w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="24"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="e.g. 2.5"
                    className="block w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Technician</label>
                <select
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TECH_USERS.map((u) => (
                    <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="What was done during this time…"
                  className="block w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={isSaving || !hours || !date || !userId}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? 'Saving…' : 'Add Entry'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 transition-colors min-h-[40px]"
            >
              <Plus className="h-3.5 w-3.5" />
              Log Time
              <ChevronDown className="h-3.5 w-3.5 ml-auto" />
            </button>
          )}
        </>
      )}
    </div>
  )
}
