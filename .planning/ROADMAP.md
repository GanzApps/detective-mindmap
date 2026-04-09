# Roadmap: Detective Case Investigation Platform

## Overview

Seven phases deliver a fully interactive investigation board: a typed data foundation comes first so every downstream component builds on a stable, swappable contract; the Next.js shell and case management CRUD follow to give the app its navigable structure; the 3D Canvas renderer is ported next while the vanilla source is freshest and its pure math extracted for isolated testing; the D3.js 2D force graph builds on those same pure-function foundations; both renderers are then wired together with a CSS-toggle workspace and shared selection state; controls, filters, timeline, and localStorage persistence complete the interactive surface; and finally export rounds out the v1 feature set.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Shared Zod schemas, TypeScript types, mock data, and caseRepository interface
- [ ] **Phase 2: App Shell** - Next.js layout, case header, evidence sidebar, Zustand store, and case management CRUD
- [ ] **Phase 3: 3D Renderer Port** - Pure projection/hit-test functions extracted first, then MindMap3D Canvas component
- [ ] **Phase 4: 2D Force Graph** - D3 simulation in useRef, Canvas draw, pan/zoom/drag, node selection
- [ ] **Phase 5: GraphWorkspace + Toggle** - CSS display:none toggle connecting both renderers, NodeDetailPanel, component tests
- [ ] **Phase 6: Controls + Filters + Timeline + Persistence** - FilterPanel, Layers, TimelineBar, AICommandBar placeholder, localStorage
- [ ] **Phase 7: Export** - PNG snapshot and PDF report via html2canvas + jsPDF

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
**Plans**: TBD
**Research needed**: No

Plans:
- [ ] 01-01: Define `lib/graph/graphTypes.ts` — `GraphNode`, `GraphEdge`, `GraphData`, `EntityType` with Zod schemas; infer TypeScript types; write `buildGraphFromCase` pure function
- [ ] 01-02: Define `lib/data/dataTypes.ts` — `Case`, `EvidenceFile`, `EvidenceCategory` Zod schemas; wire up type inference
- [ ] 01-03: Write `lib/data/mockCases.ts` — one complete case with 15+ entities, 20+ connections, categorized evidence files, all validated against Zod schemas at import time
- [ ] 01-04: Implement `lib/data/caseRepository.ts` — define the `CaseRepository` interface (`fetchCase`, `listCases`); implement `mockCaseRepository` backed by `mockCases.ts`
- [ ] 01-05: Write Jest unit tests for `getConnectedIds` and `buildGraphFromCase`; confirm zero DOM imports in `lib/graph/`

### Phase 2: App Shell
**Goal**: The Next.js application is navigable with a case workspace page, fully wired case header, evidence sidebar, Zustand global store, and working case management CRUD.
**Depends on**: Phase 1
**Requirements**: SHELL-01, SHELL-02, SHELL-03, SHELL-04, CASE-01, CASE-02, CASE-03, CASE-04, CASE-05, CASE-06, ARCH-02, ARCH-03
**Success Criteria** (what must be TRUE):
  1. Visiting `/cases` shows a list of cases with name, entity count, and last modified date
  2. Visiting `/cases/[id]` shows the case header (name, status badge, Export Report button, Actions dropdown) and evidence sidebar with category tree and file list
  3. Clicking an evidence file in the sidebar triggers a visual highlight callback (entity highlight integration deferred to Phase 5, but the callback is wired)
  4. Entity and connection counts display correctly in the toolbar
  5. User can create a case, add entities, draw connections, delete entities and connections — all mutations update Zustand store and are reflected in the UI without page reload
  6. All graph area components are wrapped in `dynamic({ ssr: false })` — the app builds without SSR errors
**Plans**: TBD
**Research needed**: No
**UI hint**: yes

Plans:
- [ ] 02-01: Scaffold Next.js App Router project — `app/page.tsx` redirect, `app/cases/page.tsx` case list, `app/cases/[caseId]/page.tsx` workspace shell; configure Tailwind dark theme; establish `dynamic({ ssr: false })` pattern on a graph placeholder before any D3 code
- [ ] 02-02: Implement Zustand store (`store/caseStore.ts`) — slices for case data, selected node ID, active filters, view mode ('2d' | '3d'); wire `useCaseData` hook to load from `caseRepository`
- [ ] 02-03: Build `CaseHeader` component — case name, status badge, Export Report button (no-op), Actions dropdown; build `EvidenceSidebar` with category tree and file list; wire evidence file click to store
- [ ] 02-04: Build case management CRUD UI — create case form, add entity form, draw connection form, delete entity/connection actions; all mutations go through Zustand store actions
- [ ] 02-05: Build `CaseListPage` with entity count and last modified; add `SHELL-04` entity/connection count display in toolbar area; end-to-end smoke test: create case → add entity → view in list

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
  6. The component unmounts cleanly — no requestAnimationFrame leaks verified by React Strict Mode double-invocation
  7. On a Retina display, node edges are sharp (no blurring) and click hit zones match drawn node positions
**Plans**: TBD
**Research needed**: No

Plans:
- [ ] 03-01: Extract pure functions from `3d_mindmap_fixed.html` into `lib/graph/` — `projection3d.ts` (`projectNode`), `hitTest.ts` (`hitTest3D`), `graphLayout.ts` (`getConnectedIds` — shared with Phase 1); write Jest tests for each with known inputs; zero DOM imports
- [ ] 03-02: Extract stateless render function — `lib/graph/renderer3d.ts` (`drawFrame3D`); wrap every per-node draw call in `ctx.save()/ctx.restore()` to eliminate the `globalAlpha` leak from the reference source; preserve depth-sort, glow, and opacity logic
- [ ] 03-03: Build `MindMap3D` component skeleton — `canvasRef`, camera state in `useRef` (rotX, rotY, zoom), `dragging` ref, `hoverId` ref, `autoRot` ref, `rafId` ref; implement `ResizeObserver` in `useEffect` with `dpr` scaling via `ctx.setTransform`; add `cancelAnimationFrame` cleanup and `running` boolean guard for Strict Mode
- [ ] 03-04: Wire animation loop, mouse handlers, and `hitTest3D` into `MindMap3D`; connect Reset/Pause/Labels control props; implement hover tooltip via portal; verify no `setState` calls occur during drag or animation frames
- [ ] 03-05: Mark `MindMap3D` as `'use client'`; wrap import in `dynamic({ ssr: false })` at page level; run `next build` and confirm zero SSR errors; manual Retina DPR test and strict mode leak test

### Phase 4: 2D Force Graph
**Goal**: The D3.js force graph renders all case entities on Canvas with drag, pan, zoom, node selection, and edge labels — with simulation lifecycle fully isolated from React rendering.
**Depends on**: Phase 1
**Requirements**: GRAPH2D-01, GRAPH2D-02, GRAPH2D-03, GRAPH2D-04, GRAPH2D-05, GRAPH2D-06, GRAPH2D-07, GRAPH2D-08, GRAPH2D-09, GRAPH2D-10
**Success Criteria** (what must be TRUE):
  1. All mock case entities appear as labeled, color-coded nodes (by entity type) on the Canvas with visible edge relationship labels
  2. Dragging a node repositions it and the simulation adjusts neighbors; drag releases node back to simulation without position jump
  3. Panning (drag on empty space) and zooming (scroll wheel) work with smooth limits; Zoom to Fit resets the viewport
  4. Clicking a node highlights it and its direct edges, dims everything else, and emits the selected node ID upward; clicking empty canvas deselects
  5. Typing in the node search input highlights matching nodes without restarting the simulation
  6. Simulation does not restart when filter state, selection, or UI state changes — only when node/edge data changes
**Plans**: TBD
**Research needed**: Yes (D3 Canvas drag edge cases — consult PITFALLS.md Pitfall 11 before implementation)
**UI hint**: yes

Plans:
- [ ] 04-01: Implement `lib/graph/forceSimulation.ts` — `createForceSimulation(nodes, edges)` pure setup function; `drawGraph2D(ctx, w, h, nodes, edges, selectedId, transform)` pure draw function with entity-type color/icon encoding and edge labels; `hitTest2D(nodes, mx, my, transform)` pure hit test; Jest tests for all three
- [ ] 04-02: Build `ForceGraph2D` component skeleton — `canvasRef`, `simulationRef` in `useRef`; `useEffect([nodes, edges])` creates simulation via `createForceSimulation`, ticks call `drawGraph2D`, cleanup calls `sim.stop()`; second `useEffect([selectedId])` redraws without restarting simulation; parent wraps `nodes`/`edges` in `useMemo`
- [ ] 04-03: Implement pan/zoom state — `transformRef` for current `d3.ZoomTransform`; wire `d3.zoom()` to canvas via `useEffect`; implement Zoom to Fit; pass transform into `drawGraph2D` and `hitTest2D`
- [ ] 04-04: Implement node drag — `d3.drag()` with `.filter(e => !e.button)` and 5px threshold to distinguish click from drag; `dragstart` sets `fx/fy`, `dragend` releases; drag does not restart simulation from zero alpha; attach through D3 not React synthetic events
- [ ] 04-05: Implement node search/filter input — controlled React input in parent; pass `highlightIds` set down to `drawGraph2D`; confirm simulation does not restart on search input changes; wrap in `dynamic({ ssr: false })`

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
**Plans**: TBD
**Research needed**: No
**UI hint**: yes

Plans:
- [ ] 05-01: Build `GraphWorkspace` component — owns `viewMode` state ('2d' | '3d') and the toggle button; mounts BOTH `ForceGraph2D` and `MindMap3D` at page load; CSS `style={{ display: viewMode === '2d' ? 'block' : 'none' }}` on each wrapper div — never unmount; confirm both Canvas elements exist in DOM during toggle via React DevTools
- [ ] 05-02: Wire shared `selectedNodeId` — lives in Zustand store or `page.tsx`; passed to both renderers as a prop; both renderers call the same `onNodeSelect(id)` callback; verify selection state persists across toggle
- [ ] 05-03: Build `NodeDetailPanel` — slide-in panel showing label, entity type, relationship count, raw properties; receives `selectedNode` and `connections[]` from store; dismisses on `onDeselect` prop call or Escape keydown listener
- [ ] 05-04: Wire evidence sidebar click to highlight entities in the active renderer — `SHELL-03` now fully implemented; confirm highlighted node IDs flow into `ForceGraph2D` `highlightIds` and `MindMap3D` `highlightIds`
- [ ] 05-05: Write React Testing Library tests — `CaseHeader` renders name and status badge; `EvidenceSidebar` renders category tree; `NodeDetailPanel` shows correct label and dismisses on Escape; mock canvas and D3 where needed

### Phase 6: Controls + Filters + Timeline + Persistence
**Goal**: FilterPanel, Layers toggle, TimelineBar, AICommandBar placeholder, and localStorage persistence are all wired into the live application.
**Depends on**: Phase 5
**Requirements**: WS-05, WS-06, SHELL-05, DATA-04
**Success Criteria** (what must be TRUE):
  1. Toggling entity type filters in FilterPanel shows/hides matching nodes in both the 2D and 3D renderers without restarting the D3 simulation
  2. The Layers panel toggles edge label visibility and node label visibility across both renderers
  3. The TimelineBar renders at the bottom with the AI command bar placeholder input
  4. Case state (entities, connections, selected node) survives a page reload — localStorage restores the full case state on app load
**Plans**: TBD
**Research needed**: No
**UI hint**: yes

Plans:
- [ ] 06-01: Build `FilterPanel` — checkboxes for each `EntityType`; filter state lives in Zustand store; `filteredGraphData` is `useMemo`-derived in `page.tsx` from raw case data + active filters; passes to `GraphWorkspace` so both renderers receive filtered data
- [ ] 06-02: Build `LayersPanel` — boolean toggles for edge labels and node labels; toggle state in Zustand store; both `drawGraph2D` and `drawFrame3D` read the toggle flags from store and conditionally render labels
- [ ] 06-03: Build `TimelineBar` component with timeline label display and placeholder range scrubber (read-only in v1 per SUMMARY.md defer list); build `AICommandBar` as a styled placeholder input with no logic
- [ ] 06-04: Implement `DATA-04` localStorage persistence — Zustand middleware (`persist`) serializes case state to `localStorage` on every mutation; deserializes on app load; test by mutating state, refreshing the page, and verifying state restores correctly

### Phase 7: Export
**Goal**: The Export Report button produces a HiDPI PNG snapshot of the current graph and a PDF report including case metadata, entity list, connection summary, and the graph snapshot.
**Depends on**: Phase 6
**Requirements**: EXPORT-01, EXPORT-02, EXPORT-03
**Success Criteria** (what must be TRUE):
  1. Clicking "Export Report" downloads a PNG of the current graph canvas at 2x resolution (HiDPI quality) for whichever renderer is active
  2. Clicking "Export Report" also downloads a PDF containing the case name, status, entity list, connection summary, and the graph snapshot
  3. The exported PNG and PDF are non-blank when tested on a HiDPI display — the canvas pause/draw/resume pattern is used to guarantee a complete frame
**Plans**: TBD
**Research needed**: Yes (html2canvas mixed Canvas+DOM — spike before committing; see PITFALLS.md Pitfall 8 and SUMMARY.md confidence gap)
**UI hint**: yes

Plans:
- [ ] 07-01: Spike html2canvas export on the actual GraphWorkspace DOM element — verify the Canvas content captures correctly (not blank); test on HiDPI screen; document result; if html2canvas fails on the Canvas element, fall back to `canvas.toDataURL()` directly for PNG and build PDF separately
- [ ] 07-02: Implement `lib/export/reportExporter.ts` — `exportPNG(canvasEl)`: pause animation, call explicit `draw()`, `canvas.toDataURL('image/png')`, resume animation; `exportPDF(containerEl, caseData)`: `html2canvas` at `scale: 2`, compose with jsPDF including case metadata page + graph image
- [ ] 07-03: Wire Export Report button in `CaseHeader` to `reportExporter`; expose canvas refs from `ForceGraph2D` and `MindMap3D` upward to `GraphWorkspace` via `useImperativeHandle`; pass the correct active canvas ref to the exporter based on current `viewMode`
- [ ] 07-04: Manual QA — export PNG and PDF from both 2D and 3D modes; verify entity list and connection summary are correct; verify HiDPI resolution on a Retina display; confirm no blank or misscaled output

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/5 | Not started | - |
| 2. App Shell | 0/5 | Not started | - |
| 3. 3D Renderer Port | 0/5 | Not started | - |
| 4. 2D Force Graph | 0/5 | Not started | - |
| 5. GraphWorkspace + Toggle | 0/5 | Not started | - |
| 6. Controls + Filters + Timeline + Persistence | 0/4 | Not started | - |
| 7. Export | 0/4 | Not started | - |
