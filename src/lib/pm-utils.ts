import type { PMFrequency, DueStatus } from '@/types'
import { computeDueStatus } from './due-status'

// ─── Human-readable frequency label ──────────────────────────────────────────

export function frequencyLabel(freq: PMFrequency, intervalValue?: number): string {
  switch (freq) {
    case 'daily':       return 'Daily'
    case 'weekly':      return 'Weekly'
    case 'biweekly':    return 'Every 2 weeks'
    case 'monthly':
      return intervalValue && intervalValue > 1
        ? `Every ${intervalValue} months`
        : 'Monthly'
    case 'quarterly':   return 'Quarterly'
    case 'semiannual':  return 'Every 6 months'
    case 'annual':      return 'Annual'
    case 'meter_based': return intervalValue
      ? `Every ${intervalValue.toLocaleString()} meter units`
      : 'Meter-based'
  }
}

// ─── Calculate next due date from a completion ───────────────────────────────

export function calculateNextDue(
  lastCompletedIso: string,
  freq: PMFrequency,
  intervalValue = 1
): Date {
  const d = new Date(lastCompletedIso)

  switch (freq) {
    case 'daily':       d.setDate(d.getDate() + 1);                    break
    case 'weekly':      d.setDate(d.getDate() + 7);                    break
    case 'biweekly':    d.setDate(d.getDate() + 14);                   break
    case 'monthly':     d.setMonth(d.getMonth() + intervalValue);      break
    case 'quarterly':   d.setMonth(d.getMonth() + 3);                  break
    case 'semiannual':  d.setMonth(d.getMonth() + 6);                  break
    case 'annual':      d.setFullYear(d.getFullYear() + 1);            break
    case 'meter_based': /* can't compute without current meter value */ break
  }

  return d
}

// ─── Days until due (negative = overdue) ─────────────────────────────────────

export function daysUntilDue(nextDueIso: string | undefined): number | null {
  if (!nextDueIso) return null
  const ms = new Date(nextDueIso).getTime() - Date.now()
  return Math.round(ms / (1000 * 60 * 60 * 24))
}

// ─── Due status for PM (same logic as WO) ────────────────────────────────────

export function pmDueStatus(nextDueIso: string | undefined): DueStatus {
  return computeDueStatus(nextDueIso)
}

// ─── Parse instruction text into steps ───────────────────────────────────────

/**
 * Instructions are stored as newline-separated steps.
 * Each non-empty line becomes one checklist item.
 */
export function formatDueDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export function parseInstructions(text: string | undefined): string[] {
  if (!text) return []
  return text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
}
