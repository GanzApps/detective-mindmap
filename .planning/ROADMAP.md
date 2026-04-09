# Roadmap: Detective Case Investigation Platform

## Overview

Milestone `v2.0` focuses on an investigation workspace revamp rather than a net-new product surface. The work starts by establishing a shared design-token and layout foundation so the dashboard and workspace align with the saved references in light and dark themes. Once the shell is stable, the workspace frame is rebuilt around a left tabbed utility panel, a right on-canvas analysis panel, and a persistent minimap/timeline/command structure. The graph then receives a new visual language and search-to-focus flow, followed by true 2D/3D interaction parity so both renderers behave like alternate views into the same investigation state. The milestone finishes with known-intent AI command routing and final integration polish across the shell and graph.

## Phases

**Phase Numbering:**
- Integer phases continue milestone work in sequence
- Existing milestone `v1.0` completed at Phase `7`
- Milestone `v2.0` continues from Phase `8`

- [ ] **Phase 8: Design Tokens + Shell Alignment** - shared layout system, calm shell framing, and light/dark theme foundation
- [ ] **Phase 9: Workspace Frame + Panels** - left tabbed utility panel, right analysis panel, minimap, and persistent workspace bands
- [ ] **Phase 10: Graph Visual Language + Search Focus** - iconic node system, calmer color palette, default information density, and typeahead-first focus flow
- [ ] **Phase 11: 2D / 3D Interaction Parity** - shared selection, focus, and manual placement behavior across both renderers
- [ ] **Phase 12: AI Command Routing + Workspace Polish** - known-intent command triggers, result routing, and final workspace integration polish

## Phase Details

### Phase 8: Design Tokens + Shell Alignment
**Goal**: Dashboard and workspace surfaces share a centered, reference-aligned shell and a consistent light/dark design token system.
**Depends on**: Completed Phase 7
**Requirements**: SHELL-06, THEME-01
**Success Criteria** (what must be TRUE):
  1. Dashboard and workspace screens use the same restrained container, spacing rhythm, and action/header language
  2. Light and dark themes can be toggled without breaking graph readability or panel hierarchy
  3. Core shell components draw from shared tokens instead of one-off styling
**Plans**: 3 plans
**Research needed**: No
**UI hint**: yes

Plans:
- [ ] 08-01-PLAN.md - Define shared color, spacing, radius, elevation, and typography tokens for light and dark themes
- [ ] 08-02-PLAN.md - Refactor dashboard and workspace shell containers, top navigation, and action areas to match the reference framing
- [ ] 08-03-PLAN.md - Apply theme-aware shell styling and verify consistency across case list and workspace entry points

### Phase 9: Workspace Frame + Panels
**Goal**: The workspace is reorganized into a left tabbed utility panel, center graph canvas, right-side analysis panel, minimap, persistent timeline, and integrated command surface.
**Depends on**: Phase 8
**Requirements**: SHELL-07, SHELL-08, WS-07, WS-08, WS-09
**Success Criteria** (what must be TRUE):
  1. The left panel cleanly switches between `Raw Evidence` and `Filters & Layers` modes
  2. Filters and layers are organized into entity types, connection layers, and time range controls
  3. The right-side analysis panel appears without obscuring the graph and can represent selected-state or AI-result content
  4. A minimap or magnifier indicates the current graph viewport/camera position
  5. Timeline and command surfaces remain persistent within the workspace frame
**Plans**: 4 plans
**Research needed**: No
**UI hint**: yes

Plans:
- [ ] 09-01-PLAN.md - Rebuild the left workspace rail with tab state, search placement, and the `Raw Evidence` / `Filters & Layers` split
- [ ] 09-02-PLAN.md - Implement structured entity, layer, and time-range controls in the filter panel
- [ ] 09-03-PLAN.md - Replace the existing floating detail surface with a right-side on-canvas analysis panel
- [ ] 09-04-PLAN.md - Add a minimap and integrate persistent timeline/command bands into the new frame

### Phase 10: Graph Visual Language + Search Focus
**Goal**: The graph adopts an iconic entity-type visual system and a typeahead-first search flow that focuses a selected network while preserving overall context.
**Depends on**: Phase 9
**Requirements**: SEARCH-01, SEARCH-02, WS-10, GRAPH2D-11, GRAPH3D-10
**Success Criteria** (what must be TRUE):
  1. Entity types are recognizable through shape and color in both 2D and 3D
  2. Node labels are visible by default while edge labels remain selectively revealed to avoid overload
  3. Typing in search shows dropdown results before any graph state changes
  4. Choosing a result emphasizes the selected node and its connected network while unrelated nodes remain visible but dimmed
**Plans**: 4 plans
**Research needed**: No
**UI hint**: yes

Plans:
- [ ] 10-01-PLAN.md - Define the entity-type shape and color language and apply it to the 2D renderer
- [ ] 10-02-PLAN.md - Adapt the same visual language to the 3D renderer without losing legibility
- [ ] 10-03-PLAN.md - Rework search into a typeahead-first selector and introduce selected-network focus behavior
- [ ] 10-04-PLAN.md - Tune default information density, label visibility, and selected/dimmed states for readability

### Phase 11: 2D / 3D Interaction Parity
**Goal**: 2D and 3D views behave like alternate perspectives of the same investigation state, with aligned selection, focus, and manual placement behavior.
**Depends on**: Phase 10
**Requirements**: INTER-06, INTER-07, INTER-08
**Success Criteria** (what must be TRUE):
  1. Selection and focus behavior match across 2D and 3D
  2. Switching views preserves the user’s active context instead of feeling like a reset into a different tool
  3. Manual node repositioning is respected as shared workspace state across renderer switches
**Plans**: 3 plans
**Research needed**: No
**UI hint**: yes

Plans:
- [ ] 11-01-PLAN.md - Introduce shared workspace state for selected-network focus and renderer-independent interaction parity
- [ ] 11-02-PLAN.md - Implement shared manual placement behavior for draggable nodes across view switches
- [ ] 11-03-PLAN.md - Verify parity details for selection, dimming, search focus, and view switching across both renderers

### Phase 12: AI Command Routing + Workspace Polish
**Goal**: The AI command surface becomes a known-intent orchestration layer that triggers predefined graph/workspace functions and routes meaningful results into the analysis panel.
**Depends on**: Phase 11
**Requirements**: SHELL-09, AI-01, AI-02
**Success Criteria** (what must be TRUE):
  1. The command surface presents quick command chips and typed input in a polished shell-integrated UI
  2. Supported known intents map to predefined graph/workspace actions instead of detached text-only output
  3. AI-triggered results can update graph state and populate the right-side analysis panel
  4. Final workspace polish aligns command behavior, panel updates, and shell presentation with the saved references
**Plans**: 4 plans
**Research needed**: No
**UI hint**: yes

Plans:
- [ ] 12-01-PLAN.md - Rebuild the command surface with quick intent chips and polished input/action states
- [ ] 12-02-PLAN.md - Implement the known-intent routing layer for safe predefined graph/workspace triggers
- [ ] 12-03-PLAN.md - Route command outcomes into graph state changes and the right-side analysis panel
- [ ] 12-04-PLAN.md - Run end-to-end workspace polish and verification for the revamp milestone

## Progress

**Execution Order:**
Phases execute in numeric order: 8 -> 9 -> 10 -> 11 -> 12

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 8. Design Tokens + Shell Alignment | 0/3 | Planned | - |
| 9. Workspace Frame + Panels | 0/4 | Planned | - |
| 10. Graph Visual Language + Search Focus | 0/4 | Planned | - |
| 11. 2D / 3D Interaction Parity | 0/3 | Planned | - |
| 12. AI Command Routing + Workspace Polish | 0/4 | Planned | - |
