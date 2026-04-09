# Requirements: Detective Case Investigation Platform

**Defined:** 2026-04-10  
**Milestone:** v2.0 Investigation Workspace Revamp  
**Core Value:** A detective must be able to load a case, see all entities and their connections in an interactive graph, and switch between 2D and 3D views without losing context.

---

## Milestone v2.0 Requirements

### Shell and Layout

- [ ] **SHELL-06**: User can navigate a centered, reference-aligned dashboard shell with calm spacing, restrained surfaces, and a shared navigation/action pattern across case list and workspace views
- [ ] **SHELL-07**: User can work inside a reference-aligned investigation workspace with a left utility panel, center graph canvas, right-side analysis panel, persistent timeline, and persistent command surface
- [ ] **SHELL-08**: User can inspect selected-node or AI-result details in a right-side analysis panel that does not obscure the main graph canvas
- [ ] **SHELL-09**: User can access quick command suggestions and a typed command field from a polished command surface integrated into the workspace shell

### Theme System

- [ ] **THEME-01**: User can switch between light and dark themes while preserving graph readability, panel hierarchy, and interaction clarity across dashboard and workspace surfaces

### Search and Focus

- [ ] **SEARCH-01**: User can search evidence and entities through a typeahead dropdown that shows matching results before any graph focus is applied
- [ ] **SEARCH-02**: User can select a search result to focus the chosen node and its connected network while unrelated nodes and edges remain visible but dimmed

### Workspace Structure

- [ ] **WS-07**: User can switch the left-side workspace panel between `Raw Evidence` and `Filters & Layers` modes through explicit tabs
- [ ] **WS-08**: User can filter the graph through structured controls for entity types, connection layers, and time range from the `Filters & Layers` panel
- [ ] **WS-09**: User can use a minimap or magnifier view to understand the current graph viewport or camera position while navigating the canvas
- [ ] **WS-10**: User can keep node labels visible by default while edge labels remain selectively revealed to preserve readability

### Interaction Parity

- [ ] **INTER-06**: User can drag a selected node to a desired position and have that manual placement preserved as shared workspace state across view switches
- [ ] **INTER-07**: User can switch between 2D and 3D graph modes without losing the current selection, focus state, or investigation context
- [ ] **INTER-08**: User can select a node in either renderer and see the same selected-network emphasis behavior in both views

### Graph Visual System

- [ ] **GRAPH2D-11**: User can recognize entity types in the 2D graph through iconic node shapes, reference-aligned colors, and visible node labels
- [ ] **GRAPH3D-10**: User can recognize the same entity types and focus states in the 3D graph through a visually aligned shape/color system adapted from the 2D graph

### AI Command Routing

- [ ] **AI-01**: User can trigger known-intent commands from quick actions or typed input to perform predefined graph and workspace actions
- [ ] **AI-02**: User can see AI command results routed into graph state changes and the right-side analysis panel instead of receiving detached text-only output

---

## Future Requirements

- **AI-03**: User can use freeform AI interpretation beyond known intents for multi-step investigation workflows
- **BACK-01**: User can load and save cases through a live API-backed repository instead of mock-only data
- **COLLAB-01**: User can share a read-only investigation snapshot with another teammate without screen-sharing
- **INTER-09**: User can group-select or lasso-select multiple nodes for bulk investigation actions

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Authentication / user accounts | Small team shared-instance usage remains acceptable for this milestone |
| Freeform LLM agent execution | v2.0 will use known intents and predefined safe triggers first |
| Real-time collaboration | Async review via exports and future sharing remains sufficient for now |
| Backend database migration | Workspace revamp should land before data-source replacement |
| Mobile-first layout | Graph-heavy desktop interactions remain the primary target |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SHELL-06 | Phase 8 | Planned |
| SHELL-07 | Phase 9 | Planned |
| SHELL-08 | Phase 9 | Planned |
| SHELL-09 | Phase 12 | Planned |
| THEME-01 | Phase 8 | Planned |
| SEARCH-01 | Phase 10 | Planned |
| SEARCH-02 | Phase 10 | Planned |
| WS-07 | Phase 9 | Planned |
| WS-08 | Phase 9 | Planned |
| WS-09 | Phase 9 | Planned |
| WS-10 | Phase 10 | Planned |
| INTER-06 | Phase 11 | Planned |
| INTER-07 | Phase 11 | Planned |
| INTER-08 | Phase 11 | Planned |
| GRAPH2D-11 | Phase 10 | Planned |
| GRAPH3D-10 | Phase 10 | Planned |
| AI-01 | Phase 12 | Planned |
| AI-02 | Phase 12 | Planned |

**Coverage:**
- v2.0 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0

---
*Requirements defined: 2026-04-10*
