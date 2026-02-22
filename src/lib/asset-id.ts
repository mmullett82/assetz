/**
 * Smart ID generator for assetZ assets.
 *
 * Facility Asset ID format:
 *   [Company]-[Building]-[Department]-[SystemType]-[UnitType]-[DependencyCode][Group]-[Sequence]
 *   Example: SC-B1-MIL-EDGE-EDGE_BANDER-C1-01
 *
 * Rules:
 *  - Dashes (-) are STRICTLY field separators
 *  - Underscores (_) handle multi-word values within a field
 *  - Dependency codes: L (Production Line), C (Independent Cell), U (Utility)
 *  - Cell numbers are sequential per equipment type per department; reset per department
 *
 * Asset Number (barcode) format:
 *   [CompanyPrefix]-[TypeCode]-[4-digit sequence]
 *   Example: SLD-EB-0001
 *   Asset number always equals barcode number.
 */

import type { DependencyCode } from '@/types'

export interface AssetIdComponents {
  companyCode: string       // e.g., "SC" (SOLLiD Cabinetry)
  buildingCode: string      // e.g., "B1"
  departmentCode: string    // e.g., "MIL", "FIN", "FAC"
  systemType: string        // e.g., "EDGE", "CNC", "AIR"
  unitType: string          // e.g., "EDGE_BANDER", "ROVER", "COMPRESSOR"
  dependencyCode: DependencyCode  // L, C, or U
  dependencyGroup: number   // 1, 2, 3 etc. (C1, C2, U1, L1 ...)
  sequence: number          // 1-99 → "01", "02"
}

/**
 * Build the full facility asset ID string from components.
 */
export function buildFacilityAssetId(c: AssetIdComponents): string {
  const dep = `${c.dependencyCode}${c.dependencyGroup}`
  const seq = String(c.sequence).padStart(2, '0')
  return [
    c.companyCode.toUpperCase(),
    c.buildingCode.toUpperCase(),
    c.departmentCode.toUpperCase(),
    c.systemType.toUpperCase(),
    c.unitType.toUpperCase(),
    dep,
    seq,
  ].join('-')
}

export interface BarcodeIdComponents {
  companyPrefix: string   // e.g., "SLD"
  typeCode: string        // e.g., "EB", "ROV", "CMP"
  sequence: number        // 1-9999 → "0001"
}

/**
 * Build the short asset number / barcode.
 */
export function buildAssetNumber(c: BarcodeIdComponents): string {
  const seq = String(c.sequence).padStart(4, '0')
  return `${c.companyPrefix.toUpperCase()}-${c.typeCode.toUpperCase()}-${seq}`
}

/**
 * Parse a facility asset ID back into its components.
 * Returns null if the format is invalid.
 */
export function parseFacilityAssetId(id: string): AssetIdComponents | null {
  const parts = id.split('-')
  if (parts.length !== 7) return null

  const [companyCode, buildingCode, departmentCode, systemType, unitType, depGroup, seqStr] = parts

  const depCode = depGroup.charAt(0) as DependencyCode
  if (!['L', 'C', 'U'].includes(depCode)) return null

  const depGroupNum = parseInt(depGroup.slice(1), 10)
  const sequence = parseInt(seqStr, 10)

  if (isNaN(depGroupNum) || isNaN(sequence)) return null

  return {
    companyCode,
    buildingCode,
    departmentCode,
    systemType,
    unitType,
    dependencyCode: depCode,
    dependencyGroup: depGroupNum,
    sequence,
  }
}

/**
 * Compute the next sequence number for a given set of existing IDs
 * within the same company/building/department/system/unit/dependencyCode+Group.
 */
export function nextSequence(existingIds: string[]): number {
  if (existingIds.length === 0) return 1
  const sequences = existingIds
    .map((id) => parseFacilityAssetId(id)?.sequence ?? 0)
    .filter(Boolean)
  return Math.max(...sequences) + 1
}

/**
 * Validate that a manually-entered facility asset ID conforms to the spec.
 */
export function validateFacilityAssetId(id: string): string | null {
  const parsed = parseFacilityAssetId(id)
  if (!parsed) {
    return 'Invalid format. Expected: COMPANY-BUILDING-DEPT-SYSTEM-UNIT-C1-01'
  }
  if (parsed.companyCode.includes('_')) {
    return 'Company code cannot contain underscores — use dashes only as field separators'
  }
  return null
}

/**
 * Human-readable description of a dependency code.
 */
export function dependencyCodeLabel(code: DependencyCode): string {
  switch (code) {
    case 'L': return 'Production Line (L) — direct dependency'
    case 'C': return 'Independent Cell (C) — same-type group'
    case 'U': return 'Utility (U) — serves multiple departments'
  }
}
