# Phase 11 Context: 2D / 3D Interaction Parity

## Phase Goal

Make the two renderers feel like one workspace by aligning selection/focus behavior, preserving exact node placement across view switches, and keeping gesture intent consistent enough that switching views does not feel like changing tools.

## Prior Decisions Carried Forward

- Analysis panel owns node detail display; Phase 11 does not change that routing.
- Search to focus behavior is locked from Phase 10 and must not regress.
- `focusSelectedNeighborhood` applies the "dim, don't hide" rule in both renderers.
- Phase 10 established the semantic shape/color system that 3D must continue to honor where technically practical.

## Locked Phase 11 Decisions

### Placement Persistence (INTER-08)

- **Decision:** exact shared placement between `2D` and `3D`
- Manual node placement is one shared workspace state. Switching renderers should preserve the same node arrangement rather than merely preserving placement intent.
- Shared node positions should live above the renderers so both views consume the same source of truth.

### Selection and Focus Parity (INTER-06)

- **Decision:** preserve both the selected node and the focused neighborhood on view switch
- `selectedNodeId`, `highlightedNodeIds`, and focused-neighborhood emphasis must survive renderer switches without reset.
- The Phase 10 dimmed-neighborhood rule remains active in both renderers.

### Gesture Parity (INTER-07)

- **Decision:** align gestures as closely as practical across both views
- The two views may still have renderer-specific camera behavior, but selection, drag intent, and panning/inspection should feel consistent rather than unrelated.
- Node manipulation should not require users to relearn controls when switching views.

### Camera / Framing Continuity

- **Decision:** preserve node/focus state only, not camera/framing continuity
- Renderer switches do not need to preserve exact viewport or camera framing.
- Each renderer may choose a sensible default framing on switch as long as the selected node and focused neighborhood remain intact.

### 3D Semantic Styling (GRAPH3D-10)

- 3D continues to follow the Phase 10 semantic shape and color model where technically practical.
- Any renderer-specific adaptation must preserve recognizability by entity type and keep parity with the approved 2D semantics.

## Scope Boundaries

### In Scope

- exact shared node placement across `2D` and `3D`
- focus/selection state surviving renderer switches without reset
- gesture alignment between renderers as closely as practical
- 3D semantic shape rendering aligned to Phase 10 semantics
- 3D semantic color alignment to the Phase 10 palette
- renderer handoff that preserves node/focus state but not exact camera framing

### Out of Scope

- lasso/multi-select/grouped move
- undo/redo
- AI command routing
- analysis panel routing changes

## Reuse Targets

- `src/components/graph/GraphWorkspace.tsx` - owns `viewMode`, `selectedNodeId`, and the shared node position map
- `src/components/graph/ForceGraph2D.tsx` - align drag semantics and consume/store shared positions
- `src/components/graph/MindMap3D.tsx` - align gesture model, selection parity, and shared position consumption
- `src/lib/graph/renderer3d.ts` - update 3D semantic shape drawing as needed
- `src/lib/graph/graphTypes.ts` - entity type definitions and shared semantic constants
- `src/lib/graph/hitTest3d.ts` - supports 3D selection and drag-target detection

## Research Focus

Research and planning should answer:

1. How to implement exact shared node placement across `2D` and `3D` without destabilizing either renderer
2. How to align gesture semantics between renderers while preserving practical camera controls
3. How to keep selection plus focused-neighborhood parity intact through renderer switches
4. How to render 3D semantic shapes cleanly in `renderer3d.ts` without breaking readability
5. How to hand off between renderers without preserving camera framing, while still making switches feel coherent

## Canonical References

Downstream agents must read these before planning or implementing.

### Milestone Source of Truth

- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`

### Prior Phase Context

- `.planning/phases/10-graph-visual-language-search-focus/10-CONTEXT.md`
- `.planning/phases/09-workspace-frame-panels/09-CONTEXT.md`

### Reference Notes

- `.planning/notes/graph-ui-interaction-alignment.md`
- `.planning/notes/investigation-workspace-revamp-model.md`

### Reference Assets

- `.planning/references/mac-ui-reference/graph-view-selected-filters.png`

---
Phase: `11-2d-3d-interaction-parity`  
Context gathered: `2026-04-13`
