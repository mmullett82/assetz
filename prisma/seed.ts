import 'dotenv/config'
import { Prisma, PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL environment variable is not set')
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // Clean existing data (reverse FK order)
  await prisma.crewMember.deleteMany()
  await prisma.crew.deleteMany()
  await prisma.configItem.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.floorPlanZone.deleteMany()
  await prisma.floorPlan.deleteMany()
  await prisma.partReservation.deleteMany()
  await prisma.assetPart.deleteMany()
  await prisma.workOrderPart.deleteMany()
  await prisma.workOrderPhoto.deleteMany()
  await prisma.workOrderComment.deleteMany()
  await prisma.laborEntry.deleteMany()
  await prisma.workOrder.deleteMany()
  await prisma.pMSchedule.deleteMany()
  await prisma.assetDependency.deleteMany()
  await prisma.asset.deleteMany()
  await prisma.department.deleteMany()
  await prisma.facility.deleteMany()
  await prisma.user.deleteMany()
  await prisma.organization.deleteMany()

  const passwordHash = await bcrypt.hash('password123', 10)

  // 1. Organization
  const org = await prisma.organization.create({
    data: {
      id: 'org-solid',
      name: 'SOLLiD Cabinetry',
      slug: 'sollid',
    },
  })
  console.log('  Created org:', org.name)

  // 2. Facility
  const facility = await prisma.facility.create({
    data: {
      id: 'fac-001',
      organization_id: org.id,
      name: 'SOLLiD Cabinetry — Main Plant',
      building_code: 'B1',
      address: '20678 84th Ave, Langley BC V2Y 0R7',
      timezone: 'America/Vancouver',
    },
  })
  console.log('  Created facility:', facility.name)

  // 3. Departments
  const departments = [
    { id: 'dep-mil', name: 'Millwork', code: 'MIL' },
    { id: 'dep-fin', name: 'Finishing', code: 'FIN' },
    { id: 'dep-fac', name: 'Facilities', code: 'FAC' },
    { id: 'dep-join', name: 'Joinery', code: 'JOIN' },
  ]
  for (const dept of departments) {
    await prisma.department.create({
      data: {
        id: dept.id,
        organization_id: org.id,
        facility_id: facility.id,
        name: dept.name,
        code: dept.code,
      },
    })
  }
  console.log('  Created', departments.length, 'departments')

  // 4. Users
  const users = [
    { id: 'usr-admin', full_name: 'Matt Mullett', email: 'matt@solidcabinetry.com', role: 'admin', phone: '604-555-0101' },
    { id: 'usr-mgr1', full_name: 'Dan Cooper', email: 'dan@solidcabinetry.com', role: 'manager', phone: '604-555-0102' },
    { id: 'usr-tech1', full_name: 'Jake Morrison', email: 'jake@solidcabinetry.com', role: 'technician', phone: '604-555-0103' },
    { id: 'usr-tech2', full_name: 'Sara Chen', email: 'sara@solidcabinetry.com', role: 'technician', phone: '604-555-0104' },
    { id: 'usr-tech3', full_name: 'Mike Okafor', email: 'mike@solidcabinetry.com', role: 'technician', phone: '604-555-0105' },
    { id: 'usr-tech4', full_name: 'Priya Nair', email: 'priya@solidcabinetry.com', role: 'technician' },
    { id: 'usr-tech5', full_name: 'Tom Larsen', email: 'tom@solidcabinetry.com', role: 'technician' },
    { id: 'usr-req1', full_name: 'Lisa Park', email: 'lisa@solidcabinetry.com', role: 'requester', is_active: false },
  ]
  for (const u of users) {
    await prisma.user.create({
      data: {
        id: u.id,
        organization_id: org.id,
        email: u.email,
        password_hash: passwordHash,
        full_name: u.full_name,
        role: u.role,
        is_active: u.is_active !== false,
        phone: u.phone,
      },
    })
  }
  console.log('  Created', users.length, 'users')

  // 5. Assets
  const assets = [
    {
      id: 'ast-001', department_id: 'dep-mil',
      facility_asset_id: 'SC-B1-MIL-EDGE-EDGE_BANDER-C1-01', asset_number: 'SLD-EB-0001',
      name: 'Edge Bander #1', description: 'Homag Edgeteq S-500 edge banding machine',
      manufacturer: 'Homag', model: 'Edgeteq S-500', serial_number: 'HMG-2019-44821', year_installed: 2019,
      company_code: 'SC', building_code: 'B1', department_code: 'MIL',
      system_type: 'EDGE', unit_type: 'EDGE_BANDER', dependency_code: 'C', dependency_group: 1, sequence: 1,
      status: 'operational', location_notes: 'West wall, Millwork bay A',
    },
    {
      id: 'ast-002', department_id: 'dep-mil',
      facility_asset_id: 'SC-B1-MIL-CNC-ROVER-C2-01', asset_number: 'SLD-ROV-0001',
      name: 'Rover CNC #1', description: 'Biesse Rover A CNC machining center',
      manufacturer: 'Biesse', model: 'Rover A 1532', serial_number: 'BSS-2021-88231', year_installed: 2021,
      company_code: 'SC', building_code: 'B1', department_code: 'MIL',
      system_type: 'CNC', unit_type: 'ROVER', dependency_code: 'C', dependency_group: 2, sequence: 1,
      status: 'down', location_notes: 'Center of Millwork bay B',
    },
    {
      id: 'ast-003', department_id: 'dep-mil',
      facility_asset_id: 'SC-B1-MIL-CNC-SKILL-C3-01', asset_number: 'SLD-SKL-0001',
      name: 'Skill CNC Router #1', description: 'SCM Skill 1200 CNC router',
      manufacturer: 'SCM', model: 'Skill 1200', serial_number: 'SCM-2018-55102', year_installed: 2018,
      company_code: 'SC', building_code: 'B1', department_code: 'MIL',
      system_type: 'CNC', unit_type: 'SKILL', dependency_code: 'C', dependency_group: 3, sequence: 1,
      status: 'maintenance', location_notes: 'Millwork bay B, south end',
    },
    {
      id: 'ast-004', department_id: 'dep-mil',
      facility_asset_id: 'SC-B1-MIL-CNC-BEAM_SAW-C5-01', asset_number: 'SLD-BSW-0001',
      name: 'Beam Saw #1', description: 'Selco WNT 660 beam saw',
      manufacturer: 'Selco', model: 'WNT 660', serial_number: 'SLC-2020-77340', year_installed: 2020,
      company_code: 'SC', building_code: 'B1', department_code: 'MIL',
      system_type: 'CNC', unit_type: 'BEAM_SAW', dependency_code: 'C', dependency_group: 5, sequence: 1,
      status: 'operational', location_notes: 'Receiving end, Millwork bay A',
    },
    {
      id: 'ast-005', department_id: 'dep-join',
      facility_asset_id: 'SC-B1-JOIN-JOIN-DOVETAILER-C6-01', asset_number: 'SLD-DVT-0001',
      name: 'Dovetailer #1', description: 'Casadei dovetail joinery machine',
      manufacturer: 'Casadei', model: 'DT-500', serial_number: 'CSD-2017-33901', year_installed: 2017,
      company_code: 'SC', building_code: 'B1', department_code: 'JOIN',
      system_type: 'JOIN', unit_type: 'DOVETAILER', dependency_code: 'C', dependency_group: 6, sequence: 1,
      status: 'operational', location_notes: 'Joinery bay',
    },
    {
      id: 'ast-006', department_id: 'dep-fac',
      facility_asset_id: 'SC-B1-FAC-AIR-COMPRESSOR-U1-01', asset_number: 'SLD-CMP-0001',
      name: 'Air Compressor #1', description: 'Kaeser SK 25 rotary screw compressor',
      manufacturer: 'Kaeser', model: 'SK 25', serial_number: 'KSR-2016-12044', year_installed: 2016,
      company_code: 'SC', building_code: 'B1', department_code: 'FAC',
      system_type: 'AIR', unit_type: 'COMPRESSOR', dependency_code: 'U', dependency_group: 1, sequence: 1,
      status: 'operational', location_notes: 'Mechanical room, north end',
      current_meter_value: 18420, meter_unit: 'hours', last_meter_update: new Date('2025-02-20T08:00:00Z'),
    },
    {
      id: 'ast-007', department_id: 'dep-fin',
      facility_asset_id: 'SC-B1-FIN-SPRAY-AUTO_SPRAYBOOTH-C1-01', asset_number: 'SLD-SPB-0001',
      name: 'Auto Spray Booth #1', description: 'Giardina automated spray finishing system',
      manufacturer: 'Giardina', model: 'G-Tech 2000', serial_number: 'GRD-2022-90011', year_installed: 2022,
      company_code: 'SC', building_code: 'B1', department_code: 'FIN',
      system_type: 'SPRAY', unit_type: 'AUTO_SPRAYBOOTH', dependency_code: 'C', dependency_group: 1, sequence: 1,
      status: 'operational', location_notes: 'Finishing bay, east side',
    },
    {
      id: 'ast-008', department_id: 'dep-mil',
      facility_asset_id: 'SC-B1-MIL-CNC-DRILLTEQ-C4-01', asset_number: 'SLD-DTQ-0001',
      name: 'Drillteq CNC #1', description: 'Biesse Drillteq H-650W CNC drilling and dowel insertion center',
      manufacturer: 'Biesse', model: 'Drillteq H-650W', serial_number: 'BSS-2023-11045', year_installed: 2023,
      company_code: 'SC', building_code: 'B1', department_code: 'MIL',
      system_type: 'CNC', unit_type: 'DRILLTEQ', dependency_code: 'C', dependency_group: 4, sequence: 1,
      status: 'operational', location_notes: 'Millwork bay C, centre',
    },
    {
      id: 'ast-009', department_id: 'dep-fac',
      facility_asset_id: 'SC-B1-FAC-DUST-COLLECTOR-U2-01', asset_number: 'SLD-DCL-0001',
      name: 'Dust Collector #1', description: 'Camfil Gold Series industrial dust collector',
      manufacturer: 'Camfil', model: 'Gold Series GS-6', serial_number: 'CMF-2019-30218', year_installed: 2019,
      company_code: 'SC', building_code: 'B1', department_code: 'FAC',
      system_type: 'DUST', unit_type: 'COLLECTOR', dependency_code: 'U', dependency_group: 2, sequence: 1,
      status: 'decommissioned', location_notes: 'Roof mounted, Millwork bay exhaust stack',
    },
  ]

  for (const a of assets) {
    await prisma.asset.create({
      data: {
        ...a,
        organization_id: org.id,
        facility_id: facility.id,
      },
    })
  }
  console.log('  Created', assets.length, 'assets')

  // 6. Asset Dependencies
  const dependencies = [
    // FEEDS relationships
    { dependent_id: 'ast-001', provider_id: 'ast-005', type: 'FEEDS' },
    { dependent_id: 'ast-004', provider_id: 'ast-001', type: 'FEEDS' },
    { dependent_id: 'ast-004', provider_id: 'ast-002', type: 'FEEDS' },
    { dependent_id: 'ast-004', provider_id: 'ast-003', type: 'FEEDS' },
    // DEPENDS_ON relationships
    { dependent_id: 'ast-002', provider_id: 'ast-006', type: 'DEPENDS_ON' },
    { dependent_id: 'ast-003', provider_id: 'ast-006', type: 'DEPENDS_ON' },
    { dependent_id: 'ast-008', provider_id: 'ast-006', type: 'DEPENDS_ON' },
  ]
  for (const dep of dependencies) {
    await prisma.assetDependency.create({ data: dep })
  }
  console.log('  Created', dependencies.length, 'asset dependencies')

  // 7. Work Orders
  const T = (offset: string) => {
    const d = new Date('2026-02-21T10:00:00Z')
    const match = offset.match(/([+-])(\d+)([dhm])/)
    if (!match) return d
    const [, sign, n, unit] = match
    const ms = parseInt(n) * (unit === 'd' ? 86400000 : unit === 'h' ? 3600000 : 60000)
    d.setTime(d.getTime() + (sign === '+' ? ms : -ms))
    return d
  }

  // 7. PM Schedules (before work orders since WOs reference pm_schedule_id)
  const pmSchedules = [
    {
      id: 'pm-001', asset_id: 'ast-006',
      title: 'Air Compressor — annual Kaeser service',
      description: 'Full annual service per Kaeser SK 25 service manual.',
      instructions: 'Lock out / tag out compressor\nDrain and replace compressor oil\nReplace air/oil separator element\nReplace intake air filter\nInspect and re-tension drive belt\nTest safety relief valve\nCheck all hose connections\nInspect motor mounts\nRun compressor 15 min\nUpdate service sticker',
      frequency: 'annual', estimated_hours: 3, assigned_to_id: 'usr-tech1',
      last_completed_at: new Date('2025-02-25T10:00:00Z'),
      next_due_at: new Date('2026-02-25T10:00:00Z'),
      is_active: true,
    },
    {
      id: 'pm-002', asset_id: 'ast-007',
      title: 'Auto Spray Booth — monthly intake filter replacement',
      description: 'Replace intake filters and inspect exhaust filters.',
      instructions: 'Lock out spray system\nRemove and dispose of intake filter panels\nInstall new G4 intake filter panels\nInspect exhaust filter bank\nCheck booth pressure differential\nInspect conveyor belt\nRestart system and verify pressures',
      frequency: 'monthly', estimated_hours: 1, assigned_to_id: 'usr-tech2',
      last_completed_at: new Date('2026-02-19T10:00:00Z'),
      next_due_at: new Date('2026-03-19T10:00:00Z'),
      is_active: true,
    },
    {
      id: 'pm-003', asset_id: 'ast-003',
      title: 'Skill CNC Router — monthly lubrication & axis check',
      description: 'Lubricate all linear axes, ball screws, and rack & pinion.',
      instructions: 'Clean all axis ways\nApply Mobilgrease XHP 222 to X, Y, Z linear guides\nGrease ball screws\nRun axis calibration routine\nVerify home positions within ±0.02mm\nCheck vacuum pump oil level\nInspect all air fittings for leaks',
      frequency: 'monthly', estimated_hours: 1, assigned_to_id: 'usr-tech2',
      last_completed_at: new Date('2026-01-23T09:00:00Z'),
      next_due_at: new Date('2026-02-23T09:00:00Z'),
      is_active: true,
    },
    {
      id: 'pm-004', asset_id: 'ast-006',
      title: 'Air Compressor — quarterly oil & separator check',
      description: 'Drain and replace compressor oil. Inspect separator element.',
      instructions: 'Lock out / tag out compressor\nDrain old oil\nInspect and clean oil fill port\nFill with Kaeser Sigma Fluid S-460\nInspect separator element\nCheck condensate auto-drain\nRemove LOTO and run 5 minutes\nLog oil change',
      frequency: 'quarterly', estimated_hours: 1.5, assigned_to_id: 'usr-tech1',
      last_completed_at: new Date('2025-10-15T10:00:00Z'),
      next_due_at: new Date('2026-01-15T10:00:00Z'),
      is_active: true,
    },
    {
      id: 'pm-005', asset_id: 'ast-001',
      title: 'Edge Bander — biweekly glue pot & roller cleaning',
      description: 'Clean glue pot and applicator roller. Inspect feed rollers.',
      instructions: 'Heat glue pot to 180°C and drain old glue\nClean pot interior\nInspect applicator roller for scoring\nClean all feed rollers\nCheck pressure roller pressure\nClean trimming units\nCheck end trimming saw blade\nInspect banding magazine\nRun 3 test pieces',
      frequency: 'biweekly', estimated_hours: 0.75,
      last_completed_at: new Date('2026-02-09T08:00:00Z'),
      next_due_at: new Date('2026-02-23T08:00:00Z'),
      is_active: true,
    },
    {
      id: 'pm-006', asset_id: 'ast-004',
      title: 'Beam Saw — quarterly blade inspection & alignment',
      description: 'Inspect main blade and scoring blade. Check alignment.',
      instructions: 'Lock out / tag out saw\nInspect main blade\nReplace if needed\nInspect scoring blade\nCheck main blade run-out\nVerify scoring blade alignment\nCheck fence calibration\nInspect pneumatic clamp\nClean beam rail\nLog inspection results',
      frequency: 'quarterly', estimated_hours: 2,
      last_completed_at: new Date('2025-11-21T10:00:00Z'),
      next_due_at: new Date('2026-02-21T10:00:00Z'),
      is_active: true,
    },
  ]

  for (const pm of pmSchedules) {
    await prisma.pMSchedule.create({
      data: { ...pm, organization_id: org.id },
    })
  }
  console.log('  Created', pmSchedules.length, 'PM schedules')

  // 8. Work Orders
  const workOrders = [
    {
      id: 'wo-001', work_order_number: 'WO-2026-0041', asset_id: 'ast-002',
      type: 'corrective', status: 'open', priority: 'critical',
      title: 'Rover CNC #1 — spindle drive fault (E-204)',
      description: 'Machine threw E-204 spindle drive fault and locked out mid-job.',
      failure_code: 'ELEC', requested_by_id: 'usr-tech2', assigned_to_id: 'usr-tech1',
      due_date: T('-1d'), estimated_hours: 4,
      created_at: T('-4h'), updated_at: T('-4h'),
    },
    {
      id: 'wo-002', work_order_number: 'WO-2026-0040', asset_id: 'ast-001',
      type: 'corrective', status: 'in_progress', priority: 'high',
      title: 'Edge Bander #1 — feed roller wear, reduced performance',
      description: 'Banding quality has degraded — edges lifting on 10% of pieces.',
      failure_code: 'MECH', requested_by_id: 'usr-mgr1', assigned_to_id: 'usr-tech1',
      due_date: T('+1d'), started_at: T('-2h'), estimated_hours: 3, actual_hours: 2,
      created_at: T('-1d'), updated_at: T('-1h'),
    },
    {
      id: 'wo-003', work_order_number: 'WO-2026-0039', asset_id: 'ast-003',
      type: 'preventive', status: 'on_hold', priority: 'medium',
      title: 'Skill CNC Router #1 — quarterly PM (air filters, lubrication)',
      description: 'Scheduled quarterly PM. Replace air filters, lubricate all axes.',
      requested_by_id: 'usr-mgr1', assigned_to_id: 'usr-tech2',
      due_date: T('+2d'), started_at: T('-6h'), estimated_hours: 2, actual_hours: 0.5,
      pm_schedule_id: 'pm-003',
      created_at: T('-3d'), updated_at: T('-6h'),
    },
    {
      id: 'wo-004', work_order_number: 'WO-2026-0038', asset_id: 'ast-006',
      type: 'inspection', status: 'open', priority: 'high',
      title: 'Air Compressor #1 — annual inspection & oil change',
      description: 'Annual Kaeser service: drain and replace compressor oil, check separator.',
      requested_by_id: 'usr-mgr1',
      due_date: T('+4d'), estimated_hours: 3, pm_schedule_id: 'pm-001',
      created_at: T('-7d'), updated_at: T('-7d'),
    },
    {
      id: 'wo-005', work_order_number: 'WO-2026-0037', asset_id: 'ast-007',
      type: 'preventive', status: 'completed', priority: 'low',
      title: 'Auto Spray Booth #1 — intake filter replacement',
      description: 'Monthly intake filter swap.',
      requested_by_id: 'usr-mgr1', assigned_to_id: 'usr-tech2',
      due_date: T('-2d'), started_at: T('-3d'), completed_at: T('-2d'),
      estimated_hours: 1, actual_hours: 0.75,
      action_taken: 'Replaced all 6 intake filter panels. Disposed per VOC protocol.',
      root_cause: 'lack_of_pm', pm_schedule_id: 'pm-002',
      created_at: T('-7d'), updated_at: T('-2d'),
    },
    {
      id: 'wo-006', work_order_number: 'WO-2026-0036', asset_id: 'ast-004',
      type: 'corrective', status: 'open', priority: 'medium',
      title: 'Beam Saw #1 — blade replacement (250k cut cycles)',
      description: 'Blade has reached rated cut-cycle life.',
      requested_by_id: 'usr-tech1',
      due_date: T('+5d'), estimated_hours: 1.5,
      created_at: T('-2d'), updated_at: T('-2d'),
    },
    {
      id: 'wo-007', work_order_number: 'WO-2026-0035', asset_id: 'ast-006',
      type: 'corrective', status: 'completed', priority: 'critical',
      title: 'Air Compressor #1 — emergency: pressure drop, belt slipping',
      description: 'Plant pressure dropped to 65 PSI. Belt slipping.',
      failure_code: 'MECH', cause_code: 'WEAR',
      remedy: 'Replaced drive belt and tensioner.',
      action_taken: 'Replaced drive belt and tensioner assembly. Pressure restored to 115 PSI.',
      root_cause: 'end_of_life',
      requested_by_id: 'usr-mgr1', assigned_to_id: 'usr-tech1',
      due_date: T('-8d'), started_at: T('-10d'), completed_at: T('-8d'),
      estimated_hours: 2, actual_hours: 2.5,
      created_at: T('-10d'), updated_at: T('-8d'),
    },
  ]

  for (const wo of workOrders) {
    await prisma.workOrder.create({
      data: { ...wo, organization_id: org.id },
    })
  }
  console.log('  Created', workOrders.length, 'work orders')

  // 8. Comments
  const comments = [
    { work_order_id: 'wo-002', user_id: 'usr-tech1', body: 'Checked the feed rollers — significant wear on the top roller. Ordering replacement.', created_at: T('-2h') },
    { work_order_id: 'wo-002', user_id: 'usr-mgr1', body: 'Parts ordered from supplier — ETA 2 days. Keep machine running at reduced speed.', created_at: T('-1h') },
    { work_order_id: 'wo-001', user_id: 'usr-tech2', body: 'Error code E-204 on the CNC controller. Spindle drive fault. Machine is locked out.', created_at: T('-4h') },
  ]
  for (const c of comments) {
    await prisma.workOrderComment.create({ data: c })
  }
  console.log('  Created', comments.length, 'comments')

  // 9. Labor Entries
  const laborEntries = [
    { work_order_id: 'wo-002', user_id: 'usr-tech1', hours: 1.5, date: '2026-02-20', notes: 'Inspected feed rollers, confirmed top roller wear exceeds tolerance' },
    { work_order_id: 'wo-002', user_id: 'usr-tech1', hours: 0.5, date: '2026-02-21', notes: 'Ordered replacement roller, documented failure mode' },
    { work_order_id: 'wo-007', user_id: 'usr-tech1', hours: 2.5, date: '2026-02-11', notes: 'Diagnosed belt slippage, replaced drive belt and tensioner.' },
    { work_order_id: 'wo-005', user_id: 'usr-tech2', hours: 0.75, date: '2026-02-19', notes: 'Swapped all intake filter panels, disposed per VOC protocol' },
  ]
  for (const le of laborEntries) {
    await prisma.laborEntry.create({ data: le })
  }
  console.log('  Created', laborEntries.length, 'labor entries')

  // 10. Parts
  const parts = [
    { id: 'prt-001', part_number: 'HOM-250190', name: 'EB Feed Roller', description: 'Homag edge bander feed roller assembly', manufacturer: 'Homag', vendor: 'Stiles Machinery', vendor_part_number: 'STL-250190', unit_of_measure: 'ea', unit_cost: 148.50, quantity_on_hand: 3, quantity_reserved: 1, reorder_point: 2, reorder_quantity: 4, status: 'in_stock', location: 'Shelf B3, Row 2' },
    { id: 'prt-002', part_number: 'KAE-6.4404.0', name: 'Compressor Air Filter', description: 'Kaeser SK 25 intake air filter element', manufacturer: 'Kaeser', vendor: 'Compressor World', vendor_part_number: 'CW-64404', unit_of_measure: 'ea', unit_cost: 42.00, quantity_on_hand: 4, quantity_reserved: 0, reorder_point: 2, reorder_quantity: 6, status: 'in_stock', location: 'Shelf A1, Row 1' },
    { id: 'prt-003', part_number: 'KAE-6.3305.0', name: 'Compressor Oil 10L', description: 'Kaeser Sigma fluid compressor oil', manufacturer: 'Kaeser', vendor: 'Compressor World', vendor_part_number: 'CW-63305', unit_of_measure: 'ea', unit_cost: 89.00, quantity_on_hand: 1, quantity_reserved: 1, reorder_point: 2, reorder_quantity: 4, status: 'out_of_stock', location: 'Shelf A1, Row 2' },
    { id: 'prt-004', part_number: 'BSS-F30-BELT', name: 'Rover Spindle V-Belt', description: 'Biesse Rover CNC spindle drive V-belt', manufacturer: 'Biesse', vendor: 'Stiles Machinery', vendor_part_number: 'STL-F30-BELT', unit_of_measure: 'ea', unit_cost: 62.00, quantity_on_hand: 0, quantity_reserved: 0, reorder_point: 2, reorder_quantity: 4, status: 'on_order', location: 'Shelf C2, Row 1' },
    { id: 'prt-005', part_number: 'HOM-G2700', name: 'EB Glue Adhesive 5kg', description: 'Homag Adhesive System G2700 EVA hot melt glue', manufacturer: 'Homag', vendor: 'Stiles Machinery', vendor_part_number: 'STL-G2700', unit_of_measure: 'ea', unit_cost: 38.50, quantity_on_hand: 6, quantity_reserved: 0, reorder_point: 3, reorder_quantity: 12, status: 'in_stock', location: 'Shelf B3, Row 1' },
    { id: 'prt-006', part_number: 'FAG-6205ZZ', name: 'Bearing 6205ZZ', description: 'FAG deep groove ball bearing 6205ZZ', manufacturer: 'FAG', vendor: 'Motion Industries', vendor_part_number: 'MOT-6205ZZ', unit_of_measure: 'ea', unit_cost: 14.75, quantity_on_hand: 8, quantity_reserved: 2, reorder_point: 4, reorder_quantity: 12, status: 'in_stock', location: 'Shelf D1, Row 3' },
    { id: 'prt-007', part_number: 'HOM-250193', name: 'EB Scraper Blade', description: 'Homag edge bander scraper blade', manufacturer: 'Homag', vendor: 'Stiles Machinery', vendor_part_number: 'STL-250193', unit_of_measure: 'ea', unit_cost: 26.00, quantity_on_hand: 2, quantity_reserved: 0, reorder_point: 2, reorder_quantity: 6, status: 'low_stock', location: 'Shelf B3, Row 3' },
    { id: 'prt-008', part_number: 'KAE-6.3540.0', name: 'Compressor V-Belt', description: 'Kaeser SK 25 main drive V-belt', manufacturer: 'Kaeser', vendor: 'Compressor World', vendor_part_number: 'CW-63540', unit_of_measure: 'ea', unit_cost: 55.00, quantity_on_hand: 2, quantity_reserved: 0, reorder_point: 1, reorder_quantity: 3, status: 'in_stock', location: 'Shelf A1, Row 3' },
    { id: 'prt-009', part_number: 'CAM-F24X24X2', name: 'Spray Booth Filter 24x24', description: 'Camfil intake filter panel 24x24x2 MERV 8', manufacturer: 'Camfil', vendor: 'Industrial Air Filtration', vendor_part_number: 'IAF-F24242', unit_of_measure: 'ea', unit_cost: 18.00, quantity_on_hand: 12, quantity_reserved: 3, reorder_point: 6, reorder_quantity: 24, status: 'in_stock', location: 'Shelf E2, Row 1' },
    { id: 'prt-010', part_number: 'IMS-ER32-10', name: 'CNC Collet ER32 10mm', description: 'ER32 precision collet 10mm', manufacturer: 'Iscar', vendor: 'MSC Industrial', vendor_part_number: 'MSC-ER32-10', unit_of_measure: 'ea', unit_cost: 32.00, quantity_on_hand: 0, quantity_reserved: 0, reorder_point: 3, reorder_quantity: 6, status: 'out_of_stock', location: 'Shelf C1, Row 2' },
  ]

  for (const p of parts) {
    await prisma.part.create({
      data: { ...p, organization_id: org.id },
    })
  }
  console.log('  Created', parts.length, 'parts')

  // 12. Asset-Part compatibility
  const assetParts = [
    { asset_id: 'ast-001', part_id: 'prt-001' },
    { asset_id: 'ast-006', part_id: 'prt-002' },
    { asset_id: 'ast-006', part_id: 'prt-003' },
    { asset_id: 'ast-002', part_id: 'prt-004' },
    { asset_id: 'ast-001', part_id: 'prt-005' },
    { asset_id: 'ast-001', part_id: 'prt-006' },
    { asset_id: 'ast-002', part_id: 'prt-006' },
    { asset_id: 'ast-003', part_id: 'prt-006' },
    { asset_id: 'ast-004', part_id: 'prt-006' },
    { asset_id: 'ast-001', part_id: 'prt-007' },
    { asset_id: 'ast-006', part_id: 'prt-008' },
    { asset_id: 'ast-007', part_id: 'prt-009' },
    { asset_id: 'ast-002', part_id: 'prt-010' },
    { asset_id: 'ast-003', part_id: 'prt-010' },
  ]
  for (const ap of assetParts) {
    await prisma.assetPart.create({ data: ap })
  }
  console.log('  Created', assetParts.length, 'asset-part links')

  // 13. Part Reservations
  const reservations = [
    { part_id: 'prt-001', work_order_id: 'wo-002', quantity_reserved: 1, reserved_by_id: 'usr-tech1' },
    { part_id: 'prt-003', work_order_id: 'wo-004', quantity_reserved: 1, reserved_by_id: 'usr-mgr1' },
    { part_id: 'prt-006', work_order_id: 'wo-001', quantity_reserved: 2, reserved_by_id: 'usr-tech2' },
    { part_id: 'prt-009', work_order_id: 'wo-006', quantity_reserved: 3, reserved_by_id: 'usr-mgr1' },
  ]
  for (const r of reservations) {
    await prisma.partReservation.create({ data: r })
  }
  console.log('  Created', reservations.length, 'part reservations')

  // 14. Config Items (settings)
  const configCategories: { category: string; items: { key: string; label: string; sort_order: number; is_default: boolean; is_active: boolean; color?: string; extra?: Record<string, unknown> }[] }[] = [
    { category: 'asset_status', items: [
      { key: 'operational', label: 'Operational', sort_order: 1, is_default: true, is_active: true, color: '#22c55e' },
      { key: 'down', label: 'Down', sort_order: 2, is_default: false, is_active: true, color: '#ef4444' },
      { key: 'maintenance', label: 'Maintenance', sort_order: 3, is_default: false, is_active: true, color: '#f59e0b' },
      { key: 'decommissioned', label: 'Decommissioned', sort_order: 4, is_default: false, is_active: true, color: '#94a3b8' },
    ]},
    { category: 'wo_priority', items: [
      { key: 'critical', label: 'Critical', sort_order: 1, is_default: false, is_active: true, color: '#dc2626', extra: { due_offset_days: 1 } },
      { key: 'high', label: 'High', sort_order: 2, is_default: false, is_active: true, color: '#ea580c', extra: { due_offset_days: 3 } },
      { key: 'medium', label: 'Medium', sort_order: 3, is_default: true, is_active: true, color: '#ca8a04', extra: { due_offset_days: 7 } },
      { key: 'low', label: 'Low', sort_order: 4, is_default: false, is_active: true, color: '#16a34a', extra: { due_offset_days: 14 } },
    ]},
    { category: 'wo_status', items: [
      { key: 'open', label: 'Open', sort_order: 1, is_default: true, is_active: true, color: '#3b82f6' },
      { key: 'in_progress', label: 'In Progress', sort_order: 2, is_default: false, is_active: true, color: '#f59e0b' },
      { key: 'on_hold', label: 'On Hold', sort_order: 3, is_default: false, is_active: true, color: '#8b5cf6' },
      { key: 'completed', label: 'Completed', sort_order: 4, is_default: false, is_active: true, color: '#22c55e' },
      { key: 'cancelled', label: 'Cancelled', sort_order: 5, is_default: false, is_active: true, color: '#94a3b8' },
    ]},
    { category: 'wo_type', items: [
      { key: 'corrective', label: 'Corrective', sort_order: 1, is_default: true, is_active: true },
      { key: 'preventive', label: 'Preventive', sort_order: 2, is_default: false, is_active: true },
      { key: 'inspection', label: 'Inspection', sort_order: 3, is_default: false, is_active: true },
      { key: 'project', label: 'Project', sort_order: 4, is_default: false, is_active: true },
      { key: 'safety', label: 'Safety', sort_order: 5, is_default: false, is_active: true },
    ]},
    { category: 'pm_frequency', items: [
      { key: 'daily', label: 'Daily', sort_order: 1, is_default: false, is_active: true },
      { key: 'weekly', label: 'Weekly', sort_order: 2, is_default: false, is_active: true },
      { key: 'biweekly', label: 'Bi-Weekly', sort_order: 3, is_default: false, is_active: true },
      { key: 'monthly', label: 'Monthly', sort_order: 4, is_default: true, is_active: true },
      { key: 'quarterly', label: 'Quarterly', sort_order: 5, is_default: false, is_active: true },
      { key: 'semiannual', label: 'Semi-Annual', sort_order: 6, is_default: false, is_active: true },
      { key: 'annual', label: 'Annual', sort_order: 7, is_default: false, is_active: true },
      { key: 'meter_based', label: 'Meter-Based', sort_order: 8, is_default: false, is_active: true },
    ]},
  ]

  let configCount = 0
  for (const { category, items } of configCategories) {
    for (const item of items) {
      await prisma.configItem.create({
        data: { ...item, extra: item.extra ? (item.extra as Prisma.InputJsonValue) : undefined, organization_id: org.id, category },
      })
      configCount++
    }
  }
  console.log('  Created', configCount, 'config items')

  // 15. Crews
  const crews = [
    { id: 'crew-1', name: 'Day Shift A', lead_user_id: 'usr-tech1', members: ['usr-tech1', 'usr-tech2', 'usr-tech3'] },
    { id: 'crew-2', name: 'Day Shift B', lead_user_id: 'usr-tech4', members: ['usr-tech4', 'usr-tech5'] },
    { id: 'crew-3', name: 'Management', lead_user_id: 'usr-mgr1', members: ['usr-admin', 'usr-mgr1'] },
  ]

  for (const c of crews) {
    await prisma.crew.create({
      data: {
        id: c.id,
        organization_id: org.id,
        name: c.name,
        lead_user_id: c.lead_user_id,
        members: {
          create: c.members.map((uid) => ({ user_id: uid })),
        },
      },
    })
  }
  console.log('  Created', crews.length, 'crews')

  console.log('\nSeed complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
