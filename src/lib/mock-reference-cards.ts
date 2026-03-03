import type { ReferenceCard, ReferenceCardSection } from '@/types'

export const MOCK_REFERENCE_CARD_SECTIONS: ReferenceCardSection[] = [
  {
    id: 'rcs-001',
    reference_card_id: 'rc-001',
    section_type: 'safety',
    title: 'Safety Warnings',
    sort_order: 0,
    content: {
      items: [
        { level: 'danger', text: 'LOCKOUT/TAGOUT required before any maintenance. Disconnect main power AND pneumatics.' },
        { level: 'warning', text: 'Spindle may coast for up to 60 seconds after power off. Wait for full stop.' },
        { level: 'caution', text: 'Coolant reservoir may be under pressure. Release slowly.' },
      ],
    },
  },
  {
    id: 'rcs-002',
    reference_card_id: 'rc-001',
    section_type: 'procedures',
    title: 'Standard PM Procedures',
    sort_order: 1,
    content: {
      steps: [
        { number: 1, text: 'Check and clean all dust extraction ports', estimated_minutes: 10 },
        { number: 2, text: 'Inspect and clean linear guide rails (X, Y, Z axes)', estimated_minutes: 15 },
        { number: 3, text: 'Lubricate all linear bearings per lubrication schedule', estimated_minutes: 10 },
        { number: 4, text: 'Check spindle collet and tool holder for wear', estimated_minutes: 5 },
        { number: 5, text: 'Inspect vacuum pod seals — replace if cracked', estimated_minutes: 10 },
        { number: 6, text: 'Check all emergency stops and safety interlocks', estimated_minutes: 5 },
        { number: 7, text: 'Clean and inspect cable chain tracks', estimated_minutes: 10 },
      ],
    },
  },
  {
    id: 'rcs-003',
    reference_card_id: 'rc-001',
    section_type: 'failures',
    title: 'Common Failure Modes',
    sort_order: 2,
    content: {
      failures: [
        { symptom: 'Spindle overheating', cause: 'Clogged air filter or worn bearings', fix: 'Clean/replace air filter. If persistent, schedule spindle rebuild.' },
        { symptom: 'Axis positioning error', cause: 'Dirty encoder strip or worn ball screw', fix: 'Clean encoder strip with isopropyl alcohol. Check ball screw backlash.' },
        { symptom: 'Vacuum pod not holding', cause: 'Worn seal gasket or vacuum pump issue', fix: 'Replace pod gasket. Check vacuum pump oil level and filter.' },
        { symptom: 'Tool change failure', cause: 'Dirty tool magazine or worn gripper', fix: 'Clean magazine slots. Inspect and replace gripper fingers if worn.' },
      ],
    },
  },
  {
    id: 'rcs-004',
    reference_card_id: 'rc-001',
    section_type: 'spare_parts',
    title: 'Recommended Spare Parts',
    sort_order: 3,
    content: {
      parts: [
        { part_number: 'BIE-4012345', name: 'Vacuum pod gasket set', quantity: 10, vendor: 'Biesse America' },
        { part_number: 'BIE-4056789', name: 'Spindle air filter', quantity: 2, vendor: 'Biesse America' },
        { part_number: 'SKF-6205-2RS', name: 'Spindle bearing', quantity: 2, vendor: 'SKF' },
        { part_number: 'INA-KWSE25', name: 'Linear bearing block', quantity: 4, vendor: 'INA/Schaeffler' },
      ],
    },
  },
  {
    id: 'rcs-005',
    reference_card_id: 'rc-001',
    section_type: 'lubrication',
    title: 'Lubrication Schedule',
    sort_order: 4,
    content: {
      points: [
        { location: 'X/Y/Z linear guides', lubricant: 'Kluber Isoflex NBU 15', interval: 'Weekly', method: 'Auto-lubrication system' },
        { location: 'Ball screws (all axes)', lubricant: 'Kluber Isoflex NBU 15', interval: 'Weekly', method: 'Auto-lubrication system' },
        { location: 'Spindle bearings', lubricant: 'Grease packed — no field service', interval: 'Factory sealed', method: 'N/A' },
        { location: 'Tool magazine chain', lubricant: 'Light machine oil', interval: 'Monthly', method: 'Manual — oil can' },
      ],
    },
  },
  {
    id: 'rcs-006',
    reference_card_id: 'rc-001',
    section_type: 'troubleshooting',
    title: 'Troubleshooting Guide',
    sort_order: 5,
    content: {
      tree: [
        {
          question: 'Is the machine powered on?',
          yes: 'Check for error codes on the HMI',
          no: 'Check main breaker, verify power supply, check emergency stop buttons',
        },
        {
          question: 'Is there an error code displayed?',
          yes: 'Look up error code in Biesse manual Chapter 8. Common: E001 = servo drive fault, E015 = spindle thermal',
          no: 'Proceed to specific symptom troubleshooting below',
        },
      ],
    },
  },
]

export const MOCK_REFERENCE_CARDS: ReferenceCard[] = [
  {
    id: 'rc-001',
    organization_id: 'org-001',
    asset_model: 'Biesse Rover B 1531',
    title: 'Biesse Rover B 1531 — Quick Reference Guide',
    version: 3,
    is_published: true,
    created_by_id: 'user-001',
    updated_by_id: 'user-001',
    sections: MOCK_REFERENCE_CARD_SECTIONS,
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-02-20T14:30:00Z',
  },
]
