# Requirements: Detective Case Investigation Platform

**Defined:** 2026-04-09
**Core Value:** A detective must be able to load a case, see all entities and their connections in an interactive graph, and switch between 2D and 3D views without losing context.

---

## v1 Requirements

### Data Foundation

- [x] **DATA-01**: Shared typed interfaces for `GraphNode`, `GraphEdge`, `Case`, and `EvidenceFile` defined with Zod schemas; TypeScript types inferred
- [x] **DATA-02**: Mock case data (at least 1 full case with 15+ entities, 20+ connections, categorized evidence files) that satisfies the shared types
- [x] **DATA-03**: `caseRepository` interface (fetch case by ID, list cases) with mock implementation; swappable for real API without UI changes
- [x] **DATA-04**: Case state persists to `localStorage` on change and restores on app load

### App Shell

- [x] **SHELL-01**: Case header bar shows case name, status badge, "Export Report" button, and "Actions" dropdown
- [x] **SHELL-02**: Left sidebar lists evidence categories (e.g., iPhone dump, laptop dump, location scans) and individual files under each
- [x] **SHELL-03**: Evidence file click highlights the corresponding entities in the graph
- [x] **SHELL-04**: Entity/connection count displayed in the toolbar ("20 entities · 25 connections")
- [x] **SHELL-05**: Status bar at the bottom shows timeline label and AI command bar placeholder input

### 3D Graph Mode

- [x] **GRAPH3D-01**: 3D mindmap rendered on Canvas with perspective projection (ported from `3d_mindmap_fixed.html`)
- [x] **GRAPH3D-02**: Mouse drag rotates the 3D graph; scroll wheel zooms
- [x] **GRAPH3D-03**: Node click highlights the selected node and its direct connections; dimmed everything else
- [x] **GRAPH3D-04**: Hover tooltip shows node label and connection count
- [x] **GRAPH3D-05**: Depth-based opacity and glow effects preserved from reference implementation
- [x] **GRAPH3D-06**: Node detail panel (name, type, connection count, "Explore topic" action) shown on click
- [x] **GRAPH3D-07**: "Reset view" and "Pause/Rotate" and "Labels" controls functional
- [x] **GRAPH3D-08**: Animation loop correctly cleaned up on component unmount (no rAF leak)
- [x] **GRAPH3D-09**: Canvas renders sharply at all DPR values (HiDPI / Retina)

### 2D Force Graph

- [x] **GRAPH2D-01**: D3.js force simulation positions entities as nodes on Canvas
- [x] **GRAPH2D-02**: Node color and icon encodes entity type (person, location, event, evidence, organization)
- [x] **GRAPH2D-03**: Edges are labeled with relationship type (e.g., "witnessed", "located at", "owns")
- [x] **GRAPH2D-04**: Dragging a node repositions it; simulation adjusts neighboring nodes
- [x] **GRAPH2D-05**: Canvas panning (drag on empty space) and zoom (scroll wheel) with smooth limits
- [x] **GRAPH2D-06**: "Zoom to fit" button resets viewport to show all nodes
- [x] **GRAPH2D-07**: Node click selects it: highlights node + direct edges; dims everything else; shows NodeDetailPanel
- [x] **GRAPH2D-08**: Clicking empty canvas deselects; restores all nodes to normal opacity
- [x] **GRAPH2D-09**: Node search/filter: type a name to highlight matching nodes
- [x] **GRAPH2D-10**: D3 simulation lifecycle correctly isolated from React rendering (simulation in `useRef`; no restart on non-data state changes)

### Graph Workspace (Shared)

- [x] **WS-01**: Toggle button switches between 2D and 3D modes; selected node and graph data preserved across toggle
- [x] **WS-02**: Both renderers mounted at page load; CSS `display:none` hides inactive renderer (not unmount)
- [x] **WS-03**: NodeDetailPanel slides in on node select; shows label, entity type, relationship count, raw properties
- [x] **WS-04**: NodeDetailPanel dismissed on deselect or Escape key
- [x] **WS-05**: Filter panel: show/hide nodes by entity type (implemented as dimming in both 2D and 3D)
- [x] **WS-06**: Layers panel: toggle edge label visibility, toggle node labels

### Case Management

- [x] **CASE-01**: User can create a new case (name, description, status)
- [x] **CASE-02**: User can add an entity to a case (label, type, optional properties)
- [x] **CASE-03**: User can draw a connection between two entities (relationship label, direction)
- [x] **CASE-04**: User can delete an entity (removes it and all its edges)
- [x] **CASE-05**: User can delete a connection
- [x] **CASE-06**: Case list page shows all cases with name, entity count, last modified date

### Export

- [x] **EXPORT-01**: "Export Report" generates a PNG snapshot of the current graph canvas (current view, both 2D and 3D)
- [x] **EXPORT-02**: "Export Report" generates a PDF including case metadata, entity list, connection summary, and graph snapshot
- [x] **EXPORT-03**: Exported PNG is HiDPI quality (2x resolution)

### Architecture & Quality

- [x] **ARCH-01**: Graph math extracted to `lib/graph/` as pure functions (no React imports) with Jest unit tests
- [x] **ARCH-02**: All graph components use `dynamic({ ssr: false })` - no SSR crashes
- [x] **ARCH-03**: Zustand store manages global state (case data, selected node, active filters, view mode)
- [x] **ARCH-04**: `caseRepository` interface - all data access goes through this abstraction
- [x] **ARCH-05**: Component unit tests with React Testing Library for sidebar, header, NodeDetailPanel

---

## v2 Requirements

### Graph Interaction

- **INTER-01**: Undo / redo for entity and connection edits (Ctrl+Z / Ctrl+Y)
- **INTER-02**: Lasso select - drag to select multiple nodes; group-delete or group-move
- **INTER-03**: Multi-select with Shift+click; move selected nodes as a group
- **INTER-04**: Path finding - "Show connection between A and B" (BFS shortest path highlighted)
- **INTER-05**: Layout algorithm selector (force, hierarchical, radial, circular)

### Evidence

- **EVID-01**: Evidence file preview in sidebar (image, PDF, text preview)
- **EVID-02**: Evidence file upload (drag-and-drop to sidebar category)
- **EVID-03**: Link an evidence file to a specific entity (shown in NodeDetailPanel)

### Timeline

- **TIME-01**: Timeline bar driven by entity timestamp properties (range slider -> graph highlights events in range)
- **TIME-02**: Timeline -> graph sync: scrubbing timeline highlights nodes whose events fall in the visible window

### Collaboration

- **COLLAB-01**: Shareable case link (read-only snapshot URL)
- **COLLAB-02**: Case version history (snapshot at each save)
- **COLLAB-03**: Annotation / notes on nodes and edges (inline comment)

### Backend

- **BACK-01**: REST API integration - swap mock `caseRepository` for live API
- **BACK-02**: Case data stored in server database (Postgres or Mongo)

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Authentication / user accounts | No auth in v1; small team shares one instance; scope increases significantly |
| Real-time collaboration (WebSockets) | Async sharing via export is sufficient; real-time adds significant infra complexity |
| AI-generated connections | Auto-suggesting edges in an investigation context risks false positives - potentially harmful in legal contexts |
| Geospatial / map view | Different rendering paradigm (Leaflet/Mapbox); major scope; defer to v3+ |
| Mobile layout | Desktop-first; complex graph interactions (drag, multi-select, canvas pan) don't map well to touch |
| Plugin marketplace | No external developer ecosystem at this stage |
| Video evidence | Storage/bandwidth complexity; defer |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | Phase 1 | Satisfied (Phase 1) |
| DATA-02 | Phase 1 | Satisfied (Phase 1) |
| DATA-03 | Phase 1 | Satisfied (Phase 1) |
| DATA-04 | Phase 6 | Satisfied (Phase 6) |
| SHELL-01 | Phase 2 | Satisfied (Phase 2) |
| SHELL-02 | Phase 2 | Satisfied (Phase 2) |
| SHELL-03 | Phase 2 | Satisfied (Phase 2) |
| SHELL-04 | Phase 2 | Satisfied (Phase 2) |
| SHELL-05 | Phase 6 | Satisfied (Phase 6) |
| GRAPH3D-01 | Phase 3 | Satisfied (Phase 3) |
| GRAPH3D-02 | Phase 3 | Satisfied (Phase 3) |
| GRAPH3D-03 | Phase 3 | Satisfied (Phase 3) |
| GRAPH3D-04 | Phase 3 | Satisfied (Phase 3) |
| GRAPH3D-05 | Phase 3 | Satisfied (Phase 3) |
| GRAPH3D-06 | Phase 3 | Satisfied (Phase 3) |
| GRAPH3D-07 | Phase 3 | Satisfied (Phase 3) |
| GRAPH3D-08 | Phase 3 | Satisfied (Phase 3) |
| GRAPH3D-09 | Phase 3 | Satisfied (Phase 3) |
| GRAPH2D-01 | Phase 4 | Satisfied (Phase 4) |
| GRAPH2D-02 | Phase 4 | Satisfied (Phase 4) |
| GRAPH2D-03 | Phase 4 | Satisfied (Phase 4) |
| GRAPH2D-04 | Phase 4 | Satisfied (Phase 4) |
| GRAPH2D-05 | Phase 4 | Satisfied (Phase 4) |
| GRAPH2D-06 | Phase 4 | Satisfied (Phase 4) |
| GRAPH2D-07 | Phase 4 | Satisfied (Phase 4) |
| GRAPH2D-08 | Phase 4 | Satisfied (Phase 4) |
| GRAPH2D-09 | Phase 4 | Satisfied (Phase 4) |
| GRAPH2D-10 | Phase 4 | Satisfied (Phase 4) |
| WS-01 | Phase 5 | Satisfied (Phase 5) |
| WS-02 | Phase 5 | Satisfied (Phase 5) |
| WS-03 | Phase 5 | Satisfied (Phase 5) |
| WS-04 | Phase 5 | Satisfied (Phase 5) |
| WS-05 | Phase 6 | Satisfied (Phase 6) |
| WS-06 | Phase 6 | Satisfied (Phase 6) |
| CASE-01 | Phase 2 | Satisfied (Phase 2) |
| CASE-02 | Phase 2 | Satisfied (Phase 2) |
| CASE-03 | Phase 2 | Satisfied (Phase 2) |
| CASE-04 | Phase 2 | Satisfied (Phase 2) |
| CASE-05 | Phase 2 | Satisfied (Phase 2) |
| CASE-06 | Phase 2 | Satisfied (Phase 2) |
| EXPORT-01 | Phase 7 | Satisfied (Phase 7) |
| EXPORT-02 | Phase 7 | Satisfied (Phase 7) |
| EXPORT-03 | Phase 7 | Satisfied (Phase 7) |
| ARCH-01 | Phase 1 | Satisfied (Phase 1) |
| ARCH-02 | Phase 2 | Satisfied (Phase 2) |
| ARCH-03 | Phase 2 | Satisfied (Phase 2) |
| ARCH-04 | Phase 1 | Satisfied (Phase 1) |
| ARCH-05 | Phase 5 | Satisfied (Phase 5) |

**Coverage:**
- v1 requirements: 46 total
- Mapped to phases: 46
- Unmapped: 0

---
*Requirements defined: 2026-04-09*
*Last updated: 2026-04-09 after Phase 7 completion*
