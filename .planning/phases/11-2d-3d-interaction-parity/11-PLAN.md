# Phase 11 Plan: 2D / 3D Interaction Parity

## Goal

Make the 2D and 3D renderers behave like one workspace by preserving exact node placement across views, carrying selection and focused-neighborhood state through view switches, and aligning gesture semantics as closely as practical without trying to preserve exact camera framing.

## Execution Shape

Phase 11 will execute in three waves:

1. `11-01` shared placement state plus renderer handoff
2. `11-02` interaction parity and gesture alignment
3. `11-03` 3D semantic parity polish and validation

## Locked Decisions

- exact shared placement between `2D` and `3D`
- preserve selected node plus focused neighborhood on view switch
- align gestures as closely as practical
- preserve node/focus state only, not exact camera framing

## Scope

### In Scope

- shared node position map above both renderers
- exact placement carry-over between 2D and 3D
- selection/focus persistence through view switches
- gesture alignment across renderers
- 3D semantic parity where technically practical
- regression coverage for cross-renderer behavior

### Out of Scope

- lasso or multi-select
- undo/redo
- AI command routing
- shell/frame changes already handled in earlier phases

## Dependencies

- Phase 10 complete
- Current graph search/focus behavior must not regress
- Current workspace shell/minimap/timeline structure must remain intact

## Validation Target

Phase 11 is only done when:

- moving a node in one renderer carries to the other renderer
- switching renderers preserves selected node and focused neighborhood
- 2D and 3D gestures feel consistent enough for the user to switch without confusion
- 3D still renders clearly and keeps semantic recognizability
- tests cover the shared placement and interaction seams
