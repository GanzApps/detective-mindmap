# Roadmap: Detective Case Investigation Platform

## Overview

Seven phases deliver a fully interactive investigation board: a typed data foundation comes first so every downstream component builds on a stable, swappable contract; the Next.js shell and case management CRUD follow to give the app its navigable structure; the 3D Canvas renderer is ported next while the vanilla source is freshest and its pure math extracted for isolated testing; the D3.js 2D force graph builds on those same pure-function foundations; both renderers are then wired together with a CSS-toggle workspace and shared selection state; controls, filters, timeline, and localStorage persistence complete the interactive surface; and finally export rounds out the v1 feature set.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Shared Zod schemas, TypeScript types, mock data, and caseRepository interface
- [x] **Phase 2: App Shell** - Next.js layout, case header, evidence sidebar, Zustand store, and case management CRUD
- [x] **Phase 3: 3D Renderer Port** - Pure projection/hit-test functions extracted first, then MindMap3D Canvas component
- [x] **Phase 4: 2D Force Graph** - D3 simulation in useRef, Canvas draw, pan/zoom/drag, node selection
- [x] **Phase 5: GraphWorkspace + Toggle** - CSS display:none toggle connecting both renderers, NodeDetailPanel, component tests
- [x] **Phase 6: Controls + Filters + Timeline + Persistence** - FilterPanel, Layers, TimelineBar, AICommandBar placeholder, localStorage
- [x] **Phase 7: Export** - PNG snapshot and PDF report via canvas-first export with html2canvas + jsPDF support

## Phase Details

### Phase 1: Foundation
**Goal**: All shared types, Zod schemas, mock case data, and the caseRepository interface exist and are importable by every downstream phase.
**Depends on**: Nothing (first phase)
**Requirements**: DATA-01, DATA-02, DATA-03, ARCH-01, ARCH-04
**Success Criteria** (what must be TRUE):
  1. `GraphNode`, `GraphEdge`, `Case`, and `EvidenceFile` TypeScript types are inferred from Zod schemas and pass `tsc --noEmit` with zero errors
  2. Mock case data contains at least 1 complete case with 15+ entities and 20+ connections that satisfies all Zod schemas at runtime
  3. `caseRepository.fetchCase(id)` and `caseRepository.listCases()` return typed data from the mock implementation
  4. Pure graph utility functions in `lib/graph/` (`getConnectedIds`, `buildGraphFromCase`) have passing Jest unit tests with no DOM dependency
**Plans**: 5 plans
**Research needed**: No

Plans:
- [x] 01-01-PLAN.md Ã¢â‚¬â€ Scaffold Next.js project, install dependencies (zod, zustand, jest, ts-jest), configure tsconfig strict mode and jest.config.ts with ts-jest node environment
- [x] 01-02-PLAN.md Ã¢â‚¬â€ Create `src/lib/graph/graphTypes.ts` with all Zod schemas, TypeScript types, ENTITY_TYPE_COLOR const, getConnectedIds, and buildGraphFromCase
- [x] 01-03-PLAN.md Ã¢â‚¬â€ Create `src/lib/data/dataTypes.ts` (Case, EvidenceFile, EvidenceCategory schemas) and `src/lib/data/mockCases.ts` (Operation Nightfall, 17 nodes, 25 edges, Zod-validated at import)
- [x] 01-04-PLAN.md Ã¢â‚¬â€ Create `src/lib/data/caseRepository.ts` with CaseRepository interface and mockCaseRepository backed by mockCases.ts
- [x] 01-05-PLAN.md Ã¢â‚¬â€ Write Jest unit tests for getConnectedIds, buildGraphFromCase, and Zod schema validation; confirm node test environment with zero DOM imports

### Phase 2: App Shell
**Goal**: The Next.js application is navigable with a case workspace page, fully wired case header, evidence sidebar, Zustand global store, and working case management CRUD.
**Depends on**: Phase 1
**Requirements**: SHELL-01, SHELL-02, SHELL-03, SHELL-04, CASE-01, CASE-02, CASE-03, CASE-04, CASE-05, CASE-06, ARCH-02, ARCH-03
**Success Criteria** (what must be TRUE):
  1. Visiting `/cases` shows a list of cases with name, entity count, and last modified date
  2. Visiting `/cases/[id]` shows the case header (name, status badge, Export Report button, Actions dropdown) and evidence sidebar with category tree and file list
  3. Clicking an evidence file in the sidebar triggers a visual highlight callback (entity highlight integration deferred to Phase 5, but the callback is wired)
  4. Entity and connection counts display correctly in the toolbar
  5. User can create a case, add entities, draw connections, delete entities and connections Ã¢â‚¬â€ all mutations update Zustand store and are reflected in the UI without page reload
  6. All graph area components are wrapped in `dynamic({ ssr: false })` Ã¢â‚¬â€ the app builds without SSR errors
**Plans**: 5 plans
**Research needed**: No
**UI hint**: yes

Plans:
- [x] 02-01: Scaffold Next.js App Router project Ã¢â‚¬â€ `app/page.tsx` redirect, `app/cases/page.tsx` case list, `app/cases/[caseId]/page.tsx` workspace shell; configure Tailwind dark theme; establish `dynamic({ ssr: false })` pattern on a graph placeholder before any D3 code
- [x] 02-02: Implement Zustand store (`store/caseStore.ts`) Ã¢â‚¬â€ slices for case data, selected node ID, active filters, view mode ('2d' | '3d'); wire `useCaseData` hook to load from `caseRepository`
- [x] 02-03: Build `CaseHeader` component Ã¢â‚¬â€ case name, status badge, Export Report button (no-op), Actions dropdown; build `EvidenceSidebar` with category tree and file list; wire evidence file click to store
- [x] 02-04: Build case management CRUD UI Ã¢â‚¬â€ create case form, add entity form, draw connection form, delete entity/connection actions; all mutations go through Zustand store actions
- [x] 02-05: Build `CaseListPage` with entity count and last modified; add `SHELL-04` entity/connection count display in toolbar area; end-to-end smoke test: create case Ã¢â€ â€™ add entity Ã¢â€ â€™ view in list

### Phase 3: 3D Renderer Port
**Goal**: The 3D mindmap from `3d_mindmap_fixed.html` runs as a React Canvas component with all interactions preserved, no animation loop leaks, sharp HiDPI rendering, and pure math functions independently tested.
**Depends on**: Phase 1
**Requirements**: GRAPH3D-01, GRAPH3D-02, GRAPH3D-03, GRAPH3D-04, GRAPH3D-05, GRAPH3D-06, GRAPH3D-07, GRAPH3D-08, GRAPH3D-09
**Success Criteria** (what must be TRUE):
  1. The 3D Canvas renders the mock case graph with depth-based opacity and glow effects matching the reference implementation
  2. Dragging the canvas rotates the graph; scroll wheel zooms; the camera state does not trigger React re-renders
  3. Clicking a node highlights it and its direct connections; all other nodes dim; NodeDetailPanel stub receives the selected node ID
  4. A hover tooltip shows the node label and connection count
  5. Reset view, Pause/Resume rotation, and Labels toggle controls work correctly
  6. The component unmounts cleanly Ã¢â‚¬â€ no requestAnimationFrame leaks verified by React Strict Mode double-invocation
  7. On a Retina display, node edges are sharp (no blurring) and click hit zones match drawn node positions
**Plans**: 5 plans
**Research needed**: No

Plans:
- [x] 03-01: Extract pure functions from `3d_mindmap_fixed.html` into `lib/graph/` Ã¢â‚¬â€ `projection3d.ts` (`projectNode`), `hitTest.ts` (`hitTest3D`), `graphLayout.ts` (`getConnectedIds` Ã¢â‚¬â€ shared with Phase 1); write Jest tests for each with known inputs; zero DOM imports
- [x] 03-02: Extract stateless render function Ã¢â‚¬â€ `lib/graph/renderer3d.ts` (`drawFrame3D`); wrap every per-node draw call in `ctx.save()/ctx.restore()` to eliminate the `globalAlpha` leak from the reference source; preserve depth-sort, glow, and opacity logic
- [x] 03-03: Build `MindMap3D` component skeleton Ã¢â‚¬â€ `canvasRef`, camera state in `useRef` (rotX, rotY, zoom), `dragging` ref, `hoverId` ref, `autoRot` ref, `rafId` ref; implement `ResizeObserver` in `useEffect` with `dpr` scaling via `ctx.setTransform`; add `cancelAnimationFrame` cleanup and `running` boolean guard for Strict Mode
- [x] 03-04: Wire animation loop, mouse handlers, and `hitTest3D` into `MindMap3D`; connect Reset/Pause/Labels control props; implement hover tooltip via portal; verify no `setState` calls occur during drag or animation frames
- [x] 03-05: Mark `MindMap3D` as `'use client'`; wrap import in `dynamic({ ssr: false })` at page level; run `next build` and confirm zero SSR errors; manual Retina DPR test and strict mode leak test

### Phase 4: 2D Force Graph
**Goal**: The D3.js force graph renders all case entities on Canvas with drag, pan, zoom, node selection, and edge labels Ã¢â‚¬â€ with simulation lifecycle fully isolated from React rendering.
**Depends on**: Phase 1
**Requirements**: GRAPH2D-01, GRAPH2D-02, GRAPH2D-03, GRAPH2D-04, GRAPH2D-05, GRAPH2D-06, GRAPH2D-07, GRAPH2D-08, GRAPH2D-09, GRAPH2D-10
**Success Criteria** (what must be TRUE):
  1. All mock case entities appear as labeled, color-coded nodes (by entity type) on the Canvas with visible edge relationship labels
  2. Dragging a node repositions it and the simulation adjusts neighbors; drag releases node back to simulation without position jump
  3. Panning (drag on empty space) and zooming (scroll wheel) work with smooth limits; Zoom to Fit resets the viewport
  4. Clicking a node highlights it and its direct edges, dims everything else, and emits the selected node ID upward; clicking empty canvas deselects
  5. Typing in the node search input highlights matching nodes without restarting the simulation
  6. Simulation does not restart when filter state, selection, or UI state changes Ã¢â‚¬â€ only when node/edge data changes
**Plans**: 5 plans
**Research needed**: Yes (D3 Canvas drag edge cases Ã¢â‚¬â€ consult PITFALLS.md Pitfall 11 before implementation)
**UI hint**: yes

Plans:
- [x] 04-01: Implement `lib/graph/forceSimulation.ts` Ã¢â‚¬â€ `createForceSimulation(nodes, edges)` pure setup function; `drawGraph2D(ctx, w, h, nodes, edges, selectedId, transform)` pure draw function with entity-type color/icon encoding and edge labels; `hitTest2D(nodes, mx, my, transform)` pure hit test; Jest tests for all three
- [x] 04-02: Build `ForceGraph2D` component skeleton Ã¢â‚¬â€ `canvasRef`, `simulationRef` in `useRef`; `useEffect([nodes, edges])` creates simulation via `createForceSimulation`, ticks call `drawGraph2D`, cleanup calls `sim.stop()`; second `useEffect([selectedId])` redraws without restarting simulation; parent wraps `nodes`/`edges` in `useMemo`
- [x] 04-03: Implement pan/zoom state Ã¢â‚¬â€ `transformRef` for current `d3.ZoomTransform`; wire `d3.zoom()` to canvas via `useEffect`; implement Zoom to Fit; pass transform into `drawGraph2D` and `hitTest2D`
- [x] 04-04: Implement node drag Ã¢â‚¬â€ `d3.drag()` with `.filter(e => !e.button)` and 5px threshold to distinguish click from drag; `dragstart` sets `fx/fy`, `dragend` releases; drag does not restart simulation from zero alpha; attach through D3 not React synthetic events
- [x] 04-05: Implement node search/filter input Ã¢â‚¬â€ controlled React input in parent; pass `highlightIds` set down to `drawGraph2D`; confirm simulation does not restart on search input changes; wrap in `dynamic({ ssr: false })`

### Phase 5: GraphWorkspace + Toggle
**Goal**: Both renderers are connected under a single `GraphWorkspace` component with a CSS display:none toggle, shared selection state, a functioning NodeDetailPanel, and component-level tests.
**Depends on**: Phase 3, Phase 4
**Requirements**: WS-01, WS-02, WS-03, WS-04, ARCH-05
**Success Criteria** (what must be TRUE):
  1. The 2D/3D toggle button switches the visible renderer; the graph data and selected node are identical in both modes
  2. Toggling from 2D to 3D and back preserves custom node positions dragged in 2D (D3 `x/y` mutations are not lost)
  3. Clicking a node in either renderer opens NodeDetailPanel showing the node label, entity type, relationship count, and raw properties
  4. NodeDetailPanel closes on deselect, on clicking empty canvas, and on pressing Escape
  5. CaseHeader, EvidenceSidebar, and NodeDetailPanel all pass React Testing Library component tests
**Plans**: 5 plans
**Research needed**: No
**UI hint**: yes

Plans:
- [x] 05-01: Build `GraphWorkspace` component Ã¢â‚¬â€ owns `viewMode` state ('2d' | '3d') and the toggle button; mounts BOTH `ForceGraph2D` and `MindMap3D` at page load; CSS `style={{ display: viewMode === '2d' ? 'block' : 'none' }}` on each wrapper div Ã¢â‚¬â€ never unmount; confirm both Canvas elements exist in DOM during toggle via React DevTools
- [x] 05-02: Wire shared `selectedNodeId` Ã¢â‚¬â€ lives in Zustand store or `page.tsx`; passed to both renderers as a prop; both renderers call the same `onNodeSelect(id)` callback; verify selection state persists across toggle
- [x] 05-03: Build `NodeDetailPanel` Ã¢â‚¬â€ slide-in panel showing label, entity type, relationship count, raw properties; receives `selectedNode` and `connections[]` from store; dismisses on `onDeselect` prop call or Escape keydown listener
- [x] 05-04: Wire evidence sidebar click to highlight entities in the active renderer Ã¢â‚¬â€ `SHELL-03` now fully implemented; confirm highlighted node IDs flow into `ForceGraph2D` `highlightIds` and `MindMap3D` `highlightIds`
- [x] 05-05: Write React Testing Library tests Ã¢â‚¬â€ `CaseHeader` renders name and status badge; `EvidenceSidebar` renders category tree; `NodeDetailPanel` shows correct label and dismisses on Escape; mock canvas and D3 where needed

### Phase 6: Controls + Filters + Timeline + Persistence
**Goal**: FilterPanel, Layers toggle, TimelineBar, AICommandBar placeholder, and localStorage persistence are all wired into the live application.
**Depends on**: Phase 5
**Requirements**: WS-05, WS-06, SHELL-05, DATA-04
**Success Criteria** (what must be TRUE):
  1. Toggling entity type filters in FilterPanel shows/hides matching nodes in both the 2D and 3D renderers without restarting the D3 simulation
  2. The Layers panel toggles edge label visibility and node label visibility across both renderers
  3. The TimelineBar renders at the bottom with the AI command bar placeholder input
  4. Case state (entities, connections, selected node) survives a page reload Ã¢â‚¬â€ localStorage restores the full case state on app load
**Plans**: 4 plans
**Research needed**: No
**UI hint**: yes

Plans:
- [x] 06-01: Build `FilterPanel` and shared filter/layer state in Zustand so `GraphWorkspace` owns graph-level controls
- [x] 06-02: Wire dimming-based filters plus shared node/edge label and focus-neighborhood toggles into both renderers without recreating simulation/camera state
- [x] 06-03: Build `TimelineBar` and `AICommandBar` footer surfaces and integrate them directly beneath the graph workspace
- [x] 06-04: Persist practical case/workspace state with Zustand middleware and cover controls, footer surfaces, and rehydration with Jest/RTL

### Phase 7: Export
**Goal**: The Export Report flow produces a HiDPI PNG snapshot of the active graph view and a PDF report including case metadata, entity list, connection summary, and the graph snapshot.
**Depends on**: Phase 6
**Requirements**: EXPORT-01, EXPORT-02, EXPORT-03
**Success Criteria** (what must be TRUE):
  1. The header export menu can download a PNG of the currently active renderer without resetting view state
  2. The same menu can download a PDF containing case metadata, workspace context, entity list, connection summary, and the graph snapshot
  3. Export uses the active renderer canvas as the primary image source and keeps a scale-2 DOM capture fallback available
**Plans**: 4 plans
**Research needed**: Completed during planning/execution
**UI hint**: yes

Plans:
- [x] 07-01: Added renderer export handles and a shared active-export seam in GraphWorkspace
- [x] 07-02: Implemented src/lib/export/reportExporter.ts with canvas-first PNG export, html2canvas fallback, and detailed jsPDF report generation
- [x] 07-03: Replaced the static header export button with a compact PNG / PDF / both menu and wired page-level export orchestration
- [x] 07-04: Added focused export tests, ran the full Jest suite, and verified a successful production build

## Progress

**Execution Order:**
Phases execute in numeric order: 1 Ã¢â€ â€™ 2 Ã¢â€ â€™ 3 Ã¢â€ â€™ 4 Ã¢â€ â€™ 5 Ã¢â€ â€™ 6 Ã¢â€ â€™ 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 5/5 | Complete | 2026-04-09 |
| 2. App Shell | 5/5 | Complete | 2026-04-09 |
| 3. 3D Renderer Port | 5/5 | Complete | 2026-04-09 |
| 4. 2D Force Graph | 5/5 | Complete | 2026-04-09 |
| 5. GraphWorkspace + Toggle | 5/5 | Complete | 2026-04-09 |
| 6. Controls + Filters + Timeline + Persistence | 4/4 | Complete | 2026-04-09 |
| 7. Export | 4/4 | Complete | 2026-04-09 |


