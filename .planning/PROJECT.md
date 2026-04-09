# Detective Case Investigation Platform

## What This Is

A Next.js web application for small detective teams (2–5 people) to organize and investigate cases visually. Users manage evidence files, build entity graphs, and explore connections — with a 2D D3.js force graph as the primary workspace and a toggleable 3D mindmap mode for spatial exploration.

## Core Value

A detective must be able to load a case, see all entities and their connections in an interactive graph, and switch between 2D and 3D views without losing context.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Case header with case name, status, and action buttons (Export Report, Actions)
- [ ] Left sidebar listing evidence categories and files (Dump data from iPhone, laptop, scans, etc.)
- [ ] Main 2D force graph canvas using D3.js — nodes are entities, edges are connections
- [ ] Toggle button to switch to 3D mindmap mode (Canvas-based 3D projection, same data as 2D)
- [ ] Node click: highlight node + connected edges, show detail panel
- [ ] Entity/connection count stats in toolbar ("20 entities, 25 connections")
- [ ] Filters & Layers control panel
- [ ] Timeline bar at the bottom of the canvas
- [ ] AI command input bar (UI placeholder — no logic in v1)
- [ ] Create a case, add evidence items, add entities, draw connections, save to state
- [ ] Export report (snapshot/PDF/shareable of the investigation)
- [ ] Mock data layer — all case data hardcoded, swappable for real API later
- [ ] Well-structured Next.js app: reusable components, testable logic, clean separation of concerns

### Out of Scope

- Authentication / user accounts — no auth in v1, small team shares one instance
- Real AI/LLM integration — command bar is placeholder only in v1
- Real-time collaboration (WebSockets, multiplayer) — small team, async sharing via export
- Backend database — mock data only; API wiring deferred to v2
- Mobile layout — desktop-first, complex graph interactions don't map well to touch

## Context

- The UI reference (image.png) shows a dark-themed investigation board: case header at top, evidence sidebar on the left, a large 2D relationship graph in the center, timeline and AI bar at the bottom.
- The 3D graph reference (3d_mindmap_fixed.html) is a vanilla Canvas 3D mindmap with rotation, zoom, node highlighting, depth-based opacity, and glow effects. This interaction model should be reproduced in the 3D mode.
- D3.js force layout chosen for the 2D graph — maximum customizability, no abstraction ceiling when investigation graphs get complex.
- The 3D mode should reuse the same node/edge data structure as 2D — only the renderer differs.
- Components must be individually testable: graph logic (D3 force, projection math) separated from React rendering.

## Constraints

- **Tech Stack**: Next.js (App Router), TypeScript, Tailwind CSS — modern, portable, team-friendly
- **Graph (2D)**: D3.js force simulation — direct control over layout, rendering, interaction
- **Graph (3D)**: Custom Canvas renderer (ported from 3d_mindmap_fixed.html) — no heavy library dependency
- **Data**: Mock data with typed interfaces — must be swappable for REST/GraphQL without changing UI components
- **Testing**: Jest + React Testing Library for components; pure function tests for graph math
- **No Backend**: v1 is fully client-side; persistence via React state + localStorage bridge

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| D3.js for 2D graph | Full control over force layout and SVG rendering; no abstraction limit | — Pending |
| Custom Canvas for 3D | Port the existing working 3d_mindmap_fixed.html; avoids 3d-force-graph bundle size | — Pending |
| Next.js App Router | Modern routing, server components available for future data fetching | — Pending |
| Mock data layer with typed interfaces | Decouple UI from data source; swap to API without touching components | — Pending |
| Single toggle for 2D/3D | Same dataset, different renderer — avoids data sync complexity | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-09 after initialization*
