export interface PlatformMockData {
  connectedAs: string
  entities: Record<string, { count: number; label: string }>
  fieldMappingNotes: string[]
  sampleRecord: {
    platformLabel: string
    source: Record<string, string>
    mapped: Record<string, string>
  }
}

export const PLATFORM_MOCK_DATA: Record<string, PlatformMockData> = {
  maintainx: {
    connectedAs: 'admin@sollid.com',
    entities: {
      assets:       { count: 247,  label: 'Assets' },
      work_orders:  { count: 1847, label: 'Work Orders' },
      pm_schedules: { count: 89,   label: 'PM Schedules' },
      parts:        { count: 412,  label: 'Parts' },
      locations:    { count: 23,   label: 'Locations' },
      users:        { count: 8,    label: 'Users' },
    },
    fieldMappingNotes: [
      'Priority: Urgent → Emergency, High → High, Medium → Medium, Low → Low, None → Low',
      'Work Order type "Reactive" maps to "corrective"',
      'Work Order type "Preventive" maps to "preventive"',
      'Asset "Category" maps to assetZ "Department" field',
      'MaintainX "Location" maps to assetZ "Location" — verify building codes after import',
    ],
    sampleRecord: {
      platformLabel: 'From MaintainX',
      source: {
        'Asset Name':   'Edge Bander #1',
        'Category':     'Millroom',
        'Location':     'Building 1',
        'Serial':       'EB-2019-0042',
        'Make':         'Homag',
        'Model':        'Ambition 1463 FK',
        'Status':       'Active',
      },
      mapped: {
        'name':         'Edge Bander #1',
        'department':   'Millroom',
        'location':     'Building 1',
        'serial_number':'EB-2019-0042',
        'manufacturer': 'Homag',
        'model':        'Ambition 1463 FK',
        'status':       'operational',
      },
    },
  },

  asset_essentials: {
    connectedAs: 'mmullett@sollid.com',
    entities: {
      assets:       { count: 180,  label: 'Assets' },
      work_orders:  { count: 2100, label: 'Work Orders' },
      pm_schedules: { count: 120,  label: 'PM Schedules' },
      parts:        { count: 300,  label: 'Parts' },
      locations:    { count: 15,   label: 'Locations' },
      users:        { count: 12,   label: 'Users' },
    },
    fieldMappingNotes: [
      'Status "Submitted" maps to assetZ "open"',
      'Status "Assigned" maps to assetZ "in_progress"',
      'Status "Completed" maps to assetZ "completed"',
      'WO "Problem Code" stored in assetZ description field',
      'Asset "Equipment Class" maps to assetZ "department" — review after import',
    ],
    sampleRecord: {
      platformLabel: 'From Asset Essentials',
      source: {
        'Equipment Name':   'CNC Router 1',
        'Equipment Class':  'CNC',
        'Facility':         'SOLLiD Cabinetry',
        'Serial Number':    'CNC-0017',
        'Manufacturer':     'Biesse',
        'Model Number':     'Rover B 7.35',
        'Equipment Status': 'Active',
      },
      mapped: {
        'name':         'CNC Router 1',
        'department':   'CNC',
        'location':     'SOLLiD Cabinetry',
        'serial_number':'CNC-0017',
        'manufacturer': 'Biesse',
        'model':        'Rover B 7.35',
        'status':       'operational',
      },
    },
  },

  upkeep: {
    connectedAs: 'admin@sollid.com',
    entities: {
      assets:       { count: 95,  label: 'Assets' },
      work_orders:  { count: 780, label: 'Work Orders' },
      pm_schedules: { count: 45,  label: 'PM Schedules' },
      parts:        { count: 210, label: 'Parts' },
      locations:    { count: 8,   label: 'Locations' },
      users:        { count: 5,   label: 'Users' },
    },
    fieldMappingNotes: [
      'UpKeep uses "Asset" and "Sub-Asset" hierarchy — sub-assets import as separate records',
      'Priority "Very High" maps to assetZ "critical"',
      'Work Request type maps to assetZ "corrective"',
      '"Meter Readings" data will not be imported in this version',
    ],
    sampleRecord: {
      platformLabel: 'From UpKeep',
      source: {
        'Asset Name':   'Spray Booth 1',
        'Parent Asset': 'Finishing Line',
        'Location':     'Finishing',
        'Serial':       'SB-2020-001',
        'Manufacturer': 'Global Finishing',
        'Model':        'Ultra Series',
        'Active':       'Yes',
      },
      mapped: {
        'name':         'Spray Booth 1',
        'department':   'Finishing',
        'location':     'Finishing',
        'serial_number':'SB-2020-001',
        'manufacturer': 'Global Finishing',
        'model':        'Ultra Series',
        'status':       'operational',
      },
    },
  },

  fiix: {
    connectedAs: 'admin@sollid.com',
    entities: {
      assets:       { count: 310,  label: 'Assets' },
      work_orders:  { count: 3400, label: 'Work Orders' },
      pm_schedules: { count: 200,  label: 'PM Schedules' },
      parts:        { count: 890,  label: 'Parts' },
      locations:    { count: 40,   label: 'Locations' },
      users:        { count: 22,   label: 'Users' },
    },
    fieldMappingNotes: [
      'Fiix uses a multi-level site hierarchy — all levels flatten to assetZ "location"',
      'Custom fields will be stored in assetZ "notes" field as JSON',
      'Fiix "Maintenance Type" maps to assetZ WO "type" field',
      '"Failure Code" and "Cause Code" preserved in WO description',
      'Fiix purchase order data not imported — parts unit costs brought over only',
    ],
    sampleRecord: {
      platformLabel: 'From Fiix',
      source: {
        'Asset Name':         'Dust Collector A',
        'Asset Code':         'DC-B1-001',
        'Site':               'SOLLiD - Building 1',
        'Department':         'Facilities',
        'Serial Number':      'DC2018-4421',
        'Manufacturer':       'Donaldson',
        'Model':              'Torit DCE 3-12',
        'Operational Status': 'Running',
      },
      mapped: {
        'name':         'Dust Collector A',
        'facility_asset_id': 'DC-B1-001',
        'location':     'SOLLiD - Building 1',
        'department':   'Facilities',
        'serial_number':'DC2018-4421',
        'manufacturer': 'Donaldson',
        'model':        'Torit DCE 3-12',
        'status':       'operational',
      },
    },
  },

  limble: {
    connectedAs: 'admin@sollid.com',
    entities: {
      assets:       { count: 156,  label: 'Assets' },
      work_orders:  { count: 1200, label: 'Work Orders' },
      pm_schedules: { count: 67,   label: 'PM Schedules' },
      parts:        { count: 340,  label: 'Parts' },
      locations:    { count: 18,   label: 'Locations' },
      users:        { count: 9,    label: 'Users' },
    },
    fieldMappingNotes: [
      'Limble "Asset Group" maps to assetZ "department"',
      'Priority scale 1–5 maps to: 1→low, 2→low, 3→medium, 4→high, 5→critical',
      '"Assigned Teams" maps to individual "Assigned To" — first team member used',
      'Limble custom PM triggers map to assetZ "meter_based" frequency where applicable',
    ],
    sampleRecord: {
      platformLabel: 'From Limble',
      source: {
        'Asset':        'Air Compressor 1',
        'Asset Group':  'Air Systems',
        'Location':     'Utility Room',
        'Serial #':     'AC-2017-09',
        'Manufacturer': 'Sullair',
        'Model':        'S-Energy 30L',
        'Status':       'Online',
      },
      mapped: {
        'name':         'Air Compressor 1',
        'department':   'Air Systems',
        'location':     'Utility Room',
        'serial_number':'AC-2017-09',
        'manufacturer': 'Sullair',
        'model':        'S-Energy 30L',
        'status':       'operational',
      },
    },
  },
}

export const PLATFORM_META: Record<string, {
  label: string
  tagline: string
  colorClass: string
  bgClass: string
  borderClass: string
  hoverBorderClass: string
  textClass: string
}> = {
  maintainx: {
    label: 'MaintainX',
    tagline: 'The #1 rated CMMS platform',
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-600',
    borderClass: 'border-blue-200',
    hoverBorderClass: 'hover:border-blue-400',
    textClass: 'text-blue-600',
  },
  asset_essentials: {
    label: 'Asset Essentials',
    tagline: 'Brightly / Dude Solutions',
    colorClass: 'text-green-600',
    bgClass: 'bg-green-600',
    borderClass: 'border-green-200',
    hoverBorderClass: 'hover:border-green-400',
    textClass: 'text-green-600',
  },
  upkeep: {
    label: 'UpKeep',
    tagline: 'Simple maintenance management',
    colorClass: 'text-orange-500',
    bgClass: 'bg-orange-500',
    borderClass: 'border-orange-200',
    hoverBorderClass: 'hover:border-orange-400',
    textClass: 'text-orange-500',
  },
  fiix: {
    label: 'Fiix',
    tagline: 'Enterprise maintenance platform',
    colorClass: 'text-purple-600',
    bgClass: 'bg-purple-600',
    borderClass: 'border-purple-200',
    hoverBorderClass: 'hover:border-purple-400',
    textClass: 'text-purple-600',
  },
  limble: {
    label: 'Limble',
    tagline: 'Modern CMMS for all industries',
    colorClass: 'text-teal-600',
    bgClass: 'bg-teal-600',
    borderClass: 'border-teal-200',
    hoverBorderClass: 'hover:border-teal-400',
    textClass: 'text-teal-600',
  },
}
