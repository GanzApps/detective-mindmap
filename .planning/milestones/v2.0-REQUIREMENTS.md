# Requirements: Investigation Workspace Revamp

**Defined:** 2026-04-10
**Core Value:** A detective must be able to open a case, understand the workspace immediately, focus the relevant network, and move between 2D and 3D without losing context.

---

## Active Milestone Requirements

### Shell and Theme

- [x] **SHELL-06**: Introduce a shared shell token system for backgrounds, surfaces, text, borders, spacing, radius, and accent usage
- [x] **THEME-01**: Support both light and dark themes through the shared token layer without breaking dashboard/workspace layout
- [x] **SHELL-07**: Dashboard and workspace use the same calm, reference-aligned shell language with centered framing and restrained surfaces
- [ ] **SHELL-08**: Workspace content is organized into explicit bands: top shell, left rail, center graph, right analysis panel, timeline, and AI command surface
- [ ] **SHELL-09**: The command surface is polished and visually integrated into the shell rather than presented as a placeholder bar

### Search and Focus

- [ ] **SEARCH-01**: Search behaves as typeahead first; graph focus is applied only after a result is selected
- [ ] **SEARCH-02**: Selecting a search result highlights the chosen node and its connected network while dimming unrelated nodes

### Workspace Structure

- [ ] **WS-07**: Left rail supports tabbed `Raw Evidence` and `Filters & Layers` modes
- [ ] **WS-08**: Filters & Layers are grouped into clear sections for entity types, connection layers, and time range
- [ ] **WS-09**: A persistent minimap/magnifier shows current graph viewport/camera position
- [ ] **WS-10**: Node labels are visible by default; edge labels are selective to preserve readability
- [ ] **WS-11**: Timeline remains synchronized as a first-class bottom workspace surface rather than incidental footer chrome

### Graph Interaction Parity

- [ ] **INTER-06**: 2D and 3D use the same selection and focus behavior
- [ ] **INTER-07**: Manual node dragging remains available in both renderers
- [ ] **INTER-08**: User-adjusted placement intent is preserved across 2D/3D view switches so switching views does not feel disorienting

### Graph Visual Language

- [ ] **GRAPH2D-11**: 2D graph adopts the reference-aligned entity color language rather than the legacy palette
- [ ] **GRAPH3D-10**: 3D graph adopts the same focus and semantic styling model as 2D where technically practical
- [ ] **GRAPH-STYLE-01**: Entity types use distinct iconic shapes, not generic same-shape nodes
- [ ] **GRAPH-STYLE-02**: Approved shape direction:
  - person: rounded avatar-like node
  - location: pin / marker-style node
  - organization: square / structured block node
  - evidence or transaction: document/card-style node
  - event: diamond / signal-style node

### Analysis Surface

- [ ] **ANALYSIS-01**: Selection and AI result details appear in a right-side on-canvas analysis panel so the graph remains unobstructed
- [ ] **ANALYSIS-02**: Floating in-canvas callouts appear only for meaningful selected-state or AI-result emphasis, not as permanent clutter

### AI Command Routing

- [ ] **AI-01**: AI command surface presents quick suggestions/chips and typed input in a polished shell-aligned form
- [ ] **AI-02**: First implementation uses known intents only and maps them to predefined graph/workspace actions
- [ ] **AI-03**: AI-triggered actions can populate the right-side analysis panel with results, findings, or metrics

---

## Groundwork Already Completed

These are not the final revamp, but they are now part of the milestone foundation.

- [x] **FOUND-01**: Existing case/data/graph/export foundation from milestone 1 remains functional
- [x] **FOUND-02**: Phase 8 token and shell groundwork is complete and verified in `.planning/phases/08-design-tokens-shell-alignment/08-UAT.md`

---

## Future / Deferred

- **BACK-01**: Replace mock repository with API-backed persistence
- **COLLAB-01**: Shared case sessions or collaboration
- **INTER-09**: Lasso / multi-select / grouped move
- **INTER-10**: Undo / redo
- **AI-04**: Freeform AI interpretation beyond known intents

---

## Traceability

| Requirement | Planned Phase | Status |
|-------------|---------------|--------|
| SHELL-06 | Phase 8 | Satisfied |
| THEME-01 | Phase 8 | Satisfied |
| SHELL-07 | Phase 8 | Satisfied |
| SHELL-08 | Phase 9 | Planned |
| SHELL-09 | Phase 12 | Planned |
| SEARCH-01 | Phase 10 | Planned |
| SEARCH-02 | Phase 10 | Planned |
| WS-07 | Phase 9 | Planned |
| WS-08 | Phase 9 | Planned |
| WS-09 | Phase 9 | Planned |
| WS-10 | Phase 10 | Planned |
| WS-11 | Phase 9 | Planned |
| INTER-06 | Phase 11 | Planned |
| INTER-07 | Phase 11 | Planned |
| INTER-08 | Phase 11 | Planned |
| GRAPH2D-11 | Phase 10 | Planned |
| GRAPH3D-10 | Phase 11 | Planned |
| GRAPH-STYLE-01 | Phase 10 | Planned |
| GRAPH-STYLE-02 | Phase 10 | Planned |
| ANALYSIS-01 | Phase 9 | Planned |
| ANALYSIS-02 | Phase 9 | Planned |
| AI-01 | Phase 12 | Planned |
| AI-02 | Phase 12 | Planned |
| AI-03 | Phase 12 | Planned |

---
*Last updated: 2026-04-10 during planning repair after Phase 8 verification*
