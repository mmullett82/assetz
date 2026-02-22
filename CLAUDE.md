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
- **Floor Plans:** Canvas or SVG-based interactive floor plan viewer with draggable asset pins
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

### Hosting
- Frontend: Vercel
- Backend: Railway or AWS (Grant's decision)

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
├── public/                  # Static assets, PWA manifest, icons
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

## API Base URL

Development: `http://localhost:8000/api`
The backend API documentation (when running) will be at `http://localhost:8000/docs` (FastAPI auto-generates Swagger UI).

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

**Phase 1: Core CMMS (Weeks 1–8)**
Goal: Functional enough to replace Asset Essentials at SOLLiD for daily operations.

Priority build order:
1. Project scaffolding, auth pages, app shell with sidebar nav
2. Asset registry (CRUD, detail views, barcode display)
3. Work order management (create, status workflow, comments, photos)
4. KPI dashboard with placeholder data (wire to WebSocket later)
5. PM schedule management
6. Parts inventory with reservation UI
7. Settings and configuration

## Important Context

This product is being dogfooded at SOLLiD Cabinetry (cabinet manufacturing) as the first production deployment. The maintenance team will use this daily. Manufacturing floor conditions apply — the mobile experience must work with gloves, in poor lighting, and under time pressure. Fast, clear, scannable.
