# Phase 11 Research

## Objective

Determine the safest implementation path for exact shared placement and interaction parity without destabilizing the existing graph renderers.

## Findings

### Shared placement should be owned by `GraphWorkspace`

- `GraphWorkspace` already owns shared renderer state such as `viewMode`, `selectedNodeId`, `highlightedNodeIds`, search query, committed search selection, and minimap state.
- This is the correct place for a shared node position map because it is the first layer above both renderers.
- Renderer-specific local state should consume and emit placement updates rather than owning cross-view truth.

### 2D already exposes the right integration point

- `ForceGraph2D` uses simulation node data with `x`, `y`, `fx`, and `fy`.
- Exact placement persistence can be achieved by applying stored positions into simulation nodes and keeping `fx`/`fy` pinned after drag.
- This is compatible with the user expectation that dragged nodes stay where they were placed.

### 3D parity should prefer state handoff over camera handoff

- The user explicitly chose not to preserve camera/framing continuity.
- That means we can safely reframe the 3D scene when switching views as long as node placement and focused state are preserved.
- This reduces complexity and avoids coupling the 2D viewport model to the 3D camera model.

### Gesture parity should align intent, not force identical mechanics

- The user chose “align as closely as practical,” not “make both views mechanically identical.”
- That means the interaction contract should preserve intent:
  - click/tap selects
  - dragging a node moves a node
  - dragging empty space navigates the canvas/camera
  - scroll zooms within the active graph
- The exact rotate/pan split in 3D can remain renderer-appropriate.

### 3D semantic parity is a support goal, not a new visual redesign

- Phase 10 already locked semantic colors and visual language.
- Phase 11 should improve consistency in 3D where needed, but the primary risk area is interaction continuity, not inventing a second redesign.
- Planning should treat 3D semantic updates as parity polish after shared placement and gesture work.

## Planning Implications

1. Wave 1 should establish shared placement state and renderer consumption/emission.
2. Wave 2 should lock interaction parity and renderer-switch continuity.
3. Wave 3 should finish semantic parity polish, regression coverage, and end-to-end validation.
