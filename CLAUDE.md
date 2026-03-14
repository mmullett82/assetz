# assetZ — AI-Native CMMS for Manufacturing

## Project Overview

assetZ is a Computerized Maintenance Management System (CMMS) built by chaiT, designed specifically for manufacturing environments. It combines a traditional CMMS data engine with an AI agent as the primary interface, graph-native asset relationship intelligence, and intelligent facility floor plans with real-time status visualization.

**Team:**
- Matt — Product, frontend (Next.js), maintenance domain expert (maintenance manager at SOLLiD Cabinetry)
- Grant — Backend, data engineering (Python/FastAPI, PostgreSQL, 10 years Python/SQL)

**This repo is the frontend.** The backend is a separate Python/FastAPI repo managed by Grant.

## Tech Stack

### Frontend (this repo)
- **Framework:** Next.js (React) with TypeScript
- **Styling:** Tailwind CSS
- **Mobile:** PWA (Progressive Web App) for mobile parity — no separate native app
- **State Management:** React Context + hooks for local state, SWR or React Query for server state
- **Real-Time:** WebSocket connections to backend for live dashboard/floor plan updates
- **Charts/KPIs:** Recharts for dashboards and trend visualization
- **Floor Plans:** SVG-based interactive floor plan viewer with DXF-to-SVG conversion pipeline, dark CAD theme
- **Barcode Scanning:** Web-based camera API for QR/barcode scanning on mobile
- **AI Chat Interface:** Collapsible sidebar chat panel + inline smart prompt components

### Backend (Grant's repo — for context only)
- **Framework:** Python / FastAPI
- **Database:** PostgreSQL (relational) + Kuzu (embedded graph database, Cypher queries)
- **AI:** Claude API (Anthropic) for agent chat, NL queries, PM generation
- **Doc Ingestion:** graphX engine for equipment manual processing
- **Real-Time:** Redis pub/sub → WebSocket broadcast
- **Auth:** JWT tokens, role-based access (admin, manager, technician, requester)
- **Multi-Tenancy:** organization_id on every record, all queries scoped

### Hosting & Deployment
- **Frontend:** Vercel — https://assetz-i9pa.vercel.app
- **Backend:** Railway or AWS (Grant's decision)
- **Production Database:** Neon PostgreSQL
  - Connection string: `postgresql://neondb_owner:npg_ZhY8OWTjRqb4@ep-wild-cake-akxz0l5i.c-3.us-west-2.aws.neon.tech/neondb?sslmode=require`
  - Set as `DATABASE_URL` environment variable in Vercel
- **Local Database:** Docker PostgreSQL (`localhost:5432/assetz`)

### ⚠️ CRITICAL: After ANY Prisma Migration
**Every time a Prisma migration is created locally, it MUST also be applied to Neon production.**
Otherwise the deployed site will break (API queries fail on missing tables/columns, cascading into empty lists and "not found" errors on all pages).

```bash
# Apply pending migrations to Neon production:
DATABASE_URL="postgresql://neondb_owner:npg_ZhY8OWTjRqb4@ep-wild-cake-akxz0l5i.c-3.us-west-2.aws.neon.tech/neondb?sslmode=require" npx prisma migrate deploy

# Re-seed Neon with latest data (if seed.ts was updated):
DATABASE_URL="postgresql://neondb_owner:npg_ZhY8OWTjRqb4@ep-wild-cake-akxz0l5i.c-3.us-west-2.aws.neon.tech/neondb?sslmode=require" npx tsx prisma/seed.ts
```

**DO NOT** run `git add .`, `git commit`, or `git push` — Matt handles all git operations.

## Project Structure

```
assetz/
├── CLAUDE.md                # This file — project memory
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── (auth)/          # Login, register pages
│   │   ├── (dashboard)/     # Main app layout (authenticated)
│   │   │   ├── dashboard/   # KPI dashboard with real-time updates
│   │   │   ├── assets/      # Asset registry, detail views
│   │   │   ├── work-orders/ # WO list, detail, creation
│   │   │   ├── pm/          # PM schedule management
│   │   │   ├── parts/       # Parts inventory
│   │   │   ├── floor-plan/  # Interactive facility floor plan
│   │   │   ├── reports/     # Reports and scoreboard
│   │   │   └── settings/    # Config, users, org settings
│   │   └── onboarding/      # AI-guided setup wizard
│   ├── components/
│   │   ├── ui/              # Base UI components (buttons, inputs, cards, modals)
│   │   ├── layout/          # Shell, sidebar nav, header
│   │   ├── dashboard/       # KPI cards, charts, scoreboard
│   │   ├── assets/          # Asset cards, detail panels, forms
│   │   ├── work-orders/     # WO cards, status badges, forms
│   │   ├── floor-plan/      # Floor plan viewer, asset pins, zone overlays
│   │   ├── parts/           # Parts list, availability badges, reservation UI
│   │   ├── agent/           # AI chat sidebar, smart prompt bubbles
│   │   └── onboarding/      # Onboarding step components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions, API client, WebSocket manager
│   ├── types/               # TypeScript interfaces matching backend schema
│   └── styles/              # Global styles, Tailwind config
├── public/
│   └── assets/
│       └── equipment-icons/ # Blueprint-style SVG equipment footprints for map
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

## Key Architecture Decisions

### 1. Smart ID System
assetZ auto-generates two types of IDs:

**Facility Asset ID** — structured, human-readable:
`[Company]-[Building]-[Department]-[SystemType]-[UnitType]-[DependencyCode][Group]-[Sequence]`

Rules:
- Dashes (`-`) are STRICTLY field separators only
- Underscores (`_`) handle multi-word values within a field (e.g., `EDGE_BANDER`, `AUTO_SPRAYBOOTH`)
- Department code = physical location of asset, NOT equipment category
- Dependency codes:
  - `L` = Production Line — equipment is directly coupled, one stops the line stops
  - `C` = Independent Cell — group of same-type equipment, not mechanically dependent
  - `U` = Utility — serves multiple departments (compressors, dust collection, HVAC)
- Cell numbers are sequential per equipment type per department (C1 = first type, C2 = second type). Only one cell number per equipment type per department. Cell numbers reset per department.

Examples:
```
SC-B1-MIL-EDGE-EDGE_BANDER-C1-01
SC-B1-MIL-CNC-ROVER-C2-01
SC-B1-MIL-CNC-SKILL-C3-01
SC-B1-MIL-CNC-DRILLTEQ-C4-01
SC-B1-MIL-CNC-BEAM_SAW-C5-01
SC-B1-MIL-JOIN-DOVETAILER-C6-01
SC-B1-FIN-SPRAY-AUTO_SPRAYBOOTH-C1-01   ← Finishing has its own C1
SC-B1-FAC-AIR-COMPRESSOR-U1-01
```

**IMPORTANT:** The "C3" in `SC-B1-MIL-CNC-ROVER-C3-04` means Cell 3 in the Mill department — it is NOT a map grid coordinate. Cell refers to a logical grouping of same-type equipment within a department. The alphanumeric grid location on the floor plan (e.g., "C-7") is a separate field entirely.

**Asset Number / Barcode** — short, sequential, scannable:
`[CompanyPrefix]-[TypeCode]-[4-digit sequence]`
Asset number = barcode number (always the same value).
Examples: `SLD-ROV-0001`, `SLD-EB-0001`

**Part Numbers:** Manufacturer part number = system part number. No internal numbering.

### 2. Two-Tier Dependency Model (Graph)
- **DEPENDS_ON** = Direct/mechanical. Machine B cannot run if Machine A is down. Line (L) equipment only. Immediate red alert.
- **FEEDS** = Indirect/operational. Asset output feeds another department with a time buffer. Cell (C) and Utility (U) assets. Yellow warning with countdown based on buffer time.

### 3. AI Agent — Dual Interface
- **Sidebar Chat (collapsible):** Open-ended conversations, complex queries, setup, troubleshooting
- **Inline Smart Prompts:** Contextual suggestions appearing naturally during workflows. Non-intrusive, dismissable, one-tap actionable.

### 4. Real-Time via WebSocket
Dashboard KPIs, floor plan asset status, notifications, and in-WO updates all push via WebSocket. No polling. No manual refresh. This directly solves the sync issues found in Asset Essentials.

### 5. Red/Yellow/Green Status System
Measured against DUE DATE, not creation date:
- 🟢 Green: On-time completion OR 3+ days remaining
- 🟡 Yellow: 1–2 days remaining
- 🔴 Red: Past due

### 6. Stoplight Visual Design
Stoplights render like REAL traffic signals — all three circles (red, yellow, green) are always visible. The active status is full brightness with a subtle glow effect. The inactive circles are dim (~15-20% opacity) but still present. This applies to:
- Technician scoreboard rows (each tech has a stoplight)
- TV/kiosk mode (large stoplights, highly visible across the shop floor)
- Any status indicator that uses the stoplight metaphor

This is NOT a single colored dot. It is three stacked circles where only one is "lit."

### 7. In-App Chat & Voice-to-Text
**Chat/Messaging:**
- In-app messaging with threaded conversations per work order (like MaintainX — their #1 rated feature)
- Direct messages between techs, managers, requesters
- @mentions in comments
- Photo/video attachments in chat threads
- Notification preferences per user

**Voice-to-Text (critical for manufacturing floor use):**
- Microphone button available on ALL text input fields throughout the app — not just chat
- Use cases: chat messages, WO completion notes, WO comments, PM task descriptions, search, asset notes
- Manufacturing context: techs have dirty/greasy hands, wear gloves, stand next to running machines. Typing on a phone is impractical. Voice input is the primary input method on the floor.
- AI-assisted voice processing: tech says "finished replacing the drive belt on Rover 3, took about 45 minutes, used one Gates belt from the parts room" → AI structures into: action taken, time logged (45 min), parts consumed (1x Gates belt). No manual form filling.
- Voice-to-summary on completed WOs: tech records voice note → AI structures into formatted completion summary

### 8. Asset Reference Cards (Quick Reference Guides)
Every asset can have a **Reference Card** — a structured quick-reference document that surfaces automatically inside any work order for that asset. When a tech opens a WO, the reference card is one tap away (collapsible panel or tab within the WO detail view).

**Reference Card contents:**
- Standard PM procedures and checklists for this specific asset
- Safety warnings and lockout/tagout requirements
- Common failure modes and their fixes
- Recommended spare parts with part numbers
- Lubrication points and schedules
- Belt/filter replacement intervals and specs
- Photos of key maintenance points (e.g., "grease fitting is HERE")
- Links to full manufacturer manuals (stored in graphX document system)
- Troubleshooting decision tree (if symptom X → check Y first)

**How it gets built:**
- Maintenance teams create reference cards per asset or per asset MODEL (so one card covers all 4 Biesse Rovers)
- Upload PDFs, images, or fill in structured templates within assetZ
- Cards are living documents — editable, versioned, with change history

**AI Enhancement (future):**
- AI reads the full manufacturer manual (via graphX) and auto-generates a draft reference card
- AI assistant in WO context can answer questions using the reference card + manual as knowledge base
- Two modes when AI assists on a WO:
  - **Fix Only** — Quick answer, get the machine running, minimal explanation. For time-critical situations.
  - **Fix & Train** — Step-by-step guidance with explanations of WHY each step matters. For when there's time to learn. Builds technician skill over time.
- AI tracks which fixes a tech has done before vs. first-time encounters, adjusting guidance depth automatically

### 9. VR-Assisted Maintenance (Future — Phase 4+)
Augmented/virtual reality integration for hands-on guided maintenance:
- VR headset (or AR glasses) overlays step-by-step repair instructions onto the physical equipment
- **LiDAR scanning** for real-time spatial awareness — the system knows what it's looking at
- Live diagnosis: scan a machine, system identifies the model, pulls up the reference card, and walks through the repair visually
- Remote expert mode: a senior tech or OEM specialist can see what the field tech sees and guide them through the repair in real-time
- Integration with assetZ WO system — repair steps, time, and parts are logged automatically as the tech works

**Expert Capture Mode (AR-assisted knowledge transfer):**
A skilled tech who already knows how to perform a procedure uses AR to record and teach the AI agent:
- Tech puts on AR glasses and performs the task as normal, narrating steps aloud
- AI agent observes, transcribes, and structures the procedure in real time (step order, parts touched, torque specs mentioned, safety actions taken)
- AI generates a draft Reference Card from the recorded session — tech reviews and approves
- Future techs who don't have the same experience can then use AR to follow those AI-learned steps
- This captures tribal knowledge before it walks out the door when experienced staff retire or leave
- Sessions are logged as training records — track which techs have been trained on which procedures

### 10. 3D Equipment Scanning & Virtual Disassembly (Future — Phase 4+)
Scan physical machines to create interactive 3D models that can be virtually disassembled:
- **External scanning** via LiDAR/photogrammetry to capture the machine's exterior geometry and produce a 3D rendering
- **Internal modeling** supplemented by manufacturer documentation, exploded diagrams, and CAD files (since you can't scan internals without physical disassembly)
- AI combines scanned exterior + online literature + manufacturer data to build a complete virtual model
- **Virtual teardown**: tech can "pull apart" the 3D model layer by layer to understand how components relate, identify the part that's likely failed, and see how to access it
- **Troubleshooting mode**: describe a symptom → AI highlights the most likely failed components in the 3D model and shows the disassembly path to reach them
- Parts identification: scan an unknown part with a phone camera → AI matches it to the 3D model and returns the part number, supplier, and inventory status

### 11. Facility Walkthrough Scanning & Digital Twin (Future — Phase 4+)
Walk the entire building with a scanning device to build the complete digital facility in one pass:
- LiDAR/scanning device captures the full 3D environment as you physically move through the building
- **Tag-as-you-go**: during the walkthrough, identify and tag assets, departments, racking sections, aisles, storage areas — "this is Mill department, this is a Biesse Rover, this rack section is laminate inventory"
- System auto-generates: 2D floor plan, 3D navigable environment, asset registry entries, department zone boundaries, racking layouts, aisle paths — all from the single walkthrough
- **Replaces weeks of manual CMMS onboarding** with a 2-hour facility walk
- The 3D walkthrough becomes a replayable virtual environment for new employee orientation and training
- Periodic re-scans detect layout changes (moved equipment, new racking, reconfigured departments) and flag diffs against the previous scan

---

## Interactive Floor Plan — Architecture & Design Decisions

The floor plan is one of assetZ's primary competitive differentiators. It is NOT a static image with pins — it's a living, interactive blueprint rendered from actual CAD data.

### Visual Theme: Dark Blue CAD Canvas (Always Dark)
The floor plan canvas is ALWAYS dark blue (`#162032`) regardless of the app's light/dark mode setting. The rest of the app (sidebar, headers, asset cards, dashboards) follows the global theme, but the map canvas stays dark. This is the same pattern as Figma — UI can be light or dark, canvas is its own thing.

**Rationale:** Status LEDs (green/yellow/red) need maximum contrast to be instantly scannable. A maintenance manager glancing at the map needs red and yellow dots to jump out immediately. Dark canvas makes that happen.

**Canvas colors:**
- Background: `#162032` (dark navy-blue)
- Wall/structure linework: `#5b8dd9` at ~55% opacity
- Equipment outlines: `#7cb3f4` (lighter blue, slightly brighter than walls)
- Storage/racking: `#3d6494` at ~45% opacity (present but not dominant)
- Grid lines: `#1e2d47` (very subtle)
- Grid text: `#3d5a80`
- Aisle lines: `#2e4a6e` dashed
- Department labels: `#4a6d94` default, `#93c5fd` on hover/click
- Asset labels: `#6a8db8` (monospace, below equipment footprint)
- Tooltip background: `#152033` with `#1e2d47` border

**Global Theme System:**
- Light / Dark / System toggle lives in sidebar footer or Settings page — NOT on the floor plan page
- System mode detects OS `prefers-color-scheme` and follows automatically
- Theme persists per user
- Floor plan page: header bar and detail panel follow global theme; map canvas always dark

### Rendering Approach: DXF-to-SVG Pipeline
The floor plan base layer is generated by converting the facility's DXF (CAD) file to SVG format programmatically. This is vector art, so it stays crisp at any zoom level.

**Layers to render from DXF:**
- Building (walls, structural elements) — solid lines
- Aisles (traffic corridors) — dashed lines
- Storage and Buffer (rack layouts)
- Workbenches Plantequipment
- Machines — rendered as simplified bounding box outlines, NOT full block geometry (machine blocks have 9,000–27,000 lines each — way too heavy for web rendering)

**What the DXF does NOT contain (for SOLLiD's file):**
- The architectural envelope (walls, exterior) lives in a missing XREF. The Building layer only has partial structural elements. The annotated facility screenshot (`sollid-facility-layout-annotated.png`) is the ground truth for building outline and department positioning.

### Equipment Footprints = The Interactive Elements
- Equipment is rendered as **simplified CAD-style outlines** — architectural/engineering symbol quality, matching what you'd see on a real engineering drawing. NOT cartoon icons, NOT colored dots.
- Each footprint is extracted from the DXF machine blocks as a simplified bounding outline — same shape and proportions, reduced line count.
- The equipment footprint itself IS the clickable element. The ENTIRE rectangle/shape is the click target, not just a corner dot.
- **There is NO separation between "Equipment" and "Asset Pins." Equipment IS the asset. One thing, one representation.**

### Status Indicators (LED Dots)
Small dot (8–10px) sits in the top-right corner of each equipment footprint, like a physical LED on the machine:
- 🟢 Green = Operational
- 🟡 Yellow/Orange = PM Due
- 🔴 Red = Down / Open Work Order
- 🟡 Pulsing animated ring = Active maintenance in progress (a technician is currently working on it)
- ⚫ Gray = Decommissioned

### Asset Labeling on the Map
**Normal zoom:** Short recognizable label — e.g., `ROVER-C3-04` (the unique portion of the facility asset ID)
**Hover tooltip:** Full facility asset ID + machine name — e.g., `SC-B1-MIL-CNC-ROVER-C3-04 — Biesse Rover B 1531`
**Click → Detail panel** shows:
- Facility Asset ID: SC-B1-MIL-CNC-ROVER-C3-04
- Asset Number/Barcode: SLD-ROV-0004
- Equipment: Biesse Rover B 1531
- Department: Mill
- Cell: 3
- Grid Location: C-7 (from the alphanumeric blueprint grid — separate from cell number)
- DXF Reference: #47 (legacy CAD reference number, useful for cross-referencing the original blueprint)
- Status with color indicator
- Last work order summary
- Next PM due date
- Quick action buttons: Work Order, PM Schedule, Parts List, Asset History
- "Find in Asset Registry" button to navigate to full asset detail page

### Alphanumeric Grid System
The map uses a blueprint-style grid, NOT raw DXF coordinates:
- **Numbers 1–15 across the top** — matching the structural column grid from the DXF (47'-4" first bay, then 56'-0" bays)
- **Letters (A–F or similar) down the left side** — evenly dividing the building height
- A location reads as "C-7" or "D-12" — like reading a map grid reference
- This is how maintenance techs reference locations on the floor

### Department Zones
- Defined as invisible interactive polygon overlays on top of the blueprint — the blueprint art always shows through
- **Default state:** Gray text label, always visible, centered within the zone
- **Hover:** Label turns blue
- **Click:** Label turns blue AND zone boundary appears as subtle dashed outline; filters to show only that department's assets
- Department zones should NOT be visible colored boxes that obscure the blueprint

**All departments for SOLLiD — see "Official Department Registry" section below for the complete list with 3-letter codes.**

### Layer Toggles (Layers Panel)
- Building Structure (walls, columns, doors)
- Column Grid (alphanumeric overlay)
- Assets (equipment footprints with status indicators)
- Storage & Racking
- Aisles & Transport
- Department Labels (hover/click zones)
- Active Maintenance (pulsing indicators)
- Phase 2 Layout (future equipment from DXF Phase2 layer)

### Dependency Visualization on Floor Plan (Future — scaffold data model now)
When a user clicks an asset and selects "Show Dependencies" or "Show Flow":
- **DEPENDS_ON** relationships render as **solid red directional arrows** between equipment
- **FEEDS** relationships render as **dashed yellow directional arrows** showing material flow with time buffer
- **Impact visualization:** Click a DOWN (red) asset → "Show Impact" highlights every downstream asset affected, arrows turn red, creating a visual cascade showing what's blocked
- **Production flow mode:** Toggle to show all material flow arrows across the facility — how raw material enters and flows through departments to finished goods

### Map Builder (Edit Mode)
Activated via the "Map Builder" button in the floor plan UI. This is the self-service facility map editor:
- **Equipment Icon Library sidebar** with categorized sections: CNC Machines, Edge Banders, Panel Saws, Conveyors, Storage/Racking, Workbenches, Material Handling, Utility Systems
- Icons are **blueprint-style SVG footprints** (engineering quality, not clip art) stored in `/public/assets/equipment-icons/`
- Each icon file is named to match the DXF block name (e.g., `biesse-rover-1531.svg`, `homag-bhx-500.svg`, `sawstop.svg`)
- **Drag from library → drop on map** → positions the equipment → prompt for asset ID, equipment name, department assignment
- Snap-to-grid option for clean alignment
- Department zone boundary drawing tool (polygon)
- Production flow arrow drawing tool
- Undo/redo for all edits
- Save draft / publish workflow (edits don't affect live map until published)
- All asset positions stored in a **single JSON data file** — single source of truth, easy to manually edit

### DXF Reference Data (SOLLiD Facility — G2.5 EQUIPMENT LAYOUT EGRESS-2.dxf)
- **File:** 46 MB, 5.4M lines, 3,198 model-space entities, 300 block definitions
- **Coordinate system:** 1 unit = 1 inch, Imperial
- **Building extents:** X: ~1,200–9,500 in, Y: ~350–4,300 in (~690' wide × ~330' tall)
- **Machine blocks scale:** 0.039 (mm→in conversion, block geometry drawn in mm)
- **Exception:** CeflaLines_20200916_V2 at scale=11.99 (different unit system)
- **Asset Number layer:** 107 MTEXT labels (#1–#258) positioned at each machine location — these are the asset position coordinates
- **Key layers:** Machines (495 entities), Storage and Buffer (1,053), Workbenches (379), Building (168), Asset Number (107), Aisles (101), Transport Equipment (96), DepartmentLabel (17)
- **Missing XREF:** X-PLAN-FLR1 (architectural walls/columns/doors) not embedded — 90+ architectural layers exist in layer table but have no geometry

---

## API Base URL

Development: `http://localhost:8000/api`
The backend API documentation (when running) will be at `http://localhost:8000/docs` (FastAPI auto-generates Swagger UI).

## UX Conventions

### Asset Selection in Forms (WO, PM, Parts, etc.)
Plain `<select>` dropdowns are unacceptable once the asset registry grows beyond ~20 entries. All asset pickers must use a **searchable combobox** pattern:
- Text input with instant fuzzy/substring search filtering the list
- Search matches on: asset name, facility asset ID, asset number/barcode, manufacturer, model
- Results show as a dropdown list beneath the input — keyboard navigable (arrow keys + Enter)
- On mobile: same pattern, no native select. The input should open a full-height bottom sheet on small screens if needed.
- Selected state shows the asset name + facility ID in the field (not just a UUID)
- A reusable `AssetCombobox` component lives in `src/components/ui/AssetCombobox.tsx` and is used everywhere an asset is selected (WOForm, PMForm, RequestForm, etc.)
- This pattern applies to any long-list picker: assigned tech, parts selection, etc.

## Coding Conventions

- Use TypeScript strict mode
- Components are functional with hooks (no class components)
- File naming: kebab-case for files, PascalCase for components
- API calls go through a centralized client in `lib/api-client.ts`
- WebSocket connections managed through `lib/ws-manager.ts`
- All types matching the backend schema live in `types/`
- Tailwind for styling — no CSS modules, no styled-components
- Mobile-first responsive design (this is used on the shop floor)
- Commit after every working feature — small, atomic commits

## Current Phase

**Phase 1: Core CMMS — COMPLETE**

All Phase 1 items shipped with real PostgreSQL backend (40+ API routes, Prisma 7, JWT auth, RBAC):
1. ✅ Project scaffolding, auth pages, app shell with sidebar nav
2. ✅ Asset registry (CRUD, detail views, barcode display, sub-locations, tags)
3. ✅ Work order management (create, status workflow, comments, photos, labor log)
4. ✅ KPI dashboard (8 KPI cards, charts, enhanced sections, role-based rendering)
5. ✅ PM schedule management (interactive checklist, complete modal)
6. ✅ Parts inventory with reservation UI
7. ✅ Red/Yellow/Green scoreboard (sortable, expandable, 60s polling)
8. ✅ Settings and configuration (23-section interface, Departments CRUD, Tags/Labels CRUD)
9. ✅ Interactive floor plan (DXF-to-SVG pipeline, dark blue canvas, dept zones, layer toggles, Map Builder)

**Phase 1.5: UI Modernization — COMPLETE**
- Three-view layout (Panel/Table/Calendar) on all 4 modules
- Universal FilterBar with pills, saved filters, status tab bar
- Collapsible sidebar (icons-only collapsed state)
- Per-module sort controls, column chooser, three-dot DotsMenu per row
- Enterprise form enhancements: AssetForm (12 fieldsets), PMForm, WOForm, PartForm

**Additional Phase 1 Features Shipped:**
- Real backend: PostgreSQL 16 + Prisma 7 + 40+ API routes
- JWT auth with 5-role RBAC (admin, manager, technician, requester, viewer)
- Request Queue (submit/triage/approve workflow, kiosk TV mode)
- Asset Reference Cards (9 section types, editor, collapsible in WO/PM/Asset views, Fix Mode toggle)
- Enhanced Dashboard (role-based sections, My Work Center, Quick Links, DashboardConfig)
- Import System (5-step CSV wizard + 5 platform importers)
- Bulk QR/barcode label printing for assets and parts (PrintLabelsModal)
- Asset tags (color-coded labels) and department sub-locations

## Important Context

This product is being dogfooded at SOLLiD Cabinetry (cabinet manufacturing) as the first production deployment. The maintenance team will use this daily. Manufacturing floor conditions apply — the mobile experience must work with gloves, in poor lighting, and under time pressure. Fast, clear, scannable.

SOLLiD is a ~690' × 330' cabinet manufacturing facility with Biesse CNC machines, HOMAG boring centers, Cefla finishing lines, edge banders, panel saws, and extensive racking/storage. Matt is actively implementing Asset Essentials there and using that hands-on experience to identify pain points that assetZ solves.

---

## Official Department Registry (SOLLiD Cabinetry)

**All department codes are EXACTLY 3 letters.** The department code occupies position 3 in the Facility Asset ID (e.g., `SC-B1-MIL-...`). `FAC` is a special code for facility-wide assets that serve the entire plant (air compressors, dust collectors, HVAC, etc.) rather than belonging to a specific physical department.

When a new department is needed (via import or user entry), the system should auto-suggest a 3-letter code. If no obvious abbreviation exists, AI generates one.

### Production Departments
| Code | Department Name | Seed ID |
|------|----------------|---------|
| MIL | Mill | dep-mil |
| KIT | Kitting | dep-kit |
| ASM | Assembly | dep-asm |
| FIN | Finishing | dep-fin |
| WHT | White Wood | dep-wht |
| WPR | White Wood Prep & Touch-Up | dep-wpr |
| RPG | Repair & Glazing | dep-rpg |

### Facility & Utility
| Code | Department Name | Seed ID |
|------|----------------|---------|
| MNT | Maintenance | dep-mnt |
| FAC | Facility (virtual — plant-wide assets) | dep-fac |
| AIR | Air Compressor & Chiller Room | dep-air |
| DST | Dust Collector Storage | dep-dst |
| WLD | Welding | dep-wld |
| FKR | Forklift Repair | dep-fkr |
| PNT | Paint/Lacquer Storage | dep-pnt |

### Logistics & Storage
| Code | Department Name | Seed ID |
|------|----------------|---------|
| REC | Receiving | dep-rec |
| SHP | Shipping | dep-shp |
| WSR | West Storage & Racking | dep-wsr |
| ESR | East End Storage & Racking | dep-esr |
| VSI | Value Series Inventory | dep-vsi |
| LAM | Laminate Inventory | dep-lam |
| FGS | Finished Good Storage | dep-fgs |

### Administrative
| Code | Department Name | Seed ID |
|------|----------------|---------|
| SHW | Showroom | dep-shw |
| LBY | Lobby | dep-lby |
| OPS | Operations Offices & Cubicles | dep-ops |
| BTH | Bathrooms & Storage | dep-bth |
| BRK | Breakroom & Food | dep-brk |
| SLS | Sales Tools | dep-sls |
| GRL | Grill Patio | dep-grl |
| CNF | Conference Room | dep-cnf |

**Total: 29 departments** (seeded in `prisma/seed.ts`)
