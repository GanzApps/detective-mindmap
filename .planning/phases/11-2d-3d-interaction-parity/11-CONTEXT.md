# Phase 11 Context: 2D / 3D Interaction Parity

## Phase Goal

Make the two renderers feel like one workspace by aligning selection/focus behavior, enabling node dragging in both views, preserving user-adjusted placement intent across view switches, and bringing 3D visual language up to the Phase 10 semantic standard.

## Prior Decisions Carried Forward

- Selection and focus state already flow through `GraphWorkspace` via `selectedNodeId`, `highlightedNodeIds`, and `focusSelectedNeighborhood` props — the shared plumbing exists.
- Phase 10 locked the semantic shape/color system for 2D (person=avatar/purple, location=pin/green, organization=square/indigo, evidence=card/orange, event=diamond/rose).
- Analysis panel owns node detail display — Phase 11 does not change that routing.
- Search → focus behavior is locked from Phase 10 and must not regress.
- `focusSelectedNeighborhood` applies the "dim, don't hide" rule — non-connected nodes stay visible but dimmed.

## Locked Phase 11 Decisions

### 3D Node Dragging (INTER-07)

- **Interaction model:** Click-select first, then drag the selected node to move it. Dragging empty space (or unselected nodes) continues to rotate/pan the camera as before.
- **Movement plane:** Node moves parallel to the screen plane (not projected to a ground plane). Cleanest to implement in the custom canvas renderer; feels natural.
- **No modifier key required.** The select-first model provides the needed disambiguation.

### Placement Persistence (INTER-08)

- **2D:** After a drag completes, `fx`/`fy` are **kept** (not cleared). The node stays pinned at its new position for the session. Positions reset on graph data reload or page reload.
- **Cross-renderer carry-over:** A shared node position map is stored at the `GraphWorkspace` level. When switching from 2D → 3D, the stored x/y positions map to x/z in 3D space (best-effort, not pixel-perfect). Prevents jarring positional resets on view switch.

### Selection and Focus Parity (INTER-06)

- `selectedNodeId` and `highlightedNodeIds` must survive renderer switches without reset. Confirm no state clear happens in `GraphWorkspace` on `viewMode` change.
- **Focus state survives view switch.** If a node is focused in 2D and the user switches to 3D, the same node remains selected and its neighborhood remains highlighted.
- **3D dimming** follows Phase 10 intent: dim unrelated nodes, don't hide them. Exact opacity values may differ from 2D — 3D can interpret the rule with renderer-appropriate values.

### 3D Semantic Styling (GRAPH3D-10)

- **Shapes:** 3D adopts defined shapes matching the Phase 10 categories. Each entity type gets a distinct, consistently rendered shape in the 3D canvas. Not approximations — shapes are defined and match the 2D semantic model.
  - `person`: round/avatar-like
  - `location`: pin/marker-like (pointed bottom)
  - `organization`: square/rectangular block
  - `evidence` / transaction: card/document-like (rect with slight rounding)
  - `event`: diamond/pointed
- **Colors:** 3D adopts the Phase 10 semantic color palette (purple, green, indigo, orange, rose families per entity type).

### 2D Icon Asset Rendering

- Phase 11 introduces real SVG/image icon assets for each entity type in the 2D renderer.
- The 2D node renderer checks for an icon asset per entity type and renders it inside the node shape.
- Icons replace or augment the current canvas-drawn shapes — the Phase 10 shape/color system stays as the fallback if an icon is not available.
- Asset loading and the icon-per-entity-type mapping are in scope for this phase.

## Scope Boundaries

### In Scope

- 3D node-level drag (click-select → drag to move, screen-plane movement)
- 2D `fx`/`fy` persistence after drag-end
- Shared node position map in `GraphWorkspace` for 2D↔3D carry-over
- Focus/selection state surviving renderer switches without reset
- 3D semantic shape rendering (defined per entity type)
- 3D semantic color alignment to Phase 10 palette
- 2D icon asset loading and rendering per entity type

### Out of Scope

- Lasso/multi-select/grouped move (INTER-09, deferred)
- Undo/redo (INTER-10, deferred)
- AI command routing (Phase 12)
- Analysis panel routing changes

## Reuse Targets

- `src/components/graph/GraphWorkspace.tsx` — owns viewMode, selectedNodeId, shared position map will live here
- `src/components/graph/ForceGraph2D.tsx` — add fx/fy persistence, icon asset rendering
- `src/components/graph/MindMap3D.tsx` — add node-drag logic, semantic shapes, carry-over position consumption
- `src/lib/graph/renderer3d.ts` — update shape drawing per entity type
- `src/lib/graph/graphTypes.ts` — entity type definitions (shared color/shape constants)
- `src/lib/graph/hitTest3d.ts` — may need update to support drag-target detection on selected node

## Research Focus

Research and planning should answer:

1. How to detect the selected node as the drag target in the 3D canvas renderer (currently drag always maps to camera — needs a hit-test check before deciding rotate vs move)
2. How to implement screen-plane movement: converting mouse delta to world-space node position offset in the 3D projection system
3. How to render defined entity shapes cleanly in the 3D canvas (`renderer3d.ts`) without breaking the projection loop or label positioning
4. How to source/load SVG/image icon assets per entity type in the 2D canvas renderer (`ForceGraph2D.tsx`)
5. Where and how to store the shared node position map in `GraphWorkspace` and how to map 2D `{x, y}` → 3D `{x, z}` on view switch

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone Source of Truth
- `.planning/PROJECT.md` — milestone definition, interaction model non-negotiables
- `.planning/REQUIREMENTS.md` — Phase 11 requirements: `INTER-06`, `INTER-07`, `INTER-08`, `GRAPH3D-10`
- `.planning/ROADMAP.md` — Phase 11 goal, dependency order, success criteria
- `.planning/STATE.md` — execution truth after Phase 10 delivery

### Prior Phase Context
- `.planning/phases/10-graph-visual-language-search-focus/10-CONTEXT.md` — locked shape/color/focus decisions that Phase 11 must extend to 3D
- `.planning/phases/09-workspace-frame-panels/09-CONTEXT.md` — workspace shell structure that Phase 11 builds on top of

### Reference Notes
- `.planning/notes/graph-ui-interaction-alignment.md` — interaction expectations for both renderers
- `.planning/notes/investigation-workspace-revamp-model.md` — workspace model, selection/focus behavior intent

### Reference Assets
- `.planning/references/mac-ui-reference/graph-view-selected-filters.png` — graph workspace with focus/dim state visible

---
*Phase: 11-2d-3d-interaction-parity*
*Context gathered: 2026-04-13*
