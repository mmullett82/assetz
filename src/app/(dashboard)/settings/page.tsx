'use client'

import { useState } from 'react'
import OrgCompanySection   from '@/components/settings/sections/OrgCompanySection'
import FacilitySection     from '@/components/settings/sections/FacilitySection'
import AssetConfigSection  from '@/components/settings/sections/AssetConfigSection'
import WOConfigSection     from '@/components/settings/sections/WOConfigSection'
import PMSection           from '@/components/settings/sections/PMSection'
import PartsSection        from '@/components/settings/sections/PartsSection'
import UsersSection        from '@/components/settings/sections/UsersSection'
import IDSchemaSection     from '@/components/settings/sections/IDSchemaSection'

export type SectionId =
  | 'org-company'
  | 'org-facility'
  | 'asset-statuses'
  | 'asset-conditions'
  | 'asset-criticality'
  | 'asset-categories'
  | 'asset-system-types'
  | 'asset-meter-types'
  | 'wo-statuses'
  | 'wo-priorities'
  | 'wo-types'
  | 'wo-problem-codes'
  | 'wo-cause-codes'
  | 'wo-categories'
  | 'pm-frequencies'
  | 'pm-defaults'
  | 'parts-categories'
  | 'parts-units'
  | 'parts-defaults'
  | 'users-list'
  | 'users-crews'
  | 'users-shifts'
  | 'id-schema'

interface NavSection {
  id: SectionId
  label: string
}

interface NavGroup {
  label: string
  sections: NavSection[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Organization',
    sections: [
      { id: 'org-company',  label: 'Company Info'   },
      { id: 'org-facility', label: 'Facility'        },
    ],
  },
  {
    label: 'Assets',
    sections: [
      { id: 'asset-statuses',     label: 'Statuses'     },
      { id: 'asset-conditions',   label: 'Conditions'   },
      { id: 'asset-criticality',  label: 'Criticality'  },
      { id: 'asset-categories',   label: 'Categories'   },
      { id: 'asset-system-types', label: 'System Types' },
      { id: 'asset-meter-types',  label: 'Meter Types'  },
    ],
  },
  {
    label: 'Work Orders',
    sections: [
      { id: 'wo-statuses',      label: 'Statuses'      },
      { id: 'wo-priorities',    label: 'Priorities'    },
      { id: 'wo-types',         label: 'Types'         },
      { id: 'wo-problem-codes', label: 'Problem Codes' },
      { id: 'wo-cause-codes',   label: 'Cause Codes'   },
      { id: 'wo-categories',    label: 'Categories'    },
    ],
  },
  {
    label: 'PM',
    sections: [
      { id: 'pm-frequencies', label: 'Frequencies' },
      { id: 'pm-defaults',    label: 'Defaults'    },
    ],
  },
  {
    label: 'Parts',
    sections: [
      { id: 'parts-categories', label: 'Categories'   },
      { id: 'parts-units',      label: 'Units'         },
      { id: 'parts-defaults',   label: 'Defaults'      },
    ],
  },
  {
    label: 'Users',
    sections: [
      { id: 'users-list',   label: 'Users'  },
      { id: 'users-crews',  label: 'Crews'  },
      { id: 'users-shifts', label: 'Shifts' },
    ],
  },
  {
    label: 'System',
    sections: [
      { id: 'id-schema', label: 'ID Schema' },
    ],
  },
]

// Flat list for the mobile <select>
const ALL_SECTIONS: { id: SectionId; label: string; group: string }[] = NAV_GROUPS.flatMap(g =>
  g.sections.map(s => ({ ...s, group: g.label }))
)

function renderSection(activeSection: SectionId) {
  if (activeSection === 'org-company')   return <OrgCompanySection />
  if (activeSection === 'org-facility')  return <FacilitySection />

  if (activeSection.startsWith('asset-')) return <AssetConfigSection sectionId={activeSection} />
  if (activeSection.startsWith('wo-'))    return <WOConfigSection    sectionId={activeSection} />

  if (activeSection === 'pm-frequencies' || activeSection === 'pm-defaults')
    return <PMSection />

  if (activeSection.startsWith('parts-')) return <PartsSection />

  if (activeSection.startsWith('users-')) return <UsersSection sectionId={activeSection} />

  if (activeSection === 'id-schema')     return <IDSchemaSection />

  return null
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SectionId>('org-company')

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Configure your organization, assets, work orders, PM schedules, parts, and users.
        </p>
      </div>

      {/* Mobile section picker */}
      <div className="mb-5 lg:hidden">
        <select
          value={activeSection}
          onChange={e => setActiveSection(e.target.value as SectionId)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          {ALL_SECTIONS.map(s => (
            <option key={s.id} value={s.id}>
              {s.group} — {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Two-column layout on desktop */}
      <div className="flex gap-6">
        {/* Left sidebar nav — desktop only */}
        <nav className="hidden lg:block w-56 shrink-0 self-start sticky top-6">
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              <div className="px-3 pt-4 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {group.label}
              </div>
              {group.sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={[
                    'w-full text-left rounded-lg px-3 py-2 text-sm',
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-100',
                  ].join(' ')}
                >
                  {section.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Right content panel */}
        <main className="flex-1 min-w-0">
          {renderSection(activeSection)}
        </main>
      </div>
    </div>
  )
}
