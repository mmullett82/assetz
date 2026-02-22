'use client'

import { useState } from 'react'
import { MOCK_ID_SCHEMA } from '@/lib/mock-settings'

const DEPENDENCY_CODES = [
  { code: 'L', name: 'Production Line',   color: 'bg-red-50 text-red-700 border-red-200',    description: 'Equipment is directly coupled. If this asset stops, the line stops. Immediate red alert.' },
  { code: 'C', name: 'Independent Cell',  color: 'bg-yellow-50 text-yellow-700 border-yellow-200', description: 'Group of same-type equipment. Not mechanically dependent on other cells. Yellow warning with buffer time.' },
  { code: 'U', name: 'Utility',           color: 'bg-blue-50 text-blue-700 border-blue-200',  description: 'Serves multiple departments (compressors, dust collection, HVAC). Downstream impact tracked via FEEDS relationship.' },
]

export default function IDSchemaSection() {
  const [companyPrefix, setCompanyPrefix] = useState(MOCK_ID_SCHEMA.company_prefix)
  const [assetPrefix,   setAssetPrefix]   = useState(MOCK_ID_SCHEMA.asset_prefix)
  const [saved, setSaved] = useState(false)

  const exampleFacilityId = `${companyPrefix || 'SC'}-B1-MIL-CNC-ROVER-C2-01`
  const exampleBarcode    = `${assetPrefix || 'SLD'}-ROV-0001`

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    console.log('Save ID schema:', { companyPrefix, assetPrefix })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Prefix settings */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-slate-900">ID Schema</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Prefix configuration for auto-generated asset IDs and barcodes.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Company Prefix
              </label>
              <p className="text-xs text-slate-400 mb-2">
                Used as the first segment of every Facility Asset ID.
              </p>
              <input
                type="text"
                maxLength={8}
                value={companyPrefix}
                onChange={e => setCompanyPrefix(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                placeholder="SC"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Asset Prefix
              </label>
              <p className="text-xs text-slate-400 mb-2">
                Used as the first segment of every asset barcode / asset number.
              </p>
              <input
                type="text"
                maxLength={8}
                value={assetPrefix}
                onChange={e => setAssetPrefix(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                placeholder="SLD"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Live examples */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Live Preview</p>
            <div className="space-y-1.5">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Facility Asset ID example:</p>
                <code className="font-mono text-sm bg-white rounded-lg px-4 py-2.5 border border-slate-200 block">
                  {exampleFacilityId}
                </code>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Barcode / Asset Number example:</p>
                <code className="font-mono text-sm bg-white rounded-lg px-4 py-2.5 border border-slate-200 block">
                  {exampleBarcode}
                </code>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Save Changes
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Saved
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Dependency codes reference */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Dependency Codes</h3>
        <div className="space-y-3">
          {DEPENDENCY_CODES.map(dc => (
            <div key={dc.code} className={`flex items-start gap-3 rounded-lg border p-3 ${dc.color}`}>
              <code className="shrink-0 rounded px-2 py-0.5 font-mono text-sm font-bold bg-white/60">
                {dc.code}
              </code>
              <div>
                <div className="font-medium text-sm">{dc.name}</div>
                <div className="text-xs mt-0.5 opacity-80">{dc.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full ID format spec */}
      <details className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <summary className="cursor-pointer px-6 py-4 text-sm font-semibold text-slate-900 hover:bg-slate-50 rounded-xl select-none">
          Facility Asset ID Format Specification
        </summary>
        <div className="px-6 pb-5 pt-2 space-y-4 border-t border-slate-100">
          <p className="text-sm text-slate-600">
            Full format: <code className="font-mono text-xs bg-slate-100 rounded px-1.5 py-0.5">
              [Company]-[Building]-[Department]-[SystemType]-[UnitType]-[DependencyCode][Group]-[Sequence]
            </code>
          </p>

          <div className="text-sm text-slate-600 space-y-2">
            <p><strong>Rules:</strong></p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
              <li>Dashes (<code className="font-mono text-xs">-</code>) are STRICTLY field separators only.</li>
              <li>Underscores (<code className="font-mono text-xs">_</code>) handle multi-word values within a field (e.g., <code className="font-mono text-xs">EDGE_BANDER</code>).</li>
              <li>Department code = physical location of asset, NOT equipment category.</li>
              <li>Cell numbers are sequential per equipment type per department. They reset per department.</li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Examples:</p>
            <div className="space-y-1 font-mono text-xs bg-slate-50 rounded-lg p-4 border border-slate-100">
              <div className="text-slate-600">SC-B1-MIL-EDGE-EDGE_BANDER-C1-01</div>
              <div className="text-slate-600">SC-B1-MIL-CNC-ROVER-C2-01</div>
              <div className="text-slate-600">SC-B1-MIL-CNC-BEAM_SAW-C5-01</div>
              <div className="text-slate-600">SC-B1-FIN-SPRAY-AUTO_SPRAYBOOTH-C1-01   <span className="text-slate-400">← Finishing has its own C1</span></div>
              <div className="text-slate-600">SC-B1-FAC-AIR-COMPRESSOR-U1-01</div>
            </div>
          </div>
        </div>
      </details>
    </div>
  )
}
