# Detective Case Investigation Platform

## What This Is

A Next.js web application for small detective teams (2-5 people) to organize and investigate cases visually. Users manage evidence files, build entity graphs, and explore connections with a 2D D3.js force graph as the primary workspace and a toggleable 3D mindmap mode for spatial exploration.

## Core Value

A detective must be able to load a case, see all entities and their connections in an interactive graph, and switch between 2D and 3D views without losing context.

## Current Milestone: v2.0 Investigation Workspace Revamp

**Goal:** Rebuild the dashboard and graph workspace so the shell, graph interactions, filters, analysis panel, and AI command surface align with the saved reference model while preserving the investigation graph as the core product surface.

**Target features:**
- Reference-aligned dashboard and workspace layout with a shared light/dark visual system
- Unified `2D` / `3D` graph behavior with shared selection, focus, and manual placement intent
- Left-side `Raw Evidence` / `Filters & Layers` tabs plus a right-side on-canvas analysis panel
- Typeahead-first search, dimmed non-neighbor focus mode, iconic node shapes, and reference-aligned colors
- Persistent minimap, timeline, and AI command surface with known-intent graph/workspace triggers

## Requirements

### Validated

- Shared typed interfaces for `GraphNode`, `GraphEdge`, `Case`, and `EvidenceFile` are defined from Zod schemas and validated in Phase 1
- Mock case data now includes the Operation Nightfall investigation fixture with 17 entities and 25 connections, validated in Phase 1
- `caseRepository` now provides the abstraction boundary for case lookup and listing, validated in Phase 1
- Pure graph utility functions now live under `src/lib/graph/` with passing node-only Jest coverage, validated in Phase 1
- The app now enters through `/cases` and exposes a dashboard-style investigation list, validated in Phase 2
- The workspace shell now includes the case header, evidence sidebar, entity/connection counts, and a client-only graph placeholder, validated in Phase 2
- Modal-driven CRUD for cases, entities, and connections now works through the shared Zustand store, validated in Phase 2
- The 3D investigation canvas now renders the case graph with perspective projection, depth styling, and extracted pure projection/hit-test helpers, validated in Phase 3
- The workspace 3D mode now supports rotate, zoom, selection highlighting, hover feedback, and Reset/Pause/Labels controls with clean Canvas lifecycle handling, validated in Phase 3
- The 2D investigation graph now runs as a live D3 Canvas renderer with drag, pan, zoom, selective edge labels, and shared selection behavior, validated in Phase 4
- The 2D workspace now supports search-driven highlighting and auto-centering without restarting the simulation, validated in Phase 4
- The workspace now keeps both 2D and 3D renderers mounted under a shared `GraphWorkspace`, preserving selection continuity across toggles, validated in Phase 5
- The shared floating `NodeDetailPanel` now provides the cross-renderer analysis surface, and component-level RTL coverage now protects header/sidebar/panel behavior, validated in Phase 5
- The workspace now includes shared filter/layer controls, a footer timeline/status strip, an AI command placeholder, and persisted investigation state, validated in Phase 6
- The workspace now exports the active graph view as PNG and a detailed PDF report from one compact header menu, validated in Phase 7

### Active

- [ ] Reference-aligned dashboard shell and investigation workspace layout
- [ ] Shared `2D` / `3D` graph interaction model with aligned selection and focus behavior
- [ ] Search dropdown selection flow with selected-network emphasis and dimmed non-neighbor context
- [ ] Iconic entity-type node shapes and a calmer reference-aligned color system
- [ ] Left-panel tabbed evidence/filter architecture and right-side on-canvas analysis panel
- [ ] Persistent minimap, timeline, and light/dark theme system across dashboard and workspace
- [ ] Known-intent AI command surface that triggers predefined graph/workspace functions
- [ ] Well-structured Next.js app: reusable components, testable logic, clean separation of concerns

### Out of Scope

- Authentication / user accounts - no auth in v1, small team shares one instance
- Freeform AI/LLM interpretation - v2.0 will use known intents and predefined graph/workspace triggers first
- Real-time collaboration (WebSockets, multiplayer) - small team, async sharing via export
- Backend database - mock data only; API wiring deferred beyond the workspace revamp milestone
- Mobile layout - desktop-first, complex graph interactions do not map well to touch

## Context

- The UI reference (`image.png`) shows a dark-themed investigation board: case header at top, evidence sidebar on the left, a large 2D relationship graph in the center, timeline and AI bar at the bottom.
- The 3D graph reference (`3d_mindmap_fixed.html`) is a vanilla Canvas 3D mindmap with rotation, zoom, node highlighting, depth-based opacity, and glow effects. This interaction model should be reproduced in the 3D mode.
- Milestone `v2.0` uses the saved workspace references under `.planning/references/mac-ui-reference/` and the interpretation notes in `.planning/notes/` as the shell and behavior alignment source of truth.
- D3.js force layout is chosen for the 2D graph for maximum customizability and no abstraction ceiling when investigation graphs get complex.
- The 3D mode should reuse the same node/edge data structure as 2D; only the renderer differs.
- Components must remain individually testable: graph logic (D3 force, projection math) stays separated from React rendering.

## Constraints

- **Tech Stack**: Next.js (App Router), TypeScript, Tailwind CSS - modern, portable, team-friendly
- **Graph (2D)**: D3.js force simulation - direct control over layout, rendering, and interaction
- **Graph (3D)**: Custom Canvas renderer (ported from `3d_mindmap_fixed.html`) - no heavy library dependency
- **Data**: Mock data with typed interfaces - must be swappable for REST/GraphQL without changing UI components
- **Testing**: Jest for pure functions and shell smoke coverage; React Testing Library targeted in later UI phases
- **No Backend**: v1 is fully client-side; persistence via app state and a later localStorage bridge

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| D3.js for 2D graph | Full control over force layout and rendering; no abstraction limit | Implemented in Phase 4 with Canvas drawing, drag, pan, zoom, and search-centered navigation |
| Custom Canvas for 3D | Port the existing working `3d_mindmap_fixed.html`; avoids extra heavy dependencies | Implemented in Phase 3 with extracted pure math helpers and a client-only `MindMap3D` renderer |
| Next.js App Router | Modern routing with future server/data-fetching flexibility | `/` now redirects into `/cases`, and the workspace route uses a client boundary for the graph shell |
| Mock data layer with typed interfaces | Decouple UI from data source; swap to API without touching components | Implemented in Phase 1 and consumed through repository-backed hooks in Phase 2 |
| Single toggle for 2D/3D | Same dataset, different renderer avoids data sync complexity | Phase 2 already carries shared `viewMode` state in Zustand |
| Modal-driven CRUD in the shell | Explicit creation/deletion flows reduce ambiguity in the early workspace | Implemented in Phase 2 for case, entity, and connection management |
| 3D interaction stability over abstraction | Preserve the reference interaction model while avoiding React-driven animation churn | Phase 3 keeps camera and animation state in refs, isolates draw math, and cleans up rAF/resize work explicitly |
| 2D interaction stability over maximal fidelity | Keep drag/pan/zoom and simulation lifecycle reliable even if some polish needs pragmatism | Phase 4 isolates D3 simulation setup from redraw-only state and keeps search/selection from recreating the layout |
| Shared workspace owns graph composition | Keeping both renderers mounted under one wrapper preserves renderer-local state and avoids shell duplication | Implemented in Phase 5 with `GraphWorkspace` as the graph-area owner and CSS-only visibility toggling |
| Shared detail panel over renderer-local cards | A single floating investigation card keeps node analysis consistent across modes and aligns with evidence highlight flow | Implemented in Phase 5 with `NodeDetailPanel` and shared Escape/deselect dismissal |
| Shared controls and footer state in the store | Filters, label layers, footer context, and reload continuity should behave identically across both renderers | Implemented in Phase 6 with Zustand-backed filter/layer preferences, footer surfaces, and persisted workspace state |
| Direct canvas export first, DOM capture second | Export should reflect the active renderer view without pulling in unrelated workspace chrome; DOM capture remains useful as a fallback | Implemented in Phase 7 with renderer export handles, canvas-first PNG capture, and a jsPDF report flow |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition**:
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone**:
1. Full review of all sections
2. Core Value check - still the right priority?
3. Audit Out of Scope - reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-10 for milestone v2.0 kickoff*
