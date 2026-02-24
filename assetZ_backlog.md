# assetZ Product Backlog
## Last Updated: February 23, 2026

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
| 1 | Project scaffolding | 🟢 | Next.js 14, TypeScript, Tailwind, App Router |
| 2 | Asset registry (CRUD, list, detail) | 🟢 | Basic version |
| 3 | Work order management | 🟢 | Basic version |
| 4 | KPI dashboard | 🟢 | Basic cards, no gauge dials yet |
| 5 | PM schedule management | 🟢 | Basic version |
| 6 | Parts inventory with reservations | 🟢 | Basic version |
| 7 | Red/Yellow/Green scoreboard | 🟢 | Row highlighting, no stoplight icons yet |
| 8 | Settings & configuration | 🟢 | Started, may not be complete |
| 9 | Enterprise form enhancements | 🟢 | Claude Code started but didn't finish |
| 10 | Asset floor plan / map | 🟢 | Claude Code started building this |

---

## PHASE 1.5: UI MODERNIZATION (Current Priority)

### Three-View System (MaintainX-Inspired)
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Panel View (two-pane: list + detail) | 🟢 | Default view for all modules |
| 2 | Table View (data grid with column picker) | 🟢 | Sortable, bulk select, inline edit |
| 3 | Calendar View (WOs and PMs) | 🟢 | Weekly/monthly toggle, overdue in red |
| 4 | View toggle icons (top-right of list pages) | 🟢 | Persist user's last selection |

### Universal Filter Bar
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 5 | "+ Add Filter" horizontal filter system | 🟢 | Replace sidebar tree filtering |
| 6 | Filter pills/chips (removable, stackable) | 🟢 | AND logic between multiple filters |
| 7 | Save Filter combinations (personal + org-wide) | 🟡 | Named saved views |
| 8 | Default saved filters per module | 🟢 | "My Open WOs", "Low Stock", etc. |

### Navigation & Layout
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 9 | Sidebar: hamburger toggle at TOP LEFT | 🟢 | Not bottom |
| 10 | Sidebar: collapsed = icons only (~60px) | 🟢 | Tooltips on hover |
| 11 | Sidebar: expanded = icons + labels (~220px) | 🟢 | |
| 12 | Global search bar (per-module) | 🟢 | Searches name, title, ID, description, barcode |
| 13 | Sort controls dropdown | 🟢 | Smart defaults: WOs = overdue first, then due soonest |
| 14 | Three-dot menu (⋯) per row | 🟢 | Replaces broken right-click context menu |

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
| 1 | Purchase info (price, date, invoice, expected life, replacement cost, salvage value) | 🟢 | Enhancement pass started |
| 2 | Warranty tracking (title, expiration, vendor) | 🟢 | |
| 3 | Dates (manufacture, placed, removed, out-of-service begin/end) | 🟢 | |
| 4 | Condition assessment (condition, date, est. replace date, assessment note) | 🟢 | |
| 5 | Calculated rollups (Total WO Cost, Total Labor Hrs, Total Downtime) | 🟡 | Read-only, calculated from WO data |
| 6 | Safety & Procedures notes (safety, training, shutdown, LOTO, emergency) | 🟢 | |
| 7 | Assigned To (primary tech), Emergency Contact | 🟢 | |
| 8 | Tag Number, RFID field | 🟢 | |
| 9 | Photo upload, Document attachments | 🟡 | |
| 10 | Check-out/sign-out tracking with log | 🔴 | |
| 11 | Associated Assets (beyond parent-child) | 🔴 | Links to graph DEPENDS_ON/FEEDS |
| 12 | Electrical Panel & Specs (custom field) | 🔴 | Via custom fields system |

### PM Form — Missing Fields
| # | Field/Section | Status | Notes |
|---|--------------|--------|-------|
| 1 | PM Type: Time-Based, Meter-Based, Time-Based with Meter Override | 🟢 | |
| 2 | Expected completion (X days, X hours after generation) | 🟢 | |
| 3 | WO creation time (e.g., generate at 08:00 AM) | 🟢 | |
| 4 | Default WO Status for generated WOs | 🟢 | |
| 5 | Pre-filled Problem/Cause codes on PM template | 🟢 | |
| 6 | End conditions (no end, after X occurrences, on date) | 🟢 | |
| 7 | Season start option (seasonal equipment) | 🔴 | |
| 8 | Dependency-aware skip: "Don't create unless prior PMs completed" | 🟢 | More advanced than simple skip_if_open |
| 9 | Exclusion Conditions (holidays, shutdowns) | 🔴 | |
| 10 | WO generation timing (next scheduled vs next work day) | 🔴 | |
| 11 | PM Parts section (attach required parts to template) | 🟢 | Auto-reserve when WO generates |
| 12 | **PM Stacking/Grouping** | 🔴 | ⭐ Combine daily+weekly+monthly PMs falling on same day into single WO with all tasks |

### WO Form — Missing Fields
| # | Field/Section | Status | Notes |
|---|--------------|--------|-------|
| 1 | "Breakdown" work type | 🟢 | Add alongside preventive, corrective, emergency, inspection |
| 2 | Origin Info (origin type, originated date, originator, assigned date) | 🟢 | |
| 3 | Action Taken (completion datetime + description) | 🟢 | |
| 4 | Planning section (scheduling/resource) | 🔴 | |
| 5 | Contact User button (reach originator) | 🔴 | |
| 6 | Signature for completion | 🔴 | MaintainX has this — accountability layer |
| 7 | Cost tracking (labor cost, travel, parts cost, other) | 🔴 | |
| 8 | Time tracking (time spent on WO) | 🟡 | |

### Parts Form — Missing Fields
| # | Field/Section | Status | Notes |
|---|--------------|--------|-------|
| 1 | Alternate Part # (cross-reference equivalent parts) | 🟢 | |
| 2 | Manufacturer Barcode | 🟢 | |
| 3 | Par Quantity (ideal stock level) | 🟢 | |
| 4 | Min/Max Level reorder method | 🟢 | |
| 5 | Qty on Back Order | 🟢 | |
| 6 | Multiple storage locations per part | 🔴 | |
| 7 | Parts Kits (pre-built groups for common tasks) | 🔴 | Pull as a unit for WO |
| 8 | Photo upload, Document attachments | 🟡 | |
| 9 | Parts associated to assets (view parts list from asset) | 🔴 | ⭐ Key workflow feature |

---

## PHASE 2: INTELLIGENCE LAYER

### Floor Plan / Asset Map ⭐
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Upload floor plan image per facility/building | 🟡 | Claude Code started |
| 2 | Pin assets to floor plan positions (drag & drop) | 🟡 | |
| 3 | Real-time status overlay (pin color = asset status) | 🟢 | ⭐ Green=operational, Yellow=warning, Red=down |
| 4 | Click pin to see asset detail (mini popup) | 🟢 | |
| 5 | Dependency chain visualization on floor plan | 🟢 | ⭐ DEPENDS_ON = solid red lines, FEEDS = dashed yellow lines |
| 6 | Ripple effect animation when asset goes down | 🔴 | ⭐ Shows downstream impact visually spreading |
| 7 | Heat map overlay (failure frequency, cost, downtime) | 🔴 | ⭐ Toggle between different heat map types |
| 8 | Department zone boundaries on floor plan | 🟢 | Color-coded zones matching department |
| 9 | Multi-floor support (floor selector tabs) | 🔴 | |
| 10 | Grid overlay with coordinates (e.g., D5) | 🔴 | For reference during walk-throughs |
| 11 | Zoom + pan with smooth navigation | 🟢 | |
| 12 | Filter map pins by status, category, department | 🟢 | Uses same filter bar as list views |
| 13 | "Map View" as 4th view option on Assets page | 🔴 | Alongside Panel/Table/Calendar |
| 14 | Technician location on map (future: BLE beacons) | 🔴 | Phase 3+ |
| 15 | Production flow arrows showing material path | 🔴 | ⭐ Visual of how material moves through facility |
| 16 | Buffer status indicators on FEEDS relationships | 🔴 | "4 hrs of staged parts remaining" |
| 17 | QR code scanning → auto-centers map on that asset | 🔴 | |

### Self-Service Map Builder ⭐
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Upload floor plan image (JPG, PNG, PDF) | 🟢 | JPG/PNG background image upload — per building/floor |
| 2 | Draw department zones on floor plan (polygon drawing tool) | 🟢 | Click to place vertices, close shape, name zone |
| 3 | Drag & drop asset pins onto floor plan | 🟢 | Select from asset list, drag to position on map |
| 4 | Snap-to-grid option for clean alignment | 🟢 | Toggle grid overlay on/off |
| 5 | Label placement tool (department names, area labels) | 🟢 | Text overlay on map |
| 6 | Draw walls/barriers (line drawing tool) | 🟢 | Visual representation of physical layout |
| 7 | Draw production flow paths (directional arrows) | 🟢 | Show material movement through facility |
| 8 | Pin customization (icon shape by asset category, size by criticality) | 🟢 | CNC = one icon, conveyor = another, etc. |
| 9 | Undo/redo for all map edits | 🟢 | Essential for builder usability |
| 10 | Save draft / publish workflow | 🟢 | Draft → localStorage draft key; Publish → published key read by floor plan viewer |
| 11 | Multi-floor builder (add floors, name them, navigate between) | 🟢 | Floor tabs with add/rename/delete. Active floor selector at bottom of builder. |
| 12 | Import from CAD/DXF (stretch goal) | 🔴 | Auto-trace walls from architectural drawings |
| 13 | Template facility layouts (common manufacturing layouts) | 🟢 | Linear Flow, U-Shape, L-Shape, Open Floor — with SVG mini-previews |
| 14 | AI-assisted map building | 🔴 | ⭐ Upload photo of floor → AI suggests zones and asset positions |
| 15 | Bulk pin placement (CSV import with x,y coordinates) | 🟢 | CSV paste or file upload with parse preview table before import |

*Note: Users who want help building their map can use AI onboarding (Phase 3, Step 3). This self-service builder is for users who want to do it themselves.*

### PM Checklists & Operator Rounds ⭐
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Checklist template builder (admin creates reusable checklists) | 🔴 | Drag and drop to reorder items |
| 2 | Checklist item types: checkbox, pass/fail, numeric reading, text note, photo required | 🔴 | ⭐ Not just checkboxes — capture real data |
| 3 | Attach checklists to PM templates (auto-included when PM WO generates) | 🔴 | Daily PM → daily checklist, monthly PM → monthly checklist |
| 4 | Operator self-service checklists (machine operator completes daily checks) | 🔴 | ⭐ Operator opens app, scans QR on machine, gets today's checklist |
| 5 | Checklist completion tracking (who completed, when, how long) | 🔴 | |
| 6 | Failed checklist items auto-generate corrective WO | 🔴 | ⭐ Operator marks "belt tension: FAIL" → WO created for maintenance |
| 7 | Photo verification on checklist items (require photo proof) | 🔴 | "Take photo of clean filter" |
| 8 | Numeric readings with acceptable range (flag out-of-range) | 🔴 | "Pressure: _____ PSI (normal: 80-120)" → red if outside range |
| 9 | Checklist history per asset (see all past completed checklists) | 🔴 | Audit trail |
| 10 | Checklist compliance reporting (% completed on time by operator/asset) | 🔴 | Feeds into department performance reporting |
| 11 | Digital signature on checklist completion | 🔴 | Accountability |
| 12 | Offline checklist completion (sync when back online) | 🔴 | For areas with poor connectivity |

*Note: This is a key differentiator for operator engagement. Operators become part of the maintenance process through daily checklists instead of just calling when something breaks. Feeds data into predictive maintenance and reporting.*

### QR & Barcode Scanning
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Scan button in global header (accessible from any page) | 🔴 | Camera opens, scan any code, routes to correct item |
| 2 | Asset QR scan → opens asset detail page | 🔴 | |
| 3 | Asset QR scan → opens daily checklist for that asset (if operator) | 🔴 | ⭐ Operator workflow: walk up, scan, complete checklist |
| 4 | Part barcode scan → opens part detail / stock info | 🔴 | |
| 5 | Part barcode scan from within WO → adds part to WO parts used | 🔴 | Tech scans part while working, auto-logs usage |
| 6 | QR scan on floor plan → centers map on that asset | 🔴 | |
| 7 | Generate and print QR codes for assets from within app | 🔴 | DYMO LabelWriter integration |
| 8 | Generate and print barcode labels for parts from within app | 🔴 | DYMO LabelWriter integration |
| 9 | Bulk QR/barcode generation (select multiple, print batch) | 🔴 | |
| 10 | Support for existing barcodes (manufacturer part numbers as barcodes) | 🔴 | Match SOLLiD standard: manufacturer part # = barcode |

*Note: Both QR codes and barcodes are still widely used. QR for assets (more data, links to app), barcodes for parts (matches manufacturer labels, faster scanning for inventory). Support both.*

### KPI Dashboard (Modern Design)
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Large number KPI cards | 🟢 | Bold primary metric, clearly readable |
| 2 | Sparkline trend charts per card | 🟢 | 7-day mini trend inline with each KPI |
| 3 | Color-coded card borders + trend arrows | 🟢 | Red/yellow/green border + up/down arrow indicator |
| 4 | KPI configuration builder | 🔴 | Admin creates custom KPIs, sets data sources, filters, thresholds |
| 5 | Dashboard layout customization | 🔴 | Drag and resize KPI cards |
| 6 | KPI auto-refresh via WebSocket | 🔴 | No manual reload needed — wire when backend is live |
| 7 | Drill-down on any KPI card | 🔴 | Click PM Compliance → see list of completed/missed PMs behind that number |
| 8 | Time range selector on dashboard | 🔴 | This Week / This Month / This Quarter / Custom |
| 9 | KPI comparison view | 🔴 | This period vs last period side by side |

### Scoreboard Enhancements
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Stoplight icon next to each tech name | 🟢 | ⭐ Actual traffic signal visual (3 stacked circles) |
| 2 | Keep row color highlighting AND add stoplight | 🟢 | Both together |
| 3 | TV/kiosk mode (auto-rotate, large text) | 🟢 | For shop floor display |

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
| 1 | Sidebar chat (collapsible) | 🔴 | Open-ended conversations, setup, complex queries |
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
| 1 | PWA manifest and service worker | 🟢 | |
| 2 | Offline mode with reliable sync | 🔴 | ⭐ Fix AE's biggest pain point |
| 3 | Barcode/QR scanning via camera | 🔴 | |
| 4 | Push notifications | 🔴 | |
| 5 | Large buttons, simplified mobile layout | 🔴 | Like MaintainX — accessible to non-tech workers |

### Communication
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | In-app messaging (WO chat threads) | 🔴 | MaintainX's #1 rated feature |
| 2 | @mentions in comments | 🔴 | |
| 3 | Photo/video attachments in comments | 🔴 | |
| 4 | Notification preferences per user | 🔴 | |

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

### Operations & Department Performance Reporting ⭐

**Maintenance Department KPIs (for Kade / Ops Manager)**
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Maintenance cost as % of asset replacement value (RAV) | 🔴 | Industry benchmark: 2-5% |
| 2 | Planned vs unplanned maintenance ratio | 🔴 | ⭐ Target: 80% planned / 20% unplanned. Shows if department is proactive or reactive |
| 3 | PM compliance rate (completed on time vs total scheduled) | 🟢 | Already on dashboard — extend to reporting with drill-down |
| 4 | Mean Time to Repair (MTTR) | 🟢 | Already on dashboard — extend to reporting with trending |
| 5 | Mean Time Between Failures (MTBF) per asset | 🔴 | ⭐ Shows equipment reliability improving or declining |
| 6 | Wrench time (actual hands-on-tool time vs total labor hours) | 🔴 | Industry best practice: 55%+ is good |
| 7 | Emergency/reactive work order percentage | 🔴 | ⭐ Trending down = department is improving |
| 8 | Backlog age (how old are open WOs on average) | 🔴 | Growing backlog = understaffed or inefficient |
| 9 | Schedule compliance (WOs completed as scheduled vs rescheduled) | 🔴 | |
| 10 | First-time fix rate (WO completed without reopening) | 🔴 | Quality of repairs metric |

**Production Support Metrics**
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 11 | Equipment availability (uptime %) per asset and overall | 🔴 | ⭐ THE metric production cares about most |
| 12 | Downtime hours by department / asset / cause | 🔴 | ⭐ Where are we losing production? |
| 13 | Maintenance impact on production (downtime during scheduled production hours) | 🔴 | Separates scheduled maintenance downtime from unplanned |
| 14 | Cost per unit of production attributable to maintenance | 🔴 | Ties maintenance cost to production output |
| 15 | Asset ROI (maintenance cost vs production value generated) | 🔴 | Which machines earn their keep? |

**Reporting Features**
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 16 | Executive summary report (auto-generated monthly/weekly) | 🔴 | ⭐ One-page PDF: here's how maintenance supported production this month |
| 17 | Trend reports (any metric over time with trendlines) | 🔴 | Show improvement or decline |
| 18 | Department comparison (if multi-facility: compare facilities) | 🔴 | |
| 19 | Scheduled report delivery (email PDF to Kade every Monday) | 🔴 | |
| 20 | Natural language report queries (AI) | 🔴 | "How did we do on PM compliance in January?" |
| 21 | Exportable to PDF and CSV | 🔴 | |
| 22 | Red/Yellow/Green scorecards for leadership presentations | 🟢 | Already built — extend with exportable format |

*Note: These metrics speak production's language. Kade doesn't care about "PM compliance" in isolation — he cares about "equipment availability went from 89% to 94% and unplanned downtime dropped 30% since we implemented assetZ." Frame all reports around production impact.*

### Competitive Migration & Import ⭐

**CSV/Excel Import (Phase 2 priority)**
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Upload CSV/Excel file import wizard | 🔴 | Step-by-step guided import flow |
| 2 | AI-powered column mapping | 🔴 | ⭐ AI reads column headers and auto-maps to assetZ fields |
| 3 | Preview and review before import | 🔴 | Show sample rows with mapped fields, user confirms |
| 4 | Validation and error reporting | 🔴 | Flag missing required fields, duplicates, format issues |
| 5 | Import assets, WOs, parts, PMs, locations as separate uploads | 🔴 | One entity type per import, guided order |
| 6 | Rollback capability (undo an import within 24 hours) | 🔴 | Safety net for bad imports |

**API-Based Direct Migration (Phase 3)**
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 7 | MaintainX direct import (OAuth + API pull) | 🔴 | ⭐ User logs into MaintainX from within assetZ, we pull everything |
| 8 | Asset Essentials / Brightly direct import | 🔴 | API-based migration |
| 9 | UpKeep direct import | 🔴 | API-based migration |
| 10 | Fiix direct import | 🔴 | API-based migration |
| 11 | Limble direct import | 🔴 | API-based migration |
| 12 | Data model mapping layer per platform | 🔴 | Translates competitor fields/statuses/categories to assetZ equivalents |
| 13 | Migration progress dashboard | 🔴 | Real-time progress bar |
| 14 | Post-migration validation report | 🔴 | Summary of what imported and any issues |
| 15 | Side-by-side comparison (old system vs assetZ) | 🔴 | Verify data came through correctly |

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

### Multi-Tenancy & SaaS
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Organization isolation (org_id on every record) | 🔴 | |
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

10. **⭐ Self-Service Map Builder** — No competitor offers an in-app facility map builder where users can draw zones, place pins, and design their floor plan without professional services. Combined with AI-assisted building (upload a photo → AI suggests layout).

11. **⭐ Graph-Powered Predictive Maintenance** — Not just sensor thresholds (any IoT platform does that). Our graph database enables cross-asset prediction: "Asset X failed with this vibration pattern. Asset Y is the same model and trending the same way — inspect now." No competitor connects failure prediction across related assets.

12. **⭐ Zero-Friction Migration** — Direct API import from top competitors (MaintainX, Asset Essentials, UpKeep, Fiix, Limble). Plus AI-powered CSV mapping for any platform. Eliminates the #1 reason companies don't switch.

13. **⭐ Operator Engagement Through Checklists** — Operators scan QR, complete daily checklists, failed items auto-generate WOs. Turns operators into the first line of maintenance defense. No competitor makes this workflow this seamless.

14. **⭐ Production-Language Reporting** — Reports framed around what operations managers care about: equipment availability, downtime impact, maintenance cost per production unit. Not just maintenance metrics — production impact metrics.

---

## NOTES & IDEAS (Captured During Sessions)

- Consider grid overlay on floor plans with coordinate system (e.g., D5) for walk-through reference
- MaintainX's in-WO chat threads are their #1 feature — prioritize for Phase 3
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
