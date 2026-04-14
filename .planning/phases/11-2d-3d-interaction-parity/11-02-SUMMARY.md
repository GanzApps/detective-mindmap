---
phase: 11-2d-3d-interaction-parity
plan: 02
subsystem: graph
tags: [interaction, parity, drag, selection]

provides:
  - 2D pinned node positions after drag
  - 3D selected-node drag path using shared placement updates
  - Closer gesture parity across renderers

key-files:
  modified:
    - src/components/graph/ForceGraph2D.tsx
    - src/components/graph/MindMap3D.tsx
    - src/lib/graph/hitTest3d.ts

completed: 2026-04-13
---

# Phase 11 Plan 02 Summary

The interaction model is now much closer across 2D and 3D. Nodes can be moved in both views, empty-space navigation remains distinct from node manipulation, and selection/focus state continues through renderer switches.

Highlights:
- Kept 2D dragged nodes pinned by preserving `fx`/`fy` and writing their final positions into shared placement state.
- Added a 3D selected-node drag path that updates shared placement without hijacking camera controls.
- Preserved the existing camera model while aligning selection and drag intent across renderers.
