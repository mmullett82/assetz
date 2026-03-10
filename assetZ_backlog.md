# assetZ Product Backlog
## Last Updated: March 9, 2026

---

## STATUS KEY
- 🔴 Not Started
- 🟡 In Progress
- 🟢 Complete
- ⭐ High Priority / Differentiator

---

## PHASE 1: CORE CMMS (Frontend Shell)

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Project scaffolding | 🟢 | Next.js 16, TypeScript, Tailwind, App Router |
| 2 | Asset registry (CRUD, list, detail) | 🟢 | Full CRUD + tags, sub-locations, barcode display |
| 3 | Work order management | 🟢 | Full workflow, comments, labor log, completion modal |
| 4 | KPI dashboard | 🟢 | 8 KPI cards, charts, enhanced sections, role-based |
| 5 | PM schedule management | 🟢 | Interactive checklist, complete modal, PM forms |
| 6 | Parts inventory with reservations | 🟢 | Transactional reserve/release, 4-tab detail |
| 7 | Red/Yellow/Green scoreboard | 🟢 | Sortable, expandable rows, team KPI bar |
| 8 | Settings & configuration | 🟢 | 23-section interface, Departments CRUD, Tags CRUD, all config sections |
| 9 | Enterprise form enhancements | 🟢 | AssetForm 12 fieldsets, PMForm, WOForm, PartForm fully enhanced |
| 10 | Asset floor plan / map | 🟢 | DXF-to-SVG, dark blue CAD canvas, dept zones, layer toggles, Map Builder |
| 11 | Real backend (PostgreSQL + Prisma + API) | 🟢 | 40+ API routes, JWT auth, 5-role RBAC, full data layer |
| 12 | Request Queue | 🟢 | Submit/triage/approve workflow, kiosk TV mode |
| 13 | Asset Reference Cards | 🟢 | 9 section types, editor, inline WO/PM/Asset panels, Fix Mode toggle |
| 14 | Enhanced Dashboard | 🟢 | Role-based sections, My Work Center, DashboardConfig, Quick Links |
| 15 | Import System | 🟢 | 5-step CSV wizard + 5 platform importers (MaintainX, AE, UpKeep, Fiix, Limble) |
| 16 | Bulk QR/barcode label printing | 🟢 | Multi-size labels, copies, QR/URL mode — assets and parts |
| 17 | Asset tags & sub-locations | 🟢 | Color-coded tags, department sub-locations, sidebar filter on assets page |

---

## PHASE 1.5: UI MODERNIZATION (Current Priority)

### Three-View System (MaintainX-Inspired)
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Panel View (two-pane: list + detail) | 🟢 | All 4 modules: assets, WOs, PMs, parts |
| 2 | Table View (data grid with column picker) | 🟢 | Sortable, bulk select, ColumnChooser, DotsMenu |
| 3 | Calendar View (WOs and PMs) | 🟢 | Month/week calendar grid |
| 4 | View toggle icons (top-right of list pages) | 🟢 | localStorage-persisted per module |

### Universal Filter Bar
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 5 | "+ Add Filter" horizontal filter system | 🟢 | FilterBar component on all list pages |
| 6 | Filter pills/chips (removable, stackable) | 🟢 | AND logic, removable pills |
| 7 | Save Filter combinations (personal + org-wide) | 🟢 | Named saved views via filter-config.ts |
| 8 | Default saved filters per module | 🟢 | "My Open WOs", "Low Stock", "Overdue PMs" etc. |

### Navigation & Layout
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 9 | Sidebar: hamburger toggle at TOP LEFT | 🟢 | Top-left hamburger, mobile overlay |
| 10 | Sidebar: collapsed = icons only (~60px) | 🟢 | localStorage-persisted |
| 11 | Sidebar: expanded = icons + labels (~220px) | 🟢 | |
| 12 | Global search bar (per-module) | 🟢 | Name, ID, barcode, manufacturer search on all list pages |
| 13 | Sort controls dropdown | 🟢 | SortDropdown component, localStorage-persisted |
| 14 | Three-dot menu (⋯) per row | 🟢 | DotsMenu component — edit, view, create WO, delete etc. |

### Default Sort Logic
- **Assets:** Alphabetical by name
- **Work Orders:** Overdue first (by how overdue), then due soonest, then by created date
- **PM Schedules:** Next due date ascending
- **Parts:** Alphabetical by name

---

## PHASE 1.5: FORM ENHANCEMENTS (From AE Comparison)

### Asset Form — Missing Fields
| # | Field/Section | Status | Notes |
|---|--------------|--------|-------|
| 1 | Purchase info (price, date, invoice, expected life, replacement cost, salvage value) | 🟢 | Full fieldset in AssetForm |
| 2 | Warranty tracking (title, expiration, vendor) | 🟢 | |
| 3 | Dates (manufacture, placed, removed, out-of-service begin/end) | 🟢 | |
| 4 | Condition assessment (condition, date, est. replace date, assessment note) | 🟢 | |
| 5 | Calculated rollups (Total WO Cost, Total Labor Hrs, Total Downtime) | 🔴 | Read-only, calculated from WO data |
| 6 | Safety & Procedures notes (safety, training, shutdown, LOTO, emergency) | 🟢 | Collapsible safety fieldset |
| 7 | Assigned To (primary tech), Emergency Contact | 🟢 | |
| 8 | Tag Number, RFID field | 🟢 | |
| 9 | Photo upload, Document attachments | 🟡 | UI placeholder only — file upload not yet wired to storage |
| 10 | Check-out/sign-out tracking with log | 🔴 | |
| 11 | Associated Assets (beyond parent-child) | 🔴 | Links to graph DEPENDS_ON/FEEDS |
| 12 | Electrical Panel & Specs (custom field) | 🔴 | Via custom fields system |

### PM Form — Missing Fields
| # | Field/Section | Status | Notes |
|---|--------------|--------|-------|
| 1 | PM Type: Time-Based, Meter-Based, Time-Based with Meter Override | 🟢 | Segmented control in PMForm |
| 2 | Expected completion (X days, X hours after generation) | 🔴 | |
| 3 | WO creation time (e.g., generate at 08:00 AM) | 🔴 | |
| 4 | Default WO Status for generated WOs | 🔴 | |
| 5 | Pre-filled Problem/Cause codes on PM template | 🔴 | |
| 6 | End conditions (no end, after X occurrences, on date) | 🟢 | Built in PMForm |
| 7 | Season start option (seasonal equipment) | 🔴 | |
| 8 | Dependency-aware skip: "Don't create unless prior PMs completed" | 🔴 | More advanced than simple skip_if_open |
| 9 | Exclusion Conditions (holidays, shutdowns) | 🔴 | |
| 10 | WO generation timing (next scheduled vs next work day) | 🔴 | |
| 11 | PM Parts section (attach required parts to template) | 🔴 | Auto-reserve when WO generates |
| 12 | **PM Stacking/Grouping** | 🔴 | ⭐ Combine daily+weekly+monthly PMs falling on same day into single WO with all tasks |

### WO Form — Missing Fields
| # | Field/Section | Status | Notes |
|---|--------------|--------|-------|
| 1 | "Breakdown" work type | 🟢 | Included in WO type options |
| 2 | Origin Info (origin type, originated date, originator, assigned date) | 🟢 | Built in WOForm |
| 3 | Action Taken (completion datetime + description) | 🟢 | Field in WO detail + WOForm |
| 4 | Planning section (scheduling/resource) | 🔴 | |
| 5 | Contact User button (reach originator) | 🔴 | |
| 6 | Signature for completion | 🔴 | MaintainX has this — accountability layer |
| 7 | Cost tracking (labor cost, travel, parts cost, other) | 🔴 | |
| 8 | Time tracking (time spent on WO) | 🟢 | LaborLog component — log hours, date, notes per tech |

### Parts Form — Missing Fields
| # | Field/Section | Status | Notes |
|---|--------------|--------|-------|
| 1 | Alternate Part # (cross-reference equivalent parts) | 🟢 | Built in PartForm |
| 2 | Manufacturer Barcode | 🟢 | Built in PartForm |
| 3 | Par Quantity (ideal stock level) | 🟢 | Built in PartForm |
| 4 | Min/Max Level reorder method | 🟢 | Built in PartForm |
| 5 | Qty on Back Order | 🔴 | |
| 6 | Multiple storage locations per part | 🔴 | |
| 7 | Parts Kits (pre-built groups for common tasks) | 🔴 | Pull as a unit for WO |
| 8 | Photo upload, Document attachments | 🔴 | |
| 9 | Parts associated to assets (view parts list from asset) | 🔴 | ⭐ Key workflow feature |

---

## PHASE 2: INTELLIGENCE LAYER

### Floor Plan / Asset Map ⭐
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | DXF-to-SVG vector rendering pipeline | 🟢 | scripts/generate-blueprint.mjs, 93KB SVG, 6 layer groups |
| 2 | Dark blue CAD canvas (always dark, `#162032`, regardless of app theme) | 🟢 | FacilityMap.tsx, always dark regardless of global theme |
| 3 | Pin assets to floor plan positions (drag & drop) | 🟢 | Via Map Builder edit mode |
| 4 | Real-time status overlay (LED dots on equipment corners) | 🟢 | ⭐ EquipmentFootprint.tsx — green/yellow/red/grey, pulsing for active |
| 5 | Click equipment footprint to see asset detail panel | 🟢 | Full footprint rect is click target |
| 6 | Dependency chain visualization on floor plan | 🔴 | ⭐ DEPENDS_ON = solid red lines, FEEDS = dashed yellow lines |
| 7 | Ripple effect animation when asset goes down | 🔴 | ⭐ Shows downstream impact visually spreading |
| 8 | Heat map overlay (failure frequency, cost, downtime) | 🔴 | ⭐ Toggle between different heat map types |
| 9 | Department zone boundaries (invisible interactive polygons) | 🟢 | 22 zones, hover/click highlights, dept filter working |
| 10 | Multi-floor support (floor selector tabs) | 🟢 | FloorTabs in Map Builder |
| 11 | Alphanumeric grid overlay (numbers 1-15 top, letters A-F side) | 🟢 | 15 corrected grid cols, layer toggle |
| 12 | Zoom + pan with smooth navigation | 🟢 | react-zoom-pan-pinch, initialScale=0.65 |
| 13 | Filter map pins by status, category, department | 🟢 | Status filter + zone click-to-filter |
| 14 | "Map View" as 4th view option on Assets page | 🔴 | Alongside Panel/Table/Calendar |
| 15 | Technician location on map (future: BLE beacons) | 🔴 | Phase 3+ |
| 16 | Production flow arrows showing material path | 🔴 | ⭐ Visual of how material moves through facility |
| 17 | Buffer status indicators on FEEDS relationships | 🔴 | "4 hrs of staged parts remaining" |
| 18 | QR code scanning → auto-centers map on that asset | 🔴 | |
| 19 | Asset labeling: short label at normal zoom, full facility ID on hover | 🟢 | ROVER-C3-04 label + full ID in hover tooltip |

### Self-Service Map Builder ⭐
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | DXF/CAD import → auto-generates vector floor plan | 🟢 | Working for SOLLiD DXF |
| 2 | Upload floor plan image (JPG, PNG, PDF) as alternative | 🔴 | Per building/floor, for customers without CAD |
| 3 | Draw department zones on floor plan (polygon drawing tool) | 🟢 | Zone drawing in Map Builder |
| 4 | Equipment icon library sidebar (blueprint-style SVG footprints) | 🟢 | ⭐ 21 SVG icons + index.json, AssetSidebar in builder |
| 5 | Drag & drop equipment from library onto floor plan | 🟢 | BuilderCanvas drag-and-drop |
| 6 | Snap-to-grid option for clean alignment | 🟢 | snap() helper in builder-state.ts |
| 7 | Label placement tool (department names, area labels) | 🟢 | Text/label elements in builder |
| 8 | Draw walls/barriers (line drawing tool) | 🟢 | Wall drawing tool in BuilderToolbar |
| 9 | Draw production flow paths (directional arrows) | 🟢 | Flow arrow drawing in builder |
| 10 | Equipment icons stored in `/assets/equipment-icons/` | 🟢 | Named to match DXF block names |
| 11 | Undo/redo for all map edits | 🟢 | useHistory hook in builder-state.ts |
| 12 | Save draft / publish workflow | 🟢 | Draft → localStorage, publish → viewer |
| 13 | Multi-floor builder (add floors, name them, navigate between) | 🟢 | FloorTabs component |
| 14 | Template facility layouts (common manufacturing layouts) | 🟢 | TemplateModal with preset layouts |
| 15 | AI-assisted map building | 🔴 | ⭐ Upload photo of floor → AI suggests zones and asset positions |
| 16 | Bulk pin placement (CSV import with x,y coordinates) | 🟢 | CSVImportModal in builder |

*Note: Users who want help building their map can use AI onboarding (Phase 3, Step 3). This self-service builder is for users who want to do it themselves.*

### KPI Gauge Dials
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Half-circle speedometer gauges (like AE screenshot) | 🔴 | Recharts RadialBarChart |
| 2 | Configurable zones (Normal/Warning/Error with colors) | 🔴 | Match AE: 0-70 red, 70-90 orange, 90-100 green |
| 3 | KPI configuration builder (data source, filters, thresholds) | 🔴 | Admin can create custom KPIs |
| 4 | Dashboard layout customization (drag/resize KPI cards) | 🔴 | |
| 5 | KPI auto-refresh via WebSocket | 🔴 | No manual reload needed (fix AE pain point) |

### Scoreboard Enhancements
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Stoplight icon next to each tech name | 🔴 | ⭐ Actual traffic signal visual (3 stacked circles) |
| 2 | Stoplight renders ALL 3 circles always — active status full brightness + glow, inactive at ~15-20% opacity | 🔴 | ⭐ Looks like a real traffic light, not a single colored dot |
| 3 | Keep row color highlighting AND add stoplight | 🔴 | Both together |
| 4 | TV/kiosk mode (auto-rotate, large text, large stoplights) | 🔴 | For shop floor display — stoplights highly visible across the room |

### Graph Database (Kuzu)
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Kuzu integration with PostgreSQL sync | 🔴 | Grant's backend work |
| 2 | DEPENDS_ON relationships (Line equipment) | 🔴 | Immediate red alert |
| 3 | FEEDS relationships (Cell/Utility equipment) | 🔴 | Yellow warning with countdown timer |
| 4 | Failure pattern analysis (FAILED_WITH) | 🔴 | |
| 5 | Technician expertise profiles (WORKED_BY, CERTIFIED_FOR) | 🔴 | Smart WO assignment |
| 6 | Supply chain risk analysis (SUPPLIED_BY, LEAD_TIME_FROM) | 🔴 | |
| 7 | Similar asset prediction (SIMILAR_TO) | 🔴 | "Asset X failed with this. Asset Y is same model — check it" |

### AI Agent ⭐
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Sidebar chat (collapsible) | 🟢 | AgentChatPanel — collapsible chat sidebar, wired to layout |
| 2 | Inline smart prompts (contextual suggestions) | 🔴 | Non-intrusive, dismissable, one-tap actions |
| 3 | Natural language KPI querying | 🔴 | "Show me all overdue PMs in the Mill" |
| 4 | WO Suggestions (like MaintainX CoPilot) | 🔴 | ⭐ Procedure suggestions based on past WOs + manuals |
| 5 | Voice-to-summary on completed WOs | 🔴 | ⭐ Tech records voice note → AI structures into summary |
| 6 | Photo-to-asset creation (nameplate scanning) | 🔴 | ⭐ Snap photo of nameplate → AI creates asset record |
| 7 | Photo-to-diagnosis (asset condition from photo) | 🔴 | ⭐ Snap photo → AI suggests recommended actions |
| 8 | Anomaly detection on meter readings | 🔴 | Flag readings that deviate from historical patterns |
| 9 | AI-estimated job duration | 🔴 | Based on historical WO completion times for similar work |
| 10 | Predictive parts needs | 🔴 | "Based on upcoming PMs, you'll need 3 filters next month" |

### Document Ingestion (graphX)
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Upload OEM manuals → extract PM tasks | 🔴 | |
| 2 | Upload OEM manuals → extract parts lists | 🔴 | |
| 3 | Upload OEM manuals → extract procedures | 🔴 | |
| 4 | Review/approve extracted data before creating records | 🔴 | Human in the loop |
| 5 | Link PM schedules back to source document + page | 🔴 | RECOMMENDED_BY relationship |

---

## PHASE 3: AI ONBOARDING & POLISH

### 30-Minute AI Onboarding Flow
| # | Step | Status | Notes |
|---|------|--------|-------|
| 1 | Company profile (name, facilities, industry) | 🔴 | Pre-configures defaults |
| 2 | Upload everything (manuals, floor plans, equipment lists) | 🔴 | graphX processes in background |
| 3 | Facility layout (upload floor plan, name depts, zone boundaries) | 🔴 | |
| 4 | Equipment discovery (AI asks questions, builds ID system) | 🔴 | |
| 5 | Serial number collection (mobile checklist by floor plan location) | 🔴 | |
| 6 | PM schedule generation (from extracted manual data) | 🔴 | |
| 7 | Parts inventory seeding (from extracted manual data) | 🔴 | |

### Mobile / PWA
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | PWA manifest and service worker | 🟢 | public/sw.js — network-first for API, cache-first for static assets |
| 2 | Offline mode with reliable sync | 🔴 | ⭐ Fix AE's biggest pain point |
| 3 | Barcode/QR scanning via camera | 🔴 | |
| 4 | Push notifications | 🔴 | |
| 5 | Large buttons, simplified mobile layout | 🔴 | Like MaintainX — accessible to non-tech workers |

### Communication
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | In-app messaging (WO chat threads) | 🔴 | MaintainX's #1 rated feature |
| 2 | Direct messages between techs/managers/requesters | 🔴 | |
| 3 | @mentions in comments | 🔴 | |
| 4 | Photo/video attachments in comments | 🔴 | |
| 5 | Notification preferences per user | 🔴 | |
| 6 | Voice-to-text mic button on ALL text inputs app-wide | 🔴 | ⭐ Critical for shop floor — dirty hands, gloves, noisy environment |
| 7 | AI-structured voice input (speech → structured WO fields) | 🔴 | ⭐ Tech says "replaced drive belt, 45 min, used 1 Gates belt" → AI parses into action, time, parts consumed |
| 8 | Voice-to-summary on completed WOs | 🔴 | ⭐ Voice note → AI formats into completion summary |
| 9 | Voice search ("find asset Rover 4") | 🔴 | Uses same mic button + speech recognition |

*Note: Voice-to-text uses browser Web Speech API for basic transcription. AI-structured processing (parsing time, parts, actions from speech) requires a backend endpoint — coordinate with Grant on Claude API integration for speech→structured data.*

### Asset Reference Cards (Quick Reference Guides) ⭐
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Reference Card data model per asset (or per asset MODEL for shared cards) | 🟢 | 3 Prisma models: ReferenceCard, ReferenceCardSection, ReferenceCardVersion. Asset-specific or model-match. |
| 2 | Reference Card tab/panel inside Work Order detail view | 🟢 | ⭐ ReferenceCardCollapsible inline in WO/PM/Asset detail views |
| 3 | Structured template for reference cards (PM procedures, safety, common failures, parts, lubrication, troubleshooting) | 🟢 | 9 section types with typed renderers |
| 4 | Upload PDFs, images, and documents to reference cards | 🔴 | Photos of grease fittings, belt routing, etc. |
| 5 | Troubleshooting decision tree (symptom → check this first) | 🟡 | Section type exists, renderer built, content editor is JSON |
| 6 | Links to full manufacturer manuals (stored in graphX) | 🔴 | Reference card is the quick version, manual is the deep version |
| 7 | Version history and change tracking on reference cards | 🟢 | ReferenceCardVersion model + versions API route |
| 8 | AI auto-generates draft reference card from manufacturer manual | 🔴 | ⭐ graphX ingests manual → AI extracts key procedures, parts, and specs into card template |
| 9 | AI assistant uses reference card + manual as knowledge base during WO | 🔴 | ⭐ Tech asks "how do I tension the drive belt on this?" → AI answers from card/manual |
| 10 | Fix Only mode — quick answer, minimal explanation, get machine running | 🟡 | ⭐ FixModeToggle UI scaffolded — "Coming soon" on AI mode |
| 11 | Fix & Train mode — step-by-step with WHY explanations, builds tech skill | 🟡 | ⭐ Toggle UI built, AI backend not yet wired |
| 12 | AI adapts guidance depth based on tech's history with this asset/repair type | 🔴 | ⭐ First time replacing this belt? Full walkthrough. Done it 5 times? Just the spec. |

*Note: Reference cards are immediately useful even without AI — maintenance teams create them as standard operating procedures. AI enhancement layers on top over time. The Fix Only vs Fix & Train toggle is a major differentiator for technician development.*

### Automation Engine
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Visual workflow builder | 🔴 | Like MaintainX automations |
| 2 | Trigger: asset status change → create WO | 🔴 | |
| 3 | Trigger: meter reading threshold → create WO | 🔴 | |
| 4 | Trigger: inspection failure → create corrective WO | 🔴 | |
| 5 | Trigger: part below reorder → draft PO | 🔴 | |
| 6 | Branching conditions (asset location, task status, etc.) | 🔴 | |

### Purchase Orders
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | PO creation and management | 🔴 | |
| 2 | Approval workflow (draft → pending → approved → ordered → received) | 🔴 | |
| 3 | Receive parts → auto-update inventory | 🔴 | |
| 4 | PO line items with costs | 🔴 | |

### Reporting
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Asset history report | 🔴 | |
| 2 | WO summary report | 🔴 | |
| 3 | Cost analysis report | 🔴 | |
| 4 | Technician performance report | 🔴 | |
| 5 | Custom report builder | 🔴 | |
| 6 | Scheduled report emails | 🔴 | |
| 7 | CSV export on all views | 🔴 | |
| 8 | Natural language report generation (AI) | 🔴 | "Show me downtime by department this quarter" |

### Predictive Maintenance & IoT ⭐
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| **Sensor Integration** | | | |
| 1 | Amperage monitoring integration | 🔴 | Track power draw patterns to detect motor degradation |
| 2 | Vibration sensor integration | 🔴 | Detect bearing wear, imbalance, misalignment |
| 3 | Temperature sensor integration | 🔴 | Monitor motor/bearing/spindle temps |
| 4 | Biesse SOPHIA integration | 🔴 | ⭐ First IoT partner — Biesse's built-in monitoring |
| 5 | Generic MQTT/OPC-UA connector | 🔴 | Universal protocol support for any sensor brand |
| 6 | Sensor dashboard per asset | 🔴 | Real-time readings, charts, historical trends |
| **Predictive Analytics** | | | |
| 7 | Baseline learning (establish normal operating ranges per asset) | 🔴 | AI learns what "healthy" looks like over 30-60 days |
| 8 | Anomaly detection (flag deviations from baseline) | 🔴 | ⭐ "Spindle vibration 23% above normal — investigate" |
| 9 | Failure prediction (estimated days until failure) | 🔴 | ⭐ "Based on vibration trend, bearing failure likely within 14 days" |
| 10 | Auto-generate predictive WOs | 🔴 | AI creates WO when prediction confidence exceeds threshold |
| 11 | Similar asset cross-prediction | 🔴 | ⭐ Graph-powered: "Asset X failed. Asset Y is same model with similar readings — inspect" |
| 12 | Remaining useful life (RUL) estimation per asset | 🔴 | Based on combined sensor data + maintenance history |
| **Condition-Based Maintenance** | | | |
| 13 | Condition-based PM triggers from sensor data | 🔴 | Replace time-based PMs with actual condition thresholds |
| 14 | Meter-based triggers from sensor auto-readings | 🔴 | No manual meter entries — sensors feed readings automatically |
| 15 | Configurable alert thresholds per sensor per asset | 🔴 | Admin sets: warning at X, critical at Y, auto-WO at Z |
| 16 | Alert routing (who gets notified for what sensor on what asset) | 🔴 | By role, by asset, by severity |
| **Visualization** | | | |
| 17 | Sensor data overlay on facility map | 🔴 | ⭐ Map pins show live sensor status (green/yellow/red) |
| 18 | Trend charts with prediction overlay | 🔴 | Historical data + projected future trend line |
| 19 | Predictive maintenance dashboard | 🔴 | Separate view: assets ranked by predicted failure urgency |
| 20 | Health score per asset (0-100) | 🔴 | ⭐ Composite score from all sensors + maintenance history + age |
| 21 | Fleet-wide health heatmap | 🔴 | Color-coded view of all assets by health score |

*Note: Predictive maintenance is the highest-value differentiator for enterprise customers. Start with Biesse SOPHIA integration (already available on SOLLiD's equipment), then expand to generic sensors. The graph database enables cross-asset prediction that no competitor offers.*

### Advanced Maintenance Technology (Phase 4+ — Future Vision) ⭐
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| **VR/AR-Assisted Maintenance** | | | |
| 1 | AR overlay of repair instructions on physical equipment via headset/glasses | 🔴 | ⭐ Step-by-step guidance overlaid on the actual machine |
| 2 | LiDAR spatial scanning for real-time equipment identification | 🔴 | Point device at machine → system identifies model, pulls reference card |
| 3 | Live diagnosis mode: scan → identify → diagnose → walkthrough repair | 🔴 | ⭐ Full guided repair experience |
| 4 | Remote expert mode (senior tech/OEM specialist sees what field tech sees) | 🔴 | ⭐ Real-time collaboration on complex repairs from anywhere |
| 5 | Auto-log repair steps, time, and parts consumed during VR session | 🔴 | WO completion data captured passively as tech works |
| **3D Equipment Scanning & Virtual Disassembly** | | | |
| 6 | External scan via LiDAR/photogrammetry → 3D model of machine exterior | 🔴 | ⭐ Capture real equipment geometry |
| 7 | AI builds complete virtual model: scanned exterior + manufacturer docs + CAD data + online literature | 🔴 | ⭐ Combines multiple sources since internals can't be scanned without physical disassembly |
| 8 | Virtual teardown — pull apart 3D model layer by layer | 🔴 | ⭐ Understand component relationships, access paths, assembly order |
| 9 | Troubleshooting mode: describe symptom → AI highlights likely failed components in 3D model | 🔴 | ⭐ Shows disassembly path to reach the problem area |
| 10 | Part identification: scan unknown part with phone camera → AI matches to 3D model → returns part number, supplier, inventory status | 🔴 | ⭐ Instant part lookup from a photo |
| 11 | Interactive 3D exploded views linked to reference cards and manuals | 🔴 | Click a component in 3D → see its maintenance procedures |
| **Facility Walkthrough Scanning & Digital Twin** | | | |
| 12 | Walk-the-building scanning: LiDAR/device captures entire facility as you move through it | 🔴 | ⭐ One physical walkthrough builds the complete digital environment |
| 13 | Tag-as-you-go: identify assets, departments, racking, aisles during the walkthrough | 🔴 | ⭐ "This is Mill department, this is a Biesse Rover, this rack section is laminate inventory" |
| 14 | Auto-generates 2D floor plan + 3D environment + asset registry + department zones from single walkthrough | 🔴 | ⭐ Replaces weeks of manual data entry with a 2-hour facility walk |
| 15 | Replayable 3D walkthrough for employee orientation and training | 🔴 | New hires learn the facility layout virtually before their first day on the floor |
| 16 | Periodic re-scan to detect layout changes (moved equipment, new racking, etc.) | 🔴 | Diff against previous scan to flag what changed |

*Note: VR/AR and 3D scanning represent the long-term vision for assetZ. These features would put assetZ in a category no CMMS competitor currently occupies. Start with simpler AR (phone camera-based, not full headset) and build toward full VR as hardware becomes more accessible on the shop floor. The 3D model library would be built incrementally — each scanned machine adds to the library for all customers using that equipment model. The facility walkthrough is the ultimate onboarding tool — one physical walk replaces weeks of manual setup. The walkthrough also becomes a living digital twin that stays in sync with the real facility through periodic re-scans.*

### Multi-Tenancy & SaaS
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Organization isolation (org_id on every record) | 🟢 | All Prisma queries scoped to organization_id |
| 2 | Tenant provisioning | 🔴 | |
| 3 | Plan/tier management | 🔴 | |
| 4 | Public API documentation | 🔴 | Open like MaintainX |

---

## COMPETITIVE DIFFERENTIATORS (What No One Else Has)

These are the features that make assetZ unique vs MaintainX, Limble, UpKeep, Fiix, and Asset Essentials:

1. **⭐ Graph-Powered Dependency Intelligence** — DEPENDS_ON and FEEDS relationships with real-time cascade alerts. No competitor models operational dependencies with buffer times and countdown warnings.

2. **⭐ Living Floor Plan** — Not just static pins (competitors). Real-time status colors, dependency chain overlays, ripple animations on failure, heat maps, production flow visualization.

3. **⭐ AI-Native from Day One** — Not bolted-on AI like MaintainX CoPilot (Enterprise only). AI is in the core product: onboarding, document ingestion, smart prompts, voice summaries, photo diagnosis, natural language queries.

4. **⭐ Smart ID System** — Auto-generated dual ID system (Facility Asset ID + Asset Number/Barcode) with encoded location, department, dependency type, and sequence. No competitor auto-generates meaningful IDs.

5. **⭐ Two-Tier Dependency Model** — Distinguishing between DEPENDS_ON (immediate mechanical coupling) and FEEDS (operational with time buffer). Enables intelligent alerting vs binary "affects/doesn't affect."

6. **⭐ PM Stacking** — Combining multiple PM frequencies that fall on the same day into a single WO. Prevents technician overload and WO spam.

7. **⭐ Red/Yellow/Green Measured Against Due Date** — Not creation date. Seems simple but AE and others get this wrong.

8. **⭐ 30-Minute AI Onboarding** — Conversational setup that replaces weeks of manual data entry. Upload manuals → AI extracts PMs, parts, procedures → review and activate.

9. **⭐ KPIs That Actually Auto-Refresh** — No manual reload after admin changes (direct fix of AE's biggest daily frustration).

10. **⭐ Self-Service Map Builder** — No competitor offers an in-app facility map builder where users can draw zones, place pins, and design their floor plan without professional services. Combined with AI-assisted building (upload a photo → AI suggests layout). DXF/CAD import auto-generates vector floor plans.

11. **⭐ Graph-Powered Predictive Maintenance** — Not just sensor thresholds (any IoT platform does that). Our graph database enables cross-asset prediction: "Asset X failed with this vibration pattern. Asset Y is the same model and trending the same way — inspect now." No competitor connects failure prediction across related assets.

12. **⭐ Voice-First Input for Shop Floor** — Mic button on every text input in the app. AI-structured voice processing: tech says "replaced drive belt, 45 minutes, used one Gates belt" → system parses into action, time, and parts consumed. No competitor treats voice as a first-class input method across the entire app.

13. **⭐ Real Stoplight Visuals** — Three-circle traffic signal indicators (not single colored dots) where active status glows and inactive circles are dim. Instantly readable across a room on TV/kiosk mode.

14. **⭐ Asset Reference Cards with Fix Only / Fix & Train AI** — Quick reference guides surface automatically inside every WO. AI uses reference card + full manual as knowledge base. Two modes: Fix Only (get it running fast) and Fix & Train (learn while you work). AI adapts guidance depth based on tech's experience with that repair type. No competitor offers adaptive AI-guided maintenance training built into the WO workflow.

15. **⭐ VR/AR-Guided Maintenance, 3D Virtual Disassembly & Facility Digital Twin** — Future vision: scan a machine with LiDAR, get a 3D model you can virtually pull apart, with AI highlighting the likely failed component and showing the repair path. Remote expert mode lets senior techs guide junior techs from anywhere. Walk-the-building scanning builds the entire facility (floor plan, asset registry, departments, racking) from a single physical walkthrough — replacing weeks of manual onboarding with a 2-hour walk. No CMMS competitor is even attempting this.

---

## NOTES & IDEAS (Captured During Sessions)

- **Global theme system:** Light / Dark / System toggle in sidebar footer or Settings. System mode follows OS `prefers-color-scheme`. Floor plan canvas is ALWAYS dark blue regardless of theme.
- Consider grid overlay on floor plans with coordinate system (e.g., D5) for walk-through reference → DECIDED: Alphanumeric grid, numbers 1-15 top, letters A-F side
- MaintainX's in-WO chat threads are their #1 feature — prioritize for Phase 3 → Added to Communication section with voice-to-text
- MaintainX CoPilot is Enterprise-only ($$$). Our AI should be available at lower tiers to undercut.
- Voice notes for WO completion summaries — huge for techs who hate typing
- Photo-to-asset from nameplate — huge time saver during onboarding floor walks
- Anomaly detection on meter readings — flag deviations from historical patterns
- AI-estimated job duration from historical data — helps with resource planning
- Custom fields should be available on ALL entity types (assets, WOs, parts, PMs)
- Saved views/filters should be shareable org-wide (admin creates standard views for team)
- MaintainX weakness: priority levels limited to None/Low/Medium/High, not customizable. We allow custom priorities.
- MaintainX weakness: reports can't be customized, filters reset on revisit. We should persist filter state.
- MaintainX weakness: no indoor floor plan mapping. Our biggest visual differentiator.
- Asset Essentials weakness: KPIs require manual reload after config changes. We fix this with WebSocket.
- Asset Essentials weakness: mobile app sync unreliable. PWA with offline-first fixes this.
- Reference cards should be buildable per asset OR per asset model — one card for "Biesse Rover B 1531" covers all 4 machines. Override at individual asset level if needed.
- Fix Only vs Fix & Train is a training multiplier — every WO becomes an optional learning opportunity. Track which techs have completed "trained" repairs to build a skills matrix over time.
- VR/AR: Start with phone camera AR (lower barrier) before investing in headset-based VR. Phone-based AR can do part scanning and basic overlay guidance immediately.
- 3D model library is a network effect — every customer who scans a Biesse Rover adds to the shared model that all Biesse Rover owners benefit from. This creates a competitive moat.
