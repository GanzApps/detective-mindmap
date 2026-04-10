# Roadmap: Investigation Workspace Revamp

## Overview

Milestone `v2.0` rebuilds the product around the saved reference direction. Phase 8 establishes tokens and shell alignment first so later phases can safely rebuild workspace structure, graph styling, interaction parity, and AI routing without fighting legacy UI decisions. The work is intentionally sequenced from outer shell inward: shell language, workspace framing, graph semantics, cross-renderer behavior, then AI orchestration and polish.

## Phases

- [x] **Phase 8: Design Tokens + Shell Alignment** - shared shell token system, light/dark support, and top-level shell reframing
- [ ] **Phase 9: Workspace Frame + Panels** - rebuild left rail tabs, right analysis panel, minimap, and workspace band structure
- [ ] **Phase 10: Graph Visual Language + Search Focus** - reference-aligned node shapes/colors, typeahead search flow, dimmed network focus
- [ ] **Phase 11: 2D / 3D Interaction Parity** - align selection, drag, and placement continuity across renderers
- [ ] **Phase 12: AI Command Routing + Workspace Polish** - known-intent command execution, quick commands, analysis routing, and final shell cohesion

## Phase Details

### Phase 8: Design Tokens + Shell Alignment
**Goal**: Establish the shared visual token layer and reframe the existing dashboard/workspace shell to match the saved reference direction in both light and dark themes.
**Depends on**: Phase 7 foundation from milestone 1
**Requirements**: SHELL-06, THEME-01, SHELL-07
**Success Criteria**:
  1. Dashboard and workspace use the same shell token system and no longer rely on the legacy dense dark styling
  2. Light and dark themes both render with coherent surfaces, text hierarchy, and purple accent usage
  3. Existing graph and export behavior remains intact while the shell is modernized
**Status**: Complete and verified

### Phase 9: Workspace Frame + Panels
**Goal**: Align the workspace composition to the reference by introducing the explicit banded layout and rebuilding the persistent navigation/analysis surfaces.
**Depends on**: Phase 8
**Requirements**: SHELL-08, WS-07, WS-08, WS-09, WS-11, ANALYSIS-01, ANALYSIS-02
**Success Criteria**:
  1. Left rail exposes `Raw Evidence` and `Filters & Layers` as true tabs rather than an undifferentiated sidebar
  2. Filter sections are grouped into entity types, connection layers, and time range
  3. A right-side on-canvas analysis panel exists for selection and AI result states without obscuring the graph
  4. Minimap is visible and reflects current viewport/camera position
  5. Timeline remains a structured bottom surface integrated with the workspace shell

### Phase 10: Graph Visual Language + Search Focus
**Goal**: Update the graph to match the approved entity semantics and focus behavior from the reference direction.
**Depends on**: Phase 9
**Requirements**: SEARCH-01, SEARCH-02, WS-10, GRAPH2D-11, GRAPH-STYLE-01, GRAPH-STYLE-02
**Success Criteria**:
  1. Search behaves as dropdown/typeahead first and only changes graph focus after selection
  2. Selected/search-focused node plus connected network are emphasized while unrelated nodes remain visible but dimmed
  3. Entity types use distinct iconic shapes and approved color semantics
  4. Default graph remains readable with node labels visible and edge labels selective

### Phase 11: 2D / 3D Interaction Parity
**Goal**: Make the two renderers feel like one workspace by aligning behavior and preserving user intent across view switches.
**Depends on**: Phase 10
**Requirements**: INTER-06, INTER-07, INTER-08, GRAPH3D-10
**Success Criteria**:
  1. Selection and focus states behave consistently in both 2D and 3D
  2. Nodes can be dragged in both views
  3. User-adjusted placement intent survives view switches well enough that switching renderers does not feel confusing
  4. 3D styling follows the same semantic model as 2D where technically practical

### Phase 12: AI Command Routing + Workspace Polish
**Goal**: Turn the bottom command surface into a functional investigation orchestrator and finish the remaining shell/workspace polish.
**Depends on**: Phase 11
**Requirements**: SHELL-09, AI-01, AI-02, AI-03
**Success Criteria**:
  1. The AI command surface presents polished quick commands and typed input
  2. Known intents map to predefined graph/workspace actions
  3. AI results can route into the right-side analysis panel
  4. Final shell polish leaves dashboard, workspace, graph, and command surfaces feeling like one product

## Progress

| Phase | Status | Notes |
|-------|--------|-------|
| 8 | Complete | Verified groundwork phase |
| 9 | Next | Ready for discuss/plan |
| 10 | Planned | Depends on Phase 9 |
| 11 | Planned | Depends on Phase 10 |
| 12 | Planned | Depends on Phase 11 |

---
*Last updated: 2026-04-10 during planning repair after Phase 8 verification*
