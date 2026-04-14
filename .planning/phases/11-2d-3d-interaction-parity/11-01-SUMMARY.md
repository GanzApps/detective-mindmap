---
phase: 11-2d-3d-interaction-parity
plan: 01
subsystem: graph
tags: [shared-placement, renderer-handoff, continuity]

provides:
  - Shared node placement state owned by `GraphWorkspace`
  - Exact placement carry-over between 2D and 3D
  - Renderer plumbing for emitting and consuming shared node positions

key-files:
  modified:
    - src/components/graph/GraphWorkspace.tsx
    - src/components/graph/ForceGraph2D.tsx
    - src/components/graph/MindMap3D.tsx
    - src/lib/graph/projection3d.ts

completed: 2026-04-13
---

# Phase 11 Plan 01 Summary

Shared placement is now owned by `GraphWorkspace` instead of living separately inside each renderer. Both the 2D and 3D graph consume the same position map, so moving a node in one view carries over into the other view.

Highlights:
- Added a shared node position map in `GraphWorkspace`.
- Wired both renderers to read from and emit updates into that shared map.
- Updated the 3D layout builder to accept shared placement overrides for exact cross-view carry-over.
