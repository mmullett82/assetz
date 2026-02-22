import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Settings' }

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      <p className="mt-1 text-sm text-slate-500">
        Organization config, user management, roles, and integrations.
      </p>

      <div className="mt-8 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
        <p className="text-slate-400 text-sm">Settings coming in Phase 1 · Step 7</p>
      </div>
    </div>
  )
}
