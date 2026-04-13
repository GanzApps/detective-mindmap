# Phase 10 Context: Graph Visual Language + Search Focus

## Phase Goal

Bring the graph itself up to the reference-driven revamp standard by aligning visual language, search flow, and focused-network behavior without regressing the Phase 9 workspace shell.

## Prior Decisions Carried Forward

- The workspace shell, rails, minimap, analysis panel, timeline dock, and command surface from Phase 9 are now the stable frame.
- Search must be typeahead-first and should not change graph focus while the user is still typing.
- Once a result is selected, the graph should emphasize the chosen node and its connected network while unrelated nodes remain visible but dimmed.
- Node labels should be visible by default.
- Edge labels should be selective to preserve readability.
- Primary detail display belongs in the right-side analysis panel, not as a permanent floating graph overlay.
- The visual direction follows the saved MAC references:
  - calm shell framing
  - graph remains the hero surface
  - entity semantics should be readable through both shape and color

## Locked Phase 10 Decisions

### Search Flow

- Search remains a typeahead control first.
- While typing, only the dropdown suggestion list updates.
- Selecting a result applies focus mode.
- Focus mode highlights:
  - the selected node
  - its connected network
- Non-connected nodes and edges stay present but dimmed rather than hidden.

### Information Density

- Node labels are visible by default in the resting state.
- Edge labels are not universally shown.
- Edge labels should appear when they are most useful:
  - on the focused network
  - on selected/important paths
  - or when zoom level makes them readable

### Entity Shape Language

- `person`: rounded avatar-like node
- `location`: pin / marker-style node
- `organization`: square / structured block node
- `evidence` or transaction: document/card-like node
- `event`: diamond / signal-style node

### Entity Color Language

Phase 10 should align to the approved reference-style semantics:

- `person`: purple family
- `location`: green family
- `evidence` / transaction: orange family
- `vehicle`: cyan / sky family
- `digital`: blue family
- `organization`: indigo or structured neutral-accent family
- `event`: rose / coral family

These semantic colors are separate from shell tokens and should not be collapsed into the Phase 8 accent system.

## Scope Boundaries

### In Scope

- 2D graph visual styling updates
- Search dropdown-to-focus behavior
- Dimmed network focus behavior
- Default label strategy
- Semantic shape/color system
- Readability improvements for graph labels and chips

### Out of Scope

- Final 2D/3D drag/placement continuity logic
- Cross-renderer persistence guarantees
- AI command execution
- Deep analysis panel routing changes

Those belong to Phases 11 and 12.

## Reuse Targets

- `src/components/graph/ForceGraph2D.tsx`
- `src/components/graph/MindMap3D.tsx`
- `src/components/graph/GraphWorkspace.tsx`
- `src/components/graph/NodeDetailPanel.tsx`
- `src/lib/graph/forceSimulation.ts`
- `src/lib/graph/renderer3d.ts`
- Phase 9 minimap and shell integration should stay intact

## Research Focus

Research and planning should answer:

1. How to implement iconic node shapes cleanly in the 2D renderer while keeping hit testing and labels stable
2. How to stage the search UX so dropdown suggestions and focus application remain clearly separated
3. How to dim unrelated network elements without making the graph unreadable
4. How far 3D should visually follow the same semantic styling now versus what should wait for Phase 11

---
*Created automatically by `$gsd-next` on 2026-04-13 by routing to Phase 10 discuss with carried-forward defaults from the saved revamp notes.*
